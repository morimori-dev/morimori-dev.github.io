(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const startBtn = $("#startBtn");            // PC start
  const startMenu = $("#startMenu");
  const menuSearch = $("#menuSearch");

  const navList = $("#navList");
  const catList = $("#catList");
  const tagList = $("#tagList");

  const win = $("#win");
  const winTitle = $("#winTitle");
  const winSub = $("#winSub");
  const contentArea = $("#contentArea");

  const clockTime = $("#clockTime");
  const clockDate = $("#clockDate");

  const mobileMenuBtn = $(".dock-btn--menu"); // Mobile start
  const dockButtons = $$("[data-view]");      // All dock buttons (incl menu)

  const DATA_FALLBACK = {
    nav: [
      { label: "Home", icon: "🏠", view: "nav:Home" },
      { label: "Writeups", icon: "🧪", view: "nav:Writeups" },
      { label: "Notes", icon: "🧠", view: "nav:Notes" },
      { label: "Blog", icon: "📝", view: "nav:Blog" },
      { label: "Projects", icon: "🛠️", view: "nav:Projects" },
      { label: "Resume", icon: "📄", view: "nav:Resume" },
      { label: "About", icon: "👋", view: "nav:About" },
      { label: "Contact", icon: "✉️", view: "nav:Contact" },
    ],
    categories: [
      { label: "HTB", icon: "🧱", count: 1, view: "cat:HTB" },
      { label: "THM", icon: "🧩", count: 1, view: "cat:THM" },
      { label: "Proving Grounds", icon: "🏟️", count: 1, view: "cat:PG" },
    ],
    tags: [
      { label: "AD", icon: "🧬", count: 1, view: "tag:AD" },
      { label: "Privesc", icon: "🪜", count: 1, view: "tag:Privesc" },
      { label: "Web", icon: "🕸️", count: 1, view: "tag:Web" },
    ],
    cards: {
      "nav:Home": [
        { title: "Welcome", meta: "Home", desc: "Desktop-style launcher for your writeups.", href: "#home" }
      ],
      "nav:Writeups": [
        { title: "Hack The Box (HTB)", meta: "Writeups", desc: "Machines & challenges with clear attack chains.", href: "#writeups" },
        { title: "TryHackMe (THM)", meta: "Writeups", desc: "Learning paths & rooms (structured notes + exploitation).", href: "#writeups" },
        { title: "Proving Grounds (PG)", meta: "Writeups", desc: "OffSec-style practice with exam-aligned workflows.", href: "#writeups" },
        { title: "Attack Chains", meta: "Writeups", desc: "Initial access → privesc → pivot (reusable patterns).", href: "#writeups" },
      ],
      "nav:Notes": [
        { title: "Notes Index", meta: "Notes", desc: "Concept notes and reusable techniques.", href: "#notes" }
      ]
    }
  };

  // data.js が壊れてても死なないように
  let DATA_SRC = DATA_FALLBACK;
  try {
    if (typeof window.DATA === "object" && window.DATA) DATA_SRC = window.DATA;
  } catch (_) {}

  let menuOpen = false;

  function isMenuOpen() {
    return !!startMenu?.classList.contains("open");
  }

  function setMenuOpen(open) {
    menuOpen = !!open;
    if (!startMenu) return;

    startMenu.classList.toggle("open", menuOpen);
    startMenu.setAttribute("aria-hidden", menuOpen ? "false" : "true");
    if (startBtn) startBtn.setAttribute("aria-expanded", menuOpen ? "true" : "false");

    if (menuOpen) {
      setTimeout(() => menuSearch && menuSearch.focus({ preventScroll: true }), 0);
    }
  }

  function toggleMenu() {
    setMenuOpen(!isMenuOpen());
  }

  function ensureWindowVisible(show) {
    if (!win) return;
    win.classList.toggle("hidden", !show);
    startMenu?.classList.toggle("has-window", !!show);
  }

  function renderList(ul, items) {
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = it.href || "#";
      a.dataset.view = it.view;

      a.innerHTML =
        `<span aria-hidden="true">${it.icon || "•"}</span>` +
        `<span>${it.label}</span>` +
        (typeof it.count === "number" ? `<span class="badge">${it.count}</span>` : "");

      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderCards(viewKey) {
    const cards = (DATA_SRC.cards && DATA_SRC.cards[viewKey]) ? DATA_SRC.cards[viewKey] : [];
    if (!contentArea) return;

    contentArea.innerHTML = "";

    if (!cards.length) {
      contentArea.innerHTML =
        `<div class="card"><div class="meta">${escapeHtml(viewKey)}</div>` +
        `<div style="margin-top:6px;opacity:.85;">No items yet.</div></div>`;
      return;
    }

    cards.forEach((c) => {
      const div = document.createElement("div");
      div.className = "card";
      const meta = c.meta ? `<div class="meta">${escapeHtml(c.meta)}</div>` : "";
      const title = `<div style="font-weight:900;margin-top:4px;">${escapeHtml(c.title || "Untitled")}</div>`;
      const desc = c.desc ? `<div style="margin-top:6px;opacity:.85;">${escapeHtml(c.desc)}</div>` : "";
      const link = c.href ? `<div style="margin-top:10px;"><a href="${c.href}">Open</a></div>` : "";
      div.innerHTML = `${meta}${title}${desc}${link}`;
      contentArea.appendChild(div);
    });
  }

  function openView(viewKey) {
    const label = viewKey.split(":")[1] || viewKey;
    if (winTitle) winTitle.textContent = label;
    if (winSub) winSub.textContent = "Loaded.";
    ensureWindowVisible(true);
    renderCards(viewKey);
  }

  function applyFilter(q) {
    const query = (q || "").trim().toLowerCase();
    const anchors = $$("a[data-view]", startMenu);
    anchors.forEach((a) => {
      const t = a.textContent.toLowerCase();
      const ok = !query || t.includes(query);
      a.parentElement.style.display = ok ? "" : "none";
    });
  }

  // ===== Init =====
  renderList(navList, DATA_SRC.nav || []);
  renderList(catList, DATA_SRC.categories || []);
  renderList(tagList, DATA_SRC.tags || []);

  // ===== Start buttons (PC / Mobile) =====
  function bindToggle(el) {
    if (!el) return;

    // iOSでも確実に拾う：pointerdown + click
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  bindToggle(startBtn);
  bindToggle(mobileMenuBtn);

  // ===== Dock buttons open views =====
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const view = btn.dataset.view;
      if (!view) return;

      if (view === "menu:open") {
        // menuボタンは bindToggle が担当（保険で何もしない）
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(true);
      openView(view);
    });
  });

  // ===== Menu item click =====
  startMenu?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    const view = a.dataset.view;
    if (!view) return;

    e.preventDefault();
    openView(view);
  });

  // ===== Outside close (堅牢化：pointerdown capture) =====
  document.addEventListener("pointerdown", (e) => {
    if (!isMenuOpen()) return;

    const t = e.target;
    const inside =
      (startMenu && startMenu.contains(t)) ||
      (startBtn && startBtn.contains(t)) ||
      (mobileMenuBtn && mobileMenuBtn.contains(t));

    if (!inside) setMenuOpen(false);
  }, true);

  // Esc closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  // Search filter
  menuSearch?.addEventListener("input", (e) => {
    applyFilter(e.target.value);
  });

  // Tap titlebar to close window on mobile (optional)
  $("#winTitlebar")?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      ensureWindowVisible(false);
    }
  });

  // ===== Clock =====
  function pad2(n){ return String(n).padStart(2, "0"); }
  function tickClock() {
    const d = new Date();
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    if (clockTime) clockTime.textContent = `${hh}:${mm}:${ss}`;

    const y = d.getFullYear();
    const mo = pad2(d.getMonth()+1);
    const da = pad2(d.getDate());
    const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    if (clockDate) clockDate.textContent = `${y}-${mo}-${da} (${wd})`;
  }
  tickClock();
  setInterval(tickClock, 1000);
})();
