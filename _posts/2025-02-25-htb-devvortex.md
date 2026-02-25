---
title: "HTB - Devvortex"
date: 2025-02-25 10:00:00 +0900
categories: [Hack The Box]
tags: [Linux, Easy, Web Exploitation, Joomla, MySQL, Sudo Abuse]
description: "Hack The Box 'Devvortex' - Joomla CVE-2023-23752 info disclosure to RCE, privesc via apport-cli."
image:
  path: /assets/img/hackthebox/devvortex-banner.png
  alt: "Devvortex machine banner"
---

## Overview

| Property         | Value        |
| :--------------- | :----------- |
| **Platform**     | Hack The Box |
| **OS**           | Linux        |
| **Difficulty**   | Easy         |
| **IP**           | 10.10.11.242 |
| **Release Date** | 2023-11-25   |

Devvortex is an easy-rated Linux machine on Hack The Box. The attack path
involves discovering a Joomla CMS vulnerable to CVE-2023-23752 (information
disclosure), leveraging leaked credentials to gain admin access, achieving
RCE through a malicious Joomla template, lateral movement via MySQL
credential reuse, and finally privilege escalation through `apport-cli`.

---

## Reconnaissance

### Nmap Scan
```bash
nmap -sCV -p- --min-rate 1000 -oN nmap/devvortex.txt 10.10.11.242
```