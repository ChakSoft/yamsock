const uuid = require('uuid/v4')
const jsonschema = require('jsonschema')

const validator = new jsonschema.Validator()

const parseMessage = (schema, message) => {
  if (typeof message !== 'string') {
    throw new Error('incoming message must be a string')
  }
  const obj = JSON.parse(message)

  const {
    argProperty,
    discriminant,
  } = schema.schema
  const allSchemas = schema.schema[`${discriminant}s`]

  if (!obj[discriminant]) {
    throw new Error('missing discriminant field in message')
  }

  const result = validator.validate(obj[argProperty], allSchemas[obj[discriminant]])
  if (!result.valid) {
    throw new Error(`invalid message: ${result.errors}`)
  }

  return {
    discriminant,
    argProperty,
    obj,
  }
}

module.exports = ({
  socket,
  serverInstance,
  serverSchema,
  handlers,
}) => {
  const client = {
    id : uuid(),
    socket,
    serverInstance,
    json (obj) {
      const strMessage = JSON.stringify(obj)
      this.socket.send(strMessage)
    },
    enrichProperty (name, value) {
      Object.defineProperty(this, name, {
        configurable : true,
        enumerable : true,
        writable : false,
        value,
      })
    },
    close () {
      this.socket.close()
    },
    onMessage (message) {
      const {
        discriminant,
        argProperty,
        obj,
      } = parseMessage(serverSchema, message)
      const handler = handlers[obj[discriminant]]
      if (!handler) {
        throw new Error(`cannot find suitable handler for ${discriminant} ${obj[discriminant]}`)
      }
      handler(
        this,
        serverInstance,
        obj[argProperty],
      )
    },
    onError (error) {
      if (handlers.error) {
        handlers.error(
          this,
          serverInstance,
          error,
        )
      }
    },
    onClose (code, reason) {
      serverInstance.removeClient(this)
      if (handlers.close) {
        handlers.close(
          this,
          serverInstance,
          code,
          reason,
        )
      }
    },
    init () {
      this.socket
        .on('message', this.onMessage.bind(this))
        .on('error', this.onError.bind(this))
        .on('close', this.onClose.bind(this))

      return this
    },
  }
  return client.init()
}
