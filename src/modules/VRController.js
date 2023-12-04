// 7: VR 控制器
import THREE from './../../static/js/three.min.js'

var VRController = function(t, e) {
  var i, r, o = this,
    a = new THREE.Matrix4(),
    s = null,
    c = (new THREE.Vector3()).setFromMatrixPosition(t.matrixWorld),
    u = t.quaternion.clone(),
    l = new THREE.Vector3(),
    h = new THREE.Quaternion(),
    f = new THREE.Vector3()

  function n(t) {
    r = t
    t.length > 0 ? i = t[0] : e && e('VR input not available.')
  }

  if ('VRFrameData' in window && (s = new window.VRFrameData())) {
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then(n)['catch'](function() {
        console.warn('THREE.VRControls: Unable to get VR Displays')
      })
    }
  }
  this.scale = 1
  this.standing = false
  this.userHeight = 1.6
  this.getVRDisplay = function() {
    return i
  }
  this.setVRDisplay = function(t) {
    i = t
  }
  this.getVRDisplays = function() {
    console.warn('THREE.VRControls: getVRDisplays() is being deprecated.')
    return r
  }
  this.getStandingMatrix = function() {
    return a
  }
  this.setPosition = function(t) {
    c.setFromMatrixPosition(t.matrixWorld)
    if (s.pose.position) {
      f.set(s.pose.position[0], s.pose.position[1], s.pose.position[2])
      c.sub(f)
    }
  }
  this.getPosition = function() {
    return c
  }
  this.setOrientation = function(t) {
    u.copy(t.quaternion)
  }
  this.getOrientation = function(t) {
    return u
  }
  this.hasInput = function() {
    return s !== null
  }
  this.update = function() {
    if (i) {
      var e
      if (i.getFrameData) {
        i.getFrameData(s)
        e = s.pose
      } else {
        i.getPose && (e = i.getPose())
      }
      if (e.orientation !== null) {
        h.fromArray(e.orientation)
        t.quaternion.multiplyQuaternions(u, h).normalize()
      }
      if (e.position !== null) {
        l.fromArray(e.position)
        l.applyQuaternion(u)
        t.position.addVectors(c, l)
      } else {
        t.position.set(0, 0, 0)
      }
      if (this.standing) {
        if (i.stageParameters) {
          t.updateMatrix()
          a.fromArray(i.stageParameters.sittingToStandingTransform)
          t.applyMatrix(a)
        } else {
          t.position.setY(t.position.y + this.userHeight)
        }
      }
      t.position.multiplyScalar(o.scale)
    }
  }
  this.resetPose = function() {
    i && i.resetPose()
  }
  this.resetSensor = function() {
    console.warn('THREE.VRControls: .resetSensor() is now .resetPose().')
    this.resetPose()
  }
  this.zeroSensor = function() {
    console.warn('THREE.VRControls: .zeroSensor() is now .resetPose().')
    this.resetPose()
  }
  this.dispose = function() {
    i = null
  }
}

export default VRController
