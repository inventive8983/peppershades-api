const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', function (socket) {
    socket.on('join', function (data) {    
     socket.join(data.id);
     console.log("Joined: "+ data.id);
     
   });
 });

server.listen(port, function() {
    console.log('App listening on port 4000');
})

