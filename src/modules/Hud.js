/**
 * 55: 材质选择平视仪（head-up display）。
 */
import Events from './Events'
import ResourceManager from './ResourceManager'
import HudPanel from './HudPanel'
import MaterialSelector from './MaterialSelector'
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

class Hud extends Events {
  constructor(params) {
    super()
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -1e4, 1e4)
    this.width = this.camera.right - this.camera.left
    this.height = this.camera.top - this.camera.bottom
    this.size = {
      width: this.width,
      height: this.height
    }
    this.maxScale = 0.05 * this.width
    this.scene.add(this.camera)
    this.camera.position.set(0, 0, 1e3)
    this.camera.lookAt(this.scene.position)
    this.palettes = {}
    this.pickables = []
    this.createPalettes(params.scene, params.configurables, params.vr)
    this.hideAllPalettes()
    this.createPanels(params.scene, params.configurables, params.vr)
    this.visible = false
  }
  createPanels(t, e, hideGrandient) {
    var gradientMap = ResourceManager.getTexture('static/textures/corner-gradient.png')
    this.panels = {}
    _.each(e, function(e) {
      var panelObject = t.getObjectByName('ui_panel').clone(),
        panel = new HudPanel({
          referenceObject: panelObject,
          data: e.panel_data,
          hudSize: {
            width: this.width,
            height: this.height
          },
          gradientMap: gradientMap,
          showGradient: !hideGrandient
        })
      this.scene.add(panel)
      panel.visible = false
      this.panels[e.name] = panel
    }.bind(this), this)
  }
  createPalettes(scene, configurables, vr) {
    configurables.forEach(function(configurable) {
      var name = configurable.name
      var object = scene.getObjectByName(name)
      var materials = this.getMaterialsForObject(object)
      var materialSelector = new MaterialSelector({
        hudSize: this.size,
        maxScale: this.maxScale,
        materials: materials,
        exposureBoost: !vr
      })
      this.palettes[name] = materialSelector
      this.scene.add(materialSelector)
      console.log(`${name} 已加入场景`)
      materialSelector.children.forEach(function(pickable) {
        this.pickables.push(pickable)
      }.bind(this), this)
      materialSelector.name = name + '_palette'
    }.bind(this), this)
  }
  getMaterialsForObject(object) {
    if (object) {
      var materials = object.getObjectByName('materials')
      if (materials) {
        return _.map(materials.children, function(material) {
          return material.material
        })
      }
    }
  }
  showAllPalettes(t) {
    _.each(this.palettes, function(palette) {
      palette.show(t)
    }, this)
  }
  hideAllPalettes() {
    _.each(this.palettes, function(t) {
      t.hide()
    }, this)
    this.currentPalette = null
  }
  showAllPanels() {
    _.each(this.panels, function(t) {
      t.show(false)
    }, this)
  }
  hideAllPanels() {
    _.each(this.panels, function(t) {
      t.hide()
    }, this)
  }
  setPanel(t, e) {
    this.currentPanel && this.currentPanel.fadeOut()
    this.currentPanel = this.panels[t]
    this.currentPanel.show(e)
  }
  setPalette(t, e) {
    var n = function() {
      this.currentPalette && this.currentPalette.show()
    }.bind(this)
    this.currentPalette ? this.currentPalette.fadeOut() : this.hideAllPalettes()
    this.currentPalette = this.palettes[t]
    e ? setTimeout(n, e) : n()
  }
  getPickables() {
    return this.pickables
  }
  show() {
    this.visible = true
  }
  hide() {
    this.currentPalette.fadeOut(function() {
      this.visible = false
      this.currentPalette = null
    }.bind(this))
    this.currentPanel.fadeOut(function() {
      this.currentPanel = null
    }.bind(this))
  }
  enter(t) {
    var e = t.tweenValue
    t.tween.reset(e).to({
      scale: 1.2 * this.maxScale
    },
    250).easing(window.TWEEN.Easing.Quartic.Out).onUpdate(function() {
      t.scale.set(e.scale, e.scale, e.scale)
    }).start()
    this.hoveredObject = t
  }
  leave(t) {
    var e = t.tweenValue
    t.tween.reset(e).to({
      scale: this.maxScale
    }, 250).easing(window.TWEEN.Easing.Quartic.Out).onUpdate(function() {
      t.scale.setScalar(e.scale)
    }).start()
    this.hoveredObject = null
  }
  select(n) {
    var t = new window.TWEEN.Tween(),
      e = {
        scale: 1,
        opacity: 0.35
      }
    n.current || (_.includes(this.currentPalette.children, n) && this.trigger('selectMaterial', this.currentPalette.children.indexOf(n)), t.reset(e).to({
      scale: 1.3,
      opacity: 0
    }, 400).easing(window.TWEEN.Easing.Quadratic.Out).onUpdate(function() {
      n.ripple.scale.set(e.scale, e.scale, e.scale)
      n.ripple.material.opacity = e.opacity
    }).onComplete(function() {
      e.scale = 1.05
      e.opacity = 0.35
    }).start())
  }
  render(webglRenderer) {
    this.visible && webglRenderer.render(this.scene, this.camera)
  }
  update(t) {
    this.hoveredObject && (this.hoveredObject.rotation.y += t.delta)
  }
  setCurrent(t) {
    var e = this.currentPalette.children[t]
    this.currentPalette.children.forEach(function(t) {
      t.current = false
      t.stroke.visible = false
    })
    e.current = true
    e.stroke.visible = true
    this.currentPanel.setMaterial(t)
  }
  resize() {
    this.camera.left = window.innerWidth / -2
    this.camera.right = window.innerWidth / 2
    this.camera.top = window.innerHeight / 2
    this.camera.bottom = window.innerHeight / -2
    this.camera.updateProjectionMatrix()
    this.size.width = this.camera.right - this.camera.left
    this.size.height = this.camera.top - this.camera.bottom
    this.maxScale = this.size.width > this.size.height ? 0.05 * this.size.width : 0.05 * this.size.height
    _.invoke(this.panels, 'resize', this.size)
    _.invoke(this.palettes, 'resize', this.size, this.maxScale)
  }
}

export default Hud
