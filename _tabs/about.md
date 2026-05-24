---
layout: page
icon: fas fa-info-circle
order: 6
title: About
---

## About Me

I am a cybersecurity professional who began this journey in **August 2025**. I obtained the **OSCP** certification in March 2026 and the **HTB CPTS** and **HTB CJCA** in 2026, building hands-on skills across platforms such as **Hack The Box**, **TryHackMe**, and **OSCP Proving Grounds**. Each machine I worked through deepened my understanding of real-world attack techniques and defensive strategies.

As a non-native English speaker, I am also actively improving my English skills alongside my technical development. I believe that consistent effort and a willingness to step outside one's comfort zone are the foundations of meaningful progress — in both cybersecurity and language.

This site documents my ongoing journey in offensive security. I hope that my writeups prove useful to others who are on a similar path.

---

## Certifications

| Certification                                            | Issuer                                        |
| :------------------------------------------------------- | :-------------------------------------------- |
| OSCP (Offensive Security Certified Professional)         | OffSec                                        |
| CPTS (HTB Certified Penetration Testing Specialist) — 5/162 | Hack The Box                               |
| CJCA (HTB Certified Junior Cybersecurity Associate) — 5/5 | Hack The Box                                 |
| RISS (Registered Information Security Specialist)        | Information-technology Promotion Agency (IPA) |
| AWS Certified Security – Specialty                       | Amazon Web Services (AWS)                     |
| AWS Certified Solutions Architect – Professional         | Amazon Web Services (AWS)                     |
| AWS Certified Solutions Architect – Associate            | Amazon Web Services (AWS)                     |
| IP (IT Passport)                                         | Information-technology Promotion Agency (IPA) |
| ITIL Foundation                                          | AXELOS Limited                                |
| AP (Applied Information Technology Engineer)             | Information-technology Promotion Agency (IPA) |
| Oracle Java Silver                                       | Oracle Corporation                            |
| FE (Fundamental Information Technology Engineer)         | Information-technology Promotion Agency (IPA) |
| Oracle Java Bronze                                       | Oracle Corporation                            |
| NTT .Com Master ADVANCED ★★                              | NTT Communications Corporation                |

---

## Vulnerability Research & CVE Hunting

**19 published CVEs** with CVE IDs assigned and patched releases shipped (as of 2026-05-24 UTC). Vulnerability classes span SSRF, Stored XSS, SQLi, SSTI, CQL Injection, Privilege Escalation, ExifTool argument injection, and weak password validation. Two coordinated co-credited disclosures (Open WebUI / MantisBT). Five additional CVE IDs are assigned but not yet published.

### CVE entries

| CVE ID | Project | Vulnerability | CVSS |
|--------|---------|--------------|:----:|
| [CVE-2026-33628](https://github.com/invoiceninja/invoiceninja/security/advisories/GHSA-98wm-cxpw-847p) | Invoice Ninja | Stored XSS — denylist bypass | 5.4 |
| [CVE-2026-33644](https://github.com/LycheeOrg/Lychee/security/advisories/GHSA-5245-4p8c-jwff) | Lychee | SSRF — DNS rebinding bypass | 2.3 |
| [CVE-2026-33738](https://github.com/LycheeOrg/Lychee/security/advisories/GHSA-5574-7f3r-hm9j) | Lychee | Stored XSS — RSS/Atom/JSON feed description | 4.8 |
| [CVE-2026-33742](https://github.com/invoiceninja/invoiceninja/security/advisories/GHSA-xph7-9749-56mh) | Invoice Ninja | Stored XSS — Markdown HTML injection | 5.4 |
| [CVE-2026-34203](https://github.com/nautobot/nautobot/security/advisories/GHSA-xmpv-j7p2-j873) | Nautobot | Password validators not enforced via REST API | 2.7 |
| [CVE-2026-35187](https://github.com/pyload/pyload/security/advisories/GHSA-2wvg-62qm-gj33) | pyLoad | SSRF — multi-protocol (`file://`, `gopher://`) in `parse_urls` | 7.7 |
| [CVE-2026-35477](https://github.com/inventree/InvenTree/security/advisories/GHSA-84jh-x777-8pqq) | InvenTree | SSTI — `PART_NAME_FORMAT` without SandboxedEnvironment | 5.5 |
| [CVE-2026-35516](https://github.com/Kovah/LinkAce/security/advisories/GHSA-4jhm-r4f5-p7xm) | LinkAce | SSRF — bypass via `CheckLinksCommand` link URL update | 5.0 |
| [CVE-2026-35588](https://github.com/nicolargo/glances/security/advisories/GHSA-grp3-h8m8-45p7) | Glances | CQL Injection — Cassandra export config | 6.3 |
| [CVE-2026-39361](https://github.com/openobserve/openobserve/security/advisories/GHSA-gcwf-3p7h-wm79) | OpenObserve | SSRF — IPv6 bracket bypass in `validate_enrichment_url` | 7.7 |
| [CVE-2026-39400](https://github.com/jhuckaby/Cronicle/security/advisories/GHSA-36q6-pwxv-j545) | Cronicle | Stored XSS — Job HTML/Table output `innerHTML` sink | — |
| [CVE-2026-39401](https://github.com/jhuckaby/Cronicle/security/advisories/GHSA-5j3v-cq96-xw6v) | Cronicle | Privilege Escalation — `update_event` missing authentication | — |
| [CVE-2026-39960](https://github.com/mantisbt/mantisbt/security/advisories/GHSA-qj6w-v29q-4rgx) | MantisBT | Stored XSS — Custom Field Textarea (CVE-2024-34081 bypass) | 5.4 |
| [CVE-2026-40280](https://github.com/gotenberg/gotenberg/security/advisories/GHSA-5q7p-7jgv-ww56) | Gotenberg | SSRF — URL scheme case-insensitivity deny-list bypass | 9.3 |
| [CVE-2026-40281](https://github.com/gotenberg/gotenberg/security/advisories/GHSA-q7r4-hc83-hf2q) | Gotenberg | ExifTool stdin argument injection via metadata newlines | 10.0 |
| [CVE-2026-40301](https://github.com/rhukster/dom-sanitizer/security/advisories/GHSA-93vf-569f-22cq) | dom-sanitizer | SVG `<style>` CSS injection — `url()` / `@import` | 4.7 |
| [CVE-2026-41143](https://github.com/YesWiki/yeswiki/security/advisories/GHSA-f58v-p6j9-24c2) | YesWiki | SQLi — `id_fiche` in `EntryManager::formatDataBeforeSave()` | 8.8 |
| [CVE-2026-44568](https://github.com/open-webui/open-webui/security/advisories/GHSA-fq3v-xjjx-95rc) | Open WebUI | Stored XSS — Pending User Overlay DOMPurify order issue | 4.8 |
| [CVE-2026-45548](https://github.com/Budibase/budibase/security/advisories/GHSA-rpj4-7x2v-wjrf) | Budibase | SSRF — AI Extract `fetchWithBlacklist` not applied | 7.7 |

All vulnerabilities were reported through responsible disclosure.
Related advisory query: <https://github.com/advisories?query=credit%3Amorimori-dev>

---

## Professional Background

Before transitioning into cybersecurity, I worked in **IT infrastructure and network engineering**. This background gives me a solid foundation in networking protocols, system administration, and troubleshooting — skills that directly support my penetration testing practice.

## Skills

**Infrastructure & Cloud** *(Professional Experience)*

AWS (Security, Solutions Architect Professional), Container Orchestration (Docker, Kubernetes), High Availability / Redundancy Architecture, Microsoft Endpoint Configuration Manager (MECM), Microsoft Defender for Endpoint (MDE), Splunk, Linux Administration, Windows Server Administration

**Security Testing**

Reconnaissance and Enumeration (Nmap, Gobuster, feroxbuster, nikto), Web Application Testing (Burp Suite Pro), Active Directory Attacks (BloodHound CE, Impacket, Certipy), Privilege Escalation (LinPEAS / WinPEAS), ADCS Exploitation, Kerberos Abuse, Lateral Movement, Tunneling (Ligolo-ng), Vulnerability Analysis, Report Writing

**Scripting**

Bash (command chaining, automation of enumeration tasks), Python for security tooling

---

## Writeup Stats

{% assign pg_count = 0 %}
{% assign htb_count = 0 %}
{% assign thm_count = 0 %}
{% assign linux_count = 0 %}
{% assign windows_count = 0 %}

{% for post in site.posts %}
  {% if post.categories contains 'Proving Grounds' %}
    {% assign pg_count = pg_count | plus: 1 %}
  {% elsif post.categories contains 'HackTheBox' %}
    {% assign htb_count = htb_count | plus: 1 %}
  {% elsif post.categories contains 'TryHackMe' %}
    {% assign thm_count = thm_count | plus: 1 %}
  {% endif %}

  {% if post.categories contains 'Linux' %}
    {% assign linux_count = linux_count | plus: 1 %}
  {% elsif post.categories contains 'Windows' %}
    {% assign windows_count = windows_count | plus: 1 %}
  {% endif %}
{% endfor %}

{% assign total_count = pg_count | plus: htb_count | plus: thm_count %}

| Platform             | Machines Completed |
| :------------------- | -----------------: |
| OSCP Proving Grounds | {{ pg_count }}     |
| Hack The Box         | {{ htb_count }}    |
| TryHackMe            | {{ thm_count }}    |
| **Total**            | **{{ total_count }}** |

| OS      | Count |
| :------ | ----: |
| Linux   | {{ linux_count }} |
| Windows | {{ windows_count }} |

---

## Contact

- **GitHub:** [github.com/morimori-dev](https://github.com/morimori-dev)
- **LinkedIn:** [linkedin.com/in/nozomu-sasaki](https://www.linkedin.com/in/nozomu-sasaki/)
- **Credly:** [credly.com/users/class_nzm](https://www.credly.com/users/class_nzm)

---

> Interested in discussing a writeup, collaborating, or exploring opportunities?
> Feel free to reach out via LinkedIn.
