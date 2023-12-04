/**
 * 39: 全局配置信息
 */
import THREE from './../../static/js/three.min.js'
import jQuery from 'jquery'
import TWEEN from './../../static/js/tween.js'
import jQueryTap from '../../static/js/jquery.tap.js'
// 全局变量定义
window.TWEEN || (window.TWEEN = TWEEN)
window.jQuery || (window.jQuery = jQuery)
window.jQuery.tap = jQueryTap(document, jQuery);
window.THREE || (window.THREE = THREE)

window.WIDTH = window.innerWidth
window.HEIGHT = window.innerHeight
window.mouseX = 0
window.mouseY = 0
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
window.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

const Config = {
  ASSET_COUNT: 140,
  DEBUG_KEYS: true,
  AUTOSTART: true,
  ENABLE_ZOOM: true,
  ENABLE_PAN: true,
  ENABLE_DAMPING: true // 启用阻尼
}
export default Config
