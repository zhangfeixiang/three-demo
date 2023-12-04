/**
 * 38: 自定义相机。
 */
import THREE from './../../static/js/three.min.js'
import VRController from './VRController'
import Config from './Config'
import LookControls from './LookControls'
import OrbitController from './OrbitController'
import MobileLookControls from './MobileLookControls'
import _ from 'lodash'
import Events from './Events'

var Camera = function(params) {
  THREE.PerspectiveCamera.call(this)
  this.fov = 50
  this.near = 0.01
  this.far = 1500
  this.updateProjectionMatrix()
  this.moving = false
  this.rotating = false

  if (params.vr) {
    this.vr = true
    this.vrControls = new VRController(this)
    this.mode = Camera.VR_MODE
    this.moveTo(0, 0)
  } else {
    if (window.isMobile) {
      this.lookControls = new MobileLookControls(this, document.getElementById('main_canvas'))
      this.lookControls.setRotationAngle(3.6)
    } else {
      this.lookControls = new LookControls(this, params.$container)
      if (Config.ENABLE_DAMPING) {
        this.lookControls.enableDamping = true
        this.lookControls.dampingFactor = 0.25
      }
    }
  }
  this.orbitControls = new OrbitController(this, {
    autoSpeed: Config.ENABLE_DAMPING ? 0.1 : 1,
    autoDelay: 3000,
    domElement: document.getElementById('main_canvas')
  })
  this.orbitControls.enableZoom = Config.ENABLE_ZOOM
  this.orbitControls.enablePan = Config.ENABLE_PAN
  this.orbitControls.enabled = false
  this.orbitControls.maxPolarAngle = Math.PI / 2
  if (Config.ENABLE_DAMPING) {
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.065
    this.orbitControls.rotateSpeed = 0.05
  }
  this._target = new THREE.Object3D()
  this._target.position.z = -1
  this.add(this._target)
  this.mode = Camera.LOOK_MODE
  debugger
  if (params.states) {
    this.initStates(params.states)
    if (this.states.start) {
      this.position.copy(this.states.start[0].position)
      this.quaternion.copy(this.states.start[0].quaternion)
      this.vr || this.lookControls.setOrientationFromCamera()
    } else {
      this.moveTo(-3.5, 3)
    }
  }
}

var methods = {
  initStates(cameras) {
    this.states = {}
    cameras.forEach(function(camera) {
      var cameraName = camera.name.replace('_camera', '')
      this.states[cameraName] ? this.states[cameraName].push(camera) : this.states[cameraName] = [camera]
      camera.children.length > 0 && (camera.target = new THREE.Vector3(), camera.children[0].getWorldPosition(camera.target))
    }.bind(this), this)
  },
  setState(cameraState) {
    if (!this.vr) {
      if (void 0 === cameraState) return void console.warn('setCameraState() requires an argument')
      if (!this.states.hasOwnProperty(cameraState)) return void console.error('Camera state was not found:', cameraState)
      this.setMode(Camera.ORBIT_MODE)
      var e = _.min(this.states[cameraState], function(state) {
          return this.position.distanceTo(state.position)
        }.bind(this)),
        duration = 1000
      this.isTransitioning = true
      this.tweenOrbitTargetTo(e.target, duration).onComplete(function() {
        this.isTransitioning = false
        this.orbitControls.startAutoOrbit(1e3)
      }.bind(this))
      return this.tweenPositionTo(e.position, duration)
    }
  },
  setMode(mode) {
    var target = new THREE.Vector3()
    switch (mode) {
      case Camera.ORBIT_MODE:
        this._target.getWorldPosition(target)
        this.orbitControls.setTarget(target)
        this.orbitControls.enabled = true
        break
      case Camera.LOOK_MODE:
        this.lookControls.setOrientationFromCamera()
        this.orbitControls.enabled = false
        this.orbitControls.stopAutoOrbit()
        break
      case Camera.VR_MODE:
        this.orbitControls.enabled = false
    }
    this.mode = mode
  },
  moveTo(x, z, duration) {
    var positoin = new THREE.Vector3()
    duration = duration || 0
    positoin.set(x, this.vr ? Camera.DEFAULT_HEIGHT_VR : Camera.DEFAULT_HEIGHT, z)
    duration > 0 && !this.vr ? (this.trigger('startMove'), this.moving = true, this.tweenPositionTo(positoin, duration).onComplete(function() {
      this.trigger('endMove')
      this.moving = false
    }.bind(this))) : (this.position.copy(positoin), this.vr && (this.updateMatrixWorld(true), this.vrControls.setPosition(this)))
    this.firstMove || (this.trigger('firstMove'), this.firstMove = true)
    this.vr || this.setMode(Camera.LOOK_MODE)
  },
  tweenPositionTo(position, duration) {
    var coords = {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z
    }
    var tween = new window.TWEEN.Tween(coords)
            .to({ x: position.x, y: position.y, z: position.z }, duration)
            .easing(window.TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() {
              this.position.set(coords.x, coords.y, coords.z)
            }.bind(this)).start()
    return tween
  },
  tweenOrbitTargetTo(n, i) {
    var t = {
      x: 0, y: 0, z: 0
    }
    var tween = new window.TWEEN.Tween()
    if (!this.orbitControls) throw new Error('Orbit controls required')
    var r = this.orbitControls.getTarget()
    t.x = r.x
    t.y = r.y
    t.z = r.z
    return tween.reset(t).to({
      x: n.x,
      y: n.y,
      z: n.z
    }, i).easing(window.TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
      this.orbitControls.target.set(t.x, t.y, t.z)
    }.bind(this)).start()
  },
  enableControls() {
    this.vr || (this.lookControls.enabled = true)
  },
  setOrbitDistances(min, max) {
    this.orbitControls.minDistance = min
    this.orbitControls.maxDistance = max
  },
  update() {
    this.mode === Camera.VR_MODE ? this.vrControls.update() : (this.mode === Camera.ORBIT_MODE ? (this.orbitControls.update(), this.rotating = this.orbitControls.isRotating || this.isTransitioning) : (this.lookControls.update(), this.rotating = this.lookControls.isRotating), this.rotating && !this.firstRotate && (this.trigger('firstRotate'), this.firstRotate = true))
  }
}

Camera.prototype = _.extend(Object.create(THREE.PerspectiveCamera.prototype), methods, Events.prototype)
Camera.LOOK_MODE = 0
Camera.ORBIT_MODE = 1
Camera.VR_MODE = 2
Camera.DEFAULT_HEIGHT = 1.4 // 相机默认高度，1.4m
Camera.DEFAULT_HEIGHT_VR = 1.55

export default Camera
