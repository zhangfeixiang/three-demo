// 14: 场景中的3D对象管理器
import THREE from './../../static/js/three.min.js'

var config = {
  uniforms: {
    color: {
      value: new THREE.Color(8355711)
    },
    mirrorSampler: {
      value: null
    },
    textureMatrix: {
      value: new THREE.Matrix4()
    }
  },
  vertexShader: ['uniform mat4 textureMatrix;', 'varying vec4 mirrorCoord;', 'void main() {', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );', 'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );', 'mirrorCoord = textureMatrix * worldPosition;', 'gl_Position = projectionMatrix * mvPosition;', '}'].join('\n'),
  fragmentShader: ['uniform vec3 color;', 'uniform sampler2D mirrorSampler;', 'varying vec4 mirrorCoord;', 'float blendOverlay(float base, float blend) {', 'return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );', '}', 'void main() {', 'vec4 c = texture2DProj(mirrorSampler, mirrorCoord);', 'c = vec4(blendOverlay(color.r, c.r), blendOverlay(color.g, c.g), blendOverlay(color.b, c.b), 1.0);', 'gl_FragColor = c;', '}'].join('\n')
}

function ensureValue(value, defaultValue) {
  return void 0 !== value ? value : defaultValue
}

class Object3D extends THREE.Object3D {
  constructor(renderer, camera, params) {
    super(renderer, camera, params)
    this.name = 'mirror_' + this.id
    this.side = ensureValue(params.side, THREE.DoubleSide)
    this.fog = ensureValue(params.fog, false)
    params = params || {}
    this.matrixNeedsUpdate = true
    var textureWidth = void 0 !== params.textureWidth ? params.textureWidth : 512,
      textureHeight = void 0 !== params.textureHeight ? params.textureHeight : 512
    this.clipBias = void 0 !== params.clipBias ? params.clipBias : 0
    var color = void 0 !== params.color ? new THREE.Color(params.color) : new THREE.Color(8355711)
    this.renderer = renderer
    this.mirrorPlane = new THREE.Plane()
    this.normal = new THREE.Vector3(0, 0, 1)
    this.mirrorWorldPosition = new THREE.Vector3()
    this.cameraWorldPosition = new THREE.Vector3()
    this.rotationMatrix = new THREE.Matrix4()
    this.lookAtPosition = new THREE.Vector3(0, 0, false)
    this.clipPlane = new THREE.Vector4()
    var debugMode = void 0 !== params.debugMode ? params.debugMode : false
    if (debugMode) {
      var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1).normalize(), new THREE.Vector3(0, 0, 0), 10, 0x80ffff),
        geometry = new THREE.Geometry()
      geometry.vertices.push(new THREE.Vector3(-10, -10, 0))
      geometry.vertices.push(new THREE.Vector3(10, -10, 0))
      geometry.vertices.push(new THREE.Vector3(10, 10, 0))
      geometry.vertices.push(new THREE.Vector3(-10, 10, 0))
      geometry.vertices.push(geometry.vertices[0])
      var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: 16777088
      }))
      this.add(arrowHelper)
      this.add(line)
    }
    camera instanceof THREE.PerspectiveCamera ? this.camera = camera : (this.camera = new THREE.PerspectiveCamera(), console.log(this.name + ': camera is not a Perspective Camera!'))
    this.textureMatrix = new THREE.Matrix4()
    this.mirrorCamera = this.camera.clone()
    this.mirrorCamera.matrixAutoUpdate = true
    var options = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    }
    this.renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, options)
    this.renderTarget2 = new THREE.WebGLRenderTarget(textureWidth, textureHeight, options)
    this.initMaterial()
    this.material.uniforms.mirrorSampler.value = this.renderTarget.texture
    this.material.uniforms.color.value = color
    this.material.uniforms.textureMatrix.value = this.textureMatrix
    THREE.Math.isPowerOfTwo(textureWidth) && THREE.Math.isPowerOfTwo(textureHeight) || (this.renderTarget.texture.generateMipmaps = false, this.renderTarget2.texture.generateMipmaps = false)
    this.updateTextureMatrix()
    this.render()
  }
  initMaterial() {
    var uniforms = THREE.UniformsUtils.clone(config.uniforms)
    this.material = new THREE.ShaderMaterial({
      fragmentShader: config.fragmentShader,
      vertexShader: config.vertexShader,
      uniforms: uniforms
    })
  }
  renderWithMirror(mirror) {
    this.updateTextureMatrix()
    this.matrixNeedsUpdate = false
    var camera = mirror.camera
    mirror.camera = this.mirrorCamera
    mirror.renderTemp()
    mirror.material.uniforms.mirrorSampler.value = mirror.renderTarget2.texture
    this.render()
    this.matrixNeedsUpdate = true
    mirror.material.uniforms.mirrorSampler.value = mirror.renderTarget.texture
    mirror.camera = camera
    mirror.updateTextureMatrix()
  }
  updateTextureMatrix() {
    this.updateMatrixWorld()
    this.camera.updateMatrixWorld()
    this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld)
    this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld)
    this.rotationMatrix.extractRotation(this.matrixWorld)
    this.normal.set(0, 0, 1)
    this.normal.applyMatrix4(this.rotationMatrix)
    var cameraWorldVector3 = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition)
    cameraWorldVector3.reflect(this.normal).negate()
    cameraWorldVector3.add(this.mirrorWorldPosition)
    this.rotationMatrix.extractRotation(this.camera.matrixWorld)
    this.lookAtPosition.set(0, 0, -1)
    this.lookAtPosition.applyMatrix4(this.rotationMatrix)
    this.lookAtPosition.add(this.cameraWorldPosition)
    var lookAtVector3 = this.mirrorWorldPosition.clone().sub(this.lookAtPosition)
    lookAtVector3.reflect(this.normal).negate()
    lookAtVector3.add(this.mirrorWorldPosition)
    this.up.set(0, -1, 0)
    this.up.applyMatrix4(this.rotationMatrix)
    this.up.reflect(this.normal).negate()
    this.mirrorCamera.position.copy(cameraWorldVector3)
    this.mirrorCamera.up = this.up
    this.mirrorCamera.lookAt(lookAtVector3)
    this.mirrorCamera.updateProjectionMatrix()
    this.mirrorCamera.updateMatrixWorld()
    this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld)
    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
    this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix)
    this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse)
    this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition)
    this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse)
    this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant)
    var n = new THREE.Vector4(),
      i = this.mirrorCamera.projectionMatrix
    n.x = (Math.sign(this.clipPlane.x) + i.elements[8]) / i.elements[0]
    n.y = (Math.sign(this.clipPlane.y) + i.elements[9]) / i.elements[5]
    n.z = -1
    n.w = (1 + i.elements[10]) / i.elements[14]
    var r = new THREE.Vector4()
    r = this.clipPlane.multiplyScalar(2 / this.clipPlane.dot(n))
    i.elements[2] = r.x
    i.elements[6] = r.y
    i.elements[10] = r.z + 1 - this.clipBias
    i.elements[14] = r.w
  }
  render() {
    this.matrixNeedsUpdate && this.updateTextureMatrix()
    this.matrixNeedsUpdate = true
    for (var t = this; t.parent !== null;) t = t.parent
    if (void 0 !== t && t instanceof THREE.Scene) {
      var e = this.material.visible
      this.material.visible = false
      this.renderer.render(t, this.mirrorCamera, this.renderTarget, true)
      this.material.visible = e
    }
  }
  renderTemp() {
    this.matrixNeedsUpdate && this.updateTextureMatrix()
    this.matrixNeedsUpdate = true
    for (var t = this; t.parent !== null;) t = t.parent
    void 0 !== t && t instanceof THREE.Scene && this.renderer.render(t, this.mirrorCamera, this.renderTarget2, true)
  }
}
export default Object3D
