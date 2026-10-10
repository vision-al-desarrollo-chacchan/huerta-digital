(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  function closeMenu() {
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
    closeMenu();
  });
  function markNavigation(hash) {
    navigation.querySelectorAll('a').forEach(link => {
      const active = link.hash === hash;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', () => {
    markNavigation(location.hash || '#inicio');
    const target = document.getElementById(location.hash.slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  });
  if (location.hash) {
    markNavigation(location.hash);
    const target = document.getElementById(location.hash.slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }
  if ('IntersectionObserver' in window && !motion.matches) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.erp-container, .services-heading, .category-block, .steps-grid, .faq-grid, .contact-card').forEach(element => {
      element.classList.add('reveal-ready'); reveal.observe(element);
    });
  }
  const canvas = document.querySelector('.tech-particles');
  const context = canvas.getContext('2d');
  if (!context) return;
  let width = 0, height = 0, dots = [], frame = 0, last = 0, inView = true;
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    dots = Array.from({ length: width < 650 ? 26 : 52 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .1,
      radius: Math.random() * 1.7 + .6
    }));
  }
  function draw(time) {
    frame = 0;
    if (motion.matches || document.hidden || !inView) { last = 0; return; }
    // Cap the update rate at 30 fps, using elapsed time for smooth motion.
    if (time - last >= 33) {
      const delta = last ? Math.min(time - last, 100) / 16.67 : 1;
      last = time; context.clearRect(0, 0, width, height);
      dots.forEach((dot, index) => {
        dot.x = (dot.x + dot.vx * delta + width) % width;
        dot.y = (dot.y + dot.vy * delta + height) % height;
        context.fillStyle = '#53cce9'; context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2); context.fill();
        for (let j = index + 1; j < dots.length; j++) {
          const other = dots[j], distance = Math.hypot(dot.x - other.x, dot.y - other.y);
          if (distance < 125) {
            context.strokeStyle = `rgba(81,185,219,${(1 - distance / 125) * .32})`;
            context.lineWidth = .6; context.beginPath();
            context.moveTo(dot.x, dot.y); context.lineTo(other.x, other.y); context.stroke();
          }
        }
      });
    }
    frame = requestAnimationFrame(draw);
  }
  function resume() {
    if (!frame && !motion.matches && !document.hidden && inView) frame = requestAnimationFrame(draw);
  }
  resize(); resume();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', resume);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting; resume();
    }).observe(canvas);
  }
})();
