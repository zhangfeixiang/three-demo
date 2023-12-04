/**
 * 18: 场景加载器。加载场景（如启动、室内、室外），并将场景配置脚本中的相机和材质进行初始化。
 */
import Blurbird from 'bluebird'
import THREE from './../../static/js/three.min.js'
import ResourceManager from './ResourceManager'
import './MaterialLoader' // 重写材质加载器
// require('./RawShaderMaterial')
// require('./SceneParser')

class SceneLoader {
  // 读取场景及其对应的配置脚本
  static loadScene(geometryName, assetsDir, sceneManager, scriptExt) {
    return new Blurbird(function(resolve, reject) {
      // 获取几何体的数组缓冲并存储到场景解析器的二进制几何体缓冲数据中。
      var geometryBuffer = ResourceManager.getGeometry(geometryName)
      geometryBuffer && ResourceManager.sceneParser.setBinaryGeometryBuffer(geometryBuffer)

      // 加载该几何体的场景配置脚本并进行解析（如start, interior, exterior 几何场景.bin|.js）
      var geometrySceneScriptPath = assetsDir + geometryName + (scriptExt || '.json')
      ResourceManager.loadScene(geometrySceneScriptPath).spread(function(scene, script) {
        var camera
        scene.materials = {}
        // 设置该场景及场景管理器的相机
        if (scene.cameras && scene.cameras.length > 0) {
          camera = scene.cameras[0]
        }
        if (camera) {
          // 设置该场景相机的视锥纵横比并更新画面
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
        } else {
          // 未设置相机的场景，需要新增相机
          camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 2000)
          camera.position.set(-3.5, 2, 3)
          scene.cameras = [camera]
        }

        // 还原场景材质、重置平行光（阳光）
        // scene.materials = {}
        scene.traverse(function(object) {
          // 如果对象有材质，则还原到当前场景的的materials对象
          if (object.material) {
            if (object.material.materials) {
              object.material.materials.forEach(function(material) {
                scene.materials[material.uuid] = material
              })
            } else {
              scene.materials[object.material.uuid] = object.material
            }
          }
          // 如果读取的是平行光（阳光），则进行还原
          if (object instanceof THREE.DirectionalLight) {
            object.position.set(0, 0, 1)
            object.quaternion.normalize()
            object.position.applyQuaternion(object.quaternion)
            object.quaternion.set(0, 0, 0, 0)
            object.scale.set(0, 0, 0)
          }
        })
        sceneManager.scene = scene
        sceneManager.scenes.push(scene)
        sceneManager.camera = camera
        resolve(scene)
      })
    })
  }
}

export default SceneLoader
