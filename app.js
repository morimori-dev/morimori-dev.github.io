const $ = (q) => document.querySelector(q);

const startBtn   = $("#startBtn");
const startMenu  = $("#startMenu");
const navList    = $("#navList");
const catList    = $("#catList");
const tagList    = $("#tagList");
const menuSearch = $("#menuSearch");

const contentTitle = $("#contentTitle");
const contentSub   = $("#contentSub");
const contentArea  = $("#contentArea");

const clockText = $("#clockText");

const data = window.SITE_DATA;

function esc(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ===== Clock ===== */
function pad2(n){ return String(n).padStart(2,"0"); }
function tickClock(){
  const d = new Date();
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  clockText.textContent = `${hh}:${mm}:${ss}`;
}
tickClock();
setInterval(tickClock, 1000);

/* ===== Menu open/close ===== */
function openMenu(){
  startMenu.classList.add("open");
  startBtn.setAttribute("aria-expanded","true");
  startMenu.setAttribute("aria-hidden","false");
  setTimeout(()=>menuSearch.focus(), 0);
}
function closeMenu(){
  startMenu.classList.remove("open");
  startBtn.setAttribute("aria-expanded","false");
  startMenu.setAttribute("aria-hidden","true");
}

startBtn.addEventListener("click", () => {
  startMenu.classList.contains("open") ? closeMenu() : openMenu();
});

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeMenu();
});

document.addEventListener("click", (e) => {
  if(!startMenu.contains(e.target) && !startBtn.contains(e.target)){
    closeMenu();
  }
});

/* ===== Render ===== */
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
    renderPosts(data.posts, view.slice(4), "Latest posts");
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

/* Menu click */
startMenu.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-view]");
  if(!a) return;
  e.preventDefault();
  handleView(a.dataset.view);
});

/* Search */
menuSearch.addEventListener("input", () => {
  const q = menuSearch.value.trim().toLowerCase();
  const list = !q ? data.posts : data.posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
  renderPosts(list, q ? `Search: ${q}` : "Home", q ? `${list.length} hits` : "Latest posts");
});

/* Init */
renderMenu();
renderPosts(data.posts, "Home", "Latest posts");
