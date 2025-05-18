<template>
  <ion-page class="customize-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="customize-title">Customize Cake</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Selections Modal -->
      <div class="selections-modal" v-if="showSelectionsModal">
        <div class="modal-content">
          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-steps">
              <div 
                v-for="step in 2" 
                :key="step"
                :class="['progress-step', { 
                  'completed': currentStep > step,
                  'active': currentStep === step 
                }]"
              >
                <div class="step-number">{{ step }}</div>
                <div class="step-label">
                  {{ step === 1 ? 'Layers' : 'Size' }}
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${((currentStep - 1) / 1) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <!-- Step 1: Number of Layers -->
            <div class="selection-step" v-if="currentStep === 1">
              <h2>Choose Your Layers</h2>
              <p class="step-description">Select how many layers you'd like for your cake</p>
              <div class="options-grid">
                <button 
                  v-for="num in [1, 2, 3]" 
                  :key="num"
                  :class="['option-button', { selected: selectedLayers === num }]"
                  @click="selectLayers(num)"
                >
                  <div class="option-content">
                    <div class="option-icon">
                      <div class="layer-preview">
                        <div 
                          v-for="i in num" 
                          :key="i"
                          class="preview-layer"
                        ></div>
                      </div>
                    </div>
                    <div class="option-label">{{ num }} Layer{{ num > 1 ? 's' : '' }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Cake Size -->
            <div class="selection-step" v-if="currentStep === 2">
              <h2>Select Size</h2>
              <p class="step-description">Choose the perfect size for your occasion</p>
              <div class="options-grid">
                <button 
                  v-for="size in sizeOptions" 
                  :key="size.name"
                  :class="['option-button', { selected: selectedSize && selectedSize.name === size.name }]"
                  @click="selectSize(size)"
                >
                  <div class="option-content">
                    <div class="option-icon">
                      <div :class="['size-preview', size.name.toLowerCase().replace(' inch', '')]"></div>
                    </div>
                    <div class="option-label">{{ size.name }}</div>
                    <div class="size-details">
                      <div>Diameter: {{ size.diameter }} in</div>
                      <div>Height: {{ size.height }} in</div>
                      <div>{{ size.servings }} servings</div>
                      <div class="price">₱{{ size.price.toLocaleString() }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="modal-navigation">
            <button 
              v-if="currentStep > 1" 
              class="nav-button back"
              @click="previousStep"
            >
              <span class="back-icon">←</span>
              Back
            </button>
            <button 
              v-if="currentStep < 2" 
              class="nav-button next"
              @click="nextStep"
              :disabled="!canProceed"
            >
              Next
              <span class="next-icon">→</span>
            </button>
            <button 
              v-if="currentStep === 2" 
              class="nav-button finish"
              @click="finishSelection"
              :disabled="!canProceed"
            >
              Create My Cake
              <span class="finish-icon">✓</span>
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
            <button class="tab-button" data-tab="tab-greeting">Greeting</button>
          </div>
          <div class="tab-content active" id="tab-design">
            <div class="control-group">
              <button id="addLayerBtn" class="action-button">Add New Layer</button>
              <button id="saveCakeBtn" class="action-button">Save Design</button>
              <input type="file" id="loadCakeInput" accept=".json" style="display: none;">
              <button id="loadCakeBtn" class="action-button" onclick="document.getElementById('loadCakeInput').click()">Load Design</button>
              <button id="resetCakeBtn" class="action-button">Reset Design</button>
              <button id="undoBtn" class="action-button" disabled>Undo Last Action</button>
            </div>
          </div>
          <div class="tab-content" id="tab-layer-editor">
            <div id="layerEditPrompt" class="prompt">Click a cake layer in the 3D view to edit it.</div>
            <div id="selectedLayerControlsContainer"></div>
          </div>
          <div class="tab-content" id="tab-greeting">
            <div class="greeting-control-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="greetingConfig.enabled" @change="onGreetingChange"> Enable Greeting Text
              </label>
              <div v-if="greetingConfig.enabled" class="sub-controls mt-2">
                <div class="mt-2">
                  <label for="greeting_text">Message:</label>
                  <input type="text" id="greeting_text" v-model="greetingConfig.text" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_color">Text Color:</label>
                  <input type="color" id="greeting_color" v-model="greetingConfig.color" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_size">Text Size ({{ greetingConfig.size.toFixed(2) }}):</label>
                  <input type="range" id="greeting_size" min="0.1" max="0.8" step="0.01" v-model.number="greetingConfig.size" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_layout">Layout:</label>
                  <select id="greeting_layout" v-model="greetingConfig.layout" @change="onGreetingChange">
                    <option value="horizontal-top">Horizontal (On Top, Flat)</option>
                    <option value="circular-top">Circular (On Top, Flat)</option>
                    <option value="vertical-side">Vertical (On Side, Upright)</option>
                  </select>
                </div>
              </div>
            </div>
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
import { onMounted, onUnmounted, ref, computed, reactive, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

let scene, camera, renderer, cakeGroup, controls, cakeStand;
let cakeLayers = [];
let layerIdCounter = 0;
let clock = new THREE.Clock();
let needsCakeRender = false;

// Add history stack for undo functionality
let historyStack = [];
const MAX_HISTORY = 20; // Limit history to prevent memory issues

// Function to save current state to history
const saveToHistory = () => {
  const currentState = {
    cakeLayers: JSON.parse(JSON.stringify(cakeLayers)),
    layerIdCounter: layerIdCounter
  };
  
  historyStack.push(currentState);
  
  // Limit history size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  }
  
  // Enable/disable undo button
  const undoButton = document.getElementById('undoBtn');
  if (undoButton) {
    undoButton.disabled = historyStack.length === 0;
  }
};

// Function to undo last action
const undoLastAction = () => {
  if (historyStack.length === 0) return;
  
  const previousState = historyStack.pop();
  if (previousState) {
    cakeLayers = previousState.cakeLayers;
    layerIdCounter = previousState.layerIdCounter;
    renderCake();
  }
  
  // Update undo button state
  const undoButton = document.getElementById('undoBtn');
  if (undoButton) {
    undoButton.disabled = historyStack.length === 0;
  }
};

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedLayerId = null;
let originalLayerMaterials = new Map();

const defaultLayerSettings = {
  radius: 1.5,
  height: 0.5,
  color: '#FFB6C1',
  toppings: [],
  topper: {
    enabled: false,
    type: 'none',
    text: '',
    fontSize: 1,
    color: '#000000',
    style: 'normal',
    position: 'center'
  },
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
  },
  bottomIcing: {
    enabled: false,
    style: 'smooth',
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  }
};

// Move sizeOptions above selectedSize
const sizeOptions = [
  { name: '6 x 6', diameter: 6, height: 6, servings: '8-10', price: 999 },
  { name: '6 x 7', diameter: 6, height: 7, servings: '10-14', price: 1299 },
  { name: '6 x 8', diameter: 6, height: 8, servings: '12-16', price: 1649 },
  { name: '6 x 9', diameter: 6, height: 9, servings: '16-20', price: 1949 },
  { name: '6 x 10', diameter: 6, height: 10, servings: '20-25', price: 2399 }
];

const showSelectionsModal = ref(true);
const currentStep = ref(1);
const selectedLayers = ref(1);
// Initialize selectedSize as null
const selectedSize = ref(null);

// Computed property to check if user can proceed to next step
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedLayers.value !== null;
    case 2:
      return selectedSize.value !== null;
    default:
      return false;
  }
});

// Adjust cake stand to be proportional to the cake
const createCakeStand = (cakeDiameter = 6) => {
  const standGroup = new THREE.Group();
  const baseRadius = (cakeDiameter + 1) / 2; // 1 inch larger than cake
  const baseHeight = 0.5; // Increased base height
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
  const pillarHeight = 2.5; // Increased pillar height
  const pillarGeometry = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar.position.y = pillarHeight / 2;
  standGroup.add(pillar);

  const topRadius = (cakeDiameter + 0.5) / 2; // Slightly larger than cake
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
  
  // Set initial camera position (closer to the scene)
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);
  
  const canvas = document.getElementById('cakeCanvas');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  
  // Create and position the cake stand (use default 6 if not available)
  cakeStand = createCakeStand(selectedSize.value ? selectedSize.value.diameter : 6);
  cakeStand.position.y = 0;
  scene.add(cakeStand);
  
  // Add ground grid for reference
  const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0xcccccc);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);
  
  // Setup controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 100;
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

  // Add undo button to the design tab
  const designTabContent = document.getElementById('tab-design');
  if (designTabContent) {
    const controlGroup = designTabContent.querySelector('.control-group');
    if (controlGroup) {
      const undoButton = document.createElement('button');
      undoButton.id = 'undoBtn';
      undoButton.className = 'action-button';
      undoButton.textContent = 'Undo Last Action';
      undoButton.disabled = true;
      undoButton.addEventListener('click', undoLastAction);
      controlGroup.insertBefore(undoButton, controlGroup.firstChild);
    }
  }

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

// Load the font once and reuse it
let loadedFont = null;
const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  loadedFont = font;
  console.log('Font loaded:', loadedFont);
  if (typeof renderCake === 'function') {
    console.log('Triggering renderCake after font load');
    renderCake();
  }
});

const addDecorations = (layerMesh, layerConfig) => {
  const {
    radius: layerRadius,
    height: layerHeight,
    toppings,
    topper,
    edgeIcing,
    middleBandIcing,
    bottomIcing
  } = layerConfig;
  const topY = layerHeight / 2;
  const middleY = 0;
  const bottomY = -layerHeight / 2;

  // Remove existing decorations
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
  const existingTopper = layerMesh.getObjectByName("topperGroup");
  if (existingTopper) {
    existingTopper.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingTopper);
  }

  // Add topper if enabled
  if (topper && topper.enabled) {
    const topperGroup = new THREE.Group();
    topperGroup.name = "topperGroup";

    // Calculate topper position
    let topperY = topY;
    if (topper.position === 'top') {
      topperY += 0.1; // Slightly above the layer
    } else if (topper.position === 'bottom') {
      topperY = bottomY - 0.1; // Slightly below the layer
    }

    // --- DYNAMIC STICK LOGIC ---
    // Default values
    let stickTopY = topperY + 0.28; // Default for text
    let stickHeight = 0.4;
    let contentYOffset = 0.28;
    let imageYOffset = 0.2;
    let textYOffset = 0.28;
    let stickBaseY = topY; // Always start at cake top
    const imageHeight = 0.5; // Should match the image geometry height

    // If image or text_image, adjust
    if (topper.type === 'image') {
      // Place stick top at bottom of image
      stickTopY = topperY + imageYOffset - (imageHeight / 2);
      stickHeight = stickTopY - stickBaseY;
    } else if (topper.type === 'text_image') {
      // Text is on top, image is below text
      // Place stick top at bottom of image (image is at topperY + 0.13, so bottom is 0.13 - 0.25)
      stickTopY = topperY + 0.13 - (imageHeight / 2);
      stickHeight = stickTopY - stickBaseY;
    } else if (topper.type === 'text') {
      stickTopY = topperY + textYOffset;
      stickHeight = stickTopY - stickBaseY;
    }
    if (stickHeight < 0.1) stickHeight = 0.1;

    // Add stick/support for the topper
    const stickGeometry = new THREE.CylinderGeometry(0.02, 0.02, stickHeight, 8);
    const stickMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    stick.position.set(0, stickBaseY + stickHeight / 2, 0); // Stick from cake top up to content
    topperGroup.add(stick);

    // Add a small base for the stick
    const baseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, stickBaseY - 0.01, 0); // Position the base at the bottom of the stick
    topperGroup.add(base);

    // Only create topper text if font is loaded
    if ((topper.type === 'text' || topper.type === 'text_image')) {
      if (!loadedFont) {
        console.warn('Font not loaded yet, skipping topper text creation');
        return;
      }
      if (topper.text && topper.text.trim().length > 0) {
        const topperText = topper.text.trim();
        const sizeMultiplier = topper.size || 1;
        const textGeometry = new TextGeometry(topperText, {
          font: loadedFont,
          size: 0.12 * topper.fontSize * sizeMultiplier,
          height: 0.02 * sizeMultiplier,
          curveSegments: 4,
          bevelEnabled: false
        });
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0); // Center horizontally
        const textMaterial = new THREE.MeshStandardMaterial({
          color: topper.color,
          roughness: 0.7,
          metalness: 0.1
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, topperY + textYOffset, 0); // Position above the cake
        topperGroup.add(textMesh);
        // If it's text with image, add the image below the text
        if (topper.type === 'text_image' && topper.image) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(topper.image, (texture) => {
            const sizeMultiplier = topper.size || 1;
            const imageGeometry = new THREE.PlaneGeometry(0.5 * sizeMultiplier, 0.5 * sizeMultiplier);
            const imageMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide
            });
            const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
            imageMesh.position.set(0, topperY + 0.13, 0);
            topperGroup.add(imageMesh);
          });
        }
      }
    } else if (topper.type === 'image' && topper.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(topper.image, (texture) => {
        const sizeMultiplier = topper.size || 1;
        const imageGeometry = new THREE.PlaneGeometry(0.5 * sizeMultiplier, 0.5 * sizeMultiplier);
        const imageMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide
        });
        const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
        imageMesh.position.set(0, topperY + imageYOffset, 0);
        topperGroup.add(imageMesh);
      });
    }

    // Add a small connector between stick and content
    const connectorGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.position.set(0, stickTopY, 0); // Position connector at the top of the stick
    topperGroup.add(connector);

    layerMesh.add(topperGroup);
  }

  // Add existing decorations
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
      // Calculate number of curls based on circumference with overlap
      const circumference = Math.PI * 2 * (layerRadius - curlR);
      // Increase number of curls to ensure no gaps
      const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      // Create a group for all curls
      const curlGroup = new THREE.Group();
      
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        
        // Add variation to curl size (smaller range to maintain consistency)
        const sizeVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const curlSize = curlR * sizeVariation;
        
        // Create the main curl
        const curlGeo = new THREE.SphereGeometry(curlSize, 12, 8);
        const curl = new THREE.Mesh(curlGeo, icingMaterial);
        
        // Position with minimal randomness to maintain continuity
        const radiusVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const heightVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const angleVariation = (Math.random() - 0.5) * 0.1; // -0.05 to 0.05
        
        // Calculate position with minimal variations
        const curlRadius = layerRadius - curlSize * 0.7 + radiusVariation;
        const curlX = Math.cos(ang + angleVariation) * curlRadius;
        const curlZ = Math.sin(ang + angleVariation) * curlRadius;
        const curlY = topY + curlSize * 0.3 + heightVariation;
        
        curl.position.set(curlX, curlY, curlZ);
        
        // Add minimal tilt to maintain continuity
        curl.rotation.x = (Math.random() - 0.5) * 0.2;
        curl.rotation.z = (Math.random() - 0.5) * 0.2;
        
        // Add a connecting "tail" to make it look more continuous
        const tailGeo = new THREE.ConeGeometry(curlSize * 0.6, curlSize * 1.2, 8);
        const tail = new THREE.Mesh(tailGeo, icingMaterial);
        tail.position.y = -curlSize * 0.6;
        tail.rotation.x = Math.PI / 2;
        curl.add(tail);
        
        curlGroup.add(curl);
      }
      
      icingGroup.add(curlGroup);
    } else if (edgeIcing.style === 'shell') {
      const shellR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        
        // Create shell shape using multiple spheres
        const shellGroup = new THREE.Group();
        
        // Main shell body
        const mainShell = new THREE.Mesh(
          new THREE.SphereGeometry(shellR, 12, 8),
          icingMaterial
        );
        
        // Shell tail
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(shellR * 0.6, shellR * 1.5, 8),
          icingMaterial
        );
        tail.position.y = -shellR * 0.75;
        tail.rotation.x = Math.PI / 2;
        
        shellGroup.add(mainShell);
        shellGroup.add(tail);
        
        // Position and rotate
        const shellRadius = layerRadius - shellR * 0.7;
        shellGroup.position.set(
          Math.cos(ang) * shellRadius,
          topY + shellR * 0.3,
          Math.sin(ang) * shellRadius
        );
        shellGroup.rotation.y = -ang;
        
        icingGroup.add(shellGroup);
      }
    } else if (edgeIcing.style === 'rosette') {
      const rosetteR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        
        // Create rosette using multiple petals
        const rosetteGroup = new THREE.Group();
        const numPetals = 5;
        
        for (let j = 0; j < numPetals; j++) {
          const petalAng = (j / numPetals) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(rosetteR * 0.6, 8, 8),
            icingMaterial
          );
          
          petal.position.set(
            Math.cos(petalAng) * rosetteR * 0.5,
            Math.sin(petalAng) * rosetteR * 0.5,
            0
          );
          rosetteGroup.add(petal);
        }
        
        // Center of rosette
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(rosetteR * 0.4, 8, 8),
          icingMaterial
        );
        rosetteGroup.add(center);
        
        // Position and rotate
        const rosetteRadius = layerRadius - rosetteR;
        rosetteGroup.position.set(
          Math.cos(ang) * rosetteRadius,
          topY + rosetteR * 0.5,
          Math.sin(ang) * rosetteRadius
        );
        rosetteGroup.rotation.y = -ang;
        
        icingGroup.add(rosetteGroup);
      }
    } else if (edgeIcing.style === 'ruffle') {
      const ruffleR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        
        // Create ruffle segment
        const ruffleGroup = new THREE.Group();
        
        // Main ruffle part
        const ruffle = new THREE.Mesh(
          new THREE.SphereGeometry(ruffleR, 12, 8),
          icingMaterial
        );
        
        // Ruffle wave
        const wave = new THREE.Mesh(
          new THREE.TorusGeometry(ruffleR * 0.8, ruffleR * 0.3, 8, 16, Math.PI),
          icingMaterial
        );
        wave.rotation.x = Math.PI / 2;
        wave.position.y = -ruffleR * 0.5;
        
        ruffleGroup.add(ruffle);
        ruffleGroup.add(wave);
        
        // Position and rotate
        const ruffleRadius = layerRadius - ruffleR * 0.7;
        ruffleGroup.position.set(
          Math.cos(ang) * ruffleRadius,
          topY + ruffleR * 0.3,
          Math.sin(ang) * ruffleRadius
        );
        ruffleGroup.rotation.y = -ang;
        
        icingGroup.add(ruffleGroup);
      }
    } else if (edgeIcing.style === 'zigzag') {
      const zigzagR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        
        // Create zigzag segment
        const zigzagGroup = new THREE.Group();
        
        // Main point
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          icingMaterial
        );
        point.rotation.x = Math.PI / 2;
        
        // Base
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          icingMaterial
        );
        base.position.y = -zigzagR * 0.9;
        
        zigzagGroup.add(point);
        zigzagGroup.add(base);
        
        // Position and rotate
        const zigzagRadius = layerRadius - zigzagR * 0.7;
        zigzagGroup.position.set(
          Math.cos(ang) * zigzagRadius,
          topY + zigzagR * 0.3,
          Math.sin(ang) * zigzagRadius
        );
        zigzagGroup.rotation.y = -ang;
        
        icingGroup.add(zigzagGroup);
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

  if (bottomIcing.enabled) {
    const bottomIcingGroup = new THREE.Group();
    bottomIcingGroup.name = "bottomIcingGroup";
    const bottomIcingMaterial = new THREE.MeshStandardMaterial({
      color: bottomIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    if (bottomIcing.style === 'smooth') {
      let angle = bottomIcing.isAnimating ? bottomIcing.animationProgress * Math.PI * 2 : Math.PI * 2;
      angle = Math.max(0.001, angle);
      const tube = bottomIcing.thickness;
      const radius = layerRadius - tube;
      if (radius > 0) {
        const geo = new THREE.TorusGeometry(radius, tube, 24, 64, angle);
        const mesh = new THREE.Mesh(geo, bottomIcingMaterial);
        mesh.position.y = bottomY;
        mesh.rotation.x = Math.PI / 2;
        bottomIcingGroup.add(mesh);
      }
    } else if (bottomIcing.style === 'curl') {
      const curlR = bottomIcing.thickness * 0.8;
      const numTotal = Math.max(1, Math.floor((Math.PI * 2 * (layerRadius - curlR)) / (curlR * 2.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const geo = new THREE.SphereGeometry(curlR, 12, 8);
        const mesh = new THREE.Mesh(geo, bottomIcingMaterial);
        mesh.position.set(Math.cos(ang) * (layerRadius - curlR * 0.7), bottomY - curlR * 0.3, Math.sin(ang) * (layerRadius - curlR * 0.7));
        bottomIcingGroup.add(mesh);
      }
    } else if (bottomIcing.style === 'shell') {
      const shellR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const shellGroup = new THREE.Group();
        const mainShell = new THREE.Mesh(
          new THREE.SphereGeometry(shellR, 12, 8),
          bottomIcingMaterial
        );
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(shellR * 0.6, shellR * 1.5, 8),
          bottomIcingMaterial
        );
        tail.position.y = -shellR * 0.75;
        tail.rotation.x = Math.PI / 2;
        shellGroup.add(mainShell);
        shellGroup.add(tail);
        const shellRadius = layerRadius - shellR * 0.7;
        shellGroup.position.set(
          Math.cos(ang) * shellRadius,
          bottomY - shellR * 0.3,
          Math.sin(ang) * shellRadius
        );
        shellGroup.rotation.y = -ang;
        bottomIcingGroup.add(shellGroup);
      }
    } else if (bottomIcing.style === 'rosette') {
      const rosetteR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const rosetteGroup = new THREE.Group();
        const numPetals = 5;
        for (let j = 0; j < numPetals; j++) {
          const petalAng = (j / numPetals) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(rosetteR * 0.6, 8, 8),
            bottomIcingMaterial
          );
          petal.position.set(
            Math.cos(petalAng) * rosetteR * 0.5,
            Math.sin(petalAng) * rosetteR * 0.5,
            0
          );
          rosetteGroup.add(petal);
        }
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(rosetteR * 0.4, 8, 8),
          bottomIcingMaterial
        );
        rosetteGroup.add(center);
        const rosetteRadius = layerRadius - rosetteR;
        rosetteGroup.position.set(
          Math.cos(ang) * rosetteRadius,
          bottomY - rosetteR * 0.5,
          Math.sin(ang) * rosetteRadius
        );
        rosetteGroup.rotation.y = -ang;
        bottomIcingGroup.add(rosetteGroup);
      }
    } else if (bottomIcing.style === 'ruffle') {
      const ruffleR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const ruffleGroup = new THREE.Group();
        const ruffle = new THREE.Mesh(
          new THREE.SphereGeometry(ruffleR, 12, 8),
          bottomIcingMaterial
        );
        const wave = new THREE.Mesh(
          new THREE.TorusGeometry(ruffleR * 0.8, ruffleR * 0.3, 8, 16, Math.PI),
          bottomIcingMaterial
        );
        wave.rotation.x = Math.PI / 2;
        wave.position.y = -ruffleR * 0.5;
        ruffleGroup.add(ruffle);
        ruffleGroup.add(wave);
        const ruffleRadius = layerRadius - ruffleR * 0.7;
        ruffleGroup.position.set(
          Math.cos(ang) * ruffleRadius,
          bottomY - ruffleR * 0.3,
          Math.sin(ang) * ruffleRadius
        );
        ruffleGroup.rotation.y = -ang;
        bottomIcingGroup.add(ruffleGroup);
      }
    } else if (bottomIcing.style === 'zigzag') {
      const zigzagR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const zigzagGroup = new THREE.Group();
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          bottomIcingMaterial
        );
        point.rotation.x = Math.PI / 2;
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          bottomIcingMaterial
        );
        base.position.y = -zigzagR * 0.9;
        zigzagGroup.add(point);
        zigzagGroup.add(base);
        const zigzagRadius = layerRadius - zigzagR * 0.7;
        zigzagGroup.position.set(
          Math.cos(ang) * zigzagRadius,
          bottomY - zigzagR * 0.3,
          Math.sin(ang) * zigzagRadius
        );
        zigzagGroup.rotation.y = -ang;
        bottomIcingGroup.add(zigzagGroup);
      }
    }
    if (bottomIcingGroup.children.length > 0) layerMesh.add(bottomIcingGroup);
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

// Greeting config and group
const greetingConfig = reactive({
  enabled: true,
  text: 'Happy B-Day!',
  color: '#333333',
  size: 0.25,
  depth: 0.05,
  layout: 'horizontal-top'
});

function onGreetingChange() {
  renderCake();
}

const addGreetingTextToCake = (currentHeightOffset, topLayerRadius, topLayerHeight) => {
  // Remove existing greeting text if any
  const existingGreeting = cakeGroup.getObjectByName("greetingGroup");
  if (existingGreeting) {
    existingGreeting.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    cakeGroup.remove(existingGreeting);
  }

  if (!greetingConfig.enabled || !greetingConfig.text || !loadedFont) {
    return;
  }

  const greetingGroup = new THREE.Group();
  greetingGroup.name = "greetingGroup";

  const textGeometry = new TextGeometry(greetingConfig.text, {
    font: loadedFont,
    size: greetingConfig.size,
    height: greetingConfig.depth,
    curveSegments: 12,
    bevelEnabled: false
  });

  textGeometry.computeBoundingBox();
  const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

  const textMaterial = new THREE.MeshStandardMaterial({
    color: greetingConfig.color,
    roughness: 0.7,
    metalness: 0.1
  });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text based on layout
  switch (greetingConfig.layout) {
    case 'horizontal-top':
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.position.set(
        -textWidth / 2,
        currentHeightOffset + 0.01, // Just above the cake's top
        0
      );
      break;
    case 'circular-top':
      textMesh.position.set(0, currentHeightOffset + topLayerHeight / 2 + 0.1, 0);
      textMesh.rotation.x = -Math.PI / 2;
      // Create a circular path for the text
      const radius = topLayerRadius * 0.8;
      const textPath = new THREE.CurvePath();
      const circle = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      textPath.add(circle);
      // Apply the path to the text
      textMesh.geometry = new THREE.TextGeometry(greetingConfig.text, {
        font: loadedFont,
        size: greetingConfig.size,
        height: greetingConfig.depth,
        curveSegments: 12,
        bevelEnabled: false,
        path: textPath
      });
      break;
    case 'vertical-side':
      textMesh.position.set(topLayerRadius + 0.1, currentHeightOffset - topLayerHeight / 2, 0);
      textMesh.rotation.y = Math.PI / 2;
      break;
  }

  greetingGroup.add(textMesh);
  cakeGroup.add(greetingGroup);
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

  // Make the cake sit almost directly on the stand
  let currentHeightOffset = cakeStand.userData.totalHeight - 0.01;
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
  // Add greeting text after layers
  addGreetingTextToCake(currentHeightOffset, topLayerRadius, topLayerHeight);
  renderer.render(scene, camera);
};

const addNewLayerAndSelect = () => {
  saveToHistory(); // Save state before making changes
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
  saveToHistory(); // Save state before making changes
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
    saveToHistory(); // Save state before making changes
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

  // Get the layer index and selected size
  const layerIndex = cakeLayers.findIndex(l => l.id === layerConfig.id);
  const selectedSizeObj = selectedSize.value ? sizeOptions.find(size => size.name === selectedSize.value.name) : null;
  
  // Calculate initial dimensions
  const baseRadius = selectedSizeObj ? (selectedSizeObj.diameter / 2) : 3;
  const layerHeightMax = selectedSizeObj ? selectedSizeObj.height : 6;

  layerControlsDiv.innerHTML = `
    <p class="layer-header">Layer ${layerIndex + 1}</p>
    <div class="layer-dimensions">
      <p>Initial Size: ${selectedSizeObj ? `${selectedSizeObj.diameter} in (diameter) × ${selectedSizeObj.height} in (height)` : 'Not selected'}</p>
    </div>
    <div><label for="color_${layerConfig.id}">Layer Color:</label><input type="color" id="color_${layerConfig.id}" value="${layerConfig.color}"></div>
    <div class="mt-2"><label for="radius_${layerConfig.id}">Layer Radius (${layerConfig.radius.toFixed(1)}):</label><input type="range" id="radius_${layerConfig.id}" min="0.5" max="${baseRadius}" step="0.1" value="${layerConfig.radius}"></div>
    <div class="mt-2"><label for="height_${layerConfig.id}">Layer Height (${layerConfig.height.toFixed(1)}):</label><input type="range" id="height_${layerConfig.id}" min="1" max="${layerHeightMax}" step="0.1" value="${layerConfig.height}"></div>

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

    <div class="topper-section mt-3 pt-3 border-t border-gray-200">
      <label class="checkbox-label"><input type="checkbox" id="topper_enabled_${layerConfig.id}" ${layerConfig.topper.enabled ? 'checked' : ''}>Enable Printed Topper</label>
      <div id="topper_sub_controls_${layerConfig.id}" class="sub-controls mt-2 ${layerConfig.topper.enabled ? '' : 'hidden'}">
        <div class="mt-2">
          <label for="topper_type_${layerConfig.id}">Topper Type:</label>
          <select id="topper_type_${layerConfig.id}">
            <option value="none" ${layerConfig.topper.type === 'none' ? 'selected' : ''}>Select Type</option>
            <option value="text" ${layerConfig.topper.type === 'text' ? 'selected' : ''}>Text Only</option>
            <option value="image" ${layerConfig.topper.type === 'image' ? 'selected' : ''}>Image</option>
            <option value="text_image" ${layerConfig.topper.type === 'text_image' ? 'selected' : ''}>Text with Image</option>
          </select>
        </div>
        
        <div class="mt-2" id="topper_text_controls_${layerConfig.id}" style="display: ${layerConfig.topper.type === 'text' || layerConfig.topper.type === 'text_image' ? 'block' : 'none'}">
          <label for="topper_text_${layerConfig.id}">Text:</label>
          <input type="text" id="topper_text_${layerConfig.id}" value="${layerConfig.topper.text}" placeholder="Enter text for topper">
          
          <div class="mt-2">
            <label for="topper_font_size_${layerConfig.id}">Font Size:</label>
            <select id="topper_font_size_${layerConfig.id}">
              <option value="0.8" ${layerConfig.topper.fontSize === 0.8 ? 'selected' : ''}>Small</option>
              <option value="1" ${layerConfig.topper.fontSize === 1 ? 'selected' : ''}>Medium</option>
              <option value="1.2" ${layerConfig.topper.fontSize === 1.2 ? 'selected' : ''}>Large</option>
            </select>
          </div>
          
          <div class="mt-2">
            <label for="topper_font_style_${layerConfig.id}">Font Style:</label>
            <select id="topper_font_style_${layerConfig.id}">
              <option value="normal" ${layerConfig.topper.style === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="bold" ${layerConfig.topper.style === 'bold' ? 'selected' : ''}>Bold</option>
              <option value="italic" ${layerConfig.topper.style === 'italic' ? 'selected' : ''}>Italic</option>
            </select>
          </div>
          
          <div class="mt-2">
            <label for="topper_text_color_${layerConfig.id}">Text Color:</label>
            <input type="color" id="topper_text_color_${layerConfig.id}" value="${layerConfig.topper.color}">
          </div>
        </div>
        
        <div class="mt-2" id="topper_image_controls_${layerConfig.id}" style="display: ${layerConfig.topper.type === 'image' || layerConfig.topper.type === 'text_image' ? 'block' : 'none'}">
          <label for="topper_image_${layerConfig.id}">Upload Image:</label>
          <input type="file" id="topper_image_${layerConfig.id}" accept="image/*">
        </div>
        
        <div class="mt-2">
          <label for="topper_position_${layerConfig.id}">Position:</label>
          <select id="topper_position_${layerConfig.id}">
            <option value="center" ${layerConfig.topper.position === 'center' ? 'selected' : ''}>Center</option>
            <option value="top" ${layerConfig.topper.position === 'top' ? 'selected' : ''}>Top</option>
            <option value="bottom" ${layerConfig.topper.position === 'bottom' ? 'selected' : ''}>Bottom</option>
          </select>
        </div>
        <div class="mt-2">
          <label for="topper_size_${layerConfig.id}">Topper Size (${layerConfig.topper.size || 1}):</label>
          <input type="range" id="topper_size_${layerConfig.id}" min="0.5" max="2" step="0.01" value="${layerConfig.topper.size || 1}">
        </div>
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
            <option value="shell" ${edgeIcingConfig.style === 'shell' ? 'selected' : ''}>Shell Pattern</option>
            <option value="rosette" ${edgeIcingConfig.style === 'rosette' ? 'selected' : ''}>Rosette Pattern</option>
            <option value="ruffle" ${edgeIcingConfig.style === 'ruffle' ? 'selected' : ''}>Ruffle Pattern</option>
            <option value="zigzag" ${edgeIcingConfig.style === 'zigzag' ? 'selected' : ''}>Zigzag Pattern</option>
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

    <div class="icing-section mt-3 pt-3 border-t border-gray-200">
      <label class="checkbox-label"><input type="checkbox" id="bottomIcing_enabled_${layerConfig.id}" ${layerConfig.bottomIcing.enabled ? 'checked' : ''}>Enable Bottom Icing</label>
      <div id="bottomIcing_sub_controls_${layerConfig.id}" class="sub-controls mt-2 ${layerConfig.bottomIcing.enabled ? '' : 'hidden'}">
        <div class="mt-1">
          <label for="bottomIcing_style_${layerConfig.id}">Bottom Style:</label>
          <select id="bottomIcing_style_${layerConfig.id}">
            <option value="smooth" ${layerConfig.bottomIcing.style === 'smooth' ? 'selected' : ''}>Smooth Ring</option>
            <option value="curl" ${layerConfig.bottomIcing.style === 'curl' ? 'selected' : ''}>Curl Pattern</option>
            <option value="shell" ${layerConfig.bottomIcing.style === 'shell' ? 'selected' : ''}>Shell Pattern</option>
            <option value="rosette" ${layerConfig.bottomIcing.style === 'rosette' ? 'selected' : ''}>Rosette Pattern</option>
            <option value="ruffle" ${layerConfig.bottomIcing.style === 'ruffle' ? 'selected' : ''}>Ruffle Pattern</option>
            <option value="zigzag" ${layerConfig.bottomIcing.style === 'zigzag' ? 'selected' : ''}>Zigzag Pattern</option>
          </select>
        </div>
        <div class="mt-2"><label for="bottomIcing_color_${layerConfig.id}">Bottom Color:</label><input type="color" id="bottomIcing_color_${layerConfig.id}" value="${layerConfig.bottomIcing.color}"></div>
        <div class="mt-2"><label for="bottomIcing_thickness_${layerConfig.id}">Bottom Detail/Thickness (${layerConfig.bottomIcing.thickness.toFixed(2)}):</label><input type="range" id="bottomIcing_thickness_${layerConfig.id}" min="0.02" max="0.3" step="0.01" value="${layerConfig.bottomIcing.thickness}"></div>
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

  const bottomIcingEnabledCheckbox = document.getElementById(`bottomIcing_enabled_${layerConfig.id}`);
  const bottomIcingSubControlsDiv = document.getElementById(`bottomIcing_sub_controls_${layerConfig.id}`);
  bottomIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.enabled', e.target.checked);
    bottomIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById(`bottomIcing_style_${layerConfig.id}`).addEventListener('change', (e) => updateLayerProperty(layerConfig.id, 'bottomIcing.style', e.target.value));
  document.getElementById(`bottomIcing_color_${layerConfig.id}`).addEventListener('input', (e) => updateLayerProperty(layerConfig.id, 'bottomIcing.color', e.target.value));
  const bottomIcingThicknessInput = document.getElementById(`bottomIcing_thickness_${layerConfig.id}`);
  const bottomIcingThicknessLabel = layerControlsDiv.querySelector(`label[for='bottomIcing_thickness_${layerConfig.id}']`);
  bottomIcingThicknessInput.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.thickness', e.target.value);
    bottomIcingThicknessLabel.textContent = `Bottom Detail/Thickness (${parseFloat(e.target.value).toFixed(2)}):`;
  });

  const topperEnabledCheckbox = document.getElementById(`topper_enabled_${layerConfig.id}`);
  const topperSubControlsDiv = document.getElementById(`topper_sub_controls_${layerConfig.id}`);
  topperEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.enabled', e.target.checked);
    topperSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  const topperTypeSelect = document.getElementById(`topper_type_${layerConfig.id}`);
  const topperTextControls = document.getElementById(`topper_text_controls_${layerConfig.id}`);
  const topperImageControls = document.getElementById(`topper_image_controls_${layerConfig.id}`);
  
  topperTypeSelect.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.type', e.target.value);
    topperTextControls.style.display = (e.target.value === 'text' || e.target.value === 'text_image') ? 'block' : 'none';
    topperImageControls.style.display = (e.target.value === 'image' || e.target.value === 'text_image') ? 'block' : 'none';
  });

  document.getElementById(`topper_text_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.text', e.target.value);
  });

  document.getElementById(`topper_font_size_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.fontSize', parseFloat(e.target.value));
  });

  document.getElementById(`topper_font_style_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.style', e.target.value);
  });

  document.getElementById(`topper_text_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.color', e.target.value);
  });

  document.getElementById(`topper_position_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.position', e.target.value);
  });

  document.getElementById(`topper_image_${layerConfig.id}`).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateLayerProperty(layerConfig.id, 'topper.image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById(`topper_size_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.size', parseFloat(e.target.value));
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
          mergedLayer.bottomIcing = {
            ...(defaultStructure.bottomIcing || {}),
            ...(loadedLayer.bottomIcing || {})
          };
          mergedLayer.toppings = loadedLayer.toppings || [];
          ['edgeIcing', 'middleBandIcing', 'bottomIcing'].forEach(icingType => {
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

  saveToHistory(); // Save state before making changes
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

// Update selectSize to set the whole object
const selectSize = (size) => {
  selectedSize.value = size ? { ...size } : null;
};

const nextStep = () => {
  if (currentStep.value < 2) {
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
  if (!selectedSize.value || !selectedLayers.value) {
    console.log('Size or layers not selected yet');
    return;
  }

  // Clear existing layers
  cakeLayers = [];
  layerIdCounter = 0;

  // Calculate base dimensions based on size
  let baseRadius;
  const selectedSizeObj = sizeOptions.find(size => size.name === selectedSize.value.name);

  if (!selectedSizeObj) {
    console.error('Selected size not found in sizeOptions');
    return;
  }

  // 1 unit = 1 inch
  baseRadius = selectedSizeObj.diameter / 2;

  // Calculate total height and layer height
  const totalHeightInches = selectedSizeObj.height;
  let layerHeightInches = totalHeightInches / selectedLayers.value;
  const minLayerHeight = 1;
  if (layerHeightInches < minLayerHeight) layerHeightInches = minLayerHeight;
  // Reduce the default height by half for better display
  const layerHeight = layerHeightInches * 0.5;

  // Log actual values for debugging
  console.log('Cake diameter:', selectedSizeObj.diameter, 'Cake height:', totalHeightInches, 'Layer height:', layerHeight, 'Layers:', selectedLayers.value);

  // Generate layers based on selection
  for (let i = 0; i < selectedLayers.value; i++) {
    layerIdCounter++;
    const newLayerId = `layer_${layerIdCounter}`;
    const newLayer = {
      id: newLayerId,
      ...JSON.parse(JSON.stringify(defaultLayerSettings))
    };

    // All layers have the same radius (diameter)
    newLayer.radius = baseRadius;
    // Each layer gets equal height
    newLayer.height = layerHeight;

    // Adjust color based on layer number
    const hue = (i * 30) % 360;
    newLayer.color = `hsl(${hue}, 70%, 80%)`;

    cakeLayers.push(newLayer);
  }

  // Adjust camera position based on cake size - bring it closer
  const cameraDistance = Math.max(selectedSizeObj.diameter, selectedSizeObj.height) * 3;
  camera.position.set(cameraDistance, cameraDistance * 0.5, cameraDistance);
  camera.lookAt(0, 0, 0);

  // Render the cake
  renderCake();
};

// Add this CSS to style the layer dimensions display
const style = document.createElement('style');
style.textContent = `
  .layer-dimensions {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
  }
  .layer-dimensions p {
    margin: 5px 0;
    color: #666;
    font-size: 0.9rem;
  }
`;
document.head.appendChild(style);

// Make greetingConfig reactive for UI binding
// const greetingConfig = reactive({
//   enabled: true,
//   text: 'Happy B-Day!',
//   color: '#333333',
//   size: 0.25,
//   depth: 0.05,
//   layout: 'horizontal-top'
// });

// Remove duplicate function declaration
// function onGreetingChange() {
//   renderCake();
// }

// Add watcher to update cake when size changes after modal is closed
watch(selectedSize, (newVal, oldVal) => {
  if (!showSelectionsModal.value) {
    generateCakeFromSelections();
  }
});

// Add watcher for selectedLayers to regenerate cake after modal is closed
watch(selectedLayers, (newVal, oldVal) => {
  if (!showSelectionsModal.value) {
    generateCakeFromSelections();
  }
});
</script>

<style scoped>
.customize-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
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

/* Updated Modal Styles */
.selections-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding-top: 56px;
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  max-width: 100%;
  margin: 0;
  box-shadow: none;
  background: #ffffff;
  overflow-y: auto;
}

/* Progress Bar Styles */
.progress-container {
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.progress-step.active .step-number {
  background: #007bff;
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 1rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0 2rem;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Step Content Styles */
.step-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.selection-step {
  padding: 0 1rem;
}

.selection-step h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  font-weight: 700;
}

.step-description {
  text-align: center;
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.option-button {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.option-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.layer-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.preview-layer {
  width: 60px;
  height: 20px;
  background: #ffb6c1;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.option-button:hover .preview-layer {
  transform: scale(1.05);
}

.option-button.selected .preview-layer {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.option-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-top: 0.5rem;
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 0 0.5rem;
  }

  .option-button {
    padding: 1rem;
    min-height: 200px;
  }

  .option-icon {
    width: 80px;
    height: 80px;
  }

  .preview-layer {
    width: 50px;
    height: 16px;
  }

  .option-label {
    font-size: 1rem;
  }
}

/* Small Mobile Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .option-button {
    padding: 0.75rem;
    min-height: 180px;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .preview-layer {
    width: 40px;
    height: 14px;
  }

  .option-label {
    font-size: 0.9rem;
  }
}

/* Navigation Buttons */
.modal-navigation {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.nav-button {
  padding: 1.25rem 2.5rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.nav-button.back {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
}

.nav-button.next {
  background: #007bff;
  color: white;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.nav-button.finish {
  background: #28a745;
  color: white;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.nav-button:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.nav-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon, .next-icon, .finish-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Mobile Responsive Adjustments for Navigation */
@media (max-width: 768px) {
  .modal-navigation {
    padding: 1.5rem;
  }

  .nav-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    min-width: 160px;
  }

  .back-icon, .next-icon, .finish-icon {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .modal-navigation {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-button {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    min-width: unset;
  }

  .nav-button.next,
  .nav-button.finish {
    margin-left: 0;
  }
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .option-button {
    padding: 0.75rem;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .nav-button {
    padding: 0.75rem 1rem;
  }
}

ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.customize-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
  padding-left: 32px;
}

.topper-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.topper-section select,
.topper-section input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.topper-section input[type="file"] {
  width: 100%;
  margin-top: 5px;
}

.topper-section .sub-controls {
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  margin-top: 10px;
}

/* Updated Size Selection Styles */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.option-button {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.option-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  position: relative;
}

.size-preview {
  width: 100%;
  height: 100%;
  background: #ffb6c1;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-preview::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px dashed #fff;
  border-radius: 50%;
}

.option-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.size-details {
  width: 100%;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 0.25rem;
}

.size-details div {
  text-align: center;
  margin: 0.15rem 0;
  color: #666;
  font-size: 0.8rem;
}

.size-details .price {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.option-button:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.option-button.selected {
  border-color: #007bff;
  background: #e6f0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile Responsive Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0 0.25rem;
  }

  .option-button {
    padding: 0.5rem;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .option-label {
    font-size: 0.9rem;
  }

  .size-details {
    padding: 0.35rem;
  }

  .size-details div {
    font-size: 0.75rem;
    margin: 0.1rem 0;
  }

  .size-details .price {
    font-size: 0.85rem;
  }

  .modal-content {
    padding: 0.5rem;
  }

  .selection-step {
    padding: 0;
  }

  .selection-step h2 {
    font-size: 1.1rem;
  }

  .step-description {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
}

/* Tablet and Desktop Adjustments */
@media (min-width: 481px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 0 1rem;
  }

  .option-button {
    padding: 1rem;
  }

  .option-icon {
    width: 80px;
    height: 80px;
  }

  .option-label {
    font-size: 1.1rem;
  }

  .size-details {
    padding: 0.75rem;
  }

  .size-details div {
    font-size: 0.9rem;
  }

  .size-details .price {
    font-size: 1rem;
  }
}

/* Progress Bar Mobile Adjustments */
@media (max-width: 480px) {
  .progress-steps {
    padding: 0 0.25rem;
  }

  .step-number {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .progress-bar {
    margin: 0 0.25rem;
  }
}

.greeting-control-group {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}
.greeting-control-group label {
  font-weight: 500;
}
.greeting-control-group .sub-controls {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #eee;
}
</style> 