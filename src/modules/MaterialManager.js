// 59: 材质管理器
import _ from 'lodash'
// import THREE from './../../static/js/three.min.js'
import THREE from './../../static/js/three.min.js'


var leathers = ['brown_leather', 'fine_touch_leather 1', 'yellow_leather']
var MaterialManager = function(params) {
  this.scene = params.scenes[2] // 室内场景
  this.scenes = params.scenes
  this.configurables = params.configurables
  this.initMaterials()
  this.initObjects()
  this.initSpecialProperties()
}

MaterialManager.prototype = {
  initSpecialProperties() {
    // 植物
    var plantALB = this.getMaterial('Plant_ALB')
    plantALB && (plantALB.side = THREE.DoubleSide)

    // 草
    var glass = this.getMaterial('glass')
    glass && (glass.side = THREE.DoubleSide, glass.f0Factor = 1, glass.depthWrite = false)

    // 棕榈树叶
    var palmLeaves = this.getMaterial('palm_leaves')
    palmLeaves && (palmLeaves.side = THREE.DoubleSide, palmLeaves.depthWrite = true, palmLeaves.f0Factor = 1)

    // 木头
    var tabwood = this.getMaterial('tabwood')
    tabwood && (tabwood.f0Factor = 1)

    // 室内PBR材质的f0Factor全部为1
    _.each(this.scene.materials, function(material) {
      material.pbr && (material.f0Factor = 1)
    })

    // 虎尾兰
    var sansevieria = this.getMaterial('sansevieria')
    sansevieria && (sansevieria.side = THREE.DoubleSide)

    // 灯脚???
    var tripodLamp = this.getMaterial('tripod_lamp')
    tripodLamp && (tripodLamp.side = THREE.DoubleSide)

    // 咖啡腿、椅子腿、门把手
    var feetsAndHandle = ['coffee_table_feet', 'chair_feet', 'door_handle']
    _.each(this.scenes, function(scene) {
      _.each(scene.materials, function(material) {
        if (material.pbr) {
          if (feetsAndHandle.indexOf(material.name) > -1) {
            return
          } else {
            // 非桌腿、把手则开始封闭镜面反射
            material.defines.OCCLUDE_SPECULAR = true
          }
        }
      })
    })

    // 水池曝光
    var poolInterior = this.getMaterial('pool_interior')
    poolInterior && (poolInterior.exposure = 1.25)

    // 室外PBR材质曝光
    _.each(this.scenes[1].materials, function(material) {
      material.pbr && (material.exposure = 1.2)
    }, this)
  },
  initMaterials() {
    this.materials = {}
    this.configurables.forEach(function(config) {
      var name = config.name,
        object = this.scene.getObjectByName(name),
        materials = this.getMaterialsForObject(object),
        linkedMaterial = object.getObjectByName(config.linkedObjects[0]).material,
        lightMap = linkedMaterial.uniforms.sTextureLightMap.value,
        lightMapM = linkedMaterial.uniforms.sTextureLightMapM.value,
        aoMap2 = linkedMaterial.uniforms.sTextureAOMap2.value,
        normalMap2 = linkedMaterial.uniforms.sTextureNormalMap2.value,
        materialsObject = object.getObjectByName('materials')

      this.materials[name] = materials

      // 设置材质光源及环境、发现贴图
      materials.forEach(function(material) {
        this.scene.materials[material.uuid] = material
        // 光照贴图
        if (lightMap) {
          material.lightMap = lightMap
          material.lightMapM = lightMapM
          material.defines.USE_LIGHTMAP = true
        }

        // 材质使用 aoMap2 环境阻塞图
        if (aoMap2) {
          material.uniforms.sTextureAOMap2.value = aoMap2
          material.defines.USE_AOMAP2 = true
        }

        // 材质使用法线图
        if (normalMap2) {
          material.uniforms.sTextureNormalMap2.value = normalMap2
          material.defines.USE_NORMALMAP2 = true
        }
        material.needsUpdate = true
        // 如果不是皮质材质，则忽略平行光
        if (leathers.indexOf(material.name) < 0) {
          material.ignoreDirLight = true
        }
      }.bind(this), this)

      if (leathers.indexOf(linkedMaterial.name) < 0) {
        linkedMaterial.ignoreDirLight = true
      }
      materialsObject.traverse(function(materialObject) {
        materialObject.visible = false
      })
    }.bind(this), this)
  },
  initObjects() {
    this.objects = {}
    this.configurables.forEach(function(config) {
      this.objects[config.name] = []
      config.linkedObjects.forEach(function(object) {
        var child = this.getChildByName(this.scene.getObjectByName(config.name), object)
        this.objects[config.name] = this.objects[config.name].concat(child)
      }, this)
    }.bind(this), this)
  },
  setObjectMaterial(mesh, index) {
    var material = this.materials[mesh.name][index]
    this.crossFadeMaterial(this.objects[mesh.name], material)
  },
  crossFadeMaterial(meshes, material) {
    debugger
    var tween = new window.TWEEN.Tween(),
      params = {
        opacity: 0
      }
    if (this.crossFade) {
      return void this.crossFade.onComplete(function() {
        meshes.forEach(function(mesh) {
          mesh.material = this.currentFadingMaterial
          mesh.parent.remove(mesh.materialClone)
          mesh.materialClone = null
        }.bind(this), this)
        this.currentFadingMaterial.transparent = false
        this.currentFadingMaterial.depthWrite = true
        params.opacity = 0
        this.crossFade = null
        material !== this.currentFadingMaterial && this.crossFadeMaterial(meshes, material)
      }.bind(this))
    }
    this.currentFadingMaterial = material
    meshes.forEach(function(mesh) {
      var meshClone = mesh.clone()
      mesh.parent.add(meshClone)
      mesh.materialClone = meshClone
      mesh.targetMaterial = material
      meshClone.material = material
    })
    material.transparent = true
    material.depthWrite = false
    material.opacity = 0
    var r = function() {
      meshes.forEach(function(t) {
        t.material = material
        t.parent.remove(t.materialClone)
        t.materialClone = null
      })
      params.opacity = 0
      material.transparent = false
      material.depthWrite = true
      this.crossFade = null
    }
    this.crossFade = tween.reset(params).to({
      opacity: 1
    }, 300).easing(window.TWEEN.Easing.Linear.None).onUpdate(function() {
      material.opacity = params.opacity
    }).onComplete(r.bind(this)).onStop(r.bind(this)).start()
  },
  getMaterial(name) {
    var material
    _.each(this.scenes, function(scene) {
      material = _.find(scene.materials, function(material) {
        return material.name === name
      })
    }, this)
    return material
  },
  getMaterialsForObject(object) {
    if (object) {
      var materials = object.getObjectByName('materials')
      if (materials) {
        return _.map(materials.children, function(material) {
          var clone = material.children.length > 0 ? material.children[0].material.clone() : material.material.clone()
          return clone
        })
      }
    }
  },
  getChildByName(object, name) {
    var children = []
    object.traverse(function(t) {
      t.name === name && children.push(t)
    })
    return children
  },
  getObjectsByName(t, name) {
    var objects = []
    t.traverse(function(t) {
      t.name === name && objects.push(t)
    })
    return objects
  }
}

export default MaterialManager
