var blockArray = []
var interface
var isStarted = false
var clients = []
var turn

function Interface(blocksInArow) {
    this.blocksInArow = blocksInArow
    this.clientsCounter = 0
}

function Block( x, y ){
	this.x = x
	this.y = y
  this.active = true
  this.sign = '' //'O' sign when true

	this.switchActivity = function(){
		this.active = !this.active
	}
}

function BlockArray(){
	this.createBlocksArray = function() {
		var arr = new Array()
		for( i = 0; i < interface.blocksInArow; i++ )
			for( j = 0; j < interface.blocksInArow; j++ )
				arr.push( new Block( j, i ) )
		return arr
	}

	this.blocks = this.createBlocksArray()
}

function Client( id, sign, socket ) {
  this.id = id
  this.socket = socket
  this.sign = sign
  this.points = 0
}

function ClientsArray() {

  this.createClientsArray = function(){
    var arr = new Array()
    return arr
  }

  this.addClient = function( id, sign, socket ) {
    this.clients.push( new Client( id, sign, socket ) )
  }

  this.printList = function() {
    console.log()
    for(var i = 0; i < this.clients.length; i++) {
      console.log("   " +i+ " " +this.clients[i].id +"   " +this.clients[i].sign)
    }
  }

  this.removeClient = function( id ) {
    var index
    for( var i = 0; i < this.clients.length; i++ ) {
      if(this.clients[i].id === id)
        this.clients.splice( i, 1 )
        index = i
    }
    return index
  }

  this.indexOf = function( id ) {
    var index
    for( var i = 0; i < this.clients.length; i++ ) {
      if(this.clients[i].id === id)
        index = i
    }
    return index
  }

  this.clients = this.createClientsArray()
}


var express = require('express')

var app = express()

var server = app.listen(process.env.PORT || 3000, '0.0.0.0', listen)

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://' + host + ':' + port);
}

app.use(express.static('public'))

io = require('socket.io')(server)


setInterval(heartbeat, 120);


interface = new Interface( 3 )
blocksArray = new BlockArray()
clients = new ClientsArray()
clients.createClientsArray()

function heartbeat() {
  io.sockets.emit('blocksBeat', blocksArray);
  io.sockets.emit('interfaceBeat', interface)
  io.sockets.emit('turnBeat', turn)
}

io.sockets.on('connection', function(socket) {
    console.log("\nNew client: " + socket.id );

    socket.on('start', function(data) {

      if( interface.clientsCounter === 0 ) var sign = 'x'
      else if( interface.clientsCounter === 1
        && clients.clients[0].sign === 'x') var sign = 'o'
        else if( interface.clientsCounter === 1
          && clients.clients[0].sign === 'o') var sign = 'x'
      else if(interface.clientsCounter >= 2 ) var sign = 'spec'
      clients.addClient( socket.id, sign, socket )

      interface.clientsCounter++

      data = {
        sign: sign,
        id: socket.id,
        blocksInArow: interface.blocksInArow,
        clientsAmount: interface.clientsCounter
      }
      clients.printList()
      socket.emit( 'serverCallback', data )
    })

    socket.on('click', function(data) { //data: index
      if(data.sign != 'spec') {
        var selectedBlock = blocksArray.blocks[data.index]
        if( selectedBlock.active )
            selectedBlock.switchActivity()
        if( data.sign === 'x' ) {
          selectedBlock.sign = 'x'
          turn = 'o'
        }
          else if(data.sign === 'o') {
            selectedBlock.sign = 'o'
            turn = 'x'
          }
      }
    })

    socket.on('size', function(data) { //data: width, blocksinarow
        interface.blocksInArow = data.blocksInArow
        blocksArray = new BlockArray()
        console.log("\nBlocks in a row: " +interface.blocksInArow)
    })

    socket.on('reset', function() {
        for(var i = 0; i < blocksArray.blocks.length; i++) {
          blocksArray.blocks[i].active = true
          blocksArray.blocks[i].sign = ''
        }
    })

    socket.on('disconnect', function() {
      console.log("\nClient " +socket.id+ " has disconnected");
      var index = clients.indexOf(socket.id)
      if(interface.clientsCounter > 2 && clients.clients[index].sign === 'x') {
        clients.clients[2].sign = 'x'
        clients.clients[2].socket.emit('sign', 'x')
      }
      else if(interface.clientsCounter > 2 && clients.clients[index].sign === 'o') {
        clients.clients[2].sign = 'o'
        clients.clients[2].socket.emit('sign', 'o')
      }

      clients.removeClient( socket.id )
      interface.clientsCounter--
      clients.printList()
    })

})
