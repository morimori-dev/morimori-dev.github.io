(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const startBtn = $("#startBtn");              // PC start
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

  const clockTime = $("#clockTime");
  const clockDate = $("#clockDate");

  const mobileMenuBtn = $(".dock-btn--menu");   // Mobile start
  const dockButtons = $$("[data-view]");        // All dock buttons (static)

  // ----------------------------
  // Fallback UI data
  // ----------------------------
  const DATA_FALLBACK = {
    nav: [
      { label: "Home", icon: "🖥️", view: "nav:Home" },
      { label: "Writeups", icon: "🌐", view: "nav:Writeups" },
      { label: "Notes", icon: "🧠", view: "nav:Notes" },
      { label: "Blog", icon: "📝", view: "nav:Blog" },
      { label: "Projects", icon: "🛠️", view: "nav:Projects" },
      { label: "Resume", icon: "📄", view: "nav:Resume" },
      { label: "Contact", icon: "👤", href: "./contact.html" }
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
        { title: "Welcome", meta: "Home", desc: "Desktop-style launcher for your writeups.", view: "nav:Writeups" }
      ],

      // ✅ ここが「経路」：Writeups → (HTB/THM/PG/All) → 一覧 → 詳細
      "nav:Writeups": [
        { title: "All Writeups", meta: "Index", desc: "Everything in one place.", view: "list:All" },
        { title: "Hack The Box (HTB)", meta: "Writeups", desc: "Machines & challenges with clear attack chains.", view: "cat:HTB" },
        { title: "TryHackMe (THM)", meta: "Writeups", desc: "Learning-path style writeups.", view: "cat:THM" },
        { title: "Proving Grounds (PG)", meta: "Writeups", desc: "OffSec Proving Grounds practice.", view: "cat:PG" }
      ],

      "nav:Notes": [
        { title: "Notes Index", meta: "Notes", desc: "Concept notes and reusable techniques.", href: "#notes" }
      ]
    }
  };

  // window.DATA があればそれを優先
  let DATA_SRC = DATA_FALLBACK;
  try {
    if (typeof window.DATA === "object" && window.DATA) DATA_SRC = window.DATA;
  } catch (_) {}

  // ----------------------------
  // Menu open/close
  // ----------------------------
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
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ----------------------------
  // ✅ Writeups data loader
  // ----------------------------
  function getWriteupsRaw() {
    try {
      if (Array.isArray(window.WRITEUPS)) return window.WRITEUPS;
      if (Array.isArray(window.DATA?.writeups)) return window.DATA.writeups;
      if (Array.isArray(window.DB?.writeups)) return window.DB.writeups;
    } catch (_) {}
    return [];
  }

  function slugify(w) {
    if (w?.slug) return String(w.slug);
    const t = String(w?.title ?? "writeup").trim().toLowerCase();
    const s = t
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    return s || "writeup";
  }

  function normalizeCategory(w) {
    const c = String(w?.category ?? w?.platform ?? w?.collection ?? "").toUpperCase();
    if (c.includes("HTB") || c.includes("HACKTHEBOX")) return "HTB";
    if (c.includes("THM") || c.includes("TRYHACKME")) return "THM";
    if (c === "PG" || c.includes("PROVING")) return "PG";
    return w?.category ? String(w.category) : "Other";
  }

  const WRITEUPS = getWriteupsRaw().map((w) => {
    const slug = slugify(w);
    const category = normalizeCategory(w);
    const tags = Array.isArray(w?.tags) ? w.tags.map(String) : [];
    return { ...w, slug, category, tags };
  });

  // category/tag counts
  function countByCategory(items) {
    const m = new Map();
    items.forEach((w) => m.set(w.category, (m.get(w.category) || 0) + 1));
    return m;
  }
  function countByTag(items) {
    const m = new Map();
    items.forEach((w) => {
      (w.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + 1));
    });
    return m;
  }

  const CAT_COUNTS = countByCategory(WRITEUPS);
  const TAG_COUNTS = countByTag(WRITEUPS);

  // ----------------------------
  // Render menu lists
  // ----------------------------
  function renderList(ul, items) {
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = it.href || "#";

      if (it.view) {
        a.dataset.view = it.view;
      }

      a.innerHTML =
        `<span aria-hidden="true">${it.icon || "•"}</span>` +
        `<span>${escapeHtml(it.label)}</span>` +
        (typeof it.count === "number" ? `<span class="badge">${it.count}</span>` : "");

      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  // categories: DATA_SRC優先しつつ、countだけ補強
  const categoriesMenu = (DATA_SRC.categories || DATA_FALLBACK.categories).map((c) => {
    const key = String(c.label || "").toUpperCase();
    let count = 0;
    if (key.includes("HTB")) count = CAT_COUNTS.get("HTB") || 0;
    else if (key.includes("THM")) count = CAT_COUNTS.get("THM") || 0;
    else if (key.includes("PG") || key.includes("PROVING")) count = CAT_COUNTS.get("PG") || 0;
    else count = CAT_COUNTS.get(c.label) || 0;
    return { ...c, count };
  });

  // tags: DATA_SRC.tags が無い/少ないなら上位タグを自動生成
  let tagsMenu = DATA_SRC.tags || DATA_FALLBACK.tags;
  if (!Array.isArray(DATA_SRC.tags) || DATA_SRC.tags.length < 5) {
    const topTags = Array.from(TAG_COUNTS.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([label, count]) => ({ label, icon: "🏷️", count, view: `tag:${label}` }));

    tagsMenu = topTags.length ? topTags : DATA_FALLBACK.tags;
  } else {
    tagsMenu = tagsMenu.map((t) => ({ ...t, count: TAG_COUNTS.get(t.label) || 0 }));
  }

  renderList(navList, DATA_SRC.nav || DATA_FALLBACK.nav);
  renderList(catList, categoriesMenu);
  renderList(tagList, tagsMenu);

  // ----------------------------
  // Render cards (generic)
  // ----------------------------
  function renderCardsFromArray(viewKey, cards) {
    if (!contentArea) return;

    contentArea.innerHTML = "";
    if (!cards || !cards.length) {
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

      // ✅ data-view があれば内部遷移、href があれば通常リンク
      let link = "";
      if (c.view) {
        link = `<div style="margin-top:10px;"><a href="#" data-view="${escapeHtml(c.view)}">Open</a></div>`;
      } else if (c.href) {
        link = `<div style="margin-top:10px;"><a href="${escapeHtml(c.href)}">Open</a></div>`;
      }

      div.innerHTML = `${meta}${title}${desc}${link}`;
      contentArea.appendChild(div);
    });
  }

  // ----------------------------
  // ✅ Writeups: list/detail views
  // ----------------------------
  function makeWriteupCards(items) {
    return items.map((w) => {
      const metaParts = [];
      if (w.category) metaParts.push(w.category);
      if (w.difficulty) metaParts.push(String(w.difficulty));
      if (w.date) metaParts.push(String(w.date));
      const meta = metaParts.join(" / ") || "Writeup";

      const desc =
        w.desc || w.description ||
        (Array.isArray(w.tags) && w.tags.length ? `Tags: ${w.tags.join(", ")}` : "");

      return {
        title: w.title || w.slug,
        meta,
        desc,
        view: `writeup:${w.slug}`
      };
    });
  }

  function renderWriteupList(kindLabel, items) {
    if (winTitle) winTitle.textContent = kindLabel;
    if (winSub) winSub.textContent = `${items.length} items`;
    ensureWindowVisible(true);

    if (!items.length) {
      renderCardsFromArray(kindLabel, []);
      return;
    }

    // 先頭に「戻る」カードも置く
    const cards = [
      { title: "← Back to Writeups", meta: "Navigation", desc: "Return to collections.", view: "nav:Writeups" },
      ...makeWriteupCards(items)
    ];
    renderCardsFromArray(kindLabel, cards);
  }

  function renderWriteupDetail(slug) {
    const w = WRITEUPS.find((x) => x.slug === slug);

    ensureWindowVisible(true);

    if (!w) {
      if (winTitle) winTitle.textContent = "Writeup";
      if (winSub) winSub.textContent = "Not found";
      contentArea.innerHTML =
        `<div class="card"><div class="meta">writeup:${escapeHtml(slug)}</div>` +
        `<div style="margin-top:8px;">Not found.</div>` +
        `<div style="margin-top:10px;"><a href="#" data-view="nav:Writeups">← Back</a></div>` +
        `</div>`;
      return;
    }

    if (winTitle) winTitle.textContent = w.title || w.slug;
    if (winSub) winSub.textContent = "Loaded.";

    const url = w.url || w.link || w.href;
    const body =
      w.content ?? w.body ?? w.markdown ?? w.md ?? w.text ?? "";

    const tags = Array.isArray(w.tags) && w.tags.length
      ? `<div style="margin-top:8px;opacity:.9;">Tags: ${escapeHtml(w.tags.join(", "))}</div>`
      : "";

    const metaParts = [];
    if (w.category) metaParts.push(w.category);
    if (w.difficulty) metaParts.push(String(w.difficulty));
    if (w.date) metaParts.push(String(w.date));
    const meta = metaParts.join(" / ") || "Writeup";

    contentArea.innerHTML = `
      <div class="card">
        <div class="meta">${escapeHtml(meta)}</div>
        <div style="font-weight:900;margin-top:6px;">${escapeHtml(w.title || w.slug)}</div>
        ${w.desc || w.description ? `<div style="margin-top:8px;opacity:.9;">${escapeHtml(w.desc || w.description)}</div>` : ""}
        ${tags}
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="#" data-view="nav:Writeups">← Back</a>
          ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Open link ↗</a>` : ""}
        </div>
      </div>

      ${String(body).trim()
        ? `<div class="card" style="margin-top:12px;">
             <div class="meta">Content</div>
             <pre style="white-space:pre-wrap;word-break:break-word;margin-top:8px;">${escapeHtml(body)}</pre>
           </div>`
        : `<div class="card" style="margin-top:12px;">
             <div class="meta">Content</div>
             <div style="margin-top:8px;opacity:.85;">本文が未設定です（writeupに <code>content</code> または <code>url</code> を入れると表示できます）</div>
           </div>`
      }
    `;
  }

  // ----------------------------
  // View renderer
  // ----------------------------
  function renderView(viewKey) {
    // ✅ Special views
    if (viewKey === "list:All") {
      renderWriteupList("All Writeups", WRITEUPS);
      return;
    }

    if (viewKey.startsWith("cat:")) {
      const cat = viewKey.slice("cat:".length);
      const items = WRITEUPS.filter((w) => String(w.category).toUpperCase() === String(cat).toUpperCase());
      renderWriteupList(`Category: ${cat}`, items);
      return;
    }

    if (viewKey.startsWith("tag:")) {
      const tag = viewKey.slice("tag:".length);
      const items = WRITEUPS.filter((w) => (w.tags || []).some((t) => String(t) === String(tag)));
      renderWriteupList(`Tag: ${tag}`, items);
      return;
    }

    if (viewKey.startsWith("writeup:")) {
      const slug = viewKey.slice("writeup:".length);
      renderWriteupDetail(slug);
      return;
    }

    // ✅ Default: cards from DATA_SRC
    const label = viewKey.split(":")[1] || viewKey;
    if (winTitle) winTitle.textContent = label;
    if (winSub) winSub.textContent = "Loaded.";
    ensureWindowVisible(true);

    const cards = (DATA_SRC.cards && DATA_SRC.cards[viewKey]) ? DATA_SRC.cards[viewKey] : [];
    renderCardsFromArray(viewKey, cards);
  }

  function openView(viewKey) {
    renderView(viewKey);
  }

  // ----------------------------
  // ✅ 重要：ウィンドウ内の data-view を動かす（今まで無かった＝経路が無い原因）
  // ----------------------------
  contentArea?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    const view = a.dataset.view;
    if (!view) return;
    e.preventDefault();
    e.stopPropagation();
    openView(view);
  });

  // ----------------------------
  // Init event binds
  // ----------------------------
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

  // Dock buttons open views (static elements only)
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const view = btn.dataset.view;
      if (!view) return;

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

  // Menu item click
  startMenu?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    const view = a.dataset.view;
    if (!view) return;

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
    const q = (e.target.value || "").trim().toLowerCase();
    const anchors = $$("a[data-view]", startMenu);
    anchors.forEach((a) => {
      const t = (a.textContent || "").toLowerCase();
      const ok = !q || t.includes(q);
      a.parentElement.style.display = ok ? "" : "none";
    });
  });

  $("#winTitlebar")?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      ensureWindowVisible(false);
    }
  });

  // Clock
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
