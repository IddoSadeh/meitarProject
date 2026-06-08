import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const localeTime = document.querySelector("#locale-time");
const revealTexts = document.querySelectorAll("[data-scroll-reveal]");

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

for (const element of revealTexts) {
  setupRevealText(element);
}

updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);

const productScene = document.querySelector("[data-product-scene]");

if (productScene) {
  setupProductScene(productScene);
}

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
  let activePart = null;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(-2.5, 4, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc5ffae, 1.4);
  rimLight.position.set(3, 1.5, 4);
  scene.add(rimLight);

  const parts = [
    {
      key: "interface",
      path: "3d_Models/GLTF/METAL_RING.glb",
      position: [-3.35, 0.35, 0],
      rotation: [0.95 + Math.PI / 2, 0.25, -0.35],
      size: 1.55,
    },
    {
      key: "engine",
      path: "3d_Models/GLTF/CHIP.glb",
      position: [-0.75, 0.18, 0],
      rotation: [1.15 + Math.PI / 2, 0, -0.18],
      size: 1.25,
    },
    {
      key: "outer",
      path: "3d_Models/GLTF/GLASS.glb",
      position: [2.55, -0.1, 0],
      rotation: [1.15 + Math.PI / 2, -0.1, -0.28],
      size: 2.25,
    },
  ];

  Promise.all(parts.map((part) => loadPart(loader, part)))
    .then((loadedParts) => {
      for (const part of loadedParts) {
        scene.add(part.group);
        interactiveParts.push(...part.meshes);
      }

      figure?.classList.add("is-3d-ready");
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
    const viewHeight = 6.7;
    const viewWidth = viewHeight * aspect;

    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);

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

async function loadPart(loader, part) {
  const gltf = await loader.loadAsync(part.path);
  const group = new THREE.Group();
  const model = gltf.scene;
  const meshes = [];

  group.add(model);
  normalizeModel(model, part.size);
  group.position.set(...part.position);
  group.rotation.set(...part.rotation);

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.userData.part = part.key;
    child.castShadow = false;
    child.receiveShadow = false;
    meshes.push(child);
  });

  group.userData.part = part.key;

  return { group, meshes };
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
