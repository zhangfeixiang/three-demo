/**
 * 19: Tween动画
 */
var TweenUtils = {}
TweenUtils.tween = function(delay, effort) {
  var tween = new window.TWEEN.Tween({
    progress: 0
  })
  tween.to({
    progress: 1
  }, delay).easing(void 0 !== effort ? effort : window.TWEEN.Easing.Linear.None).start()
  return tween
}
export default TweenUtils
