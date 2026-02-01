const $ = (q) => document.querySelector(q);

const startMenu  = $("#startMenu");
const startBtn   = $("#startBtn");       // ★外部Start
const dragonBtn  = $("#menuDragonBtn");  // パネル内🐉
const navList    = $("#navList");
const catList    = $("#catList");
const tagList    = $("#tagList");
const menuSearch = $("#menuSearch");

const win       = $("#win");
const winTitle  = $("#winTitle");
const winSub    = $("#winSub");
const winHint   = $("#winHint");
const contentArea = $("#contentArea");

const winMin   = $("#winMin");
const winMax   = $("#winMax");
const winClose = $("#winClose");

const clockTime = $("#clockTime");
const clockDate = $("#clockDate");

const data = window.SITE_DATA;

function esc(s){ return String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m])); }

/* ===== clock ===== */
function pad2(n){ return String(n).padStart(2,"0"); }
function dowEN(d){
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return w[d.getDay()];
}
function tick(){
  const d = new Date();
  clockTime.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  clockDate.textContent = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} (${dowEN(d)})`;
}
tick();
setInterval(tick, 1000);

/* ===== menu open/close ===== */
function isOpen(){ return startMenu.classList.contains("open"); }

function openMenu(){
  startMenu.classList.add("open");
  startMenu.setAttribute("aria-hidden","false");
  startBtn.setAttribute("aria-expanded","true");
  dragonBtn.setAttribute("aria-expanded","true");
  setTimeout(()=>menuSearch.focus(), 0);
}
function closeMenu(){
  startMenu.classList.remove("open");
  startMenu.setAttribute("aria-hidden","true");
  startBtn.setAttribute("aria-expanded","false");
  dragonBtn.setAttribute("aria-expanded","false");
}
function toggleMenu(){
  isOpen() ? closeMenu() : openMenu();
}

startBtn.addEventListener("click", (e) => { e.preventDefault(); toggleMenu(); });
dragonBtn.addEventListener("click", (e) => { e.preventDefault(); toggleMenu(); });

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeMenu();
  if(e.altKey && e.key === "Escape") hideWindow(); // お遊び
});

document.addEventListener("click", (e) => {
  // メニュー外クリックで閉じる（Startボタン・ドラゴンボタンは除外）
  if(!startMenu.contains(e.target) && !startBtn.contains(e.target) && !dragonBtn.contains(e.target)){
    closeMenu();
  }
});

/* 起動時：デスクトップ（壁紙だけ） */
closeMenu();

/* ===== window controls ===== */
function showWindow(title, sub){
  win.classList.remove("hidden");
  winTitle.textContent = title ?? "Window";
  winSub.textContent = sub ?? "";
  winHint.textContent = "ALT+ESC";
}
function hideWindow(){
  win.classList.add("hidden");
  win.classList.remove("minimized");
  win.classList.remove("maximized");
  contentArea.innerHTML = "";
}
winClose.addEventListener("click", (e) => { e.preventDefault(); hideWindow(); });
winMin.addEventListener("click", (e) => { e.preventDefault(); win.classList.toggle("minimized"); });
winMax.addEventListener("click", (e) => { e.preventDefault(); win.classList.toggle("maximized"); });

/* ===== render ===== */
function renderMenu(){
  navList.innerHTML = data.nav.map(i => `
    <li><a href="${esc(i.href)}" data-view="nav:${esc(i.title)}">
      <span>${esc(i.icon)}</span><span>${esc(i.title)}</span>
    </a></li>
  `).join("");

  catList.innerHTML = data.categories.map(c => `
    <li><a href="#cat/${encodeURIComponent(c.name)}" data-view="cat:${esc(c.name)}">
      <span>${esc(c.icon || "📁")}</span><span>${esc(c.name)}</span>
      <span class="badge">${esc(c.count)}</span>
    </a></li>
  `).join("");

  tagList.innerHTML = data.tags.map(t => `
    <li><a href="#tag/${encodeURIComponent(t.name)}" data-view="tag:${esc(t.name)}">
      <span>🏷️</span><span>${esc(t.name)}</span>
      <span class="badge">${esc(t.count)}</span>
    </a></li>
  `).join("");
}

function renderPosts(list){
  contentArea.innerHTML = list.map(p => `
    <div class="card">
      <div class="meta">${esc(p.date)} · ${esc(p.category)} · ${p.tags.map(esc).join(", ")}</div>
      <div style="margin-top:6px;font-size:16px;font-weight:800;">
        <a href="${esc(p.href)}">${esc(p.title)}</a>
      </div>
    </div>
  `).join("");
}

/* ===== app views ===== */
function viewDesktop(){
  hideWindow(); // デスクトップは壁紙だけ
}
function viewHome(){
  showWindow("Home", "Latest posts");
  renderPosts(data.posts);
}
function viewObsidian(){
  const list = data.posts.filter(p => p.tags.some(t => t.toLowerCase() === "oscp"));
  showWindow("Obsidian", "Vault: Notes (sample)");
  renderPosts(list.length ? list : data.posts);
}
function viewBrowser(){
  showWindow("Browser", "New tab: Latest posts");
  renderPosts(data.posts);
}
function viewCategory(cat){
  const list = data.posts.filter(p => p.category === cat);
  showWindow(`Category: ${cat}`, `${list.length} posts`);
  renderPosts(list);
}
function viewTag(tag){
  const list = data.posts.filter(p => p.tags.includes(tag));
  showWindow(`Tag: ${tag}`, `${list.length} posts`);
  renderPosts(list);
}
function viewSearch(q){
  const query = q.trim().toLowerCase();
  const list = !query ? data.posts : data.posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.tags.some(t => t.toLowerCase().includes(query))
  );
  showWindow(`Search: ${query || "…"}`, `${list.length} hits`);
  renderPosts(list);
}

function handleView(view){
  if(view.startsWith("nav:")){
    const name = view.slice(4);
    if(name === "Home") return viewHome();
    if(name === "Obsidian") return viewObsidian();
    if(name === "Browser") return viewBrowser();
    // About/Archiveなどは一旦posts
    showWindow(name, "Latest posts");
    return renderPosts(data.posts);
  }
  if(view.startsWith("cat:")) return viewCategory(view.slice(4));
  if(view.startsWith("tag:")) return viewTag(view.slice(4));
}

/* menu click */
startMenu.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-view]");
  if(!a) return;

  e.preventDefault();
  handleView(a.dataset.view);
});

/* dock click（パネル内ショートカット） */
startMenu.addEventListener("click", (e) => {
  const a = e.target.closest(".dock-item[data-view]");
  if(!a) return;

  e.preventDefault();
  handleView(a.dataset.view);
});

/* search */
menuSearch.addEventListener("input", () => {
  viewSearch(menuSearch.value);
});

/* ハッシュ遷移でも動くように */
function syncFromHash(){
  const h = (location.hash || "").replace(/^#/, "");
  if(!h) return;
  if(h === "home") return viewDesktop();
  if(h === "obsidian") return viewObsidian();
  if(h === "browser") return viewBrowser();
}
window.addEventListener("hashchange", syncFromHash);

/* init */
renderMenu();
viewDesktop();
syncFromHash();
