window.SITE_DATA = {
  nav: [
    { title: "Home",     icon: "🏠", href: "#home" },
    { title: "Writeups", icon: "🧪", href: "#writeups" },
    { title: "Notes",    icon: "🧠", href: "#notes" },
    { title: "Blog",     icon: "📝", href: "#nav/blog" },
    { title: "Projects", icon: "🛠️", href: "#nav/projects" },
    { title: "Resume",   icon: "📄", href: "#nav/resume" },
    { title: "About",    icon: "👋", href: "#nav/about" },
    { title: "Contact",  icon: "✉️", href: "#nav/contact" },
  ],

  // “Collections” = menuのカテゴリ枠（Writeup棚 + Notes棚 + Blog棚）
  collections: [
    { name: "HTB",            icon: "🧱", count: 0 },
    { name: "THM",            icon: "🧩", count: 0 },
    { name: "Proving Grounds",icon: "🏋️", count: 0 },
    { name: "Attack Chains",  icon: "⛓️", count: 0 },
    { name: "Active Directory",icon:"🧬", count: 0 },

    { name: "Cheatsheets",    icon: "📌", count: 0 },
    { name: "Methodology",    icon: "🧭", count: 0 },
    { name: "Tooling",        icon: "🛠️", count: 0 },

    { name: "Deep Dives",     icon: "🔬", count: 0 },
    { name: "Postmortems",    icon: "🧾", count: 0 },
  ],

  tags: [
    { name: "Enumeration", count: 0 },
    { name: "Web", count: 0 },
    { name: "Active Directory", count: 0 },
    { name: "Kerberos", count: 0 },
    { name: "PrivEsc", count: 0 },
    { name: "Pivoting", count: 0 },
    { name: "Windows", count: 0 },
    { name: "Linux", count: 0 },
  ],

  // サンプル（ここをObsidianから自動生成して差し替える想定）
  posts: [
    {
      title: "Sample: HTB Machine — Web foothold → creds reuse → root",
      href: "./writeups/htb/sample-htb.html",
      date: "2026-02-01",
      section: "Writeups",
      collection: "HTB",
      tags: ["Enumeration", "Web", "PrivEsc", "Linux"]
    },
    {
      title: "Sample: THM Room — Initial access → privilege escalation",
      href: "./writeups/thm/sample-thm.html",
      date: "2026-02-01",
      section: "Writeups",
      collection: "THM",
      tags: ["Enumeration", "Windows", "PrivEsc"]
    },
    {
      title: "Sample: Attack Chain — Web → pivot → internal service",
      href: "./writeups/chains/sample-chain.html",
      date: "2026-02-01",
      section: "Writeups",
      collection: "Attack Chains",
      tags: ["Web", "Pivoting", "Enumeration"]
    },
    {
      title: "Sample: AD Notes — Kerberos quick reference",
      href: "./notes/ad/kerberos.html",
      date: "2026-02-01",
      section: "Notes",
      collection: "Cheatsheets",
      tags: ["Active Directory", "Kerberos"]
    },
    {
      title: "Sample: Tooling — ligolo-ng basic playbook",
      href: "./notes/tooling/ligolo.html",
      date: "2026-02-01",
      section: "Notes",
      collection: "Tooling",
      tags: ["Pivoting"]
    },
    {
      title: "Sample: Deep Dive — Why enumeration wins",
      href: "./blog/deep-dives/enumeration.html",
      date: "2026-02-01",
      section: "Blog",
      collection: "Deep Dives",
      tags: ["Enumeration"]
    },
    {
      title: "Sample: Project — This desktop-themed portfolio",
      href: "./projects/site.html",
      date: "2026-02-01",
      section: "Projects",
      collection: "Tooling",
      tags: ["Tooling"]
    }
  ]
};

// counts を自動計算（posts差し替えたら勝手に反映）
(() => {
  const d = window.SITE_DATA;
  const collCount = new Map();
  const tagCount = new Map();

  for(const p of d.posts){
    collCount.set(p.collection, (collCount.get(p.collection) || 0) + 1);
    for(const t of p.tags) tagCount.set(t, (tagCount.get(t) || 0) + 1);
  }

  d.collections = d.collections.map(c => ({...c, count: collCount.get(c.name) || 0}));
  d.tags = d.tags.map(t => ({...t, count: tagCount.get(t.name) || 0}));
})();
