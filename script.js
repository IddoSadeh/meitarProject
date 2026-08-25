let THREE;
let GLTFLoader;

const localeTime = document.querySelector("#locale-time");
const siteMenu = document.querySelector(".site-menu");
const siteMenuButton = document.querySelector(".site-menu__icon");
const revealTexts = document.querySelectorAll("[data-scroll-reveal]");
const wordRevealGroups = document.querySelectorAll("[data-word-reveal]");
const letterDropTexts = document.querySelectorAll("[data-letter-drop]");
const typewriterTexts = document.querySelectorAll("[data-typewriter]");
const scrambleTypewriterTexts = document.querySelectorAll("[data-scramble-typewriter]");
const standaloneScrambleTexts = document.querySelectorAll("[data-standalone-scramble]");
const maskRevealTitles = document.querySelectorAll("[data-mask-reveal]");
const homeLetterTexts = document.querySelectorAll(".home-letters");
const homeSymbolLayer = document.querySelector(".home-symbols");
const homeProcessItems = document.querySelectorAll(".home-process__item");
const textureCards = document.querySelectorAll(".texture-card");
const homeMemoryTransition = document.querySelector(".home-memory-transition");
const homeMemoryStage = homeMemoryTransition?.querySelector(".home-memory-transition__stage");
const homeMemoryInner = homeMemoryTransition?.querySelector(".home-memory__inner");
const homeMemoryText = homeMemoryTransition?.querySelector(".home-memory__text");
const homeSystemIndex = document.querySelector(".home-system-index");
const productSpinImages = [...document.querySelectorAll("[data-product-spin]")];
const orderCard = document.querySelector(".order-card");
const memoryTabs = document.querySelectorAll("[data-memory-tab]");
const memoryPanes = document.querySelectorAll("[data-memory-pane]");
const companyHero = document.querySelector(".company-hero");
const companyVideoTrigger = document.querySelector(".company-hero__play");
const companyVideoModal = document.querySelector("[data-company-video-modal]");
const companyVideo = companyVideoModal?.querySelector("video");
const companyVideoTime = companyVideoModal?.querySelector(
  "[data-company-video-time]",
);
const companyVideoClose = companyVideoModal?.querySelector(
  "[data-company-video-close]",
);
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

  element.textContent = "";

  if (element.dataset.revealIndent !== "false") {
    const indent = document.createElement("span");
    indent.className = "reveal__indent";
    fragment.appendChild(indent);
  }

  for (const character of text) {
    if (character === "\n") {
      const lineBreak = document.createElement("span");
      lineBreak.className = "reveal__line-break";
      lineBreak.setAttribute("aria-hidden", "true");
      lineBreak.appendChild(document.createElement("br"));
      fragment.appendChild(lineBreak);
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
    const reveal = element.closest(".reveal") || element;
    const rect = reveal.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rawProgress = reveal.classList.contains("reveal--os")
      ? (viewportHeight * 0.92 - rect.top) / (viewportHeight * 0.72)
      : (viewportHeight * 0.78 - rect.top) / (rect.height + viewportHeight * 0.16);
    const progress = Math.min(Math.max(rawProgress, 0), 1);
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

function setupTypewriterText(element) {
  const text = element.textContent.trim();
  const fragment = document.createDocumentFragment();
  let index = 0;

  element.setAttribute("aria-label", text);
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "typewriter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "typewriter-char";
    span.style.setProperty("--typewriter-index", index);
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
  }

  element.appendChild(fragment);
}

const scrambleStates = new WeakMap();
const scrambleGlyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&?";

function setupScrambleTypewriter(element) {
  const text = element.textContent.trim();
  const fragment = document.createDocumentFragment();
  const characters = [];

  element.setAttribute("aria-label", text);
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "scramble-space";
      span.textContent = "\u00a0";
    } else {
      span.className = "scramble-char";
      span.textContent = character;
      span.classList.add("is-visible");
      characters.push({ span, character });
    }

    fragment.appendChild(span);
  }

  element.appendChild(fragment);
  scrambleStates.set(element, { characters, frame: 0 });
}

function resetScrambleTypewriter(element) {
  const state = scrambleStates.get(element);
  if (!state) return;

  cancelAnimationFrame(state.frame);
  element.classList.remove("is-scrambling");

  for (const item of state.characters) {
    item.span.textContent = item.character;
    item.span.classList.add("is-visible");
    item.span.classList.remove("is-scrambling-char");
  }
}

function playScrambleTypewriter(element) {
  const state = scrambleStates.get(element);
  if (!state) return 0;

  resetScrambleTypewriter(element);

  const start = performance.now();
  const leadIn = 300;
  const waveStagger = 58;
  const scrambleHold = 650;
  const glyphInterval = 55;
  const waveDuration = Math.max(0, state.characters.length - 1) * waveStagger;
  const resolveStart = leadIn + waveDuration + scrambleHold;
  const animationEnd = resolveStart + waveDuration;

  element.classList.add("is-scrambling");

  const update = (now) => {
    let isComplete = true;

    state.characters.forEach((item, index) => {
      const elapsed = now - start;
      const scrambleStart = leadIn + (state.characters.length - index - 1) * waveStagger;
      const resolveAt = resolveStart + index * waveStagger;

      if (elapsed < scrambleStart) {
        item.span.textContent = item.character;
        item.span.classList.remove("is-scrambling-char");
        isComplete = false;
        return;
      }

      if (elapsed < resolveAt) {
        const glyphIndex = Math.floor((elapsed - scrambleStart) / glyphInterval + index * 5) % scrambleGlyphs.length;
        item.span.textContent = scrambleGlyphs[glyphIndex];
        item.span.classList.add("is-scrambling-char");
        isComplete = false;
      } else {
        item.span.textContent = item.character;
        item.span.classList.remove("is-scrambling-char");
      }
    });

    if (isComplete && now - start >= animationEnd) {
      element.classList.remove("is-scrambling");
      state.frame = 0;
      return;
    }

    state.frame = requestAnimationFrame(update);
  };

  state.frame = requestAnimationFrame(update);
  return animationEnd;
}

function setupHomeSymbols(layer, revealStart) {
  const states = [];
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_+=;:<>,./{}\\";

  for (const symbol of layer.querySelectorAll("span")) {
    const text = symbol.textContent;
    const fragment = document.createDocumentFragment();

    for (const character of text) {
      if (character === "\n") {
        fragment.appendChild(document.createElement("br"));
        continue;
      }

      if (character === " ") {
        fragment.appendChild(document.createTextNode(" "));
        continue;
      }

      const cell = document.createElement("i");
      cell.textContent = character;
      cell.style.setProperty("--symbol-enter-x", `${(Math.random() - 0.5) * 0.9}rem`);
      cell.style.setProperty("--symbol-enter-y", `${0.35 + Math.random() * 0.9}rem`);
      fragment.appendChild(cell);
      states.push({
        cell,
        finalCharacter: character,
      });
    }

    symbol.textContent = "";
    symbol.appendChild(fragment);
  }

  const shuffled = [...states].sort(() => Math.random() - 0.5);
  const revealStep = 32;

  shuffled.forEach(({ cell, finalCharacter }, index) => {
    window.setTimeout(() => {
      let frame = 0;
      cell.classList.add("is-symbol-active", "is-symbol-glitching");

      const shuffle = window.setInterval(() => {
        if (frame >= 3) {
          window.clearInterval(shuffle);
          cell.textContent = finalCharacter;
          cell.classList.remove("is-symbol-glitching");
          return;
        }

        cell.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        frame += 1;
      }, 55);
    }, revealStart + index * revealStep + Math.random() * 140);
  });
}

function setupHomeLetters(element, startIndex = 0) {
  const text = element.textContent.replace(/\s+/g, " ");
  const fragment = document.createDocumentFragment();
  let index = startIndex;
  let visibleCharacterCount = 0;

  element.setAttribute("aria-label", text.trim());
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "home-letter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "home-letter";
    span.style.setProperty("--home-letter-index", index);
    span.dataset.homeLetterFinal = character;
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
    visibleCharacterCount += 1;
  }

  element.appendChild(fragment);

  return visibleCharacterCount;
}

function playHomeLetterGlitch() {
  const letters = [...document.querySelectorAll(".home-letter")];
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_+=;:<>,";
  const initialDelay = 420;
  const stagger = 15;
  const frameDuration = 55;
  const randomFrames = 4;

  letters.forEach((letter, index) => {
    window.setTimeout(() => {
      let frame = 0;
      letter.classList.add("is-home-letter-visible", "is-home-letter-glitching");

      const shuffle = window.setInterval(() => {
        if (frame >= randomFrames) {
          window.clearInterval(shuffle);
          letter.textContent = letter.dataset.homeLetterFinal;
          letter.classList.remove("is-home-letter-glitching");
          return;
        }

        letter.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        frame += 1;
      }, frameDuration);
    }, initialDelay + index * stagger);
  });

  const finalLetterStart = initialDelay + Math.max(letters.length - 1, 0) * stagger;
  const fullRevealDuration = finalLetterStart + frameDuration * (randomFrames + 1);

  return Math.max(initialDelay, fullRevealDuration - 220);
}

function setupMaskRevealTitle(element) {
  if (
    window.matchMedia("(max-width: 760px)").matches &&
    element.closest(".product-system")
  ) {
    return;
  }

  const lines = Array.from(element.children);
  let globalLetterIndex = 0;

  for (const line of lines) {
    const text = line.textContent.replace(/\u00a0/g, " ");
    const fragment = document.createDocumentFragment();
    const chars = Array.from(text);

    line.classList.add("product-system__title-line");
    line.textContent = "";

    for (const character of chars) {
      if (character === " ") {
        const space = document.createElement("span");

        space.className = "product-system__title-space";
        space.setAttribute("aria-hidden", "true");
        fragment.appendChild(space);
        continue;
      }

      const span = document.createElement("span");
      span.className = "product-system__title-char";
      span.dataset.maskIndex = globalLetterIndex;
      span.textContent = character;
      fragment.appendChild(span);
      globalLetterIndex += 1;
    }

    line.appendChild(fragment);
  }
}

function updateMaskRevealTitles() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  for (const title of maskRevealTitles) {
    const section = title.closest(".product-system, .home-remember");
    const rect = section.getBoundingClientRect();
    const chars = title.querySelectorAll(".product-system__title-char");
    const totalChars = chars.length || 1;
    const revealDistance = section.classList.contains("home-remember") ? 0.7 : 0.46;
    const raw = (viewportHeight * 0.68 - rect.top) / (viewportHeight * revealDistance);
    const progress = Math.min(Math.max(raw, 0), 1);
    const stagger = Math.min(0.045, 0.68 / totalChars);

    if (section.classList.contains("home-remember")) {
      const wasRevealed = section.classList.contains("is-title-revealed");
      const isRevealed = progress >= 0.9;

      if (wasRevealed !== isRevealed) {
        section.classList.toggle("is-title-revealed", isRevealed);
        section.dispatchEvent(new Event("home-remember:title-state"));
      }
    }

    chars.forEach((char) => {
      const index = Number(char.dataset.maskIndex) || 0;
      const reverseIndex = totalChars - index - 1;
      const local = Math.min(Math.max((progress - reverseIndex * stagger) / 0.24, 0), 1);
      const y = (1 - easeOutCubic(local)) * 105;

      char.style.transform = `translateY(${y}%)`;
    });
  }
}

for (const element of revealTexts) {
  setupRevealText(element);
}

updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);

function updateWordRevealText() {
  for (const group of wordRevealGroups) {
    const items = group.querySelectorAll("li");
    const track = group.closest(".company-principles-track") ?? group;
    const rect = track.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollDistance = Math.max(rect.height - viewportHeight, 1);
    const rawProgress = -rect.top / scrollDistance;
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const activeCount = Math.min(
      items.length,
      Math.floor(progress * (items.length + 1)),
    );

    items.forEach((item, index) => {
      item.classList.toggle("is-active", index < activeCount);
    });
  }
}

updateWordRevealText();
window.addEventListener("scroll", updateWordRevealText, { passive: true });
window.addEventListener("resize", updateWordRevealText);

for (const element of letterDropTexts) {
  setupLetterDrop(element);
}

for (const element of typewriterTexts) {
  setupTypewriterText(element);
}

for (const element of scrambleTypewriterTexts) {
  setupScrambleTypewriter(element);
}

for (const element of standaloneScrambleTexts) {
  setupScrambleTypewriter(element);
}

let homeLetterOffset = 0;

for (const element of homeLetterTexts) {
  homeLetterOffset += setupHomeLetters(element, homeLetterOffset);
}

const homeSymbolRevealStart =
  homeLetterTexts.length > 0 ? playHomeLetterGlitch() : 900;

if (homeSymbolLayer) {
  setupHomeSymbols(homeSymbolLayer, homeSymbolRevealStart);
}

for (const card of textureCards) {
  setupTextureCardHover(card);
}

if (siteMenu && siteMenuButton) {
  siteMenuButton.setAttribute("aria-expanded", "false");

  siteMenuButton.addEventListener("click", () => {
    const isOpen = siteMenu.classList.toggle("is-menu-open");
    siteMenuButton.setAttribute("aria-expanded", String(isOpen));
    siteMenuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    siteMenu.classList.remove("is-dot-swapping");
    void siteMenu.offsetWidth;
    siteMenu.classList.add("is-dot-swapping");
  });

  document.addEventListener("click", (event) => {
    if (!siteMenu.contains(event.target)) {
      siteMenu.classList.remove("is-menu-open");
      siteMenuButton.setAttribute("aria-expanded", "false");
      siteMenuButton.setAttribute("aria-label", "Open menu");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      siteMenu.classList.remove("is-menu-open");
      siteMenuButton.setAttribute("aria-expanded", "false");
      siteMenuButton.setAttribute("aria-label", "Open menu");
      siteMenuButton.focus();
    }
  });
}

if (companyHero && companyVideoTrigger && companyVideoModal && companyVideo) {
  const canFollowPointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let followFrame = 0;
  let pointerIdleTimer = 0;

  const updateTriggerPosition = () => {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    companyVideoTrigger.style.left = `${currentX}px`;
    companyVideoTrigger.style.top = `${currentY}px`;

    if (
      Math.abs(targetX - currentX) > 0.1 ||
      Math.abs(targetY - currentY) > 0.1
    ) {
      followFrame = window.requestAnimationFrame(updateTriggerPosition);
    } else {
      followFrame = 0;
    }
  };

  const moveTrigger = (event) => {
    if (!canFollowPointer.matches) return;

    companyVideoTrigger.classList.add("is-pointer-active");
    window.clearTimeout(pointerIdleTimer);
    pointerIdleTimer = window.setTimeout(() => {
      companyVideoTrigger.classList.remove("is-pointer-active");
    }, 800);

    const heroRect = companyHero.getBoundingClientRect();
    targetX = event.clientX - heroRect.left;
    targetY = event.clientY - heroRect.top;

    if (!companyVideoTrigger.classList.contains("is-following-pointer")) {
      const triggerRect = companyVideoTrigger.getBoundingClientRect();
      currentX = triggerRect.left - heroRect.left + triggerRect.width / 2;
      currentY = triggerRect.top - heroRect.top + triggerRect.height / 2;
      companyVideoTrigger.classList.add("is-following-pointer");
    }

    if (!followFrame) {
      followFrame = window.requestAnimationFrame(updateTriggerPosition);
    }
  };

  const resetTrigger = () => {
    if (!canFollowPointer.matches) return;
    if (followFrame) window.cancelAnimationFrame(followFrame);
    window.clearTimeout(pointerIdleTimer);
    followFrame = 0;
    pointerIdleTimer = 0;
    companyVideoTrigger.classList.remove(
      "is-following-pointer",
      "is-pointer-active",
    );
    companyVideoTrigger.style.removeProperty("left");
    companyVideoTrigger.style.removeProperty("top");
  };

  const closeCompanyVideo = () => {
    if (companyVideoModal.open) companyVideoModal.close();
  };

  const updateCompanyVideoTime = () => {
    const elapsed = Math.max(0, Math.floor(companyVideo.currentTime || 0));
    const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    const clock = `${hours}:${minutes}:${seconds}`;

    if (companyVideoTime) {
      companyVideoTime.textContent = clock;
      companyVideoTime.dateTime = `PT${elapsed}S`;
    }
  };

  companyHero.addEventListener("pointermove", moveTrigger);
  companyHero.addEventListener("pointerleave", resetTrigger);

  companyVideoTrigger.addEventListener("click", () => {
    window.clearTimeout(pointerIdleTimer);
    companyVideoTrigger.classList.remove("is-pointer-active");
    companyVideoModal.showModal();
    document.body.classList.add("is-company-video-open");
    companyVideo.play().catch(() => {});
  });

  companyVideoClose?.addEventListener("click", closeCompanyVideo);
  companyVideo.addEventListener("timeupdate", updateCompanyVideoTime);
  companyVideo.addEventListener("loadedmetadata", updateCompanyVideoTime);
  companyVideoModal.addEventListener("click", (event) => {
    if (event.target === companyVideoModal) closeCompanyVideo();
  });
  companyVideoModal.addEventListener("close", () => {
    companyVideo.pause();
    document.body.classList.remove("is-company-video-open");
  });
}

for (const element of maskRevealTitles) {
  setupMaskRevealTitle(element);
}

updateMaskRevealTitles();
window.addEventListener("scroll", updateMaskRevealTitles, { passive: true });
window.addEventListener("resize", updateMaskRevealTitles);

function setupProductSpin() {
  if (productSpinImages.length === 0) return;

  const frameCount = 90;
  const frameDuration = 1000 / 12;
  const frameUrls = Array.from(
    { length: frameCount },
    (_, index) =>
      `assets/360/webp/footer-spin-${String(index + 1).padStart(3, "0")}.webp`,
  );
  let frameIndex = 0;

  const renderFrame = () => {
    const src = frameUrls[frameIndex];
    for (const image of productSpinImages) image.src = src;
  };

  for (const src of frameUrls.slice(1)) {
    const image = new Image();
    image.src = src;
  }

  setInterval(() => {
    frameIndex = (frameIndex + 1) % frameCount;
    renderFrame();
  }, frameDuration);
}

setupProductSpin();

function setupOrderCard() {
  if (!orderCard) return;

  const toggle = orderCard.querySelector(".order-card__config-toggle");
  const options = orderCard.querySelector(".order-card__options");
  const quantity = orderCard.querySelector("[data-order-quantity]");
  const selectedPlan = orderCard.querySelector("[data-selected-plan]");
  const selectedColor = orderCard.querySelector("[data-selected-color]");

  toggle?.addEventListener("click", () => {
    const isOpen = orderCard.classList.toggle("is-config-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    options?.setAttribute("aria-hidden", String(!isOpen));
    options?.toggleAttribute("inert", !isOpen);
  });

  for (const button of orderCard.querySelectorAll("[data-quantity-action]")) {
    button.addEventListener("click", () => {
      const current = Number(quantity?.textContent) || 1;
      const next = button.dataset.quantityAction === "increase"
        ? Math.min(current + 1, 9)
        : Math.max(current - 1, 1);
      if (quantity) quantity.textContent = String(next);
    });
  }

  for (const button of orderCard.querySelectorAll("[data-order-plan]")) {
    button.addEventListener("click", () => {
      for (const option of orderCard.querySelectorAll("[data-order-plan]")) {
        option.setAttribute("aria-pressed", String(option === button));
      }
      if (selectedPlan) selectedPlan.textContent = button.dataset.orderPlan;
    });
  }

  for (const button of orderCard.querySelectorAll("[data-order-color]")) {
    button.addEventListener("click", () => {
      for (const option of orderCard.querySelectorAll("[data-order-color]")) {
        option.setAttribute("aria-pressed", String(option === button));
      }
      if (selectedColor) selectedColor.textContent = button.dataset.orderColor;
    });
  }
}

setupOrderCard();

function updateHomeSystemIndexCover() {
  if (
    !homeMemoryTransition ||
    !homeMemoryStage ||
    !homeMemoryInner ||
    !homeMemoryText ||
    !homeSystemIndex
  ) {
    return;
  }

  const rect = homeMemoryTransition.getBoundingClientRect();
  const stageRect = homeMemoryStage.getBoundingClientRect();
  const textRect = homeMemoryText.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollDistance = Math.max(rect.height - viewportHeight, 1);
  const coverProgress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
  const imageProgress = Math.min(Math.max(coverProgress / 0.5, 0), 1);
  const textProgress = Math.min(Math.max((coverProgress - 0.5) / 0.5, 0), 1);
  const textGap = Number.parseFloat(getComputedStyle(homeMemoryInner).paddingTop) || 0;
  const imageStart = Math.max(
    viewportHeight * 0.5,
    textRect.bottom - stageRect.top + textGap,
  );
  const imageOffset = imageStart * (1 - imageProgress);

  homeSystemIndex.style.setProperty("--home-system-image-offset", `${imageOffset.toFixed(2)}px`);
  homeSystemIndex.style.setProperty("--home-system-text-cover", textProgress.toFixed(4));
}

updateHomeSystemIndexCover();
window.addEventListener("scroll", updateHomeSystemIndexCover, { passive: true });
window.addEventListener("resize", updateHomeSystemIndexCover);

if (memoryTabs.length > 0 && memoryPanes.length > 0) {
  for (const tab of memoryTabs) {
    tab.addEventListener("click", () => {
      const target = tab.dataset.memoryTab;

      for (const item of memoryTabs) {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      }

      let activePane = null;
      for (const pane of memoryPanes) {
        const isActive = pane.dataset.memoryPane === target;
        pane.classList.toggle("is-active", isActive);
        if (isActive) activePane = pane;
        if (!isActive) {
          for (const media of pane.querySelectorAll("video, audio")) {
            media.pause();
          }
        }
      }

      activePane
        ?.querySelector("[data-video-card]")
        ?.dispatchEvent(new Event("memory-preview:activate"));
    });
  }
}

for (const timeline of document.querySelectorAll("[data-timeline-points]")) {
  const points = [...timeline.querySelectorAll(".os-timeline-point")];
  const preview = timeline.querySelector("[data-timeline-preview]");
  const previewImage = preview?.querySelector("[data-timeline-preview-image]");
  const previewTime = preview?.querySelector("[data-timeline-preview-time]");
  let activePoint = null;

  if (!preview || !previewImage || !previewTime) continue;

  const showPreview = (point) => {
    activePoint?.classList.remove("is-active");
    activePoint = point;
    point.classList.add("is-active");

    const time = point.dataset.time || "";
    const source = point.dataset.previewSrc;
    if (source && previewImage.getAttribute("src") !== source) {
      previewImage.src = source;
    }
    previewImage.alt = time ? `Memory preview at ${time}` : "Memory preview";
    previewImage.style.objectPosition = point.dataset.previewPosition || "center";
    previewTime.textContent = time;
    preview.style.setProperty("--preview-x", point.style.getPropertyValue("--point-x"));
    preview.style.setProperty("--preview-y", point.style.getPropertyValue("--point-y"));
    preview.classList.add("is-visible");
  };

  const hidePreview = () => {
    const focusedPoint = points.find((point) => point === document.activeElement);
    if (focusedPoint) {
      showPreview(focusedPoint);
      return;
    }
    activePoint?.classList.remove("is-active");
    preview.classList.remove("is-visible");
    activePoint = null;
  };

  const findPointAt = (event) => {
    const bounds = timeline.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;

    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
    let nearestPoint = null;
    let nearestDistance = Infinity;

    for (const point of points) {
      const pointX = Number.parseFloat(point.style.getPropertyValue("--point-x"));
      const pointY = Number.parseFloat(point.style.getPropertyValue("--point-y"));
      if (!Number.isFinite(pointX) || !Number.isFinite(pointY)) continue;

      const hitX = Number.parseFloat(point.dataset.hitX) || 4.5;
      const hitY = Number.parseFloat(point.dataset.hitY) || 7;
      const zoneY = Number.parseFloat(point.dataset.zoneY) || pointY;
      const xDistance = (pointerX - pointX) / hitX;
      const yDistance = (pointerY - zoneY) / hitY;
      const distance = xDistance * xDistance + yDistance * yDistance;

      if (Math.abs(xDistance) <= 1 && Math.abs(yDistance) <= 1 && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = point;
      }
    }

    return nearestPoint;
  };

  timeline.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const point = findPointAt(event);
    timeline.classList.toggle("is-over-zone", Boolean(point));
    if (point) showPreview(point);
    else hidePreview();
  });

  timeline.addEventListener("pointerleave", () => {
    timeline.classList.remove("is-over-zone");
    hidePreview();
  });

  timeline.addEventListener("click", (event) => {
    const point = findPointAt(event);
    if (point) showPreview(point);
    else hidePreview();
  });

  for (const point of points) {
    point.addEventListener("focus", () => showPreview(point));
    point.addEventListener("blur", hidePreview);
  }
}

const memoryDateToggle = document.querySelector("[data-memory-date-toggle]");
const memoryDateMenu = document.querySelector("[data-memory-date-menu]");

if (memoryDateToggle && memoryDateMenu) {
  const dateLabel = memoryDateToggle.querySelector("[data-memory-date-label]");

  const setOpen = (open) => {
    memoryDateMenu.hidden = !open;
    memoryDateToggle.setAttribute("aria-expanded", String(open));
  };

  memoryDateToggle.addEventListener("click", () => {
    setOpen(memoryDateMenu.hidden);
  });

  for (const option of memoryDateMenu.querySelectorAll("button")) {
    option.addEventListener("click", () => {
      if (dateLabel) dateLabel.textContent = option.textContent.trim();
      for (const other of memoryDateMenu.querySelectorAll("button")) {
        other.setAttribute("aria-selected", String(other === option));
      }
      setOpen(false);
    });
  }

  document.addEventListener("click", (event) => {
    if (!memoryDateToggle.parentElement.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !memoryDateMenu.hidden) {
      setOpen(false);
      memoryDateToggle.focus();
    }
  });
}

// Breathing charts extracted from Figma: per memory, columns at exact x
// positions with cells at exact y offsets (percent of the 7.5rem plot).
// Colors: g grey #777777, m mid green #66835A, a acid #C5FFAE.
const breathCharts = {
  whale: [
    { x: 1.49, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 4.85, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 8.21, time: "00:01", value: 21, cells: [[56.7, "g"], [64.2, "g"]] },
    { x: 11.57, time: "00:02", value: 27, cells: [[40, "m"], [46.7, "m"], [56.7, "g"]] },
    { x: 14.93, time: "00:03", value: 21, cells: [[56.7, "g"], [64.2, "g"]] },
    { x: 18.28, time: "00:04", value: 21, cells: [[56.7, "g"]] },
    { x: 22.39, time: "00:05", value: 21, cells: [[56.7, "m"]] },
    { x: 23.88, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 25.37, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 26.87, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 28.36, time: "00:07", value: 23, cells: [[50, "m"], [56.7, "m"], [63.3, "m"]] },
    { x: 29.85, time: "00:07", value: 28, cells: [[36.7, "a"], [43.3, "a"], [50, "m"], [56.7, "m"]] },
    { x: 31.34, time: "00:06", value: 22, isDefault: true, cells: [[30, "a"], [36.7, "a"], [43.3, "a"], [50, "m"], [56.7, "a"], [67.5, "m"], [74.2, "m"]] },
    { x: 32.84, time: "00:08", value: 21, cells: [[56.7, "a"]] },
    { x: 34.33, time: "00:08", value: 23, cells: [[50, "a"], [56.7, "a"]] },
    { x: 35.82, time: "00:09", value: 31, cells: [[30, "a"], [36.7, "m"], [43.3, "m"], [50, "m"], [56.7, "m"], [66.7, "g"], [75, "g"], [83.3, "g"]] },
    { x: 37.31, time: "00:09", value: 21, cells: [[56.7, "m"]] },
    { x: 41.42, time: "00:10", value: 26, cells: [[43.3, "a"], [50, "m"], [57.5, "m"], [66.7, "g"], [75, "g"]] },
    { x: 44.78, time: "00:11", value: 26, cells: [[43.3, "m"], [50, "m"], [57.5, "g"]] },
    { x: 48.13, time: "00:12", value: 21, cells: [[57.5, "g"], [65, "g"], [74.2, "g"]] },
    { x: 51.49, time: "00:13", value: 26, cells: [[43.3, "m"], [50, "m"], [57.5, "g"], [65, "g"]] },
    { x: 54.85, time: "00:14", value: 23, cells: [[50.8, "m"], [57.5, "g"]] },
    { x: 58.21, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 60.07, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 61.94, time: "00:16", value: 28, cells: [[37.5, "a"], [44.2, "m"], [50.8, "g"], [57.5, "g"]] },
    { x: 63.81, time: "00:16", value: 26, cells: [[44.2, "m"], [50.8, "g"], [57.5, "g"]] },
    { x: 66.79, time: "00:17", value: 23, cells: [[50.8, "m"], [57.5, "g"]] },
    { x: 68.66, time: "00:18", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 70.52, time: "00:18", value: 21, cells: [[57.5, "g"]] },
    { x: 72.39, time: "00:19", value: 21, cells: [[57.5, "g"], [65, "g"]] },
    { x: 74.25, time: "00:19", value: 21, cells: [[57.5, "g"]] },
    { x: 76.12, time: "00:20", value: 21, cells: [[57.5, "g"]] },
    { x: 79.48, time: "00:21", value: 21, cells: [[57.5, "g"]] },
    { x: 82.84, time: "00:22", value: 21, cells: [[57.5, "g"]] },
    { x: 86.19, time: "00:22", value: 24, cells: [[47.5, "m"], [57.5, "g"]] },
    { x: 89.55, time: "00:23", value: 21, cells: [[57.5, "g"]] },
    { x: 92.91, time: "00:24", value: 21, cells: [[57.5, "g"]] },
  ],
  street: [
    { x: 1.49, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 4.85, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 8.21, time: "00:01", value: 21, cells: [[56.7, "g"]] },
    { x: 11.57, time: "00:02", value: 21, cells: [[56.7, "g"]] },
    { x: 14.93, time: "00:03", value: 24, cells: [[47.5, "g"], [56.7, "g"]] },
    { x: 18.28, time: "00:04", value: 21, cells: [[56.7, "g"]] },
    { x: 20.71, time: "00:05", value: 21, cells: [[56.7, "m"]] },
    { x: 22.2, time: "00:05", value: 21, cells: [[56.7, "m"]] },
    { x: 23.69, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 25.19, time: "00:06", value: 21, cells: [[56.7, "m"], [66.7, "g"]] },
    { x: 26.87, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 28.36, time: "00:07", value: 23, cells: [[50, "m"], [56.7, "m"], [63.3, "m"]] },
    { x: 29.85, time: "00:07", value: 26, cells: [[43.3, "m"], [50, "m"], [56.7, "m"]] },
    { x: 31.34, time: "00:08", value: 23, cells: [[50, "m"], [56.7, "m"], [67.5, "m"]] },
    { x: 32.84, time: "00:08", value: 26, cells: [[43.3, "a"], [50, "a"], [56.7, "m"]] },
    { x: 34.33, time: "00:08", value: 26, cells: [[43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 35.82, time: "00:09", value: 28, cells: [[36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "m"]] },
    { x: 37.31, time: "00:09", value: 26, cells: [[43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 38.81, time: "00:10", value: 28, cells: [[23.3, "a"], [30, "a"], [36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "a"], [66.7, "g"]] },
    { x: 40.3, time: "00:10", value: 33, cells: [[23.3, "a"], [30, "a"], [36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 41.79, time: "00:11", value: 28, isDefault: true, cells: [[16.7, "a"], [23.3, "a"], [30, "a"], [36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "a"], [66.7, "g"], [73.3, "g"]] },
    { x: 43.28, time: "00:11", value: 28, cells: [[36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 44.78, time: "00:11", value: 28, cells: [[36.7, "a"], [43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 46.27, time: "00:12", value: 26, cells: [[43.3, "a"], [50, "a"], [56.7, "a"]] },
    { x: 48.13, time: "00:12", value: 23, cells: [[50, "m"], [56.7, "g"], [65, "g"], [73.3, "g"]] },
    { x: 51.49, time: "00:13", value: 31, cells: [[30, "a"], [36.7, "a"], [43.3, "a"], [50, "m"], [57.5, "m"], [65, "g"]] },
    { x: 54.85, time: "00:14", value: 28, cells: [[36.7, "a"], [43.3, "a"], [50.8, "m"], [57.5, "m"]] },
    { x: 58.21, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 60.07, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 61.94, time: "00:16", value: 28, cells: [[37.5, "a"], [44.2, "a"], [50.8, "m"], [57.5, "g"]] },
    { x: 63.81, time: "00:16", value: 26, cells: [[44.2, "a"], [50.8, "m"], [57.5, "g"]] },
    { x: 66.79, time: "00:17", value: 23, cells: [[50.8, "m"], [57.5, "g"]] },
    { x: 68.66, time: "00:18", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 70.52, time: "00:18", value: 23, cells: [[50.8, "g"], [57.5, "g"], [65, "g"]] },
    { x: 72.39, time: "00:19", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 74.63, time: "00:19", value: 21, cells: [[57.5, "g"]] },
    { x: 76.87, time: "00:20", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 78.73, time: "00:20", value: 26, cells: [[44.2, "m"], [50.8, "g"], [57.5, "g"]] },
  ],
  studio: [
    { x: 1.49, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 4.85, time: "00:00", value: 21, cells: [[56.7, "g"]] },
    { x: 8.21, time: "00:01", value: 21, cells: [[56.7, "g"], [64.2, "g"]] },
    { x: 11.57, time: "00:02", value: 21, cells: [[56.7, "g"]] },
    { x: 14.93, time: "00:03", value: 21, cells: [[56.7, "g"], [64.2, "g"]] },
    { x: 18.28, time: "00:04", value: 21, cells: [[56.7, "g"]] },
    { x: 22.39, time: "00:05", value: 21, cells: [[56.7, "m"]] },
    { x: 23.88, time: "00:06", value: 21, cells: [[56.7, "m"]] },
    { x: 25.37, time: "00:06", value: 26, cells: [[42.5, "m"], [49.2, "m"], [56.7, "m"]] },
    { x: 26.87, time: "00:06", value: 29, cells: [[35.8, "a"], [42.5, "m"], [49.2, "m"], [56.7, "m"]] },
    { x: 28.36, time: "00:07", value: 29, cells: [[35.8, "a"], [43.3, "m"], [50, "m"], [56.7, "m"], [63.3, "m"]] },
    { x: 29.85, time: "00:07", value: 26, cells: [[43.3, "m"], [50, "m"], [56.7, "m"]] },
    { x: 31.34, time: "00:08", value: 26, cells: [[43.3, "m"], [50, "m"], [56.7, "a"], [67.5, "m"], [74.2, "m"]] },
    { x: 32.84, time: "00:08", value: 21, cells: [[56.7, "a"]] },
    { x: 34.33, time: "00:08", value: 23, cells: [[50, "a"], [56.7, "a"]] },
    { x: 35.82, time: "00:09", value: 19, isDefault: true, cells: [[36.7, "m"], [43.3, "m"], [50, "m"], [56.7, "m"]] },
    { x: 37.31, time: "00:09", value: 21, cells: [[56.7, "m"]] },
    { x: 41.42, time: "00:10", value: 26, cells: [[43.3, "a"], [50, "m"], [57.5, "m"]] },
    { x: 44.78, time: "00:11", value: 26, cells: [[43.3, "m"], [50, "m"], [57.5, "g"]] },
    { x: 48.13, time: "00:12", value: 21, cells: [[57.5, "g"], [65, "g"], [74.2, "g"]] },
    { x: 51.49, time: "00:13", value: 26, cells: [[43.3, "m"], [50, "m"], [57.5, "g"], [65, "g"]] },
    { x: 54.85, time: "00:14", value: 23, cells: [[50.8, "m"], [57.5, "g"]] },
    { x: 58.21, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 60.07, time: "00:15", value: 21, cells: [[57.5, "g"]] },
    { x: 61.94, time: "00:16", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 63.81, time: "00:16", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 66.79, time: "00:17", value: 23, cells: [[50.8, "m"], [57.5, "g"]] },
    { x: 68.66, time: "00:18", value: 23, cells: [[50.8, "g"], [57.5, "g"]] },
    { x: 70.52, time: "00:18", value: 21, cells: [[57.5, "g"]] },
    { x: 72.39, time: "00:19", value: 21, cells: [[57.5, "g"], [65, "g"]] },
    { x: 74.25, time: "00:19", value: 21, cells: [[57.5, "g"]] },
    { x: 76.12, time: "00:20", value: 21, cells: [[57.5, "g"]] },
    { x: 79.48, time: "00:21", value: 21, cells: [[57.5, "g"]] },
    { x: 82.84, time: "00:22", value: 21, cells: [[57.5, "g"]] },
    { x: 86.19, time: "00:22", value: 24, cells: [[47.5, "m"], [57.5, "g"]] },
    { x: 89.55, time: "00:23", value: 21, cells: [[57.5, "g"]] },
    { x: 92.91, time: "00:24", value: 21, cells: [[57.5, "g"]] },
  ],
};

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const s = Math.floor(seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatVideoClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00";
  const s = Math.round(seconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function setupSignificanceCurve(card) {
  const curve = card.querySelector(".os-significance__curve-svg");
  const trace = card.querySelector("[data-significance-trace]");
  if (!curve || !trace) return null;

  const cardStyle = getComputedStyle(card);
  const curveStart =
    Number.parseFloat(cardStyle.getPropertyValue("--sig-left")) || 0;
  const curveWidth =
    (Number.parseFloat(cardStyle.getPropertyValue("--sig-w")) || 1) * 100;
  let traceStart = curveStart;
  let traceEnd = curveStart + curveWidth;
  for (const segment of card.querySelectorAll(".os-significance__seg")) {
    const segmentStart = Number.parseFloat(segment.style.left) || 0;
    const segmentWidth = Number.parseFloat(segment.style.width) || 0;
    traceStart = Math.min(traceStart, segmentStart);
    traceEnd = Math.max(traceEnd, segmentStart + segmentWidth);
  }

  const applyProgress = (progress) => {
    const pct = Math.min(Math.max(progress, 0), 1);
    const revealEdge = traceStart + pct * (traceEnd - traceStart);
    trace.style.clipPath =
      `inset(-20% ${(100 - revealEdge).toFixed(2)}% -20% -2%)`;
  };

  applyProgress(0);
  return applyProgress;
}

// Pause every other piece of memory-lab media (videos, video audio tracks,
// soundscapes) so only one thing plays at a time.
function pauseOtherMemoryMedia(except = []) {
  for (const media of document.querySelectorAll(
    ".os-memory-pane video, .os-memory-pane audio",
  )) {
    if (!except.includes(media)) media.pause();
  }
}

function setupSoundCard(card) {
  const audio = card.querySelector("[data-sound-audio]");
  const playBtn = card.querySelector("[data-sound-play]");
  const currentEl = card.querySelector("[data-sound-current]");
  const playhead = card.querySelector("[data-sound-playhead]");

  if (!audio) return;

  const total = parseFloat(card.dataset.soundTotal || "25");
  const segStart = parseFloat(card.dataset.soundStart || "0");
  const segEnd = parseFloat(card.dataset.soundEnd || String(total));
  const initial = parseFloat(card.dataset.soundInitial || String(segStart));

  card.style.setProperty(
    "--seg-left",
    `${((segStart / total) * 100).toFixed(2)}%`,
  );
  card.style.setProperty(
    "--seg-right",
    `${(((total - segEnd) / total) * 100).toFixed(2)}%`,
  );

  if (playhead) {
    playhead.style.setProperty(
      "--playhead-x",
      `${((initial / total) * 100).toFixed(2)}%`,
    );
  }

  const setPlaying = (playing) => {
    if (playing) card.setAttribute("data-sound-playing", "");
    else card.removeAttribute("data-sound-playing");
    if (playBtn) {
      playBtn.setAttribute(
        "aria-label",
        playing ? "Pause soundscape" : "Play soundscape",
      );
    }
  };

  const updateFromCurrentTime = (t) => {
    if (currentEl) currentEl.textContent = formatVideoTime(t);
    if (playhead) {
      playhead.style.setProperty(
        "--playhead-x",
        `${((t / total) * 100).toFixed(2)}%`,
      );
    }
    card.setAttribute("data-sound-progress", t.toFixed(2));
  };

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        pauseOtherMemoryMedia([audio]);
        if (audio.currentTime < segStart || audio.currentTime >= segEnd) {
          audio.currentTime = segStart;
        }
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
  }

  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime >= segEnd) {
      audio.pause();
      audio.currentTime = segEnd;
      updateFromCurrentTime(segEnd);
      return;
    }
    updateFromCurrentTime(audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    audio.currentTime = segStart;
    setPlaying(false);
  });
}

for (const card of document.querySelectorAll("[data-sound-card]")) {
  setupSoundCard(card);
}

for (const card of document.querySelectorAll("[data-video-card]")) {
  const video = card.querySelector("[data-video-source]");
  // Whale and studio pair a muted video with a separate audio track; the
  // protest video carries its own audio and is unmuted on the play gesture.
  const audio = card.querySelector("[data-video-audio]");
  const playBtn = card.querySelector("[data-video-play]");
  const muteBtn = card.querySelector("[data-video-mute]");
  const timeEl = card.querySelector("[data-video-time]");

  if (!video) continue;

  const soundTarget = audio ?? video;
  let muted = true;
  soundTarget.muted = true;
  if (muteBtn) {
    muteBtn.style.opacity = "0.4";
    muteBtn.setAttribute("aria-label", "Unmute memory preview");
  }
  let applyProgress = () => {};
  let progressFrame = null;
  const significanceDuration =
    Number.parseFloat(card.dataset.significanceDuration) || 0;
  const significanceLead =
    Number.parseFloat(card.dataset.significanceLead) || 0;
  const syncVideoProgress = () => {
    const duration = significanceDuration || video.duration;
    if (duration > 0) {
      applyProgress((video.currentTime + significanceLead) / duration);
    }
  };
  const stopProgressLoop = () => {
    if (progressFrame === null) return;
    cancelAnimationFrame(progressFrame);
    progressFrame = null;
  };
  const runProgressLoop = () => {
    syncVideoProgress();
    if (video.paused || video.ended) {
      progressFrame = null;
      return;
    }
    progressFrame = requestAnimationFrame(runProgressLoop);
  };
  const startProgressLoop = () => {
    stopProgressLoop();
    runProgressLoop();
  };
  applyProgress = setupSignificanceCurve(card) ?? applyProgress;
  syncVideoProgress();

  const setPlayingState = (playing) => {
    if (playing) card.setAttribute("data-video-playing", "");
    else card.removeAttribute("data-video-playing");
    if (playBtn) {
      playBtn.setAttribute(
        "aria-label",
        playing ? "Pause memory preview" : "Play memory preview",
      );
    }
  };

  if (timeEl) {
    video.addEventListener(
      "loadedmetadata",
      () => {
        timeEl.textContent = formatVideoClock(video.duration);
      },
      { once: true },
    );
  }

  video.addEventListener("timeupdate", () => {
    if (timeEl) timeEl.textContent = formatVideoClock(video.currentTime);
    syncVideoProgress();
  });

  video.addEventListener("play", () => {
    setPlayingState(true);
    startProgressLoop();
  });
  video.addEventListener("pause", () => {
    setPlayingState(false);
    stopProgressLoop();
    syncVideoProgress();
  });
  video.addEventListener("ended", () => {
    stopProgressLoop();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingState(false);
    applyProgress(0);
  });

  card.addEventListener("memory-preview:activate", () => {
    pauseOtherMemoryMedia([video]);
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    muted = true;
    soundTarget.muted = true;
    if (audio) audio.currentTime = 0;
    if (muteBtn) {
      muteBtn.style.opacity = "0.4";
      muteBtn.setAttribute("aria-label", "Unmute memory preview");
    }
    applyProgress(0);
    video.play().catch(() => {});
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (video.paused) {
        pauseOtherMemoryMedia(audio ? [video, audio] : [video]);
        if (!audio) video.muted = muted;
        video.play().catch(() => {});
        if (audio) {
          audio.currentTime = video.currentTime;
          audio.play().catch(() => {});
        }
      } else {
        video.pause();
        if (audio) audio.pause();
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      muted = !muted;
      soundTarget.muted = muted;
      if (audio && !muted && !video.paused) {
        audio.currentTime = video.currentTime;
        audio.play().catch(() => {});
      }
      muteBtn.style.opacity = muted ? "0.4" : "1";
      muteBtn.setAttribute(
        "aria-label",
        muted ? "Unmute memory preview" : "Mute memory preview",
      );
    });
  }
}

const memoryLabContent = document.querySelector(".os-memory-lab__inner");
if (memoryLabContent) {
  let wasVisible = false;
  const memoryLabObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !wasVisible) {
        document
          .querySelector(".os-memory-pane.is-active [data-video-card]")
          ?.dispatchEvent(new Event("memory-preview:activate"));
      } else if (!entry.isIntersecting && wasVisible) {
        pauseOtherMemoryMedia();
      }
      wasVisible = entry.isIntersecting;
    },
    { threshold: 0.01 },
  );
  memoryLabObserver.observe(memoryLabContent);
}

for (const card of document.querySelectorAll("[data-breath-card]")) {
  const memory = card.dataset.breathCard;
  const columns = breathCharts[memory];
  const plot = card.querySelector(".os-breath-chart__plot");
  const tooltip = card.querySelector(".os-breath-chart__tooltip");
  if (!columns || !plot) continue;

  let defaultColumn = null;

  for (const column of columns) {
    const columnElement = document.createElement("span");
    const terminalY = Math.min(...column.cells.map(([y]) => y));
    columnElement.className = "os-br-column";
    columnElement.style.setProperty("--x", column.x + "%");
    columnElement.dataset.time = column.time;
    columnElement.dataset.top = terminalY;
    if (column.isDefault) {
      columnElement.classList.add("is-default");
      defaultColumn = columnElement;
    }
    for (const [y, color] of column.cells) {
      const cell = document.createElement("span");
      cell.className = `os-br-cell os-br-cell--${color}`;
      if (y === terminalY) cell.classList.add("os-br-cell--terminal");
      cell.style.setProperty("--cell-y", y + "%");
      columnElement.appendChild(cell);
    }
    plot.appendChild(columnElement);
  }

  const showColumn = (col) => {
    plot.style.setProperty("--active-x", col.style.getPropertyValue("--x"));
    plot.style.setProperty("--active-top", col.dataset.top + "%");
    if (tooltip) tooltip.textContent = col.dataset.time;
  };

  if (defaultColumn) {
    showColumn(defaultColumn);
    plot.classList.add("is-default-visible");
  }
}

for (const card of document.querySelectorAll("[data-bpm-card]")) {
  const plot = card.querySelector(".os-heart-chart__plot");
  const defaultPoint = card.querySelector(".os-bpm-point.is-default");
  if (!plot || !defaultPoint) continue;

  plot.style.setProperty(
    "--active-x",
    defaultPoint.style.getPropertyValue("--x"),
  );
  plot.style.setProperty(
    "--active-y",
    defaultPoint.style.getPropertyValue("--y"),
  );
}

for (const point of document.querySelectorAll(".os-bpm-point, .os-temp-point")) {
  point.tabIndex = -1;
  point.setAttribute("aria-hidden", "true");
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

if (typewriterTexts.length > 0) {
  const typewriterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-typewriter-active", entry.isIntersecting);
      }
    },
    { threshold: 0.58 },
  );

  for (const element of typewriterTexts) {
    typewriterObserver.observe(element);
  }
}

if (scrambleTypewriterTexts.length > 0) {
  const scrambleSection = scrambleTypewriterTexts[0].closest(".home-remember");
  let scrambleSequenceTimer = 0;
  let scrambleLabelTimers = [];
  let scrambleSectionVisible = false;

  const stopScrambleSequence = () => {
    window.clearTimeout(scrambleSequenceTimer);
    scrambleSequenceTimer = 0;
    for (const timer of scrambleLabelTimers) window.clearTimeout(timer);
    scrambleLabelTimers = [];

    for (const element of scrambleTypewriterTexts) {
      element.classList.remove("is-green-active");
      resetScrambleTypewriter(element);
    }
  };

  const runScrambleSequence = () => {
    for (const timer of scrambleLabelTimers) window.clearTimeout(timer);
    scrambleLabelTimers = [...scrambleTypewriterTexts].map((element, index) =>
      window.setTimeout(() => {
        element.classList.add("is-green-active");
        playScrambleTypewriter(element);
      }, index * 350),
    );

    scrambleSequenceTimer = window.setTimeout(runScrambleSequence, 5200);
  };

  const syncScrambleSequence = () => {
    stopScrambleSequence();

    if (scrambleSectionVisible && scrambleSection?.classList.contains("is-title-revealed")) {
      scrambleSequenceTimer = window.setTimeout(runScrambleSequence, 0);
    }
  };

  const scrambleObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        scrambleSectionVisible = entry.isIntersecting;
        syncScrambleSequence();
      }
    },
    { threshold: 0.45 },
  );

  if (scrambleSection) {
    scrambleSection.addEventListener("home-remember:title-state", syncScrambleSequence);
    scrambleObserver.observe(scrambleSection);
  }
}

if (standaloneScrambleTexts.length > 0) {
  const standaloneScrambleObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        playScrambleTypewriter(entry.target);
        standaloneScrambleObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.65 },
  );

  for (const element of standaloneScrambleTexts) {
    standaloneScrambleObserver.observe(element);
  }
}

function setupHomeProcessCharacterReveal(item) {
  const visual = item.querySelector(".home-process__visual");
  const source = visual?.querySelector("img:first-child");
  if (!visual || !source) return null;

  const state = { characters: [], source, visual, started: false, ready: null };
  visual.classList.add("has-character-reveal");

  state.ready = fetch(source.src)
    .then((response) => {
      if (!response.ok) throw new Error("Could not load ASCII artwork");
      return response.text();
    })
    .then((markup) => {
      const documentNode = new DOMParser().parseFromString(markup, "image/svg+xml");
      const svg = documentNode.documentElement;
      if (svg.nodeName.toLowerCase() !== "svg") throw new Error("Invalid ASCII artwork");

      svg.classList.add("home-process__character-reveal");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("preserveAspectRatio", "none");

      state.characters = [...svg.querySelectorAll("path")];
      for (const character of state.characters) character.style.opacity = "0";

      visual.appendChild(document.importNode(svg, true));
      state.characters = [...visual.querySelectorAll(".home-process__character-reveal path")];
    })
    .catch(() => {
      visual.classList.remove("has-character-reveal");
    });

  return state;
}

async function playHomeProcessCharacterReveal(item, state) {
  if (!state || state.started) return;
  state.started = true;
  await state.ready;

  const characters = [...state.characters];
  if (characters.length === 0) {
    item.classList.add("is-process-active");
    return;
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  const duration = 200;
  const startedAt = performance.now();
  let revealed = 0;

  const draw = (now) => {
    const target = Math.ceil(Math.min((now - startedAt) / duration, 1) * characters.length);

    for (; revealed < target; revealed += 1) {
      characters[revealed].style.opacity = "1";
    }

    if (revealed < characters.length) {
      requestAnimationFrame(draw);
    } else {
      window.setTimeout(() => {
        const photo = item.querySelector(".home-process__visual img + img");

        if (photo) {
          photo.style.opacity = "0";
          void photo.offsetWidth;
          photo.style.removeProperty("opacity");
        }

        requestAnimationFrame(() => item.classList.add("is-process-active"));
      }, 120);
    }
  };

  requestAnimationFrame(draw);
}

if (homeProcessItems.length > 0) {
  const characterRevealStates = new WeakMap();

  for (const item of homeProcessItems) {
    characterRevealStates.set(item, setupHomeProcessCharacterReveal(item));
  }

  const homeProcessObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        playHomeProcessCharacterReveal(entry.target, characterRevealStates.get(entry.target));
        homeProcessObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.42 },
  );

  for (const item of homeProcessItems) {
    homeProcessObserver.observe(item);
  }
}

const productScene = document.querySelector("[data-product-scene]");
const productCutoutScene = document.querySelector("[data-product-cutout-scene]");

if (productScene) {
  loadThree().then(() => setupProductScene(productScene));
}

if (productCutoutScene) {
  setupProductCutoutScene(productCutoutScene);
}

setupPartThumbnails();

async function loadThree() {
  if (THREE && GLTFLoader) return;

  const [threeModule, loaderModule] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
  ]);

  THREE = threeModule;
  GLTFLoader = loaderModule.GLTFLoader;
}

function setupProductCutoutScene(figure) {
  const scene = figure.querySelector(".product-cutout-scene");
  const hotspots = figure.querySelectorAll("[data-part-hotspot]");
  const cards = new Map(
    Array.from(document.querySelectorAll("[data-part-card]")).map((card) => [
      card.dataset.partCard,
      card,
    ]),
  );
  const useScrollExplosion = !window.matchMedia("(max-width: 760px)").matches;

  function updateProgress() {
    if (!scene) return;

    const progress = useScrollExplosion ? getExplosionProgress(figure) : 1;
    scene.style.setProperty("--explode-progress", progress.toFixed(4));
  }

  for (const hotspot of hotspots) {
    hotspot.addEventListener("pointerenter", (event) => {
      setActivePart(hotspot.dataset.partHotspot, cards);
      movePartCardToPointer(hotspot.dataset.partHotspot, cards, figure, event);
    });
    hotspot.addEventListener("pointermove", (event) => {
      movePartCardToPointer(hotspot.dataset.partHotspot, cards, figure, event);
    });
    hotspot.addEventListener("focus", () => {
      setActivePart(hotspot.dataset.partHotspot, cards);
    });
    hotspot.addEventListener("pointerleave", () => {
      setActivePart(null, cards);
    });
    hotspot.addEventListener("blur", () => {
      setActivePart(null, cards);
      resetPartCardPosition(hotspot.dataset.partHotspot, cards);
    });
  }

  figure.classList.add("is-cutout-ready");
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function movePartCardToPointer(part, cards, figure, event) {
  const card = cards.get(part);
  const wrap = card?.closest(".part-card-wrap");

  if (!card || !wrap || !figure || !event) return;

  const figureRect = figure.getBoundingClientRect();
  const cardWidth = card.offsetWidth || 340;
  const cardHeight = card.offsetHeight || 141;
  const gutter = 12;
  const pointerOffset = 18;
  const rawX = event.clientX - figureRect.left + pointerOffset;
  const rawY = event.clientY - figureRect.top - cardHeight / 2;
  const x = Math.min(Math.max(rawX, gutter), figureRect.width - cardWidth - gutter);
  const y = Math.min(Math.max(rawY, gutter), figureRect.height - cardHeight - gutter);

  wrap.classList.add("is-following-pointer");
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;
  wrap.style.right = "auto";
}

function resetPartCardPosition(part, cards) {
  const card = cards.get(part);
  const wrap = card?.closest(".part-card-wrap");

  if (!wrap) return;

  wrap.classList.remove("is-following-pointer");
  wrap.style.left = "";
  wrap.style.top = "";
  wrap.style.right = "";
}

function setupTextureCardHover(card) {
  const label = card.querySelector(".texture-card__label");
  const stack = card.closest(".texture-stack");

  if (!label || !stack) return;

  card.addEventListener("pointerenter", (event) => {
    moveTextureLabelToPointer(card, label, stack, event);
  });

  card.addEventListener("pointermove", (event) => {
    moveTextureLabelToPointer(card, label, stack, event);
  });

  card.addEventListener("focus", () => {
    label.classList.remove("is-following-pointer");
    label.style.left = "";
    label.style.top = "";
  });
}

function moveTextureLabelToPointer(card, label, stack, event) {
  const cardRect = card.getBoundingClientRect();
  const stackRect = stack.getBoundingClientRect();
  const labelWidth = label.offsetWidth || 150;
  const labelHeight = label.offsetHeight || 70;
  const gutter = 10;
  const pointerOffset = 16;
  const minX = stackRect.left - cardRect.left + gutter;
  const maxX = stackRect.right - cardRect.left - labelWidth - gutter;
  const minY = stackRect.top - cardRect.top + gutter;
  const maxY = stackRect.bottom - cardRect.top - labelHeight - gutter;
  const rawX = event.clientX - cardRect.left + pointerOffset;
  const rawY = event.clientY - cardRect.top - labelHeight / 2;
  const x = Math.min(Math.max(rawX, minX), maxX);
  const y = Math.min(Math.max(rawY, minY), maxY);

  label.classList.add("is-following-pointer");
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
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

  const progress = getExplosionProgress(figure);

  for (const part of parts) {
    part.group.position.lerpVectors(part.assembledPosition, part.explodedPosition, progress);
  }
}

function getExplosionProgress(figure) {
  if (!figure) return 1;

  const section = figure.closest(".product-system");
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const startOffset = viewportHeight * 0.02;
  const scrollDistance = viewportHeight * 0.18;
  const raw = (Math.max(-rect.top, 0) - startOffset) / scrollDistance;

  return smoothstep(Math.min(Math.max(raw, 0), 1));
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
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
    const isActive = key === part;
    const wasActive = card.classList.contains("is-active");

    card.classList.toggle("is-active", isActive);

    if (isActive && !wasActive) {
      activateProgressLine(card);
    }

    if (!isActive) {
      resetProgressLine(card);
    }
  }
}

function activateProgressLine(card) {
  const line = card.querySelector(".progress-line");

  if (!line) return;

  line.style.transition = "none";
  line.style.transform = "scaleX(0)";
  void line.offsetWidth;
  line.style.transition = "transform 5s linear, opacity 0.3s";
  line.style.transform = "scaleX(1)";
}

function resetProgressLine(card) {
  const line = card.querySelector(".progress-line");

  if (!line) return;

  line.style.transition = "none";
  line.style.transform = "scaleX(0)";
  void line.offsetWidth;
  line.style.transition = "transform 5s linear, opacity 0.3s";
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
