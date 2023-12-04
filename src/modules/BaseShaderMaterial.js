// 25: ShaderMaterial 着色器材质
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

var props = ['side', 'alphaTest', 'transparent', 'depthWrite', 'shading', 'wireframe']

class BaseShaderMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    parameters = parameters || {}
    super(parameters)
    _.each(props, function(prop) {
      var parameter = parameters[prop]
      void 0 !== parameter && (this[prop] = parameter)
    }, this)
  }

  onPropertyChange(t, e) {
    Object.defineProperty(this, t, {
      get: function() {
        return this['_' + t]
      },
      set: function(n) {
        this['_' + t] = n
        e.call(this, n)
      }
    })
  }

  clone(shaderMaterial) {
    var material = shaderMaterial || new BaseShaderMaterial()
    THREE.Material.prototype.clone.call(this, material)
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

export default BaseShaderMaterial
