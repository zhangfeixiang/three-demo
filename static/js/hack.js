import _ from 'lodash'

Number.prototype.lerp = function(t, e) {
  return this + (t - this) * e
}

String.prototype.endsWith || (String.prototype.endsWith = function(t, e) {
  var n = this.toString(); (typeof e !== 'number' || !isFinite(e) || Math.floor(e) !== e || e > n.length) && (e = n.length)
  e -= t.length
  var i = n.indexOf(t, e)
  return i !== false && i === e
})

Function.prototype.inherit = function(t, e) {
  if (!t || !_.isFunction(t)) {
    throw String('parent argument must be a function')
  }
  this.prototype = _.extend(Object.create(t.prototype), e)
}

Function.prototype.mixin = function(t) {
  _.each(t,
  function(t, e) {
    void 0 === this.prototype[e] && (this.prototype[e] = t)
  },
  this)
}
