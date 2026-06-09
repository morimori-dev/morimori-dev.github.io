---
title: "Passing the HTB CJCA Exam"
date: 2026-05-31
permalink: /en/posts/cjca-passed/
legacy_permalink: /posts/cjca-passed-en/
description: "My experience passing the HTB Certified Junior Cybersecurity Associate (CJCA). A detailed breakdown of the unique 3-phase structure — Red Team, Blue Team (SIEM alert triage), and a commercial-quality pentest report — including how I approached each phase and what to watch out for."
categories: [TechBlog]
tags: [cjca, htb, hackthebox, pentest, blue-team, siem, report, certification, career]
mermaid: true
content_lang: en
lang: en
alt_ja: /ja/posts/cjca-passed/
---

## TL;DR

- **Result**: CJCA **passed** (exam: 2026-04-29 → result: 2026-05)
- **Exam duration**: 5 days (120 hours)
- **Red Team**: All flags captured
- **Blue Team**: Completed SIEM alert TP/FP triage
- **Key takeaways**:
  - The exam is not just Red Team — **Blue Team and the report carry equal or greater weight**
  - "100 points and a bad report = fail" — this is a different axis of difficulty from OSCP
  - Finishing Red Team early and investing all remaining time in the report and triage was the right call
  - An excellent value-for-money exam if you want to test **both offensive and defensive skills** after OSCP

<img src="/assets/img/life/cjca/certificate.jpeg" alt="CJCA Certificate" class="normal" style="width:80%; margin:1em 0;">

---

## Exam Results Summary

| | |
|---|---|
| Exam window | 2026-04-29 06:10 – 2026-05-04 06:10 (120 hours) |
| Result | **PASSED** |
| Red Team | All flags captured |
| Blue Team | Triage completed |

---

## What Is CJCA?

**HTB Certified Junior Cybersecurity Associate (CJCA)** is a hands-on certification offered by HackTheBox Academy. While OSCP is a 24-hour offensive-only exam, CJCA is a 5-day (120-hour) exam structured around **three phases: Red Team (offensive), Blue Team (defensive), and a written report**.

| Phase | Content | Scoring |
|---|---|---|
| **Red Team** | Penetration test across multiple machines (User + Root flag per machine) | **100 pts total** |
| **Blue Team** | Classify SIEM alerts as TP/FP | Must correctly classify a minimum number of alerts |
| **Report** | Submit a commercial-quality pentest report using SysReptor (English) | Report below standard = fail |

Passing requires **at least 80 Red Team points AND a report that meets commercial quality standards**. A perfect Red Team score does not save you if the report is substandard.

---

## Background and Prior Knowledge

- **Certifications held**: OSCP (passed 2026-03), RISS, AWS SAP / SCS
- **Work experience**: 8 years of infrastructure operations + vulnerability assessments (from 2025-07)
- **Red Team experience at exam time**: 1 month post-OSCP. 100+ machines across Proving Grounds / HTB combined
- **Blue Team experience**: Regularly used Splunk at work, so I was comfortable reading SIEM alerts and navigating the tooling. This was my first time applying a systematic TP/FP classification framework

### Why I Took CJCA

The honest answer: **I bought a CPTS voucher and the CJCA voucher was bundled with it**. I figured I should use it.

It turned out to be one of the most content-rich exams I've taken. The Blue Team phase and the commercial-quality report requirement taught me things OSCP simply doesn't cover. What started as a "bonus exam" ended up being genuinely valuable.

---

## Day 1–2: Red Team — 10/10 Flags

I fired off parallel nmap scans against all machines immediately after the exam started, building a complete service profile before diving into any individual machine.

### Timeline

| Period | Progress |
|---|---|
| Day 1 morning | Exam start. Parallel nmap scan across all machines |
| Day 1 midday | **Machines 1 and 2 compromised** |
| Day 1 late | **Machine 3 compromised** |
| Day 2 morning | **Machine 4 compromised** |
| Day 2 midday | **Machine 5 compromised** — Red Team complete |
| Day 2 onward | Shifted focus to Blue Team and report writing |

### Observations from Red Team

The techniques from OSCP study and the actual exam transferred directly. No special preparation was needed beyond the OSCP skillset. Deep enumeration is the direct path to points here, just like in OSCP — the habit of enumerating broadly before prioritizing carried over cleanly.

---

## Day 3–4: Blue Team — Tracing Attack Footprints in the SIEM

After finishing Red Team, I moved to Blue Team on Day 3. The task is classifying SIEM alerts as TP (True Positive) or FP (False Positive). Having worked with Splunk professionally meant that despite the tooling differences, my approach to reading alerts and investigating didn't change much. I was able to move through this phase without significant friction.

---

## Report: Targeting Commercial Quality with SysReptor

CJCA uses **SysReptor** (a Markdown-driven pentest report tool) for report submission. Working from the official HTB template, I completed the following sections in English:

- Executive Summary
- Findings (10 entries, one per flag per machine)
- Alert Triage (all Blue Team alerts)
- Attack Chain Reconstruction
- Remediation Recommendations

Each finding required the following elements:

| Element | Content |
|---|---|
| Title / Severity / CVSS | CVSS v3.1 base score calculated |
| Description | Technical explanation of the vulnerability |
| Impact | Business impact (Confidentiality / Integrity / Availability) |
| Steps to Reproduce | Exact commands reproducible by copy-paste |
| Screenshot | At least one (must include flag capture) |
| Remediation | Specific patch or configuration change recommended |

### Report Writing Approach

Because Red Team wrapped up during Day 2, I had three full days dedicated to the report and triage. That buffer made a significant difference in quality.

I focused on making **Steps to Reproduce copy-pasteable end-to-end**. I standardized placeholders like `<TARGET_IP>` and `<LHOST>`, and listed commands in explicit order so reviewers could reproduce findings without guesswork.

Before submitting, I ran through a final checklist: "Does every flag have a corresponding finding?" / "Does every alert have a triage verdict?" / "Does every finding have at least one screenshot?" The deliverable is a PDF + alerts.csv bundled per HTB's submission format.

---

## What Worked Well

- **Prioritizing Red Team and finishing it early**: Having three full days free for the report and Blue Team was critical. Given that this exam can fail you on the report alone, moving to report work the moment Red Team is done is the right call
- **Logging every command output during Red Team**: Reconstructing Steps to Reproduce from memory after the fact is unreliable. Saving command output continuously — including `date` timestamps — made report writing straightforward
- **Starting Blue Team early rather than leaving it for last**: Triage requires sustained focus. Chipping away at it in parallel with report work rather than treating it as an afterthought was the right approach
- **Deploying the SysReptor template before the exam**: Walking into the exam already knowing the template structure eliminates ramp-up time
- **Studying OS-level benign behaviors before the exam**: Understanding what normal system activity looks like makes it much easier to distinguish FP from TP in Blue Team

## What Didn't Work

- **"I'll focus on Blue Team later when I have a block of time"**: Start early. Concentration deteriorates with each passing day regardless of how much time is left on the clock
- **Planning to write the Executive Summary last**: Draft it first, then flesh it out after individual findings are done. Writing it entirely at the end leads to inconsistency between the summary and the findings

---

## CJCA vs OSCP

| | OSCP | CJCA |
|---|---|---|
| Exam duration | 24 hours | 120 hours (5 days) |
| Perspective | Offensive only | Offensive + Defensive + Report |
| Scoring | Flag-based points | Red Team pts + report review |
| Blue Team | None | SIEM triage |
| Report tool | Your choice (Obsidian, Word, etc.) | SysReptor (HTB official) |
| Pass difficulty axis | Technical compromise ability | Technical + writing quality + SIEM comprehension |

If OSCP is "a 24-hour marathon against machines," CJCA is "5 days doing the full work of a security analyst." The pressure is a completely different kind.

---

## References

- [HTB CJCA Official](https://www.hackthebox.com/certifications/htb-certified-junior-cybersecurity-associate)
- [HTB Academy — Junior Cybersecurity Analyst Path](https://academy.hackthebox.com/path/preview/junior-cybersecurity-analyst)
- [SysReptor (report tool)](https://docs.sysreptor.com/)
