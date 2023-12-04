import Config from './Config'
import ResourceLoader from './ResourceLoader'
import ResourceManager from './ResourceManager'
import SceneLoader from './SceneLoader'
import SceneManager from './SceneManager'
import VRDetector from './VRDetector'
import scriptExt from './ScriptExtension'
import jQuery from 'jquery'
import _ from 'lodash'
import ZFX from './../../static/js/three.min.js'

window.VRenabled = VRDetector.isAvailable()

var isLatestAvailable = VRDetector.isLatestAvailable(),
  sceneManager, $ = jQuery,
  interiorGeometry = 'interior2',
  exteriorGeometry = 'exterior2',
  startGeometry = 'start',
  assetsDir = window.isMobile ? 'static/assets_mobile/' : 'static/assets/',
  $sharing = $('[data-ref="sharing"]'),
  $panelContainer = $('[data-ref="panel_container"]'),
  $aboutLink = $('[data-ref="about_link"]'),
  $closeAbout = $('[data-ref="close_about"]'),
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
  $titleScreenFooter = $('[data-ref="titlescreen_footer"]'),
  hasStarted = false,
  hasVRDisplays = false

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
  // console.log('onResize')
  window.isMobile && _.defer(function() {
    var t = $titleScreenMain.outerHeight(true) - $titleScreenIllustration.height(),
      e = $titleScreenFooter.outerHeight(),
      n = window.innerHeight ? window.innerHeight : $(window).height(),
      i = n - (t + e)
    $titleScreenIllustration.css('height', i)
  })
}

// 初始化大场景
function initScene(vrDisplay) {
  // 初始化场景管理器
  sceneManager = new SceneManager({
    vr: void 0 !== vrDisplay,
    vrDisplay: vrDisplay,
    preserveDrawingBuffer: void 0 !== vrDisplay,
    maxPixelRatio: 1.5,
    fps: true,  // 显示FPS计数器
    logCalls: true // 显示调用次数计数器
  })
  sceneManager.renderer.setClearColor(0xffffff)  // 背景色白色
  // 初始化素材资源
  initResources()
}

// 加载几何体场景及其脚本配置
function loadScene(name) {
  ResourceManager.texturePath = assetsDir + name + '/'
  return SceneLoader.loadScene(name, assetsDir + 'scenes/', sceneManager, scriptExt)
}

// 初始化素材资源（几何体、脚本、纹理、立方体贴图）
async function initResources() {
  $progress.show()
  onResize()
  var resources = {
    geometries: [interiorGeometry, exteriorGeometry, startGeometry],  // 室内外及启动几何体
    sh: ['room', 'studio'],  // 房间和studio？脚本
    textures: ['static/textures/white.png', 'static/textures/normal.png', 'static/textures/waternormals.jpg', 'static/textures/marker.png', 'static/textures/circle.png', 'static/textures/corner-gradient.png', 'static/textures/flare.png']
  }

  
  if (ZFX.Extensions.get('EXT_shader_texture_lod')) {
    resources.cubemaps = ['room/cubemap.bin']
  } else {
    resources.panoramas = ['room/panorama.bin']
  }
  ResourceManager.environmentPath = assetsDir + 'environments'  // 设置资源管理器的环境资源路径
  ResourceManager.geometryPath = assetsDir + 'scenes/data/'  // 设置资源管理器的几何体资源路径

  console.log('load', resources)
  var resourceLoader = new ResourceLoader(resources);

  resourceLoader.load().then(function(resources) {
    debugger;
    console.log('loaded')
    // 加载几何体场景及其脚本配置
    loadScene(startGeometry).then(function() {
      loadScene(exteriorGeometry).then(function() {
        loadScene(interiorGeometry).then(function() {
          // 各类资源全部就位后，初始化场景
          sceneManager.init()
          // _.defer(function() {
          //   $start.show()
          //   $progress.hide()
          // })
          startScene()
          // 如果可以自动启动，则启动场景
          if (Config.AUTOSTART && (!window.VRenabled || !hasVRDisplays)) {
            hasStarted = true
            startScene()
            $aboutButton.addClass('visible')
          }
        })
      })
    })
  }).catch(function(e) {
    console.log('error', e)
  })
}

// 启动场景
function startScene() {
  hasVRDisplays && sceneManager.enterVR()
  // 
  console.log('sceneManager.start')
  sceneManager.start()
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

// 资源加载进度
ResourceManager.manager.onProgress = function(t, e, n) {
  var progress = Math.round(e / Config.ASSET_COUNT * 100);
  console.log('progress', progress)
  $percentage.html(progress)
  onResize()
}

ResourceManager.manager.onError = function(t) {
 console.log('error', t)
}

// VR检测
if (window.VRenabled) {
  if (!isLatestAvailable) {
    $warning.html('<img src="/static/img/missing-headset.png">您的 WebVR 不是最新版本。<a href="http://webvr.info">修复</a>')
  }
} else {
  $warning.html('<img src="/static/img/missing-headset.png">您的浏览器不支持 WebVR。<br/>已返回到非VR模式。')
}

// 初始化场景
if (window.VRenabled && navigator.getVRDisplays) {
  // 初始化VR场景
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      initScene(displays[0])
      hasVRDisplays = true
    } else {
      hasVRDisplays = false
      console.log('No VR display')
      $warning.html('<img src="/static/img/missing-headset.png">您的浏览器支持 WebVR，但我们未能找到您的头戴式设备。已返回到非VR模式。')
      initScene()
    }
  })['catch'](function() {
    console.error('No VR display')
  })
} else {
  initScene()
}

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
  $start.on('tap', function() {
    if (!hasStarted) {
      hasStarted = true
      if (!window.VRenabled) {
        if (window.isMobile) {
          $panel.hide()
          startScene()
        } else {
          $panel.addClass('hidden')
          setTimeout(function() {
            $panel.hide()
            $border.addClass('hidden')
            setTimeout(function() {
              startScene()
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
