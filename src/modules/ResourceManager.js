/**
 * 16: 资源管理器，负责资源加载和获取。
 */
import Bluebird from 'bluebird'
import UrlUtil from './UrlUtil'
import SceneParser from './SceneParser'
import PanoramaLoader from './PanoramaLoader'
import CubemapLoader from './CubemapLoader'
import FileLoader from './FileLoader'
import ArrayBufferFileLoader from './ArrayBufferFileLoader'
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'
import _ from 'lodash'

var loadingManager = new THREE.LoadingManager(),
  sceneParser = new SceneParser(loadingManager),
  texturePath = '',
  textureCache = {},
  shCache = {},
  arrayBufferFileCache = {},
  fileLoader = new FileLoader(loadingManager),
  textureLoader = ResourceCache(new THREE.TextureLoader(loadingManager), textureCache),
  // panorama.bin
  panoramaLoader = ResourceCache(new PanoramaLoader(1024, false, loadingManager), textureCache),
  // cubemap.bin
  cubemapLoader = ResourceCache(new CubemapLoader(256, false, loadingManager), textureCache),
  // geometry(start.bin, exterior2.bin, interior2.bin)
  arrayBufferFileLoader = ResourceCache(new ArrayBufferFileLoader(loadingManager), arrayBufferFileCache)

// 资源缓存类
function ResourceCache(resourceLoader, cache) {
  return {
    _cache: cache || {},
    load: function(url, onLoad, onProgress, onError, path) {
      var cache = this._cache
      if (_.has(cache, path)) {
        console.log('资源已存在，无需 LOAD: ' + path)
      } else {
        // url = !url.startsWith('/static') ? '/' + url : url
        resourceLoader.load(url, function(resource) {
          console.log(`资源 LOAD ${url}`)
          cache[path] = resource
          onLoad.apply(this, arguments)
        }.bind(this), onProgress, onError)
      }
    },
    get: function(path) {
      if (!_.has(this._cache, path)) {
        console.error('资源未找到: ' + path)
      } else {
        // console.log(`资源 GET ${path}`)
        return this._cache[path]
      }
    }
  }
}

// 资源加载回调方法
function onResourceLoad(filepath, filename, resourceCache) {
  return new Bluebird(function(resolve, reject) {
    resourceCache.load(filepath,
      function(resource) {
        resource.filename = filename
        resolve(arguments.length > 1 ? _.toArray(arguments) : resource)
      },
      function() {},
      function() {
        reject(new Error('资源未找到: ' + filepath))
      }, filename)
  })
}

// 资源加载处理方法
function _loadResource(urls, resourceDir, resourceLoader, callback) {
  if (!_.isArray(urls)) {
    urls = [urls]
  }
  return Bluebird.all(_.map(urls, function(url) {
    if (callback) {
      return callback(UrlUtil(resourceDir, url), url, resourceLoader)
    } else {
      return void 0
    }
  }))
}

// 加载资源
function loadResource(urls, resourceDir, resourceLoader) {
  urls = urls || []
  return _loadResource(urls, resourceDir, resourceLoader, onResourceLoad)
}

class ResourceManager {
  static environmentPath = 'assets/environments'
  static geometryPath = 'assets/scenes/data/'
  static manager = loadingManager
  static sceneParser = sceneParser

  static get texturePath() {
    return texturePath
  }

  static set texturePath(value) {
    texturePath = value
    sceneParser.setTexturePath(value)
  }

  // 加载场景（通过场景解析器对指定场景脚本进行解析）
  static loadScene(scriptPath, scriptName) {
    return onResourceLoad(scriptPath, scriptName, sceneParser)
  }

  // 暂未使用
  static loadOBJs(t, e) {
    // return loadResource(t, e, objLoader)
  }

  // 加载纹理
  static loadTextures(textures, texturePath) {
    return loadResource(textures, texturePath || texturePath, textureLoader)
  }
  // 暂未使用
  static loadBRDFs(t, e) {
    // return loadResource(t, e, brdfLoader)
  }

  // 加载全景贴图
  static loadPanoramas(t, e) {
    return loadResource(t, e || ResourceManager.environmentPath, panoramaLoader)
  }

  // 加载镜面反射立方体贴图
  static loadSpecularCubemaps(urls, envPath) {
    return loadResource(urls, envPath || ResourceManager.environmentPath, cubemapLoader)
  }

  // 加载辐射贴图的shell脚本
  static loadSH(names) {
    return Bluebird.all(_.map(names, function(name) {
      return new Bluebird(function(resolve, reject) {
        var url = UrlUtil(ResourceManager.environmentPath, name + '/irradiance.json')
        fileLoader.load(url,
          function(responseText) {
            shCache[name] = responseText
            resolve(responseText)
          },
          function() {},
          function() {
            reject(new Error('Resource was not found: ' + url))
          })
      })
    }))
  }

  // 加载立方体
  static loadGeometries(names, path) {
    names = _.map(names, function(name) {
      return name + '.bin'
    })
    return loadResource(names, path || ResourceManager.geometryPath, arrayBufferFileLoader)
  }
  static getTexture(key) {
    return textureLoader.get(key)
  }
  // 暂未使用
  static getBRDF(key) {
    // return brdfLoader.get(key)
  }
  static getPanorama(key) {
    return panoramaLoader.get(key + '/panorama.bin')
  }
  static getCubemap(key) {
    return cubemapLoader.get(key + '/cubemap.bin')
  }
  static getSH(key) {
    return shCache[key]
  }
  static getGeometry(key) {
    return arrayBufferFileLoader.get(key + '.bin')
  }
}

export default ResourceManager
