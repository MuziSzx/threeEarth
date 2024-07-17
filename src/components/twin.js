import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 创建星轨圆环
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import chinaJson from "./china.json";
// 创建星轨圆环end
import { getAssetsFile } from "../util/pub-use.js";
console.log(THREE.Scene);
console.log(THREE.WebGLRenderer);
let renderer, camera, scene, light, controls;
let Dom;
let width, height;
const textureLoader = new THREE.TextureLoader(); // 纹理加载器
const earthGroup = new THREE.Group();
const meshGroup = new THREE.Group();
const pointGroup = new THREE.Group();
// 星轨圆环start
let canvas;
let torus; // 星轨圆环
let composer;
// 星轨圆环end

const pointArr = [{ point: [116.4, 39.91, 1000] },{ point: [116.45,40.06, 1000] },{ point: [114.25,39.75, 1000] },{ point: [114.23,41.48, 1000] },{ point: [117.24,35.07, 1000] }];
/**
 * 初始化渲染场景
 */

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  const containerDom = document.querySelector("#container");
  containerDom.appendChild(renderer.domElement);
}

/**
 * 初始化相机
 */

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(5, -20, 200);
  camera.lookAt(0, 3, 0);
  window.camera = camera;
}

/**
 * 初始化场景
 */

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020924);
  scene.fog = new THREE.Fog(0x020924, 200, 1000);
  window.scene = scene;
}

/**
 * 初始化用户交互
 **/
function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;
  controls.enablePan = true;
}

/**
 * @description 初始化光
 */
function initLight() {
  const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(1, 0.1, 0).normalize();
  var directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
  directionalLight2.position.set(1, 0.1, 0.1).normalize();
  scene.add(directionalLight);
  scene.add(directionalLight2);
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
  hemiLight.position.set(0, 1, 0);
  scene.add(hemiLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 500, -20);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 18;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.camera.left = -52;
  directionalLight.shadow.camera.right = 12;
  scene.add(directionalLight);
}

/**
 * 窗口变动
 **/
function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renders();
}

/**
 * @description 渲染
 */
function renders() {
  renderer.clear();
  renderer.render(scene, camera);
}

/**
 * 更新
 **/
function animate() {
  window.requestAnimationFrame(() => {
    if (controls) controls.update();
    renders();
    animate();
  });
}

// 动态星空背景
function starBg() {
  const positions = [];
  const colors = [];
  const geometry = new THREE.BufferGeometry();
  for (var i = 0; i < 10000; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    positions.push(vertex.x, vertex.y, vertex.z);
    var color = new THREE.Color();
    color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  let starTexture = textureLoader.load(getAssetsFile("star.png"));
  var starsMaterial = new THREE.PointsMaterial({
    map: starTexture,
    size: 1,
    transparent: true,
    opacity: 1,
    vertexColors: true, //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  let stars = new THREE.Points(geometry, starsMaterial);
  stars.scale.set(300, 300, 300);
  scene.add(stars);
}

function createEarth() {
  var globeTextureLoader = new THREE.TextureLoader();
  var globeMesh;
  globeTextureLoader.load(getAssetsFile("earth.png"), function (texture) {
    var globeGgeometry = new THREE.SphereGeometry(40, 100, 100);
    var globeMaterial = new THREE.MeshStandardMaterial({ map: texture });
    globeMesh = new THREE.Mesh(globeGgeometry, globeMaterial);
    earthGroup.add(globeMesh);
  });

  // 大气层
  const cloudGeo = new THREE.SphereGeometry(41, 150, 150);
  const cloudTexture = textureLoader.load(getAssetsFile("earth_cloud.png"));
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  earthGroup.add(cloud);
  earthGroup.rotation.set(0.5, 2.9, 0.1);

  scene.add(earthGroup);
  //   // 设置地球组转向
}

function createEarthPoint(localton, color) {
    // 新建一个标点组合
    const pointGroup = new THREE.Group();
  
    // 涟漪圈圈
    const waveGeo = new THREE.PlaneGeometry( 0.3, 0.3 );
    const waveTexture= textureLoader.load(getAssetsFile("wave.png"));
    const waveMaterial = new THREE.MeshBasicMaterial({
      map: waveTexture,
      color: color,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    let waveMesh = new THREE.Mesh(waveGeo, waveMaterial);
    // 设置后期控制涟漪动画的大小和透明度阀值
    (waveMesh).size = 5.1 * 0.3;
    (waveMesh)._s = Math.random() * 1.0 + 1.0;
  
    wareArr.push(waveMesh)
  
    // 标点光柱
    // 使用CylinderGeometry创建一个圆锥形圆柱体
    const lightGeo = new THREE.CylinderGeometry(0, 0.05, 0.5, 32)
    const lightTexture = textureLoader.load(getAssetsFile("lightray.png"))
    const lightMaterial = new THREE.MeshBasicMaterial({
      map: lightTexture,
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    })
    const lightMesh = new THREE.Mesh(lightGeo, lightMaterial)
    // 设置光柱的旋转和位置，让他竖立在涟漪圈上边
    lightMesh.rotateX(Math.PI / 2)
    lightMesh.position.z = 0.25
    
  
    pointGroup.add(waveMesh, lightMesh)
  
    pointGroup.position.set(localton.x, localton.y, localton.z)
  
    // 调用normalize方法归一化向量，好处是保留了原向量信息而长度为1，在计算中更方便
    const coordVec3 = new THREE.Vector3( localton.x, localton.y, localton.z ).normalize();
    const meshNormal = new THREE.Vector3( 0, 0, 1 );
    // setFromUnitVectors方法根据这两个向量计算并设置旋转四元数，使pointGroup中的物体朝向目标点
    pointGroup.quaternion.setFromUnitVectors( meshNormal, coordVec3 );
  
    return pointGroup
  }


function drawPointOnEarth(){
    // 标点集合
    const localtionGrou = new THREE.Group();
    // 飞线集合
    const flyLineGrou = new THREE.Group()
    for(let i  = 0; i < pointArr.length; i++) {
  
        const xyz = lglt2xyz(pointArr[i].point[0], pointArr[i].point[1],5.1)
        localtionGroup.add(createEarthPoint(xyz, lnglatData[i].color))
      }
  
    //   const from = lglnToxyz(lnglatData[i].lnglat[0][0], lnglatData[i].lnglat[0][1], 5.1)
    //   const to = lglnToxyz(lnglatData[i].lnglat[1][0], lnglatData[i].lnglat[1][1], 5.1)
    //   flyLineGroup.add(createFlyLine(from, to))
    // }
    earthGroup.add(localtionGroup)
  }
// 绘制点
function createPointMesh(pos) {
    const planGeometry= new THREE.PlaneGeometry( 0.3, 0.3 );
  const texture = textureLoader.load(getAssetsFile("wave.png"));
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, //使用背景透明的png贴图，注意开启透明计算
    // side: THREE.DoubleSide, //双面可见
    depthWrite: false, //禁止写入深度缓冲区数据
  });
  var mesh = new THREE.Mesh(planGeometry, material);
  var size = 40 * 0.04; //矩形平面Mesh的尺寸
  mesh.scale.set(size, size, size); //设置mesh大小
  //设置mesh位置
  mesh.position.set(pos.x, pos.y, pos.z);
  // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
  var coordVec3 = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
  // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
  var meshNormal = new THREE.Vector3(0, 0, 1);
  // 四元数属性.quaternion表示mesh的角度状态
  //.setFromUnitVectors();计算两个向量之间构成的四元数值
  mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return mesh;
}

/**
 *lng:经度
 *lat:维度
 *radius:地球半径
 */
function lglt2xyz(lng, lat, radius) {
  const phi = (180 + lng) * (Math.PI / 180);
  const theta = (90 - lat) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(theta) * Math.cos(phi),
    y: radius * Math.cos(theta),
    z: radius * Math.sin(theta) * Math.sin(phi),
  };
}

// 绘制光圈
function createStarOrbit() {
  var globeTextureLoader = new THREE.TextureLoader();
  globeTextureLoader.load(getAssetsFile("wave.png"), function (texture) {
    var geometry = new THREE.PlaneGeometry(140, 140,20);
    var material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    var mesh = new THREE.Mesh(geometry, material);
    meshGroup.add(mesh);
    meshGroup.rotation.set(5, 2.9, 0.1);
    scene.add(meshGroup);
  });
}

function initMap(chinaJson) {
  // 遍历省份构建模型
  let map = new THREE.Group();
  chinaJson.features.forEach((elem) => {
    // 新建一个省份容器：用来存放省份对应的模型和轮廓线
    const province = new THREE.Object3D();
    const coordinates = elem.geometry.coordinates;
    coordinates.forEach((multiPolygon) => {
    //   console.log(multiPolygon, "123131");
      multiPolygon.forEach((polygon) => {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf19553 }); //0x3BFA9E
        const positions = [];
        const linGeometry = new THREE.BufferGeometry();
        for (let i = 0; i < polygon.length; i++) {
          var pos = lglt2xyz(polygon[i][0], polygon[i][1],40);
          positions.push(pos.x, pos.y, pos.z);
        }
        linGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        const line = new THREE.Line(linGeometry, lineMaterial);
        province.add(line);
      });
    });
    map.add(province);
  });
  earthGroup.add(map);
  scene.add(earthGroup);
}

export function init() {
  Dom = document.querySelector("#container");
  (width = Dom.clientWidth), (height = Dom.clientHeight);
  canvas = document.querySelector("#canvas");
  initRenderer();
  initCamera();
  initScene();
  initLight();
  initControls();
  animate();
  starBg();
  createEarth();
  createStarOrbit();

//   drawPointOnEarth()

//   for (var i = 0; i < pointArr.length; i++) {
//     let meshGroup = createPointMesh(lglt2xyz(pointArr[i].point[0], pointArr[i].point[1],40));
//     console.log(meshGroup,'1231313');
//     pointGroup.add(meshGroup);
//   }
  


//   scene.add(pointGroup)
  initMap(chinaJson)
  window.addEventListener("resize", onWindowResize, false);
}
