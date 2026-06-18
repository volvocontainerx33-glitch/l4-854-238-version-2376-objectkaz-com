(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  let heroIndex = 0;

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      heroSlides[heroIndex].classList.remove('active');
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add('active');
    }, 3200);
  }

  const filterForm = document.querySelector('[data-search-form]');

  if (filterForm) {
    const keywordInput = filterForm.querySelector('[data-filter-keyword]');
    const regionSelect = filterForm.querySelector('[data-filter-region]');
    const typeSelect = filterForm.querySelector('[data-filter-type]');
    const yearSelect = filterForm.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const applyFilters = function () {
      const keyword = normalize(keywordInput && keywordInput.value);
      const region = normalize(regionSelect && regionSelect.value);
      const type = normalize(typeSelect && typeSelect.value);
      const year = normalize(yearSelect && yearSelect.value);

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        const matched = (!keyword || haystack.includes(keyword)) &&
          (!region || normalize(card.dataset.region) === region) &&
          (!type || normalize(card.dataset.type) === type) &&
          (!year || normalize(card.dataset.year) === year);

        card.classList.toggle('is-hidden', !matched);
      });
    };

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  const loadScript = function (source) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[src="' + source + '"]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = source;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const startPlayer = function (card) {
    const video = card.querySelector('video');
    const status = card.querySelector('[data-player-status]');
    const source = card.dataset.videoUrl;

    if (!video || !source) {
      return;
    }

    if (card.dataset.ready === 'true') {
      video.play().catch(function () {});
      return;
    }

    card.dataset.ready = 'true';
    card.classList.add('is-playing');
    if (status) {
      status.textContent = '正在加载';
    }

    const playVideo = function () {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (status) {
            status.textContent = '点击继续播放';
          }
          card.classList.remove('is-playing');
        });
      }
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
      .then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && status) {
              status.textContent = '播放失败，请稍后重试';
              card.classList.remove('is-playing');
            }
          });
        } else {
          video.src = source;
          video.load();
          playVideo();
        }
      })
      .catch(function () {
        video.src = source;
        video.load();
        playVideo();
      });
  };

  document.querySelectorAll('[data-player]').forEach(function (card) {
    const button = card.querySelector('[data-play-button]');
    const video = card.querySelector('video');

    card.addEventListener('click', function () {
      startPlayer(card);
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayer(card);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(card);
      });
    }
  });
})();
