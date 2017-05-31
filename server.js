var blocksArray = []
var interface
var isStarted = false
var clientsArray = []
var turn
var lastSign = 'x'
var isClasic=true;

function Interface(blocksInArow) {
    this.blocksInArow = blocksInArow
    this.clientsCounter = 0
    this.actions = 0
    this.win = {
      isWin: false,
      first: null,
      last: null
    }
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

function checkNeighbour(sign, i, j, size, first, last){
    size--;
		var firstconteiner=first;
		var lastconteiner=last;
        var truewidth=0;
            for(k=i;;)
            {
                k--;
                if (k>=0&&blocksArray.blocks[k*(interface.blocksInArow)+j].active==false&&blocksArray.blocks[k*(interface.blocksInArow)+j].sign==sign)
                {
                    truewidth++;
                    first=blocksArray.blocks[k*(interface.blocksInArow)+j]
                }
                else break;
                if(i-k>=size)
                    break;
                if (truewidth==size)
                    break;
            }

            for(k=i;;)
            {
                k++;
                if (k<(interface.blocksInArow)&&blocksArray.blocks[k*(interface.blocksInArow)+j].active==false&&blocksArray.blocks[k*(interface.blocksInArow)+j].sign==sign)
                {
                    truewidth++;
                    last=blocksArray.blocks[k*(interface.blocksInArow)+j];
                }
                else break;
                if(k-i>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            if (truewidth==size)
                return true;
            truewidth=0;
			first=firstconteiner;
			last=lastconteiner;
            for(k=j;;)
            {
                k--;

                if (k>=0&&blocksArray.blocks[i*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[i*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    first=blocksArray.blocks[i*(interface.blocksInArow)+k]
                }
                else break;
                if(j-k>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            for(k=j;;)
            {
                k++;
                if (k<(interface.blocksInArow-1)&&blocksArray.blocks[i*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[i*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    last=blocksArray.blocks[i*(interface.blocksInArow)+k]
                }
                else break;
                if(k-j>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            if (truewidth==size)
                return true;

            truewidth=0;
			first=firstconteiner;
			last=lastconteiner;
            for(k=j,h=i;;)
            {
                k--;
                h--;
                if (k>=0&&h>=0&&blocksArray.blocks[h*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[h*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    first=blocksArray.blocks[h*(interface.blocksInArow)+k]
                }
                else break;
                if(j-k>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            for(k=j,h=i;;)
            {
                k++;
                h--;
                if (k<(interface.blocksInArow)&&h>=0&&blocksArray.blocks[h*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[h*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    last=blocksArray.blocks[h*(interface.blocksInArow)+k]
                }
                else break;
                if(k-j>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            truewidth=0;
			first=firstconteiner;
			last=lastconteiner;
            for(k=j,h=i;;)
            {
                k++;
                h++;
                if (k>=0&&h<interface.blocksInArow&&blocksArray.blocks[h*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[h*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    first=blocksArray.blocks[h*(interface.blocksInArow)+k]
                }
                else break;
                if(j-k>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            for(k=j,h=i;;)
            {
                k++;
                h++;
                if (k<(interface.blocksInArow)&&h<(interface.blocksInArow)&&blocksArray.blocks[h*(interface.blocksInArow)+k].active==false&&blocksArray.blocks[h*(interface.blocksInArow)+k].sign==sign)
                {
                    truewidth++;
                    last=blocksArray.blocks[h*(interface.blocksInArow)+k]
                }
                else break;
                if(k-j>=size)
                    break;
                if (truewidth==size)
                    break;
            }
            if (truewidth==size) {
              //console.log(first.x, first.y, last.x, last.y)
                return true;

              }
        return false
    }

function BlockArray(){
	this.createBlocksArray = function() {
		var arr = new Array()
		for( i = 0; i < interface.blocksInArow; i++ )
			for( j = 0; j < interface.blocksInArow; j++ )
				arr.push( new Block( j, i ) )
		return arr
	}

  this.checkWin = function() {

  }

	this.blocks = this.createBlocksArray()
  this.blocksInArow = interface.blocksInArow
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
    console.log("\n> Connected clients:")
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


setInterval(heartbeat, 30);


interface = new Interface( 3 )
blocksArray = new BlockArray()
clientsArray = new ClientsArray()


function heartbeat() {
  if(lastSign === 'x') turn = 'o'
  else if(lastSign === 'o') turn = 'x'
  io.sockets.emit('blocksBeat', blocksArray);
  io.sockets.emit('interfaceBeat', interface)
  io.sockets.emit('turnBeat', turn)
}

io.sockets.on('connection', function(socket) {
    console.log("\n> New client: " + socket.id );

    socket.on('start', function(data) {

      if( interface.clientsCounter === 0 ) var sign = 'x'
      else if( interface.clientsCounter === 1
        && clientsArray.clients[0].sign === 'x') var sign = 'o'
        else if( interface.clientsCounter === 1
          && clientsArray.clients[0].sign === 'o') var sign = 'x'
      else if(interface.clientsCounter >= 2 ) var sign = 'spec'
      clientsArray.addClient( socket.id, sign, socket )

      interface.clientsCounter++

      data = {
        sign: sign,
        id: socket.id,
        blocksInArow: interface.blocksInArow,
        clientsAmount: interface.clientsCounter
      }
      clientsArray.printList()
      socket.emit( 'serverCallback', data )
    })

    socket.on('click', function(data) {
      if(data.index > -1) {
          if(data.sign != 'spec') {
          var selectedBlock = blocksArray.blocks[data.index];
          var size;

          if( selectedBlock.active ) {
              var first = selectedBlock
              var last = selectedBlock
              selectedBlock.switchActivity()
              selectedBlock.sign = data.sign
              lastSign = data.sign
              if(interface.blocksInArow === 3)  size = 3;
              else if(interface.blocksInArow === 10)  size = 5;
			           if(checkNeighbour(selectedBlock.sign, selectedBlock.y, selectedBlock.x, size, first, last)) {
                    interface.win.isWin = true
                    interface.win.first = first
                    interface.win.last = last
                 }
                 isStarted = false;
               }
             }
             interface.actions++
           }
    })

    socket.on('size', function(data) { //data: width, blocksinarow
        interface.blocksInArow = data.blocksInArow
        blocksArray.blocksInArow = interface.blocksInArow
        blocksArray = new BlockArray()
        console.log("\n> Blocks in a row: " +interface.blocksInArow)
    })

    socket.on('reset', function() {
        for(var i = 0; i < blocksArray.blocks.length; i++) {
          blocksArray.blocks[i].active = true
          blocksArray.blocks[i].sign = ''
        }
        interface.actions = 0
        interface.win.isWin = false
    })

    socket.on( 'CHAT_MSG', function( data ) {
      console.log(data.message)
      io.sockets.emit('MSG_FROM_SERVER', data)
    })

    socket.on('disconnect', function() {
      console.log("\n> Client " +socket.id+ " has disconnected");
      var index = clientsArray.indexOf(socket.id)
      if(interface.clientsCounter > 2 && clientsArray.clients[index].sign === 'x') {
        clientsArray.clients[2].sign = 'x'
        clientsArray.clients[2].socket.emit('sign', 'x')
      }
      else if(interface.clientsCounter > 2 && clientsArray.clients[index].sign === 'o') {
        clientsArray.clients[2].sign = 'o'
        clientsArray.clients[2].socket.emit('sign', 'o')
      }

      clientsArray.removeClient( socket.id )
      interface.clientsCounter--
      clientsArray.printList()
    })

})
