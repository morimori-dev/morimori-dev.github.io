// data.js
// Site data model consumed by app.js
// Replace "YOUR_..." placeholders with your actual info.

window.DATA = {
  nav: [
    { label: "Home", icon: "🏠", view: "nav:Home" },
    { label: "Writeups", icon: "🧪", view: "nav:Writeups" },
    { label: "Notes", icon: "🧠", view: "nav:Notes" },
    { label: "Blog", icon: "📝", view: "nav:Blog" },
    { label: "Projects", icon: "🛠️", view: "nav:Projects" },
    { label: "Resume", icon: "📄", view: "nav:Resume" },
    { label: "Contact", icon: "✉️", view: "nav:Contact" }
  ],

  // "Writeup Collections"
  categories: [
    { label: "HTB", icon: "🧱", count: 0, view: "cat:HTB" },
    { label: "THM", icon: "🧩", count: 0, view: "cat:THM" },
    { label: "Proving Grounds", icon: "🏟️", count: 0, view: "cat:PG" }
  ],

  // Tags (examples)
  tags: [
    { label: "AD", icon: "🧬", count: 0, view: "tag:AD" },
    { label: "Privesc", icon: "🪜", count: 0, view: "tag:Privesc" },
    { label: "Web", icon: "🕸️", count: 0, view: "tag:Web" },
    { label: "Linux", icon: "🐧", count: 0, view: "tag:Linux" },
    { label: "Windows", icon: "🪟", count: 0, view: "tag:Windows" }
  ],

  // Cards displayed in the right window
  cards: {
    "nav:Home": [
      {
        title: "Welcome",
        meta: "Home",
        desc: "Desktop-style launcher for my security writeups and notes.",
        href: "#home"
      },
      {
        title: "Quick Start",
        meta: "How to use",
        desc: "Open the Start menu, pick a collection (HTB/THM/PG), then filter by tags.",
        href: "#"
      }
    ],

    "nav:Writeups": [
      {
        title: "Hack The Box (HTB)",
        meta: "Writeups",
        desc: "Machines & challenges with clear attack chains and reproducible steps.",
        href: "#writeups"
      },
      {
        title: "TryHackMe (THM)",
        meta: "Writeups",
        desc: "Learning paths & rooms (structured notes + exploitation).",
        href: "#writeups"
      },
      {
        title: "Proving Grounds (PG)",
        meta: "Writeups",
        desc: "OffSec-style practice aligned with real pentest workflows.",
        href: "#writeups"
      },
      {
        title: "Methodology",
        meta: "Writeups",
        desc: "Enumeration → foothold → privesc → lateral movement (repeatable patterns).",
        href: "#writeups"
      }
    ],

    "nav:Notes": [
      {
        title: "Notes Index",
        meta: "Notes",
        desc: "Concept notes and reusable techniques (checklists, commands, pitfalls).",
        href: "#notes"
      }
    ],

    "nav:Blog": [
      {
        title: "Blog",
        meta: "WIP",
        desc: "Short posts about lessons learned, tooling, and security thinking.",
        href: "#"
      }
    ],

    "nav:Projects": [
      {
        title: "Projects",
        meta: "WIP",
        desc: "Tools, scripts, and small automation projects related to security workflows.",
        href: "#"
      }
    ],

    "nav:Resume": [
      {
        title: "Resume",
        meta: "WIP",
        desc: "A short overview of my experience, strengths, and focus areas.",
        href: "#"
      }
    ],

    // ✅ Contact page
    "nav:Contact": [
      {
        title: "GitHub",
        meta: "Writeups / Code",
        desc: "Repositories, tooling, and structured writeups (HTB / THM / PG).",
        href: "https://github.com/YOUR_GITHUB"
      },
      {
        title: "X (Twitter)",
        meta: "Security notes",
        desc: "Short updates, techniques, and learning logs.",
        href: "https://x.com/YOUR_X_HANDLE"
      },
      {
        title: "Email",
        meta: "Direct contact",
        desc: "For collaboration, interviews, or security work. Please include context + timeline.",
        href: "mailto:YOUR_EMAIL_HERE"
      },
      {
        title: "LinkedIn (optional)",
        meta: "Professional profile",
        desc: "Experience and recruiter contact (optional but strong for hiring flows).",
        href: "https://www.linkedin.com/in/YOUR_LINKEDIN"
      },
      {
        title: "PGP (optional)",
        meta: "Encrypted contact",
        desc: "For sensitive reports. Publish your fingerprint + public key link.",
        href: "https://keys.openpgp.org/search?q=YOUR_PGP_EMAIL_OR_FPR"
      }
    ],

    // Optional: category/tag views (placeholders)
    "cat:HTB": [
      { title: "HTB Collection", meta: "Category", desc: "Add your HTB machine writeups here.", href: "#writeups" }
    ],
    "cat:THM": [
      { title: "THM Collection", meta: "Category", desc: "Add your THM room writeups here.", href: "#writeups" }
    ],
    "cat:PG": [
      { title: "Proving Grounds Collection", meta: "Category", desc: "Add your PG practice writeups here.", href: "#writeups" }
    ],

    "tag:AD": [
      { title: "Active Directory", meta: "Tag", desc: "Kerberos, LDAP, AD CS, GPO, lateral movement, etc.", href: "#writeups" }
    ],
    "tag:Privesc": [
      { title: "Privilege Escalation", meta: "Tag", desc: "Linux/Windows privesc paths, misconfigs, creds, and exploitation.", href: "#writeups" }
    ],
    "tag:Web": [
      { title: "Web", meta: "Tag", desc: "Auth issues, injections, SSRF, deserialization, and more.", href: "#writeups" }
    ],
    "tag:Linux": [
      { title: "Linux", meta: "Tag", desc: "Enumeration, privesc, services, and misconfig patterns.", href: "#writeups" }
    ],
    "tag:Windows": [
      { title: "Windows", meta: "Tag", desc: "AD, services, token abuse, local privesc, and ops tips.", href: "#writeups" }
    ]
  }
};
