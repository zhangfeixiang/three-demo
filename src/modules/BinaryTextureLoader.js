// 11: 二进制纹理加载器
import THREE from './../../static/js/three.min.js'

// ???
function i(size, e, data) {
  for (var i = size * size, r = 2 * size * size, o = 3 * size * size, a = 0, s = 0; i > s; s++) {
    data[a++] = e[s]
    data[a++] = e[s + i]
    data[a++] = e[s + r]
    data[a++] = e[s + o]
  }
}
// console.warn( 'THREE.BinaryTextureLoader has been renamed to THREE.DataTextureLoader.' );
var BinaryTextureLoader = function(size, interleaving, loadingManager) {
  this.manager = void 0 !== loadingManager ? loadingManager : THREE.DefaultLoadingManager
  this._size = size
  this._interleaving = interleaving
}
BinaryTextureLoader.prototype = Object.create(THREE.DataTextureLoader.prototype)
BinaryTextureLoader.prototype._parser = function(t) {
  var data, size = this._size
  if (this._interleaving) {
    var r = size * size * 4,
      o = new Uint8Array(t)
    data = new Uint8Array(r)
    i(size, o, data)
  } else {
    data = new Uint8Array(t)
  }
  return {
    width: size,
    height: size,
    data: data,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    type: THREE.UnsignedByteType
  }
}

export default BinaryTextureLoader
