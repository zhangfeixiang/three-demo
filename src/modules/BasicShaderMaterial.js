// 60
import BaseShaderMaterial from './BaseShaderMaterial'
import shaders from './ShaderScripts'
import THREE from './../../static/js/three.min.js'

class BasicShaderMaterial extends BaseShaderMaterial {
  constructor(parameters) {
    parameters = Object.assign({
      vertexShader: shaders['clipspace_vs'],
      fragmentShader: shaders['basic_fs'],
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
        bias: {
          type: 'f',
          value: 0
        }
      }
    }, parameters)
    super(parameters)
    Object.keys(this.uniforms).forEach(function(key) {
      this.onPropertyChange(key, function(value) {
        this.uniforms[key].value = value
      })
    }.bind(this), this)
    this.transparent = parameters.transparent
  }
}

export default BasicShaderMaterial
