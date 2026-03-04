---
title: "HackTheBox - CozyHosting 解説 (Linux)"
date: 2026-02-27
description: "HackTheBox CozyHosting Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce]
mermaid: true
content_lang: ja
alt_en: /posts/htb-cozyhosting/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 80/tcp (http) |
| 主な侵入経路 | Web/service misconfiguration leading to code execution |
| 権限昇格経路 | Local misconfiguration and credential reuse for privilege escalation |

## 偵察

- rustscan
- nmap
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[19:52][CPU:15][MEM:46][TUN0:10.10.14.140][/home/n0z0]
🐉 > rustscan -a $ip -r 1-65535 --ulimit 5000
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: http://discord.skerritt.blog         :
: https://github.com/RustScan/RustScan :
 --------------------------------------
TreadStone was here 🚀

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.229.88:22
Open 10.129.229.88:80
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-13 19:53 JST
Initiating Ping Scan at 19:53
Scanning 10.129.229.88 [4 ports]
Completed Ping Scan at 19:53, 0.42s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 19:53
Completed Parallel DNS resolution of 1 host. at 19:53, 0.02s elapsed
DNS resolution of 1 IPs took 0.02s. Mode: Async [#: 4, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 19:53
Scanning 10.129.229.88 [2 ports]
Discovered open port 22/tcp on 10.129.229.88
Discovered open port 80/tcp on 10.129.229.88
Completed SYN Stealth Scan at 19:53, 0.56s elapsed (2 total ports)
Nmap scan report for 10.129.229.88
Host is up, received reset ttl 63 (0.43s latency).
Scanned at 2025-10-13 19:53:03 JST for 0s

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 1.08 seconds
           Raw packets sent: 6 (240B) | Rcvd: 3 (128B)
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[0:59][CPU:8][MEM:34][TUN0:][/home/n0z0]
🐉 > grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-14 01:08 JST
Warning: 10.129.229.88 giving up on port because retransmission cap hit (6).
Nmap scan report for cozyhosting.htb (10.129.229.88)
Host is up (0.32s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 43:56:bc:a7:f2:ec:46:dd:c1:0f:83:30:4c:2c:aa:a8 (ECDSA)
|_  256 6f:7a:6c:3f:a6:8d:e2:75:95:d4:7b:71:ac:4f:7e:42 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Cozy Hosting - Home
|_http-server-header: nginx/1.18.0 (Ubuntu)
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8080/tcp)
HOP RTT       ADDRESS
1   355.83 ms 10.10.14.1
2   355.89 ms cozyhosting.htb (10.129.229.88)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1138.02 seconds

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
dirsearch -u http://cozyhosting.htb/
```

```bash
✅[0:50][CPU:38][MEM:37][TUN0:][/home/n0z0]
🐉 > dirsearch -u http://cozyhosting.htb/
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/n0z0/reports/http_cozyhosting.htb/__25-10-14_01-48-24.txt

Target: http://cozyhosting.htb/

[01:48:24] Starting: 
[01:48:56] 200 -    0B  - /;admin/
[01:48:56] 200 -    0B  - /;/json
[01:48:56] 200 -    0B  - /;/login
[01:48:56] 200 -    0B  - /;/admin
[01:48:56] 200 -    0B  - /;json/
[01:48:56] 400 -  435B  - /\..\..\..\..\..\..\..\..\..\etc\passwd
[01:48:56] 200 -    0B  - /;login/
[01:48:59] 400 -  435B  - /a%5c.aspx
[01:49:02] 200 -    0B  - /actuator/;/env
[01:49:02] 200 -    0B  - /actuator/;/auditevents
[01:49:02] 200 -    0B  - /actuator/;/exportRegisteredServices
[01:49:02] 200 -    0B  - /actuator/;/flyway
[01:49:02] 200 -    0B  - /actuator/;/caches
[01:49:02] 200 -    0B  - /actuator/;/features
[01:49:02] 200 -    0B  - /actuator/;/events
[01:49:02] 200 -    0B  - /actuator/;/healthcheck
[01:49:02] 200 -    0B  - /actuator/;/conditions
[01:49:02] 200 -    0B  - /actuator/;/health
[01:49:02] 200 -    0B  - /actuator/;/dump
[01:49:02] 200 -    0B  - /actuator/;/beans
[01:49:02] 200 -    0B  - /actuator/;/auditLog
[01:49:02] 200 -    0B  - /actuator/;/configprops
[01:49:02] 200 -    0B  - /actuator/;/configurationMetadata
[01:49:02] 200 -  634B  - /actuator
[01:49:03] 200 -    0B  - /actuator/;/info
[01:49:03] 200 -    0B  - /actuator/;/integrationgraph
[01:49:03] 200 -    0B  - /actuator/;/jolokia
[01:49:03] 200 -    0B  - /actuator/;/mappings
[01:49:03] 200 -    0B  - /actuator/;/loggingConfig
[01:49:03] 200 -    0B  - /actuator/;/resolveAttributes
[01:49:03] 200 -    0B  - /actuator/;/sso
[01:49:03] 200 -    0B  - /actuator/;/sessions
[01:49:03] 200 -    0B  - /actuator/;/httptrace
[01:49:03] 200 -    0B  - /actuator/;/liquibase
[01:49:03] 200 -    0B  - /actuator/;/metrics
[01:49:03] 200 -    0B  - /actuator/;/registeredServices
[01:49:03] 200 -    0B  - /actuator/;/releaseAttributes
[01:49:03] 200 -    0B  - /actuator/;/springWebflow
[01:49:03] 200 -    0B  - /actuator/;/heapdump
[01:49:03] 200 -    0B  - /actuator/;/prometheus
[01:49:03] 200 -    0B  - /actuator/;/refresh
[01:49:03] 200 -    0B  - /actuator/;/loggers
[01:49:03] 200 -    0B  - /actuator/;/scheduledtasks
[01:49:03] 200 -    0B  - /actuator/;/logfile
[01:49:03] 200 -    0B  - /actuator/;/ssoSessions
[01:49:03] 200 -    0B  - /actuator/;/threaddump
[01:49:03] 200 -    0B  - /actuator/;/shutdown
[01:49:03] 200 -    0B  - /actuator/;/statistics
[01:49:03] 200 -    0B  - /actuator/;/status
[01:49:03] 200 -   15B  - /actuator/health
[01:49:03] 200 -    0B  - /actuator/;/trace
[01:49:03] 200 -   98B  - /actuator/sessions
[01:49:03] 200 -   10KB - /actuator/mappings
[01:49:04] 200 -    5KB - /actuator/env
[01:49:05] 401 -   97B  - /admin
[01:49:06] 200 -  124KB - /actuator/beans
[01:49:07] 200 -    0B  - /admin/%3bindex/
[01:49:11] 200 -    0B  - /admin;/
[01:49:11] 200 -    0B  - /Admin;/
[01:49:37] 200 -    0B  - /axis2-web//HappyAxis.jsp
[01:49:37] 200 -    0B  - /axis//happyaxis.jsp
[01:49:37] 200 -    0B  - /axis2//axis2-web/HappyAxis.jsp
[01:49:52] 200 -    0B  - /Citrix//AccessPlatform/auth/clientscripts/cookies.js
[01:50:08] 200 -    0B  - /engine/classes/swfupload//swfupload.swf
[01:50:11] 200 -    0B  - /engine/classes/swfupload//swfupload_f9.swf
[01:50:11] 500 -   73B  - /error
[01:50:13] 200 -    0B  - /examples/jsp/%252e%252e/%252e%252e/manager/html/
[01:50:14] 200 -    0B  - /extjs/resources//charts.swf
[01:50:23] 200 -    0B  - /html/js/misc/swfupload//swfupload.swf
[01:50:34] 200 -    0B  - /jkstatus;
[01:50:40] 200 -    4KB - /login
[01:50:40] 200 -    0B  - /login.wdm%2e
[01:50:42] 204 -    0B  - /logout

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/Programming-Language-Specific/Java-Spring-Boot.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip
```

```bash
❌[1:45][CPU:1][MEM:41][TUN0:10.10.14.140][/home/n0z0]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/Programming-Language-Specific/Java-Spring-Boot.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip 

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.12.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.229.88
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/seclists/Discovery/Web-Content/Programming-Language-Specific/Java-Spring-Boot.txt
 👌  Status Codes          │ [200, 301]
 💥  Timeout (secs)        │ 3
 🦡  User-Agent            │ feroxbuster/2.12.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💰  Collect Extensions    │ true
 💸  Ignored Extensions    │ [Images, Movies, Audio, etc...]
 🏁  HTTP methods          │ [GET]
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
200      GET      285l      745w    12706c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l       13w      487c http://cozyhosting.htb/actuator/env/lang
200      GET        1l        1w      634c http://cozyhosting.htb/actuator
200      GET        1l       13w      487c http://cozyhosting.htb/actuator/env/home
200      GET        1l      120w     4957c http://cozyhosting.htb/actuator/env
200      GET        1l       13w      487c http://cozyhosting.htb/actuator/env/path
200      GET        1l        1w       15c http://cozyhosting.htb/actuator/health
200      GET        1l        1w       98c http://cozyhosting.htb/actuator/sessions
200      GET       38l      135w     8621c http://cozyhosting.htb/assets/img/favicon.png
200      GET       34l      172w    14934c http://cozyhosting.htb/assets/img/pricing-starter.png
200      GET       29l      131w    11970c http://cozyhosting.htb/assets/img/pricing-free.png
200      GET       83l      453w    36234c http://cozyhosting.htb/assets/img/values-3.png
200      GET       38l      135w     8621c http://cozyhosting.htb/assets/img/logo.png
200      GET       43l      241w    19406c http://cozyhosting.htb/assets/img/pricing-business.png
200      GET       29l      174w    14774c http://cozyhosting.htb/assets/img/pricing-ultimate.png
200      GET       97l      196w     4431c http://cozyhosting.htb/login
200      GET        1l      542w   127224c http://cozyhosting.htb/actuator/beans
200      GET       79l      519w    40905c http://cozyhosting.htb/assets/img/values-2.png
200      GET       73l      470w    37464c http://cozyhosting.htb/assets/img/values-1.png
200      GET     2397l     4846w    42231c http://cozyhosting.htb/assets/css/style.css
200      GET       81l      517w    40968c http://cozyhosting.htb/assets/img/hero-img.png
200      GET        1l      218w    26053c http://cozyhosting.htb/assets/vendor/aos/aos.css
200      GET        1l      108w     9938c http://cozyhosting.htb/actuator/mappings
200      GET     2018l    10020w    95609c http://cozyhosting.htb/assets/vendor/bootstrap-icons/bootstrap-icons.css
200      GET        7l     2189w   194901c http://cozyhosting.htb/assets/vendor/bootstrap/css/bootstrap.min.css
[####################] - 8s       402/402     0s      found:22      errors:0      
[####################] - 8s       121/121     15/s    http://10.129.229.88/ => Wildcard dir! stopped recursion
[####################] - 2s       121/121     53/s    http://cozyhosting.htb/  
```

![Screenshot showing exploitation evidence on cozyhosting (step 1)](/assets/img/htb/cozyhosting/Pasted%20image%2020251014015703.png)
*Caption: Screenshot captured during cozyhosting at stage 1 of the attack chain.*

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `www.iestudy.work/entry/2024/11/11/142614`
- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `22/tcp`
- `80/tcp`
- `HOME/work/scans/$(date`

## まとめ・学んだこと

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
