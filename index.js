import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0b0b0);

// stat panel
const stats = new Stats();
document.body.appendChild(stats.dom);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(40, 40, 0);
camera.lookAt(0, 0, 0);

// camera orbit
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enableDamping = true;
controls.zoomSpeed = 1.5;
controls.enablePan = true;

// auto resize
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// model loader
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'fyp_lab.glb',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(5, 5, 5);
    scene.add(model);
  },
  undefined
);

// light
const ambientLight = new THREE.AmbientLight('#ffffff', 5);
scene.add(ambientLight);

// gui
const gui = new dat.GUI();

gui
  .add(
    {
      resetCamera: function () {
        camera.position.set(40, 40, 0);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
      },
    },
    'resetCamera'
  )
  .name('Reset Camera');

// Load the CSV file
let enableModule = [2, 3, 4, 5, 6, 7, 8, 9];
let dataArray = [];
var csvLoader = new THREE.FileLoader();
csvLoader.load('Output.csv', function (data) {
  console.log("Data", data);
  let rows = data.split('\r\n');
  for (let i = 0; i < enableModule.length; i++) {
    dataArray.push(
      rows[enableModule[i]].split(',').map(parseFloat).map(get_color)
    );
  }
  console.log(dataArray);
  createModules();
});

function createModules() {
  // Create an array to store the sphere materials
  var moduleMaterials = [];

  var positions = [
    [13, 4, 25],
    [-11, 4, 25],
    [-25, 4, 13],
    [-25, 4, -9],
    [25, 4, 12],
    [25, 4, -12],
    [-9, 4, -19],
    [11, 4, -25],
  ];

  // Create modules
  for (var i = 0; i < 8; i++) {
    var geometry = new THREE.SphereGeometry(10, 16, 16);
    var material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      color: dataArray[i][0],
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...positions[i]);
    scene.add(sphere);
    moduleMaterials.push(material);
  }

  const attributes = {
    'Temp 1': 0,
    'Humid 1': 1,
    'Temp 2': 2,
    'Humid 2': 3,
    Co2: 4,
    'pm 1': 5,
    'pm 2.5': 6,
    'pm 10': 7,
    tvoc: 8,
  };

  const values = { attribute: Object.keys(attributes)[0] };

  gui
    .add(values, 'attribute', Object.keys(attributes))
    .onChange(() => {
      const attributeIndex = attributes[values.attribute];
      // Do something with the selected attribute index
      console.log(`Selected attribute index: ${attributeIndex}`);
      for (var i = 0; i < 8; i++) {
        moduleMaterials[i].color = new THREE.Color(
          dataArray[i][attributeIndex]
        );
      }
    })
    .name('Attribute');
}

function get_color(value) {
  // get the legend element
  const legend = document.getElementById('legend');

  // get the canvas context
  const context = legend.getContext('2d');

  // create a gradient
  const gradient = context.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, 'green');
  gradient.addColorStop(0.75, 'yellow');
  gradient.addColorStop(1, 'red');

  // draw the gradient on the canvas
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 50);

  // Create a texture from the canvas
  var texture = new THREE.CanvasTexture(legend);

  // Select a value on the color ramp and get the color code
  var color = new THREE.Color();
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  var canvasPixel = context.getImageData(Math.floor(value * 256), 0, 1, 1).data;
  color.setRGB(
    canvasPixel[0] / 255,
    canvasPixel[1] / 255,
    canvasPixel[2] / 255
  );

  return color;
}

// animate
function animate() {
  requestAnimationFrame(animate);
  // camera.update();
  controls.update();
  stats.update();
  renderer.render(scene, camera);
}

animate();
