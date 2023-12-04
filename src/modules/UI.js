// 66: 启动场景操作说明、HUD抬头显、地面走路标记
import jQuery from 'jquery'
import Events from './Events'
import ResourceManager from './ResourceManager'
import TweenUtils from './TweenUtils'
import StrokeShaderMaterial from './StrokeShaderMaterial'
import THREE from './../../static/js/three.min.js'

var $ = jQuery
class UI extends Events {
  constructor(params) {
    super()
    this.scene = params.scene
    this.camera = params.camera
    this.configurables = params.configurables
    this.$container = params.container
    this.vr = params.vr
    this.$lookInstructions = $('[data-ref="look_instructions"]') // PC拖拽查看说明
    this.$moveInstructions = $('[data-ref="move_instructions"]') // 手机移动说明
    this.$materialInstructions = $('[data-ref="material_instructions"]') // 材质选择说明
    this.tweens = {
      marker: new window.TWEEN.Tween()
    }
    this.values = {
      markerOpacity: 1
    }
    this.initStrokes()
    this.initMarker()
    this.vr && this.initVRInstructions()
  }

  // 初始化VR用法说明
  initVRInstructions() {
    this.VRMoveInstructions = this.scene.getObjectByName('move_instructions')
    if (this.VRMoveInstructions) {
      this.VRMoveInstructions.position.z = -0.75
      this.VRMoveInstructions.position.y = -0.25
      this.camera.add(this.VRMoveInstructions)
    }
    this.VRConfigureInstructions = this.scene.getObjectByName('configure_instructions')
    if (this.VRConfigureInstructions) {
      this.VRConfigureInstructions.position.z = -0.75
      this.VRConfigureInstructions.position.y = -0.25
      this.camera.add(this.VRConfigureInstructions)
    }
  }

  initStrokes() {
    this.configurables.forEach(function(configurable) {
      var name = configurable.name,
        mesh = this.scene.getObjectByName(name),
        strokeMesh = this.scene.getObjectByName(mesh.name + '_stroke'),
        hoverGroupMesh = this.scene.getObjectByName('hovergroup_' + name)
      if (strokeMesh === void 0) {
        return void console.warn('Missing stroke mesh for ' + name)
      } else {
        strokeMesh.renderOrder = 1
        if (hoverGroupMesh) {
          hoverGroupMesh.traverse(function(hoverMesh) {
            hoverMesh.renderOrder = 2
          })
          mesh.group = hoverGroupMesh
        } else {
          mesh.traverse(function(subMesh) {
            subMesh.renderOrder = 2
          })
        }
        mesh.add(strokeMesh)
        strokeMesh.position.set(0, 0, 0)
        strokeMesh.rotation.set(0, 0, 0)
        strokeMesh.scale.set(1, 1, 1)
        strokeMesh.material = new StrokeShaderMaterial()
        strokeMesh.material.objectScale = mesh.scale.x
        mesh.stroke = strokeMesh
      }
    }.bind(this), this)
  }

  highlightObject(mesh) {
    mesh.stroke.visible = true
    this.currentHighlighted = mesh
    this.onEnterObject()
    if (this.vr) {
      this.VRConfigureInstructions && (this.VRConfigureInstructions.visible = true)
      this.VRMoveInstructions && (this.VRMoveInstructions.visible = false)
    }
  }

  clearHighlight() {
    if (this.currentHighlighted) {
      this.currentHighlighted.stroke.visible = false
      this.currentHighlighted = null
    }
    this.onLeaveObject()
    this.vr && this.VRConfigureInstructions && (this.VRConfigureInstructions.visible = false)
  }

  onEnterObject() {
    this.$container.addClass('hovering')
  }

  onLeaveObject() {
    this.$container.removeClass('hovering')
  }

  // 初始化选中标记
  initMarker() {
    this.marker = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4, 1, 1), new THREE.MeshBasicMaterial({
      color: 16777215,
      map: ResourceManager.getTexture('static/textures/marker.png'),
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    }))
    this.marker.material.map.anisotropy = 16
    this.scene.add(this.marker)
    var markerMeshMaterial = this.marker.clone()
    markerMeshMaterial.material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: ResourceManager.getTexture('static/textures/circle.png'),
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending
    })
    this.marker.add(markerMeshMaterial)
    this.marker.ripple = markerMeshMaterial
    this.marker.rotation.x = -Math.PI / 2
    this.marker.position.setY(0.05)
    this.marker.visible = true
    this.hideMarker()
  }

  freezeMarker() {
    this.marker.frozen = true
  }

  unfreezeMarker() {
    this.marker.frozen = false
  }

  updateMarker(marker) {
    if (marker) {
      this.marker.position.x = marker.x
      this.marker.position.z = marker.z
    }
    this.marker.visible && !this.$container.hasClass('hovering') && this.$container.addClass('hovering')
  }

  showMarker() {
    this.marker.visible = true
    this.$container.addClass('hovering')
    this.vr && this.VRMoveInstructions && (this.VRMoveInstructions.visible = true)
  }

  hideMarker() {
    this.marker.visible = false
    this.$container.removeClass('hovering')
  }

  fadeInMarker() {
    this.tweens.marker.reset(this.values).to({
      markerOpacity: 1
    },
    500).easing(window.TWEEN.Easing.Quadratic.Out).onUpdate(function() {
      this.marker.material.opacity = this.values.markerOpacity
    }.bind(this)).start()
  }

  fadeOutMarker() {
    this.tweens.marker.reset(this.values).to({
      markerOpacity: 0
    }, 300).easing(window.TWEEN.Easing.Quadratic.Out).onUpdate(function() {
      this.marker.material.opacity = this.values.markerOpacity
    }.bind(this)).start()
  }

  activateMarker() {
    TweenUtils.tween(500, window.TWEEN.Easing.Quadratic.Out).onUpdate(function(t) {
      this.marker.material.opacity = 0.5 + 0.5 * (1 - t)
      this.marker.ripple.material.opacity = 1 - t
      this.marker.ripple.scale.set(1 + t / 2, 1 + t / 2, 1 + t / 2)
    }.bind(this))
  }

  showMaterialInstructions() {
    this.$materialInstructions.addClass('visible')
  }

  hideMaterialInstructions() {
    this.$materialInstructions.addClass('fadeout')
    setTimeout(function() {
      this.$materialInstructions.removeClass('fadeout visible')
      this.$materialInstructions.hide()
    }.bind(this), 500)
  }

  showLookInstructions() {
    this.$lookInstructions.addClass('visible')
  }

  hideLookInstructions() {
    this.$lookInstructions.addClass('fadeout')
    setTimeout(function() {
      this.$lookInstructions.removeClass('fadeout visible')
      this.$lookInstructions.hide()
    }.bind(this), 500)
  }

  hideConfigureInstructions() {
    if (this.vr && this.VRConfigureInstructions) {
      this.camera.remove(this.VRConfigureInstructions)
      this.VRConfigureInstructions = null
    }
  }

  showMoveInstructions() {
    this.$moveInstructions.addClass('visible')
  }

  hideMoveInstructions() {
    this.$moveInstructions.addClass('fadeout')
    setTimeout(function() {
      this.$moveInstructions.removeClass('fadeout visible')
      this.$moveInstructions.hide()
    }.bind(this), 500)
    if (this.vr && this.VRMoveInstructions) {
      this.camera.remove(this.VRMoveInstructions)
      this.VRMoveInstructions = null
    }
  }

  update(marker) {
    this.marker.frozen || this.updateMarker(marker)
  }
}

export default UI
