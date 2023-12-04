/**
 * 49
 */
import THREE from './../../static/js/three.min.js'

function PosePredictor(predictionTimeS) {
  this.predictionTimeS = predictionTimeS
  this.previousQ = new THREE.Quaternion()
  this.previousTimestampS = null
  this.deltaQ = new THREE.Quaternion()
  this.outQ = new THREE.Quaternion()
}
var r = false
PosePredictor.prototype.getPrediction = function(t, e, n) {
  if (!this.previousTimestampS) {
    this.previousQ.copy(t)
    this.previousTimestampS = n
    return t
  }
  var vector3 = new THREE.Vector3()
  vector3.copy(e)
  vector3.normalize()
  var o = e.length()
  if (o < THREE.Math.degToRad(20)) {
    r && console.log('Moving slowly, at %s deg/s: no prediction', THREE.Math.radToDeg(o).toFixed(1))
    this.outQ.copy(t)
    this.previousQ.copy(t)
    return this.outQ
  }
  var a = (n - this.previousTimestampS, o * this.predictionTimeS)
  this.deltaQ.setFromAxisAngle(vector3, a)
  this.outQ.copy(this.previousQ)
  this.outQ.multiply(this.deltaQ)
  this.previousQ.copy(t)
  this.previousTimestampS = n
  return this.outQ
}

export default PosePredictor
