(function() {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  var menuButton = qs("[data-menu-button]");
  var mobileNav = qs("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  qsa("[data-site-search-form]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = qs("input[name='q']", form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  var hero = qs("[data-hero]");
  if (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      timer = window.setInterval(nextSlide, 5000);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        resetTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterPanel = qs("[data-filter-panel]");
  if (filterPanel) {
    var cards = qsa("[data-movie-card]");
    var keywordInput = qs("[data-filter-input]", filterPanel);
    var typeSelect = qs("[data-filter-type]", filterPanel);
    var yearInput = qs("[data-filter-year]", filterPanel);
    var emptyState = qs("[data-empty-state]");

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var yearValue = normalize(yearInput && yearInput.value);
      var shown = 0;

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !typeValue || cardType === typeValue;
        var matchesYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
        var visible = matchesKeyword && matchesType && matchesYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    [keywordInput, typeSelect, yearInput].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  var searchResults = qs("#search-results");
  if (searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var searchInput = qs("[data-search-page-form] input[name='q']");
    var title = qs("[data-search-title]");
    var empty = qs("#search-empty");
    if (searchInput) {
      searchInput.value = query;
    }

    function cardTemplate(movie) {
      return [
        '<a class="movie-card movie-card-medium" href="' + movie.url + '">',
        '  <div class="movie-poster">',
        '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <span class="poster-badge">' + movie.year + '</span>',
        '    <span class="play-chip">▶</span>',
        '  </div>',
        '  <div class="movie-card-body">',
        '    <h3>' + movie.title + '</h3>',
        '    <p>' + movie.oneLine + '</p>',
        '    <div class="movie-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
        '  </div>',
        '</a>'
      ].join("");
    }

    function runSearch(value) {
      var key = normalize(value);
      var list = window.SITE_MOVIES.filter(function(movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(" "),
          movie.oneLine
        ].join(" "));
        return !key || haystack.indexOf(key) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = list.map(cardTemplate).join("");
      if (title) {
        title.textContent = key ? "搜索结果" : "影片检索";
      }
      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }

    runSearch(query);
  }
}());
