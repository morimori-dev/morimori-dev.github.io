---
title: "THM - Relevant"
date: 2025-01-12 10:00:00 +0900
categories: [TryHackMe]
tags: [Windows, Medium, SMB, SeImpersonatePrivilege]
description: "TryHackMe 'Relevant' - SMB misconfiguration to shell, privesc via PrintSpoofer."
image:
  path: /assets/img/tryhackme/relevant-banner.png
  alt: "Relevant room banner"
---

## Overview

| Property       | Value     |
| :------------- | :-------- |
| **Platform**   | TryHackMe |
| **OS**         | Windows   |
| **Difficulty** | Medium    |
| **IP**         | 10.10.x.x |

---

## Reconnaissance

### Nmap Scan

\```bash
nmap -sCV -p- -oN nmap/relevant.txt 10.10.x.x
\```

\```
# 結果
\```

### SMB Enumeration

\```bash
smbclient -L //10.10.x.x -N
\```

---

## Foothold

### Vulnerability Identification

(脆弱性の特定)

### Exploitation

\```bash
# エクスプロイト手順
\```

---

## Privilege Escalation

### Enumeration

\```powershell
whoami /priv
\```

### Exploitation

\```powershell
# 権限昇格手順
\```

---

## Flags

\```powershell
type C:\Users\Administrator\Desktop\root.txt
\```

---

## Lessons Learned

- (学び1)
- (学び2)