(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initPlayer(sourceUrl, videoId, overlayId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !sourceUrl) {
        return;
      }

      var hls = null;
      var attached = false;

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function playVideo() {
        attachSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  window.initPlayer = initPlayer;
})();
