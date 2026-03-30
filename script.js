(function() {
  'use strict';

  // ── PARTICLE SYSTEM — Living background ──
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0, mouseY = 0;
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.size = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.3 + 0.05;
      this.color = Math.random() > 0.6
        ? `rgba(110, 69, 255, ${this.alpha})`
        : `rgba(245, 75, 0, ${this.alpha * 0.6})`;
    }
    update() {
      // Gentle mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        const force = (200 - dist) / 200 * 0.3;
        this.vx += (dx / dist) * force * 0.02;
        this.vy += (dy / dist) * force * 0.02;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Damping
      this.vx *= 0.998;
      this.vy *= 0.998;

      // Wrap
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Create particles (fewer on mobile)
  const particleCount = window.innerWidth < 600 ? 30 : 60;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(110, 69, 255, ${0.03 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ── CURSOR GLOW ──
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  function updateCursorGlow() {
    glowX += (cursorX - glowX) * 0.06;
    glowY += (cursorY - glowY) * 0.06;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(updateCursorGlow);
  }
  updateCursorGlow();

  // ── STAGGERED REVEAL — Cinematic scroll entries ──
  const revealEls = document.querySelectorAll(
    '.section, .phase-marker, .callout, .listing, .col-card, .template, ' +
    '.clock-widget, .scorecard-section, .checklist, .sequence, .time-table, ' +
    '.three-col, .success-stories, .examples, .hero'
  );
  revealEls.forEach(el => el.classList.add('reveal-element'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Add small stagger for grouped elements
        const siblings = e.target.parentElement?.querySelectorAll('.reveal-element');
        if (siblings) {
          const idx = Array.from(siblings).indexOf(e.target);
          e.target.style.transitionDelay = (idx * 0.06) + 's';
        }
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ── COPY BUTTONS — with satisfying feedback ──
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const text = btn.dataset.copy;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!'; btn.classList.add('copied');
        // Pulse animation
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
      });
    });
  });

  // ── CHECKLISTS — with celebration effect ──
  const checks = document.querySelectorAll('.check-item input[type="checkbox"]');
  const saved = JSON.parse(localStorage.getItem('playbook-checks') || '{}');

  checks.forEach(cb => {
    if (saved[cb.dataset.id]) {
      cb.checked = true;
      cb.closest('.check-item').classList.add('checked');
    }
    cb.addEventListener('change', () => {
      saved[cb.dataset.id] = cb.checked;
      localStorage.setItem('playbook-checks', JSON.stringify(saved));
      const item = cb.closest('.check-item');
      item.classList.toggle('checked', cb.checked);

      if (cb.checked) {
        // Mini celebration burst
        createConfettiBurst(item);
      }
      updateScore();
    });
  });

  function createConfettiBurst(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#24c98d', '#6e45ff', '#f54b00', '#f5bd00'];
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: fixed;
        width: 4px; height: 4px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${rect.left + 20}px;
        top: ${rect.top + rect.height / 2}px;
        pointer-events: none;
        z-index: 9998;
      `;
      document.body.appendChild(dot);

      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const velocity = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 20;

      dot.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });

      setTimeout(() => dot.remove(), 600);
    }
  }

  // ── WEIGHTED SCORE — with animated counter ──
  function updateScore() {
    let totalWeight = 0;
    let checkedWeight = 0;
    checks.forEach(cb => {
      const w = parseInt(cb.dataset.weight || '1');
      totalWeight += w;
      if (cb.checked) checkedWeight += w;
    });
    const pct = totalWeight ? checkedWeight / totalWeight : 0;
    const score = Math.round(pct * 10);
    const display = document.getElementById('score-display');
    const fill = document.getElementById('score-fill');
    const badge = document.getElementById('readiness-badge');
    const label = document.getElementById('score-label');

    if (display) {
      animateCounter(display, score);
    }
    if (fill) fill.style.width = (pct * 100) + '%';
    if (badge) badge.textContent = score + '/10';

    const labels = [
      'Not started yet', 'Getting started', 'Making progress', 'On your way',
      'Halfway there', 'Looking good', 'Strong foundation', 'Almost ready',
      'Nearly launch-ready', 'One step away', 'Launch ready!'
    ];
    if (label) label.textContent = labels[score] || '';

    if (badge) {
      if (score >= 8) {
        badge.style.color = '#24c98d';
        badge.style.borderColor = 'rgba(36,201,141,0.25)';
        badge.style.background = 'rgba(36,201,141,0.06)';
      } else if (score >= 5) {
        badge.style.color = '#f79009';
        badge.style.borderColor = 'rgba(247,144,9,0.25)';
        badge.style.background = 'rgba(247,144,9,0.06)';
      } else {
        badge.style.color = '#4a4a64';
        badge.style.borderColor = 'rgba(108,108,137,0.1)';
        badge.style.background = 'rgba(108,108,137,0.06)';
      }
    }

    const shareBtn = document.getElementById('share-score');
    if (shareBtn) shareBtn.dataset.score = score;
  }

  function animateCounter(el, target) {
    el.innerHTML = target + '<span class="score-of">/10</span>';
  }

  updateScore();

  // ── SHARE SCORE ON X ──
  const shareBtn = document.getElementById('share-score');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const score = shareBtn.dataset.score || '0';
      const text = encodeURIComponent(
        `I scored ${score}/10 on the Solana Launch Playbook. How ready are you?\n\nhttps://solana-playbook.vercel.app`
      );
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    });
  }

  // ── SCROLL PROGRESS — with gradient animation ──
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const fill = document.getElementById('progress-fill');
        if (fill && h > 0) fill.style.width = (window.scrollY / h * 100) + '%';

        // Nav shadow on scroll
        const nav = document.getElementById('phase-nav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);

        ticking = false;
      });
      ticking = true;
    }
  });

  // ── ACTIVE PHASE NAV — with smooth transitions ──
  const phases = document.querySelectorAll('.phase-marker');
  const phaseLinks = document.querySelectorAll('.phase-link');
  let navTicking = false;

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(() => {
        let current = '';
        phases.forEach(p => { if (window.scrollY >= p.offsetTop - 200) current = p.id; });
        phaseLinks.forEach(l => l.classList.toggle('active', l.dataset.phase === current));
        navTicking = false;
      });
      navTicking = true;
    }
  });

  // ── SMOOTH SCROLL ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── 60-SEC CLOCK — with smooth transitions ──
  const clockItems = document.querySelectorAll('.clock-item');
  let clockIdx = 0;
  if (clockItems.length) {
    clockItems[0].classList.add('active');
    setInterval(() => {
      clockItems.forEach((item, i) => item.classList.toggle('active', i === clockIdx));
      clockIdx = (clockIdx + 1) % clockItems.length;
    }, 2200);
  }

  // ── MAGNETIC BUTTONS — subtle pull effect ──
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── TILT EFFECT ON CARDS ──
  document.querySelectorAll('.col-card, .clock-widget').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── PARALLAX PHASE MARKERS ──
  let parallaxTicking = false;
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        document.querySelectorAll('.phase-marker').forEach(marker => {
          const rect = marker.getBoundingClientRect();
          const visible = rect.top < window.innerHeight && rect.bottom > 0;
          if (visible) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const num = marker.querySelector('.phase-num');
            if (num) {
              num.style.transform = `translateY(${(progress - 0.5) * -15}px)`;
            }
          }
        });
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  });

  // ── TYPING EFFECT FOR HERO (subtle) ──
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    const text = heroSub.textContent;
    heroSub.style.opacity = '0';
    setTimeout(() => {
      heroSub.style.opacity = '';
    }, 700);
  }

  // ── REDUCE MOTION PREFERENCE ──
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animFrame);
    canvas.remove();
    cursorGlow.remove();
    document.querySelectorAll('.reveal-element').forEach(el => {
      el.classList.add('visible');
      el.style.transition = 'none';
    });
  }

})();
