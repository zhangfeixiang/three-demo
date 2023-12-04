// 46: ?
import THREE from './../../static/js/three.min.js'
import Measurement from './Measurement'
import Util from './Util'

var a = false

function Filter(kFilter) {
  this.kFilter = kFilter
  this.currentAccelMeasurement = new Measurement()
  this.currentGyroMeasurement = new Measurement()
  this.previousGyroMeasurement = new Measurement()
  Util.isIOS() ? this.filterQ = new THREE.Quaternion(-1, 0, 0, 1) : this.filterQ = new THREE.Quaternion(1, 0, 0, 1)
  this.previousFilterQ = new THREE.Quaternion()
  this.previousFilterQ.copy(this.filterQ)
  this.accelQ = new THREE.Quaternion()
  this.isOrientationInitialized = false
  this.estimatedGravity = new THREE.Vector3()
  this.measuredGravity = new THREE.Vector3()
  this.gyroIntegralQ = new THREE.Quaternion()
}

Filter.prototype.addAccelMeasurement = function(t, e) {
  this.currentAccelMeasurement.set(t, e)
}
Filter.prototype.addGyroMeasurement = function(t, e) {
  this.currentGyroMeasurement.set(t, e)
  var n = e - this.previousGyroMeasurement.timestampS
  Util.isTimestampDeltaValid(n) && this.run_()
  this.previousGyroMeasurement.copy(this.currentGyroMeasurement)
}
Filter.prototype.run_ = function() {
  if (!this.isOrientationInitialized) {
    this.accelQ = this.accelToQuaternion_(this.currentAccelMeasurement.sample)
    this.previousFilterQ.copy(this.accelQ)
  }
  var t = this.currentGyroMeasurement.timestampS - this.previousGyroMeasurement.timestampS,
    e = this.gyroToQuaternionDelta_(this.currentGyroMeasurement.sample, t)
  this.gyroIntegralQ.multiply(e)
  this.filterQ.copy(this.previousFilterQ)
  this.filterQ.multiply(e)
  var n = new THREE.Quaternion()
  n.copy(this.filterQ)
  n.inverse()
  this.estimatedGravity.set(0, 0, -1)
  this.estimatedGravity.applyQuaternion(n)
  this.estimatedGravity.normalize()
  this.measuredGravity.copy(this.currentAccelMeasurement.sample)
  this.measuredGravity.normalize()
  var i = new THREE.Quaternion()
  i.setFromUnitVectors(this.estimatedGravity, this.measuredGravity)
  i.inverse()
  a && console.log('Delta: %d deg, G_est: (%s, %s, %s), G_meas: (%s, %s, %s)', THREE.Math.radToDeg(Util.getQuaternionAngle(i)), this.estimatedGravity.x.toFixed(1), this.estimatedGravity.y.toFixed(1), this.estimatedGravity.z.toFixed(1), this.measuredGravity.x.toFixed(1), this.measuredGravity.y.toFixed(1), this.measuredGravity.z.toFixed(1))
  var r = new THREE.Quaternion()
  r.copy(this.filterQ)
  r.multiply(i)
  this.filterQ.slerp(r, 1 - this.kFilter)
  this.previousFilterQ.copy(this.filterQ)
}
Filter.prototype.getOrientation = function() {
  return this.filterQ
}
Filter.prototype.accelToQuaternion_ = function(t) {
  var e = new THREE.Vector3()
  e.copy(t)
  e.normalize()
  var n = new THREE.Quaternion()
  n.setFromUnitVectors(new THREE.Vector3(0, 0, -1), e)
  n.inverse()
  return n
}
Filter.prototype.gyroToQuaternionDelta_ = function(t, e) {
  var n = new THREE.Quaternion(), i = new THREE.Vector3()
  i.copy(t)
  i.normalize()
  n.setFromAxisAngle(i, t.length() * e)
  return n
}

export default Filter
