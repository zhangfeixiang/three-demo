/**
 * 42: 画布绘制器
 */
var context2D, canvas, defaultY = 1
function initCanvas() {
  canvas = document.createElement('canvas')
  context2D = canvas.getContext('2d')
}
function resize(width, height) {
  canvas.width = width
  canvas.height = height
  reset()
}

function reset() {
  context2D.clearRect(0, 0, canvas.width, canvas.height)
  context2D.fillStyle = 'rgba(255, 255, 255, 0.001)'
  context2D.fillRect(0, 0, canvas.width, canvas.height)
}

function draw(text, font, fillStyle, yOffset) {
  context2D.font = font
  context2D.fillStyle = fillStyle
  context2D.textBaseline = 'hanging'
  context2D.fillText(text, 0, defaultY + yOffset)
}

var CanvasDrawer = function() {
  initCanvas()
  this.canvas = canvas
}

CanvasDrawer.prototype.draw = function(text, font, fillStyle, yOffset) {
  text.length > 0 && draw(text, font, fillStyle, yOffset)
}

CanvasDrawer.prototype.resize = function(width, height) {
  resize(width, height)
}

CanvasDrawer.prototype.reset = function() {
  reset()
}

export default CanvasDrawer
