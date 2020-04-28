const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const projectio = require('./api/io/projectio')
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);
const myIo = io.of('/api')

myIo.on('connection', function (socket) {
  console.log('Connected')
    socket.on('join-room', (data) => {
      socket.join(data.id);
      socket.to(data.id).emit('online', {
        message: data.userType + ' is online.'
      })
    })
   projectio(socket, myIo)
 });

server.listen(port, function() {
    console.log('App listening on port 4000');
})

