(() => {
  const players = document.querySelectorAll('[data-video-player]');

  players.forEach((panel) => {
    const video = panel.querySelector('video');
    const overlay = panel.querySelector('[data-player-overlay]');
    const status = panel.querySelector('[data-player-status]');
    const source = panel.dataset.src;
    let hls = null;
    let initialized = false;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const startPlayback = () => {
      if (!video || !source) {
        setStatus('播放源暂不可用');
        return;
      }

      if (!initialized) {
        initialized = true;
        setStatus('正在加载播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            setStatus('播放源已就绪');
            video.play().catch(() => {
              setStatus('请再次点击播放按钮开始观看');
            });
          });

          hls.on(window.Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络加载异常，正在重试...');
              hls.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体解码异常，正在恢复...');
              hls.recoverMediaError();
              return;
            }

            setStatus('视频加载失败，请刷新页面重试');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', () => {
            setStatus('播放源已就绪');
            video.play().catch(() => {
              setStatus('请再次点击播放按钮开始观看');
            });
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(() => {
            setStatus('当前浏览器不支持 HLS 播放，请更换浏览器或刷新后重试');
          });
        }
      } else {
        video.play().catch(() => {
          setStatus('请再次点击播放按钮开始观看');
        });
      }

      overlay?.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
    };

    overlay?.addEventListener('click', startPlayback);

    video?.addEventListener('click', () => {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video?.addEventListener('pause', () => {
      if (video.currentTime > 0 && !video.ended) {
        overlay?.classList.remove('is-hidden');
        setStatus('已暂停，点击继续播放');
      }
    });

    video?.addEventListener('play', () => {
      overlay?.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
