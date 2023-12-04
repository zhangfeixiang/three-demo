/**
 * 26: 物理贴图材质(Physically based rendering Material)
 */
import _ from 'lodash'
import THREE from './../../static/js/three.min.js'
import BaseRawShaderMaterial from './BaseRawShaderMaterial'
import ResourceManager from './ResourceManager'
import ZFX from './../../static/js/three.min.js'

function ensureValue(value, defaultValue) {
  return value !== undefined ? value : defaultValue
}

const MaterialProps = {
  aoFactor: 'uAOPBRFactor',
  albedoFactor: 'uAlbedoPBRFactor',
  glossFactor: 'uGlossinessPBRFactor',
  metalFactor: 'uMetalnessPBRFactor',
  opacity: 'uOpacityFactor',
  normalMapFactor: 'uNormalMapFactor',
  f0Factor: 'uSpecularF0Factor',
  albedoMap: 'sTextureAlbedoMap',
  normalMap: 'sTextureNormalMap',
  normalMap2: 'sTextureNormalMap2',
  aoMap: 'sTextureAOMap',
  aoMap2: 'sTextureAOMap2',
  metalGlossMap: 'sTextureMetalGlossMap',
  packedMap: 'sTexturePackedMap',
  emissiveMap: 'sTextureEmissiveMap',
  lightMap: 'sTextureLightMap',
  lightMapM: 'sTextureLightMapM',
  lightMapDir: 'sTextureLightMapDir',
  cubemap: 'sSpecularPBR',
  panorama: 'sPanoramaPBR',
  sph: 'uDiffuseSPH',
  exposure: 'uEnvironmentExposure',
  transform: 'uEnvironmentTransform',
  occludeSpecular: 'uOccludeSpecular',
  alphaTest: 'uAlphaTest',
  color: 'uColor',
  contrast: 'uContrast'
}

class PBRMaterial extends BaseRawShaderMaterial {
  constructor(params) {
    params = Object.assign({
      uniforms: {
        uAOPBRFactor: {
          type: 'f',
          value: 1
        },
        uAlbedoPBRFactor: {
          type: 'f',
          value: 1
        },
        uGlossinessPBRFactor: {
          type: 'f',
          value: 1
        },
        uMetalnessPBRFactor: {
          type: 'f',
          value: 1
        },
        uNormalMapFactor: {
          type: 'f',
          value: 1
        },
        uSpecularF0Factor: {
          type: 'f',
          value: 1
        },
        uEnvironmentExposure: {
          type: 'f',
          value: 1
        },
        uOpacityFactor: {
          type: 'f',
          value: 1
        },
        sTextureAlbedoMap: {
          type: 't',
          value: null
        },
        sTextureAlbedoMap2: {
          type: 't',
          value: null
        },
        sTextureNormalMap: {
          type: 't',
          value: null
        },
        sTextureNormalMap2: {
          type: 't',
          value: null
        },
        sTextureAOMap: {
          type: 't',
          value: null
        },
        sTextureAOMap2: {
          type: 't',
          value: null
        },
        sTextureMetalGlossMap: {
          type: 't',
          value: null
        },
        sTexturePackedMap: {
          type: 't',
          value: null
        },
        sTextureEmissiveMap: {
          type: 't',
          value: null
        },
        sTextureLightMap: {
          type: 't',
          value: null
        },
        sTextureLightMapM: {
          type: 't',
          value: null
        },
        sTextureLightMapDir: {
          type: 't',
          value: null
        },
        sSpecularPBR: {
          type: 't',
          value: null
        },
        sPanoramaPBR: {
          type: 't',
          value: null
        },
        uTextureEnvironmentSpecularPBRLodRange: {
          type: 'v2',
          value: new THREE.Vector2(10, 5)
        },
        uTextureEnvironmentSpecularPBRTextureSize: {
          type: 'v2',
          value: new THREE.Vector2()
        },
        uDiffuseSPH: {
          type: '3fv',
          value: null
        },
        uFlipY: {
          type: 'i',
          value: 0
        },
        uOccludeSpecular: {
          type: 'i',
          value: 0
        },
        uOutputLinear: {
          type: 'i',
          value: 0
        },
        uEnvironmentTransform: {
          type: 'm4',
          value: new THREE.Matrix4()
        },
        uMode: {
          type: 'i',
          value: 0
        },
        uColor: {
          type: 'c',
          value: null
        },
        uAlphaTest: {
          type: 'f',
          value: 0
        },
        uContrast: {
          type: 'f',
          value: 1.1
        },
        offsetRepeat: {
          type: 'v4',
          value: new THREE.Vector4(0, 0, 1, 1)
        },
        offsetRepeatDetail: {
          type: 'v4',
          value: new THREE.Vector4(0, 0, 1, 1)
        },
        viewLightDir: {
          type: 'v3',
          value: new THREE.Vector3()
        },
        lightColor: {
          type: 'c',
          value: new THREE.Color()
        },
        highlights: {
          type: 'i',
          value: 1
        }
      }
    }, params)
    super(params)
    Object.keys(this.uniforms).forEach(function(uniform) {
      this.onPropertyChange(uniform, function(value) {
        this.uniforms[uniform].value = value
      }.bind(this))
    }, this)
    _.each(MaterialProps, function(t, e) {
      this.onPropertyChange(e, function(e) {
        this[t] = e
      }.bind(this))
    }.bind(this), this)
    this.extensions = {
      derivatives: true,
      shaderTextureLOD: ZFX.Extensions.get("EXT_shader_texture_lod") != null
    }
    this.pbr = true
  }

  _clone(object) {
    debugger
    // TODO：何时调用？
    var material = object || new PBRMaterial()
    super.clone(material)
    material.name = this.name
    material.transparent = this.transparent
    _.each(this.uniforms, function(uniform, index) {
      var uniformType = uniform.type
      if (uniformType === 'v2' || uniformType === 'm4') {
        debugger
        // TODO: copy和直接赋值，有何区别？
        material.uniforms[index].value.copy(uniform.value)
       } else {
        material.uniforms[index].value = uniform.value
       }
    }, this)
    return material
  }

  clone() {
    var material = PBRMaterial.create(this.createOptions)
    material.uuid = THREE.Math.generateUUID()
    return material
  }

  updateEnvironmentTransform(camera) {
    var quaternion = new THREE.Quaternion()
    camera.getWorldQuaternion(quaternion).inverse()
    this.uniforms.uEnvironmentTransform.value.makeRotationFromQuaternion(quaternion)
  }

  refreshOffsetRepeat() {
    var map
    // debugger
    // TODO 查看下列三个图是否为空
    if (this.defines.USE_ALBEDOMAP) { // 反射图
      map = this.sTextureAlbedoMap
    } else if (this.defines.USE_NORMALMAP) { // 法线图
      map = this.sTextureNormalMap
    } else if (this.defines.USE_AOMAP) { // 环境阻塞AO图
      map = this.sTextureAOMap
    }
    if (map !== undefined) {
      var offset = map.offset, repeat = map.repeat
      this.uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y)
    }
  }

  refreshOffsetRepeatDetail() {
    var normalMap2 = this.sTextureNormalMap2
    if (normalMap2 !== undefined) {
      var offset = normalMap2.offset, repeat = normalMap2.repeat
      this.uniforms.offsetRepeatDetail.value.set(offset.x, offset.y, repeat.x, repeat.y)
    }
  }

  refreshUniforms(camera) {
    this.updateEnvironmentTransform(camera)
  }

  static create(options) {
    var material = new PBRMaterial({
      vertexShader: options.vertexShader,
      fragmentShader: options.fragmentShader
    })
    material.createOptions = options
    material.uuid = options.uuid
    material.name = options.name
    material.transparent = ensureValue(options.transparent, false)
    material.polygonOffset = ensureValue(options.polygonOffset, false)
    material.polygonOffsetUnits = ensureValue(options.polygonOffsetUnits, 0)
    material.polygonOffsetFactor = ensureValue(options.polygonOffsetFactor, 0)

    var specularPBR, panoramaPBR,
      whiteTexture = ResourceManager.getTexture('static/textures/white.png'),
      normalTexture = ResourceManager.getTexture('static/textures/normal.png'),
      albedoMap = options.albedoMap || whiteTexture,
      albedoMap2 = options.albedoMap2 || whiteTexture,
      normalMap = options.normalMap || normalTexture,
      normalMap2 = options.normalMap2 || normalTexture,
      aoMap = options.aoMap || whiteTexture,
      aoMap2 = options.aoMap2 || whiteTexture,
      metalGlossMap = options.metalGlossMap || whiteTexture,
      packedMap = options.packedMap || whiteTexture,
      emissiveMap = options.emissiveMap || whiteTexture,
      lightMap = options.lightMap || whiteTexture,
      lightMapM = options.lightMapM || whiteTexture,
      lightMapDir = options.lightMapDir || whiteTexture,
      envSH = ResourceManager.getSH(options.environment)

    material.extensions.shaderTextureLOD ? specularPBR = ResourceManager.getCubemap(options.environment) : panoramaPBR = ResourceManager.getPanorama(options.environment)
    options.albedoMap && (material.defines.USE_ALBEDOMAP = true)
    options.albedoMap2 && (material.defines.USE_ALBEDOMAP2 = true)
    options.normalMap && (material.defines.USE_NORMALMAP = true)
    options.normalMap2 && (material.defines.USE_NORMALMAP2 = true)
    options.aoMap && (material.defines.USE_AOMAP = true)
    options.aoMap2 && (material.defines.USE_AOMAP2 = true)
    options.metalGlossMap && (material.defines.USE_METALGLOSSMAP = true)
    options.packedMap && (material.defines.USE_PACKEDMAP = true)
    options.emissiveMap && (material.defines.USE_EMISSIVEMAP = true)
    options.lightMap && (material.defines.USE_LIGHTMAP = true)
    options.lightMapDir && (material.defines.USE_LIGHTMAP_DIR = true)

    material.uAlbedoPBRFactor = ensureValue(options.albedoFactor, 1)
    material.uNormalMapFactor = ensureValue(options.normalMapFactor, 1)
    material.uMetalnessPBRFactor = ensureValue(options.metalFactor, 1)
    material.uGlossinessPBRFactor = ensureValue(options.glossFactor, 1)
    material.uAOPBRFactor = ensureValue(options.aoFactor, 1)
    material.uSpecularF0Factor = ensureValue(options.f0Factor, 0.5)
    material.uEnvironmentExposure = ensureValue(options.exposure, 1)
    material.occludeSpecular = ensureValue(options.occludeSpecular ? 1 : 0, 1)
    material.uFlipY = ensureValue(options.flipNormals, 0)
    material.opacity = ensureValue(options.opacity, 1)
    material.color = (new THREE.Color()).setHex(options.color !== undefined ? options.color : 0xffffff)
    material.side = ensureValue(options.side, THREE.FrontSide)

    albedoMap.needsUpdate = true
    albedoMap2.needsUpdate = true
    normalMap.needsUpdate = true
    normalMap2.needsUpdate = true
    aoMap.needsUpdate = true
    aoMap2.needsUpdate = true
    metalGlossMap.needsUpdate = true
    packedMap.needsUpdate = true
    emissiveMap.needsUpdate = true
    lightMap.needsUpdate = true
    lightMapM.needsUpdate = true
    lightMapDir.needsUpdate = true
    specularPBR && (specularPBR.needsUpdate = true)
    panoramaPBR && (panoramaPBR.needsUpdate = true)
    material.sTextureAlbedoMap = albedoMap
    material.sTextureAlbedoMap2 = albedoMap2
    material.sTextureNormalMap = normalMap
    material.sTextureNormalMap2 = normalMap2
    material.sTextureAOMap = aoMap
    material.sTextureAOMap2 = aoMap2
    material.sTextureMetalGlossMap = metalGlossMap
    material.sTexturePackedMap = packedMap
    material.sTextureEmissiveMap = emissiveMap
    material.sTextureLightMap = lightMap
    material.sTextureLightMapM = lightMapM
    material.sTextureLightMapDir = lightMapDir
    material.sSpecularPBR = specularPBR
    material.sPanoramaPBR = panoramaPBR

    envSH && (material.uDiffuseSPH = new Float32Array(envSH, 27))
    material.uEnvironmentTransform = new THREE.Matrix4()
    options.alphaTest && (material.alphaTest = options.alphaTest, material.defines.ALPHATEST = true)
    if (material.extensions.shaderTextureLOD) {
      material.defines.CUBEMAP = true
      material.uniforms.uTextureEnvironmentSpecularPBRTextureSize.value.set(256, 256)
    } else {
      material.defines.PANORAMA = true
      material.uniforms.uTextureEnvironmentSpecularPBRTextureSize.value.set(1024, 1024)
    }
    material.refreshOffsetRepeat()
    material.refreshOffsetRepeatDetail()
    return material
  }
}

export default PBRMaterial
