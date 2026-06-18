(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-empty');
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    const input = area.querySelector('[data-search-input]');
    const yearSelect = area.querySelector('[data-year-filter]');
    const regionSelect = area.querySelector('[data-region-filter]');
    const cards = Array.from(area.querySelectorAll('.movie-card'));
    const empty = area.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function apply() {
      const term = input ? input.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.dataset.keywords || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const cardRegion = card.dataset.region || '';
        const matchesTerm = !term || haystack.indexOf(term) !== -1;
        const matchesYear = !year || cardYear === year;
        const matchesRegion = !region || cardRegion === region;
        const showCard = matchesTerm && matchesYear && matchesRegion;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });

  function loadLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (window.__videoLibraryLoading) {
      return window.__videoLibraryLoading;
    }

    window.__videoLibraryLoading = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('library'));
        }
      };
      script.onerror = function () {
        reject(new Error('network'));
      };
      document.head.appendChild(script);
    });

    return window.__videoLibraryLoading;
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-player-overlay]');
    const playButton = player.querySelector('[data-player-play]');
    const muteButton = player.querySelector('[data-player-mute]');
    const fullButton = player.querySelector('[data-player-fullscreen]');
    const status = player.querySelector('[data-player-status]');
    const stream = player.dataset.stream;
    let attached = false;
    let instance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attach() {
      if (attached || !video || !stream) {
        return Promise.resolve();
      }
      attached = true;
      setStatus('载入中');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        setStatus('就绪');
        return Promise.resolve();
      }

      return loadLibrary().then(function (Hls) {
        if (Hls.isSupported()) {
          instance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
          instance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('就绪');
          });
          instance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('暂时无法载入');
              if (instance) {
                instance.destroy();
                instance = null;
              }
              attached = false;
            }
          });
          return;
        }
        setStatus('暂时无法播放');
      }).catch(function () {
        setStatus('暂时无法载入');
      });
    }

    function togglePlay() {
      attach().then(function () {
        if (!video) {
          return;
        }
        if (video.paused) {
          const promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              setStatus('点击后播放');
            });
          }
        } else {
          video.pause();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', togglePlay);
    }

    if (playButton) {
      playButton.addEventListener('click', togglePlay);
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (playButton) {
          playButton.textContent = '暂停';
        }
        setStatus('播放中');
      });
      video.addEventListener('pause', function () {
        if (playButton) {
          playButton.textContent = '播放';
        }
        setStatus('已暂停');
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
        setStatus('已结束');
      });
    }

    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullButton && video) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    });
  });
})();
