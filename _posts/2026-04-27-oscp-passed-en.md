---
title: "My Journey to OSCP+"
date: 2026-04-27
description: "OSCP (OffSec Certified Professional) learning roadmap, how I used PEN-200 / Proving Grounds / HTB, time management during the 24-hour exam, exam trends after the Buffer Overflow removal, and my personal cheat sheet used in the actual exam (github.com/morimori-dev/OSCP). A practical guide for those planning to take the exam."
categories: [TechBlog]
tags: [oscp, offsec, certification, pentest, pen-200, proving-grounds, htb, cheatsheet, career]
mermaid: true
content_lang: en
lang: en
---

## TL;DR

- **Result**: OSCP **passed on the 2nd attempt** (1st: 2025-01-06 FAILED → 2nd: 2026-03-29 PASSED)
- **Study period**: 2024-08-28 to 2026-03-29, **approximately 19 months** (evenings + weekends)
- **Materials used**: PEN-200 official course, Proving Grounds Practice, HackTheBox, TryHackMe
- **Cheat sheet**: Command collection actually used during the exam → **[github.com/morimori-dev/OSCP](https://github.com/morimori-dev/OSCP)**
- **Key takeaways**:
  - 1st attempt: only grabbed **one proof flag from the AD set** — the root cause was a failed pivot
  - For the retake, I drilled three axes hard: **pivoting, AD lateral movement, and initial access**
  - "Try Harder" is not a mindset slogan — it's about **time allocation and pivot decision-making**
  - AD set 40pts + Standalone 2 roots (40pts) = **80pts to pass** (don't chase the 3rd Standalone)
  - Invest 70% of your time in enumeration

<img src="/assets/img/life/oscp/certificate.jpeg" alt="OSCP Certificate" class="normal" style="width:80%; margin:1em 0;">

---

## Exam Results Summary

| | 1st Attempt (FAILED) | 2nd Attempt (PASSED) |
|---|---|---|
| Date | 2025-01-06 | 2026-03-29 10:00 – 03-30 10:00 (24h) |
| Result | FAILED | **PASSED** |
| Flags captured | **One AD proof flag only** | Full AD set + proof on 2 Standalones |
| Score | Far below passing threshold | **80 / 100** |
| Cause / Factor | **Failed pivot** → AD lateral movement halted | Drilled pivoting, initial access, AD lateral movement |

---

## Background and Prior Knowledge

- **Work experience**:
  - **8 years of infrastructure operations** — large-scale projects, including design and operation of **Windows patch deployment**
  - **Vulnerability assessment + platform assessment** (**from 2025-07** / start of offensive career)
- **Certifications held**:
  - **RISS (Registered Information Security Specialist)**
  - **AWS Certified Solutions Architect – Professional (SAP)**
  - **AWS Certified Security – Specialty (SCS)**
- **Offensive work experience**: Began professional assessments roughly **1 year after** starting PEN-200 (2024-08)
- **Volume of practice at the start of study**:
  - HTB: a handful of Easy machines
  - THM: partially done
  - Proving Grounds: untouched

> **Honest assessment**: I had a basic understanding of what commands do and a minimal grasp of OS fundamentals. The intuition built over 8 years of infra ops — "where things live on Linux/Windows," "how services behave" — carried over directly.
>
> On the other hand, **the offensive mindset** (how to cross privilege boundaries, how to chain credentials) was zero, and that's where the bulk of my time went. To anyone coming from an infra background: **your ops knowledge is a genuine asset**.

### Why I Decided to Take OSCP

Honestly, I don't remember the exact trigger. I probably saw something on Twitter saying "having OSCP puts you in a good position." I had been collecting defensive certs (RISS / AWS Security, etc.), but I had nothing that publicly demonstrated **"I understand the attacker's perspective."** To bridge my infra background with vulnerability assessment work, OSCP felt non-negotiable.

One thing worth noting: before passing, I vaguely thought "once I get OSCP, doors will open and the world will change." After actually passing, the world didn't change at all. New hurdles appeared (OSEP, CRTO, CPTS…), more goals came into view, and a new world opened up — that's all it was. A cert isn't a "goal." It's a "new starting point." That's how I see it now.

---

## Why I Failed the 1st Time, and What I Fixed for the Retake

### 1st Attempt (2025-01-06)

> **Captured only one proof flag from the AD set** — nowhere near the passing threshold.

Looking back at how I spent the 24 hours, one failure cascaded into the rest:

1. **Got stuck on pivoting** — couldn't move from the AD client into the internal network; burned several hours here
2. **AD lateral movement completely stalled** — pivot not working meant I had no path to the DC, and couldn't claim the AD set's 40pts
3. **Not enough initial access techniques** — the time and concentration I'd burned on pivoting left nothing for pivoting to the Standalones

In short, **the failed pivot was the single root cause** that took down both AD lateral movement and the Standalone machines in a chain reaction. It wasn't a lack of CVE knowledge or tools — I was simply not equipped to **"move once inside."**

### What I Changed During the Retake Period (2025-01 – 2026-03)

| Axis drilled | What I actually did |
|---|---|
| **Pivoting** (top priority) | Built every pattern of **chisel / ligolo-ng / sshuttle / SSH -L/-D / proxychains** by hand across scenarios, creating a "pivot recipe book" in my notes. Used multi-host machines on PG Practice and HTB Pro Labs to repeat until I could chain **3-hop pivots** reliably |
| **AD lateral movement** | BloodHound collection → walked through each attack path by hand: kerberoast / ASREProast / DCSync / RBCD / Shadow Credentials / ADCS ESC1–ESC8. Rooted all relevant HTB Retired AD machines (Forest, Sauna, Resolute, Monteverde, Active, Cascade, Sizzle, Mantis, etc.) |
| **Initial access** | Converted all enumeration commands for Web/SMB/SNMP/RPC into a cheat sheet — ready to paste and finish in under 5 minutes. Ran time trials on PG Practice / HTB Easy–Medium aiming to **get a foothold within 30 minutes** |

> **By the numbers**: Over the ~14 months between attempt 1 and attempt 2, I rooted **30+ AD machines**. For Standalones, I worked through **80+ machines** from the PG Practice TJnull list.
>
> Looking back: **PEN-200 alone is definitely not enough**. The 66 lab machines are insufficient for building AD lateral movement breadth — external repetition on HTB / PG was the decisive factor.

### Gear I Prepared for Exam Day

Comfort on exam day has a surprising effect on the outcome. For the 2nd attempt, I set up:

- **Whiteboard** — Used to sketch the AD structure and pivot routes in real time. The connections across the AD environment that can't be held in your head all at once become visible at a glance, making it much easier to think through your next move when you're stuck.

<img src="/assets/img/life/oscp/whiteboard.jpeg" alt="Whiteboard on exam day" width="148" class="normal" style="margin:0.5em 0 1em 0;">

- **Uber Eats** — Didn't want to leave my desk during the 24-hour exam, so all meals were delivered. Directly tied to maintaining energy and focus — don't underestimate it. I ordered Hokkyoku Ramen and it reminded me multiple times why I'm glad to live in Tokyo.

- **Webcam** — OffSec's exam rules require proctoring. Checking your frame, angle, and lighting in advance eliminates unnecessary stress right before the exam starts.

---

## Exam Day Time Log

| Elapsed | Progress |
|---|---|
| 0h | Exam start, launched nmap against all machines simultaneously |
| ~0.5h | AD environment entry → initial foothold |
| ~2h | AD user.txt (10pts) |
| ~4h | AD pivot → DC compromise → full AD takeover (**40pts**) |
| ~4.5h | Light meal + started Standalone1 enumeration |
| ~6.5h | Standalone1 user.txt (10pts) |
| ~8h | Standalone1 root.txt (**+10pts / total 60pts**) |
| ~8.5h | Started Standalone2 enumeration |
| ~10.5h | Standalone2 user.txt (10pts) |
| ~12h | Standalone2 root.txt (**+10pts / total 80pts = passed**) |
| ~13.5h | Touched Standalone3 but didn't chase it; switched to screenshot and command cleanup |
| ~17h | 4h sleep |
| ~21h | Verified no missing screenshots, captured what was needed |
| 24h | Exam ended |

### Decisions That Made the Difference

1. **2-hour rule**: No progress on a machine for 2 hours → switch to another (things often click when you return)
2. **Clear the AD set first**: 40 points in one block. Even if Standalones give you trouble, you're close to the passing line
3. **Obsidian notes: IP / credentials / commands only** — don't write prose; save that for the report
4. **Take too many screenshots**: Too few means failing; too many is harmless
5. **Standardize screenshots with Flameshot**: Assigned a shortcut to [Flameshot](https://flameshot.org/) so annotations and highlights were ready the moment a screenshot was taken. Having the shoot→paste workflow fully automated meant I never lost time during evidence cleanup

---

## My Cheat Sheet (Public)

I'm publishing the cheat sheet I used throughout the compromise chain. Whether you're studying, in the exam, or doing assessment work, everything is organized at a granularity where **you can paste and run immediately**.

> **[github.com/morimori-dev/OSCP](https://github.com/morimori-dev/OSCP)**

### Contents

- **Enumeration**: nmap / rustscan / feroxbuster / smbclient / nuclei with flags, ready to paste
- **Web**: SQLi / LFI / SSTI / CMS inspection commands (WordPress, Drupal, Joomla)
- **AD**: One-liners from BloodHound collection → kerberoast → ASREProast → DCSync
- **Linux PrivEsc**: Checks to run before linpeas (SUID, sudo -l, cron, capabilities)
- **Windows PrivEsc**: whoami /priv → Potato family decision flow, individual guides for SeBackup/SeRestore/SeImpersonate
- **Pivoting**: Chisel / Ligolo-ng / sshuttle setup
- **Reverse Shell**: All variants — bash / python / php / powershell (with AMSI bypass)

### Design Philosophy

- **Paste and run**: Unified `<TARGET>` `<LHOST>` `<LPORT>` placeholders
- **Ordered by technique flow**: Work top to bottom and enumeration is complete
- **Only exam-legal tools**: Metasploit excluded by default, compliant with the single-use restriction rule

---

## Advice for Those Planning to Take the Exam

### What Worked Well

- **Grinding through [TJnull's OSCP-like list](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/) methodically**: About 80% of the techniques in the exam resembled machines on that list
- **No new machines in the final week**: Focus entirely on review and physical condition
- **Verify DNS / VPN / VM snapshots the day before**: Zero technical issues on exam day
- **Having a whiteboard ready**: Drawing the AD enumeration results, pivot routes, delegation relationships, and privilege escalation paths made it possible to visualize information that's impossible to hold entirely in your head. Writing "which user can move where" and "where to set up pivots" on the board made it much easier to see the next move when you were stuck
- **Building a searchable dashboard of past writeups**: To make accumulated writeups actually searchable, I built a dashboard where I could cross-search by tool used, vulnerability type, CMS, priv esc method, and other tags. Being able to immediately answer "which machine did I chain LFI to RCE on?" or "how many times did I use a Potato variant?" meant that during the exam I could pull up techniques with "I've seen this pattern before"
- **Completing all PEN-200 modules except Skylark**: The course alone isn't enough, but it's the most efficient place to build the foundational layer. I finished every module including the end-of-chapter exercises before moving on to external machines
- **Leaning fully on DeepL**: The entire course is in English and I was nervous about it at first, but DeepL made it almost a non-issue. Technical terms occasionally get slightly off — just develop the habit of cross-checking against the original and you'll be fine

### What Wasn't Worth Doing

- **Picking up new material in the final stretch**: In hindsight, **no new learning was necessary — the Proving Grounds content was fully sufficient**. Repeated drilling on PG / HTB beats spreading thin
- **Practicing Metasploit**: You can only use it once in the exam. Sharpening manual techniques is more effective
- **Memorizing individual CVEs**: In the exam, "missed due to insufficient enumeration" overwhelmingly beats "missing a specific CVE"
- **Long unbroken study sessions**: 4 hours/day every day outperformed weekend cramming sessions

### Mindset on Exam Day

- **AD will get you stuck somewhere — that's given**: Accept it upfront and go all-in on **thorough enumeration** from the start. Keep your hands moving; enumerate, then enumerate more
- **Stare at BloodHound**: Feed in all the credentials, sessions, and ACLs you've captured and trace the edges visually. BloodHound will show you the attack path. However, BloodHound occasionally lies — always verify suspicious edges with PowerView as a sanity check
- **If you're panicking in AD, step away and walk for 10 minutes**: Panicked enumeration gets sloppy. AD is structured so that time invested will yield results
- **When a Standalone is stuck**: Don't give up — drop enumeration granularity one level lower (loosen rate limits, full port scan, add directory extensions, inspect headers and cookies)
- **Stop once you have 70 points**: The most wasteful outcome is chasing 80 and losing everything you had

---

## Next Steps

Right now I'm most interested in **AI-augmented penetration testing** and **C2 framework operations**. The "AI-Augmented Pentest" space — integrating LLMs into recon, enumeration, and vulnerability analysis — is entering practical use, and I don't want to fall behind as an attack operator. On the C2 side, I want to go deep on Cobalt Strike / Havoc / Sliver and internalize **long-term compromise scenarios with OPSEC awareness**.

| Cert | Role | What I'm after |
|---|---|---|
| **OSEP (PEN-300)** | AV/EDR bypass + realistic AD attacks | The primary next step after OSCP. Building systematic evasion skills |
| **CRTO** | Cobalt Strike / red team operations | C2 ops, OPSEC, hands-on feel for long-term compromise |
| **OSWE (WEB-300)** | White-box web audit | High affinity with CVE hunting work |
| **HTB CPTS** | Practical, deep AD attacks | OSCP complement; expanding AD technique breadth in parallel |

---

## Acknowledgments

Finally — this pass was absolutely not something I could have reached on my own, so I want to express genuine gratitude here.

**To my company, for covering the cost**
The PEN-200 course plus two exam attempts isn't cheap, and you supported it without hesitation. Without that, I wouldn't have had the courage to come back for the retake. I'll put the offensive perspective I've built to work in assessment projects and in raising the team's skill level.

**And to my wife**
We were newlyweds — the time when we should have been together most. Instead, I was at my PC late into weeknights and used nearly every weekend for studying. Not once did you give me a look or make me feel guilty. You kept telling me "do what you want to do" and pushed me forward. Thank you, from the bottom of my heart. This pass is genuinely yours as much as it is mine.

Going forward I plan to take on higher certs like **OSEP**, and to never forget to appreciate my wife and regularly remind her that she's great.

---

## References

- [OffSec PEN-200 Official](https://www.offsec.com/courses/pen-200/)
- [TJnull's OSCP-like List (NetSecFocus)](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/)
- [Proving Grounds Practice](https://www.offsec.com/labs/individual/)
- [HackTheBox](https://www.hackthebox.com/)
- [My Cheat Sheet (this post)](https://github.com/morimori-dev/OSCP)
