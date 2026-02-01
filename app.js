const $ = (q) => document.querySelector(q);

const startMenu  = $("#startMenu");
const startBtn   = $("#startBtn");       // PC topbar 🐉
const navList    = $("#navList");
const catList    = $("#catList");
const tagList    = $("#tagList");
const menuSearch = $("#menuSearch");

const win        = $("#win");
const winTitle   = $("#winTitle");
const winSub     = $("#winSub");
const winTitlebar = $("#winTitlebar");
const winBody    = $("#winBody");
const contentArea = $("#contentArea");

const clockTime = $("#clockTime");
const clockDate = $("#clockDate");

const data = window.SITE_DATA;

function esc(s){ return String(s).replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[m])); }

function isMobile(){
  return window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(pointer: coarse)").matches;
}

/* ===== Clock (PC only visible, but harmless) ===== */
function pad2(n){ return String(n).padStart(2,"0"); }
function dowEN(d){
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return w[d.getDay()];
}
function tick(){
  const d = new Date();
  if(clockTime) clockTime.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  if(clockDate) clockDate.textContent = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} (${dowEN(d)})`;
}
tick();
setInterval(tick, 1000);

/* ===== Menu open/close ===== */
function isMenuOpen(){ return startMenu.classList.contains("open"); }

function openMenu(){
  startMenu.classList.add("open");
  startMenu.setAttribute("aria-hidden","false");
  if(startBtn) startBtn.setAttribute("aria-expanded","true");
  setTimeout(()=>menuSearch?.focus(), 0);
}
function closeMenu(){
  startMenu.classList.remove("open");
  startMenu.setAttribute("aria-hidden","true");
  if(startBtn) startBtn.setAttribute("aria-expanded","false");
}
function toggleMenu(){ isMenuOpen() ? closeMenu() : openMenu(); }

startBtn?.addEventListener("click", (e) => { e.preventDefault(); toggleMenu(); });

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeMenu();
  if(e.altKey && e.key === "Escape") hideWindow();
});

document.addEventListener("click", (e) => {
  if(startBtn && !startMenu.contains(e.target) && !startBtn.contains(e.target)){
    closeMenu();
  }
  // mobile: outside tap closes menu too
  if(!startBtn && isMobile() && isMenuOpen() && !startMenu.contains(e.target)){
    closeMenu();
  }
});

/* ===== Window helpers ===== */
function showWindow(title, sub){
  win.classList.remove("hidden");
  startMenu.classList.add("has-window");
  winTitle.textContent = title ?? "Window";
  winSub.textContent = sub ?? "";
}
function hideWindow(){
  win.classList.add("hidden");
  startMenu.classList.remove("has-window");
  contentArea.innerHTML = "";
}

/* ===== Mobile close gestures ===== */
winTitlebar?.addEventListener("click", () => {
  if(isMobile() && !win.classList.contains("hidden")) hideWindow();
});

let touchStartY = null;
let touchStartX = null;
let touchStartScrollTop = null;

function onTouchStart(e){
  if(win.classList.contains("hidden")) return;
  const t = e.touches[0];
  touchStartY = t.clientY;
  touchStartX = t.clientX;
  touchStartScrollTop = winBody ? winBody.scrollTop : 0;
}
function onTouchEnd(e){
  if(win.classList.contains("hidden")) return;
  if(touchStartY === null) return;

  const t = e.changedTouches[0];
  const dy = t.clientY - touchStartY;
  const dx = t.clientX - touchStartX;

  if(isMobile() && dy > 90 && Math.abs(dx) < 40 && (touchStartScrollTop ?? 0) <= 2){
    hideWindow();
  }
  touchStartY = null; touchStartX = null; touchStartScrollTop = null;
}
winBody?.addEventListener("touchstart", onTouchStart, {passive:true});
winBody?.addEventListener("touchend", onTouchEnd, {passive:true});

/* ===== Render helpers ===== */
function renderCards(list){
  contentArea.innerHTML = list.map(p => `
    <div class="card">
      <div class="meta">${esc(p.date)} · ${esc(p.section)} · ${esc(p.collection)} · ${p.tags.map(esc).join(", ")}</div>
      <div style="margin-top:6px;font-size:16px;font-weight:800;">
        <a href="${esc(p.href)}">${esc(p.title)}</a>
      </div>
    </div>
  `).join("");
}

function renderFolderGrid(items, title, subtitle){
  showWindow(title, subtitle);
  contentArea.innerHTML = items.map(it => `
    <div class="card">
      <div class="meta">${esc(it.meta || "")}</div>
      <div style="margin-top:6px;font-size:16px;font-weight:900;">
        <a href="${esc(it.href)}" data-view="${esc(it.view)}">${esc(it.icon || "📁")} ${esc(it.title)}</a>
      </div>
      <div style="margin-top:6px;color:rgba(255,255,255,.70);font-size:13px;">
        ${esc(it.desc || "")}
      </div>
    </div>
  `).join("");
}

/* ===== Views ===== */
function viewDesktop(){
  hideWindow();
  closeMenu();
}

function viewWriteups(){
  const items = [
    { icon:"🧱", title:"Hack The Box (HTB)", view:"cat:HTB", href:"#cat/HTB", meta:"Writeups", desc:"Machines & challenges with clear attack chains." },
    { icon:"🧩", title:"TryHackMe (THM)", view:"cat:THM", href:"#cat/THM", meta:"Writeups", desc:"Learning paths & rooms (structured notes + exploitation)." },
    { icon:"🏋️", title:"Proving Grounds (PG)", view:"cat:Proving%20Grounds", href:"#cat/Proving%20Grounds", meta:"Writeups", desc:"OffSec-style practice with exam-aligned workflows." },
    { icon:"⛓️", title:"Attack Chains", view:"cat:Attack%20Chains", href:"#cat/Attack%20Chains", meta:"Writeups", desc:"Initial access → privesc → pivot (reusable patterns)." },
    { icon:"🧬", title:"Active Directory", view:"cat:Active%20Directory", href:"#cat/Active%20Directory", meta:"Writeups", desc:"Kerberos, LDAP, ACLs, cert abuse—organized by technique." },
  ];
  renderFolderGrid(items, "Writeups", "HTB / THM / Proving Grounds + career-oriented collections");
}

function viewNotes(){
  const items = [
    { icon:"📌", title:"Cheatsheets", view:"cat:Cheatsheets", href:"#cat/Cheatsheets", meta:"Notes", desc:"Command snippets & one-liners (fast recall)." },
    { icon:"🧭", title:"Methodology", view:"cat:Methodology", href:"#cat/Methodology", meta:"Notes", desc:"Enumeration → hypothesis → validation (repeatable process)." },
    { icon:"🛠️", title:"Tooling", view:"cat:Tooling", href:"#cat/Tooling", meta:"Notes", desc:"Burp, nmap, BloodHound, Certipy, ligolo-ng, etc." },
  ];
  renderFolderGrid(items, "Notes", "Your Obsidian-style knowledge base (export-friendly)");
}

function viewBlog(){
  const items = [
    { icon:"🔬", title:"Deep Dives", view:"cat:Deep%20Dives", href:"#cat/Deep%20Dives", meta:"Blog", desc:"One topic, deeply explained with examples." },
    { icon:"🧾", title:"Postmortems", view:"cat:Postmortems", href:"#cat/Postmortems", meta:"Blog", desc:"What failed, why, and the improved approach." },
  ];
  renderFolderGrid(items, "Blog", "Long-form technical writing");
}

function viewProjects(){
  showWindow("Projects", "Tools, scripts, and infra you built");
  const list = data.posts.filter(p => p.section === "Projects");
  renderCards(list);
}

function viewResume(){
  showWindow("Resume", "A fast recruiter-friendly snapshot");
  contentArea.innerHTML = `
    <div class="card">
      <div class="meta">Career</div>
      <div style="margin-top:6px;font-size:16px;font-weight:900;">📄 Resume</div>
      <div style="margin-top:8px;color:rgba(255,255,255,.75);font-size:13px;line-height:1.5;">
        Add your resume links here (PDF + LinkedIn).
      </div>
    </div>
  `;
}

function viewAbout(){
  showWindow("About", "Who you are, what you do, and what you’re looking for");
  contentArea.innerHTML = `
    <div class="card">
      <div class="meta">About</div>
      <div style="margin-top:6px;font-size:16px;font-weight:900;">👋 About this site</div>
      <div style="margin-top:8px;color:rgba(255,255,255,.75);font-size:13px;line-height:1.6;">
        A desktop-themed portfolio for security writeups (HTB/THM/PG),
        technique notes, and career-oriented case studies.
      </div>
    </div>
  `;
}

function viewContact(){
  showWindow("Contact", "Links & handles");
  contentArea.innerHTML = `
    <div class="card">
      <div class="meta">Contact</div>
      <div style="margin-top:6px;font-size:16px;font-weight:900;">✉️ Contact</div>
      <div style="margin-top:8px;color:rgba(255,255,255,.75);font-size:13px;line-height:1.6;">
        Add: Email, GitHub, LinkedIn, X, etc.
      </div>
    </div>
  `;
}

/* category/tag filters */
function viewCollection(name){
  const list = data.posts.filter(p => p.collection === name);
  showWindow(name, `${list.length} items`);
  renderCards(list);
}
function viewTag(tag){
  const list = data.posts.filter(p => p.tags.includes(tag));
  showWindow(`#${tag}`, `${list.length} items`);
  renderCards(list);
}

/* ===== Routing ===== */
function handleNav(name){
  if(name === "Home") return viewDesktop();
  if(name === "Writeups") return viewWriteups();
  if(name === "Notes") return viewNotes();
  if(name === "Blog") return viewBlog();
  if(name === "Projects") return viewProjects();
  if(name === "Resume") return viewResume();
  if(name === "About") return viewAbout();
  if(name === "Contact") return viewContact();

  showWindow(name, "Latest");
  renderCards(data.posts);
}

function handleView(view){
  if(view === "menu:open"){ openMenu(); return; }
  if(view.startsWith("nav:")) return handleNav(view.slice(4));
  if(view.startsWith("cat:")) return viewCollection(decodeURIComponent(view.slice(4)));
  if(view.startsWith("tag:")) return viewTag(decodeURIComponent(view.slice(4)));
}

/* ===== Menu lists ===== */
function renderMenu(){
  navList.innerHTML = data.nav.map(i => `
    <li><a href="${esc(i.href)}" data-view="nav:${esc(i.title)}">
      <span>${esc(i.icon)}</span><span>${esc(i.title)}</span>
    </a></li>
  `).join("");

  catList.innerHTML = data.collections.map(c => `
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

/* Click: inside start menu */
startMenu.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-view]");
  if(!a) return;
  e.preventDefault();
  handleView(a.dataset.view);
});

/* Click: mobile tabs */
document.addEventListener("click", (e) => {
  const b = e.target.closest(".mtab[data-view]");
  if(!b) return;
  e.preventDefault();
  handleView(b.dataset.view);
});

/* Search */
menuSearch.addEventListener("input", () => {
  const q = menuSearch.value.trim().toLowerCase();
  const list = !q ? data.posts : data.posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.section.toLowerCase().includes(q) ||
    p.collection.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
  showWindow(`Search: ${q || "…"}`, `${list.length} items`);
  renderCards(list);
});

/* Hash sync */
function syncFromHash(){
  const raw = (location.hash || "").replace(/^#/, "");
  if(!raw) return;

  if(raw === "home") return viewDesktop();
  if(raw === "writeups") return viewWriteups();
  if(raw === "notes") return viewNotes();

  if(raw.startsWith("cat/")){
    const name = decodeURIComponent(raw.slice(4));
    return viewCollection(name);
  }
  if(raw.startsWith("tag/")){
    const name = decodeURIComponent(raw.slice(4));
    return viewTag(name);
  }
}
window.addEventListener("hashchange", syncFromHash);

/* Init */
renderMenu();
viewDesktop();
syncFromHash();
