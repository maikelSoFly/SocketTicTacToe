w = 400
actionsCounter = 0
ba = null
moveDone = false
blocksInArow = 0
address = 'http://0.0.0.0:3000'
connectedClientsSize = 0
bottomHeight = w/6
gridHeight = bottomHeight/6
first = null
last = null
chat = null
chatWidth = 250

var sign
var id
var blockSize
isWin = false;

var myFont
var buttonReset
var buttonPlusSize
var buttonMinusSize
var socket

function Message(msg, usr) {
  this.message = msg
  this.userName = usr
}


function Player( id ) { //TODO
    this.id = id
    this.score = 99

    this.increaseScore = function() {
        this.score++
    }
}

function preload() {
  myFont = loadFont('Lao Sangam MN.ttf')
}

function setup(){
    socket = io.connect( address )

    data = { }
    socket.emit('start', data);
    socket.on( 'serverCallback', getInfo)

    createCanvas(w+500, w+bottomHeight)
    blockSize = w
    ba = new BlockArray(w, blockSize)
	  strokeW = 2
    var btnSize = 55;
    var startBtnPos = w/2-(btnSize*3+20)/2

    buttonReset = createButton( 'RESET' )
    buttonReset.position( startBtnPos, w+0.5*gridHeight )
    buttonReset.size(btnSize,btnSize-30)
    buttonReset.mousePressed( reset )

    buttonPlusSize = createButton( 'Classic' )
    buttonPlusSize.size(btnSize, btnSize-30)
    buttonPlusSize.position( startBtnPos+5+btnSize, w+0.5*gridHeight )
    buttonPlusSize.mouseClicked( function() {
        if (!isStarted()) {
            data.isClasic=true;
            blocksInArow = 3;
            blockSize = w / blocksInArow
            data = {
                blocksInArow: blocksInArow,
            }

            socket.emit('size', data)
        }

    })

    buttonMinusSize = createButton( 'Gomoku' )
    buttonMinusSize.size(btnSize,btnSize-30)
    buttonMinusSize.position( startBtnPos+10+btnSize*2, w+0.5*gridHeight )
    buttonMinusSize.mouseClicked( function() {
      if(  !isStarted() ) {
       blocksInArow=10;
       data.isClasic=false;
        blockSize = w/blocksInArow
        data = {
          blocksInArow: blocksInArow,
        }

        socket.emit('size', data)
      }
    })

    socket.on('blocksBeat', function(data) {

      blocksInArow = data.blocksInArow
      blockSize = w/blocksInArow
      ba = new BlockArray(w, blockSize)

      var iterMax
      if(data.blocks.length > ba.blocks.length)
        iterMax = ba.blocks.length
      else iterMax = data.blocks.length
      for(var i = 0; i < iterMax; i++) {
        ba.blocks[i].x = data.blocks[i].x
        ba.blocks[i].y = data.blocks[i].y
        ba.blocks[i].active = data.blocks[i].active
        ba.blocks[i].sign = data.blocks[i].sign
      }
    })

    socket.on('sign', function(data) {
      sign = data
    })

    socket.on('interfaceBeat', function(data) {
        connectedClientsSize = data.clientsCounter
        actionsCounter = data.actions
        isWin = data.win.isWin
        first = data.win.first
        last = data.win.last
    })

    socket.on('turnBeat', function(data) {
      if(data === sign)
        moveDone = false
      else moveDone = true
    })

//CHAT IMPLEMENTATION
    var color = {
      r: 20,
      g: 50,
      b: 120
    }

    chat = new Chat(400,0,chatWidth,w+bottomHeight, socket, color)
    this.socket.on('MSG_FROM_SERVER', function(data) {
      chat.messagesArray.push(data)
    })
    chat.input.changed(send)
}

function send() {
  var chatName
  if(sign == 'spec') chatName = "Spectator"
  else chatName = "Player " + sign
  var msg = new Message(chat.input.value(), chatName)
  socket.emit('CHAT_MSG', msg)
  chat.input.value('')
}

function getInfo(data) {
  console.log("Getting data from server")
  sign = data.sign
  id = data.id
  blocksInArow = data.blocksInArow
  connectedClientsSize = data.clientsAmount
  console.log("Sign: " +sign)
  console.log("ID: " +id)
  console.log("Blocks in a row: " +blocksInArow)

  blockSize = w/blocksInArow
  ba = new BlockArray(w, blockSize)
  createCanvas(w+chatWidth, w+bottomHeight)
}


function draw(){
	background( 200 )
  // if( w != window.innerWidth )
  //   resize()

	ba.show()
  scoreBoard( 0, 0 )

  if(moveDone == false) {
    stroke(0,255,0)
    strokeWeight(8)
    noFill()
    rect(4,4,w-8,w-8)
  }

  if(isWin) {
    console.log("WIN!" ,first.x,last.x,first.y,last.y)
    push()
    stroke(0,255,0)
    strokeWeight(5)
    line(first.x*blockSize+blockSize/2, first.y*blockSize+blockSize/2, last.x*blockSize+blockSize/2, last.y*blockSize+blockSize/2)
    pop()

  }
  chat.show()
}

function resize() {
    if( window.innerWidth >= 462 ) {
        w = window.innerWidth
        createCanvas(w, w+bottomHeight)
        blockSize = w/blocksInArow
        ba.blockSize = blockSize
        ba.width = w

        var btnSize = w/10;
        var startBtnPos = w/2-(btnSize*3+20)/2

        buttonReset.position( startBtnPos, w+0.5*gridHeight )
        buttonPlusSize.position( startBtnPos+10+btnSize, w+0.5*gridHeight )
        buttonMinusSize.position( startBtnPos+20+btnSize*2, w+0.5*gridHeight )
    }
}

function reset() {
    data = {}
    socket.emit( 'reset', data );
}

function isStarted() {
    var isStarted = false;
    for( var i = 0; i < ba.blocks.length; i++ ) {
        if( !ba.blocks[i].active )
            isStarted = true;
    }
    return isStarted;
}

function scoreBoard( s1, s2 ) {
    var stScore = "SCORE"
    var stP1 = "PLAYER1:   " + s1
    var stP2 = "PLAYER2:   " + s2
    var stActions = "ACTIONS:   " + actionsCounter;
    var stConnected = "CONNECTED:   " + connectedClientsSize;
    var stSize = "SIZE: " + blocksInArow + "x" + blocksInArow

    var stType = "PLAYER"
    if(sign === 'x')
      stType = "PLAYER X"
    else if(sign === 'o')
      stType = "PLAYER O"
    else if(sign === 'spec')
      stType = "SPECTATOR"

    textFont( myFont )
    textSize( w/15 )
    stroke( 200, 100+actionsCounter*20, 60 )
    fill( 255 )
    strokeWeight( 3 )
    text( stScore, 8, w+2*gridHeight )
    strokeWeight( 0.5 )
    fill( 0 )
    textSize( w/30 )
    text( stP1, 8, w+3.5*gridHeight )
    text( stP2, 8, w+4.5*gridHeight+gridHeight/2 )
    text( stActions, w-textWidth(stActions)-8, w+gridHeight)
    text( stConnected, w-textWidth(stConnected)-8, w+2*gridHeight+4)
    text( stType, w-textWidth(stType)-8, w+3*gridHeight+8 )
    text( stSize, w-textWidth(stSize)-8, w+4*gridHeight+12)
}

function mousePressed() {
    if( mouseX > 0 && mouseX < w && mouseY > 0 && mouseY < w && !moveDone ) {
        var indexX = Math.floor( mouseX/blockSize ) //4
        var indexY = Math.floor( mouseY/blockSize ) //1
        var index = (blocksInArow) * indexY + indexX
        console.log("Clicked tile of index: " +index)

        var data = {
            index: index,
            sign: sign
        }

        socket.emit( 'click', data )

    }
}
