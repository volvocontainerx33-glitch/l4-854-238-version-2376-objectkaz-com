(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var nav = $('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(next, 5000);
    }

    var prevButton = $('[data-hero-prev]', hero);
    var nextButton = $('[data-hero-next]', hero);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });
    reset();
  }

  function setupStrips() {
    $all('[data-scroll-left]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll-left'));
        if (target) {
          target.scrollBy({ left: -420, behavior: 'smooth' });
        }
      });
    });
    $all('[data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll-right'));
        if (target) {
          target.scrollBy({ left: 420, behavior: 'smooth' });
        }
      });
    });
  }

  function setupFilters() {
    $all('[data-filter-input]').forEach(function (input) {
      var root = input.closest('section') || document;
      var list = $('[data-filter-list]', root) || document;
      var cards = $all('[data-card]', list);
      var empty = $('[data-filter-empty]', root);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          var match = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('is-filtered-out', !match);
          if (match) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      });
    });
  }

  function setupPlayers() {
    $all('video[data-hls]').forEach(function (video) {
      var source = video.getAttribute('data-hls');
      var loaded = false;
      var hlsInstance = null;
      var wrap = video.closest('.player-wrap');
      var button = wrap ? $('[data-play-button]', wrap) : null;

      function load() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = source;
        }
      }

      load();
      if (button) {
        button.addEventListener('click', function () {
          load();
          var result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {});
          }
          button.classList.add('is-hidden');
        });
        video.addEventListener('play', function () {
          button.classList.add('is-hidden');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupStrips();
    setupFilters();
    setupPlayers();
  });
})();
