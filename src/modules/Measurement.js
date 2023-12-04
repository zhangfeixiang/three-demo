/**
 * 50
 */

function Measurement(t, e) {
  this.set(t, e)
}
Measurement.prototype.set = function(t, e) {
  this.sample = t
  this.timestampS = e
}
Measurement.prototype.copy = function(t) {
  this.set(t.sample, t.timestampS)
}

export default Measurement
