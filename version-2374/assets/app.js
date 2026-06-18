(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var section = input.closest("section");
      var list = section ? section.querySelector("[data-filter-list]") : document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
      var empty = document.createElement("div");
      empty.className = "empty-filter";
      empty.textContent = "没有找到匹配的影片";
      empty.hidden = true;
      list.after(empty);
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-filter-text") || "";
          var matched = !query || text.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        empty.hidden = visible !== 0;
      });
    });

    var searchPanel = document.querySelector("[data-search-panel]");
    var searchResults = document.querySelector("[data-search-results]");
    var siteSearchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    var closeSearchButtons = Array.prototype.slice.call(document.querySelectorAll("[data-search-close]"));
    var searchIndex = window.SITE_SEARCH_INDEX || [];

    function closeSearch() {
      if (searchPanel) {
        searchPanel.hidden = true;
      }
    }

    function renderSearch(query) {
      if (!searchPanel || !searchResults) {
        return;
      }
      var value = query.trim().toLowerCase();
      if (!value) {
        closeSearch();
        return;
      }
      var matches = searchIndex.filter(function (item) {
        return item.text.indexOf(value) !== -1;
      }).slice(0, 24);
      searchPanel.hidden = false;
      if (!matches.length) {
        searchResults.innerHTML = '<div class="no-results">没有找到匹配的影片</div>';
        return;
      }
      searchResults.innerHTML = matches.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.line) + '</span>' +
          '<em>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.category) + '</em></span>' +
          '</a>';
      }).join("");
    }

    function escapeHtml(text) {
      return String(text).replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    siteSearchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        renderSearch(input.value);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          renderSearch(input.value);
        }
        if (event.key === "Escape") {
          closeSearch();
        }
      });
    });

    closeSearchButtons.forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-overlay]");
      var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
      var src = video ? video.getAttribute("data-video-src") : "";
      var bound = false;
      var hls = null;

      function bindSource() {
        if (!video || bound || !src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          bound = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          bound = true;
          return;
        }
        video.src = src;
        bound = true;
      }

      function playVideo() {
        if (!video) {
          return;
        }
        bindSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      });

      if (video) {
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (overlay && video.currentTime === 0) {
            overlay.classList.remove("is-hidden");
          }
        });
        video.addEventListener("ended", function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
