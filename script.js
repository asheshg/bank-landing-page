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

118
118
 document.querySelectorAll(".nav-menu > button").forEach((button) => {
119
119
   button.addEventListener("click", () => button.blur());
120
120
 });
121
121
 
122
122
 document.addEventListener("click", (event) => {
123
123
   dropdowns.forEach((dropdown) => {
124
124
     if (!dropdown.contains(event.target)) {
125
125
       dropdown.classList.remove("open");
126
126
       dropdown.querySelector("button").setAttribute("aria-expanded", "false");
127
127
     }
128
128
   });
129
129
 });
130
130
 
131
131
 document.querySelectorAll("form").forEach((form) => {
132
132
   form.addEventListener("submit", (event) => event.preventDefault());
133
133
 });
134
134
 
135
135
 const auroraCanvas = document.querySelector(".aurora-canvas");
136
136
 const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
137
137
 
138
138
 if (auroraCanvas) {
139
139
   const context = auroraCanvas.getContext("2d", { alpha: true });
140
-  const colors = ["#5553aa", "#ec7116", "#673391"];
140
+  const colors = ["#12a8e0", "#ffd100", "#280071", "#00a2ea"];
141
141
   let width = 0;
142
142
   let height = 0;
143
143
   let frame = 0;
144
144
 
145
145
   function resizeAurora() {
146
146
     const rect = auroraCanvas.getBoundingClientRect();
147
147
     const dpr = Math.min(window.devicePixelRatio || 1, 2);
148
148
     width = Math.max(1, Math.floor(rect.width * dpr));
149
149
     height = Math.max(1, Math.floor(rect.height * dpr));
150
150
     auroraCanvas.width = width;
151
151
     auroraCanvas.height = height;
152
152
     context.setTransform(dpr, 0, 0, dpr, 0, 0);
153
153
   }
154
154
 
155
155
   function drawBand(time, offset, amplitude, alpha, colorShift) {
156
156
     const cssWidth = auroraCanvas.clientWidth;
157
157
     const cssHeight = auroraCanvas.clientHeight;
158
158
     const gradient = context.createLinearGradient(0, 0, cssWidth, 0);
159
159
     gradient.addColorStop(0, colors[colorShift % colors.length]);
160
160
     gradient.addColorStop(0.5, colors[(colorShift + 1) % colors.length]);
161
161
     gradient.addColorStop(1, colors[(colorShift + 2) % colors.length]);
162
162
 
163
163
     context.beginPath();
164
164
     context.moveTo(0, cssHeight);
165
165
 
166
166
     for (let x = 0; x <= cssWidth + 8; x += 8) {
167
167
       const progress = x / cssWidth;
168
168
       const wave =
169
169
         Math.sin(progress * Math.PI * 2.1 + time * 0.72 + offset) * amplitude +
170
170
         Math.sin(progress * Math.PI * 5.4 - time * 0.38 + offset * 0.7) * amplitude * 0.32;
171
171
       const base = cssHeight * (0.34 + offset * 0.045);
172
172
       context.lineTo(x, base + wave);
173
173
     }
174
174
 
175
175
     context.lineTo(cssWidth, cssHeight);
176
176
     context.closePath();
177
177
     context.globalAlpha = alpha;
178
178
     context.fillStyle = gradient;
179
179
     context.fill();
180
180
   }
181
181
 
182
182
   function drawAurora(timestamp = 0) {
183
183
     const cssWidth = auroraCanvas.clientWidth;
184
184
     const cssHeight = auroraCanvas.clientHeight;
185
185
     const time = timestamp * 0.001;
186
186
 
187
187
     context.clearRect(0, 0, cssWidth, cssHeight);
188
188
     context.globalCompositeOperation = "source-over";
189
189
 
190
190
     const base = context.createLinearGradient(0, 0, cssWidth, cssHeight);
191
-    base.addColorStop(0, "#673391");
192
-    base.addColorStop(0.48, "#b22382");
193
-    base.addColorStop(1, "#5553aa");
191
+    base.addColorStop(0, "#280071");
192
+    base.addColorStop(0.48, "#12a8e0");
193
+    base.addColorStop(1, "#00a2ea");
194
194
     context.fillStyle = base;
195
195
     context.fillRect(0, 0, cssWidth, cssHeight);
196
196
 
197
197
     context.globalCompositeOperation = "lighter";
198
198
     drawBand(time, 0.8, cssHeight * 0.09, 0.38, 0);
199
199
     drawBand(time, 2.2, cssHeight * 0.12, 0.28, 1);
200
200
     drawBand(time, 3.4, cssHeight * 0.07, 0.2, 2);
201
201
 
202
202
     const glow = context.createRadialGradient(cssWidth * 0.18, cssHeight * 0.28, 0, cssWidth * 0.18, cssHeight * 0.28, cssWidth * 0.48);
203
-    glow.addColorStop(0, "rgba(236,113,22,.32)");
204
-    glow.addColorStop(1, "rgba(236,113,22,0)");
203
+    glow.addColorStop(0, "rgba(255,209,0,.32)");
204
+    glow.addColorStop(1, "rgba(255,209,0,0)");
205
205
     context.globalAlpha = 1;
206
206
     context.fillStyle = glow;
207
207
     context.fillRect(0, 0, cssWidth, cssHeight);
208
208
 
209
209
     if (!reduceMotion) {
210
210
       frame = requestAnimationFrame(drawAurora);
211
211
     }
212
212
   }
213
213
 
214
214
   if (context) {
215
215
     resizeAurora();
216
216
     drawAurora();
217
217
     window.addEventListener("resize", () => {
218
218
       resizeAurora();
219
219
       if (reduceMotion) drawAurora();
220
220
     });
221
221
   }
222
222
 }
223
223
 
224
224
 if (window.lucide) {
225
225
   window.lucide.createIcons();
+
226
226
 }