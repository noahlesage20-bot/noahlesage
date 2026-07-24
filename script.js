document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ──────────────────────────────────────────────────────────────
  const loader        = document.getElementById('loader');
  const loaderBg      = document.getElementById('loader-bg');
  const loaderBrand   = document.getElementById('loader-brand');
  const loaderPct     = document.getElementById('loader-percent');
  const site          = document.getElementById('site');
  const overlay       = document.getElementById('page-transition');
  const navLinks      = document.querySelectorAll('.js-nav');
  const pages         = document.querySelectorAll('.page');
  const cursorDot     = document.getElementById('cursor-dot');

  // ── Protection des assets visuels ────────────────────────────────────────
  document.addEventListener('contextmenu', e => {
    const isMedia = e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO';
    const inMediaContainer = e.target.closest(
      '.hero-img-wrap, .work-img-area, .voyage-photo, .voyage-gallery-item, ' +
      '.voyage-lightbox, .photo-hover-wrap, #loader'
    );
    if (isMedia || inMediaContainer) e.preventDefault();
  });

  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
  });

  // ── Custom Cursor ─────────────────────────────────────────────────────────
  let mX = 0, mY = 0;
  let cursorVisible = false;

  document.addEventListener('mousemove', e => {
    mX = e.clientX;
    mY = e.clientY;
    cursorDot.style.left = mX + 'px';
    cursorDot.style.top  = mY + 'px';
    if (!cursorVisible) {
      cursorDot.style.opacity  = '1';
      cursorVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity  = '0';
    cursorVisible = false;
  });

  // ── Loader = Orbit ───────────────────────────────────────────────────────
  const O_SRCS  = ['mc-poster.jpg', 'From S to XL anim.mp4', 'Palais bulles.jpg', 'Cal Smith.jpg', 'a2.jpg'];
  const O_TILTS = [-8, 12, -4, 9, -13];
  O_SRCS.forEach(src => { const i = new Image(); i.src = src; });

  const O_VW = window.innerWidth, O_VH = window.innerHeight;
  const O_N  = O_SRCS.length;
  const O_R  = Math.min(O_VW, O_VH) * 0.26;
  const O_W  = Math.min(O_VW * 0.17, 210);
  const O_H  = O_W * 1.32;
  const O_CX = O_VW / 2;
  const O_CY = O_VH / 2;

  let orbitAngle   = 0;
  let orbitRunning = true;
  let progress     = 0;
  let done         = false;

  // Build orbit wraps inside loader (% and brand overlay on top via z-index:1)
  const orbitWraps = O_SRCS.map((src, i) => {
    const a = (i / O_N) * 2 * Math.PI;
    const x = O_CX + Math.cos(a) * O_R - O_W / 2;
    const y = O_CY + Math.sin(a) * O_R - O_H / 2;
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:absolute;width:${O_W}px;height:${O_H}px;
      overflow:hidden;border-radius:4px;
      box-shadow:0 4px 22px rgba(0,0,0,0.12);
      will-change:transform;opacity:0;transition:opacity 0.5s ease;
      transform:translate(${x}px,${y}px) rotate(${O_TILTS[i]}deg);
    `;
    const media = src.endsWith('.mp4') ? document.createElement('video') : document.createElement('img');
    media.src = src;
    if (media.tagName === 'VIDEO') { media.muted = true; media.loop = true; media.autoplay = true; media.setAttribute('playsinline',''); }
    media.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    wrap.appendChild(media);
    loader.appendChild(wrap);
    return wrap;
  });

  // Stagger appear
  orbitWraps.forEach((w, i) => setTimeout(() => { w.style.opacity = '1'; }, 150 + i * 90));

  // Continuous orbit loop (runs all through loading)
  function orbitLoop() {
    if (!orbitRunning) return;
    orbitAngle += 0.45;
    orbitWraps.forEach((wrap, i) => {
      const a = ((i / O_N) * 360 + orbitAngle) * Math.PI / 180;
      const x = O_CX + Math.cos(a) * O_R - O_W / 2;
      const y = O_CY + Math.sin(a) * O_R - O_H / 2;
      wrap.style.transform = `translate(${x}px,${y}px) rotate(${O_TILTS[i]}deg)`;
    });
    requestAnimationFrame(orbitLoop);
  }
  requestAnimationFrame(orbitLoop);

  // % counter (orbit already running, just update text)
  const step = () => {
    if (done) return;
    progress += Math.floor(Math.random() * 4) + 2;
    if (progress >= 100) {
      progress = 100;
      done = true;
      loaderPct.textContent = '100%';
      loaderBrand.classList.add('is-visible');
      setTimeout(revealSite, 420);
      return;
    }
    loaderPct.textContent = progress + '%';
    setTimeout(step, 16 + Math.random() * 14);
  };
  setTimeout(step, 120);

  // ── Scramble typographie ──────────────────────────────────────────────────
  const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz';

  function scrambleLine(el, text, delay) {
    if (!el) return;
    el.style.opacity = '0';
    el.textContent   = '';
    setTimeout(() => {
      el.style.opacity = '1';
      let frame = 0;
      const FPR   = 3; // frames to settle per character
      const total = text.length * FPR + 8;
      (function tick() {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          out += frame >= (i + 1) * FPR
            ? text[i]
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        el.textContent = out;
        if (++frame < total) requestAnimationFrame(tick);
        else el.textContent = text;
      })();
    }, delay);
  }

  function burstFunDots() {
    if (!funLayer) return;
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 8 : 14;
    const size  = isMobile ? 60 : 80;
    const w = window.innerWidth, h = window.innerHeight;
    const tempDots = [];

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'fun-dot';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*(w-size)}px;top:${Math.random()*(h-size)}px;pointer-events:none`;
      funLayer.appendChild(dot);
      tempDots.push(dot);
      setTimeout(() => dot.classList.add('is-in'), i * 60);
    }

    // Disparition automatique après 1.6s
    setTimeout(() => {
      tempDots.forEach((dot, i) => setTimeout(() => {
        dot.classList.remove('is-in');
        dot.classList.add('is-out');
        setTimeout(() => dot.remove(), 430);
      }, i * 35));
    }, 1600);
  }

  function revealSite() {
    // Suppression du loader en priorité absolue — rien ne doit bloquer ça
    setTimeout(() => { if (loader) loader.classList.add('is-gone'); }, 480);
    setTimeout(() => { orbitRunning = false; if (loader) loader.remove(); }, 1700);

    // Réveil du site
    if (site) site.classList.remove('is-hidden');
    const workPage = document.getElementById('page-work');
    if (workPage) {
      workPage.classList.add('is-active');
      requestAnimationFrame(() => requestAnimationFrame(() => workPage.classList.add('anim-ready')));
    }

    // État navigation (isolé pour ne pas bloquer le reste)
    try {
      current = 'work';
      updateNavActive('work');
    } catch (e) {}

    setTimeout(burstFunDots, 1750);
    setTimeout(() => {
      const el = document.querySelector('#work-scroll-hint .work-hint-line');
      if (el) scrambleLine(el, 'scroll ↑ ↓', 200);
    }, 700);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  let current = 'work';
  let transitioning = false;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.target;
      if (target === current || transitioning) return;
      navigateTo(target);
    });
  });

  const projPages     = new Set(['matiere','stoxl','tapage','palais','calsmith','poster']);
  const photoSubPages = new Set(['photo-event','photo-street','photo-voyage']);
  const siteHeader    = document.getElementById('header');
  const pageTitles = {
    home: 'Ringer Studio.', work: 'Work — Ringer Studio.', photo: 'Photo — Ringer Studio.',
    hello: 'Contact — Ringer Studio.', matiere: 'Matière Créative — Ringer Studio.',
    stoxl: 'From S to XL — Ringer Studio.', tapage: 'Tapage — Ringer Studio.',
    palais: 'Palais Bulles — Ringer Studio.', calsmith: 'Cal Smith — Ringer Studio.',
    poster: 'Poster — Ringer Studio.',
    'photo-event': 'Évènement — Ringer Studio.',
    'photo-street': 'Street — Ringer Studio.',
    'photo-voyage': 'Voyage — Ringer Studio.',
  };

  function updateNavActive(target) {
    const workPages  = ['work','matiere','stoxl','tapage','palais','calsmith','poster'];
    const photoPages = ['photo','photo-event','photo-street','photo-voyage'];
    const mainTarget = workPages.includes(target) ? 'work'
                     : photoPages.includes(target) ? 'photo'
                     : target;
    navLinks.forEach(l => l.classList.toggle('is-active', l.dataset.target === mainTarget));
    if (pageTitles[target]) document.title = pageTitles[target];
  }

  const globalFooter = document.getElementById('global-footer');

  function showPage(target) {
    pages.forEach(p => {
      p.classList.remove('is-active', 'anim-ready', 'page-exiting');
      p.style.clipPath = '';
    });
    if (globalFooter) globalFooter.classList.remove('is-visible');
    const next = document.getElementById('page-' + target);
    if (!next) return null;
    next.scrollTop = 0;
    next.classList.add('is-active');
    if (siteHeader) siteHeader.classList.toggle('is-proj', projPages.has(target));
    if (siteHeader) siteHeader.classList.toggle('is-hello', target === 'hello');
    if (target === 'matiere') setTimeout(checkMCReveal, 80);
    // Reveal initial + progress bar pour les pages projet génériques
    if (projPages.has(target) && target !== 'matiere') {
      setTimeout(() => {
        if (!next) return;
        next.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight + 50) el.classList.add('is-visible');
        });
      }, 80);
    }
    // Reveal initial pour les sous-pages photo
    if (photoSubPages.has(target)) {
      setTimeout(() => {
        if (!next) return;
        next.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight + 80) el.classList.add('is-visible');
        });
      }, 80);
    }
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

      if (target === 'work') setTimeout(() => {
        const el = document.querySelector('#work-scroll-hint .work-hint-line');
        if (el) scrambleLine(el, 'scroll ↑ ↓', 200);
      }, 120);

      requestAnimationFrame(() => {
        if (nextEl) nextEl.classList.add('anim-ready');
      });

      setTimeout(() => {
        document.body.classList.remove('is-transitioning');
        transitioning = false;
      }, 380);
    }, 220);
  }

  // ── Roulette factory (shared by Work & Photo) ────────────────────────────
  function initRoulette(rouletteId, trackId, imgId, startIdx) {
    const roulette = document.getElementById(rouletteId);
    const track    = document.getElementById(trackId);
    const img      = document.getElementById(imgId);
    if (!roulette || !track || !img) return;

    const items = Array.from(track.querySelectorAll('.proj-roulette-item'));
    let activeIdx  = startIdx || 0;
    let currentSrc = items[activeIdx] ? (items[activeIdx].dataset.video || items[activeIdx].dataset.img) : '';
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

    // Double buffer pour crossfade fluide img↔img + img↔vid
    const absCSS = 'display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    const wrap   = img.parentNode;
    if (wrap) wrap.style.position = 'relative';

    // imgA = img d'origine (déjà dans le DOM, on le rend absolu)
    const imgA = img;
    imgA.style.cssText = absCSS.replace('display:none', 'display:block');

    // imgB = buffer arrière pour les transitions img↔img
    const imgB = document.createElement('img');
    imgB.className   = 'gallery-img';
    imgB.style.cssText = absCSS;
    if (wrap) wrap.appendChild(imgB);

    // vid = élément vidéo
    const vid = document.createElement('video');
    vid.className = 'gallery-img';
    vid.muted = true; vid.loop = true; vid.setAttribute('playsinline', '');
    vid.style.cssText = absCSS;
    if (wrap) wrap.appendChild(vid);

    let activeImg  = 'A'; // quel buffer img est visible : 'A' | 'B'
    let showingVid = false;
    let pendingXF  = null;

    function xfade(curEl, nxtEl, dy, onDone) {
      clearTimeout(pendingXF);
      [imgA, imgB, vid].forEach(el => {
        if (el !== curEl && el !== nxtEl) {
          el.style.display = 'none'; el.classList.remove('is-fading');
          el.style.zIndex = ''; el.style.opacity = ''; el.style.transform = '';
        }
      });
      curEl.classList.remove('is-fading');
      curEl.style.display   = 'block';
      curEl.style.zIndex    = '1';
      curEl.style.opacity   = '1';
      curEl.style.transform = 'translateY(0px)';

      nxtEl.classList.remove('is-fading');
      nxtEl.style.display   = 'block';
      nxtEl.style.zIndex    = '0';
      nxtEl.style.opacity   = '0';
      nxtEl.style.transform = `translateY(${dy}px)`;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        nxtEl.style.opacity   = '1';
        nxtEl.style.transform = 'translateY(0px)';
        curEl.style.opacity   = '0';
        curEl.style.transform = `translateY(${-dy}px)`;
      }));

      pendingXF = setTimeout(() => {
        curEl.style.display   = 'none';
        curEl.style.opacity   = '';
        curEl.style.transform = '';
        curEl.style.zIndex    = '';
        nxtEl.style.zIndex    = '';
        onDone && onDone();
      }, 500);
    }

    function changeMedia(item, dir) {
      const isVideo = !!(item.dataset.video);
      const newSrc  = isVideo ? item.dataset.video : item.dataset.img;
      if (!newSrc || newSrc === currentSrc) return;
      currentSrc = newSrc;
      const dy = (dir || 1) * 40;

      const curImg = activeImg === 'A' ? imgA : imgB;
      const nxtImg = activeImg === 'A' ? imgB : imgA;

      if (isVideo) {
        vid.src = newSrc; vid.load(); vid.play().catch(() => {});
        const curEl = showingVid ? vid : curImg;
        if (curEl !== vid) xfade(curEl, vid, dy, () => { showingVid = true; });
      } else {
        nxtImg.src = newSrc;
        const curEl = showingVid ? vid : curImg;
        xfade(curEl, nxtImg, dy, () => {
          if (showingVid) { vid.pause(); vid.src = ''; showingVid = false; }
          activeImg = activeImg === 'A' ? 'B' : 'A';
        });
      }
    }

    function setActive(idx) {
      idx = Math.max(0, Math.min(items.length - 1, idx));
      if (idx === activeIdx) return;
      const dir = idx > activeIdx ? 1 : -1;
      activeIdx = idx;
      applyStyles();
      centerTrack();
      setTimeout(centerTrack, 520);
      changeMedia(items[idx], dir);
    }

    // Wheel — scroll on roulette area cycles projects
    roulette.addEventListener('wheel', e => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 380) return;
      lastWheel = now;
      setActive(activeIdx + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    // Touch roulette — preventDefault pour ne pas scroller la page
    let touchY = 0;
    roulette.addEventListener('touchstart', e => {
      touchY = e.touches[0].clientY;
    }, { passive: true });
    roulette.addEventListener('touchmove', e => {
      e.preventDefault(); // bloque le scroll vertical de la page quand on swipe la roulette
    }, { passive: false });
    roulette.addEventListener('touchend', e => {
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 20) setActive(activeIdx + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Click: inactive → activate; active + data-page → navigate
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i !== activeIdx) { setActive(i); return; }
        if (item.dataset.page) navigateTo(item.dataset.page);
      });
    });

    // Image : wheel + swipe horizontal (mobile) → change de projet, tap → navigue
    const imgWrap = img.closest('.gallery-img-wrap');
    if (imgWrap) {
      imgWrap.style.cursor = 'pointer';

      imgWrap.addEventListener('click', () => {
        const page = items[activeIdx] && items[activeIdx].dataset.page;
        if (page && !transitioning) navigateTo(page);
      });

      imgWrap.addEventListener('wheel', e => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheel < 380) return;
        lastWheel = now;
        setActive(activeIdx + (e.deltaY > 0 ? 1 : -1));
      }, { passive: false });

      // Swipe gauche/droite sur l'image pour mobile
      let swipeX0 = 0, swipeY0 = 0;
      imgWrap.addEventListener('touchstart', e => {
        swipeX0 = e.touches[0].clientX;
        swipeY0 = e.touches[0].clientY;
      }, { passive: true });
      imgWrap.addEventListener('touchend', e => {
        const dx = swipeX0 - e.changedTouches[0].clientX;
        const dy = swipeY0 - e.changedTouches[0].clientY;
        // Ne réagit que si le geste est majoritairement horizontal
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          const now = Date.now();
          if (now - lastWheel < 380) return;
          lastWheel = now;
          setActive(activeIdx + (dx > 0 ? 1 : -1));
        }
      }, { passive: true });
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

  // ── Back button (photo sous-page → Photo) ────────────────────────────────
  document.querySelectorAll('.js-back-photo').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitioning) return;
      navigateTo('photo');
    });
  });

  // ── Scroll reveal pour les sous-pages photo ───────────────────────────────
  photoSubPages.forEach(id => {
    const pg = document.getElementById('page-' + id);
    if (!pg) return;
    pg.addEventListener('scroll', () => {
      pg.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight + 50) el.classList.add('is-visible');
      });
    }, { passive: true });
  });

  // État initial MC (data-version fr)
  document.querySelectorAll('.mc-v').forEach(el => {
    el.classList.toggle('is-shown', el.dataset.version === 'fr');
  });

  // ── Matière Créative — scroll reveal + barre de progression ─────────────
  const mcPage         = document.getElementById('page-matiere');
  const mcProgressFill = document.getElementById('mc-progress-fill');

  function checkMCReveal() {
    if (!mcPage) return;
    mcPage.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 50) el.classList.add('is-visible');
    });
  }

  if (mcPage) {
    mcPage.addEventListener('scroll', () => {
      checkMCReveal();
      if (mcProgressFill) {
        const max = mcPage.scrollHeight - mcPage.clientHeight;
        const pct = max > 0 ? (mcPage.scrollTop / max) * 100 : 0;
        mcProgressFill.style.height = pct + '%';
      }
    }, { passive: true });
  }

  // ── Pages projet — progress bar + scroll reveal ──────────────────────────
  projPages.forEach(pageId => {
    if (pageId === 'matiere') return; // géré séparément
    const projPage = document.getElementById('page-' + pageId);
    if (!projPage) return;
    const fill = projPage.querySelector('.proj-progress-fill');
    projPage.addEventListener('scroll', () => {
      // Barre de progression
      if (fill) {
        const max = projPage.scrollHeight - projPage.clientHeight;
        fill.style.height = max > 0 ? (projPage.scrollTop / max * 100) + '%' : '0%';
      }
      // Reveal au scroll
      projPage.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight + 50) el.classList.add('is-visible');
      });
    }, { passive: true });
  });

  // ── Photo — image flottante au hover ─────────────────────────────────────
  const photoHoverWrap = document.getElementById('photo-hover-wrap');
  const photoHoverImg  = document.getElementById('photo-hover-img');

  document.querySelectorAll('.photo-list-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (item.dataset.voyage || item.dataset.event || item.dataset.street) return;
      if (!photoHoverWrap || !photoHoverImg) return;
      const src = item.dataset.img;
      if (photoHoverImg.getAttribute('src') !== src) photoHoverImg.src = src;
      photoHoverWrap.classList.add('is-visible');
      document.querySelectorAll('.photo-list-item').forEach(i =>
        i.classList.toggle('is-hovered', i === item)
      );
    });
    item.addEventListener('mouseleave', () => {
      if (item.dataset.voyage || item.dataset.event || item.dataset.street) return;
      if (photoHoverWrap) photoHoverWrap.classList.remove('is-visible');
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    });

    item.addEventListener('click', () => {
      if (item.dataset.voyage || item.dataset.event || item.dataset.street) return;
      if (!transitioning) navigateTo('photo-street');
    });
  });

  // ── Voyage — scatter & gallery ────────────────────────────────────────────
  const VOYAGE_PHOTOS = [
    'Voyage/DSCF0929.JPG','Voyage/DSCF0931.JPG','Voyage/DSCF0932.JPG',
    'Voyage/DSCF0949.JPG','Voyage/DSCF0953.JPG','Voyage/DSCF0987.JPG',
    'Voyage/DSCF4796.JPG','Voyage/DSCF4861.JPG','Voyage/DSCF5823.JPG',
    'Voyage/DSCF5846.JPG','Voyage/DSCF5882.JPG','Voyage/DSCF5883.JPG',
    'Voyage/DSCF5886.JPG','Voyage/DSCF5887.JPG','Voyage/DSCF5892.JPG',
    'Voyage/DSCF5898.JPG','Voyage/DSCF5902.JPG','Voyage/DSCF8271.JPG',
  ];

  const voyageItem    = document.querySelector('.photo-list-item[data-voyage]');
  const voyageOverlay = document.getElementById('voyage-overlay');
  // state: 'off' | 'scatter' | 'gallery' | 'lightbox'
  let voyageState    = 'off';
  let vClearTimer    = null;
  let vLeaveTimer    = null;

  function vSetState(s) { voyageState = s; }

  function vTriggerHide() {
    clearTimeout(vLeaveTimer);
    vLeaveTimer = setTimeout(() => {
      if (voyageState !== 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      vHideScatter(180, () => {
        if (voyageState === 'scatter') { voyageOverlay.innerHTML = ''; vSetState('off'); }
      });
    }, 80);
  }

  function vScatter() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    voyageOverlay.innerHTML = '';
    vSetState('scatter');

    VOYAGE_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      voyageOverlay.appendChild(el);

      setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 22);
    });
  }

  function vHideScatter(ms, cb) {
    if (!voyageOverlay) return cb && cb();
    voyageOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(vClearTimer);
    // Ne pas toucher au innerHTML ici — le callback s'en charge
    // (évite le flash "DOM vide" entre scatter et galerie)
    vClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  function vOpenGallery() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    vSetState('gallery');
    voyageOverlay.innerHTML = '';
    voyageOverlay.className = 'is-gallery';

    const backdrop = document.createElement('div');
    backdrop.className = 'voyage-gallery-backdrop';
    backdrop.addEventListener('click', vClose);
    voyageOverlay.appendChild(backdrop);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'voyage-gallery-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', vClose);
    voyageOverlay.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.className = 'voyage-gallery-grid';
    VOYAGE_PHOTOS.forEach((src, i) => {
      const cell = document.createElement('div');
      cell.className = 'voyage-gallery-item';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      cell.appendChild(img);
      cell.addEventListener('click', e => { e.stopPropagation(); vLightbox(i); });
      grid.appendChild(cell);
    });
    voyageOverlay.appendChild(grid);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      voyageOverlay.classList.add('is-visible')
    ));
  }

  let vLbIdx = 0;

  function vLbClose(lb) {
    lb.classList.remove('is-visible');
    setTimeout(() => { lb.remove(); vSetState('gallery'); }, 350);
  }

  function vLbNav(lb, img, dir) {
    vLbIdx = (vLbIdx + dir + VOYAGE_PHOTOS.length) % VOYAGE_PHOTOS.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = VOYAGE_PHOTOS[vLbIdx]; img.style.opacity = '1'; }, 230);
  }

  function vLightbox(idx) {
    vSetState('lightbox');
    vLbIdx = idx;

    const lb = document.createElement('div');
    lb.className = 'voyage-lightbox';

    const img = document.createElement('img');
    img.className = 'voyage-lb-img';
    img.src = VOYAGE_PHOTOS[idx]; img.alt = '';
    img.addEventListener('click', () => vLbClose(lb));

    const prev = document.createElement('button');
    prev.className = 'voyage-lb-btn voyage-lb-prev';
    prev.innerHTML = '&#8592;';
    prev.addEventListener('click', e => { e.stopPropagation(); vLbNav(lb, img, -1); });

    const next = document.createElement('button');
    next.className = 'voyage-lb-btn voyage-lb-next';
    next.innerHTML = '&#8594;';
    next.addEventListener('click', e => { e.stopPropagation(); vLbNav(lb, img, 1); });

    lb.append(img, prev, next);
    // Clic sur le fond (hors image) → ferme
    lb.addEventListener('click', e => { if (e.target === lb) vLbClose(lb); });
    document.body.appendChild(lb);
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-visible')));
  }

  function vClose() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    const grid = voyageOverlay.querySelector('.voyage-gallery-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.16s ease, translate 0.18s cubic-bezier(0.4,0,1,1)';
      grid.style.opacity    = '0';
      grid.style.translate  = '0 -14px';
    }
    vClearTimer = setTimeout(() => {
      voyageOverlay.classList.remove('is-visible');
      vClearTimer = setTimeout(() => {
        voyageOverlay.innerHTML = '';
        voyageOverlay.className = '';
        vSetState('off');
        document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      }, 260);
    }, 140);
  }

  if (voyageItem && voyageOverlay) {
    voyageItem.addEventListener('mouseenter', () => {
      clearTimeout(vLeaveTimer);
      clearTimeout(vClearTimer);
      if (eventState === 'scatter')  { clearTimeout(eLeaveTimer); eHideScatter(120, () => { eventOverlay.innerHTML = ''; eSetState('off'); }); }
      if (streetState === 'scatter') { clearTimeout(sLeaveTimer); sHideScatter(120, () => { streetOverlay.innerHTML = ''; sSetState('off'); }); }
      if (voyageState === 'gallery' || voyageState === 'lightbox') return;
      if (voyageState === 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i =>
        i.classList.toggle('is-hovered', i === voyageItem)
      );
      vScatter();
    });

    voyageItem.addEventListener('mouseleave', () => {
      if (voyageState === 'gallery' || voyageState === 'lightbox') return;
      if (voyageState === 'scatter') vTriggerHide();
    });

    voyageItem.addEventListener('click', e => {
      e.stopPropagation();
      clearTimeout(vLeaveTimer);
      if (voyageState === 'scatter') {
        vHideScatter(120, () => { voyageOverlay.innerHTML = ''; vSetState('off'); navigateTo('photo-voyage'); });
      } else {
        navigateTo('photo-voyage');
      }
    });
  }

  // ── Évènement — scatter & gallery ────────────────────────────────────────
  const EVENT_PHOTOS = [
    'evenement/DSCF0259.jpg','evenement/DSCF0314.jpg','evenement/DSCF0329.jpg',
    'evenement/DSCF0345.jpg','evenement/DSCF0347.jpg','evenement/DSCF0374.jpg',
    'evenement/DSCF0459.jpg','evenement/DSCF0600.jpg','evenement/DSCF1238.jpg',
    'evenement/DSCF1261.jpg','evenement/DSCF1292.jpg','evenement/DSCF7318.jpg',
    'evenement/DSCF7320.jpg','evenement/DSCF7332.jpg','evenement/DSCF7341.jpg',
    'evenement/DSCF7384.jpg','evenement/DSCF7567.jpg','evenement/DSCF8643.jpg',
    'evenement/DSCF9342.jpg','evenement/DSCF9391.jpg','evenement/DSCF9633.jpg',
    'evenement/DSCF9867.jpg','evenement/DSCF9891.jpg',
  ];

  const eventItem    = document.querySelector('.photo-list-item[data-event]');
  const eventOverlay = document.getElementById('event-overlay');
  let eventState   = 'off';
  let eClearTimer  = null;
  let eLeaveTimer  = null;

  function eSetState(s) { eventState = s; }

  function eTriggerHide() {
    clearTimeout(eLeaveTimer);
    eLeaveTimer = setTimeout(() => {
      if (eventState !== 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      eHideScatter(180, () => {
        if (eventState === 'scatter') { eventOverlay.innerHTML = ''; eSetState('off'); }
      });
    }, 60);
  }

  function eScatter() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    eventOverlay.innerHTML = '';
    eSetState('scatter');

    EVENT_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      eventOverlay.appendChild(el);

      setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 16);
    });
  }

  function eHideScatter(ms, cb) {
    if (!eventOverlay) return cb && cb();
    eventOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(eClearTimer);
    eClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  function eOpenGallery() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    eSetState('gallery');
    eventOverlay.innerHTML = '';
    eventOverlay.className = 'is-gallery';

    const backdrop = document.createElement('div');
    backdrop.className = 'voyage-gallery-backdrop';
    backdrop.addEventListener('click', eClose);
    eventOverlay.appendChild(backdrop);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'voyage-gallery-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', eClose);
    eventOverlay.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.className = 'voyage-gallery-grid';
    EVENT_PHOTOS.forEach((src, i) => {
      const cell = document.createElement('div');
      cell.className = 'voyage-gallery-item';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      cell.appendChild(img);
      cell.addEventListener('click', e => { e.stopPropagation(); eLightbox(i); });
      grid.appendChild(cell);
    });
    eventOverlay.appendChild(grid);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      eventOverlay.classList.add('is-visible')
    ));
  }

  let eLbIdx = 0;

  function eLbClose(lb) {
    lb.classList.remove('is-visible');
    setTimeout(() => { lb.remove(); eSetState('gallery'); }, 350);
  }

  function eLbNav(lb, img, dir) {
    eLbIdx = (eLbIdx + dir + EVENT_PHOTOS.length) % EVENT_PHOTOS.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = EVENT_PHOTOS[eLbIdx]; img.style.opacity = '1'; }, 230);
  }

  function eLightbox(idx) {
    eSetState('lightbox');
    eLbIdx = idx;

    const lb = document.createElement('div');
    lb.className = 'voyage-lightbox';

    const img = document.createElement('img');
    img.className = 'voyage-lb-img';
    img.src = EVENT_PHOTOS[idx]; img.alt = '';
    img.addEventListener('click', () => eLbClose(lb));

    const prev = document.createElement('button');
    prev.className = 'voyage-lb-btn voyage-lb-prev';
    prev.innerHTML = '&#8592;';
    prev.addEventListener('click', e => { e.stopPropagation(); eLbNav(lb, img, -1); });

    const next = document.createElement('button');
    next.className = 'voyage-lb-btn voyage-lb-next';
    next.innerHTML = '&#8594;';
    next.addEventListener('click', e => { e.stopPropagation(); eLbNav(lb, img, 1); });

    lb.append(img, prev, next);
    lb.addEventListener('click', e => { if (e.target === lb) eLbClose(lb); });
    document.body.appendChild(lb);
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-visible')));
  }

  function eClose() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    const grid = eventOverlay.querySelector('.voyage-gallery-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.16s ease, translate 0.18s cubic-bezier(0.4,0,1,1)';
      grid.style.opacity    = '0';
      grid.style.translate  = '0 -14px';
    }
    eClearTimer = setTimeout(() => {
      eventOverlay.classList.remove('is-visible');
      eClearTimer = setTimeout(() => {
        eventOverlay.innerHTML = '';
        eventOverlay.className = '';
        eSetState('off');
        document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      }, 260);
    }, 140);
  }

  if (eventItem && eventOverlay) {
    eventItem.addEventListener('mouseenter', () => {
      clearTimeout(eLeaveTimer);
      clearTimeout(eClearTimer);
      if (voyageState === 'scatter') { clearTimeout(vLeaveTimer); vHideScatter(120, () => { voyageOverlay.innerHTML = ''; vSetState('off'); }); }
      if (streetState === 'scatter') { clearTimeout(sLeaveTimer); sHideScatter(120, () => { streetOverlay.innerHTML = ''; sSetState('off'); }); }
      if (eventState === 'gallery' || eventState === 'lightbox') return;
      if (eventState === 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i =>
        i.classList.toggle('is-hovered', i === eventItem)
      );
      eScatter();
    });

    eventItem.addEventListener('mouseleave', () => {
      if (eventState === 'gallery' || eventState === 'lightbox') return;
      if (eventState === 'scatter') eTriggerHide();
    });

    eventItem.addEventListener('click', e => {
      e.stopPropagation();
      clearTimeout(eLeaveTimer);
      if (eventState === 'scatter') {
        eHideScatter(120, () => { eventOverlay.innerHTML = ''; eSetState('off'); navigateTo('photo-event'); });
      } else {
        navigateTo('photo-event');
      }
    });
  }

  // ── Street — scatter ─────────────────────────────────────────────────────
  const STREET_PHOTOS = [
    'street photo/DSCF6233.JPG',
    'street photo/A009615-R1-00-1.JPG',
    'street photo/DSCF6312.JPG',
    'street photo/DSCF6313.JPG',
    'street photo/A009615-R1-12-13.JPG',
    'street photo/DSCF6362.JPG',
    'street photo/DSCF6366.JPG',
    'street photo/A009615-R1-16-17.JPG',
    'street photo/DSCF6378.JPG',
    'street photo/DSCF6379.JPG',
    'street photo/DSCF6384.JPG',
    'street photo/DSCF6392.JPG',
    'street photo/DSCF6393.JPG',
  ];

  const streetItem    = document.querySelector('.photo-list-item[data-street]');
  const streetOverlay = document.getElementById('street-overlay');
  let streetState   = 'off';
  let sClearTimer   = null;
  let sLeaveTimer   = null;

  function sSetState(s) { streetState = s; }

  function sTriggerHide() {
    clearTimeout(sLeaveTimer);
    sLeaveTimer = setTimeout(() => {
      if (streetState !== 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      sHideScatter(180, () => {
        if (streetState === 'scatter') { streetOverlay.innerHTML = ''; sSetState('off'); }
      });
    }, 80);
  }

  function sScatter() {
    if (!streetOverlay) return;
    clearTimeout(sClearTimer);
    clearTimeout(sLeaveTimer);
    streetOverlay.innerHTML = '';
    sSetState('scatter');

    STREET_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      streetOverlay.appendChild(el);

      setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 18);
    });
  }

  function sHideScatter(ms, cb) {
    if (!streetOverlay) return cb && cb();
    streetOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(sClearTimer);
    sClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  if (streetItem && streetOverlay) {
    streetItem.addEventListener('mouseenter', () => {
      clearTimeout(sLeaveTimer);
      clearTimeout(sClearTimer);
      if (voyageState === 'scatter') { clearTimeout(vLeaveTimer); vHideScatter(120, () => { voyageOverlay.innerHTML = ''; vSetState('off'); }); }
      if (eventState  === 'scatter') { clearTimeout(eLeaveTimer); eHideScatter(120, () => { eventOverlay.innerHTML  = ''; eSetState('off'); }); }
      if (streetState === 'scatter') return;
      document.querySelectorAll('.photo-list-item').forEach(i =>
        i.classList.toggle('is-hovered', i === streetItem)
      );
      sScatter();
    });

    streetItem.addEventListener('mouseleave', () => {
      if (streetState === 'scatter') sTriggerHide();
    });

    streetItem.addEventListener('click', e => {
      e.stopPropagation();
      clearTimeout(sLeaveTimer);
      if (streetState === 'scatter') {
        sHideScatter(120, () => { streetOverlay.innerHTML = ''; sSetState('off'); navigateTo('photo-street'); });
      } else {
        navigateTo('photo-street');
      }
    });
  }

  // ── Lightbox partagé — galeries photo (évènement / street / voyage) ────────
  let pgLbSrcs = [];
  let pgLbIdx  = 0;
  let pgLbEl   = null;
  let pgLbImg  = null;

  function pgLbBuild() {
    pgLbEl = document.createElement('div');
    pgLbEl.style.cssText = [
      'position:fixed','inset:0','z-index:9600',
      'background:rgba(0,0,0,0.94)',
      'display:none','align-items:center','justify-content:center',
      'cursor:zoom-out','opacity:0','transition:opacity 0.22s ease',
    ].join(';');

    pgLbImg = document.createElement('img');
    pgLbImg.style.cssText = [
      'max-width:92vw','max-height:92vh','object-fit:contain','display:block',
      'cursor:default','user-select:none','-webkit-user-drag:none',
      'transition:opacity 0.18s ease',
    ].join(';');
    pgLbImg.addEventListener('click', e => e.stopPropagation());

    const mkBtn = (css, html, fn) => {
      const b = document.createElement('button');
      b.innerHTML = html;
      b.style.cssText = css + 'background:none;border:none;color:#fff;cursor:pointer;opacity:0.55;transition:opacity 0.2s;';
      b.addEventListener('mouseenter', () => b.style.opacity = '1');
      b.addEventListener('mouseleave', () => b.style.opacity = '0.55');
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      return b;
    };

    const prev  = mkBtn('position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8592;', () => pgLbNav(-1));
    const next  = mkBtn('position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8594;', () => pgLbNav(1));
    const close = mkBtn('position:absolute;top:16px;right:22px;font-size:30px;padding:8px;line-height:1;', '&times;', pgLbClose);

    pgLbEl.append(pgLbImg, prev, next, close);
    pgLbEl.addEventListener('click', pgLbClose);
    document.body.appendChild(pgLbEl);
  }

  function pgLbOpen(srcs, idx) {
    pgLbSrcs = srcs;
    pgLbIdx  = idx;
    if (!pgLbEl) pgLbBuild();
    pgLbImg.src = pgLbSrcs[pgLbIdx];
    pgLbEl.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => pgLbEl.style.opacity = '1'));
  }

  function pgLbNav(dir) {
    pgLbIdx = (pgLbIdx + dir + pgLbSrcs.length) % pgLbSrcs.length;
    pgLbImg.style.opacity = '0';
    setTimeout(() => { pgLbImg.src = pgLbSrcs[pgLbIdx]; pgLbImg.style.opacity = '1'; }, 180);
  }

  function pgLbClose() {
    if (!pgLbEl) return;
    pgLbEl.style.opacity = '0';
    setTimeout(() => { if (pgLbEl) pgLbEl.style.display = 'none'; }, 230);
  }

  // Évènement
  document.querySelectorAll('#page-photo-event .pg-event-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  // Street
  document.querySelectorAll('#page-photo-street .pg-event-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  // Voyage
  document.querySelectorAll('#page-photo-voyage .pg-voyage-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  document.addEventListener('keydown', e => {
    // Photo lightbox partagé
    if (pgLbEl && pgLbEl.style.display !== 'none' && pgLbEl.style.opacity !== '0') {
      if (e.key === 'Escape')         { pgLbClose(); return; }
      if (e.key === 'ArrowLeft')      { pgLbNav(-1); return; }
      if (e.key === 'ArrowRight')     { pgLbNav(1);  return; }
    }
    // Voyage lightbox
    if (voyageState === 'lightbox') {
      const lb  = document.querySelector('.voyage-lightbox');
      const img = lb?.querySelector('.voyage-lb-img');
      if (!lb) return;
      if (e.key === 'Escape')          vLbClose(lb);
      else if (e.key === 'ArrowLeft')  vLbNav(lb, img, -1);
      else if (e.key === 'ArrowRight') vLbNav(lb, img,  1);
      return;
    }
    // Évènement lightbox
    if (eventState === 'lightbox') {
      const lb  = document.querySelector('.voyage-lightbox');
      const img = lb?.querySelector('.voyage-lb-img');
      if (!lb) return;
      if (e.key === 'Escape')          eLbClose(lb);
      else if (e.key === 'ArrowLeft')  eLbNav(lb, img, -1);
      else if (e.key === 'ArrowRight') eLbNav(lb, img,  1);
      return;
    }
    if (e.key !== 'Escape') return;
    if (voyageState === 'gallery') vClose();
    else if (voyageState === 'scatter') {
      clearTimeout(vLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      vHideScatter(200, () => { voyageOverlay.innerHTML = ''; vSetState('off'); });
    }
    if (eventState === 'gallery') eClose();
    else if (eventState === 'scatter') {
      clearTimeout(eLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      eHideScatter(200, () => { eventOverlay.innerHTML = ''; eSetState('off'); });
    }
    if (streetState === 'scatter') {
      clearTimeout(sLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      sHideScatter(200, () => { streetOverlay.innerHTML = ''; sSetState('off'); });
    }
  });

  // ── Formulaire Say Hello — soumission AJAX ───────────────────────────────
  const helloForm = document.querySelector('.hello-form');
  if (helloForm) {
    helloForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = helloForm.querySelector('.hello-form-btn');
      btn.disabled = true;
      btn.textContent = '…';

      try {
        const res = await fetch(helloForm.action, {
          method: 'POST',
          body: new FormData(helloForm),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          btn.style.transition = 'opacity 0.3s ease';
          btn.style.opacity = '0';
          setTimeout(() => {
            btn.style.display = 'none';
            const confirm = document.createElement('p');
            confirm.className = 'hello-form-confirm';
            confirm.textContent = i18n[siteLang]['form.confirm'];
            helloForm.appendChild(confirm);
            requestAnimationFrame(() => requestAnimationFrame(() => confirm.classList.add('is-visible')));
          }, 320);
        } else {
          btn.disabled = false;
          btn.textContent = i18n[siteLang]['form.retry'];
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Réessayer →';
      }
    });
  }

  // ── Traduction FR / EN ───────────────────────────────────────────────────
  const i18n = {
    fr: {
      'hello.1': 'Un projet ?', 'hello.2': 'Un besoin ?', 'hello.3': 'Parlons-en.',
      'form.name': 'Nom', 'form.name.ph': 'Votre nom',
      'form.email.ph': 'votre@email.com',
      'form.msg.ph': 'Parlez-moi de votre projet…',
      'form.send': 'Envoyer →', 'form.retry': 'Réessayer →', 'form.confirm': 'Message envoyé — à bientôt.',
      'hello.social': 'Réseaux', 'hello.freelance': 'Freelance indépendant',
      'photo.voyage': 'Voyage', 'photo.event': 'Évènement',
      'stoxl.tagline': 'Direction artistique — Graphisme',
      'tapage.tagline': 'Graphisme — Affiche',
      'palais.tagline': 'Direction artistique — Identité visuelle',
      'calsmith.tagline': 'Graphisme — Identité visuelle',
      'poster.tagline': 'Graphisme — Sérigraphie',
      'fiche.year': 'Année',
      'stoxl.type': 'Direction artistique', 'stoxl.discipline': 'Graphisme, Identité visuelle',
      'tapage.type': 'Graphisme', 'tapage.discipline': 'Affiche, Typographie',
      'palais.type': 'Direction artistique', 'palais.discipline': 'Identité visuelle, Photographie',
      'calsmith.type': 'Graphisme', 'calsmith.discipline': 'Identité visuelle, Musique',
      'poster.type': 'Graphisme', 'poster.discipline': 'Sérigraphie, Affiche',
      'fun.btn': 'Amusement', 'fun.cta': 'Cliquez ici et amusez-vous',
      'hero.gd': 'Design graphique', 'hero.ad': 'Direction artistique',
      'hero.by': 'par Noah Lesage',
      'hero.ka': 'Animation cinétique', 'hero.ph': 'Photographie',
      'hero.cta': 'Voir mon travail →',
    },
    en: {
      'hello.1': 'A project?', 'hello.2': 'A need?', 'hello.3': "Let's talk.",
      'form.name': 'Name', 'form.name.ph': 'Your name',
      'form.email.ph': 'your@email.com',
      'form.msg.ph': 'Tell me about your project…',
      'form.send': 'Send →', 'form.retry': 'Try again →', 'form.confirm': 'Message sent — talk soon.',
      'hello.social': 'Social', 'hello.freelance': 'Independent freelance',
      'photo.voyage': 'Travel', 'photo.event': 'Event',
      'stoxl.tagline': 'Art direction — Graphic design',
      'tapage.tagline': 'Graphic design — Poster',
      'palais.tagline': 'Art direction — Visual identity',
      'calsmith.tagline': 'Graphic design — Visual identity',
      'poster.tagline': 'Graphic design — Screen printing',
      'fiche.year': 'Year',
      'stoxl.type': 'Art direction', 'stoxl.discipline': 'Graphic design, Visual identity',
      'tapage.type': 'Graphic design', 'tapage.discipline': 'Poster, Typography',
      'palais.type': 'Art direction', 'palais.discipline': 'Visual identity, Photography',
      'calsmith.type': 'Graphic design', 'calsmith.discipline': 'Visual identity, Music',
      'poster.type': 'Graphic design', 'poster.discipline': 'Screen printing, Poster',
      'fun.btn': 'Playground', 'fun.cta': 'Click here and have fun',
      'hero.gd': 'Graphic design', 'hero.ad': 'Artistic direction',
      'hero.by': 'by Noah Lesage',
      'hero.ka': 'Kinetic animation', 'hero.ph': 'Photography',
      'hero.cta': 'See my work →',
    }
  };

  let siteLang = 'fr';

  function setLang(lang) {
    siteLang = lang;
    const dict = i18n[lang];

    // Textes data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v && !el.disabled) el.textContent = v;
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const v = dict[el.dataset.i18nPh];
      if (v) el.placeholder = v;
    });
    // Matière Créative data-version
    document.querySelectorAll('.mc-v').forEach(el => {
      el.classList.toggle('is-shown', el.dataset.version === lang);
    });
    document.querySelectorAll('.mc-lang-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });
    // Bouton footer
    document.querySelectorAll('.gf-lang-opt').forEach(s => {
      s.classList.toggle('is-active', s.dataset.lang === lang);
    });
  }

  // Footer FR|EN
  const gfLangBtn = document.getElementById('gf-lang-btn');
  if (gfLangBtn) {
    gfLangBtn.addEventListener('click', e => {
      const opt = e.target.closest('.gf-lang-opt');
      if (opt && opt.dataset.lang !== siteLang) setLang(opt.dataset.lang);
    });
  }

  // Footer "Amusement" — pastilles jaunes poussées par la souris
  const funBtn   = document.getElementById('gf-fun-btn');
  const funLayer = document.getElementById('fun-dots-layer');
  let funActive  = false;
  let funDots    = [];
  let funMouseHandler = null;

  let funDragDot = null;
  let funDragOffX = 0, funDragOffY = 0;

  function spawnFunDots() {
    const count = window.innerWidth <= 768 ? 20 : 38;
    const size  = window.innerWidth <= 768 ? 90 : 130;
    const w = window.innerWidth, h = window.innerHeight;
    funDots = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const dot = document.createElement('div');
      dot.className = 'fun-dot';
      dot.style.width  = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left   = x + 'px';
      dot.style.top    = y + 'px';
      funLayer.appendChild(dot);
      const d = { el: dot, x, y, r: size / 2 };
      funDots.push(d);
      dot.addEventListener('mousedown', e => {
        e.preventDefault();
        funDragDot = d;
        dot.classList.add('is-dragging');
        funDragOffX = e.clientX - d.x;
        funDragOffY = e.clientY - d.y;
      });
      requestAnimationFrame(() => dot.classList.add('is-in'));
    }
  }

  function removeFunDots() {
    funDots.forEach(d => {
      d.el.classList.remove('is-in');
      d.el.classList.add('is-out');
      setTimeout(() => d.el.remove(), 450);
    });
    funDots = [];
  }

  function handleFunMouseMove(e) {
    const w = window.innerWidth, h = window.innerHeight;

    if (funDragDot) {
      funDragDot.x = Math.max(funDragDot.r, Math.min(w - funDragDot.r, e.clientX - funDragOffX));
      funDragDot.y = Math.max(funDragDot.r, Math.min(h - funDragDot.r, e.clientY - funDragOffY));
      funDragDot.el.style.left = funDragDot.x + 'px';
      funDragDot.el.style.top  = funDragDot.y + 'px';
    }

    const mx = e.clientX, my = e.clientY;
    const pushRadius = 220;
    funDots.forEach(d => {
      if (d === funDragDot) return;
      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < pushRadius && dist > 0.01) {
        const force = (pushRadius - dist) / pushRadius;
        const angle = Math.atan2(dy, dx);
        d.x = Math.max(d.r, Math.min(w - d.r, d.x + Math.cos(angle) * force * 42));
        d.y = Math.max(d.r, Math.min(h - d.r, d.y + Math.sin(angle) * force * 42));
        d.el.style.left = d.x + 'px';
        d.el.style.top  = d.y + 'px';
      }
    });
  }

  function handleFunMouseUp() {
    if (funDragDot) {
      funDragDot.el.classList.remove('is-dragging');
      funDragDot = null;
    }
  }

  const helloFunBtn = document.getElementById('hello-fun-btn');

  function toggleFun() {
    funActive = !funActive;
    if (funBtn) {
      funBtn.classList.toggle('is-active', funActive);
      funBtn.setAttribute('aria-pressed', String(funActive));
    }
    if (helloFunBtn) helloFunBtn.classList.toggle('is-active', funActive);
    if (funActive) {
      spawnFunDots();
      funMouseHandler = handleFunMouseMove;
      document.addEventListener('mousemove', funMouseHandler);
      document.addEventListener('mouseup', handleFunMouseUp);
    } else {
      funDragDot = null;
      document.removeEventListener('mouseup', handleFunMouseUp);
      removeFunDots();
      if (funMouseHandler) document.removeEventListener('mousemove', funMouseHandler);
      funMouseHandler = null;
    }
  }

  if (funBtn) funBtn.addEventListener('click', toggleFun);
  if (helloFunBtn) helloFunBtn.addEventListener('click', toggleFun);

  // Boutons projet FR/EN — tous branchés sur setLang
  document.addEventListener('click', e => {
    const btn = e.target.closest('.mc-lang-btn');
    if (btn && btn.dataset.lang && btn.dataset.lang !== siteLang) setLang(btn.dataset.lang);
  });

  // ── Footer global — clip-path reveal + arrondi ───────────────────────────
  // Supprimer les anciens site-footer (remplacés par le footer global)
  pages.forEach(page => {
    const old = page.querySelector('.site-footer');
    if (old) old.remove();
  });

  // Navigation depuis le footer (délégation d'événement)
  document.addEventListener('click', e => {
    const link = e.target.closest('.gf-link[data-target]');
    if (!link || transitioning) return;
    e.preventDefault();
    const target = link.dataset.target;
    if (target === current) return;
    navigateTo(target);
  });

  // Scroll : clip-path ouvre la page par le bas + révèle le footer derrière
  // GF_H = hauteur footer révélée, dynamique selon viewport
  pages.forEach(page => {
    page.addEventListener('scroll', () => {
      const gfH = window.innerWidth <= 768 ? 460 : 300;
      const dist = page.scrollHeight - page.scrollTop - page.clientHeight;
      const progress = Math.max(0, Math.min(1, 1 - dist / gfH));
      if (progress > 0) {
        const revealed = Math.round(progress * gfH);
        const radius   = Math.round(progress * 52);
        page.style.clipPath =
          `inset(0 0 ${revealed}px 0 round 0 0 ${radius}px ${radius}px)`;
        if (globalFooter) globalFooter.classList.toggle('is-visible', progress > 0.35);
      } else {
        page.style.clipPath = '';
        if (globalFooter) globalFooter.classList.remove('is-visible');
      }
    }, { passive: true });
  });

});
