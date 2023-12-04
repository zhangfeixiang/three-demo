// 5: 时间管理器
import _ from 'lodash'
import Timer from './Timer'

var TimerManager = {
  _timers: {}
}
TimerManager.createTimer = function(config) {
  var id = _.uniqueId('timer_')
  var timer = new Timer(config)
  timer.id = id
  TimerManager._timers[id] = timer
  return timer
}
TimerManager.delay = function(duration, e, n) {
  var timer = TimerManager.createTimer({
    duration: duration,
    onEnd: function() {
      e.call(n)
      delete TimerManager._timers[this.id]
    }
  }).start()
  return timer
}
TimerManager.updateTimers = function(params) {
  _.each(TimerManager._timers,
    function(timer) {
      timer.update(params)
    }
  )
}
TimerManager.clearTimers = function() {
  _.each(TimerManager._timers, function(timer) {
    timer.onEnd = null
  })
  TimerManager._timers = {}
}

export default TimerManager
