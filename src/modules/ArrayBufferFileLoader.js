// 10: 二进制文件加载器
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'

var ArrayBufferFileLoader = function(loadingManager) {
  THREE.XHRLoader.call(this)
  this.setResponseType('arraybuffer')
  this.manager = void 0 !== loadingManager ? loadingManager : THREE.DefaultLoadingManager
}
// console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
// 
ArrayBufferFileLoader.prototype = Object.create(THREE.XHRLoader.prototype)

export default ArrayBufferFileLoader
