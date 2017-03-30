w = window.innerWidth
h = w
actionsCounter = 0
noPath = false
ba = null
startPlayer = false
moveDone = false
blocksInArow = 3

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

function Block( x, y ){
	this.x = x
	this.y = y
	this.pos = [this.x, this.y]
	this.active = true
    this.signX = false //'O' sign when true

	this.switchActivity = function(){
		this.active = !this.active
	}

	this.show = function(){
		fill( 51 )
        
		if( !this.active ) {
			fill( 100 )
        }
        
		strokeWeight( strokeW )
		stroke( 255 )
		rect( x*blockSize, y*blockSize, blockSize-strokeW, blockSize-strokeW )
        
        fill(255)
        textSize( 50 )
        
        if( !this.active && this.signX ) {
            text( "X", x*blockSize+blockSize/2-15, y*blockSize+blockSize/2+15 )
        } 
        else if( !this.active && !this.signX ) {
            text( "O", x*blockSize+blockSize/2-21, y*blockSize+blockSize/2+15 )
        }
	}
}

function BlockArray(){

	this.createBlocksArray = function() {
		var arr = new Array()
		for( i = 0; i < h/blockSize; i++ )
			for( j = 0; j < w/blockSize; j++ )
				arr.push( new Block( j, i ) )
		return arr
	}

	this.blocks = this.createBlocksArray()

	//Returns block at position (x,y)
	this.getBlock = function(x, y = null) {
		return this.blocks[x+y*(w/blockSize)]
	}

	this.show = function(){
		for (var i = this.blocks.length - 1; i >= 0; i--) {
			this.blocks[i].show()
		}
	}
    
    this.reset = function() {
        for (var i = this.blocks.length - 1; i >= 0; i--) {
			this.blocks[i].active = true
            this.blocks[i].signX = false
		}
    }
}

function preload() {
  myFont = loadFont('Lao Sangam MN.ttf')
}

function setup(){
	createCanvas(w, h+105)
    
	blockSize = w/blocksInArow
	strokeW = 2
	ba = new BlockArray()
    
    var btnSize = 80;
    var startBtnPos = w/2-(btnSize*3+20)/2
    
    buttonReset = createButton( 'RESET' )
    buttonReset.position( startBtnPos, height-100 )
    buttonReset.size(btnSize,btnSize-20)
    buttonReset.mousePressed( reset )
    
    buttonPlusSize = createButton( 'SIZE+' )
    buttonPlusSize.size(btnSize, btnSize-20)
    buttonPlusSize.position( startBtnPos+10+btnSize, height-100 )
    buttonPlusSize.mouseClicked( increaseSize )
    
    buttonMinusSize = createButton( 'SIZE-' )
    buttonMinusSize.size(btnSize,btnSize-20)
    buttonMinusSize.position( startBtnPos+20+btnSize*2, height-100 )
    buttonMinusSize.mouseClicked( decreaseSize )
    
    
    socket = io.connect( 'http://fsociety:3000' )
    socket.on( 'mouse', receiveMove )
    socket.on( 'size', receiveSize )
    socket.on( 'reset', receiveReset )
}

function draw(){
	background( 200 )
	ba.show()
    scoreBoard( 0, 0 )
}

function receiveReset() {
    if(isStarted())
        reset()
}

function reset() {
    ba.reset()
    actionsCounter = 0
    startPlayer = false
    moveDone = false
    
    var data = {
        //No need to pass anything
    }
    
    socket.emit( 'reset', data );
}

function receiveSize( data ) {
    if( data.blocksInArow > blocksInArow ){
        increaseSize()
    }
    else if( data.blocksInArow < blocksInArow ) {
        decreaseSize()
    }
}

function increaseSize() {
    if( blocksInArow < 5 && !isStarted() ) {
        blocksInArow++
        reset();
        blockSize = w/blocksInArow
        ba = new BlockArray()
        
        var data = {
            blocksInArow: blocksInArow
        }
        
        socket.emit( 'size', data )
    }
}

function decreaseSize() {
    if( blocksInArow > 3 && !isStarted() ) {
        blocksInArow--
        reset();
        blockSize = w/blocksInArow
        ba = new BlockArray()
        
        var data = {
            blocksInArow: blocksInArow
        }
        
        socket.emit( 'size', data )
    }
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
    
    textFont( myFont )
    textSize( 25 )
    stroke( 200, 100+actionsCounter*20, 60 )
    fill( 255 )
    strokeWeight( 3 )
    text( stScore, 8, h-75+100 )
    strokeWeight( 0.5 )
    fill( 0 )
    textSize( 10 )
    text( stP1, 8, h-55+100 )
    text( stP2, 8, h-35+100 )
    text( stActions, w-65, h-85+100 )
}

function mousePressed() {
    if( mouseX > 0 && mouseX < w && mouseY > 0 && mouseY < h && !moveDone ) {
        
        var selectedBlock = ba.getBlock( Math.floor( mouseX/blockSize ), Math.floor( mouseY/blockSize ) )
        var index = ba.blocks.indexOf(selectedBlock)
        
        if( !isStarted() ) {
            startPlayer = true;
        }
        if( startPlayer )
            selectedBlock.signX = true
	    makeMove( index ); 
        
        var data = {
        index: index,
        startPlayer: startPlayer
        }
        
        socket.emit( 'mouse', data )
        moveDone = true;
    }
}

function receiveMove( data ) {
    var selectedBlock = ba.blocks[data.index]
    
    if( data.startPlayer === true )
        selectedBlock.signX = true
    else selectedBlock.signX = false
        
    makeMove( data.index )
    moveDone = false;
}


function makeMove( index ) {
    var selectedBlock = ba.blocks[index]
       if( selectedBlock.active ) {
           selectedBlock.switchActivity()
           actionsCounter++
       }
}