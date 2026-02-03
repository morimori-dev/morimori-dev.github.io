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

    // ✅ Contact は「ページ遷移」にする（data-view なし）
    { label: "Contact", icon: "✉️", href: "./contact.html" }
  ],

  // "Writeup Collections"
  categories: [
    { label: "HTB", icon: "🧱", count: 3, view: "cat:HTB" },
    { label: "THM", icon: "🧩", count: 3, view: "cat:THM" },
    { label: "Proving Grounds", icon: "🏟️", count: 3, view: "cat:PG" }
  ],

  // Tags (examples)
  tags: [
    { label: "AD", icon: "🧬", count: 3, view: "tag:AD" },
    { label: "Privesc", icon: "🪜", count: 3, view: "tag:Privesc" },
    { label: "Web", icon: "🕸️", count: 3, view: "tag:Web" },
    { label: "Linux", icon: "🐧", count: 3, view: "tag:Linux" },
    { label: "Windows", icon: "🪟", count: 3, view: "tag:Windows" }
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

    // Category views with sample writeups
    "cat:HTB": [
      { 
        title: "Gaara", 
        meta: "HTB • Medium • Linux", 
        desc: "Web exploitation via Gogs vulnerability (CVE-2020-14144) leading to RCE. Privilege escalation through tar wildcard injection in cron job.", 
        href: "#writeups/htb-gaara" 
      },
      { 
        title: "Acute", 
        meta: "HTB • Hard • Windows", 
        desc: "Active Directory environment exploitation. LAPS password retrieval, credential dumping, and Hyper-V VM escape for Domain Admin access.", 
        href: "#writeups/htb-acute" 
      },
      { 
        title: "APT", 
        meta: "HTB • Insane • Windows", 
        desc: "Advanced persistent threat scenario. Registry hive analysis, IPv6 exploitation, and complex AD enumeration with Kerberos delegation abuse.", 
        href: "#writeups/htb-apt" 
      }
    ],
    "cat:THM": [
      { 
        title: "Year of the Rabbit", 
        meta: "THM • Easy • Linux", 
        desc: "CTF-style room featuring web enumeration, FTP exploitation, and sudo privilege escalation via CVE-2019-14287.", 
        href: "#writeups/thm-year-rabbit" 
      },
      { 
        title: "Wreath Network", 
        meta: "THM • Medium • Mixed", 
        desc: "Multi-machine network pivoting exercise. GitStack exploitation, AV evasion techniques, and persistence mechanisms across Windows and Linux targets.", 
        href: "#writeups/thm-wreath" 
      },
      { 
        title: "AD Certificate Templates", 
        meta: "THM • Hard • Windows", 
        desc: "Active Directory Certificate Services exploitation. ESC1 and ESC8 attack paths, certificate enrollment abuse, and domain privilege escalation.", 
        href: "#writeups/thm-adcs" 
      }
    ],
    "cat:PG": [
      { 
        title: "FunBoxEasyEnum", 
        meta: "PG • Easy • Linux", 
        desc: "Enumeration-focused box. WordPress exploitation, password cracking, and SUID binary abuse (pkexec) for root access.", 
        href: "#writeups/pg-funboxeasy" 
      },
      { 
        title: "Fantastic", 
        meta: "PG • Medium • Linux", 
        desc: "Web application security testing. SQL injection leading to credential disclosure, followed by Docker container escape for privilege escalation.", 
        href: "#writeups/pg-fantastic" 
      },
      { 
        title: "Exfiltrated", 
        meta: "PG • Hard • Windows", 
        desc: "Forensics and exploitation combined. PCAP analysis revealing Subrion CMS credentials, followed by DLL hijacking and SeImpersonate exploitation.", 
        href: "#writeups/pg-exfiltrated" 
      }
    ],

    "tag:AD": [
      { 
        title: "Acute - Hyper-V Escape", 
        meta: "HTB • Hard", 
        desc: "Active Directory exploitation focusing on LAPS password retrieval, Hyper-V VM escape, and domain controller compromise.", 
        href: "#writeups/htb-acute" 
      },
      { 
        title: "APT - Kerberos Delegation", 
        meta: "HTB • Insane", 
        desc: "Advanced AD attack chain utilizing registry hive analysis, IPv6 exploitation, and unconstrained Kerberos delegation abuse.", 
        href: "#writeups/htb-apt" 
      },
      { 
        title: "AD Certificate Services", 
        meta: "THM • Hard", 
        desc: "ADCS exploitation demonstrating ESC1 and ESC8 attack paths for certificate-based privilege escalation to Domain Admin.", 
        href: "#writeups/thm-adcs" 
      }
    ],
    "tag:Privesc": [
      { 
        title: "Gaara - Tar Wildcard Injection", 
        meta: "HTB • Medium", 
        desc: "Linux privilege escalation via cron job exploitation using tar wildcard injection technique.", 
        href: "#writeups/htb-gaara" 
      },
      { 
        title: "FunBoxEasyEnum - SUID Binary", 
        meta: "PG • Easy", 
        desc: "Classic SUID binary abuse scenario exploiting pkexec misconfiguration for root access.", 
        href: "#writeups/pg-funboxeasy" 
      },
      { 
        title: "Fantastic - Container Escape", 
        meta: "PG • Medium", 
        desc: "Docker container breakout techniques for privilege escalation from containerized web application.", 
        href: "#writeups/pg-fantastic" 
      }
    ],
    "tag:Web": [
      { 
        title: "Gaara - Gogs RCE", 
        meta: "HTB • Medium", 
        desc: "Exploiting Gogs Git service vulnerability (CVE-2020-14144) to achieve remote code execution.", 
        href: "#writeups/htb-gaara" 
      },
      { 
        title: "Fantastic - SQL Injection", 
        meta: "PG • Medium", 
        desc: "Authentication bypass and credential disclosure through SQL injection in custom web application.", 
        href: "#writeups/pg-fantastic" 
      },
      { 
        title: "Wreath - GitStack Exploit", 
        meta: "THM • Medium", 
        desc: "Leveraging GitStack vulnerability for initial foothold in multi-machine network environment.", 
        href: "#writeups/thm-wreath" 
      }
    ],
    "tag:Linux": [
      { 
        title: "Gaara", 
        meta: "HTB • Medium", 
        desc: "Complete Linux attack chain: web exploitation, reverse shell establishment, and tar wildcard privesc.", 
        href: "#writeups/htb-gaara" 
      },
      { 
        title: "Year of the Rabbit", 
        meta: "THM • Easy", 
        desc: "CTF-style Linux enumeration focusing on FTP, web directories, and sudo privilege escalation.", 
        href: "#writeups/thm-year-rabbit" 
      },
      { 
        title: "FunBoxEasyEnum", 
        meta: "PG • Easy", 
        desc: "Enumeration-heavy Linux box demonstrating WordPress exploitation and SUID binary abuse.", 
        href: "#writeups/pg-funboxeasy" 
      }
    ],
    "tag:Windows": [
      { 
        title: "Acute", 
        meta: "HTB • Hard", 
        desc: "Windows Active Directory environment with LAPS, credential dumping, and Hyper-V exploitation.", 
        href: "#writeups/htb-acute" 
      },
      { 
        title: "APT", 
        meta: "HTB • Insane", 
        desc: "Advanced Windows persistence scenario involving registry forensics and Kerberos attacks.", 
        href: "#writeups/htb-apt" 
      },
      { 
        title: "Exfiltrated", 
        meta: "PG • Hard", 
        desc: "Windows exploitation chain from PCAP analysis through DLL hijacking to SeImpersonate abuse.", 
        href: "#writeups/pg-exfiltrated" 
      }
    ]
  }
};