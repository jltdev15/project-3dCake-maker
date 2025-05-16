<template>
  <ion-page class="customize-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Customize Cake</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Selections Modal -->
      <div class="selections-modal" v-if="showSelectionsModal">
        <div class="modal-content">
          <h2>Customize Your Cake</h2>
          
          <!-- Step 1: Number of Layers -->
          <div class="selection-step" v-if="currentStep === 1">
            <h3>How many layers would you like?</h3>
            <div class="options-grid">
              <button 
                v-for="num in [1, 2, 3, 4]" 
                :key="num"
                :class="['option-button', { selected: selectedLayers === num }]"
                @click="selectLayers(num)"
              >
                {{ num }} Layer{{ num > 1 ? 's' : '' }}
              </button>
            </div>
          </div>

          <!-- Step 2: Cake Shape -->
          <div class="selection-step" v-if="currentStep === 2">
            <h3>Choose your cake shape</h3>
            <div class="options-grid">
              <button 
                v-for="shape in ['Round', 'Square', 'Heart']" 
                :key="shape"
                :class="['option-button', { selected: selectedShape === shape }]"
                @click="selectShape(shape)"
              >
                {{ shape }}
              </button>
            </div>
          </div>

          <!-- Step 3: Cake Size -->
          <div class="selection-step" v-if="currentStep === 3">
            <h3>Select your cake size</h3>
            <div class="options-grid">
              <button 
                v-for="size in ['Small', 'Medium', 'Large']" 
                :key="size"
                :class="['option-button', { selected: selectedSize === size }]"
                @click="selectSize(size)"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="modal-navigation">
            <button 
              v-if="currentStep > 1" 
              class="nav-button back"
              @click="previousStep"
            >
              Back
            </button>
            <button 
              v-if="currentStep < 3" 
              class="nav-button next"
              @click="nextStep"
              :disabled="!canProceed"
            >
              Next
            </button>
            <button 
              v-if="currentStep === 3" 
              class="nav-button finish"
              @click="finishSelection"
              :disabled="!canProceed"
            >
              Create Cake
            </button>
          </div>
        </div>
      </div>

      <div class="cake-customizer">
        <canvas id="cakeCanvas"></canvas>
        <div class="controls-panel">
          <div class="tabs">
            <button class="tab-button active" data-tab="tab-design">Design</button>
            <button class="tab-button" data-tab="tab-layer-editor">Layer Editor</button>
          </div>
          <div class="tab-content active" id="tab-design">
            <div class="control-group">
              <button id="addLayerBtn" class="action-button">Add New Layer</button>
              <button id="saveCakeBtn" class="action-button">Save Design</button>
              <input type="file" id="loadCakeInput" accept=".json" style="display: none;">
              <button id="loadCakeBtn" class="action-button" onclick="document.getElementById('loadCakeInput').click()">Load Design</button>
              <button id="resetCakeBtn" class="action-button">Reset Design</button>
            </div>
          </div>
          <div class="tab-content" id="tab-layer-editor">
            <div id="layerEditPrompt" class="prompt">Click a cake layer in the 3D view to edit it.</div>
            <div id="selectedLayerControlsContainer"></div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonBackButton
} from '@ionic/vue';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, cakeGroup, controls, cakeStand;
let cakeLayers = [];
let layerIdCounter = 0;
let clock = new THREE.Clock();
let needsCakeRender = false;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedLayerId = null;
let originalLayerMaterials = new Map();

const defaultLayerSettings = {
  radius: 1.5,
  height: 0.5,
  color: '#FFB6C1',
  toppings: [],
  edgeIcing: {
    enabled: false,
    style: 'smooth',
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  },
  middleBandIcing: {
    enabled: false,
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  }
};

// Add new reactive variables for the selections modal
const showSelectionsModal = ref(true);
const currentStep = ref(1);
const selectedLayers = ref(null);
const selectedShape = ref(null);
const selectedSize = ref(null);

// Computed property to check if user can proceed to next step
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedLayers.value !== null;
    case 2:
      return selectedShape.value !== null;
    case 3:
      return selectedSize.value !== null;
    default:
      return false;
  }
});

const createCakeStand = () => {
  const standGroup = new THREE.Group();
  const baseRadius = 2;
  const baseHeight = 0.1;
  const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -baseHeight / 2;
  standGroup.add(base);

  const pillarRadius = 0.2;
  const pillarHeight = 0.5;
  const pillarGeometry = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar.position.y = pillarHeight / 2;
  standGroup.add(pillar);

  const topRadius = 1.8;
  const topHeight = 0.05;
  const topGeometry = new THREE.CylinderGeometry(topRadius, topRadius, topHeight, 32);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = pillarHeight + topHeight / 2;
  standGroup.add(top);

  standGroup.userData.totalHeight = baseHeight + pillarHeight + topHeight;
  return standGroup;
};

onMounted(() => {
  initScene();
});

onUnmounted(() => {
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  window.removeEventListener('resize', onWindowResize);
});

const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f4f8);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);
  const canvas = document.getElementById('cakeCanvas');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  
  // Create and position the cake stand
  cakeStand = createCakeStand();
  cakeStand.position.y = 0;
  scene.add(cakeStand);
  
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.name = "groundPlane";
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.01;
  scene.add(plane);
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  
  cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  initTabs();
  document.getElementById('addLayerBtn').addEventListener('click', addNewLayerAndSelect);
  document.getElementById('saveCakeBtn').addEventListener('click', saveCakeConfiguration);
  document.getElementById('loadCakeInput').addEventListener('change', loadCakeConfiguration);
  document.getElementById('resetCakeBtn').addEventListener('click', resetCakeDesign);

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('click', onCanvasClick, false);

  addNewLayerAndSelect();
  animate();
};

const initTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      const targetTabId = button.getAttribute('data-tab');
      document.getElementById(targetTabId).classList.add('active');
    });
  });
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
};

const onCanvasClick = (event) => {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cakeGroup.children.filter(child => child.userData.isCakeLayer));
  if (intersects.length > 0) {
    const clickedLayerObject = intersects[0].object;
    if (clickedLayerObject.userData.layerId) {
      selectLayer(clickedLayerObject.userData.layerId);
      const layerEditorTabButton = document.querySelector('.tab-button[data-tab="tab-layer-editor"]');
      if (layerEditorTabButton) {
        layerEditorTabButton.click();
      }
    }
  } else {
    selectLayer(null);
  }
};

const selectLayer = (layerId) => {
  if (selectedLayerId) {
    const previousLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId
    );
    if (previousLayerMesh && originalLayerMaterials.has(selectedLayerId)) {
      previousLayerMesh.material = originalLayerMaterials.get(selectedLayerId);
      originalLayerMaterials.delete(selectedLayerId);
    }
  }
  selectedLayerId = layerId;
  if (selectedLayerId) {
    const currentLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId
    );
    if (currentLayerMesh) {
      if (!originalLayerMaterials.has(selectedLayerId)) {
        originalLayerMaterials.set(selectedLayerId, currentLayerMesh.material);
      }
      currentLayerMesh.material = currentLayerMesh.material.clone();
      currentLayerMesh.material.emissive.setHex(0x555555);
    }
  }
  updateControlsForSelectedLayer();
  renderCake();
};

const updateControlsForSelectedLayer = () => {
  const controlsContainer = document.getElementById('selectedLayerControlsContainer');
  const prompt = document.getElementById('layerEditPrompt');
  controlsContainer.innerHTML = '';
  if (selectedLayerId) {
    const layerConfig = cakeLayers.find(l => l.id === selectedLayerId);
    if (layerConfig) {
      if (prompt) prompt.style.display = 'none';
      addLayerControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = 'block';
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit it.";
      prompt.style.display = 'block';
    }
  }
};

const createLayerMesh = (radius, height, color, layerId) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1
  });
  const layerMesh = new THREE.Mesh(geometry, material);
  layerMesh.userData.isCakeLayer = true;
  layerMesh.userData.layerId = layerId;
  return layerMesh;
};

const addDecorations = (layerMesh, layerConfig) => {
  const {
    radius: layerRadius,
    height: layerHeight,
    toppings,
    edgeIcing,
    middleBandIcing
  } = layerConfig;
  const topY = layerHeight / 2;
  const middleY = 0;

  const existingEdgeIcing = layerMesh.getObjectByName("edgeIcingGroup");
  if (existingEdgeIcing) {
    existingEdgeIcing.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingEdgeIcing);
  }
  const existingMiddleIcing = layerMesh.getObjectByName("middleBandIcingGroup");
  if (existingMiddleIcing) {
    existingMiddleIcing.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingMiddleIcing);
  }
  const existingToppings = layerMesh.getObjectByName("toppingGroup");
  if (existingToppings) {
    existingToppings.traverse(c => {
      if (c.isMesh || c.isGroup) {
        c.traverse(sc => {
          if (sc.isMesh) {
            if (sc.geometry) sc.geometry.dispose();
            if (sc.material) sc.material.dispose();
          }
        });
      }
    });
    layerMesh.remove(existingToppings);
  }

  if (edgeIcing.enabled) {
    const icingGroup = new THREE.Group();
    icingGroup.name = "edgeIcingGroup";
    const icingMaterial = new THREE.MeshStandardMaterial({
      color: edgeIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    if (edgeIcing.style === 'smooth') {
      let angle = edgeIcing.isAnimating ? edgeIcing.animationProgress * Math.PI * 2 : Math.PI * 2;
      angle = Math.max(0.001, angle);
      const tube = edgeIcing.thickness;
      const radius = layerRadius - tube;
      if (radius > 0) {
        const geo = new THREE.TorusGeometry(radius, tube, 24, 64, angle);
        const mesh = new THREE.Mesh(geo, icingMaterial);
        mesh.position.y = topY;
        mesh.rotation.x = Math.PI / 2;
        icingGroup.add(mesh);
      }
    } else if (edgeIcing.style === 'curl') {
      const curlR = edgeIcing.thickness * 0.8;
      const numTotal = Math.max(1, Math.floor((Math.PI * 2 * (layerRadius - curlR)) / (curlR * 2.5)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const geo = new THREE.SphereGeometry(curlR, 12, 8);
        const mesh = new THREE.Mesh(geo, icingMaterial);
        mesh.position.set(Math.cos(ang) * (layerRadius - curlR * 0.7), topY + curlR * 0.3, Math.sin(ang) * (layerRadius - curlR * 0.7));
        icingGroup.add(mesh);
      }
    }
    if (icingGroup.children.length > 0) layerMesh.add(icingGroup);
  }

  if (middleBandIcing.enabled) {
    const middleIcingGroup = new THREE.Group();
    middleIcingGroup.name = "middleBandIcingGroup";
    const middleIcingMaterial = new THREE.MeshStandardMaterial({
      color: middleBandIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    let currentMiddleAngle = Math.PI * 2;
    if (middleBandIcing.isAnimating) {
      currentMiddleAngle = middleBandIcing.animationProgress * Math.PI * 2;
    }
    currentMiddleAngle = Math.max(0.001, currentMiddleAngle);
    const tube = middleBandIcing.thickness;
    const radius = layerRadius;
    if (radius > 0) {
      const middleGeo = new THREE.TorusGeometry(layerRadius - tube, tube, 24, 64, currentMiddleAngle);
      const middleMesh = new THREE.Mesh(middleGeo, middleIcingMaterial);
      middleMesh.position.y = middleY;
      middleMesh.rotation.x = Math.PI / 2;
      middleIcingGroup.add(middleMesh);
    }
    if (middleIcingGroup.children.length > 0) layerMesh.add(middleIcingGroup);
  }

  const overallToppingGroup = new THREE.Group();
  overallToppingGroup.name = "toppingGroup";
  toppings.forEach(topping => {
    if (topping.type === 'sprinkles') {
      const sprinkleCount = 150;
      const sprinkleMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.1
      });
      for (let i = 0; i < sprinkleCount; i++) {
        const sprinkleGeo = new THREE.BoxGeometry(0.03, 0.15, 0.03);
        const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMaterial.clone());
        sprinkle.material.color.setHSL(Math.random(), 0.8, 0.6);
        const angle = Math.random() * Math.PI * 2;
        const sprinkleRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.1;
        const dist = Math.random() * Math.max(0, sprinkleRadius);
        sprinkle.position.set(Math.cos(angle) * dist, topY + 0.075, Math.sin(angle) * dist);
        sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        overallToppingGroup.add(sprinkle);
      }
    } else if (topping.type === 'cherries') {
      const cherryCount = Math.max(1, Math.floor(layerRadius * 1.5));
      const cherryMaterial = new THREE.MeshStandardMaterial({
        color: 0xAA0000,
        roughness: 0.4,
        metalness: 0.2
      });
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x006400,
        roughness: 0.6
      });
      for (let i = 0; i < cherryCount; i++) {
        const cherry = new THREE.Group();
        const cherryBodyRadius = 0.15;
        const bodyGeo = new THREE.SphereGeometry(cherryBodyRadius, 16, 16);
        const body = new THREE.Mesh(bodyGeo, cherryMaterial);
        cherry.add(body);
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
        const stem = new THREE.Mesh(stemGeo, stemMaterial);
        stem.position.y = cherryBodyRadius + 0.05;
        stem.rotation.z = Math.PI / 6;
        cherry.add(stem);
        let angle, dist;
        const availableRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - cherryBodyRadius;
        if (cherryCount === 1) {
          angle = 0;
          dist = 0;
        } else {
          angle = (i / cherryCount) * Math.PI * 2;
          dist = Math.max(0, availableRadius * 0.75);
        }
        cherry.position.set(Math.cos(angle) * dist, topY + cherryBodyRadius, Math.sin(angle) * dist);
        overallToppingGroup.add(cherry);
      }
    }
  });
  if (overallToppingGroup.children.length > 0) layerMesh.add(overallToppingGroup);
};

const renderCake = () => {
  const layersToRemove = cakeGroup.children.filter(child => child.userData.isCakeLayer);
  layersToRemove.forEach(child => {
    if (originalLayerMaterials.has(child.userData.layerId) && child.material !== originalLayerMaterials.get(child.userData.layerId)) {
      if (child.material.dispose) child.material.dispose();
    } else if (!originalLayerMaterials.has(child.userData.layerId) && child.material && child.material.dispose) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
    child.traverse(object => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
          else object.material.dispose();
        }
      }
    });
    cakeGroup.remove(child);
  });
  originalLayerMaterials.clear();

  let currentHeightOffset = cakeStand.userData.totalHeight;
  let topLayerRadius = 0;
  let topLayerHeight = 0;

  if (cakeLayers.length > 0) {
    cakeLayers.forEach((layerConfig, index) => {
      const layerMesh = createLayerMesh(layerConfig.radius, layerConfig.height, layerConfig.color, layerConfig.id);
      layerMesh.position.y = currentHeightOffset + layerConfig.height / 2;
      addDecorations(layerMesh, layerConfig);
      cakeGroup.add(layerMesh);
      currentHeightOffset += layerConfig.height;
      if (index === cakeLayers.length - 1) {
        topLayerRadius = layerConfig.radius;
        topLayerHeight = layerConfig.height;
      }
      if (layerConfig.id === selectedLayerId) {
        if (!originalLayerMaterials.has(selectedLayerId)) {
          originalLayerMaterials.set(selectedLayerId, layerMesh.material);
        }
        layerMesh.material = layerMesh.material.clone();
        layerMesh.material.emissive.setHex(0x555555);
      }
    });
  }
  renderer.render(scene, camera);
};

const addNewLayerAndSelect = () => {
  layerIdCounter++;
  const newLayerId = `layer_${layerIdCounter}`;
  const newLayer = {
    id: newLayerId,
    ...JSON.parse(JSON.stringify(defaultLayerSettings))
  };
  if (cakeLayers.length > 0) {
    const topLayer = cakeLayers[cakeLayers.length - 1];
    newLayer.radius = Math.max(0.5, topLayer.radius - 0.3);
    newLayer.height = Math.max(0.3, topLayer.height - 0.1);
  }
  cakeLayers.push(newLayer);
  renderCake();
  selectLayer(newLayerId);
  const layerEditorTabButton = document.querySelector('.tab-button[data-tab="tab-layer-editor"]');
  if (layerEditorTabButton) {
    layerEditorTabButton.click();
  }
};

const removeLayer = (layerIdToRemove) => {
  const layerIndex = cakeLayers.findIndex(l => l.id === layerIdToRemove);
  if (layerIndex === -1) return;
  cakeLayers.splice(layerIndex, 1);
  if (selectedLayerId === layerIdToRemove) {
    selectLayer(null);
  }
  renderCake();
};

const updateLayerProperty = (layerId, propertyPath, value) => {
  const layer = cakeLayers.find(l => l.id === layerId);
  if (layer) {
    const keys = propertyPath.split('.');
    let currentObject = layer;
    let propertyKey = keys[keys.length - 1];

    if (propertyPath.startsWith('toppings.')) {
      const toppingType = propertyKey;
      currentObject = layer.toppings;
      const existingToppingIndex = currentObject.findIndex(t => t.type === toppingType);
      if (value) {
        if (existingToppingIndex === -1) {
          currentObject.push({
            type: toppingType
          });
        }
      } else {
        if (existingToppingIndex !== -1) {
          currentObject.splice(existingToppingIndex, 1);
        }
      }
    } else {
      for (let i = 0; i < keys.length - 1; i++) {
        currentObject = currentObject[keys[i]];
        if (typeof currentObject === 'undefined') return;
      }
      let parsedValue = value;
      if (propertyKey === 'radius' || propertyKey === 'height' || propertyKey === 'thickness') {
        parsedValue = parseFloat(value);
      } else if (propertyKey === 'enabled' && (propertyPath.startsWith('edgeIcing') || propertyPath.startsWith('middleBandIcing'))) {
        parsedValue = Boolean(value);
        const icingConfigToAnimate = propertyPath.startsWith('edgeIcing') ? currentObject : layer.middleBandIcing;
        icingConfigToAnimate.isAnimating = parsedValue;
        if (!parsedValue) {
          icingConfigToAnimate.animationProgress = 0;
        } else {
          icingConfigToAnimate.animationProgress = 0;
        }
      } else if (propertyKey === 'enabled' && typeof value === 'boolean') {
        parsedValue = value;
      }
      currentObject[propertyKey] = parsedValue;
    }

    let isAnyIcingAnimating = (layer.edgeIcing && layer.edgeIcing.enabled && layer.edgeIcing.isAnimating) ||
      (layer.middleBandIcing && layer.middleBandIcing.enabled && layer.middleBandIcing.isAnimating);

    if (isAnyIcingAnimating) {
      needsCakeRender = true;
    } else {
      renderCake();
    }
  }
};

const addLayerControlsUI = (layerConfig, container) => {
  const layerControlsDiv = document.createElement('div');
  layerControlsDiv.className = 'control-group';
  const edgeIcingSubControlsId = `edge_icing_sub_controls_${layerConfig.id}`;
  const middleIcingSubControlsId = `middle_icing_sub_controls_${layerConfig.id}`;
  const edgeIcingConfig = layerConfig.edgeIcing;
  const middleBandIcingConfig = layerConfig.middleBandIcing;

  const hasSprinkles = layerConfig.toppings.some(t => t.type === 'sprinkles');
  const hasCherries = layerConfig.toppings.some(t => t.type === 'cherries');

  layerControlsDiv.innerHTML = `
    <p class="layer-header">Editing Layer ${cakeLayers.findIndex(l => l.id === layerConfig.id) + 1}</p>
    <div><label for="color_${layerConfig.id}">Layer Color:</label><input type="color" id="color_${layerConfig.id}" value="${layerConfig.color}"></div>
    <div class="mt-2"><label for="radius_${layerConfig.id}">Layer Radius (${layerConfig.radius.toFixed(1)}):</label><input type="range" id="radius_${layerConfig.id}" min="0.5" max="5" step="0.1" value="${layerConfig.radius}"></div>
    <div class="mt-2"><label for="height_${layerConfig.id}">Layer Height (${layerConfig.height.toFixed(1)}):</label><input type="range" id="height_${layerConfig.id}" min="0.2" max="3" step="0.1" value="${layerConfig.height}"></div>

    <div class="mt-2">
      <label>Toppings:</label>
      <div class="toppings-group flex flex-wrap gap-x-4 gap-y-1">
        <label class="checkbox-label">
          <input type="checkbox" id="topping_sprinkles_${layerConfig.id}" value="sprinkles" ${hasSprinkles ? 'checked' : ''}> Sprinkles
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="topping_cherries_${layerConfig.id}" value="cherries" ${hasCherries ? 'checked' : ''}> Cherries
        </label>
      </div>
    </div>

    <div class="icing-section mt-3 pt-3 border-t border-gray-200">
      <label class="checkbox-label"><input type="checkbox" id="edgeIcing_enabled_${layerConfig.id}" ${edgeIcingConfig.enabled ? 'checked' : ''}>Enable Edge Icing</label>
      <div id="${edgeIcingSubControlsId}" class="sub-controls mt-2 ${edgeIcingConfig.enabled ? '' : 'hidden'}">
        <div class="mt-1">
          <label for="edgeIcing_style_${layerConfig.id}">Edge Style:</label>
          <select id="edgeIcing_style_${layerConfig.id}">
            <option value="smooth" ${edgeIcingConfig.style === 'smooth' ? 'selected' : ''}>Smooth Ring</option>
            <option value="curl" ${edgeIcingConfig.style === 'curl' ? 'selected' : ''}>Curl Pattern</option>
          </select>
        </div>
        <div class="mt-2"><label for="edgeIcing_color_${layerConfig.id}">Edge Color:</label><input type="color" id="edgeIcing_color_${layerConfig.id}" value="${edgeIcingConfig.color}"></div>
        <div class="mt-2"><label for="edgeIcing_thickness_${layerConfig.id}">Edge Detail/Thickness (${edgeIcingConfig.thickness.toFixed(2)}):</label><input type="range" id="edgeIcing_thickness_${layerConfig.id}" min="0.02" max="0.3" step="0.01" value="${edgeIcingConfig.thickness}"></div>
      </div>
    </div>

    <div class="icing-section mt-3 pt-3 border-t border-gray-200">
      <label class="checkbox-label"><input type="checkbox" id="middleIcing_enabled_${layerConfig.id}" ${middleBandIcingConfig.enabled ? 'checked' : ''}>Enable Middle Band Icing</label>
      <div id="${middleIcingSubControlsId}" class="sub-controls mt-2 ${middleBandIcingConfig.enabled ? '' : 'hidden'}">
        <div class="mt-2"><label for="middleIcing_color_${layerConfig.id}">Middle Color:</label><input type="color" id="middleIcing_color_${layerConfig.id}" value="${middleBandIcingConfig.color}"></div>
        <div class="mt-2"><label for="middleIcing_thickness_${layerConfig.id}">Middle Thickness (${middleBandIcingConfig.thickness.toFixed(2)}):</label><input type="range" id="middleIcing_thickness_${layerConfig.id}" min="0.02" max="0.2" step="0.01" value="${middleBandIcingConfig.thickness}"></div>
      </div>
    </div>

    <button class="remove-layer-btn mt-3" id="removeSelectedLayerBtn">Remove This Layer</button>`;
  container.appendChild(layerControlsDiv);

  document.getElementById(`color_${layerConfig.id}`).addEventListener('input', (e) => updateLayerProperty(layerConfig.id, 'color', e.target.value));
  const radiusInput = document.getElementById(`radius_${layerConfig.id}`);
  const radiusLabel = layerControlsDiv.querySelector(`label[for='radius_${layerConfig.id}']`);
  radiusInput.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'radius', e.target.value);
    radiusLabel.textContent = `Layer Radius (${parseFloat(e.target.value).toFixed(1)}):`;
  });
  const heightInput = document.getElementById(`height_${layerConfig.id}`);
  const heightLabel = layerControlsDiv.querySelector(`label[for='height_${layerConfig.id}']`);
  heightInput.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'height', e.target.value);
    heightLabel.textContent = `Layer Height (${parseFloat(e.target.value).toFixed(1)}):`;
  });

  document.getElementById(`topping_sprinkles_${layerConfig.id}`).addEventListener('change', (e) => updateLayerProperty(layerConfig.id, 'toppings.sprinkles', e.target.checked));
  document.getElementById(`topping_cherries_${layerConfig.id}`).addEventListener('change', (e) => updateLayerProperty(layerConfig.id, 'toppings.cherries', e.target.checked));

  const edgeIcingEnabledCheckbox = document.getElementById(`edgeIcing_enabled_${layerConfig.id}`);
  const edgeIcingSubControlsDiv = document.getElementById(edgeIcingSubControlsId);
  edgeIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.enabled', e.target.checked);
    edgeIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById(`edgeIcing_style_${layerConfig.id}`).addEventListener('change', (e) => updateLayerProperty(layerConfig.id, 'edgeIcing.style', e.target.value));
  document.getElementById(`edgeIcing_color_${layerConfig.id}`).addEventListener('input', (e) => updateLayerProperty(layerConfig.id, 'edgeIcing.color', e.target.value));
  const edgeIcingThicknessInput = document.getElementById(`edgeIcing_thickness_${layerConfig.id}`);
  const edgeIcingThicknessLabel = layerControlsDiv.querySelector(`label[for='edgeIcing_thickness_${layerConfig.id}']`);
  edgeIcingThicknessInput.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.thickness', e.target.value);
    edgeIcingThicknessLabel.textContent = `Edge Detail/Thickness (${parseFloat(e.target.value).toFixed(2)}):`;
  });

  const middleIcingEnabledCheckbox = document.getElementById(`middleIcing_enabled_${layerConfig.id}`);
  const middleIcingSubControlsDiv = document.getElementById(middleIcingSubControlsId);
  middleIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'middleBandIcing.enabled', e.target.checked);
    middleIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById(`middleIcing_color_${layerConfig.id}`).addEventListener('input', (e) => updateLayerProperty(layerConfig.id, 'middleBandIcing.color', e.target.value));
  const middleIcingThicknessInput = document.getElementById(`middleIcing_thickness_${layerConfig.id}`);
  const middleIcingThicknessLabel = layerControlsDiv.querySelector(`label[for='middleIcing_thickness_${layerConfig.id}']`);
  middleIcingThicknessInput.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'middleBandIcing.thickness', e.target.value);
    middleIcingThicknessLabel.textContent = `Middle Thickness (${parseFloat(e.target.value).toFixed(2)}):`;
  });

  document.getElementById(`removeSelectedLayerBtn`).addEventListener('click', () => removeLayer(layerConfig.id));
};

const saveCakeConfiguration = () => {
  const cakeData = {
    cakeLayers: cakeLayers,
    layerIdCounter: layerIdCounter
  };
  const jsonData = JSON.stringify(cakeData, null, 2);
  const blob = new Blob([jsonData], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cake-design.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("Cake configuration saved.");
};

const loadCakeConfiguration = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loadedData = JSON.parse(e.target.result);
      if (loadedData.cakeLayers) {
        selectLayer(null);
        cakeLayers = [];

        cakeLayers = loadedData.cakeLayers.map(loadedLayer => {
          const defaultStructure = JSON.parse(JSON.stringify(defaultLayerSettings));
          const mergedLayer = {
            ...defaultStructure,
            ...loadedLayer
          };
          mergedLayer.edgeIcing = {
            ...(defaultStructure.edgeIcing || {}),
            ...(loadedLayer.edgeIcing || {})
          };
          mergedLayer.middleBandIcing = {
            ...(defaultStructure.middleBandIcing || {}),
            ...(loadedLayer.middleBandIcing || {})
          };
          mergedLayer.toppings = loadedLayer.toppings || [];
          ['edgeIcing', 'middleBandIcing'].forEach(icingType => {
            if (mergedLayer[icingType]) {
              if (!mergedLayer[icingType].hasOwnProperty('isAnimating')) {
                mergedLayer[icingType].isAnimating = defaultStructure[icingType].isAnimating;
              }
              if (!mergedLayer[icingType].hasOwnProperty('animationProgress')) {
                mergedLayer[icingType].animationProgress = defaultStructure[icingType].animationProgress;
              }
              if (!mergedLayer[icingType].hasOwnProperty('animationSpeed')) {
                mergedLayer[icingType].animationSpeed = defaultStructure[icingType].animationSpeed;
              }
            }
          });
          return mergedLayer;
        });

        layerIdCounter = loadedData.layerIdCounter || cakeLayers.length;

        renderCake();

        if (cakeLayers.length > 0) {
          selectLayer(cakeLayers[0].id);
          const layerEditorTabButton = document.querySelector('.tab-button[data-tab="tab-layer-editor"]');
          if (layerEditorTabButton) layerEditorTabButton.click();
        } else {
          updateControlsForSelectedLayer();
          const designTabButton = document.querySelector('.tab-button[data-tab="tab-design"]');
          if (designTabButton) designTabButton.click();
        }
        console.log("Cake configuration loaded.");
      } else {
        alert("Invalid cake configuration file.");
      }
    } catch (error) {
      console.error("Error loading cake configuration:", error);
      alert("Error loading cake configuration: " + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = null;
};

const resetCakeDesign = () => {
  if (!confirm("Are you sure you want to reset the cake design? This will remove all layers and reset all settings.")) {
    return;
  }

  selectLayer(null);
  cakeLayers = [];
  layerIdCounter = 0;

  renderCake();

  console.log("Cake design has been reset to default.");
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderCake();
};

const animate = () => {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  let anyIcingAnimating = false;

  cakeLayers.forEach(layer => {
    if (layer.edgeIcing.enabled && layer.edgeIcing.isAnimating) {
      anyIcingAnimating = true;
      layer.edgeIcing.animationProgress += layer.edgeIcing.animationSpeed * deltaTime;
      if (layer.edgeIcing.animationProgress >= 1) {
        layer.edgeIcing.animationProgress = 1;
        layer.edgeIcing.isAnimating = false;
      }
      needsCakeRender = true;
    }
    if (layer.middleBandIcing.enabled && layer.middleBandIcing.isAnimating) {
      anyIcingAnimating = true;
      layer.middleBandIcing.animationProgress += layer.middleBandIcing.animationSpeed * deltaTime;
      if (layer.middleBandIcing.animationProgress >= 1) {
        layer.middleBandIcing.animationProgress = 1;
        layer.middleBandIcing.isAnimating = false;
      }
      needsCakeRender = true;
    }
  });

  if (needsCakeRender) {
    renderCake();
    needsCakeRender = false;
  }

  controls.update();
  if (anyIcingAnimating || (controls.enabled && (controls.autoRotate || controls.enableDamping))) {
    renderer.render(scene, camera);
  }
};

// Selection handlers
const selectLayers = (num) => {
  selectedLayers.value = num;
};

const selectShape = (shape) => {
  selectedShape.value = shape;
};

const selectSize = (size) => {
  selectedSize.value = size;
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const finishSelection = () => {
  // Generate cake based on selections
  generateCakeFromSelections();
  showSelectionsModal.value = false;
};

const generateCakeFromSelections = () => {
  // Clear existing layers
  cakeLayers = [];
  layerIdCounter = 0;

  // Calculate base dimensions based on size
  let baseRadius;
  switch (selectedSize.value) {
    case 'Small':
      baseRadius = 1.2;
      break;
    case 'Medium':
      baseRadius = 1.5;
      break;
    case 'Large':
      baseRadius = 1.8;
      break;
  }

  // Generate layers based on selection
  for (let i = 0; i < selectedLayers.value; i++) {
    layerIdCounter++;
    const newLayerId = `layer_${layerIdCounter}`;
    const newLayer = {
      id: newLayerId,
      ...JSON.parse(JSON.stringify(defaultLayerSettings))
    };

    // Adjust radius for each layer (decreasing as we go up)
    newLayer.radius = baseRadius - (i * 0.2);
    newLayer.height = 0.5;

    // Adjust color based on layer number
    const hue = (i * 30) % 360;
    newLayer.color = `hsl(${hue}, 70%, 80%)`;

    cakeLayers.push(newLayer);
  }

  // Render the cake
  renderCake();
};
</script>

<style scoped>
.customize-page {
  --background: #f0f4f8;
}

#cakeCanvas {
  display: block;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  cursor: pointer;
}

.controls-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.97);
  padding: 0 15px 15px 15px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
  max-height: 50vh;
  overflow-y: auto;
  z-index: 10;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
}

.tabs {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.tab-button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.control-group {
  margin-bottom: 15px;
}

.action-button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: #0056b3;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sub-controls {
  padding-left: 20px;
  border-left: 2px solid #ddd;
}

.prompt {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.layer-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.remove-layer-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.remove-layer-btn:hover {
  background: #c82333;
}

.toppings-group {
  margin-top: 5px;
}

.icing-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

input[type="range"] {
  width: 100%;
}

input[type="color"] {
  width: 50px;
  height: 25px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

select {
  width: 100%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.hidden {
  display: none;
}

/* Add new styles for the selections modal */
.selections-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.selection-step {
  margin-bottom: 2rem;
}

.selection-step h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-button {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.option-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.option-button.selected {
  border-color: #007bff;
  background: #e6f0ff;
  color: #007bff;
}

.modal-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.back {
  background: #f8f9fa;
  color: #666;
}

.nav-button.next {
  background: #007bff;
  color: white;
}

.nav-button.finish {
  background: #28a745;
  color: white;
}

.nav-button:hover:not(:disabled) {
  opacity: 0.9;
}
</style> 