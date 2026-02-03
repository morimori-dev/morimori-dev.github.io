/* data.js
   ==========================
   Add new writeups by appending to window.DATA.writeups[]
   (The UI will auto-build category/tag pages + counts.)
*/

window.DATA = {
  nav: [
    { label: "Home", icon: "🏠", view: "nav:Home" },
    { label: "Writeups", icon: "🧪", view: "nav:Writeups" },
    { label: "Notes", icon: "🧠", view: "nav:Notes" },
    { label: "Blog", icon: "📝", view: "nav:Blog" },
    { label: "Projects", icon: "🛠️", view: "nav:Projects" },
    { label: "Resume", icon: "📄", view: "nav:Resume" },
    { label: "Contact", icon: "👤", href: "./contact.html" }
  ],

  categories: [
    { label: "HTB", icon: "🧱", count: 0, view: "cat:HTB" },
    { label: "THM", icon: "🧩", count: 0, view: "cat:THM" },
    { label: "PG", icon: "🏟️", count: 0, view: "cat:PG" }
  ],

  tags: [
    { label: "AD", icon: "🧬", count: 0, view: "tag:AD" },
    { label: "Privesc", icon: "🪜", count: 0, view: "tag:Privesc" },
    { label: "Web", icon: "🕸️", count: 0, view: "tag:Web" },
    { label: "Linux", icon: "🐧", count: 0, view: "tag:Linux" },
    { label: "Windows", icon: "🪟", count: 0, view: "tag:Windows" }
  ],

  // =========
  // WRITEUPS
  // =========
  // Fields:
  // - slug: unique id (used for internal page)
  // - platform: "HTB" | "THM" | "PG"
  // - title: shown in lists
  // - date: "YYYY/MM/DD" (sorts correctly)
  // - difficulty: free text
  // - tags: any of the tags above
  // - summary: short 1-2 lines
  // - sections: [{title, meta?, body}]  body supports newlines
  writeups: [
    {
      slug: "htb-sample-nebula",
      platform: "HTB",
      title: "HTB — Sample: Nebula (Linux) | foothold → privesc",
      date: "2026/02/03",
      difficulty: "Medium",
      tags: ["Linux", "Privesc", "Web"],
      summary:
        "A clean Linux chain: light web recon, credential reuse, then a simple misconfig privesc. (Sample post template)",
      sections: [
        {
          title: "TL;DR",
          body:
            "1) Web recon → endpoint leaks creds\n" +
            "2) SSH with reused creds\n" +
            "3) sudo misconfig → root"
        },
        {
          title: "Recon",
          meta: "nmap + web discovery",
          body:
            "nmap -sC -sV -oN nmap.txt $ip\n" +
            "gobuster dir -u http://$ip -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-small.txt"
        },
        {
          title: "Foothold",
          meta: "credentials",
          body:
            "Found creds in /api/debug endpoint (left enabled).\n" +
            "ssh user@$ip"
        },
        {
          title: "Privilege Escalation",
          meta: "sudo",
          body:
            "sudo -l\n" +
            "sudo /usr/bin/python3 -c 'import os; os.system(\"/bin/bash\")'"
        }
      ]
    },

    {
      slug: "thm-sample-arcade",
      platform: "THM",
      title: "THM — Sample: Arcade (Windows) | AD basics",
      date: "2026/02/02",
      difficulty: "Easy",
      tags: ["Windows", "AD"],
      summary:
        "A small Active Directory primer: enumerate, get a low-priv shell, then pivot to a domain user. (Sample)",
      sections: [
        {
          title: "Checklist",
          body:
            "- Confirm domain + DC\n" +
            "- Enumerate users/shares\n" +
            "- Try password spraying (carefully)\n" +
            "- Look for delegation/GPO/ACL mistakes"
        },
        {
          title: "Enumeration",
          meta: "SMB / LDAP",
          body:
            "nxc smb $ip -u users.txt -p 'Password123!' --continue-on-success\n" +
            "smbclient -L //$ip -N\n" +
            "ldapsearch -x -H ldap://$ip -s base"
        },
        {
          title: "Notes",
          meta: "things to log",
          body:
            "Write down: creds found, group memberships, interesting shares, and any errors that leak info."
        }
      ]
    },

    {
      slug: "pg-sample-harbor",
      platform: "PG",
      title: "PG — Sample: Harbor (Web) | upload → RCE",
      date: "2026/02/01",
      difficulty: "Medium",
      tags: ["Web", "Linux"],
      summary:
        "Classic web app chain: file upload bypass → command execution → stabilize shell. (Sample)",
      sections: [
        {
          title: "Attack chain",
          body:
            "1) Identify upload endpoint\n" +
            "2) Bypass content-type + extension checks\n" +
            "3) Trigger payload → get callback\n" +
            "4) Upgrade PTY"
        },
        {
          title: "Shell upgrade",
          meta: "pty",
          body:
            "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n" +
            "export TERM=xterm-256color\n" +
            "stty rows 40 cols 120"
        }
      ]
    }
  ],

  // Minimal fallback cards (writeups lists are generated from writeups[] in app.js)
  cards: {
    "nav:Home": [
      { title: "Welcome", meta: "Home", desc: "Desktop-style launcher for your writeups and notes." },
      { title: "Tip", meta: "Data-driven", desc: "Add posts in data.js → window.DATA.writeups[] and they appear automatically." }
    ],
    "nav:Notes": [
      { title: "Notes Index", meta: "Notes", desc: "Reusable techniques, commands, and mental models." }
    ],
    "nav:Blog": [
      { title: "Blog", meta: "Placeholder", desc: "Link this to your external blog when ready.", href: "https://genki-aioi.com" }
    ],
    "nav:Projects": [
      { title: "Projects", meta: "Placeholder", desc: "Add links to repos/tools here." }
    ],
    "nav:Resume": [
      { title: "Resume", meta: "Placeholder", desc: "Add a PDF link or a dedicated resume page later." }
    ]
  }
};
