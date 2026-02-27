---
title: "HackTheBox - TartarSauce (Linux)"
date: 2026-02-27
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce]
mermaid: true
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | 80/tcp (http) |
| Primary Entry Vector      | Web/service misconfiguration leading to code execution |
| Privilege Escalation Path | Credentialed access -> sudo policy abuse -> elevated shell |

## Reconnaissance

-
- rustscan
- nmap
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[2:09][CPU:8][MEM:46][TUN0:10.10.14.140][/home/n0z0]
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
0day was here ♥

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.1.185:80
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-15 02:09 JST
Initiating Ping Scan at 02:09
Scanning 10.129.1.185 [4 ports]
Completed Ping Scan at 02:09, 0.39s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 02:09
Completed Parallel DNS resolution of 1 host. at 02:09, 0.02s elapsed
DNS resolution of 1 IPs took 0.02s. Mode: Async [#: 4, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 02:09
Scanning 10.129.1.185 [1 port]
Discovered open port 80/tcp on 10.129.1.185
Completed SYN Stealth Scan at 02:09, 0.28s elapsed (1 total ports)
Nmap scan report for 10.129.1.185
Host is up, received reset ttl 63 (0.34s latency).
Scanned at 2025-10-15 02:09:42 JST for 1s

PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 0.80 seconds
           Raw packets sent: 5 (196B) | Rcvd: 2 (84B)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[0:01][CPU:18][MEM:35][TUN0:10.10.14.140][/home/n0z0]
🐉 > grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-18 00:01 JST
Warning: 10.129.90.199 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.90.199
Host is up (0.18s latency).
Not shown: 65481 closed tcp ports (reset), 53 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Landing Page
| http-robots.txt: 5 disallowed entries 
| /webservices/tar/tar/source/ 
| /webservices/monstra-3.0.4/ /webservices/easy-file-uploader/ 
|_/webservices/developmental/ /webservices/phpmyadmin/
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.10 - 4.11
Network Distance: 2 hops

TRACEROUTE (using port 143/tcp)
HOP RTT       ADDRESS
1   241.42 ms 10.10.14.1
2   241.83 ms 10.129.90.199

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1842.26 seconds

```

💡 Why this works  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## Initial Foothold

![Screenshot showing exploitation evidence on tartarsauce (step 1)](/assets/img/htb/tartarsauce/Pasted%20image%2020251021023546.png)
*Caption: Screenshot captured during tartarsauce at stage 1 of the attack chain.*

`admin:admin`
![Screenshot showing exploitation evidence on tartarsauce (step 2)](/assets/img/htb/tartarsauce/Pasted%20image%2020251021033353.png)
*Caption: Screenshot captured during tartarsauce at stage 2 of the attack chain.*

💡 Why this works  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## Privilege Escalation

💡 Why this works  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## Credentials

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `80/tcp`
- `HOME/work/scans/$(date`
- `webservices/tar/tar/source/`
- `webservices/monstra-3.0.4/`

## Lessons Learned / Key Takeaways

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
