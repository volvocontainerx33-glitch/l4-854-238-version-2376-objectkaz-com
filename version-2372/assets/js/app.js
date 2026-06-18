(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row'));
  var emptyState = document.querySelector('[data-empty-state]');
  var filters = { type: 'all', year: 'all' };
  function getText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-category'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-keywords'),
      card.textContent
    ].join(' ').toLowerCase();
  }
  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;
    cards.forEach(function (card) {
      var matchText = !query || getText(card).indexOf(query) !== -1;
      var matchType = filters.type === 'all' || (card.getAttribute('data-type') || '').indexOf(filters.type) !== -1;
      var matchYear = filters.year === 'all' || (card.getAttribute('data-year') || '') === filters.year;
      var show = matchText && matchType && matchYear;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var type = button.getAttribute('data-filter-type');
      var value = button.getAttribute('data-filter-value');
      if (type === 'all') {
        filters.type = 'all';
        filters.year = 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-filter-type') === 'all');
        });
      } else {
        filters[type] = filters[type] === value ? 'all' : value;
        filterButtons.forEach(function (item) {
          var itemType = item.getAttribute('data-filter-type');
          var itemValue = item.getAttribute('data-filter-value');
          var active = itemType !== 'all' && filters[itemType] === itemValue;
          item.classList.toggle('is-active', active);
        });
        var allButton = filterButtons.find(function (item) {
          return item.getAttribute('data-filter-type') === 'all';
        });
        if (allButton) {
          allButton.classList.toggle('is-active', filters.type === 'all' && filters.year === 'all');
        }
      }
      applyFilters();
    });
  });

  var player = document.querySelector('.player');
  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var jump = document.querySelector('[data-player-jump]');
    var hlsInstance = null;
    function startPlayer() {
      if (!video) {
        return;
      }
      var stream = player.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', startPlayer);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
    if (jump) {
      jump.addEventListener('click', function (event) {
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        startPlayer();
      });
    }
  }
})();
