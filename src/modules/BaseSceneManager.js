/**
 * 1: 场景管理器基类。
 * 实例化 WebGLRender 渲染器
 */
import Events from './Events'
import TimerManager from './TimerManager'
import FPSCounter from './FPSCounter'
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'


// 窗口大小调整处理器，调整时同步画布大小
function resizeHandler(event) {
  var width = window.WIDTH = window.innerWidth,
    height = window.HEIGHT = window.innerHeight
  this.setSize(width, height)
}

// 浏览器标签卡可见性处理器，处理离开、返回标签卡的场景暂停、还原事件
function visibilityHandler(event) {
  var eventValue, eventName
  typeof document.hidden !== 'undefined' ? (eventValue = 'hidden', eventName = 'visibilitychange') : typeof document.mozHidden !== 'undefined' ? (eventValue = 'mozHidden', eventName = 'mozvisibilitychange') : typeof document.msHidden !== 'undefined' ? (eventValue = 'msHidden', eventName = 'msvisibilitychange') : typeof document.webkitHidden !== 'undefined' && (eventValue = 'webkitHidden', eventName = 'webkitvisibilitychange')
  if (typeof document.addEventListener !== 'undefined') {
    document.addEventListener(eventName, function() {
      document[eventValue] ? event.onLeaveTab() : setTimeout(event.onFocusTab.bind(event), 50)
    }, false)
  }
}

function keyupHandler(event) {}

class BaseSceneManager extends Events {
  constructor(params) {
    super()

    this.paused = false
    this.scenes = []  // 场景列表
    this.scene = null  // 当前场景

    // 配置
    params = params !== undefined ? params : {}
    this.config = {
      fps: params.fps !== undefined ? params.fps : false,
      profiling: params.profiling !== undefined ? params.profiling : false,
      logCalls: params.logCalls !== undefined ? params.logCalls : false
    }

    // 渲染器：初始化
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: params.canvas || document.querySelector('canvas'),
      preserveDrawingBuffer: params.preserveDrawingBuffer !== undefined ? params.preserveDrawingBuffer : undefined
    })
    THREE.Extensions = this.renderer.extensions  // 扩展到全局变量的渲染器插件信息

    // 渲染器：设置像素比、画布尺寸、自动清空、清除色（背景色）
    var maxPixelRatio = params.maxPixelRatio ? Math.min(window.devicePixelRatio, params.maxPixelRatio) : window.devicePixelRatio
    window.isMobile && (maxPixelRatio = Math.min(1.5, maxPixelRatio))
    this.renderer.setPixelRatio(maxPixelRatio)
    this.setSize(params.width || window.innerWidth, params.height || window.innerHeight)
    params.autoClear !== undefined && (this.renderer.autoClear = params.autoClear)
    params.clearColor !== undefined && this.renderer.setClearColor(params.clearColor)
    params.supportsTextureLod !== undefined && params.supportsTextureLod !== true || THREE.Extensions.get("EXT_shader_texture_lod")

    this.clock = new THREE.Clock()

    // 绑定调整窗口大小和键盘抬起事件
    window.onresize = resizeHandler.bind(this)
    window.addEventListener('keyup', keyupHandler.bind(this))

    // 渲染器DOM（画布）：鼠标拖动时记录鼠标位置
    this.renderer.domElement.addEventListener('mousemove', function(evnet) {
      window.mouseX = event.pageX / window.WIDTH * 2 - 1
      window.mouseY = 1 - event.pageY / window.HEIGHT * 2
    })

    if (this.config.fps) {
      this.fpsCounter = new FPSCounter()
      this.counter = document.createElement('div')
      document.querySelectorAll('body')[0].appendChild(this.counter)
      this.counter.setAttribute('style', 'position:absolute;top:20px;left:100px;color:#ff00ff;display:block !important;z-index:999999;')
    }

    // 浏览器标签卡可见性处理器，处理离开、返回标签卡的场景暂停、还原事件
    visibilityHandler(this)
  }

  // 使用当前相机渲染当前场景
  render(params) {
    this.renderScene(this.scene, this.camera)
  }

  // 使用指定相机渲染指定场景
  renderScene(scene, camera) {
    this.renderer.render(scene, camera)
  }

  update(time) {
    // 更新相机截锥
    if (this.camera) {
      this.camera.updateMatrixWorld(true)
      this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld)
    }
    // 更新每个场景的自定义材质，如果场景可更新则更新场景图像
    _.each(this.scenes, function(scene) {
      this.updateCustomMaterials(scene)
      if (scene.update) {
        scene.updateMatrixWorld(true)
        scene.update(this.renderer, time)
      }
    }.bind(this), this)
  }

  // 更新场景中的自定义PBR材质
  updateCustomMaterials(scene, camera) {
    _.each(scene.materials, function(material) {
      if (material.pbr) {
        material.refreshUniforms(camera || this.camera)
      }
    }.bind(this), this)
  }

  // 场景动画更新
  doUpdate() {
    var event = {
      delta: 0,
      elapsed: 0
    }
    event.delta = this.clock.getDelta()
    event.elapsed = this.clock.getElapsedTime()
    if (!this.paused) {
      this.requestAnimationFrame(this.doUpdate.bind(this))
      var performance = undefined !== window.performance && undefined !== window.performance.now ? window.performance.now() : Date.now()
      window.TWEEN.update(performance)
      TimerManager.updateTimers(event)
      this.config.profiling && console.time('update')
      this.update(event)
      this.config.profiling && console.time('update')
      this.render(event)
      this.started || (this.started = true)
      this.config.fps && this.fpsCounter.update(event, function(fps) {
        this.counter.textContent = fps + ' FPS'
      }.bind(this))
    }
  }

  // 启动场景动画
  start() {
    this.doUpdate()
  }

  // 暂停场景更新、渲染
  pause() {
    if (!this.paused) {
      this.clock.stop()
      this.paused = true
      this.config.fps && (this.counter.textContent += ' (paused)')
    }
  }

  // 还原场景更新、渲染
  resume() {
    if (this.paused) {
      this.clock.start()
      this.paused = false
      this.started && this.doUpdate()
    }
  }

  // 离开该浏览器标签卡，暂停场景
  onLeaveTab() {
    if (!this.paused) {
      this.pause()
      this.shouldResume = true
    }
  }

  // 回到该浏览器标签卡，还原场景
  onFocusTab() {
    if (this.shouldResume) {
      this.resume()
      this.shouldResume = false
    }
  }

  // 设置相机纵横比
  setAspectRatio(ratio) {
    if (this.camera) {
      this.camera.aspect = ratio
      this.camera.updateProjectionMatrix()
    }
  }

  // 通过渲染器设置画布大小并设置相机纵横比
  setSize(width, height) {
    this.started && this.setAspectRatio(width / height)
    this.renderer.setSize(width, height)
  }

  requestAnimationFrame(callback) {
    requestAnimationFrame(callback)
  }
}

export default BaseSceneManager
