const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll("[data-go-slide]")];
const carouselToggles = [...document.querySelectorAll("[data-carousel-toggle]")];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
let slideIndex = 0;
let heroTimer = null;
let heroPausedByUser = false;
let heroPausedByInteraction = false;
let activeLanguage = "en";

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
    if (label) label.textContent = translateUI(expanded ? "See less" : "View more");
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
    if (label) label.textContent = translateUI(expanded ? "See less" : "View more");
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
  if (score >= 70) return translateUI("Strong match");
  if (score >= 45) return translateUI("Partial match");
  return translateUI("Low match");
}

function renderEligibilityMeter(target, score) {
  const color = getEligibilityColor(score);
  target.hidden = false;
  target.style.setProperty("--score", `${score}%`);
  target.style.setProperty("--score-color", color);
  target.innerHTML = `
    <b><span>${translateUI("Eligibility match")}</span><span>${score}%</span></b>
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
  dialogModeLabel.textContent = translateUI("Scheme details");
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
  quizStepLabel.textContent = translateUI(`Step ${quizStep + 1} of ${quizQuestions.length}`);
  quizProgress.style.setProperty("--progress", `${((quizStep + 1) / quizQuestions.length) * 100}%`);
  quizQuestion.textContent = translateUI(question.text);
  quizOptions.innerHTML = "";
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span>${translateUI(option.label)}</span><i data-lucide="chevron-right" aria-hidden="true"></i>`;
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
  dialogModeLabel.textContent = translateUI("3-step eligibility quiz");
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

const navMenus = [...document.querySelectorAll(".nav-menu")];
const dropdowns = [...document.querySelectorAll(".language-menu")];
const closeHeaderMenus = (exceptMenu = null) => {
  navMenus.forEach((menu) => {
    if (menu === exceptMenu) return;
    menu.classList.remove("open");
    menu.querySelector("button")?.setAttribute("aria-expanded", "false");
  });
};

navMenus.forEach((menu) => {
  const button = menu.querySelector(":scope > button");
  button?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !menu.classList.contains("open");
    closeHeaderMenus(menu);
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
      dropdown.querySelector("button")?.setAttribute("aria-expanded", "false");
    });
    menu.classList.toggle("open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

dropdowns.forEach((dropdown) => {
  const button = dropdown.querySelector("button");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    closeHeaderMenus();
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

document.addEventListener("click", (event) => {
  closeHeaderMenus();
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      dropdown.querySelector("button").setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeHeaderMenus();
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
    dropdown.querySelector("button")?.setAttribute("aria-expanded", "false");
  });
});

const translationDictionary = {
  hi: {
    "SBI Web Home Experience": "SBI वेब होम अनुभव",
    "Education loans up to Rs. 1.5 Cr - apply online in minutes": "1.5 करोड़ रुपये तक शिक्षा ऋण - मिनटों में ऑनलाइन आवेदन करें",
    "RBI advisory - never share OTP or PIN with anyone": "RBI सलाह - OTP या PIN कभी किसी से साझा न करें",
    "Meet SIA - your AI assistant in 12+ Indian languages": "SIA से मिलें - 12+ भारतीय भाषाओं में आपका AI सहायक",
    "FD rates revised: senior citizens earn up to 7.50% p.a.": "FD दरों में बदलाव: वरिष्ठ नागरिक 7.50% वार्षिक तक कमा सकते हैं",
    "YONO 3.0 is here - refreshed design, faster experience": "YONO 3.0 आ गया है - नया डिज़ाइन, तेज अनुभव",
    "PM Vishwakarma loans now available at all SBI branches": "PM विश्वकर्मा ऋण अब सभी SBI शाखाओं में उपलब्ध",
    "Explore SBI": "SBI देखें",
    "Explore": "देखें",
    "Banking, loans, investments and support pathways arranged for quick decisions.": "बैंकिंग, ऋण, निवेश और सहायता विकल्प तेज निर्णय के लिए व्यवस्थित हैं।",
    "Banking": "बैंकिंग",
    "Personal Accounts": "व्यक्तिगत खाते",
    "Savings and current accounts": "बचत और चालू खाते",
    "Cards": "कार्ड",
    "Credit, debit and forex cards": "क्रेडिट, डेबिट और फॉरेक्स कार्ड",
    "Deposits": "जमा",
    "FD, RD and tax saver deposits": "FD, RD और टैक्स सेवर जमा",
    "Loans": "ऋण",
    "Education Loans": "शिक्षा ऋण",
    "Study in India and abroad": "भारत और विदेश में पढ़ाई",
    "Home Loans": "गृह ऋण",
    "Buy, build or renovate": "खरीदें, बनाएं या नवीनीकरण करें",
    "Personal Loans": "व्यक्तिगत ऋण",
    "Funds for any need": "हर जरूरत के लिए धन",
    "Invest & Insure": "निवेश और बीमा",
    "Investments": "निवेश",
    "Mutual funds and bonds": "म्यूचुअल फंड और बॉन्ड",
    "Insurance": "बीमा",
    "Life, health and general": "जीवन, स्वास्थ्य और सामान्य",
    "International": "अंतरराष्ट्रीय",
    "NRI, remittance and forex": "NRI, रेमिटेंस और फॉरेक्स",
    "Support": "सहायता",
    "Customer Care": "ग्राहक सेवा",
    "Phone, email and complaints": "फोन, ईमेल और शिकायतें",
    "Find Branch / ATM": "शाखा / ATM खोजें",
    "Locate nearest SBI": "निकटतम SBI खोजें",
    "Forms & Downloads": "फॉर्म और डाउनलोड",
    "Applications and checklists": "आवेदन और चेकलिस्ट",
    "Quick Links": "त्वरित लिंक",
    "Quick access": "त्वरित पहुंच",
    "Everyday SBI actions grouped by the tasks customers use most often.": "ग्राहकों द्वारा सबसे अधिक उपयोग किए जाने वाले SBI कार्य एक जगह।",
    "Accounts": "खाते",
    "Savings": "बचत",
    "Open or manage savings accounts": "बचत खाता खोलें या प्रबंधित करें",
    "Salary": "वेतन",
    "Workplace banking benefits": "कार्यस्थल बैंकिंग लाभ",
    "Current": "चालू",
    "Business account services": "व्यवसाय खाता सेवाएं",
    "Junior / Pehla Kadam": "जूनियर / पहला कदम",
    "Banking for children": "बच्चों के लिए बैंकिंग",
    "Home Loan": "गृह ऋण",
    "Personal Loan": "व्यक्तिगत ऋण",
    "Funds for urgent needs": "तत्काल जरूरतों के लिए धन",
    "Car Loan": "कार ऋण",
    "Finance a new vehicle": "नए वाहन के लिए वित्त",
    "Kisan / MUDRA": "किसान / मुद्रा",
    "Farm and small business credit": "कृषि और छोटे व्यवसाय के लिए ऋण",
    "Digital Banking": "डिजिटल बैंकिंग",
    "Mobile-first SBI banking": "मोबाइल-फर्स्ट SBI बैंकिंग",
    "Internet Banking": "इंटरनेट बैंकिंग",
    "Payments and services": "भुगतान और सेवाएं",
    "UPI": "UPI",
    "Instant payments": "तुरंत भुगतान",
    "WhatsApp Banking": "WhatsApp बैंकिंग",
    "Chat-based service access": "चैट आधारित सेवा पहुंच",
    "Credit Cards": "क्रेडिट कार्ड",
    "Rewards and offers": "रिवॉर्ड और ऑफर",
    "Debit Cards": "डेबिट कार्ड",
    "Daily payments and ATM use": "दैनिक भुगतान और ATM उपयोग",
    "Forex Cards": "फॉरेक्स कार्ड",
    "Travel-ready currency cards": "यात्रा के लिए मुद्रा कार्ड",
    "Prepaid": "प्रीपेड",
    "Controlled spending cards": "नियंत्रित खर्च कार्ड",
    "Fixed Deposits": "फिक्स्ड डिपॉजिट",
    "Secure term savings": "सुरक्षित अवधि बचत",
    "Recurring Deposits": "आवर्ती जमा",
    "Monthly savings habit": "मासिक बचत आदत",
    "Mutual Funds": "म्यूचुअल फंड",
    "Market-linked investments": "बाजार से जुड़े निवेश",
    "SGB": "SGB",
    "Sovereign gold bonds": "सॉवरेन गोल्ड बॉन्ड",
    "NRI Services": "NRI सेवाएं",
    "NRE / NRO": "NRE / NRO",
    "Accounts for overseas Indians": "विदेश में रहने वाले भारतीयों के खाते",
    "Remittance": "रेमिटेंस",
    "Send money to India": "भारत में पैसा भेजें",
    "NRI investment routes": "NRI निवेश विकल्प",
    "Tax & DTAA": "कर और DTAA",
    "Tax support information": "कर सहायता जानकारी",
    "Toll-free Numbers": "टोल-फ्री नंबर",
    "Reach SBI support": "SBI सहायता से जुड़ें",
    "Email Us": "हमें ईमेल करें",
    "Write to customer care": "ग्राहक सेवा को लिखें",
    "Branch Locator": "शाखा खोजक",
    "Find nearby branches": "नजदीकी शाखाएं खोजें",
    "Complaints": "शिकायतें",
    "Raise or track a grievance": "शिकायत दर्ज या ट्रैक करें",
    "Login": "लॉगिन",
    "Sign Up": "साइन अप",
    "English": "English",
    "Fund your education": "अपनी शिक्षा को फंड करें",
    ".": ".",
    "Compare schemes, check eligibility, calculate EMI and apply - guided every step of the way by an experience built around your decision.": "योजनाएं तुलना करें, पात्रता जांचें, EMI गणना करें और आवेदन करें - आपके निर्णय के लिए हर कदम पर मार्गदर्शन।",
    "Check Eligibility": "पात्रता जांचें",
    "Compare Loan Schemes": "ऋण योजनाएं तुलना करें",
    "Max loan amount": "अधिकतम ऋण राशि",
    "Repayment tenure": "भुगतान अवधि",
    "Starting rate": "शुरुआती दर",
    "Buy your dream home": "अपना सपनों का घर खरीदें",
    "with SBI": "SBI के साथ",
    "Lowest interest rates, doorstep service and approvals in days - whether you're building, buying or renovating.": "कम ब्याज दरें, डोरस्टेप सेवा और कुछ दिनों में स्वीकृति - चाहे आप बना रहे हों, खरीद रहे हों या नवीनीकरण कर रहे हों।",
    "Apply Now": "अभी आवेदन करें",
    "EMI Calculator": "EMI कैलकुलेटर",
    "Tenure": "अवधि",
    "Processing fee": "प्रोसेसिंग शुल्क",
    "MSME & Business": "MSME और व्यवसाय",
    "Grow your business": "अपना व्यवसाय बढ़ाएं",
    "Collateral-free working capital, term loans and MUDRA finance designed for India's small businesses and entrepreneurs.": "भारत के छोटे व्यवसायों और उद्यमियों के लिए बिना जमानत कार्यशील पूंजी, टर्म लोन और मुद्रा वित्त।",
    "Explore MSME Loans": "MSME ऋण देखें",
    "Talk to an Expert": "विशेषज्ञ से बात करें",
    "MUDRA loan": "मुद्रा ऋण",
    "Quick sanction": "त्वरित स्वीकृति",
    "Zero": "शून्य",
    "Collateral": "जमानत",
    "Meet SIA - your banking assistant": "SIA से मिलें - आपका बैंकिंग सहायक",
    "Type, speak, or tap a common question. SIA understands 12+ Indian languages and helps you bank with confidence.": "टाइप करें, बोलें या सामान्य प्रश्न चुनें। SIA 12+ भारतीय भाषाएं समझता है और भरोसे के साथ बैंकिंग में मदद करता है।",
    "Ask anything in your language...": "अपनी भाषा में कुछ भी पूछें...",
    "Mujhe kisan loan chahiye, kaise milega?": "मुझे किसान ऋण चाहिए, कैसे मिलेगा?",
    "How to open a savings account?": "बचत खाता कैसे खोलें?",
    "Show nearest SBI branch": "नजदीकी SBI शाखा दिखाएं",
    "AI guidance is for help only. Please confirm final terms with SBI.": "AI मार्गदर्शन केवल सहायता के लिए है। अंतिम शर्तें SBI से पुष्टि करें।",
    "Need help? We're here.": "मदद चाहिए? हम हैं।",
    "Real people. Trusted answers. Available across India.": "वास्तविक लोग। भरोसेमंद उत्तर। पूरे भारत में उपलब्ध।",
    "Talk to a Branch Officer": "शाखा अधिकारी से बात करें",
    "Book a slot at your nearest branch.": "अपनी नजदीकी शाखा में स्लॉट बुक करें।",
    "Community Support": "समुदाय सहायता",
    "We'll call you in your preferred language.": "हम आपकी पसंदीदा भाषा में कॉल करेंगे।",
    "Connect with local guidance and support channels.": "स्थानीय मार्गदर्शन और सहायता चैनलों से जुड़ें।",
    "1800 1234 / 1800 2100 (toll-free)": "1800 1234 / 1800 2100 (टोल-फ्री)",
    "Email Support": "ईमेल सहायता",
    "I am visiting this website for the first time": "मैं पहली बार इस वेबसाइट पर आया/आई हूं",
    "I have visited this website before": "मैं पहले भी इस वेबसाइट पर आ चुका/चुकी हूं",
    "Government schemes made simple": "सरकारी योजनाएं आसान भाषा में",
    "Explore benefits you may be eligible for - explained in your language.": "वे लाभ देखें जिनके लिए आप पात्र हो सकते हैं - आपकी भाषा में समझाए गए।",
    "Eligibility - All citizens": "पात्रता - सभी नागरिक",
    "Zero-balance savings account for every Indian.": "हर भारतीय के लिए शून्य-बैलेंस बचत खाता।",
    "Eligibility - Land-owning farmers": "पात्रता - भूमि-स्वामी किसान",
    "Rs. 6,000/year income support for farmer families.": "किसान परिवारों के लिए 6,000 रुपये/वर्ष आय सहायता।",
    "Eligibility - Micro enterprises": "पात्रता - सूक्ष्म उद्यम",
    "Collateral-free loans up to Rs. 10 lakh for small business.": "छोटे व्यवसाय के लिए 10 लाख रुपये तक बिना जमानत ऋण।",
    "Eligibility - Age 18-40": "पात्रता - आयु 18-40",
    "Guaranteed pension after 60, starting Rs. 42/month.": "60 वर्ष के बाद गारंटीड पेंशन, 42 रुपये/माह से शुरू।",
    "Eligibility - Girls below 10": "पात्रता - 10 वर्ष से कम आयु की बालिकाएं",
    "High-interest savings scheme for the girl child.": "बालिका के लिए उच्च-ब्याज बचत योजना।",
    "Eligibility - Age 18-70": "पात्रता - आयु 18-70",
    "Life and accident insurance from just Rs. 20/year.": "केवल 20 रुपये/वर्ष से जीवन और दुर्घटना बीमा।",
    "Eligibility - First-time entrepreneurs": "पात्रता - पहली बार उद्यमी",
    "Loans for SC/ST and women entrepreneurs.": "SC/ST और महिला उद्यमियों के लिए ऋण।",
    "View more": "और देखें",
    "See less": "कम देखें",
    "View less": "कम देखें",
    "Frequently asked questions": "अक्सर पूछे जाने वाले प्रश्न",
    "How do I open a bank account?": "मैं बैंक खाता कैसे खोलूं?",
    "You can start online or visit a branch with identity proof, address proof, PAN or Form 60, and a recent photograph.": "आप ऑनलाइन शुरू कर सकते हैं या पहचान प्रमाण, पता प्रमाण, PAN या Form 60 और हाल की फोटो के साथ शाखा जा सकते हैं।",
    "What should I do if my card is lost?": "मेरा कार्ड खो जाए तो क्या करूं?",
    "Block the card immediately through mobile banking, internet banking, customer care, or your nearest branch, then request a replacement.": "मोबाइल बैंकिंग, इंटरनेट बैंकिंग, ग्राहक सेवा या नजदीकी शाखा से कार्ड तुरंत ब्लॉक करें, फिर नया कार्ड मांगें।",
    "How can I reset internet banking access?": "मैं इंटरनेट बैंकिंग एक्सेस कैसे रीसेट करूं?",
    "Use the bank's official online banking portal to reset your password, or visit a branch if additional verification is needed.": "पासवर्ड रीसेट करने के लिए बैंक के आधिकारिक ऑनलाइन पोर्टल का उपयोग करें, या अतिरिक्त सत्यापन के लिए शाखा जाएं।",
    "How do I report an unauthorised transaction?": "अनधिकृत लेनदेन की रिपोर्ट कैसे करूं?",
    "Report it to the bank as soon as possible through official customer care, mobile banking, or a branch, and keep the complaint reference number.": "आधिकारिक ग्राहक सेवा, मोबाइल बैंकिंग या शाखा से जल्द से जल्द बैंक को बताएं और शिकायत संदर्भ संख्या संभाल कर रखें।",
    "How do I update my mobile number?": "मैं अपना मोबाइल नंबर कैसे अपडेट करूं?",
    "Visit your branch or use supported official digital channels where available. Keep your identity documents ready for verification.": "अपनी शाखा जाएं या उपलब्ध आधिकारिक डिजिटल चैनल का उपयोग करें। सत्यापन के लिए पहचान दस्तावेज तैयार रखें।",
    "How do I find the right loan product?": "सही ऋण उत्पाद कैसे चुनूं?",
    "Compare eligibility, tenure, fees, collateral requirements, and repayment comfort before applying. Branch staff can help validate final terms.": "आवेदन से पहले पात्रता, अवधि, शुल्क, जमानत जरूरत और भुगतान सुविधा की तुलना करें। शाखा कर्मचारी अंतिम शर्तें समझाने में मदद कर सकते हैं।",
    "Find SBI near you": "अपने पास SBI खोजें",
    "Branches, ATMs, Customer Service Points and lockers across India.": "भारत भर में शाखाएं, ATM, ग्राहक सेवा केंद्र और लॉकर।",
    "Branch": "शाखा",
    "ATM": "ATM",
    "CSP": "CSP",
    "Locker": "लॉकर",
    "Search": "खोजें",
    "Enter village, town, city or PIN code": "गांव, कस्बा, शहर या PIN कोड दर्ज करें",
    "Nearest branch in your area is 1.2 km away": "आपके क्षेत्र की निकटतम शाखा 1.2 किमी दूर है",
    "MG Road Branch, Bengaluru - Open until 4:00 PM": "MG Road शाखा, बेंगलुरु - शाम 4:00 बजे तक खुली",
    "SBI Branch": "SBI शाखा",
    "Why SBI": "SBI क्यों",
    "Trusted by Bharat, built for every Indian.": "भारत का भरोसा, हर भारतीय के लिए निर्मित।",
    "Years of trust": "वर्षों का भरोसा",
    "Customers served": "ग्राहकों की सेवा",
    "Branches": "शाखाएं",
    "ATMs & CSPs": "ATM और CSP",
    "\"From my village to my smartphone - SBI has always been there.\"": "\"मेरे गांव से मेरे स्मार्टफोन तक - SBI हमेशा साथ रहा है।\"",
    "- Lakshmi, Madurai": "- लक्ष्मी, मदुरै",
    "State Bank of India": "भारतीय स्टेट बैंक",
    "The Banker to Every Indian": "हर भारतीय का बैंकर",
    "Serving 50+ crore Indians across 22,000+ branches, ATMs and Customer Service Points - built on 220+ years of trust.": "22,000+ शाखाओं, ATM और ग्राहक सेवा केंद्रों के माध्यम से 50+ करोड़ भारतीयों की सेवा - 220+ वर्षों के भरोसे पर आधारित।",
    "About SBI": "SBI के बारे में",
    "Overview": "अवलोकन",
    "Investor Relations": "निवेशक संबंध",
    "Careers": "करियर",
    "Press Releases": "प्रेस विज्ञप्ति",
    "Policies": "नीतियां",
    "Privacy Policy": "गोपनीयता नीति",
    "Terms & Conditions": "नियम और शर्तें",
    "Cookie Policy": "कुकी नीति",
    "Security": "सुरक्षा",
    "Fraud Awareness": "धोखाधड़ी जागरूकता",
    "Grievance Redressal": "शिकायत निवारण",
    "RBI Disclosures": "RBI प्रकटीकरण",
    "Accessibility": "सुलभता",
    "Lite Mode": "लाइट मोड",
    "Sign Language Support": "सांकेतिक भाषा सहायता",
    "Screen-reader Help": "स्क्रीन-रीडर सहायता",
    "3-step eligibility quiz": "3-चरण पात्रता क्विज",
    "Step 1 of 3": "चरण 1 / 3",
    "Step 2 of 3": "चरण 2 / 3",
    "Step 3 of 3": "चरण 3 / 3",
    "Scheme details": "योजना विवरण",
    "Eligibility match": "पात्रता मिलान",
    "Strong match": "मजबूत मिलान",
    "Partial match": "आंशिक मिलान",
    "Low match": "कम मिलान",
    "Do you have basic KYC documents such as Aadhaar, PAN/Form 60 or address proof?": "क्या आपके पास आधार, PAN/Form 60 या पता प्रमाण जैसे बुनियादी KYC दस्तावेज हैं?",
    "Yes, I have them ready": "हां, मेरे पास तैयार हैं",
    "I have some documents": "मेरे पास कुछ दस्तावेज हैं",
    "Not right now": "अभी नहीं",
    "Which profile best matches you?": "कौन-सी प्रोफाइल आपसे सबसे अधिक मेल खाती है?",
    "General banking customer": "सामान्य बैंकिंग ग्राहक",
    "Farmer or agricultural household": "किसान या कृषि परिवार",
    "Small business owner": "छोटे व्यवसाय के मालिक",
    "Retirement planner": "रिटायरमेंट योजना बनाने वाले",
    "Parent or guardian of a girl child": "बालिका के माता-पिता या अभिभावक",
    "Insurance cover seeker": "बीमा कवर चाहने वाले",
    "First-time eligible entrepreneur": "पहली बार पात्र उद्यमी",
    "Do you already have a bank account that can receive benefits or auto-debits?": "क्या आपके पास ऐसा बैंक खाता है जिसमें लाभ या ऑटो-डेबिट प्राप्त हो सकते हैं?",
    "Yes, I have an active account": "हां, मेरा सक्रिय खाता है",
    "I need help linking or updating it": "मुझे इसे लिंक या अपडेट करने में मदद चाहिए",
    "No, I need to open one": "नहीं, मुझे खाता खोलना है",
    "Skip quiz": "क्विज छोड़ें",
    "Answer three quick questions to estimate your eligibility. You can skip and view scheme details anytime.": "अपनी पात्रता का अनुमान लगाने के लिए तीन छोटे प्रश्नों के उत्तर दें। आप कभी भी छोड़कर योजना विवरण देख सकते हैं।",
    "AI generated summary": "AI द्वारा तैयार सारांश",
    "Highlights": "मुख्य बातें",
    "Apply": "आवेदन करें",
    "Open savings account": "बचत खाता खोलें",
    "Nearest SBI branch": "नजदीकी SBI शाखा",
    "I have another question": "मेरा एक और प्रश्न है",
    "Ask SIA": "SIA से पूछें"
  }
};

const translatableTextNodes = [];
const translatableInputs = [];
const languageLabel = document.querySelector("[data-language-label]");
const languageOptions = [...document.querySelectorAll("[data-lang]")];

function collectTranslatableNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    translatableTextNodes.push({ node: walker.currentNode, original: walker.currentNode.nodeValue });
  }
  document.querySelectorAll("input[placeholder]").forEach((input) => {
    translatableInputs.push({ input, original: input.getAttribute("placeholder") });
  });
}

function translateText(original, language) {
  if (language === "en") return original;
  const dictionary = translationDictionary[language] || {};
  const trimmed = original.trim();
  if (!trimmed || !dictionary[trimmed]) return original;
  return original.replace(trimmed, dictionary[trimmed]);
}

function translateUI(text) {
  return translateText(text, activeLanguage);
}

function applyLanguage(language) {
  activeLanguage = language;
  document.documentElement.lang = language;
  translatableTextNodes.forEach(({ node, original }) => {
    node.nodeValue = translateText(original, language);
  });
  translatableInputs.forEach(({ input, original }) => {
    input.setAttribute("placeholder", translateText(original, language));
  });
  document.title = translateText("SBI Web Home Experience", language);
  languageOptions.forEach((option) => {
    if (option.dataset.lang === language) {
      option.setAttribute("aria-current", "true");
    } else {
      option.removeAttribute("aria-current");
    }
  });
  if (languageLabel) languageLabel.textContent = language === "hi" ? "हिन्दी" : "English";
  try {
    localStorage.setItem("sbi-language", language);
  } catch (error) {
    // Language switching still works even when storage is unavailable.
  }
}

collectTranslatableNodes();
languageOptions.forEach((option) => {
  option.addEventListener("click", (event) => {
    event.preventDefault();
    const language = option.dataset.lang || "en";
    if (!translationDictionary[language] && language !== "en") return;
    applyLanguage(language);
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
      dropdown.querySelector("button")?.setAttribute("aria-expanded", "false");
    });
  });
});
let savedLanguage = "en";
try {
  savedLanguage = localStorage.getItem("sbi-language") === "hi" ? "hi" : "en";
} catch (error) {
  savedLanguage = "en";
}
applyLanguage(savedLanguage);

function getCardCenter(element) {
  const { width, height } = element.getBoundingClientRect();
  return [width / 2, height / 2];
}

function getBorderGlowEdgeProximity(element, x, y) {
  const [centerX, centerY] = getCardCenter(element);
  const dx = x - centerX;
  const dy = y - centerY;
  const kx = dx === 0 ? Infinity : centerX / Math.abs(dx);
  const ky = dy === 0 ? Infinity : centerY / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getBorderGlowCursorAngle(element, x, y) {
  const [centerX, centerY] = getCardCenter(element);
  const dx = x - centerX;
  const dy = y - centerY;
  if (dx === 0 && dy === 0) return 0;
  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

document.querySelectorAll(".border-glow-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--edge-proximity", `${(getBorderGlowEdgeProximity(card, x, y) * 100).toFixed(3)}`);
    card.style.setProperty("--cursor-angle", `${getBorderGlowCursorAngle(card, x, y).toFixed(3)}deg`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--edge-proximity", "0");
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
