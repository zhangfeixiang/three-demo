// 9: Cubemap贴图纹理加载器
import _ from 'lodash'
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'

function loadARGBMip(sizePow2, srcBuffer, byteArray) {
  // 1*x*x, 2*x*x, 3*x*x
  var r = 1 * sizePow2 * sizePow2, g = 2 * sizePow2 * sizePow2, b = 3 * sizePow2 * sizePow2
  for (var dst = 0, src = 0; r > src; src++) {
    byteArray[dst++] = srcBuffer[src]
    byteArray[dst++] = srcBuffer[src + r]
    byteArray[dst++] = srcBuffer[src + g]
    byteArray[dst++] = srcBuffer[src + b]
  }
}

Math.log2 = Math.log2 || function(t) { return Math.log(t) * Math.LOG2E }

var CubemapLoader = function(size, interleaved, loadingManager) {
  this.manager = void 0 !== loadingManager ? loadingManager : THREE.DefaultLoadingManager
  this._size = size
  this._interleaved = interleaved
}

CubemapLoader.prototype = Object.create(THREE.CompressedTextureLoader.prototype)
CubemapLoader.prototype._parser = function(buffer) {
  // debugger
  var result = [], sizeLog2 = Math.log2(this._size)
  for (var dataOffset = 0, size = 0; sizeLog2 >= size; size++) {
    var sizePow2 = Math.pow(2, sizeLog2 - size),
      dataLength = sizePow2 * sizePow2 * 4
    if (dataOffset >= buffer.byteLength) break
    for (var c = 0; c < 6; c++) {
      var byteArray
      result[c] || (result[c] = [])
      if (result[c] && this._interleaved) {
        var srcBuffer = new Uint8Array(buffer, dataOffset, dataLength)
        byteArray = new Uint8Array(dataLength)
        // debugger
        loadARGBMip(sizePow2, srcBuffer, byteArray)
        // debugger
      } else {
        byteArray = new Uint8Array(buffer, dataOffset, dataLength)
      }
      result[c].push({
        data: byteArray,
        width: sizePow2,
        height: sizePow2
      })
      dataOffset += dataLength
    }
  }
  var data = {
    isCubemap: true,
    mipmaps: _.flatten(result),
    mipmapCount: sizeLog2 + 1,
    width: this._size,
    height: this._size,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearMipMapLinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    type: THREE.UnsignedByteType
  }
  // debugger
  return data
}
export default CubemapLoader
