(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const startBtn = $("#startBtn");
  const startMenu = $("#startMenu");
  const menuSearch = $("#menuSearch");
  const overlay = $("#overlay");

  const navList = $("#navList");
  const catList = $("#catList");
  const tagList = $("#tagList");

  const win = $("#win");
  const winTitle = $("#winTitle");
  const winSub = $("#winSub");
  const contentArea = $("#contentArea");

  // PC clock
  const clockTime = $("#clockTime");
  const clockDate = $("#clockDate");
  // Mobile dock clock
  const mClockTime = $("#mClockTime");
  const mClockDate = $("#mClockDate");

  const mobileMenuBtn = $(".dock-btn--menu");
  const dockButtons = $$("[data-view]");

  const DATA_FALLBACK = {
    nav: [
      { label: "Home", icon: "🏠", view: "nav:Home" },
      { label: "Writeups", icon: "🧪", view: "nav:Writeups" },
      { label: "Notes", icon: "🧠", view: "nav:Notes" },
      { label: "Blog", icon: "📝", view: "nav:Blog" },
      { label: "Projects", icon: "🛠️", view: "nav:Projects" },
      { label: "Resume", icon: "📄", view: "nav:Resume" },
      { label: "Contact", icon: "✉️", href: "./contact.html" }
    ],
    categories: [
      { label: "HTB", icon: "🧱", count: 0, view: "cat:HTB" },
      { label: "THM", icon: "🧩", count: 0, view: "cat:THM" },
      { label: "Proving Grounds", icon: "🏟️", count: 0, view: "cat:PG" }
    ],
    tags: [
      { label: "AD", icon: "🧬", count: 0, view: "tag:AD" },
      { label: "Privesc", icon: "🪜", count: 0, view: "tag:Privesc" },
      { label: "Web", icon: "🕸️", count: 0, view: "tag:Web" }
    ],
    cards: {
      "nav:Home": [
        { title: "Welcome", meta: "Home", desc: "Desktop-style launcher for your writeups.", href: "#home" }
      ],
      "nav:Writeups": [
        { title: "Hack The Box (HTB)", meta: "Writeups", desc: "Machines & challenges with clear attack chains.", href: "#writeups" }
      ],
      "nav:Notes": [
        { title: "Notes Index", meta: "Notes", desc: "Concept notes and reusable techniques.", href: "#notes" }
      ]
    }
  };

  let DATA_SRC = DATA_FALLBACK;
  try {
    if (typeof window.DATA === "object" && window.DATA) DATA_SRC = window.DATA;
  } catch (_) {}

  function isMenuOpen() {
    return !!startMenu?.classList.contains("open");
  }

  function setMenuOpen(open) {
    if (!startMenu) return;

    startMenu.classList.toggle("open", !!open);
    startMenu.setAttribute("aria-hidden", open ? "false" : "true");
    if (startBtn) startBtn.setAttribute("aria-expanded", open ? "true" : "false");

    overlay?.classList.toggle("open", !!open);
    overlay?.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
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

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderList(ul, items) {
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = it.href || "#";
      if (it.view) a.dataset.view = it.view;

      a.innerHTML =
        `<span aria-hidden="true">${it.icon || "•"}</span>` +
        `<span>${it.label}</span>` +
        (typeof it.count === "number" ? `<span class="badge">${it.count}</span>` : "");

      li.appendChild(a);
      ul.appendChild(li);
    });
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

  // Init lists
  renderList(navList, DATA_SRC.nav || []);
  renderList(catList, DATA_SRC.categories || []);
  renderList(tagList, DATA_SRC.tags || []);

  function bindStartToggle(el) {
    if (!el) return;
    el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    }, { passive: false });
  }
  bindStartToggle(startBtn);
  bindStartToggle(mobileMenuBtn);

  overlay?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
  });

  dockButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const view = btn.dataset.view;
      if (!view) return;

      if (view === "nav:Contact") {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "./contact.html";
        return;
      }

      if (view === "menu:open") {
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

  startMenu?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    const view = a.dataset.view;
    if (!view) return;

    if (view === "nav:Contact") {
      e.preventDefault();
      window.location.href = "./contact.html";
      return;
    }

    e.preventDefault();
    openView(view);
  });

  document.addEventListener("click", (e) => {
    if (!isMenuOpen()) return;

    const t = e.target;
    const inside =
      (startMenu && startMenu.contains(t)) ||
      (startBtn && startBtn.contains(t)) ||
      (mobileMenuBtn && mobileMenuBtn.contains(t)) ||
      (overlay && overlay.contains(t));

    if (!inside) setMenuOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  menuSearch?.addEventListener("input", (e) => {
    applyFilter(e.target.value);
  });

  $("#winTitlebar")?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      ensureWindowVisible(false);
    }
  });

  // Clock (PC + Mobile)
  function pad2(n){ return String(n).padStart(2, "0"); }

  function tickClock() {
    const d = new Date();
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    const timeStr = `${hh}:${mm}:${ss}`;

    const y = d.getFullYear();
    const mo = pad2(d.getMonth()+1);
    const da = pad2(d.getDate());
    const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    const dateStr = `${y}-${mo}-${da} (${wd})`;

    if (clockTime) clockTime.textContent = timeStr;
    if (clockDate) clockDate.textContent = dateStr;

    if (mClockTime) mClockTime.textContent = timeStr;
    if (mClockDate) mClockDate.textContent = dateStr;
  }

  tickClock();
  setInterval(tickClock, 1000);
})();
