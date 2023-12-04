<template>
    <div ref="containerRef">

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Scene, PerspectiveCamera, WebGLRenderer, Color, AxesHelper, PlaneGeometry, BoxGeometry, AmbientLight, SphereGeometry, SpotLight, MeshPhongMaterial, Mesh, MeshLambertMaterial, MeshBasicMaterial } from 'three'
import THREE from './../../static/js/three.min.js';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const containerRef = ref()

// 场景
const scene = new Scene();
// 远景相机
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-30, 40, 30);
camera.lookAt(scene.position);

// 渲染器
const renderer = new WebGLRenderer({antialias: true});
renderer.setClearColor();
renderer.setClearColor(new THREE.Color(0xffffff));
renderer.setSize(window.innerWidth, window.innerHeight);

// 可以渲染阴影贴图
renderer.shadowMap.enabled = true;
renderer.shadowMapEnabled = true;



// 点光源
// const spotLight = new SpotLight(0xffffff);
// // 投射阴影
// spotLight.castShadow = true;
// spotLight.position.set(0, 150, 50);
// spotLight.AxesHelper = true;
// scene.add(spotLight);

// 环境光源
var ambientLight = new AmbientLight(0x0c0c0c);
scene.add(ambientLight);

// 平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-30, 30, -30);
// directionalLight.shadow.mapSize.width = 1024;
// directionalLight.shadow.mapSize.height = 1024;
// directionalLight.shadow.camera.near = 0.5;
// directionalLight.shadow.camera.far = 500;
directionalLight.castShadow = true;
scene.add(directionalLight);


// 创建点光源辅助对象
const pointLightHelper = new THREE.PointLightHelper(directionalLight, 10)
scene.add(pointLightHelper)


// 坐标轴中心位置辅助线
const axes = new AxesHelper(20);
// scene.add(axes);


// 网格
const planeGeometry = new PlaneGeometry(60, 20);
const meshBasicMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const plane = new Mesh(planeGeometry, meshBasicMaterial);
// 接收阴影
plane.receiveShadow = true;
plane.rotation.x = -0.5 * Math.PI;
plane.position.set(15, 0, 0);
// 添加到场景中
scene.add(plane);


// 几何体-立方体
const cubeGeometry = new BoxGeometry(4, 4, 4);
// 基础材质没有阴影-MeshBasicMaterial
// wireframe: true 只显示线框
const cubeMaterial = new MeshLambertMaterial({ color: 0xff0000, wireframe: !true });
const cube = new Mesh(cubeGeometry, cubeMaterial);
cube.position.set(2, 2, 2);
// 投射阴影
cube.castShadow = true;
scene.add(cube);


// 球体
const sphereGeometry = new SphereGeometry(4, 20, 20);
const sphereMaterial = new MeshLambertMaterial({ color: 0x7777ff, wireframe: false });
const sphere = new Mesh(sphereGeometry, sphereMaterial);
// 投射投影
sphere.castShadow = true;
sphere.position.set(20, 4, 2);
scene.add(sphere);



onMounted(() => {
    containerRef.value?.appendChild(renderer.domElement);
    renderer.render(scene, camera);
})




const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 100;
// controls.autoRotate = true;

requestAnimationFrame(function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
})
</script>

<style scoped></style>