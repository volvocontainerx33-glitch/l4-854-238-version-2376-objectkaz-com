(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
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
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var typeSelect = root.querySelector("[data-filter-type]");
      var regionSelect = root.querySelector("[data-filter-region]");
      var yearSelect = root.querySelector("[data-filter-year]");
      var container = document.querySelector(".filter-results");
      var empty = document.querySelector("[data-empty-state]");
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-search-card]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function text(card, name) {
        return (card.getAttribute("data-" + name) || "").toLowerCase();
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value.toLowerCase() : "";
        var region = regionSelect ? regionSelect.value.toLowerCase() : "";
        var year = yearSelect ? yearSelect.value.toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = ["title", "region", "type", "year", "genre", "tags"].map(function (name) {
            return text(card, name);
          }).join(" ") + " " + card.textContent.toLowerCase();
          var match = true;
          if (q && haystack.indexOf(q) === -1) {
            match = false;
          }
          if (type && text(card, "type") !== type) {
            match = false;
          }
          if (region && text(card, "region") !== region) {
            match = false;
          }
          if (year && text(card, "year") !== year) {
            match = false;
          }
          card.classList.toggle("is-filter-hidden", !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeSelect, regionSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function setupImages() {
    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImages();
  });
})();
