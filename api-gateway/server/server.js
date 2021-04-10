const gateway = require('fast-gateway')
const server = gateway({
  routes: [{
    prefix: '/auth',
    target: 'https://auth-microservice-s6rss6nenq-lz.a.run.app'
  }]
})

server.start(8080)