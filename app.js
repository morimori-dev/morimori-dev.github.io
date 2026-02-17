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
      if (Array
