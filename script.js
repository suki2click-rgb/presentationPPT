/* ===== ANIMATED GEOMETRIC BACKGROUND ===== */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let shapes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create floating geometric shapes (matching logo's geometric style)
for (let i = 0; i < 15; i++) {
  shapes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 20 + Math.random() * 60,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.003,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    opacity: 0.02 + Math.random() * 0.04,
    type: Math.floor(Math.random() * 3), // 0=rect, 1=diamond, 2=line
    color: Math.random() > 0.6 ? 'rgba(237,89,43,' : 'rgba(50,86,102,'
  });
}

function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.rotation += s.rotSpeed;
    if (s.x < -100) s.x = canvas.width + 100;
    if (s.x > canvas.width + 100) s.x = -100;
    if (s.y < -100) s.y = canvas.height + 100;
    if (s.y > canvas.height + 100) s.y = -100;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.strokeStyle = s.color + s.opacity + ')';
    ctx.lineWidth = 1;

    if (s.type === 0) {
      ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
    } else if (s.type === 1) {
      ctx.beginPath();
      ctx.moveTo(0, -s.size / 2);
      ctx.lineTo(s.size / 2, 0);
      ctx.lineTo(0, s.size / 2);
      ctx.lineTo(-s.size / 2, 0);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-s.size / 2, -s.size / 2);
      ctx.lineTo(s.size / 2, s.size / 2);
      ctx.stroke();
    }
    ctx.restore();
  });
  requestAnimationFrame(drawShapes);
}
drawShapes();

/* ===== SLIDE ENGINE ===== */
const slides = document.querySelectorAll('.s');
const total = slides.length;
let cur = 0, animating = false;

// Build dots
const dotsEl = document.getElementById('dots');
for (let i = 0; i < total; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.onclick = () => go(i);
  dotsEl.appendChild(d);
}
const dots = dotsEl.querySelectorAll('.dot');
document.querySelector('.c-all').textContent = String(total).padStart(2, '0');

// Init
slides[0].classList.add('active');
setTimeout(() => animIn(0), 200);

// Controls
document.getElementById('prevBtn').onclick = () => cur > 0 && go(cur - 1);
document.getElementById('nextBtn').onclick = () => cur < total - 1 && go(cur + 1);

document.addEventListener('keydown', e => {
  if (animating) return;
  if (['ArrowRight', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); cur < total - 1 && go(cur + 1); }
  else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); cur > 0 && go(cur - 1); }
});

let wt = null;
document.addEventListener('wheel', e => {
  if (animating) return;
  clearTimeout(wt);
  wt = setTimeout(() => {
    if (e.deltaY > 25) cur < total - 1 && go(cur + 1);
    else if (e.deltaY < -25) cur > 0 && go(cur - 1);
  }, 80);
}, { passive: true });

let tx = 0, ty = 0;
document.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; ty = e.changedTouches[0].screenY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (animating) return;
  const dx = e.changedTouches[0].screenX - tx, dy = e.changedTouches[0].screenY - ty;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) { dx < 0 ? (cur < total - 1 && go(cur + 1)) : (cur > 0 && go(cur - 1)); }
  else if (Math.abs(dy) > 50) { dy < 0 ? (cur < total - 1 && go(cur + 1)) : (cur > 0 && go(cur - 1)); }
});

function go(idx) {
  if (idx === cur || animating) return;
  animating = true;
  const dir = idx > cur ? 1 : -1;
  const outS = slides[cur], inS = slides[idx];

  dots[cur].classList.remove('active');
  dots[idx].classList.add('active');
  document.querySelector('.c-now').textContent = String(idx + 1).padStart(2, '0');

  // Dramatic exit
  gsap.to(outS.querySelectorAll('.s-c > *'), {
    opacity: 0, y: -40 * dir, scale: 0.97, duration: 0.3, stagger: 0.02, ease: 'power2.in'
  });
  gsap.to(outS, {
    opacity: 0, duration: 0.4, delay: 0.15,
    onComplete: () => {
      outS.classList.remove('active');
      gsap.set(outS.querySelectorAll('.s-c > *'), { clearProps: 'all' });
    }
  });

  // Dramatic enter
  inS.classList.add('active');
  gsap.fromTo(inS, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.25 });

  setTimeout(() => {
    animIn(idx);
    setTimeout(() => { animating = false; }, 600);
  }, 300);

  cur = idx;
}

/* ===== PER-SLIDE ANIMATIONS ===== */
function animIn(i) {
  const s = slides[i];
  const tl = gsap.timeline();
  const ey = s.querySelector('.ey');
  const sh = s.querySelector('.sh');
  const sp = s.querySelector('.sp');
  const kl = s.querySelector('.kl');

  if (ey) tl.fromTo(ey, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 });

  switch (i) {
    case 0: // HERO
      tl.fromTo(s.querySelector('.hero-logo-wrap'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.hline'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.3');
      tl.fromTo(s.querySelector('.hero-p'), { opacity: 0, y: 20 }, { opacity: 0.7, y: 0, duration: 0.6 }, '-=0.3');
      tl.fromTo(s.querySelector('.hero-hint'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1');
      break;

    case 1: // STATS
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.stat-card'), { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.3)' }, '-=0.2');
      // Counter animation
      tl.add(() => {
        s.querySelectorAll('.stat-num').forEach(el => {
          const target = parseInt(el.dataset.target);
          gsap.fromTo(el, { innerText: 0 }, {
            innerText: target, duration: 1.5, snap: { innerText: 1 }, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(gsap.getProperty(el, 'innerText')); }
          });
        });
      }, '-=0.3');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '+=0.3');
      break;

    case 2: // FLOW
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelector('.flow-center-circle'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.1');
      tl.add(() => { s.querySelectorAll('.flow-path').forEach(p => p.classList.add('drawn')); });
      tl.fromTo(s.querySelectorAll('.flow-t'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 }, '+=0.3');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      // Reset paths on exit
      break;

    case 3: // VS
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelector('.vs-left-side'), { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.7 }, '-=0.2');
      tl.fromTo(s.querySelector('.vs-badge'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.3');
      tl.fromTo(s.querySelector('.vs-right-side'), { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.7 }, '-=0.5');
      tl.add(() => {
        s.querySelector('.vs-line-linear')?.classList.add('drawn');
        s.querySelector('.vs-line-exp')?.classList.add('drawn');
      }, '-=0.2');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 4: // MYTH
      tl.fromTo(s.querySelector('.myth-wrap'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.3)' }, '-=0.2');
      // Strikethrough
      setTimeout(() => {
        let mythText = s.querySelector('.myth-h');
        if (mythText && !mythText.querySelector('.myth-strike')) {
          let strike = document.createElement('div');
          strike.className = 'myth-strike';
          mythText.appendChild(strike);
          setTimeout(() => strike.classList.add('vis'), 50);
        } else if (mythText) {
          let existing = mythText.querySelector('.myth-strike');
          if (existing) { existing.classList.remove('vis'); setTimeout(() => existing.classList.add('vis'), 50); }
        }
      }, 1000);
      tl.fromTo(s.querySelector('.myth-after'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '+=0.3');
      tl.fromTo(s.querySelectorAll('.mp'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.08 }, '-=0.3');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 5: // RISK
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.rk'), { opacity: 0, y: 40, rotateX: 10 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.2');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 6: // SHIFT
      tl.fromTo(s.querySelectorAll('.sw'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out' }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.sep-box'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.3)' }, '-=0.2');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 7: // FRAMEWORK
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.fw'), { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.2)' }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.fw-arr'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.08 }, '-=0.5');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 8: // SIP + Canvas chart
      if (sh) tl.fromTo(sh, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, x: -30 }, { opacity: 0.7, x: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.bl li'), { opacity: 0, x: -20 }, { opacity: 0.75, x: 0, duration: 0.3, stagger: 0.06 }, '-=0.2');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      tl.fromTo(s.querySelector('.sip-chart-wrap'), { opacity: 0, x: 50, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power2.out' }, '-=0.8');
      drawSIPChart();
      break;

    case 9: // BARS
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.bar-col'), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
      s.querySelectorAll('.bar').forEach((bar, idx) => {
        gsap.fromTo(bar, { height: 0 }, { height: bar.dataset.h + 'px', duration: 1.2, delay: 0.5 + idx * 0.15, ease: 'power3.out' });
      });
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '+=0.5');
      break;

    case 10: // LEGACY
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 15 }, { opacity: 0.7, y: 0, duration: 0.5 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.leg'), { opacity: 0, y: 40, rotateY: 8 }, { opacity: 1, y: 0, rotateY: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, '-=0.2');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      break;

    case 11: // TRANSFORM
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.tf'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.3)' }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.tf-a'), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 }, '-=0.4');
      if (kl) tl.fromTo(kl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
      const cta12 = s.querySelector('.cta');
      if (cta12) tl.fromTo(cta12, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');
      break;

    case 12: // SUMMARY
      if (sh) tl.fromTo(sh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.sum'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
      break;

    case 13: // CTA
      tl.fromTo(s.querySelector('.cta-logo'), { opacity: 0, scale: 0.7 }, { opacity: 0.95, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.2');
      tl.fromTo(s.querySelectorAll('.hline'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.3');
      if (sp) tl.fromTo(sp, { opacity: 0, y: 20 }, { opacity: 0.8, y: 0, duration: 0.6 }, '-=0.3');
      tl.fromTo(s.querySelectorAll('.cta'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.2');
      const closing = s.querySelector('.closing');
      if (closing) tl.fromTo(closing, { opacity: 0 }, { opacity: 0.6, duration: 0.5 }, '-=0.1');
      const foot = s.querySelector('.foot');
      if (foot) tl.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1');
      break;
  }
}

/* ===== SIP CANVAS CHART ===== */
function drawSIPChart() {
  const c = document.getElementById('sipCanvas');
  if (!c) return;
  const cx = c.getContext('2d');
  const W = c.width, H = c.height;
  const months = 300, monthly = 10000, rate = 0.12 / 12;
  const maxVal = 100 * 100000;
  let progress = { v: 0 };

  gsap.to(progress, {
    v: 1, duration: 2, ease: 'power2.out',
    onUpdate: () => {
      cx.clearRect(0, 0, W, H);
      // Grid
      cx.strokeStyle = 'rgba(255,255,255,0.04)';
      cx.lineWidth = 1;
      for (let j = 0; j < 5; j++) {
        const gy = H * 0.08 + (H * 0.82 / 4) * j;
        cx.beginPath(); cx.moveTo(35, gy); cx.lineTo(W - 15, gy); cx.stroke();
      }
      const pts = 50;
      const invPts = [], valPts = [];
      for (let j = 0; j <= pts * progress.v; j++) {
        const m = (j / pts) * months;
        const inv = monthly * m;
        const val = monthly * ((Math.pow(1 + rate, m) - 1) / rate) * (1 + rate);
        const x = 35 + (j / pts) * (W - 50);
        const yI = H * 0.9 - (inv / maxVal) * (H * 0.78);
        const yV = H * 0.9 - (val / maxVal) * (H * 0.78);
        invPts.push({ x, y: yI }); valPts.push({ x, y: yV });
      }
      // Invested area
      if (invPts.length > 1) {
        cx.beginPath(); cx.moveTo(invPts[0].x, H * 0.9);
        invPts.forEach(p => cx.lineTo(p.x, p.y));
        cx.lineTo(invPts[invPts.length - 1].x, H * 0.9); cx.closePath();
        cx.fillStyle = 'rgba(50,86,102,0.2)'; cx.fill();
        cx.beginPath(); invPts.forEach((p, k) => k === 0 ? cx.moveTo(p.x, p.y) : cx.lineTo(p.x, p.y));
        cx.strokeStyle = '#325666'; cx.lineWidth = 2.5; cx.stroke();
      }
      // Value area
      if (valPts.length > 1) {
        cx.beginPath(); cx.moveTo(valPts[0].x, H * 0.9);
        valPts.forEach(p => cx.lineTo(p.x, p.y));
        cx.lineTo(valPts[valPts.length - 1].x, H * 0.9); cx.closePath();
        const grd = cx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, 'rgba(237,89,43,0.3)'); grd.addColorStop(1, 'rgba(237,89,43,0.02)');
        cx.fillStyle = grd; cx.fill();
        cx.beginPath(); valPts.forEach((p, k) => k === 0 ? cx.moveTo(p.x, p.y) : cx.lineTo(p.x, p.y));
        cx.strokeStyle = '#ed592b'; cx.lineWidth = 3; cx.stroke();
        // Glow dot
        const last = valPts[valPts.length - 1];
        cx.beginPath(); cx.arc(last.x, last.y, 5, 0, Math.PI * 2);
        cx.fillStyle = '#ed592b'; cx.fill();
        cx.beginPath(); cx.arc(last.x, last.y, 12, 0, Math.PI * 2);
        cx.strokeStyle = 'rgba(237,89,43,0.3)'; cx.lineWidth = 2; cx.stroke();
      }
    }
  });
}

/* ===== MAGNETIC BUTTONS ===== */
document.querySelectorAll('.cta, .arr').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
  });
});
