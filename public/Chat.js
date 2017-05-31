function Chat(lX, lY, w, h, sc, cl) {
  this.layoutX = lX
  this.layoutY = lY
  this.width = w
  this.height = h
  this.socket = sc
  this.messagesArray = new Array()
  this.spacing = 15
  this.color = cl
  this.margin = {
    left: 10,
    right: 10,
    top: 20,
    bottom: 10
  }
  this.font = {
    font: null,
    fontSize: 10,
    color: this.color
  }
  function Message(msg, usr) {
    this.message = msg
    this.userName = usr
  }

  this.input = createInput();
  this.input.position(this.layoutX+80, this.layoutY+this.height-26)

  this.show = function() {
    fill(220,220,220)
    stroke(105,105,105)
    strokeWeight(4)
    strokeJoin(ROUND);
    rect(this.layoutX, this.layoutY, this.width, this.height)
    fill(105,105,105)
    rect(this.layoutX, this.layoutY+this.height-33, this.width, 33)
    textSize(12);
    fill(255);
    text("MESSAGE:", this.layoutX+this.margin.left, this.layoutY+this.height -12)

    var x = this.layoutX
    var y = this.layoutY
    var margL = this.margin.left
    var margT = this.margin.top
    var spacing = this.spacing
    textSize(12);
    fill(255);
    this.messagesArray.forEach(function(value, index) {
      
      text( value.userName +':  '+ value.message,
            x + margL,
            y+ index*spacing + margT
      )
    })
  }
}
