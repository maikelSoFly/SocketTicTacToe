w = window.innerWidth
actionsCounter = 0
ba = null
moveDone = false
blocksInArow = 0
address = 'http://192.168.1.5:3000'
connectedClientsSize = 0
bottomHeight = w/6
gridHeight = bottomHeight/6

var sign
var id
var blockSize

var myFont
var buttonReset
var buttonPlusSize
var buttonMinusSize
var socket


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

    createCanvas(w, w+bottomHeight)
    blockSize = w
    ba = new BlockArray(w, blockSize)
	  strokeW = 2
    var btnSize = w/10;
    var startBtnPos = w/2-(btnSize*3+20)/2

    buttonReset = createButton( 'RESET' )
    buttonReset.position( startBtnPos, w+0.5*gridHeight )
    buttonReset.size(btnSize,btnSize-20)
    buttonReset.mousePressed( reset )

    buttonPlusSize = createButton( 'SIZE+' )
    buttonPlusSize.size(btnSize, btnSize-20)
    buttonPlusSize.position( startBtnPos+10+btnSize, w+0.5*gridHeight )
    buttonPlusSize.mouseClicked( function() {
      if( blocksInArow < 10 && !isStarted() ) {
          if(blocksInArow+1 != 4)
              blocksInArow++
          else blocksInArow += 2
        blockSize = w/blocksInArow
        data = {
          blocksInArow: blocksInArow,
        }

        socket.emit('size', data)
      }
    })

    buttonMinusSize = createButton( 'SIZE-' )
    buttonMinusSize.size(btnSize,btnSize-20)
    buttonMinusSize.position( startBtnPos+20+btnSize*2, w+0.5*gridHeight )
    buttonMinusSize.mouseClicked( function() {
      if( blocksInArow > 3 && !isStarted() ) {
        if(blocksInArow-1 != 4)
            blocksInArow--
        else blocksInArow -= 2

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
    })

    socket.on('turnBeat', function(data) {
      if(data === sign)
        moveDone = false
      else moveDone = true
    })
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
  createCanvas(w, w+bottomHeight)
}


function draw(){
	background( 200 )
  if( w != window.innerWidth )
    resize()

	ba.show()
  scoreBoard( 0, 0 )

  if(moveDone == false) {
    stroke(0,255,0)
    strokeWeight(8)
    noFill()
    rect(4,4,w-8,w-8)
  }
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
