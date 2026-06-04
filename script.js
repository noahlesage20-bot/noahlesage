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
    progress += Math.floor(Math.random() * 3) + 1;
    if (progress >= 100) {
      progress = 100;
      done = true;
      loaderPct.textContent = '100%';
      loaderBrand.classList.add('is-visible');
      setTimeout(flyToHero, 550);
      return;
    }
    loaderPct.textContent = progress + '%';
    setTimeout(step, 30 + Math.random() * 25);
  };
  setTimeout(step, 120);

  function flyToHero() {
    // Position actuelle de a2.jpg avant d'arrêter l'orbite
    const a2A  = ((4 / O_N) * 360 + orbitAngle) * Math.PI / 180;
    const a2CX = O_CX + Math.cos(a2A) * O_R;
    const a2CY = O_CY + Math.sin(a2A) * O_R;

    // L'orbite continue de tourner pendant que le loader remonte — rien ne s'arrête

    // flyDiv : position:fixed, survit au slide-up du loader
    const flyDiv = document.createElement('div');
    flyDiv.style.cssText = `
      position:fixed;z-index:8000;pointer-events:none;overflow:hidden;
      border-radius:4px;
      left:${a2CX - O_W / 2}px;top:${a2CY - O_H / 2}px;
      width:${O_W}px;height:${O_H}px;
      transform:rotate(${O_TILTS[4]}deg);
    `;
    const flyImg = document.createElement('img');
    flyImg.src = 'a2.jpg';
    flyImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    flyDiv.appendChild(flyImg);
    document.body.appendChild(flyDiv);

    // Révèle le site → tout le loader (images + brand) remonte en bloc
    revealSite();

    setTimeout(() => {
      const heroWrap = document.querySelector('#page-home .hero-img-wrap');
      const heroRect = heroWrap.getBoundingClientRect();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const d = '0.95s cubic-bezier(0.76,0,0.24,1)';
          flyDiv.style.transition   = `left ${d},top ${d},width ${d},height ${d},border-radius ${d},transform ${d}`;
          flyDiv.style.left         = heroRect.left   + 'px';
          flyDiv.style.top          = heroRect.top    + 'px';
          flyDiv.style.width        = heroRect.width  + 'px';
          flyDiv.style.height       = heroRect.height + 'px';
          flyDiv.style.borderRadius = '0';
          flyDiv.style.transform    = '';

          setTimeout(() => {
            flyDiv.style.transition = 'opacity 0.55s ease';
            flyDiv.style.opacity    = '0';
            document.getElementById('page-home').classList.add('anim-ready');
            setTimeout(() => flyDiv.remove(), 650);
          }, 980);
        });
      });
    }, 60);
  }

  function revealSite() {
    site.classList.remove('is-hidden');
    const home = document.getElementById('page-home');
    home.classList.add('is-active');
    setTimeout(() => loader.classList.add('is-gone'), 480);
    setTimeout(() => loader.remove(), 1700);
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

    // Élément vidéo créé dynamiquement pour les slides mp4
    const vid = document.createElement('video');
    vid.className = 'gallery-img';
    vid.muted = true; vid.loop = true; vid.setAttribute('playsinline', '');
    vid.style.cssText = 'display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    if (img.parentNode) img.parentNode.style.position = 'relative';
    if (img.parentNode) img.parentNode.appendChild(vid);

    let showingVid = false;

    function changeMedia(item) {
      const isVideo = !!(item.dataset.video);
      const newSrc  = isVideo ? item.dataset.video : item.dataset.img;
      if (!newSrc || newSrc === currentSrc) return;
      currentSrc = newSrc;

      const curEl = showingVid ? vid : img;
      const nxtEl = isVideo   ? vid : img;

      curEl.classList.add('is-fading');
      setTimeout(() => {
        curEl.style.display = 'none';
        curEl.classList.remove('is-fading');
        if (isVideo) { vid.src = newSrc; vid.load(); vid.play().catch(() => {}); }
        else         { img.src = newSrc; if (showingVid) { vid.pause(); vid.src = ''; } }
        showingVid = isVideo;
        nxtEl.style.display = 'block';
        nxtEl.classList.add('is-fading');
        requestAnimationFrame(() => requestAnimationFrame(() => nxtEl.classList.remove('is-fading')));
      }, 420);
    }

    function setActive(idx) {
      idx = Math.max(0, Math.min(items.length - 1, idx));
      if (idx === activeIdx) return;
      activeIdx = idx;
      applyStyles();
      centerTrack();
      setTimeout(centerTrack, 520);
      changeMedia(items[idx]);
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

    // Indicateurs de position (dots) — mobile seulement, mis à jour dans setActive
    let dots = [];
    const gallery = roulette.closest('.gallery');
    if (gallery && window.innerWidth <= 768) {
      const hint = document.createElement('div');
      hint.className = 'gallery-swipe-hint';
      items.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('is-active');
        hint.appendChild(dot);
      });
      gallery.appendChild(hint);
      dots = Array.from(hint.querySelectorAll('span'));
    }

    // Patch setActive pour mettre à jour les dots
    const _baseSetActive = setActive;
    setActive = function(idx) {
      _baseSetActive(idx);
      dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
    };

    // Initial state
    applyStyles();
    requestAnimationFrame(() => { requestAnimationFrame(centerTrack); });
    window.addEventListener('resize', centerTrack);
  }

  // Initialise les deux roulettes
  initRoulette('work-roulette',  'work-track',  'work-img',  0);
  initRoulette('photo-roulette', 'photo-track', 'photo-img', 0);

  // ── Hero slideshow + hover work ──────────────────────────────────────────
  const heroSlideImg   = document.getElementById('hero-slide-img');
  const heroSlideVideo = document.getElementById('hero-slide-video');
  const heroSlides = [
    { src: 'mc-poster.jpg' },
    { src: 'From S to XL anim.mp4', video: true },
    { src: 'Palais bulles.jpg' },
    { src: 'Cal Smith.jpg' },
    { src: 'a2.jpg' },
  ];
  let heroSlideIdx = 0;
  let heroShowingVideo = false;

  // Précharge les images (pas les vidéos)
  heroSlides.forEach(s => { if (!s.video) { const i = new Image(); i.src = s.src; } });

  function heroShowSlide(slide) {
    if (slide.video) {
      heroSlideImg.style.opacity = '0';
      setTimeout(() => {
        heroSlideImg.style.display = 'none';
        heroSlideVideo.src = slide.src;
        heroSlideVideo.style.display = 'block';
        heroSlideVideo.style.opacity = '0';
        heroSlideVideo.load();
        heroSlideVideo.play().catch(() => {});
        requestAnimationFrame(() => requestAnimationFrame(() => { heroSlideVideo.style.opacity = '1'; }));
        heroShowingVideo = true;
      }, 560);
    } else {
      const prev = heroShowingVideo ? heroSlideVideo : heroSlideImg;
      prev.style.opacity = '0';
      setTimeout(() => {
        if (heroShowingVideo) {
          heroSlideVideo.style.display = 'none';
          heroSlideVideo.pause();
          heroSlideVideo.src = '';
          heroShowingVideo = false;
        }
        heroSlideImg.src = slide.src;
        heroSlideImg.style.display = 'block';
        heroSlideImg.style.opacity = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => { heroSlideImg.style.opacity = '1'; }));
      }, 560);
    }
  }

  setInterval(() => {
    if (!document.getElementById('page-home').classList.contains('is-active')) return;
    heroSlideIdx = (heroSlideIdx + 1) % heroSlides.length;
    heroShowSlide(heroSlides[heroSlideIdx]);
  }, 3800);

  const heroImgWrap = document.getElementById('hero-img-wrap');
  if (heroImgWrap) {
    heroImgWrap.addEventListener('click', () => navigateTo('work'));
  }

  // ── Back button (Ringer projet → Work) ───────────────────────────────────
  document.querySelectorAll('.js-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitioning) return;
      navigateTo('work');
    });
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
      if (!photoHoverWrap || !photoHoverImg) return;
      const src = item.dataset.img;
      if (photoHoverImg.getAttribute('src') !== src) photoHoverImg.src = src;
      photoHoverWrap.classList.add('is-visible');
      document.querySelectorAll('.photo-list-item').forEach(i =>
        i.classList.toggle('is-hovered', i === item)
      );
    });
    item.addEventListener('mouseleave', () => {
      if (photoHoverWrap) photoHoverWrap.classList.remove('is-visible');
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    });
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
          btn.textContent = 'Réessayer →';
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
      'form.send': 'Envoyer →', 'form.confirm': 'Message envoyé — à bientôt.',
      'hello.social': 'Réseaux', 'hello.freelance': 'Freelance indépendant',
      'photo.voyage': 'Voyage',
      'stoxl.tagline': 'Direction artistique — Graphisme',
      'tapage.tagline': 'Graphisme — Affiche',
      'palais.tagline': 'Direction artistique — Identité visuelle',
      'calsmith.tagline': 'Graphisme — Identité visuelle',
      'refonte.tagline': 'Direction artistique — Identité visuelle',
      'ringer.tagline': 'Direction artistique — Brand design',
      'poster.tagline': 'Graphisme — Sérigraphie',
      'fiche.year': 'Année',
      'stoxl.type': 'Direction artistique', 'stoxl.discipline': 'Graphisme, Identité visuelle',
      'tapage.type': 'Graphisme', 'tapage.discipline': 'Affiche, Typographie',
      'palais.type': 'Direction artistique', 'palais.discipline': 'Identité visuelle, Photographie',
      'calsmith.type': 'Graphisme', 'calsmith.discipline': 'Identité visuelle, Musique',
      'refonte.type': 'Direction artistique', 'refonte.discipline': 'Identité visuelle, Motion design',
      'ringer.type': 'Direction artistique', 'ringer.discipline': 'Identité visuelle, Brand design',
      'poster.type': 'Graphisme', 'poster.discipline': 'Sérigraphie, Affiche',
    },
    en: {
      'hello.1': 'A project?', 'hello.2': 'A need?', 'hello.3': "Let's talk.",
      'form.name': 'Name', 'form.name.ph': 'Your name',
      'form.email.ph': 'your@email.com',
      'form.msg.ph': 'Tell me about your project…',
      'form.send': 'Send →', 'form.confirm': 'Message sent — talk soon.',
      'hello.social': 'Social', 'hello.freelance': 'Independent freelance',
      'photo.voyage': 'Travel',
      'stoxl.tagline': 'Art direction — Graphic design',
      'tapage.tagline': 'Graphic design — Poster',
      'palais.tagline': 'Art direction — Visual identity',
      'calsmith.tagline': 'Graphic design — Visual identity',
      'refonte.tagline': 'Art direction — Visual identity',
      'ringer.tagline': 'Art direction — Brand design',
      'poster.tagline': 'Graphic design — Screen printing',
      'fiche.year': 'Year',
      'stoxl.type': 'Art direction', 'stoxl.discipline': 'Graphic design, Visual identity',
      'tapage.type': 'Graphic design', 'tapage.discipline': 'Poster, Typography',
      'palais.type': 'Art direction', 'palais.discipline': 'Visual identity, Photography',
      'calsmith.type': 'Graphic design', 'calsmith.discipline': 'Visual identity, Music',
      'refonte.type': 'Art direction', 'refonte.discipline': 'Visual identity, Motion design',
      'ringer.type': 'Art direction', 'ringer.discipline': 'Visual identity, Brand design',
      'poster.type': 'Graphic design', 'poster.discipline': 'Screen printing, Poster',
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
      const gfH = window.innerWidth <= 768 ? 520 : 320;
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
