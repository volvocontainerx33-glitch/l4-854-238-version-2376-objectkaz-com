(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previousButton = hero.querySelector('[data-hero-prev]');
    const nextButton = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const startTimer = () => {
      stopTimer();
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    const stopTimer = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    previousButton?.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      startTimer();
    });

    nextButton?.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      startTimer();
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        showSlide(dotIndex);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);

    showSlide(0);
    startTimer();
  }

  const searchForm = document.querySelector('[data-search-form]');
  const resultGrid = document.querySelector('[data-search-results]');
  const resultSummary = document.querySelector('[data-result-summary]');
  const moreButton = document.querySelector('[data-load-more]');

  if (searchForm && resultGrid && Array.isArray(window.MOVIES)) {
    const keywordInput = searchForm.querySelector('[name="q"]');
    const genreSelect = searchForm.querySelector('[name="genre"]');
    const yearSelect = searchForm.querySelector('[name="year"]');
    const typeSelect = searchForm.querySelector('[name="type"]');
    const pageSize = 48;
    let visibleCount = pageSize;
    let currentResults = [];

    const params = new URLSearchParams(window.location.search);
    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    const createOptions = (select, values, label) => {
      if (!select) {
        return;
      }

      select.innerHTML = `<option value="">${label}</option>`;
      values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    const uniqueValues = (items, getter) => {
      return Array.from(new Set(items.flatMap(getter).filter(Boolean))).sort((a, b) => `${b}`.localeCompare(`${a}`, 'zh-CN'));
    };

    createOptions(genreSelect, uniqueValues(window.MOVIES, (movie) => movie.genres || []), '全部类型');
    createOptions(yearSelect, uniqueValues(window.MOVIES, (movie) => [movie.year]), '全部年份');
    createOptions(typeSelect, uniqueValues(window.MOVIES, (movie) => [movie.type]), '全部格式');

    const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });

    const renderCard = (movie) => {
      return `
        <a class="movie-card" href="video/${escapeHtml(movie.id)}.html">
          <span class="card-cover">
            <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="year-badge">${escapeHtml(movie.year)}</span>
            <span class="play-mask">▶</span>
          </span>
          <span class="card-body">
            <strong>${escapeHtml(movie.title)}</strong>
            <em>${escapeHtml(movie.oneLine)}</em>
            <span class="card-meta">
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml((movie.genres || []).slice(0, 2).join(' / '))}</span>
            </span>
          </span>
        </a>`;
    };

    const getResults = () => {
      const keyword = (keywordInput?.value || '').trim().toLowerCase();
      const genre = genreSelect?.value || '';
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';

      return window.MOVIES.filter((movie) => {
        const searchText = [movie.title, movie.region, movie.type, movie.year, movie.genreRaw, movie.oneLine, ...(movie.tags || [])]
          .join(' ')
          .toLowerCase();
        const matchesKeyword = !keyword || searchText.includes(keyword);
        const matchesGenre = !genre || (movie.genres || []).includes(genre);
        const matchesYear = !year || movie.year === year;
        const matchesType = !type || movie.type === type;
        return matchesKeyword && matchesGenre && matchesYear && matchesType;
      });
    };

    const render = () => {
      currentResults = getResults();
      const visibleItems = currentResults.slice(0, visibleCount);
      resultGrid.innerHTML = visibleItems.map(renderCard).join('');

      if (resultSummary) {
        resultSummary.textContent = `共找到 ${currentResults.length} 部影片，当前显示 ${visibleItems.length} 部。`;
      }

      if (moreButton) {
        moreButton.hidden = visibleItems.length >= currentResults.length;
      }
    };

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      visibleCount = pageSize;
      render();
    });

    [keywordInput, genreSelect, yearSelect, typeSelect].forEach((control) => {
      control?.addEventListener('input', () => {
        visibleCount = pageSize;
        render();
      });
    });

    moreButton?.addEventListener('click', () => {
      visibleCount += pageSize;
      render();
    });

    render();
  }
})();
