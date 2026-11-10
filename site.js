// Menu: copied from Ella and Mi's Client Diary booking page, 10 Nov 2026.
// price: "from" price in dollars; null means Client Diary shows no price.
const MENU = {
  colour: [
    ['Permanent all over, short', '1 hr 30', 308],
    ['Permanent all over, medium thickness', '2 hr 45', 360],
    ['Permanent all over, very thick', '2 hr', 420],
    ['Semi-permanent, fine', '2 hr 15', 308],
    ['Semi-permanent, medium', '2 hr 45', 360],
    ['Semi-permanent, very thick', '3 hr 15', 420],
  ],
  foils: [
    ['Quarter head, regrowth', '3 hr 15', 300],
    ['Quarter head, long', '3 hr 30', 350],
    ['Half head, regrowth', '3 hr 45', 400],
    ['Half head, long', '4 hr', 450],
    ['Full head, regrowth', '4 hr', 500],
    ['Full head, long', '4 hr 30', 560],
  ],
  work: [
    ['Toner', '2 hr 15', 300],
    ['Regrowth scalp bleach', '2 hr 30', 330],
    ['Grey blending', '2 hr 30', 400, 'Quoted at the chair'],
    ['Full bleach or colour correction', '5 hr', 500, 'Quoted at the chair'],
  ],
  cut: [
    ['Mens cut', '30 min', 48],
    ['Primary school haircut', '15 min', 55],
    ['High school haircut, treatment and style', '1 hr 45', 65],
    ["Women's haircut and style", '2 hr 15', 98],
    ["Women's restyle and shape", '1 hr 45', 120],
    ['Tape or weft extensions', '', null, 'Quoted'],
  ],
  style: [
    ['Just straightening', '30 min', 45],
    ['Wash and blowdry', '15 min', 58],
    ['Just curls', '45 min', 60],
    ['Weekly blowdry', '45 min', 68],
    ['Upstyling', '1 hr', null, 'Ask'],
    ['Nanoplasty smoothing', '2 hr 15', 600],
  ],
  face: [
    ['Makeup', '1 hr 30', 90],
    ['Brow lamination', '15 min', 100],
    ['Eyebrow tint', '15 min', null, 'Ask'],
    ['Brow, lip or full face wax', '15 to 30 min', null, 'Ask'],
  ],
};

const CATS = [
  ['colour', 'Colour', 'Treatment, cut, blowdry and style included'],
  ['foils', 'Foils', 'Treatment, cut, blowdry and style included'],
  ['work', 'Colour work', 'Treatment, cut, blowdry and style included'],
  ['cut', 'Cuts', ''],
  ['style', 'Styling', ''],
  ['face', 'Makeup and brows', ''],
];

// Menu: a section per group, with a sticky list of groups beside it.
document.getElementById('menu-nav').innerHTML = CATS.map(([k, title]) =>
  `<a href="#m-${k}" data-k="${k}">${title}</a>`).join('');
document.getElementById('menu-list').innerHTML = CATS.map(([k, title, inc]) => `
  <section class="group" id="m-${k}" aria-labelledby="m-${k}-h">
    <header><h3 id="m-${k}-h">${title}</h3>${inc ? `<p>${inc}</p>` : ''}</header>
    <ul>${MENU[k].map(([name, time, price, note]) => `
      <li>
        <span class="item__name">${name}${price && note ? `<small>${note}</small>` : ''}</span>
        <span class="item__time">${time}</span>
        <span class="item__price">${price ? `<small>from</small> $${price}` : `<small>${note}</small>`}</span>
      </li>`).join('')}
    </ul>
  </section>`).join('');

const navLinks = [...document.querySelectorAll('#menu-nav a')];
// The group whose top has passed the middle of the screen is the one you're reading.
const groups = [...document.querySelectorAll('.group')];
let spyQueued = false;
function spy() {
  spyQueued = false;
  const mid = innerHeight * 0.5;
  let on = groups[0];
  groups.forEach(g => { if (g.getBoundingClientRect().top < mid) on = g; });
  const k = on.id.slice(2);
  navLinks.forEach(a => {
    const hit = a.dataset.k === k;
    if (hit && !a.classList.contains('is-on')) a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
    a.classList.toggle('is-on', hit);
  });
}
addEventListener('scroll', () => { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });

// Home: their transformations play behind the wordmark.
// Phones get the middle column only, full screen.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 760px)').matches;
const allReels = [...document.querySelectorAll('.home__reels video')];
if (phone) allReels.forEach((v, i) => { if (i !== 1) { v.removeAttribute('src'); v.preload = 'none'; v.hidden = true; } });
const reels = phone ? [allReels[1]] : allReels;
// Offset the columns so their cuts don't land together.
const offsets = phone ? [0] : [0, 2.2, 4.1];
reels.forEach((v, i) => v.addEventListener('loadedmetadata', () => { v.currentTime = offsets[i]; }, { once: true }));
const playAll = () => { if (!still) reels.forEach(v => v.play().catch(() => {})); };

// Intro: the wordmark wipes in on cream, holds, then the cream lifts away.
const root = document.documentElement;
function intro() {
  if (still) { root.classList.add('is-in', 'is-open'); return; }
  root.classList.add('is-in');
  playAll();
  setTimeout(() => root.classList.add('is-open'), 1700);
}
const markImg = new Image();
markImg.src = 'assets/wordmark.png';
Promise.race([
  Promise.all([markImg.decode().catch(() => {}), document.fonts.ready]),
  new Promise(r => setTimeout(r, 1200)),
]).then(() => requestAnimationFrame(intro));

// The bar shows, and the reels pause, once the home screen is off screen.
const home = document.querySelector('.home');
new IntersectionObserver(([e]) => {
  document.body.classList.toggle('scrolled', !e.isIntersecting);
  if (!root.classList.contains('is-open')) return;
  if (e.isIntersecting) playAll(); else reels.forEach(v => v.pause());
}, { threshold: 0.12 }).observe(home);

// Hours: mark today in Queensland time.
const qldDay = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Brisbane' })).getDay();
document.querySelector(`#hours [data-d="${qldDay}"]`)?.classList.add('is-today');
