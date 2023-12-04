/**
 * 54: 环境3D对象
 */
import THREE from './../../static/js/three.min.js'
import MirrorObject3D from './MirrorObject3D'

var EnvConfig = {
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    color: {
      value: new THREE.Color(5592405)
    },
    mirrorSampler: {
      value: null
    },
    textureMatrix: {
      value: new THREE.Matrix4()
    },
    normalSampler: {
      value: null
    },
    alpha: {
      value: 1
    },
    time: {
      value: 0
    },
    distortionScale: {
      value: 20
    },
    noiseScale: {
      value: 1
    },
    sunColor: {
      value: new THREE.Color(8355711)
    },
    sunDirection: {
      value: new THREE.Vector3(0.70707, 0.70707, 0)
    },
    eye: {
      value: new THREE.Vector3()
    }
  }]),
  vertexShader: ['uniform mat4 textureMatrix;', 'varying vec4 mirrorCoord;', 'varying vec3 worldPosition;', 'void main() {', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );', 'vec4 worldPos = modelMatrix * vec4( position, 1.0 );', 'mirrorCoord = textureMatrix * worldPos;', 'worldPosition = worldPos.xyz;', 'gl_Position = projectionMatrix * mvPosition;', '}'].join('\n'),
  fragmentShader: ['precision highp float;', 'uniform sampler2D mirrorSampler;', 'uniform float alpha;', 'uniform float time;', 'uniform float distortionScale;', 'uniform sampler2D normalSampler;', 'uniform vec3 sunColor;', 'uniform vec3 sunDirection;', 'uniform vec3 eye;', 'uniform vec3 color;', 'varying vec4 mirrorCoord;', 'varying vec3 worldPosition;', 'vec4 getNoise( vec2 uv )', '{', 'float uvScale = 0.5;', 'float t = time * uvScale;', ' vec2 uv0 = ( uv / 20.0 ) + vec2(t / 17.0, t / 29.0);', '    vec2 uv1 = (uv / 30.0) - vec2( t / -19.0, t / 31.0 );', '   vec2 uv2 = uv / vec2( 9.0, 18.0 ) + vec2( t / 101.0, t / 97.0 );', '    vec2 uv3 = uv / vec2( 13.0, 20.0 ) - vec2( t / 109.0, t / -113.0 );', 'uv0 /= uvScale;', 'uv1 /= uvScale;', 'uv2 /= uvScale;', 'uv3 /= uvScale;', ' vec4 noise = texture2D( normalSampler, uv0 ) + texture2D( normalSampler, uv1 ) + texture2D(normalSampler, uv2) + texture2D(normalSampler, uv3);', ' return noise * 0.5 - 1.0;', '}', 'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor )', '{', '    vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );', ' float direction = max( 0.0, dot( eyeDirection, reflection ) );', '  specularColor += pow( direction, shiny ) * sunColor * spec;', ' diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;', '}', THREE.ShaderChunk.common, THREE.ShaderChunk.fog_pars_fragment, 'float blendOverlay(float base, float blend) {', 'return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );', '}', 'void main()', '{', '  vec4 noise = getNoise( worldPosition.xz );', '  vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );', '    vec3 diffuseLight = vec3(0.0);', '  vec3 specularLight = vec3(0.0);', ' vec3 worldToEye = eye - worldPosition;', '  vec3 eyeDirection = normalize( worldToEye );', '    sunLight( surfaceNormal, eyeDirection, 200.0, 1.5, 0.5, diffuseLight, specularLight );', '  float distance = length(worldToEye);', '    vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;', ' vec4 mirrorDistord = mirrorCoord;', ' mirrorDistord.x += distortion.x;', ' mirrorDistord.w += distortion.y;', '  vec3 reflectionSample = texture2DProj( mirrorSampler, mirrorDistord ).rgb;', 'reflectionSample = vec3(0.565, 0.714, 0.831);', ' float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );', '   float rf0 = 0.3;', ' float d = 1.0 - clamp(distance / 1500.0, 0.0, 1.0);', '    float reflectance = d * clamp(rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 ), 0.0, 1.0);', ' reflectance = 1.0;', '  vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * color;', '  vec3 albedo = mix( sunColor * diffuseLight * 0.3 + scatter, ( mix(scatter, reflectionSample, 0.75) + reflectionSample * specularLight ), reflectance );', ' vec3 outgoingLight = albedo;', THREE.ShaderChunk.fog_fragment, '    gl_FragColor = vec4( outgoingLight, max(alpha, specularLight.r) );', '}'].join('\n')
}

function ensureValue(value, defaultValue) {
  return void 0 !== value ? value : defaultValue
}

class EnvObject3D extends MirrorObject3D {
  constructor(renderer, camera, params) {
    super(renderer, camera, params)
    this.clipBias = ensureValue(params.clipBias, 0)
    this.alpha = ensureValue(params.alpha, 1)
    this.time = ensureValue(params.time, 0)
    this.normalSampler = ensureValue(params.waterNormals, null)
    this.sunDirection = ensureValue(params.sunDirection, new THREE.Vector3(0.70707, 0.70707, 0))
    this.sunColor = new THREE.Color(ensureValue(params.sunColor, 16777215))
    this.eye = ensureValue(params.eye, new THREE.Vector3(0, 0, 0))
    this.distortionScale = ensureValue(params.distortionScale, 10)
    this.side = ensureValue(params.side, THREE.DoubleSide)
    this.fog = ensureValue(params.fog, false)
    params.transparent && (this.material.transparent = params.transparent)
    this.material.uniforms.alpha.value = this.alpha
    this.material.uniforms.time.value = this.time
    this.material.uniforms.normalSampler.value = this.normalSampler
    this.material.uniforms.sunColor.value = this.sunColor
    this.material.uniforms.sunDirection.value = this.sunDirection
    this.material.uniforms.distortionScale.value = this.distortionScale
    this.material.uniforms.eye.value = this.eye
  }

  initMaterial() {
    var uniforms = THREE.UniformsUtils.clone(EnvConfig.uniforms)
    this.material = new THREE.ShaderMaterial({
      fragmentShader: EnvConfig.fragmentShader,
      vertexShader: EnvConfig.vertexShader,
      uniforms: uniforms,
      side: this.side,
      fog: this.fog
    })
  }
  updateTextureMatrix() {
    super.updateTextureMatrix()
    var vector3 = new THREE.Vector3()
    vector3.setFromMatrixPosition(this.camera.matrixWorld)
    this.eye = vector3
    this.material.uniforms.eye.value = this.eye
  }
  update(e) {
    var vector3 = new THREE.Vector3()
    this.updateMatrixWorld()
    this.camera.updateMatrixWorld()
    vector3.setFromMatrixPosition(this.camera.matrixWorld)
    this.eye = vector3
    this.material.uniforms.eye.value = this.eye
  }
}

export default EnvObject3D
