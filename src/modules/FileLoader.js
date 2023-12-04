// 12: 自定义文件加载器
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'

function i(data) {
  var dataPart = data.slice(0, 27),
    n = 1 / (2 * Math.sqrt(Math.PI)),
    i = -(0.5 * Math.sqrt(3 / Math.PI)),
    r = -i,
    o = i,
    a = 0.5 * Math.sqrt(15 / Math.PI),
    s = -a,
    c = 0.25 * Math.sqrt(5 / Math.PI),
    u = s,
    l = 0.25 * Math.sqrt(15 / Math.PI),
    h = [n, n, n, i, i, i, r, r, r, o, o, o, a, a, a, s, s, s, c, c, c, u, u, u, l, l, l]
  return h.map(function(t, n) {
    return t * dataPart[n]
  })
}
// console.warn( 'THREE.XHRLoader has been renamed to THREE.FileLoader.' );
var FileLoader = function(loadingManager) {
  THREE.XHRLoader.call(this);
  this.manager = void 0 !== loadingManager ? loadingManager : THREE.DefaultLoadingManager
}
FileLoader.prototype = Object.create(THREE.XHRLoader.prototype)
FileLoader.prototype.load = function(url, onLoad, onProgress, onError) {
  THREE.XHRLoader.prototype.load.call(this, url, function(json) {
    var data = JSON.parse(json),
      r = i(data)
    onLoad(r)
  }, onProgress, onError)
}

export default FileLoader
