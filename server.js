var express = require('express')
var app = express()

var server = app.listen(3000, '0.0.0.0', function() {
    console.log('Listening to port:  ' + 3000);
});

app.use(express.static('public'))

var socket = require('socket.io')

var io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection(socket) {
    console.log("Connection id: " +socket.id)
    
    socket.on('mouse', mouseMsg)
    socket.on('size', sizeMsg)
    socket.on('reset', resetMsg)
    
    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data)   
    }
    
    function sizeMsg(data) {
        socket.broadcast.emit('size', data)
    }
    
    function resetMsg(data) {
        socket.broadcast.emit('reset', data)
    }
                    
}



console.log("Server is running")
