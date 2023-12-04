// 24: 自定义着色材质 ShaderMaterial 的子类 ShaderMaterial2
import BaseShaderMaterial from './BaseShaderMaterial'
import ResourceManager from './ResourceManager'
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

function i(t, e) {
  return void 0 !== t ? t : e
}

var props = {
  normalMapFactor: 'uNormalMapFactor',
  normalMap: 'sTextureNormalMap',
  matcapMap: 'sTextureAOMap'
}

class ShaderMaterial extends BaseShaderMaterial {
  constructor(config) {
    config = Object.assign({
      vertexShader: config.vertexShader,
      fragmentShader: config.fragmentShader,
      uniforms: {
        uNormalMapFactor: {
          type: 'f',
          value: 1
        },
        sTextureMatcapMap: {
          type: 't',
          value: null
        },
        sTextureNormalMap: {
          type: 't',
          value: null
        },
        uFlipY: {
          type: 'i',
          value: 0
        },
        uOutputLinear: {
          type: 'i',
          value: 0
        }
      }
    }, config)
    super(config)
    Object.keys(this.uniforms).forEach(function(t) {
      this.onPropertyChange(t, function(e) {
        this.uniforms[t].value = e
      })
    }.bind(this), this)
    _.each(props, function(t, e) {
      this.onPropertyChange(e, function(e) {
        this[t] = e
      }.bind(this))
    }.bind(this), this)
    this.extensions = {
      derivatives: true
    }
  }

  clone(obj) {
    var instance = obj || new ShaderMaterial()
    BaseShaderMaterial.prototype.clone.call(this, instance)
    instance.name = this.name
    instance.transparent = this.transparent
    _.each(this.uniforms, function(t, n) {
      var i = obj.type
      i === 'v2' || i === 'm4' ? instance.uniforms[n].value.copy(obj.value) : instance.uniforms[n].value = t.value
    }, this)
    return instance
  }

  create(obj) {
    var instance = new ShaderMaterial()
    instance.uuid = obj.uuid
    instance.name = obj.name
    instance.transparent = i(obj.transparent, false)
    instance.polygonOffset = i(obj.polygonOffset, false)
    instance.polygonOffsetUnits = i(obj.polygonOffsetUnits, 0)
    instance.polygonOffsetFactor = i(obj.polygonOffsetFactor, 0)
    var normalMap = (ResourceManager.getTexture('white.png'), obj.normalMap),
      matcapMap = obj.matcapMap
    instance.uNormalMapFactor = i(obj.normalMapFactor, 1)
    instance.uFlipY = i(obj.flipNormals, 0)
    instance.side = i(obj.side, THREE.FrontSide)
    normalMap.needsUpdate = true
    matcapMap.needsUpdate = true
    instance.sTextureNormalMap = normalMap
    instance.sTextureMatcapMap = matcapMap // 材质捕获
    return instance
  }
}

export default ShaderMaterial
