---
layout: page
title: "Active Directory Pentest Roadmap"
permalink: /en/topics/active-directory/
description: "A reading roadmap for Active Directory pentesting: enumeration, NetExec, Kerberos, AD CS, NTLM relay, BloodHound, Mimikatz, secretsdump.py, and lateral movement."
content_lang: en
alt_ja: /ja/topics/active-directory/
---

Use this roadmap as the main entry point for Active Directory pentesting notes on this site. The order is designed for authorized labs and assessments: enumerate first, validate access carefully, map attack paths, then move into focused exploitation and reporting.

## Read in This Order

| Step | Topic | Why It Matters |
|---|---|---|
| 1 | [Active Directory Enumeration Checklist](/en/posts/tech-active-directory-enumeration-checklist/) | Build the domain map before running noisy actions. |
| 2 | [NetExec Commands Cheatsheet](/en/posts/tech-netexec-beginner-guide/) | Validate SMB, LDAP, WinRM, password spraying, and access checks. |
| 3 | [Kerberos Attack Techniques for OSCP](/en/posts/tech-kerberos-oscp-guide/) | Understand Kerberoasting, AS-REP roasting, tickets, and trust boundaries. |
| 4 | [GetNPUsers.py — Deep Dive](/en/posts/tech-getnpusers-asrep-roasting/) | Target AS-REP roastable users safely and document the exposure. |
| 5 | [GetUserSPNs.py — Deep Dive](/en/posts/tech-getuserspns-kerberoasting/) | Enumerate SPN accounts and collect Kerberoast material. |
| 6 | [BloodHound Attack Path Cheatsheet](/en/posts/tech-bloodhound-attack-paths/) | Turn raw AD data into attack paths and remediation priorities. |
| 7 | [AD CS Attack Notes — ESC1-ESC16 Summary](/en/posts/tech-adcs-esc-attack-guide/) | Learn the certificate services attack surface. |
| 8 | [Certipy AD CS Attack Guide](/en/posts/tech-certipy-adcs-attack/) | Run practical AD CS checks such as ESC1, ESC8, and Shadow Credentials. |
| 9 | [ntlmrelayx.py — Deep Dive](/en/posts/tech-ntlmrelayx-attack-guide/) | Connect SMB signing, relay targets, LDAP relay, RBCD, and AD CS ESC8. |
| 10 | [RBCD Attack Guide](/en/posts/tech-rbcd-attack-guide/) | Understand delegation abuse and how to report it clearly. |
| 11 | [secretsdump.py Guide](/en/posts/tech-secretsdump-guide/) | Validate DCSync, NTDS.dit, SAM, LSA Secrets, and post-compromise evidence. |
| 12 | [Mimikatz Commands Cheatsheet](/en/posts/tech-mimikatz-guide/) | Interpret LSASS, Kerberos tickets, Pass-the-Hash, and DCSync outputs. |
| 13 | [Lateral Movement — OSCP Summary](/en/posts/tech-lateral-movement-guide/) | Move from credential validation to controlled lateral movement. |
| 14 | [Windows Privilege Escalation — Full Analysis](/en/posts/tech-windows-privesc-summary/) | Tie host privilege escalation back into domain compromise paths. |

## Fast Paths

| Goal | Start Here | Then Read |
|---|---|---|
| I have one domain user and need a plan | [AD Enumeration Checklist](/en/posts/tech-active-directory-enumeration-checklist/) | [NetExec](/en/posts/tech-netexec-beginner-guide/), [BloodHound](/en/posts/tech-bloodhound-attack-paths/) |
| I found SMB signing disabled | [ntlmrelayx.py](/en/posts/tech-ntlmrelayx-attack-guide/) | [AD CS](/en/posts/tech-adcs-esc-attack-guide/), [Certipy](/en/posts/tech-certipy-adcs-attack/) |
| I found SPN or preauth issues | [Kerberos Attacks](/en/posts/tech-kerberos-oscp-guide/) | [GetUserSPNs.py](/en/posts/tech-getuserspns-kerberoasting/), [GetNPUsers.py](/en/posts/tech-getnpusers-asrep-roasting/) |
| I have local admin or replication rights | [secretsdump.py](/en/posts/tech-secretsdump-guide/) | [Mimikatz](/en/posts/tech-mimikatz-guide/), [Lateral Movement](/en/posts/tech-lateral-movement-guide/) |
| I need report-ready remediation | [BloodHound](/en/posts/tech-bloodhound-attack-paths/) | [AD CS](/en/posts/tech-adcs-esc-attack-guide/), [Windows PrivEsc](/en/posts/tech-windows-privesc-summary/) |

## Practical Workflow

1. Confirm scope, domain names, domain controllers, and allowed test windows.
2. Enumerate DNS, SMB, LDAP, Kerberos, WinRM, MSSQL, and AD CS exposure.
3. Check password and lockout policy before any spray or authentication testing.
4. Validate credentials with strict failure limits and record where access works.
5. Collect BloodHound data and prioritize paths by business impact.
6. Test one attack path at a time, starting with the lowest-impact proof.
7. Convert each finding into a remediation item: policy, ACL, delegation, certificate template, credential hygiene, or monitoring.

## Related Writeups

These boxes are useful companion reads because they contain AD-style enumeration or credential workflows:

- [HackTheBox - Forest](/en/posts/htb-forest/)
- [HackTheBox - Active](/en/posts/htb-active/)
- [HackTheBox - Fluffy](/en/posts/htb-fluffy/)
- [Proving Grounds - Nara](/en/posts/pg-nara/)
- [Proving Grounds - Nagoya](/en/posts/pg-nagoya/)
- [Proving Grounds - Hokkaido](/en/posts/pg-hokkaido/)
- [Proving Grounds - Vault](/en/posts/pg-vault/)
- [Proving Grounds - Resourced](/en/posts/pg-resourced/)
