(function () {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const data = Array.isArray(window.SEARCH_DATA) ? window.SEARCH_DATA : [];

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function openSearch(box, query) {
    const panel = box.querySelector(".search-panel");
    if (!panel) {
      return;
    }

    const text = normalize(query);
    panel.innerHTML = "";

    if (!text) {
      panel.classList.remove("is-open");
      return;
    }

    const results = data.filter(function (item) {
      return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre).includes(text);
    }).slice(0, 10);

    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "未找到相关影片";
      panel.appendChild(empty);
    } else {
      results.forEach(function (item) {
        const link = document.createElement("a");
        link.href = item.url;
        link.innerHTML = "<strong>" + item.title + "</strong><span>" + item.year + " · " + item.region + " · " + item.genre + "</span>";
        panel.appendChild(link);
      });
    }

    panel.classList.add("is-open");
  }

  document.querySelectorAll(".global-search").forEach(function (box) {
    const input = box.querySelector(".js-global-search");
    if (!input) {
      return;
    }

    input.addEventListener("input", function () {
      openSearch(box, input.value);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") {
        return;
      }

      const text = normalize(input.value);
      const first = data.find(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre).includes(text);
      });

      if (first) {
        window.location.href = first.url;
      }
    });
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".global-search").forEach(function (box) {
      if (!box.contains(event.target)) {
        const panel = box.querySelector(".search-panel");
        if (panel) {
          panel.classList.remove("is-open");
        }
      }
    });
  });

  document.querySelectorAll(".hero-carousel").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
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

    show(0);
    start();
  });

  document.querySelectorAll(".content-section").forEach(function (section) {
    const input = section.querySelector(".js-local-search");
    const chips = Array.from(section.querySelectorAll(".js-filter-chip"));
    const cards = Array.from(section.querySelectorAll(".movie-card, .rank-row"));
    let activeKey = "all";
    let activeValue = "all";

    if (!cards.length) {
      return;
    }

    function apply() {
      const query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(" "));
        const queryMatch = !query || haystack.includes(query);
        let chipMatch = true;

        if (activeKey !== "all") {
          chipMatch = normalize(card.dataset[activeKey]).includes(normalize(activeValue));
        }

        card.classList.toggle("is-hidden", !(queryMatch && chipMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeKey = chip.dataset.filterKey || "all";
        activeValue = chip.dataset.filterValue || "all";
        apply();
      });
    });
  });

  document.querySelectorAll(".js-player").forEach(function (player) {
    const video = player.querySelector("video");
    const cover = player.querySelector(".play-cover");
    const mediaUrl = video ? video.getAttribute("data-url") : "";
    let ready = false;

    if (!video || !cover || !mediaUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 60,
          enableWorker: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }

      ready = true;
    }

    function play() {
      prepare();
      player.classList.add("is-playing");
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  });
})();
