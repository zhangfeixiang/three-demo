/**
 * 56: 输入法管理器。
 */
import Events from './Events'
import jQuery from 'jquery'
import _ from 'lodash'

class InputManager extends Events {
  constructor() {
    super()
    this.shouldPoll = true
    this.buttonPressed = null
    jQuery(document).on('keypress', function(event) {
      event.keyCode === 32 && this.trigger('press')
    }).bind(this)
  }
  poll() {
    this.shouldPoll && (this.gamepads = navigator.getGamepads())
  }
  update() {
    this.poll()
    _.each(this.gamepads, function(t) {
      if (t) {
        for (var i = 0; i < t.buttons.length; i++) {
          var button = t.buttons[i]
          if (button.pressed) {
            this.buttonPressed = i
          } else {
            if (this.buttonPressed != null && this.buttonPressed === i) {
              this.trigger('press')
              this.buttonPressed = null
            }
          }
        }
      }
    }, this)
  }
}

export default InputManager
