(function () {
  const CACHE_KEY = "museum_of_sound_itunes_cache_v4";
  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch (e) {
    cache = {};
  }

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  // JSONP request to iTunes Search API — works 100% on both local file:// and https:// without CORS errors!
  function jsonpItunes(query, entity = "album", country = "TW") {
    return new Promise((resolve) => {
      const cbName = "__itunes_cb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      const script = document.createElement("script");
      let settled = false;

      const cleanup = () => {
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      };

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          resolve(null);
        }
      }, 6000);

      window[cbName] = function (json) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        const item = (json && json.results && json.results[0]) || null;
        if (item) {
          resolve({
            trackName: item.trackName || "",
            artistName: item.artistName || "",
            collectionName: item.collectionName || "",
            artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : "",
            previewUrl: item.previewUrl || ""
          });
        } else {
          resolve(null);
        }
      };

      script.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve(null);
      };

      script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${country}&entity=${entity}&limit=3&callback=${cbName}`;
      document.head.appendChild(script);
    });
  }

  async function fetchItunesMulti(queries, entity = "album") {
    const cleanQueries = [...new Set(queries.map(q => (q || "").trim()).filter(Boolean))];
    for (const q of cleanQueries) {
      const key = `${entity}:${q}`;
      if (cache[key] && cache[key].ts && Date.now() - cache[key].ts < 7 * 24 * 3600 * 1000) {
        if (cache[key].data && (cache[key].data.artworkUrl || cache[key].data.previewUrl)) {
          return cache[key].data;
        }
      }
      const data = (await jsonpItunes(q, entity, "TW")) || (await jsonpItunes(q, entity, "US"));
      if (data && (data.artworkUrl || data.previewUrl)) {
        cache[key] = { ts: Date.now(), data };
        saveCache();
        return data;
      }
    }
    return null;
  }

  // Hydrate all album jackets, mini-covers, and artist sleeves with real official artwork from iTunes
  async function hydrateAllRealCovers() {
    const albumTargets = document.querySelectorAll("[data-album-query]");
    for (const el of albumTargets) {
      if (el.dataset.hydrated === "1") continue;
      el.dataset.hydrated = "1";
      const q1 = el.dataset.albumQuery || "";
      const q2 = el.dataset.albumAltQuery || "";
      const data = (await fetchItunesMulti([q1, q2], "album")) || (await fetchItunesMulti([q1, q2], "song"));
      if (data && data.artworkUrl) {
        if (el.tagName === "IMG") {
          el.src = data.artworkUrl;
          el.alt = `${q1} 專輯封面`;
        } else if (el.classList.contains("mini-cover")) {
          el.style.backgroundImage = `url("${data.artworkUrl}")`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.textContent = "";
        } else {
          el.style.backgroundImage = `linear-gradient(to top, rgba(18,12,9,0.88) 0%, rgba(18,12,9,0.18) 55%, rgba(18,12,9,0.05) 100%), url("${data.artworkUrl}")`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
        }
        el.classList.add("has-real-cover");
      }
    }

    const artistTargets = document.querySelectorAll("[data-artist-cover]");
    for (const el of artistTargets) {
      if (el.dataset.hydrated === "1") continue;
      el.dataset.hydrated = "1";
      const q1 = el.dataset.artistCover || "";
      const q2 = el.dataset.artistAltCover || "";
      const data = (await fetchItunesMulti([q1, q2], "album")) || (await fetchItunesMulti([q1, q2], "song"));
      if (data && data.artworkUrl) {
        el.style.backgroundImage = `url("${data.artworkUrl}")`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.textContent = "";
        el.classList.add("has-real-cover");
      }
    }
  }

  // Global 30s Official Audio Preview Player
  // NOTE: Do NOT set audio.crossOrigin = "anonymous", because Apple's preview m4a server blocks CORS audio tags!
  const audio = new Audio();
  audio.preload = "auto";
  let currentTrackKey = null;

  // Offline warm vinyl chime fallback if user has no internet connection
  let audioCtx = null;
  let synthTimer = null;
  function playOfflineChime(onEnded) {
    stopOfflineChime();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63];
      let step = 0;
      const tick = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        step++;
        if (step >= 12) {
          stopOfflineChime();
          if (onEnded) onEnded();
        }
      };
      tick();
      synthTimer = setInterval(tick, 650);
    } catch (e) {}
  }

  function stopOfflineChime() {
    if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
  }

  function ensurePlayerBar() {
    if (document.getElementById("museum-player-bar")) return;
    const bar = document.createElement("div");
    bar.id = "museum-player-bar";
    bar.className = "museum-player-bar";
    bar.innerHTML = `
      <div class="mp-inner">
        <button class="mp-toggle" type="button" aria-label="播放或暫停">▶</button>
        <div class="mp-info">
          <div class="mp-title">選擇一首經典曲目開始試聽</div>
          <div class="mp-sub">MUSEUM OF SOUND · Official 30s Audio Preview</div>
          <div class="mp-progress"><div class="mp-progress-fill"></div></div>
        </div>
        <span class="mp-status">準備就緒</span>
        <button class="mp-close" type="button" aria-label="關閉播放器">✕</button>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector(".mp-toggle").addEventListener("click", () => {
      if (!audio.paused) {
        audio.pause();
        stopOfflineChime();
        updatePlayerUI("paused");
      } else if (audio.src) {
        audio.play().then(() => updatePlayerUI("playing")).catch(() => {});
      }
    });

    bar.querySelector(".mp-close").addEventListener("click", () => {
      audio.pause();
      audio.currentTime = 0;
      stopOfflineChime();
      currentTrackKey = null;
      updatePlayerUI("paused");
      bar.classList.remove("visible");
    });

    audio.addEventListener("timeupdate", () => {
      const fillEl = bar.querySelector(".mp-progress-fill");
      if (fillEl && audio.duration) {
        fillEl.style.width = `${Math.min(100, (audio.currentTime / audio.duration) * 100)}%`;
      }
    });

    audio.addEventListener("ended", () => {
      currentTrackKey = null;
      updatePlayerUI("paused");
    });
  }

  function updatePlayerUI(state, meta) {
    const bar = document.getElementById("museum-player-bar");
    if (!bar) return;
    const titleEl = bar.querySelector(".mp-title");
    const subEl = bar.querySelector(".mp-sub");
    const btnEl = bar.querySelector(".mp-toggle");
    const statusEl = bar.querySelector(".mp-status");

    if (meta) {
      if (titleEl) titleEl.textContent = meta.track;
      if (subEl) subEl.textContent = `${meta.artist} · 官方 30 秒試聽`;
    }

    if (state === "loading") {
      bar.classList.add("visible");
      if (btnEl) btnEl.textContent = "⏳";
      if (statusEl) statusEl.textContent = "正在載入官方 30 秒試聽…";
    } else if (state === "playing") {
      bar.classList.add("visible");
      if (btnEl) btnEl.textContent = "❚❚";
      if (statusEl) statusEl.textContent = meta && meta.isOffline ? "離線展館示範旋律播放中" : "正在播放官方 30 秒試聽";
    } else if (state === "paused") {
      if (btnEl) btnEl.textContent = "▶";
      if (statusEl) statusEl.textContent = "已暫停";
    }

    document.querySelectorAll("[data-play-track]").forEach(btn => {
      const key = `${btn.dataset.playArtist}::${btn.dataset.playTrack}`;
      const isThis = key === currentTrackKey && state === "playing";
      btn.classList.toggle("is-playing", isThis);
      const icon = btn.querySelector(".play-icon");
      if (icon) icon.textContent = isThis ? "❚❚" : "▶";
    });
  }

  async function playClassicPreview(artistName, englishName, trackName) {
    ensurePlayerBar();
    const key = `${artistName}::${trackName}`;

    if (currentTrackKey === key && !audio.paused) {
      audio.pause();
      stopOfflineChime();
      updatePlayerUI("paused");
      return;
    }

    audio.pause();
    stopOfflineChime();
    currentTrackKey = key;
    updatePlayerUI("loading", { artist: artistName, track: trackName });

    const res = await fetchItunesMulti([
      `${artistName} ${trackName}`,
      englishName ? `${englishName} ${trackName}` : "",
      trackName
    ], "song");

    if (res && res.previewUrl) {
      audio.src = res.previewUrl;
      try {
        await audio.play();
        updatePlayerUI("playing", { artist: artistName, track: trackName, isOffline: false });
        return;
      } catch (e) {}
    }

    // Fallback if offline
    updatePlayerUI("playing", { artist: artistName, track: trackName, isOffline: true });
    playOfflineChime(() => {
      currentTrackKey = null;
      updatePlayerUI("paused");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-play-track]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    playClassicPreview(
      btn.dataset.playArtist || "",
      btn.dataset.playEnglish || "",
      btn.dataset.playTrack || ""
    );
  });

  window.MuseumMedia = {
    hydrateAllRealCovers,
    playClassicPreview
  };

  document.addEventListener("DOMContentLoaded", () => {
    hydrateAllRealCovers();
  });
})();
