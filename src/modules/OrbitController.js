// 45: 相机漫游控制器
import CameraController from './CameraController'
import TimerManager from './TimerManager'

class OrbitController extends CameraController {
  constructor(camera, params) {
    super(camera, params.domElement)
    this.autoSpeed = params.autoSpeed
    this.autoDelay = params.autoDelay
    this.autoOrbitTimer = TimerManager.createTimer({
      duration: this.autoDelay,
      onEnd: function() {
        this.startAutoOrbit()
      }.bind(this)
    })
  }
  setTarget(t) {
    this.constraint.target.copy(t)
  }
  getTarget(t) {
    return this.constraint.target
  }
  startAutoOrbit(t) {
    var e = function() {
      this.autoRotateSpeed = this.autoSpeed
      this.autoRotate = true
      this.startTimeout = null
    }.bind(this)
    this.stopAutoOrbit()
    void 0 !== t ? this.startTimeout = setTimeout(e, t) : e()
  }
  stopAutoOrbit() {
    this.autoRotate = false
    this.autoOrbitTimer.reset()
  }
  onMouseMove() {
    this.stopAutoOrbit()
    this.autoOrbitTimer.start()
    this.startTimeout && clearTimeout(this.startTimeout)
  }
}

export default OrbitController
