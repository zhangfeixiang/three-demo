// 36: 场景管理器业务类
import _ from 'lodash'
import THREE from './../../static/js/three.min.js'
import BaseSceneManager from './BaseSceneManager'
import SphereMesh from './SphereMesh'
import ResourceManager from './ResourceManager'
import TweenUtils from './TweenUtils'
import VREffect from './VREffect'
import Config from './Config'
import Configurables from './Configurables'
import Hud from './Hud'
import InputManager from './InputManager'
import MaterialManager from './MaterialManager'
import Camera from './Camera'
import ObjectPicker from './ObjectPicker'
import BasicShaderMaterial from './BasicShaderMaterial'
import HighlightsShaderMaterial from './HighlightsShaderMaterial'
import Noise from './Noise'
import UI from './UI'
import WaterNormalsMesh from './WaterNormalsMesh'
import jQuery from 'jquery'

var $ = jQuery

// 在场景中找到指定名称的一组对象
function findObjectsInScene(scene, name) {
  var result = []
  scene.traverse(function(object) {
    object.name === name && result.push(object)
  })
  return result
}
function isContain(object) {
  return _.includes(_.map(Configurables, function(configurable) {
    return configurable.name
  }), object.name)
}

// 计算鼠标点击位置
function calcMousePosition(event, containerOffset, containerWidth, containerHeight) {
  var xOffset = event.pageX - containerOffset.x,
    yOffset = event.pageY - containerOffset.y,
    coords = {
      x: xOffset / containerWidth * 2 - 1,
      y: 1 - yOffset / containerHeight * 2
    }
  return coords
}

class SceneManager extends BaseSceneManager {
  constructor(parameters) {
    super(parameters)
    this.mode = parameters.vr ? SceneManager.VR_MODE : SceneManager.DEFAULT_MODE
    this.vrDisplay = parameters.vrDisplay
  }

  // 资源加载后，初始化场景
  init() {
    this.enteredRoom = false
    this.renderer.autoClear = false

    // 场景模式（VR、非VR）及容器（body）设置
    this.mode === SceneManager.VR_MODE && this.initWebVR(this.vrDisplay)
    this.$container = $(document.body)
    this.updateContainerInfo()
    $(window).on('resize', function() {
      this.updateContainerInfo()
      this.mode === SceneManager.DEFAULT_MODE && this.hud && this.hud.resize()
    }.bind(this))

    // 获取资源加载后的3个场景
    this.startScene = this.scenes[0]  // 启动场景
    this.exteriorScene = this.scenes[1] // 室外场景
    this.interiorScene = this.scenes[2]  // 室内场景

    this.scene.updateMatrixWorld(true)

    this.initMaterialManager()  // 初始化可替换材质管理器
    this.initCamera()  // 初始化相机
    this.initCameraScene()
    this.handleCameraEvents()

    this.initUI() // 初始化界面和抬头显
    this.initObjectPickers() // 初始化所有可点击对象和他们的处理事件
    this.initObjectsRenderOrder() // 初始化对象渲染顺序
    this.initMaterialsExposure()

    this.initPool()
    this.initSeaHighlights()
    this.initFlares()
    this.initDirLight()
    this.initHoverScene()

    Config.DEBUG_KEYS && this.initDebugKeyEvents()
    if (this.mode === SceneManager.VR_MODE) {
      this.initInstructions()
      this.initInputManager()
      this.handleVREvents()
      this.initCrosshair()
      this.initTransitionScene()
    } else if (this.mode === SceneManager.DEFAULT_MODE) {
      this.handleNonVREvents()
    }
    this.config.fps && this.initFPSCounter()
    this.config.logCalls && this.initDrawCallsCounter()
    this.handleHudEvents()

    $(window).trigger('resize')
    _.defer(this.preRenderHUD.bind(this))
  }

  // 初始化操作说明
  initInstructions() {
    this.startInstructions = this.startScene.getObjectByName('instructions')
    this.startInstructions && (this.startInstructions.position.z = -0.75, this.camera.add(this.startInstructions))
  }

  // 更新操作说明透明度
  updateInstructions(t) {
    var e = 3, opacity = 0.25 + 0.75 * Math.abs(Math.sin(e * t.elapsed))
    this.startInstructionsCTA || (this.startInstructionsCTA = this.startInstructions.getObjectByName('cta'))
    this.startInstructionsCTA.material.opacity = opacity
  }

  // 初始化平行光（阳光)
  initDirLight() {
    this.dirLight = this.interiorScene.getObjectByName('Directional Light')
    _.each([this.interiorScene, this.exteriorScene], function(scene) {
      if (!scene) {
        return
      }
      _.each(scene.materials, function(material) {
        if (material.pbr && !matchMedia.ignoreDirLight) {
          material.defines.USE_DIR_LIGHT = true
          material.uniforms.lightColor.value.setRGB(1, 1, 1)
          material.needsUpdate = true
        }
      })
    })
  }

  initHoverScene() {
    this.hoverScene = new THREE.Scene()
  }

  // 初始化相机场景
  initCameraScene() {
    this.cameraScene = new THREE.Scene()
    this.cameraScene.add(this.camera)
  }

  // 初始化调试按键
  initDebugKeyEvents() {
    var changeMode = function(callback) {
      _.each(this.scenes, function(scene) {
        _.each(scene.materials, function(material) {
          material.pbr && callback(material.uniforms.uMode)
        })
      })
      if (this.hud) {
        _.each(this.hud.palettes, function(palette) {
          palette.children.forEach(function(child) {
            callback(child.material.uniforms.uMode)
          }, this)
        }, this)
      }
    }.bind(this)
    $(document).on('keypress', function(event) {
      if (event.keyCode === 109) {  // m(mode)：切换6种uMode模式
        changeMode(function(mode) {
          mode.value === 6 ? mode.value = 1 : mode.value++
        })
      } else if (event.keyCode === 104) {  // h(Home)：还原uMode模式
        changeMode(function(mode) {
          mode.value = 0
        })
      } else if (event.keyCode === 120) {  // x(像素): 切换2种渲染器像素比
        this.ratio ? (this.ratio += 1, this.ratio > 2 && (this.ratio = 1)) : this.ratio = 1
        this.renderer.setPixelRatio(this.ratio)
      } else if (event.keyCode === 102) {  // f(法线）：切换uMode【法线】模式
        changeMode(function(mode) {
          mode.value >= 0 ? mode.value = -1 : mode.value = 0
        })
      } else if (event.keyCode === 103) {  // g(高光)：切换【高光】模式
        _.each([this.interiorScene, this.exteriorScene], function(scene) {
          _.each(scene.materials, function(material) {
            if (material.pbr) {
              if (material.uniforms.highlights.value === 0) {
                material.uniforms.highlights.value = 1
              } else {
                material.uniforms.highlights.value = 0
              }
            }
          })
        })
      } else if (event.keyCode === 106) {  // j 截图
        // this.captureFrame(5000, 2000)
        this.captureFrame(window.innerWidth, window.innerHeight)
      } else if (event.keyCode === 116) {  // t 统计信息
        $(this.counter).toggle()
        $(this.dcCounter).toggle()
      }
    }.bind(this))
  }

  // 初始化帧率计数器
  initFPSCounter() {
    var t = $(this.counter)
    t.css('left', '20px')
    t.css('padding', '3px')
    t.css('font-size', '2em')
    t.css('background-color', 'black')
  }

  // 初始化绘制调用计数器
  initDrawCallsCounter() {
    var dc = $('<div id="dc"></div>')
    $('body').append(dc)
    dc.css('position', 'absolute').css('display', 'block !important').css('color', 'yellow').css('top', '60px').css('left', '20px').css('padding', '3px').css('font-size', '2em').css('background-color', 'black').css('z-index', '999999')
    this.dcCounter = dc[0]
  }

  // 初始化输入法管理器
  initInputManager() {
    this.inputManager = new InputManager()
  }

  // 启动场景
  start() {
    this.camera && this.camera.enableControls()
    if (this.mode === SceneManager.DEFAULT_MODE && this.ui) {
      if (window.isMobile) {
        this.ui.showMoveInstructions()
      } else {
        this.ui.showLookInstructions()
      }
    }
    super.start()
  }

  // 进入VR模式
  enterVR() {
    this.camera.vrControls.hasInput() && this.effect.requestPresent()
  }

  // 处理VR事件（如输入法press事件）
  handleVREvents() {
    this.inputManager.on('press', function() {
      if (this.enteredRoom) {
        if (this.hud.visible && this.hudPicker.hitTest()) {
          this.hudPicker.onTap()
        } else {
          this.scenePicker.hitTest() && this.scenePicker.onTap()
        }
      } else {
        this.fadeOut(750).onComplete(function() {
          this.camera.moveTo(0, 0)
          this.enteredRoom = true
          this.fadeIn(2000)
          this.camera.remove(this.startInstructions)
        }.bind(this))
      }
    }.bind(this))
  }

  // 处理非VR事件（如画布拖拽、点击等）
  handleNonVREvents() {
    var time = null

    // 画布拖拽浏览(PC)
    if (!window.isMobile) {
      $('canvas').on('mousemove', function(event) {
        // console.log(`画布 mousemove ${event}`)
        var coords = calcMousePosition(event, this.containerOffset, this.containerWidth, this.containerHeight)
        this.scenePicker && this.scenePicker.updateMouseCoords(coords)
        this.hudPicker && this.hudPicker.updateMouseCoords(coords)
      }.bind(this))
    }

    // 画布点击（点击地板前进、点击抬头显换材质）
    $('canvas').on('tap', function(event) {
      // console.log(`画布 tap`)
      if (window.isMobile) {
        var coords = calcMousePosition(event, this.containerOffset, this.containerWidth, this.containerHeight)
        this.scenePicker && this.scenePicker.updateMouseCoords(coords)
        this.hudPicker && this.hudPicker.updateMouseCoords(coords)
      }
      var hudHitObject = null, sceneHitObject = null
      if (!this.camera.moving && !this.camera.rotating && this.camera.enabled) {
        hudHitObject = this.hud && this.hudPicker && this.hud.visible && this.hudPicker.hitTest()
        sceneHitObject = this.scenePicker && this.scenePicker.hitTest()
        console.log('hudHitObject', hudHitObject)
        console.log('sceneHitObject', sceneHitObject)
      }
      // 点击地板更新地面白色圆圈标记
      if (window.isMobile && !hudHitObject && sceneHitObject && sceneHitObject.name === 'floor') {
        this.ui.updateMarker(this.scenePicker.getPoint())
        this.ui.showMarker()
        time && clearTimeout(time)
        time = setTimeout(function() {
          this.ui.hideMarker()
          time = null
        }.bind(this), 2000)
      }
      hudHitObject ? this.hudPicker.onTap() : sceneHitObject && this.scenePicker.onTap()
    }.bind(this))
  }

  // 替换选中的材质
  handleHudEvents() {
    this.hud.on('selectMaterial', function(index) {
      this.materialManager.setObjectMaterial(this.currentSelected, index)
      this.hud.setCurrent(index)
      this.materialInstructionsVisible && (this.ui.hideMaterialInstructions(), this.materialInstructionsVisible = false)
    }, this)
  }

  // 处理相机事件（移动、旋转）
  handleCameraEvents() {
    this.camera.on('startMove', function() {
      this.ui.freezeMarker()
    }, this)
    this.camera.on('endMove', function() {
      this.ui.unfreezeMarker()
    }, this)
    this.camera.on('firstMove', function() {
      this.ui.hideMoveInstructions()
    }, this)
    this.camera.on('firstRotate', function() {
      this.ui.hideLookInstructions()
    }, this)
  }

  // 更新容器宽高、坐标信息
  updateContainerInfo() {
    this.containerOffset = {
      x: this.$container.offset().left,
      y: this.$container.offset().top
    }
    this.containerWidth = this.$container.width()
    this.containerHeight = this.$container.height()
  }

  // 初始化材质选择管理器
  initMaterialManager() {
    this.materialManager = new MaterialManager({
      scenes: this.scenes,
      configurables: Configurables
    })
  }

  // 初始化相机
  initCamera() {
    var camera = new Camera({
      vr: this.mode === SceneManager.VR_MODE,
      states: this.scene.getObjectByName('cameras').children,
      $container: this.$container
    })
    this.camera = camera
    this.scene.add(camera)
    camera.enabled = true
    this.mode === SceneManager.VR_MODE && this.camera.vrControls.setVRDisplay(this.vrDisplay)
  }

  // 初始化过渡场景
  initTransitionScene() {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new BasicShaderMaterial())
    mesh.material.uniforms.diffuse.value = new THREE.Color(0)
    mesh.material.uniforms.opacity.value = 0
    mesh.material.transparent = false
    mesh.frustumCulled = false
    var scene = new THREE.Scene()
    scene.add(mesh)
    this.transitionQuad = mesh
    this.transitionScene = scene
  }

  // 场景切出
  fadeOut(t) {
    return TweenUtils.tween(t || 500).onUpdate(function(opacity) {
      this.transitionQuad.material.opacity = opacity
    }.bind(this))
  }

  // 场景切入
  fadeIn(t) {
    return TweenUtils.tween(t || 500).onUpdate(function(opacity) {
      this.transitionQuad.material.opacity = 1 - opacity
    }.bind(this))
  }

  // 初始对象选择器
  initObjectPickers() {
    // 初始化可点选对象
    var pickableNames = ['floor', 'wall_right', 'walls', 'armchairs', 'colliders', 'pool_water'], pickableObjects = []
    Configurables.forEach(function(configurable) {
      pickableNames.push(configurable.name)
    })
    _.each(pickableNames, function(pickableName) {
      var objects = findObjectsInScene(this.scene, pickableName)
      objects = objects.concat(findObjectsInScene(this.exteriorScene, pickableName))
      if (objects) {
        _.each(objects, function(object) {
          object.traverse(function(child) {
            pickableObjects.push(child)
          })
        }, this)
      }
    }.bind(this), this)

    // 让所有碰撞节点均可见
    var collidersObject = this.scene.getObjectByName('colliders')
    if (collidersObject && collidersObject.children) {
      _.each(collidersObject.children, function(collider) {
        collider.visible = true
        collider.material.visible = false
      })
    }

    // 初始场景选择器
    this.scenePicker = new ObjectPicker({
      camera: this.camera,
      checkFlag: true,
      vr: this.mode === SceneManager.VR_MODE
    })
    this.scenePicker.add(pickableObjects)

    // 初始平视仪选择器
    if (this.hud) {
      this.hudPicker = new ObjectPicker({
        camera: this.hud.camera,
        checkFlag: true,
        vr: this.mode === SceneManager.VR_MODE
      })
      this.mode === SceneManager.VR_MODE && (this.hudPicker.camera = this.camera)
      this.hudPicker.add(this.hud.getPickables())
    }

    this.handlePickerEvents()
  }

  // 处理对象点选事件
  // TODO:点击事件位置
  handlePickerEvents() {
    if (this.scenePicker) {
      this.scenePicker.on('pick', function(pickObject, point) {
        var selectedObject
        // 选择地板进行前进
        if (pickObject.name === 'floor') {
          if (this.VREnabled && !this.warping) {
            this.warping = true
            this.fadeOut(200).onComplete(function() {
              this.camera.moveTo(point.x, point.z, 1000)
              this.fadeIn(200).onComplete(function() {
                this.warping = false
              }.bind(this))
            }.bind(this))
            this.ui && this.ui.hideMoveInstructions()
          } else {
            if (!this.VREnabled) {
              this.camera.moveTo(point.x, point.z, 1000)
              this.$container.removeClass('hovering')
              this.ui && this.ui.activateMarker()
              this.currentSelected && this.deselectObject(this.currentSelected)
            }
          }
        } else if (pickObject.name === 'wall_right') {
          const colors = ['0xf4e0e1', '0xf8d6b3', '0xf8d483', '0xfde39f', '0xf2edd1', '0xd3e5e9', '0xbebacf', '0xdbe0e0', '0xf0ecdf', '0xeeefea']
          pickObject.material.color.setHex(colors[parseInt(Math.random() * 10)])
        } else {
          // 地板之外的对象选择
          if (isContain(pickObject)) {
            selectedObject = pickObject
          } else if (isContain(pickObject.parent)) {
            selectedObject = pickObject.parent
          }
        }
        if (selectedObject && selectedObject !== this.currentSelected) {
          this.selectObject(selectedObject)
        }
      }.bind(this), this)

      this.scenePicker.on('enter', function(t) {
        if (this.VREnabled && !this.enteredRoom) {
          return
        } else {
          (t.name !== 'floor' || window.isMobile || this.ui.showMarker(), isContain(t) && t !== this.currentSelected ? this.highlightObject(t) : isContain(t.parent) && t.parent !== this.currentSelected && this.highlightObject(t.parent))
        }
      }.bind(this), this)

      this.scenePicker.on('leave', function(t) {
        if (this.VREnabled && !this.enteredRoom ) {
          return
        } else {
          (t.name !== 'floor' || window.isMobile || this.ui.hideMarker(), isContain(t) && t !== this.currentSelected ? this.clearHighlight(t) : isContain(t.parent) && t.parent !== this.currentSelected && this.clearHighlight(t.parent))
        }
      }.bind(this), this)
    }

    if (this.hudPicker) {
      this.hudPicker.on('pick', function(t) {
        this.hud.select(t)
      }.bind(this), this)
      this.hudPicker.on('enter', function(t) {
        window.isMobile || (this.hud.enter(t), this.ui.onEnterObject(), this.ui.hideMarker())
      }.bind(this), this)
      this.hudPicker.on('leave', function(t) {
        window.isMobile || (this.hud.leave(t), this.ui.onLeaveObject())
      }.bind(this), this)
    }
  }

  // 初始整体UI和平视仪界面
  initUI() {
    this.ui = new UI({
      container: this.$container,
      scene: this.scene,
      camera: this.camera,
      configurables: Configurables,
      vr: this.mode === SceneManager.VR_MODE
    })
    this.hud = new Hud({
      scene: this.scene,
      configurables: Configurables,
      vr: this.mode === SceneManager.VR_MODE
    })
  }

  // 初始VR展示
  initWebVR(vrDisplay) {
    this.effect = new VREffect(this.renderer)
    this.effect.autoSubmitFrame = false
    this.VREnabled = false
    this.effect.setVRDisplay(vrDisplay)
  }

  // 对象选择（包含场景里所有对象，如前进漫游、可替换材质等）
  selectObject(object) {
    var name = object.name, filterConfig = function(name) {
        return _.find(Configurables, function(config) {
          return config.name === name
        })
      }
    if (window.isMobile && this.isSelecting) {
      return
    } else {
      this.isSelecting = true
      setTimeout(function() {
        this.isSelecting = false
      }.bind(this), 1500)
      this.clearHighlight(object)
      this.currentSelected = object
      this.hud.show()
      this.hud.setPanel(name)
      if (window.isMobile) {
        this.selectObjectMobile(name)
      } else {
        if (this.VREnabled) {
          this.selectObjectVR(name)
        } else {
          this.camera.setOrbitDistances(0, 1 / 0)
          this.camera.setState(name).onComplete(function() {
            this.hud.setPalette(name)
            this.camera.setOrbitDistances(filterConfig(name).minDistance, filterConfig(name).maxDistance)
            if (this.materialHelpDisplayed) {
              if (this.materialInstructionsVisible) {
                this.ui.hideMaterialInstructions()
                this.materialInstructionsVisible = false
              }
            } else {
              this.materialHelpDisplayed = true
              this.ui.showMaterialInstructions()
              this.materialInstructionsVisible = true
            }
          }.bind(this))
        }
      }
      if (this.mode !== SceneManager.VR_MODE && !window.isMobile && this.hud.currentPalette) {
        this.hud.currentPalette.fadeOut()
      }
    }
  }

  selectObjectMobile(t) {
    this.hud.setPalette(t, 1000)
    setTimeout(function() {
      this.materialHelpDisplayed ? this.materialInstructionsVisible && (this.ui.hideMaterialInstructions(), this.materialInstructionsVisible = !1) : (this.materialHelpDisplayed = !0, this.ui.showMaterialInstructions(), this.materialInstructionsVisible = !0)
    }.bind(this), 1e3)
    this.ui.hideMoveInstructions()
  }

  selectObjectVR(t) {
    var palette = this.hud.palettes[t],
      paletteCount = palette.children.length,
      i = 0.2,
      r = -((paletteCount - 1) * i) / 2
    this.hud.maxScale = 0.07
    this.hud.setPalette(t, 1e3)
    _.each(palette.children, function(t, e) {
      t.position.set(e * i + r, 0, 0)
      t.scale.set(0, 0, 0)
      t.tweenValue.scale = this.hud.maxScale
      t.rotation.set(0, 0, 0)
      this.scene.materials[t.material.uuid] = t.material
    }, this)
    palette.position.set(0, -0.25, -0.6)
    palette.rotation.set(0, 0, 0)
    palette.scale.set(1, 1, 1)
    this.camera.add(palette)
    this.camera.updateMatrixWorld(true)
    palette.getWorldPosition(palette.position)
    palette.getWorldQuaternion(palette.quaternion)
    this.camera.remove(palette)
    var o = palette.quaternion,
      a = new THREE.Vector3(0, 1, 0),
      s = a.clone().applyQuaternion(o).normalize(),
      c = a.angleTo(s),
      u = new THREE.Vector3()
    u.crossVectors(s, a).normalize()
    var l = new THREE.Quaternion()
    l.setFromAxisAngle(u, c).normalize()
    palette.quaternion.multiplyQuaternions(l, o)
    this.hoverScene.add(palette)
    var panel = this.hud.panels[t]
    panel.position.set(0.25, -0.1, -0.55)
    panel.rotation.set(0, 0, 0)
    panel.scale.set(85e-5, 85e-5, 85e-5)
    this.camera.add(panel)
    this.camera.updateMatrixWorld(true)
    panel.getWorldPosition(panel.position)
    panel.getWorldQuaternion(panel.quaternion)
    this.camera.remove(panel)
    this.hoverScene.add(panel)
    var f = a.clone().applyQuaternion(o).normalize()
    o = panel.quaternion
    c = a.angleTo(f)
    u = new THREE.Vector3()
    u.crossVectors(f, a).normalize()
    l = new THREE.Quaternion()
    l.setFromAxisAngle(u, c).normalize()
    panel.quaternion.multiplyQuaternions(l, o)
    this.ui.hideConfigureInstructions()
  }

  // 取消对象选择，隐藏相关对象
  deselectObject(t) {
    this.hud.hide()
    this.currentSelected = null
    this.materialInstructionsVisible && (this.ui.hideMaterialInstructions(), this.materialInstructionsVisible = false)
  }

  highlightObject(t) {
    var e = t.group ? t.group : t
    e.worldPosition || (e.worldPosition = new THREE.Vector3())
    e.previousPosition || (e.previousPosition = new THREE.Vector3())
    this.ui.highlightObject(t)
    e.getWorldPosition(e.worldPosition)
    e.previousPosition.copy(e.position)
    e.previousParent = e.parent
    this.hoverScene.add(e)
    e.position.copy(e.worldPosition)
  }

  clearHighlight(t) {
    var e = t.group ? t.group : t
    this.ui.clearHighlight()
    e.previousParent.add(e)
    e.position.copy(e.previousPosition)
  }

  initObjectsRenderOrder() {
    if (!this.interiorScene) {
      return
    }
    var glassrail = this.interiorScene.getObjectByName('glassrail')
    glassrail && (glassrail.renderOrder = 50)
    var glasses = this.interiorScene.getObjectByName('glasses')
    glasses && (glasses.renderOrder = 100)
    var sea = this.interiorScene.getObjectByName('sea')
    sea && (sea.renderOrder = 100)
    var sky = this.interiorScene.getObjectByName('sky')
    sky && (sky.renderOrder = 95, sky.visible = true)
    var clouds = this.interiorScene.getObjectByName('clouds')
    clouds && clouds.traverse(function(cloud) {
      cloud.renderOrder = 98
    })
    var sun = this.interiorScene.getObjectByName('sun')
    sun && sun.traverse(function(t) {
      t.renderOrder = 97
    })
    var sunAndCloudsMerged = this.interiorScene.getObjectByName('sun_and_clouds_merged')
    sunAndCloudsMerged && (sunAndCloudsMerged.renderOrder = 97)
    var seaHighlight = this.interiorScene.getObjectByName('sea_highlight')
    seaHighlight && (seaHighlight.renderOrder = 101)
    var islands = this.interiorScene.getObjectByName('islands')
    islands && islands.traverse(function(island) {
      island.renderOrder = 102
    })
    var islandsMerged = this.interiorScene.getObjectByName('islands_merged')
    islandsMerged && (islandsMerged.renderOrder = 102)
    var seaHightlights2 = this.interiorScene.getObjectByName('sea_highlights2')
    seaHightlights2 && (seaHightlights2.renderOrder = 103)
  }

  // 初始化VR模式下的十字光标
  initCrosshair() {
    this.crosshair = new SphereMesh()
    this.crosshair.fadeOut()
    this.camera.add(this.crosshair)
  }

  // 初始化材质曝光度
  initMaterialsExposure() {
    var feet = this.scene.getObjectByName('feet')
    feet && (feet.material.exposure = 0.3)
  }

  // 初始化室内斑点
  initFlares() {
    this.flares = []
    var spots = this.interiorScene.getObjectByName('spots'),
      flareMap = ResourceManager.getTexture('static/textures/flare.png')
    spots && spots.children.forEach(function(spot) {
      var material = new THREE.PointsMaterial({
          size: 1.5,
          map: flareMap,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.35
        }),
        geometry = new THREE.Geometry()
      geometry.vertices.push(new THREE.Vector3())
      var points = new THREE.Points(geometry, material)
      spot.getWorldPosition(points.position)
      this.flares.push(points)
      this.interiorScene.add(points)
    }.bind(this), this)
  }

  // 更新室外泳池
  initPool() {
    if (!this.exteriorScene) {
      return
    }
    var poolWater = this.exteriorScene.getObjectByName('pool_water')
    this.water = new WaterNormalsMesh({
      light: this.exteriorScene.getObjectByName('ocean light'),
      camera: this.camera,
      renderer: this.renderer,
      object: poolWater,
      transparent: true,
      opacity: 0.6
    })
    poolWater.visible = false
    this.exteriorScene.add(this.water)
  }

  // 初始化海水高光（增加噪音贴图）
  initSeaHighlights() {
    var seaHightlight2 = this.interiorScene.getObjectByName('sea_highlights2'),
      material = seaHightlight2.material,
      map = material.map
    this.noise = new Noise()
    seaHightlight2.material = new HighlightsShaderMaterial()
    seaHightlight2.material.map = map
    seaHightlight2.material.uniforms.offsetRepeat.value.set(map.offset.x, map.offset.y, map.repeat.x, map.repeat.y)
    seaHightlight2.material.transparent = material.transparent
    seaHightlight2.material.noiseMap = this.noise.target.texture
    this.seaHighlights = seaHightlight2
  }

  // 更新海水uniforms
  updateSeaHighlights(uniforms) {
    this.seaHighlights.material.updateUniforms(uniforms)
  }

  // 更新平行光（阳光） uniforms.viewLightDir
  updateDirLight() {
    var targetMatrixVector3 = new THREE.Vector3(),
      matrixVector3 = new THREE.Vector3()
    matrixVector3.setFromMatrixPosition(this.dirLight.matrixWorld)
    targetMatrixVector3.setFromMatrixPosition(this.dirLight.target.matrixWorld)
    matrixVector3.sub(targetMatrixVector3)
    matrixVector3.transformDirection(this.camera.matrixWorldInverse)
    _.each([this.interiorScene, this.exteriorScene], function(scene) {
      _.each(scene.materials, function(material) {
        material.pbr && material.uniforms.viewLightDir.value.copy(matrixVector3)
      })
    })
  }

  updateCrosshair() {
    var t = new THREE.Vector3(),
      e = new THREE.Vector3(),
      n = new THREE.Vector2(),
      i = new THREE.Vector2()
    if (this.VREnabled) {
      var palette = this.hud.currentPalette
      this.camera.updateMatrixWorld(true)
      this.crosshair.getWorldPosition(e)
      e.project(this.camera)
      n.set(e.x, e.y)
      if (palette) {
        var o = 1 / 0
        palette.children.forEach(function(child) {
          child.getWorldPosition(t)
          t.project(this.camera)
          i.set(t.x, t.y)
          var r = n.distanceTo(i)
          o > r && (o = r)
        }.bind(this), this)
        o > 0.5 ? (this.crosshair.fadeOut(), this.ui.fadeInMarker()) : (this.crosshair.fadeIn(), this.ui.fadeOutMarker())
      }
    }
  }

  updateUI() {
    if (window.isMobile) {
      this.scenePicker && this.scenePicker.hitTest(true)
    } else {
      if (this.camera.moving || this.camera.rotating || !this.camera.enabled) {
        return
      }

      // 抬头显选择
      if (this.hud && this.hud.visible) {
        if (this.hudPicker.hitTest()) {
          this.scenePicker.clearState()
          this.ui.onEnterObject()
          if (!this.camera.vr) {
            this.camera.orbitControls.enabled = false
          }
        } else {
          this.scenePicker.hitTest()
          if (this.camera.mode === Camera.ORBIT_MODE) {
            this.camera.orbitControls.enabled = true // 启用相机漫游
          }
        }
      } else { // 场景点选前进
        this.scenePicker.hitTest()
      }

      if (this.camera.rotating) {
        this.scenePicker.clearState()
        this.hudPicker.clearState()
        if (this.ui.currentHighlighted) {
          this.clearHighlight(this.ui.currentHighlighted)
        }
      }
      this.ui && this.ui.update(this.scenePicker.getPoint())
    }
  }

  // 更新耀斑（墙面、沙发、电脑、吊灯、桌子、瓶子、左侧沙发）
  updateFlares() {
    var raycaster = new THREE.Raycaster(),  // 光线投射器
      newOptionalTarget = new THREE.Vector3(),
      optionalTarget = new THREE.Vector3(),
      names = ['walls', 'sofa_main', 'laptop', 'suspended_lamp', 'table_objects_merged', 'bottle', 'seat_main_left'],
      objects = []
    if (objects.length === 0) {
      names.forEach(function(name) {
        var object = this.interiorScene.getObjectByName(name)
        object && objects.push(object)
      }.bind(this), this)
    }
    this.camera.getWorldPosition(optionalTarget)
    this.flares.forEach(function(flare, index) {
      newOptionalTarget.subVectors(flare.position, optionalTarget).normalize()
      raycaster.set(optionalTarget, newOptionalTarget)
      var intersections = raycaster.intersectObjects(objects)
      intersections.length > 1 ? flare.visible = false : flare.visible = true
    }, this)
  }

  update(t) {
    this.VREnabled || this.mode !== SceneManager.VR_MODE || (this.effect.requestPresent(), this.VREnabled = true)
    this.camera && this.camera.enabled && this.camera.update()
    this.startInstructions && !this.enteredRoom && this.updateInstructions(t)
    this.flares && this.updateFlares()
    this.updateUI()
    this.hud && this.hud.update(t)
    this.water && this.water.update(t)
    this.updateSeaHighlights(t)
    this.updateDirLight()
    this.updateCrosshair()
    this.inputManager && this.inputManager.update()
    super.update(t)
  }

  // 预渲染抬头显
  preRenderHUD() {
    this.renderer.clear()
    if (this.hud) {
      this.hud.visible = true
      this.hud.showAllPalettes(false)
      this.hud.showAllPanels()
      this.hud.render(this.renderer)
      this.hud.visible = false
      this.hud.hideAllPalettes()
      this.hud.hideAllPanels()
    }
  }

  // 预渲染全部（场景对象、抬头显、水）
  preRenderAll() {
    this.renderer.clear()
    this.scene.traverse(function(object) {
      object.frustumCulled = false
      object.wasVisible = object.visible
      object.visible = true
    })
    this.hud.visible = true
    this.hud.showAllPalettes(false)
    this.hud.showAllPanels()
    this.water.render()
    this.renderScene(this.scene, this.camera)
    this.hud.render(this.renderer)
    this.hud.visible = false
    this.hud.hideAllPalettes()
    this.hud.hideAllPanels()
    this.scene.traverse(function(object) {
      object.frustumCulled = true  // 截锥挑选、剔除？？
      object.visible = object.wasVisible
      delete object.wasVisible
    })
  }

  render() {
    var callTimes = 0
    var logCall = function() {
      this.config.logCalls && (callTimes += this.renderer.info.render.calls)
    }.bind(this)
    this.renderer.clear()
    this.noise && this.noise.render(this.renderer)
    if (this.mode === SceneManager.VR_MODE) {
      if (this.enteredRoom) {
        this.effect.render(this.exteriorScene, this.camera)
        this.effect.render(this.interiorScene, this.camera)
        if (this.hoverScene.children.length > 0) {
          this.effect.render(this.hoverScene, this.camera)
        }
      } else {
        this.effect.render(this.startScene, this.camera)
        this.effect.render(this.cameraScene, this.camera)
        this.effect.render(this.transitionScene, this.camera)
        this.effect.submitFrame()
      }
    } else if (this.mode === SceneManager.DEFAULT_MODE) {
      // 渲染室内
      this.renderScene(this.interiorScene, this.camera)
      logCall()

      // 渲染室外
      this.renderScene(this.exteriorScene, this.camera)
      logCall()

      if (this.hoverScene && this.hoverScene.children.length > 0) {
        this.renderScene(this.hoverScene, this.camera)
        logCall()
      }

      // 渲染抬头显
      this.hud && this.hud.render(this.renderer)
      logCall()

      // 渲染相机
      this.renderScene(this.cameraScene, this.camera)
      logCall()

      // 设置绘制调用次数
      if (this.config.logCalls) {
        this.dcCounter.textContent = callTimes + ' DC'
      }
    }
  }

  // 请求动画帧
  requestAnimationFrame(callback) {
    if (this.effect) {  // VREffect
      this.effect.requestAnimationFrame(callback)
    } else {
      requestAnimationFrame(callback)
    }
  }

  // 捕获画布当前帧图片
  captureFrame(width, height) {
    this.setSize(width, height)
    this.render()
    var canvas = document.querySelector('canvas')
    var data = canvas.toDataURL()
    var image = new Image()
    image.src = data
    var w = window.open('')
    w.document.write(image.outerHTML)
  }
}

SceneManager.DEFAULT_MODE = 0
SceneManager.VR_MODE = 1

export default SceneManager
