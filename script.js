const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll("[data-go-slide]")];
let slideIndex = 0;

function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === slideIndex));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === slideIndex));
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => showSlide(Number(dot.dataset.goSlide)));
});

setInterval(() => showSlide(slideIndex + 1), 5000);

document.querySelectorAll(".visit-segment button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".visit-segment button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

document.querySelectorAll(".locator-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".locator-tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

const dialog = document.querySelector(".scheme-dialog");
const schemeSection = document.querySelector(".schemes");
const schemeToggles = [...document.querySelectorAll("[data-scheme-toggle]")];

function setSchemesExpanded(expanded) {
  schemeSection.classList.toggle("expanded", expanded);
  schemeToggles.forEach((button) => {
    const label = button.querySelector("span");
    if (label) label.textContent = expanded ? "See less" : "View more";
    button.setAttribute("aria-expanded", String(expanded));
  });
}

schemeToggles.forEach((button) => {
  button.addEventListener("click", () => setSchemesExpanded(!schemeSection.classList.contains("expanded")));
});

const faqSection = document.querySelector(".faq");
const faqToggle = document.querySelector("[data-faq-toggle]");

if (faqSection && faqToggle) {
  faqToggle.addEventListener("click", () => {
    const expanded = faqSection.classList.toggle("expanded");
    const label = faqToggle.querySelector("span");
    if (label) label.textContent = expanded ? "See less" : "View more";
    faqToggle.setAttribute("aria-expanded", String(expanded));
  });
}

document.querySelectorAll(".scheme-grid article .learn-link").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("article");
    const cardImage = card.querySelector(".scheme-media img");
    const dialogImage = dialog.querySelector(".scheme-dialog-media img");
    dialog.querySelector("h2").textContent = card.dataset.scheme;
    dialog.querySelector(".scheme-detail").textContent = card.dataset.detail;
    dialog.querySelector(".scheme-summary").textContent = card.dataset.summary;
    if (cardImage && dialogImage) {
      dialogImage.src = cardImage.currentSrc || cardImage.src;
      dialogImage.alt = cardImage.alt;
    }
    const highlights = dialog.querySelector(".scheme-highlights");
    highlights.innerHTML = "";
    (card.dataset.highlights || "").split("|").filter(Boolean).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      highlights.appendChild(li);
    });
    dialog.showModal();
  });
});

document.querySelector(".close-dialog").addEventListener("click", () => dialog.close());

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
menuButton.addEventListener("click", () => {
  mobileMenu.hidden = !mobileMenu.hidden;
});

const dropdowns = [...document.querySelectorAll(".language-menu")];
dropdowns.forEach((dropdown) => {
  const button = dropdown.querySelector("button");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));

    dropdowns.forEach((other) => {
      if (other !== dropdown) {
        other.classList.remove("open");
        other.querySelector("button").setAttribute("aria-expanded", "false");
      }
    });
  });
});

document.querySelectorAll(".nav-menu > button").forEach((button) => {
  button.addEventListener("click", () => button.blur());
});

document.addEventListener("click", (event) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      dropdown.querySelector("button").setAttribute("aria-expanded", "false");
    }
  });
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => event.preventDefault());
});

const auroraCanvas = document.querySelector(".aurora-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (auroraCanvas) {
  const context = auroraCanvas.getContext("2d", { alpha: true });
  const colors = ["#292075", "#00a9e0", "#075aa0"];
  let width = 0;
  let height = 0;
  let frame = 0;

  function resizeAurora() {
    const rect = auroraCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width * dpr));
    height = Math.max(1, Math.floor(rect.height * dpr));
    auroraCanvas.width = width;
    auroraCanvas.height = height;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBand(time, offset, amplitude, alpha, colorShift) {
    const cssWidth = auroraCanvas.clientWidth;
    const cssHeight = auroraCanvas.clientHeight;
    const gradient = context.createLinearGradient(0, 0, cssWidth, 0);
    gradient.addColorStop(0, colors[colorShift % colors.length]);
    gradient.addColorStop(0.5, colors[(colorShift + 1) % colors.length]);
    gradient.addColorStop(1, colors[(colorShift + 2) % colors.length]);

    context.beginPath();
    context.moveTo(0, cssHeight);

    for (let x = 0; x <= cssWidth + 8; x += 8) {
      const progress = x / cssWidth;
      const wave =
        Math.sin(progress * Math.PI * 2.1 + time * 0.72 + offset) * amplitude +
        Math.sin(progress * Math.PI * 5.4 - time * 0.38 + offset * 0.7) * amplitude * 0.32;
      const base = cssHeight * (0.34 + offset * 0.045);
      context.lineTo(x, base + wave);
    }

    context.lineTo(cssWidth, cssHeight);
    context.closePath();
    context.globalAlpha = alpha;
    context.fillStyle = gradient;
    context.fill();
  }

  function drawAurora(timestamp = 0) {
    const cssWidth = auroraCanvas.clientWidth;
    const cssHeight = auroraCanvas.clientHeight;
    const time = timestamp * 0.001;

    context.clearRect(0, 0, cssWidth, cssHeight);
    context.globalCompositeOperation = "source-over";

    const base = context.createLinearGradient(0, 0, cssWidth, cssHeight);
    base.addColorStop(0, "#292075");
    base.addColorStop(0.48, "#075aa0");
    base.addColorStop(1, "#00a9e0");
    context.fillStyle = base;
    context.fillRect(0, 0, cssWidth, cssHeight);

    context.globalCompositeOperation = "lighter";
    drawBand(time, 0.8, cssHeight * 0.09, 0.38, 0);
    drawBand(time, 2.2, cssHeight * 0.12, 0.28, 1);
    drawBand(time, 3.4, cssHeight * 0.07, 0.2, 2);

    const glow = context.createRadialGradient(cssWidth * 0.18, cssHeight * 0.28, 0, cssWidth * 0.18, cssHeight * 0.28, cssWidth * 0.48);
    glow.addColorStop(0, "rgba(0,181,239,.32)");
    glow.addColorStop(1, "rgba(0,181,239,0)");
    context.globalAlpha = 1;
    context.fillStyle = glow;
    context.fillRect(0, 0, cssWidth, cssHeight);

    if (!reduceMotion) {
      frame = requestAnimationFrame(drawAurora);
    }
  }

  if (context) {
    resizeAurora();
    drawAurora();
    window.addEventListener("resize", () => {
      resizeAurora();
      if (reduceMotion) drawAurora();
    });
  }
}

if (window.lucide) {
  window.lucide.createIcons();
}
