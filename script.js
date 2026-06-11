const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll("[data-go-slide]")];
const carouselToggle = document.querySelector("[data-carousel-toggle]");
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
  dots.forEach((dot, i) => dot.classList.toggle("active", i === slideIndex));
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
  if (!carouselToggle) return;
  carouselToggle.setAttribute("aria-label", heroPausedByUser ? "Play carousel" : "Pause carousel");
  carouselToggle.innerHTML = heroPausedByUser
    ? '<i data-lucide="play" aria-hidden="true"></i>'
    : '<i data-lucide="pause" aria-hidden="true"></i>';
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

carouselToggle?.addEventListener("click", () => setHeroUserPaused(!heroPausedByUser));
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

function showSchemeDetails({ skipped = false, score = null } = {}) {
  quizView.hidden = true;
  detailsView.hidden = false;
  checkAgainButton.hidden = !skipped;
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
        showSchemeDetails({ score: Math.min(100, quizScore) });
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
    fabButton.setAttribute("aria-expanded", String(isOpen));
    fabButton.setAttribute("aria-label", isOpen ? "Close SIA prompts" : "Open SIA prompts");
    fabButton.querySelector(".fab-icon").innerHTML = isOpen
      ? '<i data-lucide="x" aria-hidden="true"></i>'
      : '<i data-lucide="sparkles" aria-hidden="true"></i>';
    fabButton.querySelector(".fab-text").textContent = isOpen ? "Close" : "Ask SIA";
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
  const context = auroraCanvas.getContext("2d", { alpha: true });
  const colors = ["#280071", "#12a8e0", "#075aa0"];
  let width = 0;
  let height = 0;
  let frame = 0;
  let auroraVisible = true;
  let auroraAnimating = false;

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

  function shouldAnimateAurora() {
    return !motionQuery.matches && auroraVisible && document.visibilityState === "visible";
  }

  function drawAurora(timestamp = 0, scheduleNext = true) {
    const cssWidth = auroraCanvas.clientWidth;
    const cssHeight = auroraCanvas.clientHeight;
    const time = timestamp * 0.001;

    context.clearRect(0, 0, cssWidth, cssHeight);
    context.globalCompositeOperation = "source-over";

    const base = context.createLinearGradient(0, 0, cssWidth, cssHeight);
    base.addColorStop(0, "#280071");
    base.addColorStop(0.48, "#075aa0");
    base.addColorStop(1, "#12a8e0");
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

  if (context) {
    resizeAurora();
    drawAurora(0, false);
    startAurora();
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
}

if (window.lucide) {
  window.lucide.createIcons();
}
