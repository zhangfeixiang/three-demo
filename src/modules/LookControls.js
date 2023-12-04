/**
 * 43: PC端查看控制器
 */
import THREE from './../../static/js/three.min.js'

var clientX, clientY, s = 0.5, c = 0.3
function hasNotMove(t) {
  var notMove = t.clientX === clientX && t.clientY === clientY
  clientX = t.clientX
  clientY = t.clientY
  return notMove
}

class LookControls {
  constructor(camera, container) {
    var mainCanvas = document.getElementById('main_canvas')
    mainCanvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    mainCanvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    mainCanvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.camera = camera
    this.phi = 0
    this.theta = 0
    this.rotateStart = new THREE.Vector2()
    this.rotateEnd = new THREE.Vector2()
    this.rotateDelta = new THREE.Vector2()
    this.isDragging = false
    this.isRotating = false
    this.enableDamping = false
    this.dampingFactor = 0.25
    this.$container = container
  }

  update() {
    var euler = new THREE.Euler(0, 0, 0, 'YXZ'),
      quaternion = new THREE.Quaternion()
    euler.set(this.phi, this.theta, 0)
    quaternion.setFromEuler(euler)
    this.enableDamping ? this.camera.quaternion.slerp(quaternion, this.dampingFactor) : this.camera.quaternion.copy(quaternion)
    return this
  }

  setOrientationFromCamera() {
    var euler = new THREE.Euler(0, 0, 0, 'YXZ')
    euler.setFromQuaternion(this.camera.quaternion)
    this.phi = euler.x
    this.theta = euler.y
    return this
  }

  reset() {
    this.phi = 0
    this.theta = 0
    this.update()
    return this
  }

  onMouseDown(t) {
    this.rotateStart.set(t.clientX, t.clientY)
    this.isMouseDown = true
    clientX = t.clientX
    clientY = t.clientY
  }

  onMouseMove(event) {
    if (!hasNotMove(event) && (this.isMouseDown || this.isPointerLocked()) && this.enabled) {
      this.isRotating = true
      if (!this.$container.hasClass('rotating')) {
        this.$container.addClass('rotating')
      }
      if (this.isPointerLocked()) {
        var moventX = event.movementX || event.mozMovementX || 0,
          moventY = event.movementY || event.mozMovementY || 0
        this.rotateEnd.set(this.rotateStart.x - moventX, this.rotateStart.y - moventY)
      } else {
        this.rotateEnd.set(event.clientX, event.clientY)
      }
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart)
      this.rotateStart.copy(this.rotateEnd)
      this.phi += 2 * Math.PI * this.rotateDelta.y / screen.height * c
      this.theta += 2 * Math.PI * this.rotateDelta.x / screen.width * s
      this.phi = THREE.Math.clamp(this.phi, -Math.PI / 2, Math.PI / 2)
    }
  }

  onMouseUp(t) {
    this.isMouseDown = false
    this.isRotating = false
    this.$container.removeClass('rotating')
  }

  isPointerLocked() {
    var t = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement
    return void 0 !== t
  }
}

export default LookControls
