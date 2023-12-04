// 8: 球体网格（支持渐进渐出动画）
import THREE from './../../static/js/three.min.js'

class SphereMesh extends THREE.Mesh {
  constructor() {
    super(new THREE.SphereGeometry(0.005, 25, 25), new THREE.MeshBasicMaterial({
      color: 16777215,
      opacity: 1,
      transparent: true,
      depthTest: false
    }))
    this.position.z = -0.5
    this.tween = new window.TWEEN.Tween()
    this.values = {
      opacity: 1,
      scale: 1
    }
  }
  fadeIn() {
    if (this.faded) {
      var values = this.values
      this.tween.reset(values).to({
        opacity: 1,
        scale: 1
      }, 750).easing(window.TWEEN.Easing.Cubic.InOut).onUpdate(function() {
        this.material.opacity = values.opacity
        this.scale.set(values.scale, values.scale, values.scale)
      }).bind(this).start()
      this.faded = false
    }
  }
  fadeOut() {
    if (!this.faded) {
      var values = this.values
      this.tween.reset(values).to({
        opacity: 0,
        scale: 0.7
      }, 400).easing(window.TWEEN.Easing.Cubic.InOut).onUpdate(function() {
        this.material.opacity = values.opacity
        this.scale.set(values.scale, values.scale, values.scale)
      }).bind(this).start()
      this.faded = true
    }
  }
}

export default SphereMesh
