/**
 * 67: 水波纹法线3D网格
 */
import EnvObject3D from './EnvObject3D'
import ResourceManager from './ResourceManager'
import THREE from './../../static/js/three.min.js'

class WaterNormalsMesh extends THREE.Mesh {
  constructor(params) {
    var waterNormals = ResourceManager.getTexture('static/textures/waternormals.jpg')
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
    var sunDirection = new THREE.Vector3()
    params.light && params.light instanceof THREE.Light ? sunDirection.copy(params.light.position) : sunDirection.set(-0.2, 0.3, -0.5)
    var waterEffect = new EnvObject3D(params.renderer, params.camera, {
      color: 16777215,
      waterNormals: waterNormals,
      transparent: void 0 !== params.transparent ? params.transparent : false,
      sunDirection: sunDirection,
      sunColor: 16777215,
      shininess: 500,
      alpha: 0.35,
      debugMode: false
    })
    if (params.object) {
      super(params.object.geometry, waterEffect.material)
      this.position.copy(params.object.position)
      this.rotation.copy(params.object.rotation)
      this.scale.copy(params.object.scale)
    } else {
      super(new THREE.PlaneBufferGeometry(2000, 2000, 10, 10), waterEffect.material)
      this.rotation.x = 0.5 * -Math.PI
      this.position.y -= 20
    }
    this.effect = waterEffect
    this.add(this.effect)
  }
  update(t) {
    this.effect.material.uniforms.time && (this.effect.material.uniforms.time.value += 0.25 * t.delta)
    this.effect.update()
  }
  render() {
    this.effect.render(this.effect.renderer, this.effect.camera)
  }
}

export default WaterNormalsMesh
