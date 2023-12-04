/**
 * 21：VR 探测器
 */
var VRDetector = {
  isLatestAvailable: function() {
    return void 0 !== navigator.getVRDisplays
  },
  isAvailable: function() {
    return void 0 !== navigator.getVRDisplays || void 0 !== navigator.getVRDevices
  },
  getMessage: function() {
    var msg
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then(function(e) {
        e.length === 0 && (msg = '支持WebVR，但是没有发现 VR显示设备')
      })
    } else {
      if (navigator.getVRDevices) {
        msg = '您的浏览器支持 WebVR，但不是最新版本。请前往 <a href="http://webvr.info">webvr.info</a> 了解详情。'
      } else {
        msg = '您的浏览器不支持 WebVR。前往 <a href="http://webvr.info">webvr.info</a> 寻求帮助。'
      }
    }
    if (void 0 !== msg) {
      var div = document.createElement('div')
      div.style.position = 'absolute'
      div.style.left = '0'
      div.style.top = '0'
      div.style.right = '0'
      div.style.zIndex = '999'
      div.align = 'center'
      var tip = document.createElement('div')
      tip.style.fontFamily = 'sans-serif'
      tip.style.fontSize = '16px'
      tip.style.fontStyle = 'normal'
      tip.style.lineHeight = '26px'
      tip.style.backgroundColor = '#fff'
      tip.style.color = '#000'
      tip.style.padding = '10px 20px'
      tip.style.margin = '50px'
      tip.style.display = 'inline-block'
      tip.innerHTML = msg
      div.appendChild(tip)
      return div
    }
  },
  getButton: function(t) {
    var button = document.createElement('button')
    button.style.position = 'absolute'
    button.style.left = 'calc(50% - 50px)'
    button.style.bottom = '20px'
    button.style.width = '100px'
    button.style.border = '0'
    button.style.padding = '8px'
    button.style.cursor = 'pointer'
    button.style.backgroundColor = '#000'
    button.style.color = '#fff'
    button.style.fontFamily = 'sans-serif'
    button.style.fontSize = '13px'
    button.style.fontStyle = 'normal'
    button.style.textAlign = 'center'
    button.style.zIndex = '999'
    button.textContent = '进入 VR'
    button.onclick = function() {
      t.isPresenting ? t.exitPresent() : t.requestPresent()
    }
    window.addEventListener('vrdisplaypresentchange', function(n) {
      button.textContent = t.isPresenting ? '退出 VR' : '进入 VR'
    }, false)
    return button
  }
}

export default VRDetector
