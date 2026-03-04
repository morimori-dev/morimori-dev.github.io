---
title: "Proving Grounds - Cockpit (Linux)"
date: 2026-02-25
description: "Proving Grounds Cockpit Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: en
alt_ja: /posts/pg-cockpit-ja/
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web-based initial access |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
| --------- | ------ | ---------------------------------- |
      ↓
      ↓
      ↓
      ↓
      ↓  1. backup.tar.gz
      ↓  2. --checkpoint=1                  <-- ！？
      ↓  3. --checkpoint-action=...shell.sh <-- ！？
      ↓  4. shell.sh
      ↓
      ↓
      ↓
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
https://forum.codeigniter.com/printthread.php?tid=6725
![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260103232303.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260104234116.png)
*Caption: Screenshot captured during this stage of the assessment.*

---
![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260105001013.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '%' AND password like '%%'' at line 1
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat /usr/share/wordlists/seclists/Fuzzing/Databases/MySQL-SQLi-Login-Bypass.fuzzdb.txt
```

```bash
==== SESSION YI6P5JcK START 2026-01-05 00:07:28 ====
✅[0:07][CPU:18][MEM:48][TUN0:192.168.45.193][/home/n0z0]
🐉 > cat /usr/share/wordlists/seclists/Fuzzing/Databases/MySQL-SQLi-Login-Bypass.fuzzdb.txt 

```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
sudo -l
```

```bash
james@blaze:~$ sudo -l
sudo -l
Matching Defaults entries for james on blaze:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User james may run the following commands on blaze:
    (ALL) NOPASSWD: /usr/bin/tar -czvf /tmp/backup.tar.gz *
james@blaze:~$ 
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

No additional logs saved.

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
