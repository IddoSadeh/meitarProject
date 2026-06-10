import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const localeTime = document.querySelector("#locale-time");
const revealTexts = document.querySelectorAll("[data-scroll-reveal]");
const letterDropTexts = document.querySelectorAll("[data-letter-drop]");
const modelPartConfigs = [
  {
    key: "interface",
    path: "3d_Models/GLTF/METAL_RING.glb",
    assembledPosition: [-1.2, 0.8, 0.2],
    position: [-4.35, 2.05, 0],
    compactPosition: [-1.45, 1.05, 0],
    compactAssembledPosition: [-0.25, 0.25, 0.2],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 1.66,
    compactSize: 0.92,
  },
  {
    key: "engine",
    path: "3d_Models/GLTF/CHIP.glb",
    assembledPosition: [-1.2, 0.8, 0],
    position: [-1.2, 0.8, 0],
    compactPosition: [-0.25, 0.25, 0],
    compactAssembledPosition: [-0.25, 0.25, 0],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 1.45,
    compactSize: 0.82,
  },
  {
    key: "outer",
    path: "3d_Models/GLTF/GLASS.glb",
    assembledPosition: [-1.2, 0.8, -0.2],
    position: [3.0, -0.55, 0],
    compactPosition: [1.2, -0.45, 0],
    compactAssembledPosition: [-0.25, 0.25, -0.2],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 4.25,
    compactSize: 2.3,
  },
];
const sourceMaterialProfiles = {
  interface: {
    color: 0xd9d7d1,
    roughness: 0.22,
    metalness: 1,
    envMapIntensity: 1.35,
    opacity: 1,
  },
  outer: {
    color: 0xe6f0f2,
    roughness: 0.08,
    metalness: 0,
    specularIntensity: 1,
    envMapIntensity: 1.65,
    opacity: 0.28,
    transmission: 0.6,
    thickness: 0.35,
    ior: 1.45,
    transparent: true,
  },
};

function getRegionCode() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = locale.match(/-([A-Za-z]{2})\b/);

  return (region?.[1] || "US").toUpperCase();
}

function updateLocaleTime() {
  if (!localeTime) return;

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  localeTime.textContent = `${getRegionCode()}_${time}`;
}

updateLocaleTime();
window.setInterval(updateLocaleTime, 1000);

function setupRevealText(element) {
  const text = element.dataset.revealText || element.textContent.trim();
  const fragment = document.createDocumentFragment();
  const indent = document.createElement("span");

  indent.className = "reveal__indent";

  element.textContent = "";
  fragment.appendChild(indent);

  for (const character of text) {
    if (character === "\n") {
      fragment.appendChild(document.createElement("br"));
      continue;
    }

    if (character === " ") {
      fragment.appendChild(document.createTextNode(" "));
      continue;
    }

    const span = document.createElement("span");
    span.className = "reveal__char";
    span.textContent = character;
    fragment.appendChild(span);
  }

  element.appendChild(fragment);
}

function updateRevealText() {
  for (const element of revealTexts) {
    const chars = element.querySelectorAll(".reveal__char");
    const rect = element.closest(".reveal").getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.min(
      Math.max((viewportHeight * 0.72 - rect.top) / (rect.height - viewportHeight * 0.28), 0),
      1,
    );
    const activeCount = Math.round(chars.length * progress);

    chars.forEach((char, index) => {
      char.classList.toggle("is-active", index < activeCount);
    });
  }
}

function setupLetterDrop(element) {
  const text = element.textContent.trim();
  const fragment = document.createDocumentFragment();
  let index = 0;

  element.setAttribute("aria-label", text);
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "letter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "letter-drop";
    span.style.setProperty("--letter-index", index);
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
  }

  element.appendChild(fragment);
}

for (const element of revealTexts) {
  setupRevealText(element);
}

updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);

for (const element of letterDropTexts) {
  setupLetterDrop(element);
}

if (letterDropTexts.length > 0) {
  const letterDropObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-letter-drop-active", entry.isIntersecting);
      }
    },
    { threshold: 0.55 },
  );

  for (const element of letterDropTexts) {
    letterDropObserver.observe(element);
  }
}

const productScene = document.querySelector("[data-product-scene]");

if (productScene) {
  setupProductScene(productScene);
}

setupPartThumbnails();

function setupProductScene(canvas) {
  const figure = canvas.closest(".product-system__figure");
  const cards = new Map(
    Array.from(document.querySelectorAll("[data-part-card]")).map((card) => [
      card.dataset.partCard,
      card,
    ]),
  );
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 3.35, -3.35, 0.1, 100);
  const loader = new GLTFLoader();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10);
  const interactiveParts = [];
  const animatedParts = [];
  let activePart = null;
  const isCompactScene = window.matchMedia("(max-width: 760px)").matches;
  let cameraViewHeight = isCompactScene ? 5.2 : 6.7;
  const useScrollExplosion =
    figure?.dataset.showTuner !== "true" && !isCompactScene;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const lights = {
    ambient: new THREE.AmbientLight(0xffffff, 0),
    key: new THREE.DirectionalLight(0xffffff, 0),
    fill: new THREE.DirectionalLight(0xffffff, 0),
    front: new THREE.DirectionalLight(0xffffff, 3.7),
    rim: new THREE.DirectionalLight(0xc5ffae, 1.5),
  };

  scene.add(lights.ambient);

  lights.key.position.set(5.5, 4, 7.1);
  scene.add(lights.key);

  lights.fill.position.set(6.7, -1.6, 5);
  scene.add(lights.fill);

  lights.front.position.set(0, 0, 6);
  scene.add(lights.front);

  lights.rim.position.set(3, 1.5, 4);
  scene.add(lights.rim);

  const sceneParts = modelPartConfigs.map((part) => getResponsivePartConfig(part, isCompactScene));

  Promise.all(sceneParts.map((part) => loadPart(loader, part)))
    .then((loadedParts) => {
      for (const part of loadedParts) {
        scene.add(part.group);
        interactiveParts.push(...part.meshes);
        animatedParts.push(part);
      }

      figure?.classList.add("is-3d-ready");
      if (figure?.dataset.showTuner === "true") {
        createModelTuner(figure, loadedParts, lights, {
          getViewHeight: () => cameraViewHeight,
          setViewHeight: (value) => {
            cameraViewHeight = value;
            setRendererSize();
          },
        });
      }
      setRendererSize();
      animate();
    })
    .catch(() => {
      setRendererSize();
    });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.set(10, 10);
    setActivePart(null, cards);
  });

  window.addEventListener("resize", setRendererSize);

  function setRendererSize() {
    const { width, height } = canvas.getBoundingClientRect();

    renderer.setSize(width, height, false);

    const aspect = width / Math.max(height, 1);
    const viewHeight = cameraViewHeight;
    const viewWidth = viewHeight * aspect;

    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);

    if (useScrollExplosion) {
      updateExplosionProgress(animatedParts, figure);
    }

    for (const mesh of interactiveParts) {
      mesh.parent.rotation.z += mesh.userData.spin || 0;
    }

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveParts, true)[0];
    const nextPart = hit?.object.userData.part || null;

    if (nextPart !== activePart) {
      activePart = nextPart;
      setActivePart(activePart, cards);
      canvas.style.cursor = activePart ? "pointer" : "default";
    }

    renderer.render(scene, camera);
  }
}

function getResponsivePartConfig(part, isCompact) {
  if (!isCompact) return part;

  return {
    ...part,
    assembledPosition: part.compactAssembledPosition || part.assembledPosition,
    position: part.compactPosition || part.position,
    size: part.compactSize || part.size,
  };
}

async function loadPart(loader, part) {
  const gltf = await loader.loadAsync(part.path);
  const group = new THREE.Group();
  const model = gltf.scene;
  const meshes = [];
  const assembledPosition = new THREE.Vector3(...(part.assembledPosition || part.position));
  const explodedPosition = new THREE.Vector3(...part.position);

  group.add(model);
  normalizeModel(model, part.size);
  group.position.copy(explodedPosition);
  group.rotation.set(...part.rotation);

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.userData.part = part.key;
    child.castShadow = false;
    child.receiveShadow = false;
    applySourceMaterial(part.key, child.material);
    meshes.push(child);
  });

  group.userData.part = part.key;

  return {
    key: part.key,
    group,
    meshes,
    initialSize: part.size,
    model,
    assembledPosition,
    explodedPosition,
  };
}

function updateExplosionProgress(parts, figure) {
  if (!figure) return;

  const section = figure.closest(".product-system");
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollDistance = viewportHeight * 0.24;
  const raw = Math.max(-rect.top, 0) / scrollDistance;
  const progress = smoothstep(Math.min(Math.max(raw, 0), 1));

  for (const part of parts) {
    part.group.position.lerpVectors(part.assembledPosition, part.explodedPosition, progress);
  }
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function normalizeModel(model, targetSize) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;

  model.position.sub(center);
  model.scale.setScalar(targetSize / maxAxis);
}

function setActivePart(part, cards) {
  for (const [key, card] of cards) {
    card.classList.toggle("is-active", key === part);
  }
}

function setupPartThumbnails() {
  const canvases = document.querySelectorAll("[data-part-thumb]");

  for (const canvas of canvases) {
    const config = modelPartConfigs.find((part) => part.key === canvas.dataset.partThumb);

    if (config) setupPartThumbnail(canvas, config);
  }
}

function setupPartThumbnail(canvas, config) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.25, 1.25, 1.4, -1.4, 0.1, 100);
  const loader = new GLTFLoader();

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));

  const light = new THREE.DirectionalLight(0xffffff, 2.4);
  light.position.set(0, 0, 4);
  scene.add(light);

  loader.load(config.path, (gltf) => {
    const model = gltf.scene;

    normalizeModel(model, config.key === "outer" ? 1.7 : 1.3);
    model.rotation.set(...config.rotation);
    model.traverse((child) => {
      if (child.isMesh) applySourceMaterial(config.key, child.material);
    });
    scene.add(model);
    sizeThumbnailRenderer();
    renderer.render(scene, camera);
  });

  function sizeThumbnailRenderer() {
    const { width, height } = canvas.getBoundingClientRect();

    renderer.setSize(width, height, false);
  }
}

function softenMaterial(material) {
  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    if (!item) continue;

    if ("roughness" in item) {
      item.roughness = Math.max(item.roughness ?? 0, 0.68);
    }

    if ("metalness" in item) {
      item.metalness = Math.min(item.metalness ?? 0, 0.55);
    }

    item.needsUpdate = true;
  }
}

function applySourceMaterial(partKey, material) {
  const profile = sourceMaterialProfiles[partKey];

  if (!profile) {
    softenMaterial(material);
    return;
  }

  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    if (!item) continue;

    item.color?.setHex(profile.color);
    applyMaterialProperty(item, "roughness", profile.roughness);
    applyMaterialProperty(item, "metalness", profile.metalness);
    applyMaterialProperty(item, "specularIntensity", profile.specularIntensity);
    applyMaterialProperty(item, "envMapIntensity", profile.envMapIntensity);
    applyMaterialProperty(item, "opacity", profile.opacity);
    applyMaterialProperty(item, "transmission", profile.transmission);
    applyMaterialProperty(item, "thickness", profile.thickness);
    applyMaterialProperty(item, "ior", profile.ior);

    item.transparent = Boolean(profile.transparent);
    item.depthWrite = !profile.transparent;
    item.side = profile.transparent ? THREE.DoubleSide : THREE.FrontSide;
    item.needsUpdate = true;
  }
}

function applyMaterialProperty(material, key, value) {
  if (value === undefined || !(key in material)) return;

  material[key] = value;
}

function firstMaterial(part) {
  let material = null;

  if (part.mesh?.isMesh) {
    return Array.isArray(part.mesh.material) ? part.mesh.material[0] : part.mesh.material;
  }

  part.model.traverse((child) => {
    if (material || !child.isMesh) return;
    material = Array.isArray(child.material) ? child.material[0] : child.material;
  });

  return material;
}

function forEachMaterial(part, callback) {
  if (part.mesh?.isMesh) {
    const materials = Array.isArray(part.mesh.material) ? part.mesh.material : [part.mesh.material];

    for (const material of materials) {
      if (material) callback(material);
    }
    return;
  }

  part.model.traverse((child) => {
    if (!child.isMesh) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (const material of materials) {
      if (material) callback(material);
    }
  });
}

function applyMaterialValue(part, key, value) {
  forEachMaterial(part, (material) => {
    if (!(key in material)) return;

    material[key] = value;

    if (key === "opacity") {
      material.transparent = value < 1;
      material.depthWrite = value >= 0.5;
    }

    material.needsUpdate = true;
  });
}

function applyMaterialColor(part, value) {
  forEachMaterial(part, (material) => {
    if (!material.color) return;

    material.color.set(value);
    material.needsUpdate = true;
  });
}

function getMeshOptions(part) {
  const options = [new Option("All meshes", "all")];
  let index = 1;

  part.model.traverse((child) => {
    if (!child.isMesh) return;

    if (!child.userData.tunerMeshId) {
      child.userData.tunerMeshId = `mesh-${index}`;
    }

    options.push(new Option(child.name || `mesh ${index}`, child.userData.tunerMeshId));
    index += 1;
  });

  return options;
}

function getSelectedMaterialTarget(part, meshKey) {
  if (!meshKey || meshKey === "all") return part;

  let mesh = null;

  part.model.traverse((child) => {
    if (mesh || !child.isMesh) return;
    if (child.userData.tunerMeshId === meshKey) mesh = child;
  });

  return mesh ? { key: `${part.key}/${mesh.name || meshKey}`, mesh } : part;
}

function applyMaterialPreset(part, preset) {
  const leopardTexture = preset === "leopard" ? createLeopardTexture() : null;

  forEachMaterial(part, (material) => {
    material.map = leopardTexture || null;

    if (material.color) {
      material.color.set(getPresetColor(preset));
    }

    if ("roughness" in material) material.roughness = getPresetRoughness(preset);
    if ("metalness" in material) material.metalness = getPresetMetalness(preset);
    if ("opacity" in material) {
      material.opacity = getPresetOpacity(preset);
      material.transparent = material.opacity < 1;
      material.depthWrite = material.opacity >= 0.5;
    }

    material.needsUpdate = true;
  });
}

function getPresetColor(preset) {
  return {
    "brushed metal": "#c9c7c0",
    "dark glass": "#111111",
    "matte black": "#050505",
    "copper circuit": "#b87552",
    leopard: "#d8aa58",
  }[preset] || "#ffffff";
}

function getPresetRoughness(preset) {
  return {
    "brushed metal": 0.32,
    "dark glass": 0.18,
    "matte black": 0.86,
    "copper circuit": 0.58,
    leopard: 0.72,
  }[preset] ?? 0.68;
}

function getPresetMetalness(preset) {
  return {
    "brushed metal": 0.85,
    "dark glass": 0.08,
    "matte black": 0.12,
    "copper circuit": 0.45,
    leopard: 0.05,
  }[preset] ?? 0.2;
}

function getPresetOpacity(preset) {
  return preset === "dark glass" ? 0.42 : 1;
}

function createLeopardTexture() {
  const canvas = document.createElement("canvas");
  const size = 256;
  const context = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;
  context.fillStyle = "#d8aa58";
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 42; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 7 + Math.random() * 14;

    context.fillStyle = "#2b1b10";
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.55 + Math.random() * 0.35), Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#b87937";
    context.beginPath();
    context.ellipse(x, y, radius * 0.48, radius * 0.28, Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  return texture;
}

function createModelTuner(figure, loadedParts, lights, cameraControls) {
  if (!figure) return;

  const state = new Map(loadedParts.map((part) => [part.key, part]));
  const panel = document.createElement("aside");
  const select = document.createElement("select");
  const output = document.createElement("pre");
  const controls = [
    { key: "rotX", label: "Rotate X", min: -180, max: 540, step: 1 },
    { key: "rotY", label: "Rotate Y", min: -180, max: 540, step: 1 },
    { key: "rotZ", label: "Rotate Z", min: -180, max: 540, step: 1 },
    { key: "posX", label: "Move X", min: -6, max: 6, step: 0.05 },
    { key: "posY", label: "Move Y", min: -4, max: 4, step: 0.05 },
    { key: "posZ", label: "Move Z", min: -3, max: 3, step: 0.05 },
    { key: "scale", label: "Scale", min: 0.2, max: 3, step: 0.02 },
  ];
  const inputs = new Map();

  panel.className = "model-tuner";
  panel.innerHTML = "<h3>3D tuner</h3>";

  for (const part of loadedParts) {
    const option = document.createElement("option");

    option.value = part.key;
    option.textContent = part.key;
    select.appendChild(option);
  }

  panel.appendChild(select);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.dataset.control = control.key;
    value.className = "model-tuner__value";
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    panel.appendChild(label);
    inputs.set(control.key, { input, value });

    input.addEventListener("input", () => {
      applyTunerValues(state.get(select.value), inputs);
      updateTunerOutput(state.get(select.value), inputs, output);
    });
  }

  output.className = "model-tuner__output";
  panel.appendChild(output);
  panel.appendChild(createCameraTuner(cameraControls));
  panel.appendChild(createMaterialTuner(state, select));
  panel.appendChild(createLightingTuner(lights));
  figure.appendChild(panel);

  select.addEventListener("change", () => {
    syncTunerInputs(state.get(select.value), inputs);
    updateTunerOutput(state.get(select.value), inputs, output);
  });

  syncTunerInputs(state.get(select.value), inputs);
  updateTunerOutput(state.get(select.value), inputs, output);
}

function createMaterialTuner(state, select) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const output = document.createElement("pre");
  const meshLabel = document.createElement("label");
  const meshSelect = document.createElement("select");
  const presetLabel = document.createElement("label");
  const presetSelect = document.createElement("select");
  const controls = [
    { key: "roughness", label: "Roughness", min: 0, max: 1, step: 0.01 },
    { key: "metalness", label: "Metalness", min: 0, max: 1, step: 0.01 },
    { key: "opacity", label: "Opacity", min: 0.05, max: 1, step: 0.01 },
    { key: "envMapIntensity", label: "Env intensity", min: 0, max: 3, step: 0.05 },
  ];
  const colorLabel = document.createElement("label");
  const colorInput = document.createElement("input");

  details.className = "model-tuner__section";
  details.open = true;
  summary.textContent = "Material";
  details.appendChild(summary);

  meshLabel.textContent = "Mesh";
  meshLabel.appendChild(meshSelect);
  details.appendChild(meshLabel);

  presetLabel.textContent = "Preset";
  for (const preset of ["custom", "brushed metal", "dark glass", "matte black", "copper circuit", "leopard"]) {
    const option = document.createElement("option");

    option.value = preset;
    option.textContent = preset;
    presetSelect.appendChild(option);
  }
  presetLabel.appendChild(presetSelect);
  details.appendChild(presetLabel);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    value.className = "model-tuner__value";
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    details.appendChild(label);

    input.addEventListener("input", () => {
      const part = state.get(select.value);
      const target = getSelectedMaterialTarget(part, meshSelect.value);

      applyMaterialValue(target, control.key, Number(input.value));
      value.textContent = input.value;
      updateMaterialOutput(part, meshSelect.value, output);
    });

    control.input = input;
    control.value = value;
  }

  colorInput.type = "color";
  colorLabel.textContent = "Tint";
  colorLabel.appendChild(colorInput);
  details.appendChild(colorLabel);

  colorInput.addEventListener("input", () => {
    const part = state.get(select.value);
    const target = getSelectedMaterialTarget(part, meshSelect.value);

    applyMaterialColor(target, colorInput.value);
    updateMaterialOutput(part, meshSelect.value, output);
  });

  output.className = "model-tuner__output";
  details.appendChild(output);

  meshSelect.addEventListener("change", syncMaterialValues);
  presetSelect.addEventListener("change", () => {
    const target = getSelectedMaterialTarget(state.get(select.value), meshSelect.value);

    applyMaterialPreset(target, presetSelect.value);
    syncMaterialValues();
  });

  function sync() {
    const part = state.get(select.value);

    meshSelect.textContent = "";
    for (const option of getMeshOptions(part)) {
      meshSelect.appendChild(option);
    }
    syncMaterialValues();
  }

  function syncMaterialValues() {
    const part = state.get(select.value);
    const target = getSelectedMaterialTarget(part, meshSelect.value);
    const material = firstMaterial(target);

    for (const control of controls) {
      const raw = material?.[control.key];
      const fallback = control.key === "opacity" ? 1 : 0;

      control.input.value = Number(raw ?? fallback).toFixed(2);
      control.value.textContent = control.input.value;
    }

    colorInput.value = material?.color ? `#${material.color.getHexString()}` : "#ffffff";
    updateMaterialOutput(part, meshSelect.value, output);
  }

  select.addEventListener("change", sync);
  window.setTimeout(sync, 0);

  return details;
}

function updateMaterialOutput(part, meshKey, output) {
  const target = getSelectedMaterialTarget(part, meshKey);
  const material = firstMaterial(target);
  const number = (value) => (value == null ? "n/a" : Number(value).toFixed(2));

  output.textContent = `${target.key}
roughness: ${number(material?.roughness)}
metalness: ${number(material?.metalness)}
opacity: ${number(material?.opacity)}
envMapIntensity: ${number(material?.envMapIntensity)}
tint: ${material?.color ? `#${material.color.getHexString()}` : "n/a"}`;
}

function createCameraTuner(cameraControls) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const label = document.createElement("label");
  const value = document.createElement("span");
  const input = document.createElement("input");
  const output = document.createElement("pre");

  details.className = "model-tuner__section";
  details.open = true;
  summary.textContent = "Camera";
  input.type = "range";
  input.min = "3";
  input.max = "12";
  input.step = "0.05";
  input.value = cameraControls.getViewHeight().toFixed(2);
  value.className = "model-tuner__value";
  value.textContent = input.value;
  label.textContent = "Ortho size";
  label.appendChild(value);
  label.appendChild(input);
  output.className = "model-tuner__output";

  input.addEventListener("input", () => {
    cameraControls.setViewHeight(Number(input.value));
    value.textContent = input.value;
    output.textContent = `cameraViewHeight: ${Number(input.value).toFixed(2)}`;
  });

  output.textContent = `cameraViewHeight: ${Number(input.value).toFixed(2)}`;
  details.appendChild(summary);
  details.appendChild(label);
  details.appendChild(output);

  return details;
}

function createLightingTuner(lights) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const controls = [
    { light: "ambient", prop: "intensity", label: "Ambient", min: 0, max: 8, step: 0.05 },
    { light: "key", prop: "intensity", label: "Key", min: 0, max: 5, step: 0.05 },
    { light: "fill", prop: "intensity", label: "Fill", min: 0, max: 5, step: 0.05 },
    { light: "front", prop: "intensity", label: "Front", min: 0, max: 5, step: 0.05 },
    { light: "rim", prop: "intensity", label: "Rim", min: 0, max: 5, step: 0.05 },
    { light: "key", prop: "x", label: "Key X", min: -8, max: 8, step: 0.1 },
    { light: "key", prop: "y", label: "Key Y", min: -8, max: 8, step: 0.1 },
    { light: "key", prop: "z", label: "Key Z", min: -2, max: 10, step: 0.1 },
    { light: "fill", prop: "x", label: "Fill X", min: -8, max: 8, step: 0.1 },
    { light: "fill", prop: "y", label: "Fill Y", min: -8, max: 8, step: 0.1 },
    { light: "fill", prop: "z", label: "Fill Z", min: -2, max: 10, step: 0.1 },
    { light: "front", prop: "z", label: "Front Z", min: 0, max: 12, step: 0.1 },
    { light: "rim", prop: "intensity", label: "Rim Glow", min: 0, max: 3, step: 0.05 },
  ];
  const output = document.createElement("pre");

  details.className = "model-tuner__section model-tuner__lights";
  details.open = true;
  summary.textContent = "Lighting";
  details.appendChild(summary);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");
    const light = lights[control.light];

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.value = getLightValue(light, control.prop).toFixed(2);
    value.className = "model-tuner__value";
    value.textContent = input.value;
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    details.appendChild(label);

    input.addEventListener("input", () => {
      setLightValue(light, control.prop, Number(input.value));
      value.textContent = input.value;
      updateLightingOutput(lights, output);
    });
  }

  output.className = "model-tuner__output";
  details.appendChild(output);
  updateLightingOutput(lights, output);

  return details;
}

function getLightValue(light, prop) {
  if (prop === "intensity") return light.intensity;

  return light.position[prop];
}

function setLightValue(light, prop, value) {
  if (prop === "intensity") {
    light.intensity = value;
    return;
  }

  light.position[prop] = value;
}

function updateLightingOutput(lights, output) {
  output.textContent = `ambient: ${lights.ambient.intensity.toFixed(2)}
key: ${lights.key.intensity.toFixed(2)} @ [${formatVector(lights.key.position)}]
fill: ${lights.fill.intensity.toFixed(2)} @ [${formatVector(lights.fill.position)}]
front: ${lights.front.intensity.toFixed(2)} @ [${formatVector(lights.front.position)}]
rim: ${lights.rim.intensity.toFixed(2)} @ [${formatVector(lights.rim.position)}]`;
}

function formatVector(vector) {
  return [vector.x, vector.y, vector.z].map((value) => value.toFixed(2)).join(", ");
}

function syncTunerInputs(part, inputs) {
  const values = {
    rotX: THREE.MathUtils.radToDeg(part.group.rotation.x),
    rotY: THREE.MathUtils.radToDeg(part.group.rotation.y),
    rotZ: THREE.MathUtils.radToDeg(part.group.rotation.z),
    posX: part.group.position.x,
    posY: part.group.position.y,
    posZ: part.group.position.z,
    scale: part.group.scale.x,
  };

  for (const [key, entry] of inputs) {
    entry.input.value = values[key].toFixed(key.startsWith("rot") ? 0 : 2);
    entry.value.textContent = entry.input.value;
  }
}

function applyTunerValues(part, inputs) {
  const value = (key) => Number(inputs.get(key).input.value);

  part.group.rotation.set(
    THREE.MathUtils.degToRad(value("rotX")),
    THREE.MathUtils.degToRad(value("rotY")),
    THREE.MathUtils.degToRad(value("rotZ")),
  );
  part.group.position.set(value("posX"), value("posY"), value("posZ"));
  part.group.scale.setScalar(value("scale"));

  for (const entry of inputs.values()) {
    entry.value.textContent = entry.input.value;
  }
}

function updateTunerOutput(part, inputs, output) {
  const value = (key) => Number(inputs.get(key).input.value);
  const rotation = ["rotX", "rotY", "rotZ"]
    .map((key) => THREE.MathUtils.degToRad(value(key)).toFixed(4))
    .join(", ");
  const position = ["posX", "posY", "posZ"]
    .map((key) => value(key).toFixed(2))
    .join(", ");

  output.textContent = `${part.key}
position: [${position}],
rotation: [${rotation}],
scale: ${value("scale").toFixed(2)}`;
}
