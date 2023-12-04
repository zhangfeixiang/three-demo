/**
 * 48: 传感器
 */
import THREE from './../../static/js/three.min.js'
import PredictionTimeS from './PredictionTime'
import Filter from './Filter'
import PosePredictor from './PosePredictor'
import TouchPanner from './TouchPanner'
import Util from './Util'

var l = new THREE.Quaternion()

function Sensor(dom) {
  this.deviceId = 'webvr-polyfill:fused'
  this.deviceName = 'VR Position Device (webvr-polyfill:fused)'
  this.accelerometer = new THREE.Vector3()
  this.gyroscope = new THREE.Vector3()
  window.addEventListener('devicemotion', this.onDeviceMotionChange_.bind(this))
  window.addEventListener('orientationchange', this.onScreenOrientationChange_.bind(this))
  this.filter = new Filter(PredictionTimeS.K_FILTER)
  this.posePredictor = new PosePredictor(PredictionTimeS.PREDICTION_TIME_S)
  this.touchPanner = new TouchPanner(dom)
  this.filterToWorldQ = new THREE.Quaternion()
  Util.isIOS() ? this.filterToWorldQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2) : this.filterToWorldQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  this.inverseWorldToScreenQ = new THREE.Quaternion()
  this.worldToScreenQ = new THREE.Quaternion()
  this.originalPoseAdjustQ = new THREE.Quaternion()
  this.originalPoseAdjustQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -window.orientation * Math.PI / 180)
  this.setScreenTransform_()
  Util.isLandscapeMode() && this.filterToWorldQ.multiply(this.inverseWorldToScreenQ)
  this.resetQ = new THREE.Quaternion()
  this.isFirefoxAndroid = Util.isFirefoxAndroid()
  this.isIOS = Util.isIOS()
}

Sensor.prototype.getOrientation = function() {
  var t = new THREE.Quaternion(),
    e = l.slerp(this.filter.getOrientation(), 0.5)
  this.predictedQ = this.posePredictor.getPrediction(e, this.gyroscope, this.previousTimestampS)
  t.copy(this.filterToWorldQ)
  t.multiply(this.resetQ)
  PredictionTimeS.TOUCH_PANNER_DISABLED || t.multiply(this.touchPanner.getOrientation())
  t.multiply(this.predictedQ)
  t.multiply(this.worldToScreenQ)
  PredictionTimeS.YAW_ONLY && (t.x = 0, t.z = 0, t.normalize())
  return t
}
Sensor.prototype.resetPose = function() {
  this.resetQ.copy(this.filter.getOrientation())
  this.resetQ.x = 0
  this.resetQ.y = 0
  this.resetQ.z *= -1
  this.resetQ.normalize()
  Util.isLandscapeMode() && this.resetQ.multiply(this.inverseWorldToScreenQ)
  this.resetQ.multiply(this.originalPoseAdjustQ)
  PredictionTimeS.TOUCH_PANNER_DISABLED || this.touchPanner.resetSensor()
}
Sensor.prototype.onDeviceMotionChange_ = function(t) {
  var e = t.accelerationIncludingGravity,
    n = t.rotationRate,
    i = t.timeStamp / 1e3
  this.isFirefoxAndroid && (i /= 1e3)
  var r = i - this.previousTimestampS
  if (r <= Util.MIN_TIMESTEP || r > Util.MAX_TIMESTEP) {
    console.warn('Invalid timestamps detected. Time step between successive gyroscope sensor samples is very small or not monotonic')
    this.previousTimestampS = i
  } else {
    this.accelerometer.set(-e.x, -e.y, -e.z)
    this.gyroscope.set(n.alpha, n.beta, n.gamma)
    if (this.isIOS || this.isFirefoxAndroid) this.gyroscope.multiplyScalar(Math.PI / 180)
    this.filter.addAccelMeasurement(this.accelerometer, i)
    this.filter.addGyroMeasurement(this.gyroscope, i)
    this.previousTimestampS = i
  }
  // return r <= Util.MIN_TIMESTEP || r > Util.MAX_TIMESTEP ? (console.warn('Invalid timestamps detected. Time step between successive gyroscope sensor samples is very small or not monotonic'), this.previousTimestampS = i) : (this.accelerometer.set(-e.x, -e.y, -e.z), this.gyroscope.set(n.alpha, n.beta, n.gamma), (this.isIOS || this.isFirefoxAndroid) && this.gyroscope.multiplyScalar(Math.PI / 180), this.filter.addAccelMeasurement(this.accelerometer, i), this.filter.addGyroMeasurement(this.gyroscope, i), this.previousTimestampS = i)
}
Sensor.prototype.onScreenOrientationChange_ = function(t) {
  this.setScreenTransform_()
}
Sensor.prototype.setScreenTransform_ = function() {
  this.worldToScreenQ.set(0, 0, 0, 1)
  switch (window.orientation) {
    case 0:
      break
    case 90:
      this.worldToScreenQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2)
      break
    case -90 : this.worldToScreenQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
      break
    case 180:
  }
  this.inverseWorldToScreenQ.copy(this.worldToScreenQ)
  this.inverseWorldToScreenQ.inverse()
}

export default Sensor
