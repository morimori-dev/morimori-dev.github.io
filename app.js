const $ = (q) => document.querySelector(q);

const startMenu  = $("#startMenu");
const dragonBtn  = $("#menuDragonBtn");
const navList    = $("#navList");
const catList    = $("#catList");
const tagList    = $("#tagList");
const menuSearch = $("#menuSearch");

const contentTitle = $("#contentTitle");
const contentSub   = $("#contentSub");
const contentArea  = $("#contentArea");

const clockTime = $("#clockTime");
const clockDate = $("#clockDate");

const data = window.SITE_DATA;

function esc(s){ return String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m])); }

/* ===== clock ===== */
function pad2(n){ return String(n).padStart(2,"0"); }
function dowJP(d){
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return w[d.getDay()];
}
function tick(){
  const d = new Date();
  const t = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  const dt = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} (${dowJP(d)})`;
  clockTime.textContent = t;
  clockDate.textContent = dt;
}
tick();
setInterval(tick, 1000);

/* ===== menu open/close ===== */
function openMenu(){
  startMenu.classList.add("open");
  dragonBtn.setAttribute("aria-expanded","true");
  startMenu.setAttribute("aria-hidden","false");
  setTimeout(()=>menuSearch.focus(), 0);
}
function closeMenu(){
  startMenu.classList.remove("open");
  dragonBtn.setAttribute("aria-expanded","false");
  startMenu.setAttribute("aria-hidden","true");
}
dragonBtn.addEventListener("click", () => {
  startMenu.classList.contains("open") ? closeMenu() : openMenu();
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeMenu();
});
document.addEventListener("click", (e) => {
  // パネル外クリックで閉じる（ドラゴンボタン自体は除外）
  if(!startMenu.contains(e.target) && !dragonBtn.contains(e.target)){
    closeMenu();
  }
});

/* 起動時は「デスクトップっぽく」：メニューは閉じた状態 */
closeMenu();

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

function renderPosts(list, title, sub){
  contentTitle.textContent = title;
  contentSub.textContent   = sub;
  contentArea.innerHTML = list.map(p => `
    <div class="card">
      <div class="meta">${esc(p.date)} · ${esc(p.category)} · ${p.tags.map(esc).join(", ")}</div>
      <div style="margin-top:6px;font-size:16px;font-weight:700;">
        <a href="${esc(p.href)}">${esc(p.title)}</a>
      </div>
    </div>
  `).join("");
}

function handleView(view){
  if(view.startsWith("nav:")){
    const name = view.slice(4);
    if(name === "Home"){
      renderPosts(data.posts, "Home", "Latest posts");
    } else if(name === "Obsidian"){
      renderPosts(data.posts.filter(p => p.tags.includes("oscp")), "Obsidian", "Notes-like view (sample)");
    } else if(name === "Browser"){
      renderPosts(data.posts, "Browser", "Tabs? maybe later. For now: posts.");
    } else {
      renderPosts(data.posts, name, "Latest posts");
    }
    return;
  }
  if(view.startsWith("cat:")){
    const cat = view.slice(4);
    const list = data.posts.filter(p => p.category === cat);
    renderPosts(list, `Category: ${cat}`, `${list.length} posts`);
    return;
  }
  if(view.startsWith("tag:")){
    const tag = view.slice(4);
    const list = data.posts.filter(p => p.tags.includes(tag));
    renderPosts(list, `Tag: ${tag}`, `${list.length} posts`);
    return;
  }
}

/* menu click */
startMenu.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-view]");
  if(!a) return;
  e.preventDefault();
  handleView(a.dataset.view);
});

/* search */
menuSearch.addEventListener("input", () => {
  const q = menuSearch.value.trim().toLowerCase();
  const list = !q ? data.posts : data.posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
  renderPosts(list, q ? `Search: ${q}` : "Home", q ? `${list.length} hits` : "Latest posts");
});

renderMenu();
renderPosts(data.posts, "Home", "Latest posts");
