// 61
import BaseShaderMaterial from './BaseShaderMaterial'
import shaders from './ShaderScripts'
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

class HighlightsShaderMaterial extends BaseShaderMaterial {
  constructor(parameters) {
    parameters = Object.assign({
      vertexShader: shaders['highlights_vs'],
      fragmentShader: shaders['highlights_fs'],
      uniforms: {
        diffuse: {
          type: 'c',
          value: new THREE.Color(16777215)
        },
        map: {
          type: 't',
          value: null
        },
        offsetRepeat: {
          type: 'v4',
          value: new THREE.Vector4(0, 0, 1, 1)
        },
        opacity: {
          type: 'f',
          value: 1
        },
        threshold: {
          type: 'f',
          value: 0
        },
        range: {
          type: 'f',
          value: 0.1
        },
        noiseMap: {
          type: 't',
          value: null
        }
      }
    }, parameters)
    super(parameters)
    Object.keys(this.uniforms).forEach(function(key) {
      this.onPropertyChange(key, function(value) {
        this.uniforms[key].value = value
      }.bind(this))
    }.bind(this), this)
    this.threshold = 0
    this.sign = 1
    this.lastUpdate = 0
  }
  clone(t) {
    var e = t || new HighlightsShaderMaterial()
    BaseShaderMaterial.prototype.clone.call(this, e)
    e.name = this.name
    e.transparent = this.transparent
    _.each(this.uniforms, function(uniform, index) {
      var uniformType = uniform.type
      uniformType === 'v2' || uniformType === 'm4' ? e.uniforms[index].value.copy(uniform.value) : e.uniforms[index].value = uniform.value
    }, this)
    return e
  }
  updateUniforms(t) {
    var e = 0.35
    this.uniforms.threshold.value += t.delta * e
  }
}

export default HighlightsShaderMaterial
