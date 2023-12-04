// 65: 可替换材质描述（名称、尺寸、材质）
import CanvasDrawer from './CanvasDrawer'
import THREE from './../../static/js/three.min.js'

function createTexture(type) {
  var canvasDrawer = new CanvasDrawer(),
    canvas = canvasDrawer.canvas
  canvasDrawer.resize(512, 512)
  switch (type) {
    case 'name':
      canvasDrawer.draw(arguments[1], '96px "Microsoft YaHei"', 'white', 2)
      break
    case 'dimensions':
      canvasDrawer.draw(arguments[1], '24px "Microsoft YaHei"', 'white', 2)
      break
    case 'material':
      canvasDrawer.draw(arguments[1], '36px "Microsoft YaHei"', 'white', 2)
  }
  return new THREE.Texture(canvas)
}

function setTexture(texture, textureObj) {
  texture.offset.copy(textureObj.material.map.offset)
  texture.repeat.copy(textureObj.material.map.repeat)
  texture.wrapS = texture.WrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  textureObj.material.map = texture
  textureObj.material.needsUpdate = true
}

class HudPanel extends THREE.Object3D {
  constructor(parameters) {
    super()
    var data = parameters.data
    this.showGradient = parameters.showGradient
    this.gradientMap = parameters.gradientMap
    this.initLayout(parameters.referenceObject, parameters.hudSize)
    this.materialTextures = []
    var name = createTexture('name', data.type),
      dimensions = createTexture('dimensions', data.dimensions)
    data.materials.forEach(function(material) {
      var materialTexture = createTexture('material', material)
      this.materialTextures.push(materialTexture)
    }.bind(this), this)
    setTexture(name, this.nameObj)
    setTexture(dimensions, this.dimensionsObj)
    setTexture(this.materialTextures[0], this.materialObj)
    return this
  }
  initLayout(referenceObject, hudSize) {
    var isWide = hudSize.width > hudSize.height,
      i = isWide ? 0.075 * hudSize.height : 0.08 * hudSize.width,
      scalar = isWide ? hudSize.width / 1880 : hudSize.height / 1400,
      nameObj = referenceObject.getObjectByName('name'),
      lineObj = referenceObject.getObjectByName('line'),
      dimensionsObj = referenceObject.getObjectByName('dimensions'),
      materialObj = referenceObject.getObjectByName('material')
    this.innerContainer = new THREE.Object3D()
    this.innerContainer.position.set(hudSize.width * -0.5 + i, 0.5 * hudSize.height - i, 0)
    this.add(this.innerContainer)
    this.innerContainer.scale.setScalar(scalar)
    this.nameObj = this.addElement(nameObj, 0, 0)
    this.lineObj = this.addElement(lineObj, -205, 100)
    this.dimensionsObj = this.addElement(dimensionsObj, 0, 125)
    this.materialObj = this.addElement(materialObj, 0, 110)
    this.showGradient && this.initGradient(i)
    lineObj.children[0].material.polygonOffset = true
    lineObj.children[0].material.polygonOffsetFactor = -0.1
  }
  initGradient(i) {
    var material = new THREE.MeshBasicMaterial({
        transparent: true,
        map: this.gradientMap,
        opacity: 0
      }),
      gradientMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(512, 512, 1, 1), material)
    this.innerContainer.add(gradientMesh)
    gradientMesh.scale.setScalar((512 + i) / 512)
    gradientMesh.position.set(256 - i / 2, -256 + i / 2, 0)
    gradientMesh.renderOrder = 0
    this.gradient = gradientMesh
    this.gradient.maxOpacity = window.isMobile ? 0.2 : 0.3
    this.gradient.animation = {
      tween: new window.TWEEN.Tween(),
      opacity: 0
    }
  }
  resize(t) {
    var isWide = t.width > t.height,
      n = isWide ? 0.075 * t.height : 0.08 * t.width,
      scalar = isWide ? t.width / 1880 : t.height / 1400
    this.innerContainer.position.set(t.width * -0.5 + n, 0.5 * t.height - n, 0)
    this.innerContainer.scale.setScalar(scalar)
    this.gradient.scale.setScalar((512 + n) / 512)
    this.gradient.position.set(256 - n / 2, -256 + n / 2, 0)
  }
  show(animate) {
    animate = void 0 === animate ? true : animate
    this.visible = true
    this.innerContainer.visible = true
    if (animate) {
      this.nameObj.visible = false
      this.materialObj.visible = false
      this.dimensionsObj.visible = false
      this.animateLine()
      setTimeout(this.animateUpperElement.bind(this), 300)
      setTimeout(this.animateLowerElement.bind(this), 500)
    }
    this.showGradient && this.fadeInGradient()
  }
  fadeInGradient() {
    this.gradient.material.opacity = 0
    this.gradient.animation.opacity = 0
    var self = this
    this.gradient.animation.tween.reset(this.gradient.animation).to({
      opacity: this.gradient.maxOpacity
    }, 1000).onUpdate(function() {
      self.gradient.material.opacity = self.gradient.animation.opacity
    }).start()
  }
  fadeOutGradient() {
    this.gradient.animation.tween.reset(this.gradient.animation).to({
      opacity: 0
    }, 350).onUpdate(function() {
      this.gradient.material.opacity = this.gradient.animation.opacity
    }.bind(this)).start()
  }
  hide() {
    this.visible = !1
  }
  addElement(object, e, n) {
    var box3 = new THREE.Box3()
    this.add(object)
    box3.setFromObject(object)
    this.innerContainer.add(object)
    object.height = box3.max.y - box3.min.y
    object.width = box3.max.x - box3.min.x
    var r = -(object.height / this.scale.y / 2) - n,
      o = object.width / this.scale.x / 2 + e
    object.position.set(o, r, 0)
    if (object.material) {
      object.material = object.material.clone()
      object.material.depthTest = false
    }
    object.traverse(function(t) {
      t.renderOrder = 1
    })
    return object
  }
  setMaterial(material) {
    var tween = new window.TWEEN.Tween(),
      progress = 0,
      offset = 0,
      i = 200,
      o = {
        offset: offset,
        progress: progress
      }
    if (this.materialTween) {
      this.materialTween.onComplete(function() {
        o.offset = offset
        o.progress = progress
        this.innerContainer.remove(this.materialObj)
        this.materialObj = this.clone
        this.materialTween = null
        this.setMaterial(material)
      }.bind(this))
      return
    }

    var texture = this.materialTextures[material],
      materialClone = this.materialObj.clone()
    this.clone = materialClone
    this.innerContainer.add(materialClone)
    materialClone.position.copy(this.materialObj.position)
    materialClone.position.x -= i
    if (materialClone.material) {
      materialClone.material = materialClone.material.clone()
      materialClone.material.depthTest = false
    }
    materialClone.traverse(function(t) {
      t.renderOrder = 1
    })
    if (!texture) {
      console.warn('Missing material texture. Panel cannot display current material name.')
      return
    }
    setTexture(texture, materialClone)
    materialClone.material.opacity = 0
    var u = this.materialObj.position.x,
      l = materialClone.position.x,
      h = function() {
        o.offset = offset
        o.progress = progress
        this.innerContainer.remove(this.materialObj)
        this.materialObj = materialClone
        this.materialObj.position.setX(u + o.offset)
        this.materialTween = null
      }
    this.materialTween = tween.reset(o).to({
      offset: i
    }, 500).easing(window.TWEEN.Easing.Quadratic.InOut).onUpdate(function(t) {
      this.materialObj.position.setX(u + o.offset)
      materialClone.position.setX(l + o.offset)
      this.materialObj.material.opacity = 1 - t
      materialClone.material.opacity = t
    }.bind(this)).onComplete(h.bind(this)).onStop(h.bind(this)).start()
  }
  animateLine() {
    var tween = new window.TWEEN.Tween(),
      params = {
        x: 0
      }
    var line = this.lineObj,
      x = line.scale.x
    params.y = line.scale.y
    params.z = line.scale.z
    line.scale.setX(1e-5)
    tween.reset(params).to({
      x: x
    }, 1000).easing(window.TWEEN.Easing.Quartic.InOut).onUpdate(function() {
      line.scale.set(params.x, params.y, params.z)
    }).onComplete(function() {
      params.x = 1e-5
    }).start()
  }
  animateUpperElement() {
    var t = new window.TWEEN.Tween(),
      e = {
        offset: 1,
        opacity: 0
      }
    var n = this.nameObj,
      i = n.material.map,
      r = i.offset.y
    n.visible = true
    i.offset.setY(e.offset)
    t.reset(e).to({
      offset: r,
      opacity: 1
    }, 1000).easing(window.TWEEN.Easing.Quartic.InOut).onUpdate(function() {
      i.offset.setY(e.offset)
      n.material.opacity = e.opacity
    }).onComplete(function() {
      e.offset = 1
      e.opacity = 0
    }).start()
  }
  animateLowerElement() {
    var t = new window.TWEEN.Tween(),
      offset1 = 0.73,
      offset2 = 0.8,
      opacity = 0,
      params = {
        offset1: offset1,
        offset2: offset2,
        opacity: opacity
      }
    var materialObj = this.materialObj,
      materialMap = materialObj.material.map,
      materialOffset = materialMap.offset.y,
      dimensionsObj = this.dimensionsObj,
      dimensionMaterialMap = dimensionsObj.material.map,
      dimensionOffset = dimensionMaterialMap.offset.y
    materialObj.visible = true
    dimensionsObj.visible = true
    materialObj.material.opacity = 0
    dimensionsObj.material.opacity = 0
    materialMap.offset.setY(params.offset1)
    dimensionMaterialMap.offset.setY(params.offset2)
    t.reset(params).to({
      offset1: materialOffset,
      offset2: dimensionOffset,
      opacity: 1
    }, 1000).easing(window.TWEEN.Easing.Quartic.InOut).onUpdate(function() {
      materialMap.offset.setY(params.offset1)
      dimensionMaterialMap.offset.setY(params.offset2)
      materialObj.material.opacity = params.opacity
      dimensionsObj.material.opacity = params.opacity
    }).onComplete(function() {
      params.offset1 = offset1
      params.offset2 = offset2
      params.opacity = opacity
    }).start()
  }
  fadeOut(callback) {
    var tween = new window.TWEEN.Tween(),
      params = {
        opacity: 1
      }
    tween.reset(params).to({
      opacity: 0
    }, 350).easing(window.TWEEN.Easing.Quadratic.Out).onUpdate(function(t) {
      this.traverse(function(t) {
        t.material && (t.material.opacity = params.opacity)
      })
    }.bind(this)).onComplete(function() {
      params.opacity = 1
      this.traverse(function(t) {
        t.material && (t.material.opacity = params.opacity)
      })
      this.hide()
      callback && callback()
    }.bind(this)).start()
    this.materialTween && this.materialTween.stop()
    this.showGradient && this.fadeOutGradient()
  }
}

export default HudPanel
