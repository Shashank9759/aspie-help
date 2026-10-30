/* =========================================================
   aspie.help — interactions
   ========================================================= */

const CONFIG = {
  // Paste your WhatsApp community invite link here.
  whatsappInvite: "https://chat.whatsapp.com/E1DBc6sKUBpKaRb2GjRkuK",
};

const root = document.documentElement;
root.classList.add("js");

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
};
const isCalm = () => root.classList.contains("calm");

/* ---------- Comfort settings: calm mode + larger text ---------- */
const calmBtn = document.getElementById("calm-toggle");
const textBtn = document.getElementById("text-toggle");

function setCalm(on) {
  root.classList.toggle("calm", on);
  root.classList.toggle("motion-ok", !on);
  calmBtn.setAttribute("aria-pressed", String(on));
  store.set("ah-calm", on ? "1" : "0");
}
function setLargeText(on) {
  root.classList.toggle("large-text", on);
  textBtn.setAttribute("aria-pressed", String(on));
  store.set("ah-large", on ? "1" : "0");
}
calmBtn.addEventListener("click", () => setCalm(!isCalm()));
textBtn.addEventListener("click", () => setLargeText(!root.classList.contains("large-text")));

const savedCalm = store.get("ah-calm");
setCalm(savedCalm === null ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : savedCalm === "1");
setLargeText(store.get("ah-large") === "1");

/* ---------- Header, mobile menu, active link ---------- */
const header = document.querySelector(".site-header");
const nav = document.getElementById("main-nav");
const menuBtn = document.getElementById("menu-btn");
const floatJoin = document.querySelector(".float-join");

function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 20);
  floatJoin.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function closeMenu() {
  nav.classList.remove("open");
  header.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
}
menuBtn.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

const navLinks = [...nav.querySelectorAll("a")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((a) => {
  const target = document.querySelector(a.getAttribute("href"));
  if (target) sectionObserver.observe(target);
});

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Counters ---------- */
function animateCount(el) {
  const to = Number(el.dataset.count);
  if (isCalm()) { el.textContent = to; return; }
  const from = to > 1000 ? to - 40 : 0;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- Chat preview ---------- */
const chat = document.getElementById("chat");
const chatObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  chat.querySelectorAll(".msg").forEach((m, i) => setTimeout(() => m.classList.add("show"), isCalm() ? 0 : 300 + i * 700));
  chatObserver.disconnect();
}, { threshold: 0.3 });
chatObserver.observe(chat);

/* ---------- Stories slider ---------- */
const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".slider-dots .dot")];
let current = 0;
let timer = null;

function showSlide(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle("is-active", n === current));
  dots.forEach((d, n) => {
    d.classList.toggle("is-active", n === current);
    d.setAttribute("aria-pressed", String(n === current));
  });
}
function autoplay() {
  clearInterval(timer);
  timer = setInterval(() => { if (!isCalm()) showSlide(current + 1); }, 6000);
}
dots.forEach((d, n) => d.addEventListener("click", () => { showSlide(n); autoplay(); }));
autoplay();

/* ---------- FAQ: one open at a time ---------- */
const faqItems = document.querySelectorAll(".faq-list details");
faqItems.forEach((d) => d.addEventListener("toggle", () => {
  if (d.open) faqItems.forEach((other) => { if (other !== d) other.open = false; });
}));

/* ---------- Join dialog ---------- */
const dialog = document.getElementById("join-dialog");
const consent = document.getElementById("join-consent");
const goBtn = document.getElementById("join-go");
goBtn.href = CONFIG.whatsappInvite;

function syncConsent() { goBtn.setAttribute("aria-disabled", String(!consent.checked)); }
consent.addEventListener("change", syncConsent);

document.querySelectorAll("[data-join]").forEach((btn) => btn.addEventListener("click", () => {
  closeMenu();
  syncConsent();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else window.open(CONFIG.whatsappInvite, "_blank", "noopener");
}));
goBtn.addEventListener("click", (e) => {
  if (!consent.checked) { e.preventDefault(); return; }
  setTimeout(() => dialog.close(), 200);
});
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
document.querySelector(".js-rules").addEventListener("click", () => dialog.close());

document.getElementById("year").textContent = new Date().getFullYear();
