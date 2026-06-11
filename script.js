const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll("[data-go-slide]")];
const carouselToggles = [...document.querySelectorAll("[data-carousel-toggle]")];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
let slideIndex = 0;
let heroTimer = null;
let heroPausedByUser = false;
let heroPausedByInteraction = false;

function onMotionPreferenceChange(callback) {
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", callback);
  } else {
    motionQuery.addListener(callback);
  }
}

function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === slideIndex);
    slide.classList.toggle("is-before", i < slideIndex);
    slide.classList.toggle("is-after", i > slideIndex);
  });
  dots.forEach((dot) => dot.classList.toggle("active", Number(dot.dataset.goSlide) === slideIndex));
}

function canAutoPlayHero() {
  return slides.length > 1 && !motionQuery.matches && !heroPausedByUser && !heroPausedByInteraction && document.visibilityState === "visible";
}

function stopHeroAutoPlay() {
  if (!heroTimer) return;
  window.clearInterval(heroTimer);
  heroTimer = null;
}

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  if (!canAutoPlayHero()) return;
  heroTimer = window.setInterval(() => showSlide(slideIndex + 1), 5000);
}

function syncCarouselToggle() {
  if (!carouselToggles.length) return;
  carouselToggles.forEach((carouselToggle) => {
    carouselToggle.setAttribute("aria-label", heroPausedByUser ? "Play carousel" : "Pause carousel");
    carouselToggle.innerHTML = heroPausedByUser
      ? '<i data-lucide="play" aria-hidden="true"></i>'
      : '<i data-lucide="pause" aria-hidden="true"></i>';
  });
  window.lucide?.createIcons();
}

function setHeroInteractionPaused(paused) {
  heroPausedByInteraction = paused;
  hero?.classList.toggle("is-paused", heroPausedByUser || heroPausedByInteraction);
  if (paused) {
    stopHeroAutoPlay();
  } else {
    startHeroAutoPlay();
  }
}

function setHeroUserPaused(paused) {
  heroPausedByUser = paused;
  hero?.classList.toggle("is-paused", heroPausedByUser || heroPausedByInteraction);
  syncCarouselToggle();
  if (paused) {
    stopHeroAutoPlay();
  } else {
    startHeroAutoPlay();
  }
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.goSlide));
    startHeroAutoPlay();
  });
});

carouselToggles.forEach((carouselToggle) => {
  carouselToggle.addEventListener("click", () => setHeroUserPaused(!heroPausedByUser));
});
showSlide(0);
syncCarouselToggle();

if (hero) {
  hero.addEventListener("mouseenter", () => setHeroInteractionPaused(true));
  hero.addEventListener("mouseleave", () => setHeroInteractionPaused(false));
  hero.addEventListener("focusin", () => setHeroInteractionPaused(true));
  hero.addEventListener("focusout", (event) => {
    if (!hero.contains(event.relatedTarget)) setHeroInteractionPaused(false);
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHeroAutoPlay();
  } else {
    startHeroAutoPlay();
  }
});

onMotionPreferenceChange(startHeroAutoPlay);
startHeroAutoPlay();

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

const quizView = dialog.querySelector("[data-quiz-view]");
const detailsView = dialog.querySelector("[data-details-view]");
const quizStepLabel = dialog.querySelector("[data-quiz-step-label]");
const quizProgress = dialog.querySelector("[data-quiz-progress]");
const quizQuestion = dialog.querySelector("[data-quiz-question]");
const quizOptions = dialog.querySelector("[data-quiz-options]");
const dialogModeLabel = dialog.querySelector("[data-dialog-mode-label]");
const eligibilityResult = dialog.querySelector("[data-eligibility-result]");
const skipQuizButton = dialog.querySelector("[data-skip-quiz]");
const checkAgainButton = dialog.querySelector("[data-check-again]");
const schemeProfiles = {
  "PM Jan Dhan Yojana": "general",
  "PM Kisan Samman Nidhi": "farmer",
  "MUDRA Loan": "business",
  "Atal Pension Yojana": "pension",
  "Sukanya Samriddhi": "girl-child",
  "PMSBY / PMJJBY": "insurance",
  "Stand-Up India": "entrepreneur"
};
const quizQuestions = [
  {
    text: "Do you have basic KYC documents such as Aadhaar, PAN/Form 60 or address proof?",
    options: [
      { label: "Yes, I have them ready", score: 30 },
      { label: "I have some documents", score: 18 },
      { label: "Not right now", score: 6 }
    ]
  },
  {
    text: "Which profile best matches you?",
    options: [
      { label: "General banking customer", profile: "general" },
      { label: "Farmer or agricultural household", profile: "farmer" },
      { label: "Small business owner", profile: "business" },
      { label: "Retirement planner", profile: "pension" },
      { label: "Parent or guardian of a girl child", profile: "girl-child" },
      { label: "Insurance cover seeker", profile: "insurance" },
      { label: "First-time eligible entrepreneur", profile: "entrepreneur" }
    ]
  },
  {
    text: "Do you already have a bank account that can receive benefits or auto-debits?",
    options: [
      { label: "Yes, I have an active account", score: 30 },
      { label: "I need help linking or updating it", score: 18 },
      { label: "No, I need to open one", score: 10 }
    ]
  }
];
let activeSchemeCard = null;
let quizStep = 0;
let quizScore = 0;

function getEligibilityColor(score) {
  if (score >= 70) return "var(--success)";
  if (score >= 45) return "var(--warning)";
  return "var(--error)";
}

function getEligibilityLabel(score) {
  if (score >= 70) return "Strong match";
  if (score >= 45) return "Partial match";
  return "Low match";
}

function renderEligibilityMeter(target, score) {
  const color = getEligibilityColor(score);
  target.hidden = false;
  target.style.setProperty("--score", `${score}%`);
  target.style.setProperty("--score-color", color);
  target.innerHTML = `
    <b><span>Eligibility match</span><span>${score}%</span></b>
    <div class="eligibility-track"><span></span></div>
    <small>${getEligibilityLabel(score)}</small>
  `;
}

function populateSchemeDialog(card) {
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
}

function showSchemeDetails({ skipped = false, completed = false, score = null } = {}) {
  dialogModeLabel.textContent = "Scheme details";
  quizView.hidden = true;
  detailsView.hidden = false;
  checkAgainButton.hidden = completed || !skipped;
  if (score === null) {
    eligibilityResult.hidden = true;
    return;
  }
  renderEligibilityMeter(eligibilityResult, score);
  if (activeSchemeCard) {
    activeSchemeCard.classList.add("has-eligibility");
    renderEligibilityMeter(activeSchemeCard.querySelector(".eligibility-meter"), score);
  }
}

function getQuestionScore(option) {
  if (typeof option.score === "number") return option.score;
  const expectedProfile = schemeProfiles[activeSchemeCard?.dataset.scheme] || "general";
  return option.profile === expectedProfile ? 40 : 16;
}

function renderQuizStep() {
  const question = quizQuestions[quizStep];
  quizStepLabel.textContent = `Step ${quizStep + 1} of ${quizQuestions.length}`;
  quizProgress.style.setProperty("--progress", `${((quizStep + 1) / quizQuestions.length) * 100}%`);
  quizQuestion.textContent = question.text;
  quizOptions.innerHTML = "";
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span>${option.label}</span><i data-lucide="chevron-right" aria-hidden="true"></i>`;
    button.addEventListener("click", () => {
      quizScore += getQuestionScore(option);
      if (quizStep < quizQuestions.length - 1) {
        quizStep += 1;
        renderQuizStep();
      } else {
        showSchemeDetails({ completed: true, score: Math.min(100, quizScore) });
      }
      window.lucide?.createIcons();
    });
    quizOptions.appendChild(button);
  });
  window.lucide?.createIcons();
}

function startEligibilityQuiz(card) {
  activeSchemeCard = card;
  quizStep = 0;
  quizScore = 0;
  populateSchemeDialog(card);
  dialogModeLabel.textContent = "3-step eligibility quiz";
  detailsView.hidden = true;
  quizView.hidden = false;
  eligibilityResult.hidden = true;
  renderQuizStep();
  if (!dialog.open) dialog.showModal();
}

document.querySelectorAll(".scheme-grid article .apply-cta").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    startEligibilityQuiz(trigger.closest("article"));
  });
});

skipQuizButton.addEventListener("click", () => showSchemeDetails({ skipped: true }));
checkAgainButton.addEventListener("click", () => startEligibilityQuiz(activeSchemeCard));

document.querySelector(".close-dialog").addEventListener("click", () => dialog.close());

const fabCluster = document.querySelector(".fab-cluster");
const fabButton = document.querySelector(".floating");
const fabPrompts = document.querySelector(".fab-prompts");

if (fabCluster && fabButton && fabPrompts) {
  fabButton.addEventListener("click", () => {
    const isOpen = fabCluster.classList.toggle("open");
    const fabIcon = fabButton.querySelector(".fab-icon");
    const fabText = fabButton.querySelector(".fab-text");
    fabButton.classList.toggle("is-close", isOpen);
    fabText.classList.toggle("is-hidden", isOpen);
    fabButton.setAttribute("aria-expanded", String(isOpen));
    fabButton.setAttribute("aria-label", isOpen ? "Close SIA prompts" : "Open SIA prompts");
    fabIcon.innerHTML = isOpen
      ? '<i data-lucide="x" aria-hidden="true"></i>'
      : '<i data-lucide="sparkles" aria-hidden="true"></i>';
    fabText.hidden = isOpen;
    fabText.textContent = isOpen ? "" : "Ask SIA";
    fabPrompts.setAttribute("aria-hidden", String(!isOpen));
    window.lucide?.createIcons();
  });
}

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

if (auroraCanvas) {
  const auroraHost = auroraCanvas.closest(".help") || auroraCanvas;
  const lineGradient = ["#280071", "#12a8e0", "#00b5ef", "#ffffff"];
  const gl = auroraCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
  let frame = 0;
  let auroraVisible = true;
  let auroraAnimating = false;
  let fallbackContext = null;
  let fallbackDpr = 1;
  const targetMouse = { x: -1000, y: -1000 };
  const currentMouse = { x: -1000, y: -1000 };
  const targetParallax = { x: 0, y: 0 };
  const currentParallax = { x: 0, y: 0 };
  let targetInfluence = 0;
  let currentInfluence = 0;

  const vertexShaderSource = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `#version 300 es
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec2 uParallaxOffset;
    uniform float uBendInfluence;
    uniform vec3 uLineGradient[4];

    out vec4 fragColor;

    mat2 rotate(float angle) {
      return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    }

    vec3 gradientColor(float t) {
      float clamped = clamp(t, 0.0, 0.9999) * 3.0;
      int index = int(floor(clamped));
      float f = fract(clamped);
      if (index == 0) return mix(uLineGradient[0], uLineGradient[1], f);
      if (index == 1) return mix(uLineGradient[1], uLineGradient[2], f);
      return mix(uLineGradient[2], uLineGradient[3], f);
    }

    float waveLine(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, float bendStrength) {
      float xMovement = uTime * 0.1;
      float amp = sin(offset + uTime * 0.2) * 0.3;
      float y = sin(uv.x + offset + xMovement) * amp;

      vec2 distanceFromMouse = screenUv - mouseUv;
      float influence = exp(-dot(distanceFromMouse, distanceFromMouse) * 5.0);
      y += (mouseUv.y - screenUv.y) * influence * bendStrength * uBendInfluence;

      float m = uv.y - y;
      return 0.0175 / max(abs(m) + 0.01, 0.001) + 0.01;
    }

    void main() {
      vec2 baseUv = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
      baseUv.y *= -1.0;
      baseUv += uParallaxOffset;

      vec2 mouseUv = (2.0 * uMouse - uResolution.xy) / uResolution.y;
      mouseUv.y *= -1.0;

      vec3 base = mix(uLineGradient[0], uLineGradient[1], smoothstep(-1.25, 1.15, baseUv.x));
      base = mix(base, uLineGradient[2], smoothstep(-0.2, 1.2, baseUv.y) * 0.28);
      vec3 color = base * 0.26;

      for (int i = 0; i < 20; i++) {
        float fi = float(i);
        float t = fi / 19.0;
        float angle = -0.45 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        float line = waveLine(ruv + vec2(0.055 * fi + 1.9, -0.78), 1.5 + 0.2 * fi, baseUv, mouseUv, -0.5);
        color += gradientColor(t) * line * 0.18;
      }

      for (int i = 0; i < 15; i++) {
        float fi = float(i);
        float t = fi / 14.0;
        float angle = 0.18 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        float line = waveLine(ruv + vec2(0.066 * fi + 4.0, -0.06), 2.0 + 0.15 * fi, baseUv, mouseUv, -0.5);
        color += gradientColor(t) * line * 0.48;
      }

      for (int i = 0; i < 10; i++) {
        float fi = float(i);
        float t = fi / 9.0;
        float angle = -0.36 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        ruv.x *= -1.0;
        float line = waveLine(ruv + vec2(0.085 * fi + 9.2, 0.48), 1.0 + 0.2 * fi, baseUv, mouseUv, -0.5);
        color += gradientColor(t) * line * 0.12;
      }

      float vignette = smoothstep(1.7, 0.08, length(baseUv * vec2(0.86, 1.05)));
      fragColor = vec4(color * vignette, 1.0);
    }
  `;

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const number = Number.parseInt(value, 16);
    return [
      ((number >> 16) & 255) / 255,
      ((number >> 8) & 255) / 255,
      (number & 255) / 255
    ];
  }

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram() {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  const auroraProgram = gl ? createProgram() : null;
  const auroraState = auroraProgram ? (() => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(auroraProgram);

    const positionLocation = gl.getAttribLocation(auroraProgram, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    return {
      positionLocation,
      time: gl.getUniformLocation(auroraProgram, "uTime"),
      resolution: gl.getUniformLocation(auroraProgram, "uResolution"),
      mouse: gl.getUniformLocation(auroraProgram, "uMouse"),
      parallaxOffset: gl.getUniformLocation(auroraProgram, "uParallaxOffset"),
      bendInfluence: gl.getUniformLocation(auroraProgram, "uBendInfluence"),
      lineGradient: gl.getUniformLocation(auroraProgram, "uLineGradient[0]")
    };
  })() : null;

  function resizeAurora() {
    const rect = auroraCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (auroraCanvas.width !== width || auroraCanvas.height !== height) {
      auroraCanvas.width = width;
      auroraCanvas.height = height;
    }
    if (auroraState) {
      gl.viewport(0, 0, width, height);
    } else if (fallbackContext) {
      fallbackDpr = dpr;
      fallbackContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function shouldAnimateAurora() {
    return !motionQuery.matches && auroraVisible && document.visibilityState === "visible";
  }

  function drawFallbackAurora(timestamp = 0) {
    const cssWidth = auroraCanvas.clientWidth;
    const cssHeight = auroraCanvas.clientHeight;
    const time = timestamp * 0.001;
    fallbackContext.clearRect(0, 0, cssWidth, cssHeight);
    fallbackContext.globalCompositeOperation = "source-over";

    const base = fallbackContext.createLinearGradient(0, 0, cssWidth, cssHeight);
    base.addColorStop(0, "#280071");
    base.addColorStop(0.72, "#12a8e0");
    base.addColorStop(1, "#00b5ef");
    fallbackContext.fillStyle = base;
    fallbackContext.fillRect(0, 0, cssWidth, cssHeight);

    fallbackContext.globalCompositeOperation = "screen";
    for (let layer = 0; layer < 3; layer++) {
      const count = [20, 15, 10][layer];
      const yBase = [0.72, 0.48, 0.28][layer] * cssHeight;
      const alpha = [0.24, 0.36, 0.18][layer];
      fallbackContext.lineWidth = [1.4, 1.2, 1][layer];
      fallbackContext.globalAlpha = alpha;
      for (let i = 0; i < count; i++) {
        const progress = i / Math.max(count - 1, 1);
        const stroke = fallbackContext.createLinearGradient(0, 0, cssWidth, 0);
        stroke.addColorStop(0, "#280071");
        stroke.addColorStop(0.48, "#12a8e0");
        stroke.addColorStop(1, progress > 0.74 ? "#ffffff" : "#00b5ef");
        fallbackContext.strokeStyle = stroke;
        fallbackContext.beginPath();
        for (let x = -16; x <= cssWidth + 16; x += 12) {
          const p = x / cssWidth;
          const y = yBase + i * 5 + Math.sin(p * Math.PI * 2.2 + time * 0.55 + i * 0.18 + layer) * cssHeight * 0.035;
          if (x <= -16) fallbackContext.moveTo(x, y);
          else fallbackContext.lineTo(x, y);
        }
        fallbackContext.stroke();
      }
    }
    fallbackContext.globalAlpha = 1;
    fallbackContext.setTransform(fallbackDpr, 0, 0, fallbackDpr, 0, 0);
  }

  function drawAurora(timestamp = 0, scheduleNext = true) {
    currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
    currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;
    currentParallax.x += (targetParallax.x - currentParallax.x) * 0.05;
    currentParallax.y += (targetParallax.y - currentParallax.y) * 0.05;
    currentInfluence += (targetInfluence - currentInfluence) * 0.05;

    if (auroraState) {
      gl.useProgram(auroraProgram);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(auroraState.time, timestamp * 0.001);
      gl.uniform2f(auroraState.resolution, auroraCanvas.width, auroraCanvas.height);
      gl.uniform2f(auroraState.mouse, currentMouse.x, currentMouse.y);
      gl.uniform2f(auroraState.parallaxOffset, currentParallax.x, currentParallax.y);
      gl.uniform1f(auroraState.bendInfluence, currentInfluence);
      gl.uniform3fv(auroraState.lineGradient, lineGradient.flatMap(hexToRgb));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      drawFallbackAurora(timestamp);
    }

    if (scheduleNext && shouldAnimateAurora()) {
      frame = requestAnimationFrame(drawAurora);
    } else {
      auroraAnimating = false;
      frame = 0;
    }
  }

  function stopAurora() {
    auroraAnimating = false;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function startAurora() {
    if (auroraAnimating || !shouldAnimateAurora()) return;
    auroraAnimating = true;
    frame = requestAnimationFrame(drawAurora);
  }

  if (!auroraState) {
    fallbackContext = auroraCanvas.getContext("2d", { alpha: true });
  }

  if (auroraState || fallbackContext) {
    resizeAurora();
    drawAurora(0, false);
    startAurora();
  }

  auroraHost.addEventListener("pointermove", (event) => {
    const rect = auroraHost.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    targetMouse.x = x * dpr;
    targetMouse.y = (rect.height - y) * dpr;
    targetInfluence = 1;
    targetParallax.x = ((x - rect.width / 2) / rect.width) * 0.18;
    targetParallax.y = (-(y - rect.height / 2) / rect.height) * 0.18;
  });

  auroraHost.addEventListener("pointerleave", () => {
    targetInfluence = 0;
    targetParallax.x = 0;
    targetParallax.y = 0;
  });

  window.addEventListener("resize", () => {
    resizeAurora();
    drawAurora(0, false);
    startAurora();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAurora();
    } else {
      drawAurora(0, false);
      startAurora();
    }
  });
  onMotionPreferenceChange(() => {
    stopAurora();
    drawAurora(0, false);
    startAurora();
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      auroraVisible = entry.isIntersecting;
      if (auroraVisible) {
        drawAurora(0, false);
        startAurora();
      } else {
        stopAurora();
      }
    });
    observer.observe(auroraCanvas);
  }
}

if (window.lucide) {
  window.lucide.createIcons();
}
