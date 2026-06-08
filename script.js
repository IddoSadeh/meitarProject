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
