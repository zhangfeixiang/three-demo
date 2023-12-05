// 备份老代码
import Config from './Config'
import VRDetector from './VRDetector'
import SceneManager from './SceneManager'
import ResourceManager from './ResourceManager'
import ResourceLoader from './ResourceLoader'
import SceneLoader from './SceneLoader'
import scriptExt from './ScriptExtension'
import _ from 'lodash'
import THREE from './../../static/js/three.min.js'
import ZFX from './../../static/js/three.min.js'
// 模块变量定义
var sceneManager, $ = window.jQuery, VRenabled = window.VRenabled = VRDetector.isAvailable(),
  isLatestAvailable = VRDetector.isLatestAvailable(),
  hasStarted = false,
  hasVRDisplays = false,
  startGeometry = 'start',
  interiorGeometry = 'interior2',
  exteriorGeometry = 'exterior2',
  assetsDir = window.isMobile ? 'static/assets_mobile/' : 'static/assets/',
  $canvas = $('#main_canvas'),
  $sharing = $('[data-ref="sharing"]'),
  $panelContainer = $('[data-ref="panel_container"]'),
  $aboutLink = $('[data-ref="about_link"]'),
  $closeAbout = $('[data-ref="close_about"]'),
  $changeWallColor = $('.wall-color li'),
  $changeFloorPattern = $('.floor-pattern li'),
  $panel = $('[data-ref="panel"]'),
  $border = $('[data-ref="border"]'),
  $progress = $('[data-ref="progress"]'),
  $start = $('[data-ref="start"]'),
  $loading = $('.loading'),
  $loadingBackground = $('.loading .background'),
  $percentage = $('.percentage'),
  $warning = $('.warning'),
  $aboutButton = $('[data-ref="about_button"]'),
  $titleScreenMain = $('[data-ref="titlescreen_main"]'),
  $titleScreenIllustration = $('[data-ref="titlescreen_illustration"]'),
  $titleScreenFooter = $('[data-ref="titlescreen_footer"]')

// 关闭关于
function closeAbout() {
  $panel.removeClass('visible')
  setTimeout(function() {
    $aboutButton.addClass('visible')
  }, 400)
}

// 打开分享窗口
function openShareWindow(url, width, height) {
  var left = ($(window).width() - width) / 2,
    top = ($(window).height() - height) / 2,
    params = 'status=1,width=' + width + ',height=' + height + ',top=' + top + ',left=' + left
  window.open(url, 'share', params)
  return false
}

// 调整窗口大小
function onResize() {
  window.isMobile && _.defer(function() {
    var t = $titleScreenMain.outerHeight(true) - $titleScreenIllustration.height(),
      e = $titleScreenFooter.outerHeight(),
      n = window.innerHeight ? window.innerHeight : $(window).height(),
      i = n - (t + e)
    $titleScreenIllustration.css('height', i)
  })
}

// 资源加载进度
ResourceManager.manager.onProgress = function(t, e, n) {
  $percentage.html(Math.round(e / Config.ASSET_COUNT * 100))
  onResize()
}

// 加载场景（如 start, interior2, exterior2，将他们通过THREE还原成场景，同时加载对应JS脚本中的各种对象）
function loadScene(geometryName) {
  ResourceManager.texturePath = assetsDir + geometryName + '/'
  return SceneLoader.loadScene(geometryName, assetsDir + 'scenes/', sceneManager, scriptExt)
}

// 启动场景
function startScenes() {
  hasVRDisplays && sceneManager.enterVR()
  sceneManager.start()  // 启动场景管理器
  $border.hide()
  $loading.addClass('started')
  $panelContainer.addClass('state-about in-app')
  $panel.removeClass('hidden')
  window.isMobile || $panel.show()
  $(window).trigger('resize')
  $aboutButton.addClass('visible')
  setTimeout(function() {
    $loadingBackground.remove()
  }, 200)
}

// 初始化资源（立方体贴图|全景图、启动及室内外几何体、脚本、纹理）
function initResources() {
  $canvas.show()
  $progress.show()
  onResize()

  // 待加载资源信息
  var resources = {
    geometries: [interiorGeometry, exteriorGeometry, startGeometry],
    sh: ['room', 'studio'], // irradiance.json 辐射图
    textures: ['static/textures/white.png', 'static/textures/normal.png', 'static/textures/waternormals.jpg', 'static/textures/marker.png', 'static/textures/circle.png', 'static/textures/corner-gradient.png', 'static/textures/flare.png']
  }

  if (ZFX.Extensions.get('EXT_shader_texture_lod')) {
    resources.cubemaps = ['room/cubemap.bin'] // 高光贴图（椅背、灯罩等使用pbr.fs/vs）
  } else {
    resources.panoramas = ['room/panorama.bin']
  }

  // 资源管理器路径设置（环境、几何体）
  ResourceManager.environmentPath = assetsDir + 'environments'
  ResourceManager.geometryPath = assetsDir + 'scenes/data/'

  // 加载资源到缓存
  var resourceLoader = new ResourceLoader(resources)
  resourceLoader.load().then(function(resources) {
    // resources => 获取到各类资源的JS变量
    loadScene(startGeometry).then(function(startScene) {
      window.StartScene = startScene
      loadScene(exteriorGeometry).then(function(exteriorScene) {
        window.ExteriorScene = exteriorScene
        loadScene(interiorGeometry).then(function(interiorScene) {
          window.InteriorScene = interiorScene
          // 启动、室外、室内场景就位，初始化场景管理器
          sceneManager.init()
          _.defer(function() {
            $start.show()
            $progress.hide()
          })
          if (Config.AUTOSTART && (!window.VRenabled || !hasVRDisplays)) {
            hasStarted = true
            startScenes()
            $aboutButton.addClass('visible')
          }
        })
        // var loader = new THREE.ObjectLoader()
        // loader.load('static/models/scene.json', function(object) {
        //   var axes = new THREE.AxisHelper(10)
        //   object.add(axes)

        //   sceneManager.scene = object
        //   sceneManager.scenes.push(object)
        //   sceneManager.init()

        //   _.defer(function() {
        //     $start.show()
        //     $progress.hide()
        //   })
        //   if (Config.AUTOSTART && (!window.VRenabled || !hasVRDisplays)) {
        //     hasStarted = true
        //     startScenes()
        //     $aboutButton.addClass('visible')
        //   }
        // })
      })
    })
  })
}
// 初始化大场景(场景管理器[渲染器、计数器等]、资源素材)
function initScene(vrDisplay) {
  // 初始化场景管理器
  sceneManager = new SceneManager({
    vr: vrDisplay !== undefined,
    vrDisplay: vrDisplay,
    preserverDrawingBuffer: vrDisplay !== undefined,
    maxPixelRatio: 1.5, // 最大像素比 = 物理像素 / 设备独立像素(dip)
    fps: true, // 是否显示FPS计数器
    logCalls: true // 是否显示动画调用计数器
  })
  sceneManager.renderer.setClearColor(0xffffff)  // 背景色白色
  // 初始化资源
  initResources()
}

// 初始化场景
if (window.VRenabled && navigator.getVRDisplays) {
  navigator.getVRDisplays().then(function(vrDisplays) {
    if (vrDisplays.length > 0) {
      initScene(vrDisplays[0])
      hasVRDisplays = true
    } else {
      console.log('没有 VR 显示设备')
      initScene()
    }
  })['catch'](function(e) {
    console.error('没有 VR 显示设备')
    console.error(e)
  })
} else {
  initScene()
}

// VR检测
if (window.VRenabled) {
  if (!isLatestAvailable) {
    $warning.html('<img src="/static/img/missing-headset.png">您的 WebVR 不是最新版本。<a href="http://webvr.info">修复</a>')
  }
} else {
  $warning.html('<img src="/static/img/missing-headset.png">您的浏览器不支持 WebVR。<br/>已返回到非VR模式。')
}

// 页面交互事件
$('document').ready(function() {
  onResize()
  window.isMobile && $('body').addClass('mobile')
  $sharing.on('tap', function() {
    var url = $(this).data('href'),
      width = $(this).data('width'),
      height = $(this).data('height')
    openShareWindow(url, width, height)
  }.bind(this))
  $aboutLink.on('tap', function() {
    $panelContainer.addClass('state-about')
  })
  $closeAbout.on('tap', function() {
    hasStarted ? closeAbout() : $panelContainer.removeClass('state-about')
  })
  $changeWallColor.on('tap', function() {
    window.InteriorScene.getObjectByName('wall_right').material.color.setHex(this.getAttribute('data-color'))
  })
  $changeFloorPattern.on('tap', function() {
    const pattern = this.getAttribute('data-pattern')
    function getMaterialsForObject(object) {
      if (object) {
        var materials = object.getObjectByName('materials')
        if (materials) {
          return _.map(materials.children, function(material) {
            var clone = material.children.length > 0 ? material.children[0].material.clone() : material.material.clone()
            return clone
          })
        }
      }
    }
    var mesh = window.InteriorScene.getObjectByName('floor')
    var materials = getMaterialsForObject(mesh)
    var material = materials[pattern]
    var meshClone = mesh.clone()
    mesh.parent.add(meshClone)
    mesh.materialClone = meshClone
    mesh.targetMaterial = material
    meshClone.material = material
    // material.transparent = true
    // material.depthWrite = false
    // material.opacity = 0
    // mesh.parent.remove(mesh.materialClone)
    // mesh.materialClone = null
  })
  $start.on('tap', function() {
    debugger
    if (!hasStarted) {
      hasStarted = true
      if (!window.VRenabled) {
        if (window.isMobile) {
          $panel.hide()
          startScenes()
        } else {
          $panel.addClass('hidden')
          setTimeout(function() {
            $panel.hide()
            $border.addClass('hidden')
            setTimeout(function() {
              startScenes()
            }, 400)
          }, 700)
        }
      }
    }
  })
  $aboutButton.on('tap', function(event) {
    console.log(1)
    $aboutButton.removeClass('visible')
    $panel.addClass('visible')
  })
  sceneManager.on('closeAbout', function() {
    closeAbout()
  })
  $panel.on('mouseenter', function() {
    $('body').removeClass('hovering')
  })
  $(window).on('resize', onResize)
})
