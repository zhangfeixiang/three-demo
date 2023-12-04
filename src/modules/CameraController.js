// 6: 手势控制器（控制相机方位）
import THREE from './../../static/js/three.min.js'

// clientX, clientY
var i, r

function CameraConstraint(camera) {
  this.object = camera
  this.target = new THREE.Vector3()
  this.minDistance = 0
  this.maxDistance = 1 / 0
  this.minZoom = 0
  this.maxZoom = 1 / 0
  this.minPolarAngle = 0
  this.maxPolarAngle = Math.PI
  this.minAzimuthAngle = -(1 / 0)
  this.maxAzimuthAngle = 1 / 0
  this.enableDamping = !1
  this.dampingFactor = 0.25
  var azimuthalAngle, polarAngle, self = this,
    r = 1e-6,
    o = 0,
    a = 0,
    s = 1,
    c = new THREE.Vector3(),
    u = false
  this.getPolarAngle = function() {
    return polarAngle
  }
  this.getAzimuthalAngle = function() {
    return azimuthalAngle
  }
  this.rotateLeft = function(t) {
    a -= t
  }
  this.rotateUp = function(t) {
    o -= t
  }
  this.panLeft = function(scalar) {
    var t = new THREE.Vector3()
    var elements = this.object.matrix.elements
    t.set(elements[0], elements[1], elements[2])
    t.multiplyScalar(-scalar)
    c.add(t)
  }
  this.panUp = function(e) {
    var t = new THREE.Vector3()
    var n = this.object.matrix.elements
    t.set(n[4], n[5], n[6])
    t.multiplyScalar(e)
    c.add(t)
  }
  this.pan = function(t, e, n, r) {
    if (self.object instanceof THREE.PerspectiveCamera) {
      var o = self.object.position
      a = o.clone().sub(self.target)
      s = a.length()
      s *= Math.tan(self.object.fov / 2 * Math.PI / 180)
      self.panLeft(2 * t * s / r)
      self.panUp(2 * e * s / r)
    } else {
      if (self.object instanceof THREE.OrthographicCamera) {
        self.panLeft(t * (self.object.right - self.object.left) / n)
        self.panUp(e * (self.object.top - self.object.bottom) / r)
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.')
      }
    }
  }
  this.dollyIn = function(t) {
    debugger
    if (self.object instanceof THREE.PerspectiveCamera) {
      s /= t
    } else {
      if (self.object instanceof THREE.OrthographicCamera) {
        self.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * t))
        self.object.updateProjectionMatrix()
        u = true
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      }
    }
  }
  this.dollyOut = function(t) {
    if (self.object instanceof THREE.PerspectiveCamera) {
      s *= t
    } else {
      if (self.object instanceof THREE.OrthographicCamera) {
        self.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / t))
        self.object.updateProjectionMatrix()
        u = true
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      }
    }
  }
  this.update = function() {
    var i = new THREE.Vector3(),
      l = (new THREE.Quaternion()).setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0)),
      h = l.clone().inverse(),
      f = new THREE.Vector3(),
      p = new THREE.Quaternion()

    var t = this.object.position
    i.copy(t).sub(this.target)
    i.applyQuaternion(l)
    azimuthalAngle = Math.atan2(i.x, i.z)
    polarAngle = Math.atan2(Math.sqrt(i.x * i.x + i.z * i.z), i.y)
    azimuthalAngle += a
    polarAngle += o
    this.object.theta = azimuthalAngle = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, azimuthalAngle))
    polarAngle = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, polarAngle))
    this.object.phi = polarAngle = Math.max(r, Math.min(Math.PI - r, polarAngle))
    var d = i.length() * s
    d = Math.max(this.minDistance, Math.min(this.maxDistance, d))
    this.target.add(c)
    i.x = d * Math.sin(polarAngle) * Math.sin(azimuthalAngle)
    i.y = d * Math.cos(polarAngle)
    i.z = d * Math.sin(polarAngle) * Math.cos(azimuthalAngle)
    i.applyQuaternion(h)
    t.copy(this.target).add(i)
    this.object.lookAt(this.target)
    if (this.enableDamping === !0) {
      a *= 1 - this.dampingFactor
      o *= 1 - this.dampingFactor
    } else {
      a = 0
      o = 0
    }
    s = 1
    c.set(0, 0, 0)
    if (u) return true
    if (f.distanceToSquared(this.object.position) > r) return true
    if (8 * (1 - p.dot(this.object.quaternion)) > r) {
      f.copy(this.object.position)
      p.copy(this.object.quaternion)
      u = false
      return true
    } else {
      return false
    }
  }
}

function n(t) {
  var e = t.clientX === i && t.clientY === r
  i = t.clientX
  r = t.clientY
  return e
}

var CameraController = function(camera, o) {
  function a(t, e) {
    var n = _.domElement === document ? _.domElement.body : _.domElement
    y.pan(t, e, n.clientWidth, n.clientHeight)
  }
  function s() {
    return 2 * Math.PI / 60 / 60 * _.autoRotateSpeed
  }
  function c() {
    return Math.pow(0.95, _.zoomSpeed)
  }
  function onMouseDown(t) {
    if (_.enabled !== false) {
      i = t.clientX
      r = t.clientY
      t.preventDefault()
      if (t.button === _.mouseButtons.ORBIT) { // 鼠标滚轮
        if (_.enableRotate === false) return
        C = O.ROTATE
        E.set(t.clientX, t.clientY)
      } else if (t.button === _.mouseButtons.ZOOM) {
        if (_.enableZoom === false) return
        C = O.DOLLY
        M.set(t.clientX, t.clientY)
      } else if (t.button === _.mouseButtons.PAN) {
        if (_.enablePan === false) return
        C = O.PAN
        x.set(t.clientX, t.clientY)
      }
      if (C !== O.NONE) {
        document.addEventListener('mousemove', onMouseMove, false)
        document.addEventListener('mouseup', onMouseUp, false)
        _.dispatchEvent(k)
      }
      _.onMouseDown()
    }
  }
  function onMouseMove(t) {
    if (_.enabled !== false && !n(t)) {
      t.preventDefault()
      var e = _.domElement === document ? _.domElement.body : _.domElement
      if (C === O.ROTATE) {
        if (_.enableRotate === false) return
        _.isRotating = !0
        b.set(t.clientX, t.clientY)
        w.subVectors(b, E)
        y.rotateLeft(2 * Math.PI * w.x / e.clientWidth * _.rotateSpeed)
        y.rotateUp(2 * Math.PI * w.y / e.clientHeight * _.rotateSpeed)
        E.copy(b)
      } else if (C === O.DOLLY) {
        if (_.enableZoom === false) return
        S.set(t.clientX, t.clientY)
        P.subVectors(S, M)
        P.y > 0 ? y.dollyIn(c()) : P.y < 0 && y.dollyOut(c())
        M.copy(S)
      } else if (C === O.PAN) {
        if (_.enablePan === false) return
        T.set(t.clientX, t.clientY)
        R.subVectors(T, x)
        a(R.x, R.y)
        x.copy(T)
      }
      if (C !== O.NONE && _.update()) {
        _.onMouseMove()
      }
    }
  }
  function onMouseUp() {
    if (_.enabled !== !1) {
      document.removeEventListener('mousemove', onMouseMove, !1)
      document.removeEventListener('mouseup', onMouseUp, !1)
      _.dispatchEvent(j)
      C = O.NONE
      _.isRotating = !1
      _.onMouseUp()
    }
  }
  function onMouseWheel(t) {
    if (_.enabled !== !1 && _.enableZoom !== !1 && C === O.NONE) {
      t.preventDefault()
      t.stopPropagation()
      var e = 0
      void 0 !== t.wheelDelta ? e = t.wheelDelta : void 0 !== t.detail && (e = -t.detail)
      e > 0 ? y.dollyOut(c()) : e < 0 && y.dollyIn(c())
      _.update()
      _.dispatchEvent(k)
      _.dispatchEvent(j)
    }
  }
  function onKeyDown(t) {
    if (_.enabled !== false && _.enableKeys !== false && _.enablePan !== false) {
      switch (t.keyCode) {
        case _.keys.UP:
          a(0, _.keyPanSpeed)
          _.update()
          break
        case _.keys.BOTTOM:
          a(0, -_.keyPanSpeed)
          _.update()
          break
        case _.keys.LEFT:
          a(_.keyPanSpeed, 0)
          _.update()
          break
        case _.keys.RIGHT:
          a(-_.keyPanSpeed, 0)
          _.update()
      }
    }
  }

  // ********** 触摸屏 **********
  function onTouchStart(t) {
    if (_.enabled !== !1) {
      switch (t.touches.length) {
        case 1:
          if (_.enableRotate === !1) return
          C = O.TOUCH_ROTATE
          E.set(t.touches[0].pageX, t.touches[0].pageY)
          break
        case 2:
          if (_.enableZoom === !1) return
          C = O.TOUCH_DOLLY
          var e = t.touches[0].pageX - t.touches[1].pageX,
            n = t.touches[0].pageY - t.touches[1].pageY,
            i = Math.sqrt(e * e + n * n)
          M.set(0, i)
          break
        case 3:
          if (_.enablePan === !1) return
          C = O.TOUCH_PAN
          x.set(t.touches[0].pageX, t.touches[0].pageY)
          break
        default:
          C = O.NONE
      }
      C !== O.NONE && _.dispatchEvent(k)
    }
  }
  function onTouchMove(t) {
    if (_.enabled !== false) {
      t.preventDefault()
      t.stopPropagation()
      var e = _.domElement === document ? _.domElement.body : _.domElement
      switch (t.touches.length) {
        case 1:
          if (_.enableRotate === !1) return
          if (C !== O.TOUCH_ROTATE) return
          _.isRotating = true
          b.set(t.touches[0].pageX, t.touches[0].pageY)
          w.subVectors(b, E)
          y.rotateLeft(2 * Math.PI * w.x / e.clientWidth * _.rotateSpeed)
          y.rotateUp(2 * Math.PI * w.y / e.clientHeight * _.rotateSpeed)
          E.copy(b)
          _.update()
          break
        case 2:
          if (_.enableZoom === !1) return
          if (C !== O.TOUCH_DOLLY) return
          var n = t.touches[0].pageX - t.touches[1].pageX,
            i = t.touches[0].pageY - t.touches[1].pageY,
            r = Math.sqrt(n * n + i * i)
          S.set(0, r)
          P.subVectors(S, M)
          P.y > 0 ? y.dollyOut(c()) : P.y < 0 && y.dollyIn(c())
          M.copy(S)
          _.update()
          break
        case 3:
          if (_.enablePan === !1) return
          if (C !== O.TOUCH_PAN) return
          T.set(t.touches[0].pageX, t.touches[0].pageY)
          R.subVectors(T, x)
          a(R.x, R.y)
          x.copy(T)
          _.update()
          break
        default:
          C = O.NONE
      }
    }
  }
  function onTouchEnd() {
    if (_.enabled !== false) {
      _.dispatchEvent(j)
      C = O.NONE
      _.isRotating = false
    }
  }
  function onContextMenu(t) {
    t.preventDefault()
  }
  var y = new CameraConstraint(camera)
  this.domElement = void 0 !== o ? o : document
  Object.defineProperty(this, 'constraint', {
    get: function() {
      return y
    }
  })
  // 获取极角
  this.getPolarAngle = function() {
    return y.getPolarAngle()
  }
  // 获取方位角、地平经度、偏振角
  this.getAzimuthalAngle = function() {
    return y.getAzimuthalAngle()
  }
  this.enabled = true
  this.center = this.target
  this.enableZoom = true
  this.zoomSpeed = 1
  this.enableRotate = true
  this.rotateSpeed = 1
  this.enablePan = true
  this.keyPanSpeed = 7
  this.autoRotate = !1
  this.autoRotateSpeed = 2
  this.enableKeys = true
  this.keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    BOTTOM: 40
  }
  this.mouseButtons = {
    ORBIT: THREE.MOUSE.LEFT,
    ZOOM: THREE.MOUSE.MIDDLE,
    PAN: THREE.MOUSE.RIGHT
  }
  var _ = this,
    E = new THREE.Vector2(),
    b = new THREE.Vector2(),
    w = new THREE.Vector2(),
    x = new THREE.Vector2(),
    T = new THREE.Vector2(),
    R = new THREE.Vector2(),
    M = new THREE.Vector2(),
    S = new THREE.Vector2(),
    P = new THREE.Vector2(),
    O = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_DOLLY: 4,
      TOUCH_PAN: 5
    },
    C = O.NONE

  this.target0 = this.target.clone()
  this.position0 = this.object.position.clone()
  this.zoom0 = this.object.zoom

  var A = {
      type: 'change'
    },
    k = {
      type: 'start'
    },
    j = {
      type: 'end'
    }

  this.update = function() {
    this.autoRotate && C === O.NONE && y.rotateLeft(s())
    y.update() === true && this.dispatchEvent(A)
  }

  this.reset = function() {
    C = O.NONE
    this.target.copy(this.target0)
    this.object.position.copy(this.position0)
    this.object.zoom = this.zoom0
    this.object.updateProjectionMatrix()
    this.dispatchEvent(A)
    this.update()
  }
  this.dispose = function() {
    this.domElement.removeEventListener('contextmenu', onContextMenu, false)
    this.domElement.removeEventListener('mousedown', onMouseDown, false)
    this.domElement.removeEventListener('mousewheel', onMouseWheel, false)
    this.domElement.removeEventListener('MozMousePixelScroll', onMouseWheel, false)
    this.domElement.removeEventListener('touchstart', onTouchStart, false)
    this.domElement.removeEventListener('touchend', onTouchEnd, false)
    this.domElement.removeEventListener('touchmove', onTouchMove, false)
    document.removeEventListener('mousemove', onMouseMove, false)
    document.removeEventListener('mouseup', onMouseUp, false)
    window.removeEventListener('keydown', onKeyDown, false)
  }
  this.domElement.addEventListener('contextmenu', onContextMenu, false)
  this.domElement.addEventListener('mousedown', onMouseDown, false)
  this.domElement.addEventListener('mousewheel', onMouseWheel, false)
  this.domElement.addEventListener('MozMousePixelScroll', onMouseWheel, false)
  this.domElement.addEventListener('touchstart', onTouchStart, false)
  this.domElement.addEventListener('touchend', onTouchEnd, false)
  this.domElement.addEventListener('touchmove', onTouchMove, false)
  window.addEventListener('keydown', onKeyDown, false)
  this.update()
}

CameraController.prototype = Object.create(THREE.EventDispatcher.prototype)
CameraController.prototype.constructor = CameraController
CameraController.prototype.onMouseDown = function() {}
CameraController.prototype.onMouseMove = function() {}
CameraController.prototype.onMouseUp = function() {}
Object.defineProperties(CameraController.prototype, {
  object: {
    get: function() {
      return this.constraint.object
    }
  },
  target: {
    get: function() {
      return this.constraint.target
    },
    set: function(t) {
      console.warn('OrbitControls: target is now immutable. Use target.set() instead.')
      this.constraint.target.copy(t)
    }
  },
  minDistance: {
    get: function() {
      return this.constraint.minDistance
    },
    set: function(t) {
      this.constraint.minDistance = t
    }
  },
  maxDistance: {
    get: function() {
      return this.constraint.maxDistance
    },
    set: function(t) {
      this.constraint.maxDistance = t
    }
  },
  minZoom: {
    get: function() {
      return this.constraint.minZoom
    },
    set: function(t) {
      this.constraint.minZoom = t
    }
  },
  maxZoom: {
    get: function() {
      return this.constraint.maxZoom
    },
    set: function(t) {
      this.constraint.maxZoom = t
    }
  },
  minPolarAngle: {
    get: function() {
      return this.constraint.minPolarAngle
    },
    set: function(t) {
      this.constraint.minPolarAngle = t
    }
  },
  maxPolarAngle: {
    get: function() {
      return this.constraint.maxPolarAngle
    },
    set: function(t) {
      this.constraint.maxPolarAngle = t
    }
  },
  minAzimuthAngle: {
    get: function() {
      return this.constraint.minAzimuthAngle
    },
    set: function(t) {
      this.constraint.minAzimuthAngle = t
    }
  },
  maxAzimuthAngle: {
    get: function() {
      return this.constraint.maxAzimuthAngle
    },
    set: function(t) {
      this.constraint.maxAzimuthAngle = t
    }
  },
  enableDamping: {
    get: function() {
      return this.constraint.enableDamping
    },
    set: function(t) {
      this.constraint.enableDamping = t
    }
  },
  dampingFactor: {
    get: function() {
      return this.constraint.dampingFactor
    },
    set: function(t) {
      this.constraint.dampingFactor = t
    }
  },
  noZoom: {
    get: function() {
      console.warn('OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.')
      return !this.enableZoom
    },
    set: function(t) {
      console.warn('OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.')
      this.enableZoom = !t
    }
  },
  noRotate: {
    get: function() {
      console.warn('OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.')
      return !this.enableRotate
    },
    set: function(t) {
      console.warn('OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.')
      this.enableRotate = !t
    }
  },
  noPan: {
    get: function() {
      console.warn('OrbitControls: .noPan has been deprecated. Use .enablePan instead.')
      return !this.enablePan
    },
    set: function(t) {
      console.warn('OrbitControls: .noPan has been deprecated. Use .enablePan instead.')
      this.enablePan = !t
    }
  },
  noKeys: {
    get: function() {
      console.warn('OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.')
      return !this.enableKeys
    },
    set: function(t) {
      console.warn('OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.')
      this.enableKeys = !t
    }
  },
  staticMoving: {
    get: function() {
      console.warn('OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.')
      return !this.constraint.enableDamping
    },
    set: function(t) {
      console.warn('OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.')
      this.constraint.enableDamping = !t
    }
  },
  dynamicDampingFactor: {
    get: function() {
      return this.constraint.dampingFactor
    },
    set: function(t) {
      console.warn('OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.')
      this.constraint.dampingFactor = t
    }
  }
})
export default CameraController
