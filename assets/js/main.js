const list = document.querySelector("#artist-list");
const albumWall = document.querySelector("#album-wall");
const searchInput = document.querySelector("#search");
const eraSelect = document.querySelector("#era-filter");
const regionSelect = document.querySelector("#region-filter");
const genreFilters = document.querySelector("#genre-filters");
const hallCards = document.querySelectorAll(".hall-card");
const resetBtn = document.querySelector("#reset-filters");
const favToggleBtn = document.querySelector("#fav-toggle");
const favCountEl = document.querySelector("#fav-count");
const artistCountEl = document.querySelector("#artist-count");

let activeHall = "ALL";
let activeGenre = "全部";
let onlyFavorites = false;

const STORAGE_KEY = "museum_of_sound_favorites";
let favorites = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  if (favCountEl) favCountEl.textContent = favorites.size;
}

function toggleFavorite(id, e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  saveFavorites();
  renderArtists();
}

function initSelectors() {
  if (!window.ARTISTS) return;
  if (eraSelect) {
    const eras = ["全部年代", ...new Set(window.ARTISTS.map(a => a.era))];
    eraSelect.innerHTML = eras.map(e => `<option value="${e}">${e}</option>`).join("");
  }
  if (regionSelect) {
    const regions = ["全部地區", ...new Set(window.ARTISTS.map(a => a.region))];
    regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join("");
  }
  if (genreFilters) {
    const genres = ["全部", ...new Set(window.ARTISTS.flatMap(a => a.genres))];
    genreFilters.innerHTML = genres.map(g =>
      `<button class="filter ${g === activeGenre ? 'active' : ''}" data-genre="${g}">${g}</button>`
    ).join("");
    genreFilters.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeGenre = btn.dataset.genre;
        initSelectors();
        renderArtists();
      });
    });
  }
}

function renderArtists() {
  if (!list || !window.ARTISTS) return;
  const q = (searchInput?.value || "").trim().toLowerCase();
  const eraVal = eraSelect?.value || "全部年代";
  const regionVal = regionSelect?.value || "全部地區";

  const found = window.ARTISTS.filter(a => {
    const searchable = [a.name, a.englishName, a.region, a.hallName, ...(a.genres || []), ...(a.works || [])].join(" ").toLowerCase();
    const matchQuery = !q || searchable.includes(q);
    const matchHall = activeHall === "ALL" || a.hall === activeHall;
    const matchGenre = activeGenre === "全部" || (a.genres || []).includes(activeGenre);
    const matchEra = eraVal === "全部年代" || a.era === eraVal;
    const matchRegion = regionVal === "全部地區" || a.region === regionVal;
    const matchFav = !onlyFavorites || favorites.has(a.id);
    return matchQuery && matchHall && matchGenre && matchEra && matchRegion && matchFav;
  });

  if (artistCountEl) {
    artistCountEl.textContent = `${found.length} / ${window.ARTISTS.length} EXHIBITS`;
  }

  list.innerHTML = found.length ? found.map(a => {
    const isSaved = favorites.has(a.id);
    return `
      <article class="artist-card">
        <div class="card-top">
          <span class="hall-badge">HALL ${a.hallName}</span>
          <button class="fav-btn ${isSaved ? 'saved' : ''}" data-fav-id="${a.id}" title="${isSaved ? '取消收藏' : '加入收藏'}" aria-label="收藏 ${a.name}">
            ${isSaved ? '★' : '☆'}
          </button>
        </div>
        <div class="sleeve-preview">
          <div class="artist-emblem" data-artist-cover="${a.name} ${a.albums?.[0]?.title || ''}" data-artist-alt-cover="${a.englishName || a.name} ${a.albums?.[0]?.title || ''}" style="background:${a.accentColor || '#38271f'}">${a.monogram || 'LP'}</div>
          <div class="artist-title-block">
            <h3>${a.name}</h3>
            <div class="english">${a.englishName || ''}</div>
            <div class="meta-line">${a.region} · ${a.era}</div>
          </div>
        </div>
        <p>${a.intro}</p>
        <div class="tags">${(a.genres || []).map(g => `<span class="tag">${g}</span>`).join("")}</div>
        <div class="card-actions-row">
          ${a.works?.[0] ? `<button class="mini-play-btn" type="button" data-play-track="${a.works[0]}" data-play-artist="${a.name}" data-play-english="${a.englishName || ''}"><span class="play-icon">▶</span><span>試聽〈${a.works[0]}〉</span></button>` : ''}
        </div>
        <div class="card-footer-link">
          <span>進入展間與代表專輯</span>
          <span>→</span>
        </div>
        <a class="card-link" href="${a.page}" aria-label="進入${a.name}展間"></a>
      </article>
    `;
  }).join("") : `<div class="empty">目前篩選條件下找不到符合的音樂人典藏，試著切換展區或重設篩選條件。</div>`;

  list.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => toggleFavorite(btn.dataset.favId, e));
  });
  if (window.MuseumMedia) window.MuseumMedia.hydrateAllRealCovers();
}

function renderAlbumWall() {
  if (!albumWall || !window.ARTISTS) return;
  const featuredAlbums = [];
  window.ARTISTS.forEach(a => {
    if (a.albums && a.albums.length > 0) {
      featuredAlbums.push({
        ...a.albums[0],
        artistName: a.name,
        englishName: a.englishName,
        artistPage: a.page,
        hallName: a.hallName
      });
    }
  });

  albumWall.innerHTML = featuredAlbums.map(alb => `
    <article class="album-crate">
      <div class="vinyl-jacket" data-album-query="${alb.artistName} ${alb.title}" data-album-alt-query="${alb.englishName} ${alb.title}" style="background: linear-gradient(145deg, ${alb.coverColor}, #1b1410);">
        <span class="jacket-year">LP · ${alb.year}</span>
        <div>
          <div class="jacket-title">${alb.title}</div>
          <div class="jacket-artist">${alb.artistName} (${alb.englishName})</div>
        </div>
      </div>
      <p>${alb.note}</p>
      <div class="album-crate-actions">
        <span style="color:#a99988;font-size:11px;">${alb.hallName}</span>
        <a href="${alb.artistPage}">查看音樂人 →</a>
      </div>
    </article>
  `).join("");
  if (window.MuseumMedia) window.MuseumMedia.hydrateAllRealCovers();
}

hallCards.forEach(card => {
  card.addEventListener("click", () => {
    const hall = card.dataset.hall;
    activeHall = (activeHall === hall) ? "ALL" : hall;
    hallCards.forEach(c => c.classList.toggle("active", c.dataset.hall === activeHall));
    renderArtists();
    document.querySelector("#artists")?.scrollIntoView({ behavior: "smooth" });
  });
});

if (searchInput) searchInput.addEventListener("input", renderArtists);
if (eraSelect) eraSelect.addEventListener("change", renderArtists);
if (regionSelect) regionSelect.addEventListener("change", renderArtists);

if (favToggleBtn) {
  favToggleBtn.addEventListener("click", () => {
    onlyFavorites = !onlyFavorites;
    favToggleBtn.classList.toggle("active", onlyFavorites);
    renderArtists();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    activeHall = "ALL";
    activeGenre = "全部";
    onlyFavorites = false;
    if (searchInput) searchInput.value = "";
    if (eraSelect) eraSelect.value = "全部年代";
    if (regionSelect) regionSelect.value = "全部地區";
    if (favToggleBtn) favToggleBtn.classList.remove("active");
    hallCards.forEach(c => c.classList.remove("active"));
    initSelectors();
    renderArtists();
  });
}

saveFavorites();
initSelectors();
renderArtists();
renderAlbumWall();
