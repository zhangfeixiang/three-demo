// 27: 原始的自定义着色材质
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

var props = ['side', 'alphaTest', 'transparent', 'depthWrite', 'shading', 'wireframe']

class BaseRawShaderMaterial extends THREE.RawShaderMaterial {
  constructor(params) {
    params = params || {}
    super(params)
    _.each(props, function(prop) {
      var value = params[prop]
      value !== undefined && (this[prop] = value)
    }, this)
  }

  onPropertyChange(uniform, callback) {
    Object.defineProperty(this, uniform, {
      get: function() {
        return this['_' + uniform]
      },
      set: function(value) {
        this['_' + uniform] = value
        callback.call(this, value)
      }
    })
  }

  clone(rawShaderMaterial) {
    var material = rawShaderMaterial || new BaseRawShaderMaterial() // TODO 原来为 Material
    THREE.RawShaderMaterial.prototype.clone.call(this, material)
    // super(material)
    material.shading = this.shading
    material.wireframe = this.wireframe
    material.wireframeLinewidth = this.wireframeLinewidth
    material.fog = this.fog
    material.lights = this.lights
    material.vertexColors = this.vertexColors
    material.skinning = this.skinning
    material.morphTargets = this.morphTargets
    material.morphNormals = this.morphNormals
    return material
  }
}

export default BaseRawShaderMaterial
