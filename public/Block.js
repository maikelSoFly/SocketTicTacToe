function Block( x, y, bs ){
	this.x = x
	this.y = y
	this.active = true
  this.sign = '' //'O' sign when true
  this.blockSize = bs

	this.switchActivity = function(){
		this.active = !this.active
	}

	this.show = function(bs){
		fill( 51 )

		if( !this.active ) {
			fill( 100 )
        }

		strokeWeight( 2 )
		stroke( 255 )
		rect( this.x*bs, this.y*bs, bs-2, bs-2 )

        fill(255)
        textSize( 50 )

        if( !this.active && this.sign === 'x' ) {
            text( "X", this.x*bs+bs/2-15, this.y*bs+bs/2+15 )
        }
        else if( !this.active && this.sign === 'o' ) {
            text( "O", this.x*bs+bs/2-21, this.y*bs+bs/2+15 )
        }
	}
}

function BlockArray(w, bs){
    this.width = w
    this.blockSize = bs

	this.createBlocksArray = function() {
		var arr = new Array()
		for( i = 0; i < this.width/this.blockSize; i++ )
			for( j = 0; j < this.width/this.blockSize; j++ )
				arr.push( new Block( j, i, this.blockSize ) )
		return arr
	}

	this.blocks = this.createBlocksArray()

	//Returns block at position (x,y)
	this.getBlock = function(x, y = null) {
		return this.blocks[x+y*(this.width/this.blockSize)]
	}

	this.show = function(){
		for (var i = this.blocks.length - 1; i >= 0; i--) {
			this.blocks[i].show(this.blockSize)
		}
	}

    this.reset = function() {
        for (var i = this.blocks.length - 1; i >= 0; i--) {
			this.blocks[i].active = true
            this.blocks[i].signX = false
		}
    }
}
