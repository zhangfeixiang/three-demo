// 64: 材质选择器
import ResourceManager from './ResourceManager'
import THREE from './../../static/js/three.min.js'

class MaterialSelector extends THREE.Object3D {
  constructor(parameters) {
    super()
    this.strokeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
      transparent: true
    })
    this.rippleMaterial = this.strokeMaterial.clone()
    this.rippleMaterial.opacity = 0
    this.materials = parameters.materials
    this.itemCount = this.materials ? this.materials.length : 0
    this.maxScale = parameters.maxScale
    this.exposureBoost = parameters.exposureBoost
    this.initLayout(parameters.hudSize)
    return this
  }
  initLayout(params) {
    if (this.materials) {
      var isWide = params.width > params.height,
        width = isWide ? params.width * (0.125 * this.itemCount) : params.width * (0.16 * this.itemCount),
        height = 0.3 * -params.height
      this.materials.forEach(function(material, index) {
        var x = -(width / 2) + width / (this.itemCount - 1) * index,
          sphere = this.createSphere(x, height, material, 1)
        this.add(sphere)
        sphere.name = 'material_' + index
      }.bind(this), this)
      this.children[0].current = true
      this.children[0].stroke.visible = true
    }
  }
  resize(params, maxScale) {
    var isWide = params.width > params.height,
      width = isWide ? params.width * (0.125 * this.itemCount) : params.width * (0.16 * this.itemCount),
      height = isWide ? 0.3 * -params.height : 0.35 * -params.height
    this.maxScale = maxScale
    this.children.forEach(function(element, index) {
      var x = -(width / 2) + width / (this.itemCount - 1) * index
      element.position.setX(x)
      element.position.setY(height)
      element.scale.setScalar(this.maxScale)
      element.tweenValue.scale = this.maxScale
    }.bind(this), this)
  }
  createSphere(x, y, material, scalar) {
    // debugger
    // TODO: material.clone() 方法应该调用自定定义，实际呢？
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material.clone())
    mesh.scale.setScalar(scalar)
    var strokeMesh = mesh.clone(), rippleMesh = strokeMesh.clone()
    mesh.rotation.x = 0.25
    mesh.position.setX(x)
    mesh.position.setY(y)
    strokeMesh.scale.setScalar(1.05)
    strokeMesh.material = this.strokeMaterial
    mesh.add(strokeMesh)
    mesh.stroke = strokeMesh
    strokeMesh.visible = false
    mesh.ripple = rippleMesh
    rippleMesh.material = this.rippleMaterial
    strokeMesh.add(rippleMesh)
    mesh.material.transparent = true
    mesh.material.defines.USE_DIR_LIGHT = true
    var studioSH = ResourceManager.getSH('studio')
    mesh.material.uDiffuseSPH = new Float32Array(studioSH, 27)
    this.exposureBoost && (mesh.material.uEnvironmentExposure = 1.5)
    mesh.tween = new window.TWEEN.Tween()
    mesh.tweenValue = {
      scale: this.maxScale
    }
    mesh.material.defines.USE_AOMAP2 = false
    mesh.material.defines.USE_NORMALMAP2 = false
    return mesh
  }
  hide() {
    this.visible = false
    this.children.forEach(function(element) {
      element.pickable = false
    })
  }
  show(animate) {
    var scale = 1e-5
    animate = void 0 === animate ? true : animate
    this.children.forEach(function(child) {
      child.material.opacity = 1
      child.stroke.material.opacity = 1
    })
    if (animate) {
      this.visible = true
      this.children.forEach(function(child, index) {
        var params = {
          scale: scale
        }
        child.scale.set(scale, scale, scale)
        child.pickable = true
        setTimeout(function() {
          child.tween.reset(params).to({
            scale: child.tweenValue.scale
          }, 1000).easing(window.TWEEN.Easing.Elastic.Out).onUpdate(function() {
            this.hoveredObject !== child && child.scale.setScalar(params.scale)
          }.bind(this)).start()
        }.bind(this), 125 * index)
      }.bind(this))
    } else {
      this.visible = true
      this.children.forEach(function(child) {
        child.pickable = true
        child.scale.setScalar(this.maxScale)
      }.bind(this), this)
    }
  }
  fadeOut(callback) {
    var tween = new window.TWEEN.Tween()
    var params = {
      opacity: 1
    }
    tween.reset(params).to({
      opacity: 0
    }, 350).easing(window.TWEEN.Easing.Quadratic.Out).onUpdate(function(t) {
      this.children.forEach(function(child) {
        child.material.opacity = params.opacity
        child.stroke.material.opacity = params.opacity
      })
    }.bind(this)).onComplete(function() {
      params.opacity = 1
      this.children.forEach(function(child) {
        child.material.opacity = params.opacity
        child.stroke.material.opacity = params.opacity
      })
      this.hide()
      callback && callback()
    }.bind(this)).start()
  }
}

export default MaterialSelector
