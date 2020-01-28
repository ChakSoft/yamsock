const uuid = require('uuid/v4')
const jsonschema = require('jsonschema')

const validator = new jsonschema.Validator()

const parseMessage = (schema, message) => {
  if (typeof message !== 'string') {
    throw new Error('incoming message must be a string')
  }
  const obj = JSON.parse(message)

  const discriminator = schema.schema.discriminant
  const allSchemas = schema[`${discriminator}s`]

  if (!obj[discriminator]) {
    throw new Error('missing discriminator field in message')
  }

  const result = validator.validate(obj, allSchemas[obj[discriminator]])
  if (!result.valid) {
    throw new Error(`invalid message: ${result.errors}`)
  }

  return {
    discriminator,
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
    onMessage (message) {
      const {
        discriminator,
        obj,
      } = parseMessage(serverSchema, message)
      const handler = handlers[obj[discriminator]]
      if (!handler) {
        throw new Error(`cannot find suitable handler for ${discriminator} ${obj[discriminator]}`)
      }
      handler(
        socket,
        serverInstance,
        obj,
      )
    },
    onError (error) {
      handlers.error(
        socket,
        serverInstance,
        error,
      )
    },
    onClose (code, reason) {
      serverInstance.removeClient(this)
      handlers.close(
        socket,
        serverInstance,
        code,
        reason,
      )
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
