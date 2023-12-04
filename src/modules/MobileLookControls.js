import Sensor from './Sensor'

function MobileLookControls(camera, dom) {
  this.camera = camera
  this.sensor = new Sensor(dom)
}
MobileLookControls.prototype = {}
MobileLookControls.prototype.update = function() {
  this.camera.quaternion.copy(this.sensor.getOrientation())
}
MobileLookControls.prototype.reset = function() {
  this.sensor.resetPose()
}
MobileLookControls.prototype.setOrientationFromCamera = function() {}
MobileLookControls.prototype.setRotationAngle = function(t) {
  this.sensor.touchPanner.setRotationAngle(t)
}

export default MobileLookControls
