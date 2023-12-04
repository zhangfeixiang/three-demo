// 62
import ShaderScripts from './ShaderScripts'
import BaseShaderMaterial from './BaseShaderMaterial'
import _ from 'lodash'
import THREE from './../../static/js/three.min.js'

class StrokeShaderMaterial extends BaseShaderMaterial {
  constructor(parameters) {
    parameters = Object.assign({
      vertexShader: ShaderScripts['stroke_vs'],
      fragmentShader: ShaderScripts['stroke_fs'],
      uniforms: {
        diffuse: {
          type: 'c',
          value: new THREE.Color(0xffffff)
        },
        opacity: {
          type: 'f',
          value: 1
        },
        objectScale: {
          type: 'f',
          value: 1
        }
      }
    }, parameters)
    super(parameters)
    Object.keys(this.uniforms).forEach(function(key) {
      this.onPropertyChange(key, function(value) {
        this.uniforms[key].value = value
      }.bind(this))
    }.bind(this), this)
    this.depthWrite = false
  }
  clone(obj) {
    var material = obj || new StrokeShaderMaterial()
    super.clone(material)
    // ShaderMaterial.prototype.clone.call(this, instance)
    material.name = this.name
    material.transparent = this.transparent
    _.each(this.uniforms, function(uniform, index) {
      if (uniform.type === 'v2' || uniform.type === 'm4') {
        material.uniforms[index].value.copy(uniform.value)
      } else {
        material.uniforms[index].value = uniform.value
      }
    }, this)
    return material
  }
}

export default StrokeShaderMaterial
