const fs = require('fs')
const path = require('path')
const ws = require('ws')
const yaml = require('js-yaml')

const createClient = require('./client')

/**
 * Creates a new websocket server
 *
 * @param {any} [options.serverOptions] Options object (same as the one for ws.Server constructor)
 * @param {any} [options.schemaOptions] Schema object properties
 * @return {any} Server instance object
 */
module.exports = (options) => {
  const serverInstance = {
    clients : [],
    broadcast (obj, exclude = []) {
      for (const client of this.clients) {
        if (!exclude.includes(client.id)) {
          client.json(obj)
        }
      }
    },
    addClient (client) {
      this.clients.push(client)
    },
    removeClient (client) {
      const index = this.clients.indexOf(client)
      if (index !== -1) {
        this.clients.splice(index, 1)
      }
    },
    clean () {
      this.clients = []
    },
  }
  const {
    serverOptions = {},
    schemaOptions = {},
    handlers,
    onConnection = null,
  } = options

  const serverSchema = yaml.safeLoad(fs.readFileSync(schemaOptions.path || path.join(process.cwd(), 'schema.yml')))

  const server = new ws.Server(serverOptions)
  server
    .on('connection', (socket) => {
      const client = createClient({
        socket,
        serverInstance,
        serverSchema,
        handlers,
      })
      if (typeof onConnection === 'function') {
        onConnection(client)
      }
      serverInstance.addClient(client)
    })
    .on('close', () => {
      serverInstance.clean()
    })
}
