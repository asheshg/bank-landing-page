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
  const colorStops = ["#280071", "#00b5ef", "#12a8e0"];
  const gl = auroraCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
  let frame = 0;
  let auroraVisible = true;
  let auroraAnimating = false;
  let fallbackContext = null;
  let fallbackDpr = 1;

  const vertexShaderSource = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `#version 300 es
    precision highp float;

    uniform float uTime;
    uniform float uAmplitude;
    uniform vec3 uColorStops[3];
    uniform vec2 uResolution;
    uniform float uBlend;

    out vec4 fragColor;

    vec3 permute(vec3 x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
    }

    float snoise(vec2 v) {
      const vec4 C = vec4(
        0.211324865405187, 0.366025403784439,
        -0.577350269189626, 0.024390243902439
      );
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);

      vec3 p = permute(
        permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
      );

      vec3 m = max(
        0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
        0.0
      );
      m = m * m;
      m = m * m;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    struct ColorStop {
      vec3 color;
      float position;
    };

    #define COLOR_RAMP(colors, factor, finalColor) { \
      int index = 0; \
      for (int i = 0; i < 2; i++) { \
        ColorStop currentColor = colors[i]; \
        bool isInBetween = currentColor.position <= factor; \
        index = int(mix(float(index), float(i), float(isInBetween))); \
      } \
      ColorStop currentColor = colors[index]; \
      ColorStop nextColor = colors[index + 1]; \
      float range = nextColor.position - currentColor.position; \
      float lerpFactor = (factor - currentColor.position) / range; \
      finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;

      ColorStop colors[3];
      colors[0] = ColorStop(uColorStops[0], 0.0);
      colors[1] = ColorStop(uColorStops[1], 0.5);
      colors[2] = ColorStop(uColorStops[2], 1.0);

      vec3 rampColor;
      COLOR_RAMP(colors, uv.x, rampColor);

      float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.42 * uAmplitude;
      height = exp(height);
      height = (uv.y * 2.0 - height + 0.2);
      float intensity = 0.58 * height;

      float midPoint = 0.20;
      float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
      vec3 auroraColor = intensity * rampColor;

      fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
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
      amplitude: gl.getUniformLocation(auroraProgram, "uAmplitude"),
      colorStops: gl.getUniformLocation(auroraProgram, "uColorStops"),
      resolution: gl.getUniformLocation(auroraProgram, "uResolution"),
      blend: gl.getUniformLocation(auroraProgram, "uBlend")
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
    base.addColorStop(0.56, "#12a8e0");
    base.addColorStop(1, "#00b5ef");
    fallbackContext.fillStyle = base;
    fallbackContext.fillRect(0, 0, cssWidth, cssHeight);

    fallbackContext.globalCompositeOperation = "screen";
    const band = fallbackContext.createLinearGradient(0, 0, cssWidth, 0);
    band.addColorStop(0, "#280071");
    band.addColorStop(0.5, "#00b5ef");
    band.addColorStop(1, "#12a8e0");

    fallbackContext.beginPath();
    fallbackContext.moveTo(0, cssHeight);
    for (let x = 0; x <= cssWidth + 8; x += 8) {
      const progress = x / cssWidth;
      const wave = Math.sin(progress * Math.PI * 2 + time * 0.5) * cssHeight * 0.09;
      fallbackContext.lineTo(x, cssHeight * 0.28 + wave);
    }
    fallbackContext.lineTo(cssWidth, cssHeight);
    fallbackContext.closePath();
    fallbackContext.globalAlpha = 0.52;
    fallbackContext.fillStyle = band;
    fallbackContext.fill();
    fallbackContext.globalAlpha = 1;
    fallbackContext.setTransform(fallbackDpr, 0, 0, fallbackDpr, 0, 0);
  }

  function drawAurora(timestamp = 0, scheduleNext = true) {
    if (auroraState) {
      gl.useProgram(auroraProgram);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(auroraState.time, timestamp * 0.001 * 0.5);
      gl.uniform1f(auroraState.amplitude, 0.95);
      gl.uniform1f(auroraState.blend, 0.55);
      gl.uniform2f(auroraState.resolution, auroraCanvas.width, auroraCanvas.height);
      gl.uniform3fv(auroraState.colorStops, colorStops.flatMap(hexToRgb));
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
