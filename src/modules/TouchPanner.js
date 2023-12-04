/**
 * 51
 */
import THREE from './../../static/js/three.min.js'
import Util from './Util'

var o = 0.5

function TouchPanner(dom) {
  var win = void 0 !== dom ? dom : window
  win.addEventListener('touchstart', this.onTouchStart_.bind(this))
  win.addEventListener('touchmove', this.onTouchMove_.bind(this))
  win.addEventListener('touchend', this.onTouchEnd_.bind(this))
  this.isTouching = false
  this.rotateStart = new THREE.Vector2()
  this.rotateEnd = new THREE.Vector2()
  this.rotateDelta = new THREE.Vector2()
  this.theta = 0
  this.orientation = new THREE.Quaternion()
}
TouchPanner.prototype.getOrientation = function() {
  var euler = new THREE.Euler(0, 0, 0, 'XYZ')
  euler.set(0, 0, this.theta)
  this.orientation.setFromEuler(euler)
  return this.orientation
}
TouchPanner.prototype.resetSensor = function() {
  this.theta = 0
}
TouchPanner.prototype.onTouchStart_ = function(t) {
  t.touches.length === 1 && (this.rotateStart.set(t.touches[0].pageX, t.touches[0].pageY), this.isTouching = !0)
}
TouchPanner.prototype.onTouchMove_ = function(t) {
  if (this.isTouching) {
    this.rotateEnd.set(t.touches[0].pageX, t.touches[0].pageY)
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart)
    this.rotateStart.copy(this.rotateEnd)
    Util.isIOS() && (this.rotateDelta.x *= -1)
    var e = document.body
    this.theta += 2 * Math.PI * this.rotateDelta.x / e.clientWidth * o
    t.preventDefault()
  }
}
TouchPanner.prototype.setRotationAngle = function(t) {
  this.theta = t
}
TouchPanner.prototype.onTouchEnd_ = function(t) {
  this.isTouching = !1
}

export default TouchPanner
