let clients = 0

const connect = (socket) => {
  clients = clients + 1
  console.log('socket connected! clients = ', clients)
  socket.on('chat message', (message) => {
    socket.broadcast.emit('message', message)
  })
}

module.exports = {
  connect,
}
