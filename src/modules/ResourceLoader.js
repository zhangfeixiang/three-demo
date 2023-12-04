/**
 * 15: 资源加载器：通过资源管理器加载各类资源。
 */
import ResourceManager from './ResourceManager.js'
import Bluebird from 'bluebird'

class ResourceLoader {
  constructor(resources) {
    if (resources.manager) (this.manager = resources.manager)
    if (resources.cubemaps) (this.cubemaps = resources.cubemaps)
    if (resources.sh) (this.sh = resources.sh)
    if (resources.textures) (this.textures = resources.textures)
    if (resources.panoramas) (this.panoramas = resources.panoramas)
    if (resources.geometries) (this.geometries = resources.geometries)
  }

  async load() {
    var props = {}

    // 加载立方体贴图
    if (this.cubemaps) props.cubemap = ResourceManager.loadSpecularCubemaps(this.cubemaps)

    // 加载全景图
    if (this.panoramas) props.panorama = ResourceManager.loadPanoramas(this.panoramas)

    // 辐射图脚本
    if (this.sh) props.sh = ResourceManager.loadSH(this.sh)

    // 加载纹理
    if (this.textures) props.texture = ResourceManager.loadTextures(this.textures, '/')

    // 加载几何体
    if (this.geometries) props.geometry = ResourceManager.loadGeometries(this.geometries);

    console.log('load', props)

    return Bluebird.props(props);
  }
}

export default ResourceLoader
