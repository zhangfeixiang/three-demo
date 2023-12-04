// 17: ObjectLoader 场景加载器
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'

var SceneParser = function(loadingManager) {
  this.manager = loadingManager !== void 0 ? loadingManager : THREE.DefaultLoadingManager
  this.texturePath = ''
}

Object.assign(SceneParser.prototype, {
  // 加载场景，解析配置脚本
  load: function(url, onLoad, onProgress, onError) {
    this.texturePath === '' && (this.texturePath = url.substring(0, url.lastIndexOf('/') + 1))
    var fileLoader = new THREE.XHRLoader(this.manager)
    fileLoader.load(url, function(responseText) {
      var res = JSON.parse(responseText)
      this.parse(res, onLoad)
    }.bind(this), onProgress, onError)
  },
  setTexturePath: function(path) {
    this.texturePath = path
  },
  setCrossOrigin: function(crossOrigin) {
    this.crossOrigin = crossOrigin
  },
  parse: function(json, onLoad) {
    var geometries = json.binary ? this.parseBinaryGeometries(json.geometries) : this.parseGeometries(json.geometries)
    var images = this.parseImages(json.images, function() {
      void 0 !== onLoad && onLoad(object, json)
    })
    var textures = this.parseTextures(json.textures, images)
    var materials = this.parseMaterials(json.materials, textures)
    var object = this.parseObject(json.object, geometries, materials)
    json.animations && (object.animations = this.parseAnimations(json.animations))
    json.cameras && (object.cameras = this.parseCameras(object, json.cameras))
    void 0 !== json.images && json.images.length !== 0 || void 0 !== onLoad && onLoad(object, json)
    return object
  },
  parseCameras: function(object, jsonCameras) {
    var cameras = []
    for (var i = 0; i < jsonCameras.length; i++) {
      var camera = object.getObjectByProperty('uuid', jsonCameras[i])
      camera && cameras.push(camera)
    }
    return cameras
  },
  parseGeometries: function(json) {
    var geometries = {}
    if (void 0 !== json) {
      var jsonLoader = new THREE.JSONLoader(), bufferGeometryLoader = new THREE.BufferGeometryLoader()
      for (var i = 0, total = json.length; total > i; i++) {
        var geometry, data = json[i]
        switch (data.type) {
          case 'PlaneGeometry':
          case 'PlaneBufferGeometry':
            geometry = new THREE[data.type](data.width, data.height, data.widthSegments, data.heightSegments)
            break
          case 'BoxGeometry':
          case 'BoxBufferGeometry':
          case 'CubeGeometry':
            geometry = new THREE[data.type](data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments)
            break
          case 'CircleGeometry':
          case 'CircleBufferGeometry':
            geometry = new THREE[data.type](data.radius, data.segments, data.thetaStart, data.thetaLength)
            break
          case 'CylinderGeometry':
          case 'CylinderBufferGeometry':
            geometry = new THREE[data.type](data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength)
            break
          case 'ConeGeometry':  // 圆锥体
          case 'ConeBufferGeometry':
            geometry = new THREE[data.type](data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength)
            break
          case 'SphereGeometry':
          case 'SphereBufferGeometry':
            geometry = new THREE[data.type](data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength)
            break
          case 'DodecahedronGeometry':  // 十二面体
          case 'IcosahedronGeometry':  // 二十面体
          case 'OctahedronGeometry':  // 八面体
          case 'TetrahedronGeometry':  // 四面体
            geometry = new THREE[data.type](data.radius, data.detail)
            break
          case 'RingGeometry':
          case 'RingBufferGeometry':
            geometry = new THREE[data.type](data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength)
            break
          case 'TorusGeometry':
          case 'TorusBufferGeometry':
            geometry = new THREE[data.type](data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc)
            break
          case 'TorusKnotGeometry':
          case 'TorusKnotBufferGeometry':
            geometry = new THREE[data.type](data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q)
            break
          case 'LatheGeometry':
          case 'LatheBufferGeometry':
            geometry = new THREE[data.type](data.points, data.segments, data.phiStart, data.phiLength)
            break
          case 'BufferGeometry':
            geometry = bufferGeometryLoader.parse(data)
            break
          case 'Geometry':
            geometry = jsonLoader.parse(data.data, this.texturePath).geometry
            break
          default:
            console.warn('THREE.ObjectLoader: Unsupported geometry type "' + data.type + '"')
            continue
        }
        geometry.uuid = data.uuid
        void 0 !== data.name && (geometry.name = data.name)
        geometries[data.uuid] = geometry
      }
    }
    return geometries
  },
  setBinaryGeometryBuffer: function(binaryGeometryBuffer) {
    this.geometryBuffer = binaryGeometryBuffer
  },

  // 将场景脚本（如start.js）中定义的几何体json信息解析为 THREE.BufferGeometry 对象
  parseBinaryGeometries: function(jsonGeometries) {
    var bufferGeometries = {}
    var binLength = this.geometryBuffer.byteLength
    if (void 0 !== jsonGeometries) {
      // 遍历
      for (var i = 0, total = jsonGeometries.length; i < total; i++) {
        var bufferGeometry = new THREE.BufferGeometry(),
          jsonGeometry = jsonGeometries[i]
        for (var offsetKey in jsonGeometry.offsets) {
          if (jsonGeometry.offsets.hasOwnProperty(offsetKey)) {
            var offsetValues = jsonGeometry.offsets[offsetKey],
              startValue = offsetValues[0],
              endValue = offsetValues[1] + 1,
              offsetValueArray = this.geometryBuffer.slice(startValue, endValue),
              offsetValue32Array
            if (offsetKey === 'index') {
              offsetValue32Array = new Uint32Array(offsetValueArray)
              bufferGeometry.setIndex(new THREE.BufferAttribute(offsetValue32Array, 1))
            } else {
              var itemSize
              offsetValue32Array = new Float32Array(offsetValueArray)
              if (offsetKey === 'uv' || offsetKey === 'uv2') {
                itemSize = 2
              } else if (offsetKey === 'position' || offsetKey === 'normal' || offsetKey === 'color') {
                itemSize = 3
              } else if (offsetKey === 'tangent') {
                itemSize = 4
              }
              bufferGeometry.addAttribute(offsetKey, new THREE.BufferAttribute(offsetValue32Array, itemSize))
            }
          }
        }
        bufferGeometry.uuid = jsonGeometry.uuid
        jsonGeometry.name !== undefined && (bufferGeometry.name = jsonGeometry.name)
        bufferGeometries[jsonGeometry.uuid] = bufferGeometry
      }
      this.setBinaryGeometryBuffer(null)
    }
    return bufferGeometries
  },

  parseMaterials: function(jsonMaterials, textures) {
    var materials = {}
    if (void 0 !== jsonMaterials) {
      var materialLoader = new THREE.MaterialLoader()
      materialLoader.setTextures(textures)
      for (var i = 0, total = jsonMaterials.length; total > i; i++) {
        var material = materialLoader.parse(jsonMaterials[i])
        material && (materials[material.uuid] = material)
      }
    }
    return materials
  },
  parseAnimations: function(params) {
    var animations = []
    for (var i = 0; i < params.length; i++) {
      var animationClip = THREE.AnimationClip.parse(params[i])
      animations.push(animationClip)
    }
    return animations
  },
  parseImages: function(images, onLoad) {
    var self = this, imageDoms = {}
    function loadImage(image) {
      self.manager.itemStart(image)
      return imageLoader.load(image, function() {
        self.manager.itemEnd(image)
      })
    }
    if (void 0 !== images && images.length > 0) {
      var loadingManager = new THREE.LoadingManager(onLoad),
        imageLoader = new THREE.ImageLoader(loadingManager)
      imageLoader.setCrossOrigin(this.crossOrigin)
      for (var i = 0, imageCount = images.length; imageCount > i; i++) {
        var image = images[i], imageUrl = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(image.url) ? image.url : self.texturePath + image.url
        imageDoms[image.uuid] = loadImage(imageUrl)
      }
    }
    return imageDoms
  },
  parseTextures: function(texturesConfig, images) {
    function n(t) {
      return typeof t === 'number' ? t : (console.warn('THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', t), THREE[t])
    }
    var textures = {}
    if (void 0 !== texturesConfig) {
      for (var i = 0, textureCount = texturesConfig.length; textureCount > i; i++) {
        var texture, textureConfig = texturesConfig[i]
        if (textureConfig.images) {
          var cubeTextureImages = []
          for (var j = 0, textureImagesCount = textureConfig.images.length; textureImagesCount > j; j++) {
            void 0 === images[textureConfig.images[j]] && console.warn('THREE.ObjectLoader: Undefined image', textureConfig.images[j])
            cubeTextureImages.push(images[textureConfig.images[j]])
          }
          texture = new THREE.CubeTexture(cubeTextureImages)
        } else {
          void 0 === textureConfig.image && console.warn('THREE.ObjectLoader: No "image" specified for', textureConfig.uuid)
          void 0 === images[textureConfig.image] && console.warn('THREE.ObjectLoader: Undefined image', textureConfig.image)
          texture = new THREE.Texture(images[textureConfig.image])
        }
        texture.needsUpdate = true
        texture.uuid = textureConfig.uuid
        void 0 !== textureConfig.name && (texture.name = textureConfig.name)
        void 0 !== textureConfig.mapping && (texture.mapping = n(textureConfig.mapping))
        void 0 !== textureConfig.offset && texture.offset.fromArray(textureConfig.offset)
        void 0 !== textureConfig.repeat && texture.repeat.fromArray(textureConfig.repeat)
        void 0 !== textureConfig.wrap && (texture.wrapS = n(textureConfig.wrap[0]), texture.wrapT = n(textureConfig.wrap[1]))
        void 0 !== textureConfig.minFilter && (texture.minFilter = n(textureConfig.minFilter))
        void 0 !== textureConfig.magFilter && (texture.magFilter = n(textureConfig.magFilter))
        void 0 !== textureConfig.anisotropy && (texture.anisotropy = textureConfig.anisotropy)
        void 0 !== textureConfig.flipY && (texture.flipY = textureConfig.flipY)
        textures[textureConfig.uuid] = texture
      }
    }
    return textures
  },
  parseObject(object, geometries, materials) {
    var matrix4 = new THREE.Matrix4()
    function getGeometry(name) {
      void 0 === geometries[name] && console.warn('THREE.ObjectLoader: Undefined geometry', name)
      return geometries[name]
    }
    function getMaterial(t) {
      return void 0 !== t ? (void 0 === materials[t] && console.warn('THREE.ObjectLoader: Undefined material', t), materials[t]) : void 0
    }
    var instance
    switch (object.type) {
      case 'Scene':
        instance = new THREE.Scene()
        break
      case 'PerspectiveCamera':
        instance = new THREE.PerspectiveCamera(object.fov, object.aspect, object.near, object.far)
        void 0 !== object.focus && (instance.focus = object.focus)
        void 0 !== object.zoom && (instance.zoom = object.zoom)
        void 0 !== object.filmGauge && (instance.filmGauge = object.filmGauge)
        void 0 !== object.filmOffset && (instance.filmOffset = object.filmOffset)
        void 0 !== object.view && (instance.view = Object.assign({}, object.view))
        break
      case 'OrthographicCamera':
        instance = new THREE.OrthographicCamera(object.left, object.right, object.top, object.bottom, object.near, object.far)
        break
      case 'AmbientLight':
        instance = new THREE.AmbientLight(object.color, object.intensity)
        break
      case 'DirectionalLight':
        instance = new THREE.DirectionalLight(object.color, object.intensity)
        break
      case 'PointLight':
        instance = new THREE.PointLight(object.color, object.intensity, object.distance, object.decay)
        break
      case 'SpotLight':
        instance = new THREE.SpotLight(object.color, object.intensity, object.distance, object.angle, object.penumbra, object.decay)
        break
      case 'HemisphereLight':
        instance = new THREE.HemisphereLight(object.color, object.groundColor, object.intensity)
        break
      case 'Mesh':
        var geometry = getGeometry(object.geometry), material = getMaterial(object.material)
        instance = geometry.bones && geometry.bones.length > 0 ? new THREE.SkinnedMesh(geometry, material) : new THREE.Mesh(geometry, material)
        // if (object.position) {
        //   instance.position = new THREE.Vector3(object.position[0], object.position[1], object.position[2])
        // }
        // if (object.rotation) {
        //   instance.rotation = new THREE.Vector3(object.rotation[0], object.rotation[1], object.rotation[2])
        // }
        // if (object.scale) {
        //   instance.scale = new THREE.Vector3(object.scale[0], object.scale[1], object.scale[2])
        // }
        break
      case 'LOD':
        instance = new THREE.LOD()
        break
      case 'Line':
        instance = new THREE.Line(getGeometry(object.geometry), getMaterial(object.material), object.mode)
        break
      case 'LineSegments':
        instance = new THREE.LineSegments(getGeometry(object.geometry), getMaterial(object.material))
        break
      case 'PointCloud':
      case 'Points':
        instance = new THREE.Points(getGeometry(object.geometry), getMaterial(object.material))
        break
      case 'Sprite':
        instance = new THREE.Sprite(getMaterial(object.material))
        break
      case 'Group':
        instance = new THREE.Group()
        break
      default:
        instance = new THREE.Object3D()
    }
    instance.uuid = object.uuid
    void 0 !== object.name && (instance.name = object.name)
    void 0 !== object.matrix && (matrix4.fromArray(object.matrix) && matrix4.decompose(instance.position, instance.quaternion, instance.scale))
    void 0 !== object.position && (instance.position.fromArray(object.position))
    void 0 !== object.rotation && instance.rotation.fromArray(object.rotation)
    void 0 !== object.scale && instance.scale.fromArray(object.scale)
    void 0 !== object.castShadow && (instance.castShadow = object.castShadow)
    void 0 !== object.receiveShadow && (instance.receiveShadow = object.receiveShadow)
    void 0 !== object.visible && (instance.visible = object.visible)
    void 0 !== object.userData && (instance.userData = object.userData)
    if (void 0 !== object.children) {
      for (var child in object.children) {
        instance.add(this.parseObject(object.children[child], geometries, materials))
      }
    }
    if (object.type === 'LOD') {
      for (var levels = object.levels, i = 0; i < levels.length; i++) {
        var level = levels[i], uuid = instance.getObjectByProperty('uuid', level.object)
        void 0 !== uuid && instance.addLevel(uuid, level.distance)
      }
    }
    void 0 !== object.layers && (instance.layers.mask = object.layers)
    return instance
  }
})

/*
class ObjectLoader extends THREE.ObjectLoader {
  parseCameras(object, cameras) {
    var result = []
    for (var i = 0; i < cameras.length; i++) {
      var camera = object.getObjectByProperty('uuid', cameras[i])
      camera && result.push(camera)
    }
    return result
  }
  parse(json, onLoad) {
    debugger
    var geometries = json.binary ? this.parseBinaryGeometries(json.geometries) : this.parseGeometries(json.geometries)
    var images = this.parseImages(json.images, function() {
      void 0 !== onLoad && onLoad(object3d, json)
    })
    var textures = this.parseTextures(json.textures, images)
    var materials = this.parseMaterials(json.materials, textures)
    var object3d = this.parseObject(json.object, geometries, materials)
    json.animations && (object3d.animations = this.parseAnimations(json.animations))
    json.cameras && (object3d.cameras = this.parseCameras(object3d, json.cameras))
    void 0 !== json.images && json.images.length !== 0 || void 0 !== onLoad && onLoad(object3d, json)
    return object3d
  }
  setBinaryGeometryBuffer(binaryGeometryBuffer) {
    this.geometryBuffer = binaryGeometryBuffer
  }
  parseBinaryGeometries(geometries) {
    debugger
    var result = {}
    if (void 0 !== geometries) {
      for (var n = 0, i = geometries.length; i > n; n++) {
        var bufferGeometry = new THREE.BufferGeometry(),
          o = geometries[n]
        for (var a in o.offsets) {
          if (o.offsets.hasOwnProperty(a)) {
            var s = o.offsets[a],
              c = s[0],
              u = s[1] + 1,
              l = this.geometryBuffer.slice(c, u),
              h
            if (a === 'index') {
              h = new Uint32Array(l)
              bufferGeometry.setIndex(new THREE.BufferAttribute(h, 1))
            } else {
              var f
              h = new Float32Array(l)
              a === 'uv' || a === 'uv2' ? f = 2 : a === 'position' || a === 'normal' || a === 'color' ? f = 3 : a === 'tangent' && (f = 4)
              bufferGeometry.addAttribute(a, new THREE.BufferAttribute(h, f))
            }
          }
        }
        bufferGeometry.uuid = o.uuid
        void 0 !== o.name && (bufferGeometry.name = o.name)
        result[o.uuid] = bufferGeometry
      }
      this.setBinaryGeometryBuffer(null)
    }
    return result
  }
}
*/

export default SceneParser
