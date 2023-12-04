/**
 * 重写THREE材质加载器(加载JSON格式的材质)解析方法。
 * 使其追加PBR材质和Matcap材质。
 */
import THREE from './../../static/js/three.min.js'
// require('./BaseShaderMaterial')
import PBRMaterial from './PBRMaterial'
import MatcapMaterial from './MatcapMaterial'
import ShaderScripts from './ShaderScripts'
// require('./ResourceManager')

var parse = THREE.MaterialLoader.prototype.parse
// var shaders = null
// THREE.MaterialLoader.setShaders = function(t) {
//   shaders = t
// }

THREE.MaterialLoader.prototype.parse = function(json) {
  // var self = this
  // function getTexture(name) {
  //   if (self.textures[name] === undefined) {
  //     console.warn('THREE.MaterialLoader: Undefined texture', name)
  //   }
  //   return self.textures[name]
  // }

  var material

  // 新版着色器材质不支持color
  // if (json.type === 'ShaderMaterial') {
  //   delete json['color']
  // }

  // if (json.type === 'MultiMaterial') {
  //   return null
    // var ma, multiMaterials = []
    // json.materials.forEach(function(j) {
    //   ma = parse.call(this, j)
    //   multiMaterials.push(ma)
    // }, this)

    // debugger
    // json.isMultiMaterial = true
    // json.clone = function() {
    //   return json.slice()
    // }
  // }

  try {
    material = parse.call(this, json)
  } catch (TypeError) {
    console.error('出错啦')
  }

  // 自定义的带有真实场景光照等捕获功能的材质
  if (json.customType && json.customType === 'MatcapMaterial') {
    return MatcapMaterial.create({
      uuid: json.uuid,
      name: json.name,
      normalMap: json.normalMap,
      matcapMap: THREE.ImageUtils.loadTexture('static/textures/matcap.jpg'),
      normalMapFactor: 1
    })
  }

  // PBR材质
  if (json.customType && json.customType === 'PBRMaterial') {
    var metalGlossMap = json.metalGlossMap ? this.getTexture(json.metalGlossMap) : null
    var albedoMap2 = json.map2 ? this.getTexture(json.map2) : null,
      normalMap2 = json.normalMap2 ? this.getTexture(json.normalMap2) : null,
      aoMap2 = json.aoMap2 ? this.getTexture(json.aoMap2) : null,
      lightMapM = json.lightMapM ? this.getTexture(json.lightMapM) : null,
      lightMapDir = json.lightMapDir ? this.getTexture(json.lightMapDir) : null,
      emissiveMap = json.emissiveMap ? this.getTexture(json.emissiveMap) : null,
      packedMap = json.packedPBRMap ? this.getTexture(json.packedPBRMap) : null
    return PBRMaterial.create({
      vertexShader: ShaderScripts['pbr_vs'],
      fragmentShader: ShaderScripts['pbr_fs'],
      uuid: json.uuid,
      name: json.name,
      color: json.color,
      opacity: material.opacity,
      transparent: material.transparent,
      alphaTest: material.alphaTest,
      environment: json.environment,
      exposure: json.exposure,
      albedoMap: material.map,
      albedoMap2: albedoMap2,
      metalGlossMap: metalGlossMap,
      packedMap: packedMap,
      metalFactor: json.metalFactor,
      glossFactor: json.glossFactor,
      normalMapFactor: json.normalFactor,
      normalMap: material.normalMap,
      normalMap2: normalMap2,
      lightMap: material.lightMap,
      lightMapM: lightMapM,
      lightMapDir: lightMapDir,
      aoMap: material.aoMap,
      aoMap2: aoMap2,
      aoFactor: json.aoFactor,
      occludeSpecular: json.occludeSpecular,
      emissiveMap: emissiveMap
    })
  }

  // 天空材质
  if (json.customType && json.customType === 'SkyboxMaterial') {
    var cube = THREE.ShaderLib.cube
    material.vertexShader = ShaderScripts['skybox_vs']
    material.fragmentShader = ShaderScripts['skybox_fs']
    material.uniforms = THREE.UniformsUtils.clone(cube.uniforms)
    material.uniforms.tCube.value = this.getTexture(json.cubemap)
  }
  return material
}
