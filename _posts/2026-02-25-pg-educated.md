---
title: "Proving Grounds - Educated (Linux)"
date: 2026-02-25
description: "Proving Grounds Educated Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
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
| Primary Entry Vector      | Web-based initial access |
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
exiftool webcam.swf
```

```bash
✅[23:25][CPU:20][MEM:59][TUN0:192.168.45.178][/home/n0z0/Downloads]
🐉 > exiftool webcam.swf
ExifTool Version Number         : 13.25
File Name                       : webcam.swf
Directory                       : .
File Size                       : 7.1 kB
File Modification Date/Time     : 2026:01:19 23:25:32+09:00
File Access Date/Time           : 2026:01:19 23:25:32+09:00
File Inode Change Date/Time     : 2026:01:19 23:25:33+09:00
File Permissions                : -rw-rw-r--
File Type                       : SWF
File Type Extension             : swf
MIME Type                       : application/x-shockwave-flash
Flash Version                   : 27
Compressed                      : True
Image Width                     : 320
Image Height                    : 240
Frame Rate                      : 15
Frame Count                     : 1
Duration                        : 0.07 s
Flash Attributes                : UseNetwork, ActionScript3
Image Size                      : 320x240
Megapixels                      : 0.077

```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
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
