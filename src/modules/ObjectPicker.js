/**
 * 44: 对象选择器。用于场景ScenePicker或平视仪HudPicker等移动或选择使用。
 * 初始化可选择对象后，利用光线投射器 RayCaster 做碰撞检测得到碰撞对象进行选择。
 */
import Events from './Events'
import _ from 'lodash'
import THREE from './../../static/js/three.min.js'

class ObjectPicker extends Events {
  constructor(parameters) {
    super()
    parameters = parameters || {}
    this.objects = []
    this.mouseCoords = {
      x: 0,
      y: 0
    }
    this.camera = parameters.camera
    this.vr = parameters.vr
    this.checkFlag = void 0 !== parameters.checkFlag ? parameters.checkFlag : false
  }
  // 批量添加可选择对象
  add(objects) {
    _.isArray(objects) || (objects = [objects])
    _.each(objects, function(object) {
      this.objects.push(object)
      object.pickable = true
    }.bind(this), this)
  }

  // 移除指定对象
  remove(object) {
    for (var i = 0; i < this.objects.length; i++) {
      var objectId = this.objects[i].id
      if (objectId === object.id) {
        this.objects.splice(i, 1)
        break
      }
    }
  }

  // 清空所有对象
  clear() {
    this.objects = []
  }

  // 清空当前选择状态
  clearState() {
    if (this.currentObj) {
      this.trigger('leave', this.currentObj)
      this.currentObj = null
    }
  }

  // 点选当前对象
  onTap() {
    if (this.currentObj) {
      this.trigger('pick', this.currentObj, this.point)
    }
  }

  // 碰撞检测（利用光线投射仪找到第一个相交对象）
  hitTest(dontUseCamera) {
    var raycaster = new THREE.Raycaster(),
      directionTarget = new THREE.Vector3(),
      positionTarget = new THREE.Vector3()
    var hitObject
    this.camera.getWorldPosition(positionTarget)
    if (!this.vr) {
      if (dontUseCamera) {
        this.camera.getWorldDirection(directionTarget)
        raycaster.set(positionTarget, directionTarget)
      } else {
        raycaster.setFromCamera(this.mouseCoords, this.camera)
      }
    }
    // 在指定的对象组中找到与光线相交的对象
    var intersectObjects = raycaster.intersectObjects(this.objects)
    if (intersectObjects.length > 0) {
      var firtHitObject = _.find(intersectObjects, function(intersectObject) {
        if (this.checkFlag) {
          return void 0 !== intersectObject.object.pickable && intersectObject.object.pickable === true
        } else {
          return intersectObject.object
        }
      }.bind(this), this)
      if (firtHitObject) {
        this.point = firtHitObject.point
        hitObject = firtHitObject.object
      }
    }
    // 离开当前对象
    if (hitObject && this.currentObj && this.currentObj !== hitObject || !hitObject && this.currentObj) {
      this.trigger('leave', this.currentObj)
      this.currentObj = null
    }
    // 进入检测到的碰撞对象
    if (hitObject && !this.currentObj) {
      console.log('进入碰撞对象', hitObject.name)
      // if (hitObject.name === 'wall_right') {
      //   alert("点击更换")
      // }
      this.trigger('enter', hitObject)
      this.currentObj = hitObject
    }
    return hitObject
  }

  updateMouseCoords(coords) {
    this.mouseCoords = coords
  }

  getPoint() {
    return this.point
  }
}

export default ObjectPicker
