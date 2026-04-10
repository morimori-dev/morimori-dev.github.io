---
layout: page
icon: fas fa-info-circle
order: 6
title: About
---

## About Me

I am a cybersecurity professional who began this journey in **August 2025**. I obtained the **OSCP** certification in March 2026, building hands-on skills across platforms such as **Hack The Box**, **TryHackMe**, and **OSCP Proving Grounds**. Each machine I worked through deepened my understanding of real-world attack techniques and defensive strategies.

As a non-native English speaker, I am also actively improving my English skills alongside my technical development. I believe that consistent effort and a willingness to step outside one's comfort zone are the foundations of meaningful progress — in both cybersecurity and language.

This site documents my ongoing journey in offensive security. I hope that my writeups prove useful to others who are on a similar path.

---

## Certifications

| Certification                                     | Issuer                                        | Year |
| :------------------------------------------------ | :-------------------------------------------- | :--- |
| OSCP (Offensive Security Certified Professional)  | OffSec                                        | 2026 |
| Registered Information Security Specialist (RISS) | Information-technology Promotion Agency (IPA) | 2024 |
| AWS Certified Security – Specialty                | Amazon Web Services (AWS)                     | 2023 |
| AWS Certified Solutions Architect – Professional  | Amazon Web Services (AWS)                     | 2022 |
| AWS Certified Solutions Architect – Associate     | Amazon Web Services (AWS)                     | 2021 |
| IT Passport (IP)                                  | Information-technology Promotion Agency (IPA) | 2017 |
| ITIL Foundation                                   | AXELOS Limited                                | 2016 |
| Applied Information Technology Engineer (AP)      | Information-technology Promotion Agency (IPA) | 2016 |
| Oracle Java Silver                                | Oracle Corporation                            | 2015 |
| Fundamental Information Technology Engineer (FE)  | Information-technology Promotion Agency (IPA) | 2014 |
| Oracle Java Bronze                                | Oracle Corporation                            | 2014 |
| NTT .Com Master ADVANCED ★★                       | NTT Communications Corporation                | 2013 |

---

## Vulnerability Research & CVE Hunting

The GitHub Advisory query `credit:morimori-dev` currently shows 4 advisories (checked on 2026-04-10 UTC), and **3 of them have CVE IDs assigned**.

### CVE entries

| CVE ID | Project | Vulnerability | CVSS |
|--------|---------|--------------|:----:|
| [CVE-2026-33628](https://github.com/invoiceninja/invoiceninja/security/advisories/GHSA-98wm-cxpw-847p) | Invoice Ninja | Stored XSS Denylist Bypass | 5.4 |
| [CVE-2026-34203](https://github.com/nautobot/nautobot/security/advisories/GHSA-xmpv-j7p2-j873) | Nautobot | Password validators not enforced via REST API user management | 2.7 |
| [CVE-2026-35187](https://github.com/pyload/pyload/security/advisories/GHSA-2wvg-62qm-gj33) | pyLoad | SSRF in parse_urls API endpoint via unvalidated URL parameter | 7.7 |

All vulnerabilities were reported through responsible disclosure.  
Note: One additional GHSA entry (`GHSA-jfwg-rxf3-p7r9`) is listed in the query as "No known CVE". CVE IDs are assigned by a CNA (e.g., MITRE/GitHub) and may remain unassigned if still under review, handled as a GHSA-only case, or split into separate advisories per CVE rules.  
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
