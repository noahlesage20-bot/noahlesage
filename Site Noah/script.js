document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ──────────────────────────────────────────────────────────────
  const loader        = document.getElementById('loader');
  const bandTop       = document.getElementById('loader-band-top');
  const bandMid       = document.getElementById('loader-band-mid');
  const bandBot       = document.getElementById('loader-band-bot');
  const loaderPct     = document.getElementById('loader-percent');
  const site          = document.getElementById('site');
  const overlay       = document.getElementById('page-transition');
  const navLinks      = document.querySelectorAll('.js-nav');
  const pages         = document.querySelectorAll('.page');
  const cursorDot     = document.getElementById('cursor-dot');
  const cursorRing    = document.getElementById('cursor-ring');

  // ── Custom Cursor ─────────────────────────────────────────────────────────
  let mX = 0, mY = 0, rX = 0, rY = 0;
  let cursorVisible = false;

  document.addEventListener('mousemove', e => {
    mX = e.clientX;
    mY = e.clientY;
    cursorDot.style.left = mX + 'px';
    cursorDot.style.top  = mY + 'px';
    if (!cursorVisible) {
      cursorDot.style.opacity  = '1';
      cursorRing.style.opacity = '1';
      cursorVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity  = '0';
    cursorRing.style.opacity = '0';
    cursorVisible = false;
  });

  (function tickCursor() {
    rX += (mX - rX) * 0.1;
    rY += (mY - rY) * 0.1;
    cursorRing.style.left = rX + 'px';
    cursorRing.style.top  = rY + 'px';
    requestAnimationFrame(tickCursor);
  })();

  function enlargeCursor() { cursorRing.style.width = '56px'; cursorRing.style.height = '56px'; }
  function restoreCursor() { cursorRing.style.width = '36px'; cursorRing.style.height = '36px'; }

  document.querySelectorAll('a, button, .proj-item').forEach(el => {
    el.addEventListener('mouseenter', enlargeCursor);
    el.addEventListener('mouseleave', restoreCursor);
  });

  // ── Loader ────────────────────────────────────────────────────────────────
  let progress = 0;
  let done     = false;

  function lColor(top, mid, bot) {
    bandTop.style.backgroundColor = top;
    bandMid.style.backgroundColor = mid;
    bandBot.style.backgroundColor = bot;
  }

  function lFlex(top, mid, bot) {
    bandTop.style.flexGrow = top;
    bandMid.style.flexGrow = mid;
    bandBot.style.flexGrow = bot;
  }

  function applyStage(p) {
    if (p < 28) {
      // 0% — Jaune uni
      lColor('#f6ff90', '#f6ff90', '#f6ff90');
      lFlex(38, 24, 38);

    } else if (p < 50) {
      // 25% — Bandes bleues + blanc, épaisses
      lColor('#a2c4fa', '#ffffff', '#a2c4fa');
      lFlex(38, 24, 38);

    } else if (p < 75) {
      // 50%→75% — Rose puis crème, bandes s'amincissent progressivement
      const t     = (p - 50) / 25;                      // 0 → 1
      const sides = Math.round(38 - t * 25);             // 38 → 13
      const color = p < 62 ? '#f2b9d1' : '#f4f2d7';     // rose → crème à mi-chemin
      lColor(color, '#ffffff', color);
      lFlex(sides, 100 - sides * 2, sides);

    } else if (p < 100) {
      // 75%→100% — Crème, bandes fines qui disparaissent
      const t     = (p - 75) / 25;                      // 0 → 1
      const sides = Math.max(0, Math.round(13 * (1 - t))); // 13 → 0
      lColor('#f4f2d7', '#ffffff', '#f4f2d7');
      lFlex(sides, 100 - sides * 2, sides);

    } else {
      // 100% — Tout blanc
      lColor('#ffffff', '#ffffff', '#ffffff');
      lFlex(0, 100, 0);
    }
  }

  const step = () => {
    if (done) return;
    progress += Math.floor(Math.random() * 4) + 1;

    if (progress >= 100) {
      progress = 100;
      done = true;
      loaderPct.textContent = '100%';
      applyStage(100);
      setTimeout(revealSite, 700);
      return;
    }

    loaderPct.textContent = progress + '%';
    applyStage(progress);
    setTimeout(step, 28 + Math.random() * 22);
  };

  setTimeout(step, 120);

  function revealSite() {
    // Le site s'active derrière le loader blanc — fond identique, invisible
    site.classList.remove('is-hidden');
    const home = document.getElementById('page-home');
    home.classList.add('is-active');

    // Le loader se lève lentement : le contenu home commence à percer (nav, captions)
    // pendant que "100%" est encore présent — exactement comme dans le Figma
    setTimeout(() => {
      loader.classList.add('is-gone'); // fondu 0.9s
      home.classList.add('anim-ready'); // éléments animent pendant le fondu
    }, 380);

    setTimeout(() => loader.remove(), 1400);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  let current = 'home';
  let transitioning = false;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.target;
      if (target === current || transitioning) return;
      navigateTo(target);
    });
  });

  const projPages  = new Set(['matiere','stoxl','tapage','palais','calsmith','refonte','ringer','poster']);
  const siteHeader = document.getElementById('header');
  const pageTitles = {
    home: 'Ringer Studio.', work: 'Work — Ringer Studio.', photo: 'Photo — Ringer Studio.',
    hello: 'Contact — Ringer Studio.', matiere: 'Matière Créative — Ringer Studio.',
    stoxl: 'From S to XL — Ringer Studio.', tapage: 'Tapage — Ringer Studio.',
    palais: 'Palais Bulles — Ringer Studio.', calsmith: 'Cal Smith — Ringer Studio.',
    refonte: 'Refonte JOP 2024 — Ringer Studio.', ringer: 'Ringer Projet — Ringer Studio.',
    poster: 'Poster — Ringer Studio.',
  };

  function updateNavActive(target) {
    const workPages = ['work','matiere','stoxl','tapage','palais','calsmith','refonte','ringer','poster'];
    const mainTarget = workPages.includes(target) ? 'work' : target;
    navLinks.forEach(l => l.classList.toggle('is-active', l.dataset.target === mainTarget));
    if (pageTitles[target]) document.title = pageTitles[target];
  }

  updateNavActive('home');

  function showPage(target) {
    pages.forEach(p => p.classList.remove('is-active', 'anim-ready', 'page-exiting'));
    const next = document.getElementById('page-' + target);
    if (!next) return null;
    next.scrollTop = 0;
    next.classList.add('is-active');
    if (siteHeader) siteHeader.classList.toggle('is-proj', projPages.has(target));
    if (target === 'matiere') setTimeout(checkMCReveal, 80);
    return next;
  }

  function navigateTo(target) {
    transitioning = true;
    document.body.classList.add('is-transitioning');

    const curPage = document.querySelector('.page.is-active');
    if (curPage) curPage.classList.add('page-exiting');

    setTimeout(() => {
      const nextEl = showPage(target);
      current = target;
      updateNavActive(target);

      requestAnimationFrame(() => {
        if (nextEl) nextEl.classList.add('anim-ready');
      });

      setTimeout(() => {
        document.body.classList.remove('is-transitioning');
        transitioning = false;
      }, 500);
    }, 280);
  }

  // ── Roulette factory (shared by Work & Photo) ────────────────────────────
  function initRoulette(rouletteId, trackId, imgId, startIdx) {
    const roulette = document.getElementById(rouletteId);
    const track    = document.getElementById(trackId);
    const img      = document.getElementById(imgId);
    if (!roulette || !track || !img) return;

    const items = Array.from(track.querySelectorAll('.proj-roulette-item'));
    let activeIdx  = startIdx || 0;
    let currentSrc = items[activeIdx] ? items[activeIdx].dataset.img : '';
    let lastWheel  = 0;

    function applyStyles() {
      items.forEach((item, i) => {
        const dist = Math.abs(i - activeIdx);
        // Opacity: active → adjacent → distant
        const opacities = [1, 0.5, 0.28, 0.12, 0.04];
        item.style.opacity = opacities[Math.min(dist, opacities.length - 1)];
        item.classList.toggle('is-active', dist === 0);
      });
    }

    function centerTrack() {
      const activeEl = items[activeIdx];
      if (!activeEl) return;
      const roulRect   = roulette.getBoundingClientRect();
      const itemRect   = activeEl.getBoundingClientRect();
      const roulCenter = roulRect.top + roulRect.height / 2;
      const itemCenter = itemRect.top + itemRect.height / 2;
      const delta      = roulCenter - itemCenter;
      const matrix     = new DOMMatrix(getComputedStyle(track).transform);
      track.style.transform = `translateY(${matrix.m42 + delta}px)`;
    }

    function changeImage(src) {
      if (!src || src === currentSrc) return;
      currentSrc = src;
      img.classList.add('is-fading');
      setTimeout(() => {
        img.src = src;
        img.classList.remove('is-fading');
      }, 420);
    }

    function setActive(idx) {
      idx = Math.max(0, Math.min(items.length - 1, idx));
      if (idx === activeIdx) return;
      activeIdx = idx;
      applyStyles();
      // Re-center: once now (fast), once after font-size transition ends
      centerTrack();
      setTimeout(centerTrack, 520);
      changeImage(items[idx].dataset.img);
    }

    // Wheel — scroll on roulette area cycles projects
    roulette.addEventListener('wheel', e => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 380) return;
      lastWheel = now;
      setActive(activeIdx + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    // Touch support
    let touchY = 0;
    roulette.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    roulette.addEventListener('touchend', e => {
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 28) setActive(activeIdx + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Click: inactive → activate; active + data-page → navigate
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i !== activeIdx) { setActive(i); return; }
        if (item.dataset.page) navigateTo(item.dataset.page);
      });
    });

    // Image cliquable → navigue vers le projet actif
    const imgWrap = img.closest('.gallery-img-wrap');
    if (imgWrap) {
      imgWrap.style.cursor = 'pointer';
      imgWrap.addEventListener('click', () => {
        const page = items[activeIdx] && items[activeIdx].dataset.page;
        if (page && !transitioning) navigateTo(page);
      });
    }

    // Initial state
    applyStyles();
    requestAnimationFrame(() => { requestAnimationFrame(centerTrack); });
    window.addEventListener('resize', centerTrack);
  }

  // Initialise les deux roulettes
  initRoulette('work-roulette',  'work-track',  'work-img',  0);
  initRoulette('photo-roulette', 'photo-track', 'photo-img', 0);

  // ── Back button (Ringer projet → Work) ───────────────────────────────────
  document.querySelectorAll('.js-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitioning) return;
      navigateTo('work');
    });
  });

  // ── Matière Créative — toggle FR / EN ────────────────────────────────────
  (function initMCLang() {
    const page = document.getElementById('page-matiere');
    if (!page) return;

    let currentLang = 'fr';

    function applyLang(lang) {
      currentLang = lang;
      // Boutons
      page.querySelectorAll('.mc-lang-btn').forEach(b =>
        b.classList.toggle('is-active', b.dataset.lang === lang)
      );
      // Éléments bilingues
      page.querySelectorAll('.mc-v').forEach(el => {
        el.classList.toggle('is-shown', el.dataset.version === lang);
      });
    }

    page.querySelectorAll('.mc-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });

    // État initial
    applyLang('fr');
  })();

  // ── Matière Créative — scroll reveal ────────────────────────────────────
  const mcPage = document.getElementById('page-matiere');
  function checkMCReveal() {
    if (!mcPage) return;
    mcPage.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 50) el.classList.add('is-visible');
    });
  }
  if (mcPage) mcPage.addEventListener('scroll', checkMCReveal, { passive: true });

  // ── Home — mouse parallax ─────────────────────────────────────────────────
  const homeSection = document.getElementById('page-home');
  const heroImg     = homeSection && homeSection.querySelector('.hero-img');

  if (heroImg) {
    homeSection.addEventListener('mousemove', e => {
      const { width, height, left, top } = homeSection.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 18;
      const y = ((e.clientY - top)  / height - 0.5) * 14;
      heroImg.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
    });
    homeSection.addEventListener('mouseleave', () => {
      heroImg.style.transform = '';
    });
  }

  // ── Say Hello — image parallax on scroll ──────────────────────────────────
  const helloSection = document.getElementById('page-hello');
  const helloImg     = helloSection && helloSection.querySelector('.hello-img');
  const helloImgWrap = helloSection && helloSection.querySelector('.hello-img-wrap');

  if (helloSection && helloImg && helloImgWrap) {
    helloSection.addEventListener('scroll', () => {
      const wrapTop = helloImgWrap.getBoundingClientRect().top;
      const offset  = Math.max(-80, Math.min(20, wrapTop * 0.2));
      helloImg.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

});
