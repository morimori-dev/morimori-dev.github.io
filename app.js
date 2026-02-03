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

  const mobileDock = $$(".mobile-dock .dock-btn");
  const menuBtn = $(".dock-btn--menu");

  // ----- Fallback data (used if data.js is missing) -----
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
      { label: "Web", icon: "🕸️", count: 0, view: "tag:Web" },
      { label: "Linux", icon: "🐧", count: 0, view: "tag:Linux" }
    ],
    cards: {
      "nav:Home": [
        { title: "Desktop", meta: "Home", desc: "Welcome. Pick a section from the left." }
      ],
      "nav:Writeups": [
        { title: "Writeups", meta: "Collection", desc: "Add items in data.js" }
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
    overlay?.classList.toggle("show", !!open);
    if (open) {
      menuSearch?.focus();
      menuSearch && (menuSearch.value = "");
      filterMenu("");
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    // for safe use inside HTML attributes
    return escapeHtml(s).replaceAll("`", "&#096;");
  }

  function escapeHtmlBr(s) {
    // escape + keep newlines
    return escapeHtml(s).replaceAll("\n", "<br>");
  }

  function renderList(root, items, kind = "nav") {
    if (!root) return;
    root.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      const btn = document.createElement(it.href ? "a" : "button");
      btn.className = "menu-item";
      if (it.href) {
        btn.href = it.href;
      } else {
        btn.type = "button";
        btn.dataset.view = it.view || "";
      }
      btn.dataset.kind = kind;

      btn.innerHTML = `
        <span class="mi-ico" aria-hidden="true">${escapeHtml(it.icon || "•")}</span>
        <span class="mi-label">${escapeHtml(it.label || "")}</span>
        ${typeof it.count === "number" ? `<span class="mi-count">${it.count}</span>` : ""}
      `;
      li.appendChild(btn);
      root.appendChild(li);
    });
  }

  function filterMenu(q) {
    const query = String(q || "").trim().toLowerCase();
    $$(".menu-item", startMenu).forEach((el) => {
      const label = el.querySelector(".mi-label")?.textContent?.toLowerCase() || "";
      el.style.display = label.includes(query) ? "" : "none";
    });
  }

  function setActiveDock(viewKey) {
    mobileDock.forEach((b) => {
      b.classList.toggle("active", b.dataset.view === viewKey);
    });
  }

  function openWindow() {
    win?.classList.add("open");
  }

  function closeWindow() {
    win?.classList.remove("open");
  }

  function setWindowTitle(title, sub = "") {
    if (winTitle) winTitle.textContent = title || "Window";
    if (winSub) winSub.textContent = sub || "";
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

      const meta = c.meta ? `<div class="meta">${escapeHtmlBr(c.meta)}</div>` : "";
      const title = `<div style="font-weight:900;margin-top:4px;">${escapeHtml(c.title || "Untitled")}</div>`;
      const desc = c.desc ? `<div style="margin-top:6px;opacity:.85;line-height:1.55;">${escapeHtmlBr(c.desc)}</div>` : "";

      let open = "";
      if (c.view) {
        open = `<div style="margin-top:10px;"><a href="#" data-view="${escapeAttr(c.view)}">Open</a></div>`;
      } else if (c.href) {
        open = `<div style="margin-top:10px;"><a href="${escapeAttr(c.href)}">Open</a></div>`;
      }

      div.innerHTML = `${meta}${title}${desc}${open}`;
      contentArea.appendChild(div);
    });
  }

  // If DATA.writeups exists, auto-build category/tag pages + counts
  function augmentFromWriteups(data) {
    if (!data || !Array.isArray(data.writeups)) return;

    const normalizePlatform = (p) => {
      const s = String(p || "").trim().toLowerCase();
      if (s === "htb" || s.includes("hack the box")) return "HTB";
      if (s === "thm" || s.includes("tryhackme")) return "THM";
      if (s === "pg" || s.includes("proving")) return "PG";
      return (p || "").toString();
    };

    const byCat = new Map(); // platform -> writeups[]
    const byTag = new Map(); // tag -> writeups[]

    data.writeups.forEach((w) => {
      if (!w) return;
      const platform = normalizePlatform(w.platform);
      w.platform = platform;

      const tags = Array.isArray(w.tags) ? w.tags : [];
      tags.forEach((t) => {
        const key = String(t || "").trim();
        if (!key) return;
        if (!byTag.has(key)) byTag.set(key, []);
        byTag.get(key).push(w);
      });

      if (!byCat.has(platform)) byCat.set(platform, []);
      byCat.get(platform).push(w);
    });

    // update counts
    if (Array.isArray(data.categories)) {
      data.categories = data.categories.map((c) => {
        const key = normalizePlatform(c.label);
        const list = byCat.get(key) || [];
        return { ...c, count: list.length };
      });
    }
    if (Array.isArray(data.tags)) {
      data.tags = data.tags.map((t) => {
        const key = String(t.label || "").trim();
        const list = byTag.get(key) || [];
        return { ...t, count: list.length };
      });
    }

    data.cards = data.cards || {};

    const toListCard = (w) => {
      const bits = [];
      if (w.platform) bits.push(w.platform);
      if (w.date) bits.push(w.date);
      if (w.difficulty) bits.push(w.difficulty);
      const meta = bits.join(" • ");

      return {
        title: w.title || "Untitled",
        meta,
        desc: w.summary || "",
        view: w.slug ? `post:${w.slug}` : undefined
      };
    };

    // nav:Writeups summary + latest
    const latest = [...data.writeups]
      .filter((w) => w && (w.date || w.title))
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 6);

    data.cards["nav:Writeups"] = [
      {
        title: "Collections",
        meta: "Writeups",
        desc: "HTB / THM / Proving Grounds — pick a collection on the left, or open a recent post below."
      },
      ...latest.map(toListCard)
    ];

    // category pages
    [["HTB", "cat:HTB"], ["THM", "cat:THM"], ["PG", "cat:PG"]].forEach(([key, view]) => {
      const list = (byCat.get(key) || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      data.cards[view] = list.length ? list.map(toListCard) : [
        { title: `${key} Collection`, meta: "Category", desc: "Add your writeups in data.js → window.DATA.writeups[]", href: "#writeups" }
      ];
    });

    // tag pages (only for tags you registered in data.tags)
    (data.tags || []).forEach((t) => {
      const key = String(t.label || "").trim();
      const view = t.view || `tag:${key}`;
      const list = (byTag.get(key) || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      if (!list.length) return;
      data.cards[view] = list.map(toListCard);
    });

    // post pages
    data.writeups.forEach((w) => {
      if (!w || !w.slug) return;
      const view = `post:${w.slug}`;

      const headerMeta = [
        w.platform || "",
        w.date || "",
        w.difficulty ? `Difficulty: ${w.difficulty}` : ""
      ].filter(Boolean).join(" • ");

      const cards = [
        { title: w.title || "Untitled", meta: headerMeta, desc: w.summary || "" }
      ];

      if (Array.isArray(w.sections)) {
        w.sections.forEach((sec, i) => {
          if (!sec) return;
          const st = sec.title || `Section ${i + 1}`;
          const body = sec.body || "";
          cards.push({
            title: st,
            meta: sec.meta || "",
            desc: body
          });
        });
      }

      // navigation helper
      cards.push({ title: "Back to list", meta: "Navigation", desc: "Return to the collection list.", view: `cat:${w.platform}` });

      data.cards[view] = cards;
    });
  }

  function openView(viewKey) {
    openWindow();
    setWindowTitle(viewKey, "Loaded.");
    renderCards(viewKey);
    setActiveDock(viewKey);
  }

  // ----- Events -----
  startBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  overlay?.addEventListener("click", () => setMenuOpen(false));

  menuSearch?.addEventListener("input", (e) => filterMenu(e.target.value));

  // Menu item click
  startMenu?.addEventListener("click", (e) => {
    const target = e.target.closest(".menu-item");
    if (!target) return;
    if (target.tagName.toLowerCase() === "a") {
      setMenuOpen(false);
      closeWindow();
      return;
    }
    const view = target.dataset.view;
    if (!view) return;
    e.preventDefault();
    setMenuOpen(false);
    openView(view);
  });

  // Click cards inside window (supports internal navigation via data-view)
  contentArea?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    const view = a.dataset.view;
    if (!view) return;
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    openView(view);
  });

  // Outside click closes menu
  document.addEventListener("click", (e) => {
    if (!isMenuOpen()) return;
    const inside = startMenu?.contains(e.target) || startBtn?.contains(e.target);
    if (!inside) setMenuOpen(false);
  });

  // Mobile dock
  mobileDock.forEach((b) => {
    b.addEventListener("click", () => {
      const view = b.dataset.view;
      if (view) openView(view);
    });
  });

  // Mobile "apps" button toggles start menu
  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  // Tap titlebar closes on mobile (as before)
  $("#winTitlebar")?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 980px)").matches) closeWindow();
  });

  // ===== Init =====
  renderList(navList, DATA_SRC.nav || [], "nav");
  renderList(catList, DATA_SRC.categories || [], "cat");
  renderList(tagList, DATA_SRC.tags || [], "tag");

  // Build dynamic pages from writeups (if provided)
  augmentFromWriteups(DATA_SRC);

  // Default view on mobile: Home
  if (window.matchMedia("(max-width: 980px)").matches) {
    openView("nav:Home");
  } else {
    closeWindow();
  }
})();
