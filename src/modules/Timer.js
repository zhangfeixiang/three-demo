// 4: 计时器
import _ from 'lodash'

class Timer {
  constructor(config) {
    config = _.extend({}, {
      duration: 1000,
      repeat: false,
      onStart: function() {},
      onEnd: function() {}
    }, config)
    this.duration = config.duration
    this.repeat = config.repeat
    this.startCallback = config.onStart
    this.endCallback = config.onEnd
    this.reset()
  }

  reset() {
    this.started = false
    this.paused = false
    this.ended = false
    this.elapsedTime = 0
    return this
  }

  start() {
    if (this.started) {
      return true
    } else if (this.ended) {
      return this
    } else {
      this.started = true
      this.startCallback()
      return this
    }
  }

  stop() {
    return this.started ? this.reset() : this
  }

  pause() {
    this.paused = true
    return this
  }

  resume() {
    this.paused = false
    return this
  }

  update(t) {
    if (!this.started) {
      return true
    } else if (this.paused) {
      return true
    } else if (this.ended) {
      return this
    } else {
      this.elapsedTime += 1000 * t.delta
      if (t.elapsedTime > this.duration) {
        this.endCallback()
        this.ended = true
      }
      return this
    }
  }
}

export default Timer
