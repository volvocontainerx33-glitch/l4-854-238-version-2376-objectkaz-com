(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var toggle = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = $("[data-hero]");
    if (!root) {
      return;
    }
    var slides = $all("[data-hero-slide]", root);
    var dots = $all("[data-hero-dot]", root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function initGlobalSearch() {
    var forms = $all("[data-search-form]");
    var panel = $("[data-search-panel]");
    var list = $("[data-search-results]");
    var close = $("[data-search-close]");
    if (!forms.length || !panel || !list || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
      return;
    }

    function render(query) {
      var key = query.trim().toLowerCase();
      var results = [];
      if (key) {
        results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          return item.text.indexOf(key) !== -1;
        }).slice(0, 18);
      }
      if (!key) {
        list.innerHTML = '<div class="not-found is-show">请输入想看的剧名、题材或地区</div>';
      } else if (!results.length) {
        list.innerHTML = '<div class="not-found is-show">没有找到匹配内容</div>';
      } else {
        list.innerHTML = results.map(function (item) {
          return '<a class="search-result-item" href="' + safeText(item.url) + '">' +
            '<img src="' + safeText(item.cover) + '" alt="' + safeText(item.title) + '">' +
            '<span>' +
            '<strong>' + safeText(item.title) + '</strong>' +
            '<small>' + safeText(item.year) + ' · ' + safeText(item.region) + ' · ' + safeText(item.type) + '</small>' +
            '<p>' + safeText(item.desc) + '</p>' +
            '</span>' +
            '</a>';
        }).join("");
      }
      panel.classList.add("is-open");
    }

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = $("input[name='q']", form);
        render(input ? input.value : "");
      });
    });

    close.addEventListener("click", function () {
      panel.classList.remove("is-open");
    });

    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        panel.classList.remove("is-open");
      }
    });
  }

  function initCategoryFilter() {
    var input = $("[data-category-filter]");
    var count = $("[data-filter-count]");
    var cards = $all("[data-card]");
    var empty = $("[data-filter-empty]");
    if (!input || !cards.length) {
      return;
    }

    function update() {
      var key = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var match = !key || text.indexOf(key) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = String(shown);
      }
      if (empty) {
        empty.classList.toggle("is-show", shown === 0);
      }
    }

    input.addEventListener("input", update);
    update();
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = $("#movieVideo");
    var cover = $("[data-player-cover]");
    var starts = $all("[data-player-start]");
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;
    var requested = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      requested = true;
      load();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    starts.forEach(function (button) {
      button.addEventListener("click", start);
    });

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initCategoryFilter();
  });
})();
