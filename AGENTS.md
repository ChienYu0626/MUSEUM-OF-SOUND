# AGENTS.md — MUSEUM OF SOUND（聲音博物館）

## 1. 專案定位與目標

本專案為一座線上華語與世界流行音樂策展博物館，名稱為 **MUSEUM OF SOUND｜聲音博物館**（副標：*A Museum of Music & Memories*）。

我們將網站打造為具有實體唱片博物館空間感的數位展館，包含「入口大廳、四大常設主題展區、音樂人典藏館、經典黑膠專輯收藏牆、多維度音樂探索篩選（展區／年代／地區／曲風）與個人收藏清單」。

本網站定位為**音樂文化與知識策展平台**，嚴格遵守著作權規範：不提供任何未經授權的音檔下載、侵權圖片或完整歌詞轉載，所有音樂試聽均導向 Spotify 或 YouTube 官方平台與合法搜尋連結。

---

## 2. 核心開發與協作原則

1. **先讀規範再動工**：每次新增音樂人、擴充專輯或修改頁面版型前，必須先閱讀本 `AGENTS.md`，確保完全符合展館美學、資料結構與檔案命名規則。
2. **維持博物館一致美學**：所有新頁面必須沿用 `assets/css/style.css` 的色彩變數與版型結構，不得私自引入互不相容的樣式框架或高飽和霓虹色系。
3. **單一資料來源驅動（Single Source of Truth）**：所有音樂人、四大展區歸屬、代表專輯與官方連結皆集中於 `assets/js/artists.js`，首頁典藏卡片、專輯收藏牆、篩選器皆由程式動態渲染，禁止在首頁重複硬編碼卡片。
4. **保留既有互動功能**：修改網站時，必須完整保留「四大展區切換、關鍵字搜尋、年代／地區／曲風交叉篩選、黑膠唱片旋轉展示、LocalStorage 我的收藏」等功能。
5. **嚴禁虛構音樂資料**：音樂人出道年代、所屬地區、專輯名稱與發行年份必須經過查證；若資訊不確定，應省略該選填欄位或標註待查證，絕不憑空編造。
6. **嚴格遵守著作權邊界**：
   - 視覺呈現採用「黑膠唱片封套幾何美學（Monogram + 專屬色票 + 旋轉黑膠動畫）」與自製 CSS 視覺元素，不盜用未授權藝人肖像或專輯封面圖檔。
   - 音樂播放統一透過 `spotifySearch` 與 `youtubeSearch` 導向官方合法平台收聽。
   - 僅列出代表作品名稱，嚴禁張貼完整歌詞或提供 MP3 下載。
7. **零建置依賴（Zero-Build Static Site）**：全程使用原生 HTML5、CSS3 與 Vanilla JavaScript，不依賴 Node.js、npm、付費 API 或後端伺服器，確保可直接部署於 GitHub Pages。

---

## 3. 技術架構與目錄結構

```text
museum-of-sound/
├── index.html                  # 博物館入口大廳（主視覺、四大展區、典藏篩選、專輯收藏牆）
├── AGENTS.md                   # AI 協作與專案擴充規範文件（本文件）
├── README.md                   # 專案說明與 GitHub Pages 部署指南
├── artists/                    # 各音樂人獨立專屬展間頁面
│   ├── leslie-cheung.html      # 張國榮
│   ├── beyond.html             # Beyond
│   ├── faye-wong.html          # 王菲
│   ├── eason-chan.html         # 陳奕迅
│   ├── gem.html                # 鄧紫棋
│   ├── michael-jackson.html    # 麥可·傑克森 (Michael Jackson)
│   ├── air-supply.html         # 空中補給 (Air Supply)
│   ├── westlife.html           # 西城男孩 (Westlife)
│   ├── aerosmith.html          # 史密斯飛船 (Aerosmith)
│   ├── bon-jovi.html           # 邦喬飛 (Bon Jovi)
│   ├── queen.html              # 皇后合唱團 (Queen)
│   ├── sodagreen.html          # 蘇打綠
│   ├── mayday.html             # 五月天
│   ├── amazing-show.html       # 美秀集團
│   ├── mango-jump.html         # 芒果醬
│   ├── jay-chou.html           # 周杰倫
│   ├── david-tao.html          # 陶喆
│   ├── khalil-fong.html        # 方大同
│   ├── yen-j.html              # 嚴爵
│   ├── sam-lee.html            # 李聖傑
│   ├── ayal-komod.html         # 張震嶽
│   └── nine-one-one.html       # 玖壹壹
└── assets/
    ├── css/
    │   └── style.css           # 全站博物館視覺樣式與響應式排版
    ├── js/
    │   ├── artists.js          # 全館 22 組音樂人與代表專輯結構化資料庫
    │   └── main.js             # 展區切換、多維度篩選、專輯牆渲染與收藏清單邏輯
    └── images/                 # 自製或已獲授權之靜態圖片資源（若有）
```

**路徑規範**：全站一律使用相對路徑（例如首頁使用 `assets/css/style.css`，子頁面 `artists/*.html` 使用 `../assets/css/style.css`），確保部署至 `https://<username>.github.io/<repo-name>/` 時所有資源皆可正確載入。

---

## 4. 四大常設展區分類規範

所有音樂人必須歸入以下四大常設展區之一（不可隨意自創未定義的展區編號）：

| 展區代碼 (`hall`) | 展區全名 (`hallName`) | 策展定位與代表曲風 |
| :--- | :--- | :--- |
| `"01"` | `"01｜香港與華語經典"` | 粵語流行、經典港樂、跨世代華語流行代表 |
| `"02"` | `"02｜世界流行音樂"` | 歐美及國際經典 Pop、Rock、Soft Rock、Arena Rock |
| `"03"` | `"03｜台灣樂團與獨立音樂"` | 台灣創作樂團、Alternative Rock、Indie Rock、流行搖滾 |
| `"04"` | `"04｜華語創作與 R&B"` | 華語 R&B、Soul、嘻哈、爵士流行與創作型歌手 |

---

## 5. 視覺設計與色彩規範

本專案採用「**高級唱片博物館 × 精品音樂雜誌**」視覺風格：

- **色彩變數（定義於 `assets/css/style.css`）**：
  - 深胡桃木（展館主結構與深色展牆）：`--walnut: #241914`
  - 奶油白（展館紙本閱讀底色）：`--cream: #f6f1e7`
  - 暖米白卡片底色：`--card-bg: #fcf9f2`
  - 古銅金（展品編號、邊框與徽章點綴）：`--bronze: #b88c4a`
  - 酒紅色（重點強調、互動按鈕與標籤）：`--burgundy: #7a2832`
  - 深墨色內文：`--ink: #231b16`
- **字體搭配**：標題採用襯線體 `'Cormorant Garamond'` 與 `'Noto Serif TC'` 營造人文典藏感；內文與介面標籤採用 `'DM Sans'` 與 `'Noto Serif TC'` 確保清晰易讀。
- **響應式設計**：支援桌機（3～4 欄網格）、平板（2 欄網格）與手機（單欄閱讀），嚴禁在窄螢幕產生水平捲動軸。

---

## 6. `assets/js/artists.js` 資料格式規範

新增或修改音樂人時，必須嚴格遵守以下 JavaScript 物件結構：

```javascript
{
  id: "artist-slug",                 // 必填：唯一識別碼，小寫英文與連字號，須與檔名一致
  name: "音樂人中文名稱",             // 必填：主要顯示名稱
  englishName: "English Name",       // 必填：英文名稱或羅馬拼音
  hall: "02",                        // 必填：展區代碼，僅限 "01" | "02" | "03" | "04"
  hallName: "02｜世界流行音樂",       // 必填：須與 hall 代碼完全對應
  region: "英國",                    // 必填：所屬國家或地區（如：台灣、香港、美國、英國）
  era: "1970年代",                   // 必填：活躍經典年代（如：1970年代、1980年代、1990年代、2000年代、2010年代至今）
  genres: ["Rock", "Arena Rock"],    // 必填：曲風標籤陣列（2～3 項，首頁篩選器會自動彙整）
  accentColor: "#6E2639",            // 必填：黑膠唱片封套專屬低飽和深色色碼
  monogram: "QN",                    // 必填：2～3 碼英文縮寫，顯示於黑膠封套中央
  intro: "約 50～90 字策展簡介。",    // 必填：客觀描述音樂地位與風格，使用繁體中文
  highlights: [                      // 必填：3 項聲音與音樂特色陣列
    "特色一",
    "特色二",
    "特色三"
  ],
  albums: [                          // 必填：1～2 張館藏代表專輯
    {
      title: "專輯名稱",
      year: "1975",
      note: "約 25～45 字專輯策展導覽說明。",
      coverColor: "#2B2836"          // 專輯封面視覺色票
    }
  ],
  works: ["代表曲目一", "代表曲目二", "代表曲目三", "代表曲目四"], // 必填：4 首入門聆聽曲名（不含歌詞）
  spotifySearch: "https://open.spotify.com/search/...", // 必填：Spotify 官方搜尋連結
  youtubeSearch: "https://www.youtube.com/results?search_query=...", // 必填：YouTube 官方搜尋連結
  page: "artists/artist-slug.html"   // 必填：對應獨立展間相對路徑
}
```

---

## 7. 檔案命名與放置規則

- **音樂人獨立頁面**：一律存放於 `artists/<id>.html`，檔名必須全小寫英文並以連字號 `-` 分隔（例如 `artists/bon-jovi.html`、`artists/sodagreen.html`），嚴禁使用中文、空白或底線。
- **共用樣式表**：集中於 `assets/css/style.css`，不在單一 HTML 內寫大量 `<style>` 區塊。
- **共用腳本與資料**：資料放 `assets/js/artists.js`，互動邏輯放 `assets/js/main.js`。

---

## 8. AI 新增音樂人／專輯之標準作業流程（SOP）

當使用者要求「新增某位音樂人（例如：陳綺貞、Coldplay 或 Linkin Park）」或「為現有音樂人新增專輯」時，AI 必須依序執行以下步驟：

1. **查核規範與資料**：閱讀本 `AGENTS.md`，確認該音樂人應歸屬的展區（`01`～`04`）、活躍年代、地區、代表專輯與曲風，不確定的年份需核實。
2. **更新資料庫 (`assets/js/artists.js`)**：在 `window.ARTISTS` 陣列對應展區位置插入一筆完整符合第 6 節格式的 JSON 物件；首頁的音樂人卡片、篩選下拉選單與專輯收藏牆將自動同步更新，無需手動修改 `index.html`。
3. **建立獨立展間 (`artists/<id>.html`)**：複製 `artists/` 目錄下任一既有頁面（如 `artists/queen.html`）的完整 HTML 結構，填入該音樂人的導覽簡介、音樂特色、館藏專輯與官方搜尋連結，並確認引用 `../assets/css/style.css` 與返回連結 `../index.html#artists`。
4. **執行品質檢查**：確認 `id` 與 `page` 檔名一致、JSON 語法無誤、所有連結皆為相對路徑，且無任何未授權歌詞或音檔。
5. **向使用者回報**：清楚列出新增或修改的檔案清單、所屬展區分類與任何待確認的音樂資料。

---

## 9. 完成前品質檢查清單（Checklist）

- [ ] `index.html` 開啟後可正常顯示四大展區、22 組音樂人卡片與專輯收藏牆。
- [ ] 點擊四大展區按鈕可正確篩選對應館藏，再次點擊可取消篩選。
- [ ] 關鍵字搜尋、年代、地區與曲風篩選可交叉運作，且「重設條件」按鈕正常。
- [ ] 點擊卡片右上角星號可加入／移除「我的收藏」，重新整理頁面後仍保留紀錄。
- [ ] 點擊任一音樂人卡片或專輯牆連結皆可正常開啟 `artists/<slug>.html` 專屬展間。
- [ ] 專屬展間的「返回音樂人典藏館」與「回到博物館入口大廳」連結運作正常。
- [ ] 全站無任何侵權圖片、盜版音檔或完整歌詞。
