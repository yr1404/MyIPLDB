import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { makeMenuVisible } from './button.js';


// === Scene Setup ===
const scene = new THREE.Scene();
const container = document.getElementById('model-container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;
controls.enableZoom = false;

// === Lights ===
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(1, 1, 1);
directionalLight1.castShadow = true;
directionalLight1.shadow.mapSize.width = 2048;
directionalLight1.shadow.mapSize.height = 2048;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight2.position.set(-1, 0.5, -1);
scene.add(directionalLight2);

const spotLight = new THREE.SpotLight(0xffcc88, 1.5);
spotLight.position.set(0, 5, 5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.2;
spotLight.castShadow = true;
scene.add(spotLight);

const spotLight2 = new THREE.SpotLight(0xffffcc, 1.0);
spotLight2.position.set(5, 3, -5);
spotLight2.angle = Math.PI / 6;
spotLight2.penumbra = 0.2;
scene.add(spotLight2);

// === Environment Map ===
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader
  .setPath('https://threejs.org/examples/textures/cube/Bridge2/')
  .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
scene.environment = envMap;

// === Material Setup ===
const goldMaterial = new THREE.MeshStandardMaterial({
  color: 0xdaa520,
  metalness: 1.0,
  roughness: 0.2,
  envMap: envMap,
  envMapIntensity: 1.0,
  emissive: 0x222200,
  emissiveIntensity: 0.3
});

// === Texture Loading ===
const modelPath = './Pbr/lod.fbx';
const folderPath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
const texturePaths = {
  diffuse: folderPath + 'texture_diffuse.png',
  normal: folderPath + 'texture_normal.png',
  metallic: folderPath + 'texture_metallic.png',
  roughness: folderPath + 'texture_roughness.png',
  pbr: folderPath + 'texture_pbr.png'
};

const textures = {};
let loadedTextures = 0;
const totalTextures = Object.keys(texturePaths).length;
const textureLoader = new THREE.TextureLoader();

function checkTexturesAndLoadModel() {
  if (loadedTextures === totalTextures) {
    if (!textures.diffuse) {
      loadModelWithGoldMaterial();
    } else {
      loadModelWithPBR();
    }
  }
}

function loadTextures() {
  for (const [type, path] of Object.entries(texturePaths)) {
    textureLoader.load(
      path,
      (texture) => {
        textures[type] = texture;
        if (type === 'normal') texture.encoding = THREE.LinearEncoding;
        loadedTextures++;
        checkTexturesAndLoadModel();
      },
      undefined,
      () => {
        loadedTextures++;
        checkTexturesAndLoadModel();
      }
    );
  }
}
loadTextures();

let loadedModel = null;
let originalScale = { x: 0.01, y: 0.01, z: 0.01 };

function loadModelWithPBR() {
  const pbrMaterial = new THREE.MeshStandardMaterial({
    map: textures.diffuse,
    normalMap: textures.normal,
    metalnessMap: textures.metallic,
    roughnessMap: textures.roughness,
    aoMap: textures.pbr,
    envMap: envMap,
    envMapIntensity: 1.0,
    metalness: 1.0,
    roughness: 0.3,
    color: 0xffd700,
    emissive: 0x222200,
    emissiveIntensity: 0.2
  });

  const loader = new FBXLoader();
  loader.load(modelPath, (fbx) => {
    const model = fbx;
    loadedModel = model;

    model.traverse((node) => {
      if (node.isMesh) {
        node.material = pbrMaterial.clone();
        if (node.geometry.attributes.uv && !node.geometry.attributes.uv2) {
          node.geometry.attributes.uv2 = node.geometry.attributes.uv;
        }
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    model.scale.set(0.01, 0.01, 0.01);
    originalScale = { x: 0.01, y: 0.01, z: 0.01 };

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    camera.position.z = Math.max(size.x, size.y, size.z) * 2;
  });
}

function loadModelWithGoldMaterial() {
  const loader = new FBXLoader();
  loader.load(modelPath, (fbx) => {
    const model = fbx;
    loadedModel = model;

    model.traverse((node) => {
      if (node.isMesh) {
        node.material = goldMaterial;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    model.scale.set(0.01, 0.01, 0.01);
    originalScale = { x: 0.01, y: 0.01, z: 0.01 };

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    camera.position.z = Math.max(size.x, size.y, size.z) * 2;
  });
}

// === Hover and Click Interaction ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isModelHovered = false;

// Add touch support variables
let lastTap = 0;
let touchTimeout;
const doubleTapDelay = 300; // milliseconds between taps to count as double-tap

function checkIntersection(clientX, clientY) {
  if (!loadedModel) return false;

  const rect = container.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera({ x, y }, camera);
  const intersectable = [];
  loadedModel.traverse((node) => node.isMesh && intersectable.push(node));
  const intersects = raycaster.intersectObjects(intersectable);

  return intersects.length > 0;
}

function checkHoverIntersection() {
  if (!loadedModel) return;

  raycaster.setFromCamera(mouse, camera);
  const intersectable = [];
  loadedModel.traverse((node) => node.isMesh && intersectable.push(node));
  const intersects = raycaster.intersectObjects(intersectable);

  if (intersects.length > 0) {
    if (!isModelHovered) {
      isModelHovered = true;
      scaleModelUp();
    }
  } else {
    if (isModelHovered) {
      isModelHovered = false;
      scaleModelToOriginal();
    }
  }
}

function scaleModelUp() {
  if (!loadedModel) return;
  animateScale(loadedModel, {
    x: originalScale.x * 1.1,
    y: originalScale.y * 1.1,
    z: originalScale.z * 1.1
  }, 0.5);
}

function scaleModelToOriginal() {
  if (!loadedModel) return;
  animateScale(loadedModel, originalScale, 0.5);
}

function animateScale(model, target, duration) {
  const start = { x: model.scale.x, y: model.scale.y, z: model.scale.z };
  const startTime = Date.now();

  function update() {
    const elapsed = (Date.now() - startTime) / 1000;
    const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 2);

    model.scale.set(
      start.x + (target.x - start.x) * ease,
      start.y + (target.y - start.y) * ease,
      start.z + (target.z - start.z) * ease
    );

    if (t < 1) requestAnimationFrame(update);
  }

  update();
}

// Function to handle model activation (menu display)
function activateModel(clientX, clientY) {
  if (checkIntersection(clientX, clientY)) {
    makeMenuVisible();
    controls.autoRotate = false;
  }
}

// === Mouse Events ===
container.addEventListener('mousemove', (event) => {
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  checkHoverIntersection();
});

container.addEventListener('mouseleave', () => {
  if (isModelHovered) {
    isModelHovered = false;
    scaleModelToOriginal();
  }
});

container.addEventListener('dblclick', (event) => {
  activateModel(event.clientX, event.clientY);
});

// === Touch Events for Mobile Devices ===
container.addEventListener('touchstart', (event) => {
  // Prevent default to avoid scrolling/zooming while interacting with the model
  event.preventDefault();
  
  const now = Date.now();
  const timeSince = now - lastTap;
  
  if (timeSince < doubleTapDelay && timeSince > 0) {
    // Double tap detected
    clearTimeout(touchTimeout);
    
    // Use the first touch point
    const touch = event.touches[0];
    activateModel(touch.clientX, touch.clientY);
  } else {
    // Single tap - set up for potential double tap
    lastTap = now;
    
    // Also handle hover effect on touch
    const touch = event.touches[0];
    if (checkIntersection(touch.clientX, touch.clientY)) {
      isModelHovered = true;
      scaleModelUp();
    }
    
    touchTimeout = setTimeout(() => {
      // If this runs, it was a single tap
      // Reset the hover state after a delay if needed
      if (isModelHovered) {
        isModelHovered = false;
        scaleModelToOriginal();
      }
    }, doubleTapDelay);
  }
}, { passive: false });

container.addEventListener('touchend', (event) => {
  // Optional: Add any special handling for touch end if necessary
});

container.addEventListener('touchcancel', (event) => {
  if (isModelHovered) {
    isModelHovered = false;
    scaleModelToOriginal();
  }
  clearTimeout(touchTimeout);
});

// === Animate ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Responsive Design ===
function resizeRenderer() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', resizeRenderer);

// Initial setup for mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  // Adjust controls for better mobile experience
  controls.rotateSpeed = 0.7;
  controls.enableZoom = false;
  controls.enablePan = false;
}