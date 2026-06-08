/* =========================================================
   SPACE ARCADE — Comportements partagés
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Horaires (source de vérité) ---------- */
  // Index 0 = Lundi ... 6 = Dimanche. Heure locale du visiteur.
  // Plages en minutes depuis minuit. Fermeture après minuit => fin > 1440.
  const HORAIRES = [
    { jour: 'Lundi',    plages: [[600, 1200]] },              // 10:00 - 20:00
    { jour: 'Mardi',    plages: [[600, 1200]] },
    { jour: 'Mercredi', plages: [[600, 1200]] },
    { jour: 'Jeudi',    plages: [[600, 1200]] },
    { jour: 'Vendredi', plages: [[600, 1500]] },              // 10:00 - 01:00 (+1j)
    { jour: 'Samedi',   plages: [[600, 1500]] },              // 10:00 - 01:00 (+1j)
    { jour: 'Dimanche', plages: [[810, 1200]] }               // 13:30 - 20:00
  ];

  function jsDayToIndex(d) { return (d + 6) % 7; } // JS: 0=Dim -> notre index

  function statutOuverture(now) {
    const idx = jsDayToIndex(now.getDay());
    const mins = now.getHours() * 60 + now.getMinutes();
    // Aujourd'hui
    for (const [a, b] of HORAIRES[idx].plages) {
      if (mins >= a && mins < Math.min(b, 1440)) return { open: true, jour: idx };
    }
    // Débordement de la veille (fermeture après minuit)
    const prev = (idx + 6) % 7;
    for (const [a, b] of HORAIRES[prev].plages) {
      if (b > 1440 && mins < (b - 1440)) return { open: true, jour: prev };
    }
    return { open: false, jour: idx };
  }

  function updateStatusPills() {
    const now = new Date();
    const st = statutOuverture(now);
    document.querySelectorAll('[data-status-pill]').forEach(function (el) {
      el.classList.remove('open', 'closed');
      el.classList.add(st.open ? 'open' : 'closed');
      const label = el.querySelector('.status-label');
      if (label) label.textContent = st.open ? 'OUVERT' : 'FERMÉ';
    });
    // Surligner le jour courant dans les tableaux horaires
    document.querySelectorAll('[data-day]').forEach(function (tr) {
      tr.classList.toggle('today', Number(tr.getAttribute('data-day')) === st.jour);
    });
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    if (toggle && nav) {
      toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); });
      });
    }
  }

  /* ---------- Reveal au défilement ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    const vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function (e) {
      // Tout ce qui est déjà visible au chargement : révélé immédiatement (pas de flash vide)
      if (e.getBoundingClientRect().top < vh * 0.92) { e.classList.add('in'); }
      else { io.observe(e); }
    });
    // Filet de sécurité : tout révéler après 1.6s au cas où (JS lent, captures…)
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 1600);
  }

  /* ---------- Étoiles du hero ---------- */
  function initStars() {
    const box = document.querySelector('.stars');
    if (!box) return;
    const n = 60;
    let html = '';
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 100, y = Math.random() * 70;
      const d = (Math.random() * 3).toFixed(2);
      html += '<span class="star" style="left:' + x + '%;top:' + y + '%;animation-delay:' + d + 's"></span>';
    }
    box.innerHTML = html;
  }

  /* ---------- Carrousel ---------- */
  function initCarousel() {
    const car = document.querySelector('[data-carousel]');
    if (!car) return;
    const track = car.querySelector('.carousel-track');
    const slides = track.children.length;
    const dotsBox = car.querySelector('.carousel-dots');
    let idx = 0, timer = null;

    let dotsHtml = '';
    for (let i = 0; i < slides; i++) dotsHtml += '<button data-i="' + i + '" aria-label="Image ' + (i + 1) + '"></button>';
    dotsBox.innerHTML = dotsHtml;
    const dots = Array.from(dotsBox.children);

    function go(i) {
      idx = (i + slides) % slides;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === idx); });
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }
    function auto() { stop(); timer = setInterval(next, 4500); }
    function stop() { if (timer) clearInterval(timer); }

    car.querySelector('.next').addEventListener('click', function () { next(); auto(); });
    car.querySelector('.prev').addEventListener('click', function () { prev(); auto(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.getAttribute('data-i'))); auto(); }); });
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', auto);
    go(0); auto();
  }

  /* ---------- Formulaire de contact ---------- */
  function initForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const success = form.parentElement.querySelector('.form-success');

    function setError(field, on) { field.classList.toggle('error', on); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let ok = true;
      const nom = form.querySelector('#f-nom');
      const email = form.querySelector('#f-email');
      const msg = form.querySelector('#f-message');

      const nomF = nom.closest('.field');
      const emailF = email.closest('.field');
      const msgF = msg.closest('.field');

      if (!nom.value.trim()) { setError(nomF, true); ok = false; } else setError(nomF, false);
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.value.trim())) { setError(emailF, true); ok = false; } else setError(emailF, false);
      if (msg.value.trim().length < 10) { setError(msgF, true); ok = false; } else setError(msgF, false);

      if (ok) {
        form.style.display = 'none';
        if (success) success.classList.add('show');
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () { el.closest('.field').classList.remove('error'); });
    });
  }

  /* ---------- Mini-jeu : SPACE DEFENDER ---------- */
  function initGame() {
    const overlay = document.querySelector('[data-game]');
    if (!overlay) return;
    const canvas = overlay.querySelector('#gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = overlay.querySelector('[data-score]');
    const openers = document.querySelectorAll('[data-game-open]');
    const closeBtn = overlay.querySelector('.game-close');

    const W = 580, H = 380;
    canvas.width = W; canvas.height = H;

    let running = false, raf = null;
    let ship, bullets, foes, particles, score, spawnT, keys, lastFire, gameOver, started;

    function reset() {
      ship = { x: W / 2, y: H - 40, w: 26, h: 16, speed: 5 };
      bullets = []; foes = []; particles = [];
      score = 0; spawnT = 0; lastFire = 0; gameOver = false; started = false;
      keys = {};
      scoreEl.textContent = 'SCORE 0';
    }

    function spawnFoe() {
      const x = 24 + Math.random() * (W - 48);
      foes.push({ x: x, y: -20, w: 24, h: 18, vy: 1 + Math.random() * 1.4 + score / 600, wob: Math.random() * Math.PI * 2 });
    }

    function boom(x, y, color) {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
        particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 30, color: color });
      }
    }

    function fire() {
      const now = performance.now();
      if (now - lastFire > 230) { bullets.push({ x: ship.x, y: ship.y - 12, vy: -7 }); lastFire = now; }
    }

    function update() {
      if (gameOver) return;
      // Déplacement
      if (keys['ArrowLeft'] || keys['a']) ship.x -= ship.speed;
      if (keys['ArrowRight'] || keys['d']) ship.x += ship.speed;
      ship.x = Math.max(18, Math.min(W - 18, ship.x));
      if (keys[' '] || keys['ArrowUp']) fire();

      bullets.forEach(function (b) { b.y += b.vy; });
      bullets = bullets.filter(function (b) { return b.y > -10; });

      spawnT--;
      if (spawnT <= 0) { spawnFoe(); spawnT = Math.max(24, 70 - score / 20); }

      foes.forEach(function (f) { f.y += f.vy; f.wob += 0.05; f.x += Math.sin(f.wob) * 0.6; });

      // Collisions tir/ennemi
      for (let i = foes.length - 1; i >= 0; i--) {
        const f = foes[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (Math.abs(b.x - f.x) < f.w / 2 + 3 && Math.abs(b.y - f.y) < f.h / 2 + 6) {
            boom(f.x, f.y, '#20e6ff'); foes.splice(i, 1); bullets.splice(j, 1);
            score += 10; scoreEl.textContent = 'SCORE ' + score; break;
          }
        }
      }
      // Ennemi atteint le bas ou touche le vaisseau
      for (let i = foes.length - 1; i >= 0; i--) {
        const f = foes[i];
        if (f.y > H + 10) { foes.splice(i, 1); endGame(); break; }
        if (Math.abs(f.x - ship.x) < 22 && Math.abs(f.y - ship.y) < 18) { boom(ship.x, ship.y, '#ff2fb0'); endGame(); break; }
      }

      particles.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.life--; });
      particles = particles.filter(function (p) { return p.life > 0; });
    }

    function draw() {
      ctx.fillStyle = '#05050f'; ctx.fillRect(0, 0, W, H);
      // étoiles de fond
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 53 + (performance.now() / 30)) % W;
        const sy = (i * 71) % H;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      // grille basse
      ctx.strokeStyle = 'rgba(177,75,255,.25)'; ctx.lineWidth = 1;
      for (let gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, H - 60); ctx.lineTo(gx, H); ctx.stroke(); }

      // vaisseau
      ctx.save();
      ctx.shadowBlur = 12; ctx.shadowColor = '#20e6ff'; ctx.fillStyle = '#20e6ff';
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 12);
      ctx.lineTo(ship.x - 14, ship.y + 8);
      ctx.lineTo(ship.x, ship.y + 2);
      ctx.lineTo(ship.x + 14, ship.y + 8);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // tirs
      ctx.fillStyle = '#ffd23f'; ctx.shadowBlur = 8; ctx.shadowColor = '#ffd23f';
      bullets.forEach(function (b) { ctx.fillRect(b.x - 2, b.y - 8, 4, 10); });
      ctx.shadowBlur = 0;

      // ennemis (envahisseurs pixel)
      foes.forEach(function (f) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.shadowBlur = 10; ctx.shadowColor = '#ff2fb0'; ctx.fillStyle = '#ff3d9a';
        ctx.fillRect(-10, -6, 20, 12);
        ctx.fillRect(-12, -2, 4, 8); ctx.fillRect(8, -2, 4, 8);
        ctx.fillStyle = '#05050f'; ctx.fillRect(-6, -3, 4, 4); ctx.fillRect(2, -3, 4, 4);
        ctx.restore();
      });

      // particules
      particles.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, p.life / 30); ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
      });

      if (!started) {
        ctx.fillStyle = 'rgba(5,5,15,.7)'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#20e6ff'; ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('SPACE DEFENDER', W / 2, H / 2 - 26);
        ctx.fillStyle = '#9aa2e0'; ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('← →  bouger   ESPACE  tirer', W / 2, H / 2 + 14);
        ctx.fillStyle = '#ffd23f';
        ctx.fillText('PRESSE ENTRÉE / TAP', W / 2, H / 2 + 44);
      }
      if (gameOver) {
        ctx.fillStyle = 'rgba(5,5,15,.78)'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff3d9a'; ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18);
        ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('SCORE ' + score, W / 2, H / 2 + 16);
        ctx.fillStyle = '#ffd23f'; ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('ENTRÉE / TAP = REJOUER', W / 2, H / 2 + 46);
      }
    }

    function loop() { update(); draw(); raf = requestAnimationFrame(loop); }

    function startRun() { started = true; gameOver = false; }
    function endGame() { gameOver = true; }

    function open() {
      overlay.classList.add('show');
      reset();
      running = true;
      if (!raf) loop();
    }
    function close() {
      overlay.classList.remove('show');
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    openers.forEach(function (b) { b.addEventListener('click', open); });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    window.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('show')) return;
      keys[e.key] = true;
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') { if (!started || gameOver) { reset(); startRun(); } }
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) >= 0) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.key] = false; });

    // Tactile
    function touchAt(clientX) {
      const r = canvas.getBoundingClientRect();
      ship.x = (clientX - r.left) * (W / r.width);
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (!started || gameOver) { reset(); startRun(); return; }
      touchAt(e.clientX); keys[' '] = true;
    });
    canvas.addEventListener('pointermove', function (e) { if (e.buttons) touchAt(e.clientX); });
    canvas.addEventListener('pointerup', function () { keys[' '] = false; });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    updateStatusPills();
    setInterval(updateStatusPills, 30000);
    initReveal();
    initStars();
    initCarousel();
    initForm();
    initGame();
  });
})();
