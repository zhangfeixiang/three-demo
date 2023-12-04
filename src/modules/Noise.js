// 63 噪音场景
import ShaderScripts from './ShaderScripts'
import THREE from './../../static/js/three.min.js'

var Noise = function() {
  this.target = new THREE.WebGLRenderTarget(512, 512, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBFormat
  })
  this.target.texture.generateMipmaps = false
  this.material = new THREE.ShaderMaterial({
    vertexShader: ShaderScripts['noise_vs'],
    fragmentShader: ShaderScripts['noise_fs']
  })
  this.scene = new THREE.Scene()
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) // 正投影相机
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
  this.scene.add(mesh)
}
Noise.prototype = {
  render: function(renderer) {
    renderer.render(this.scene, this.camera, this.target)
  }
}

export default Noise
