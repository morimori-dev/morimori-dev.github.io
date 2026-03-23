---
layout: page
icon: fas fa-info-circle
order: 6
title: About
---

## About Me

I am a cybersecurity enthusiast who began this journey in **August 2025**. With a positive attitude and strong motivation, I am committed to continuous growth in this field.

I am currently preparing for the **OSCP** certification, dedicating myself to hands-on practice across platforms such as **Hack The Box**, **TryHackMe**, and **OSCP Proving Grounds**. Each machine I work through deepens my understanding of real-world attack techniques and defensive strategies.

As a non-native English speaker, I am also actively improving my English skills alongside my technical development. I believe that consistent effort and a willingness to step outside one's comfort zone are the foundations of meaningful progress — in both cybersecurity and language.

This site documents my ongoing journey in offensive security. I hope that my writeups prove useful to others who are on a similar path.

---

## Certifications

| Certification                                     | Issuer                                        | Year |
| :------------------------------------------------ | :-------------------------------------------- | :--- |
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

In March 2026, I conducted a focused vulnerability hunting campaign across 105 open-source projects, resulting in **4 CVEs** and **31 GitHub Security Advisories**.

| CVE ID | Project | Vulnerability | CVSS |
|--------|---------|--------------|:----:|
| [CVE-2026-33644](https://github.com/LycheeOrg/Lychee/security/advisories/GHSA-5245-4p8c-jwff) | Lychee | SSRF via DNS Rebinding Bypass | 2.3 |
| [CVE-2026-33628](https://github.com/invoiceninja/invoiceninja/security/advisories/GHSA-98wm-cxpw-847p) | Invoice Ninja | Stored XSS Denylist Bypass | 5.4 |
| CVE-2026-33692 | AVideo | .env Exposure via Docker Misconfiguration | 7.5 |
| CVE-2026-33714 | Chamilo | SQLi — CVE-2026-30881 Incomplete Fix Bypass | 6.5 |

**Campaign Summary:**

| Metric | Value |
|--------|:-----:|
| Targets Investigated | 105 |
| Vulnerabilities Reported | 58 |
| GHSA Submissions | 31 (26 projects) |
| GHSA with Critical/High CVSS | 15 |
| CVEs Obtained | 4 |

All vulnerabilities were reported through responsible disclosure.

---

## Professional Background

Before transitioning into cybersecurity, I worked in **IT infrastructure and network engineering**. This background gives me a solid foundation in networking protocols, system administration, and troubleshooting — skills that directly support my penetration testing practice.

## Skills

**Infrastructure & Networking** *(Professional Experience)*

Network Design and Troubleshooting, TCP/IP, DNS, DHCP, Firewall Configuration, VLAN, VPN, Linux Administration, Windows Server Administration

**Security Testing** *(Currently Developing)*

Reconnaissance and Enumeration (Nmap, Gobuster, feroxbuster, nikto), Web Application Testing (Burp Suite), Privilege Escalation Enumeration (LinPEAS / WinPEAS), Vulnerability Analysis, Report Writing

**Scripting**

Bash (command chaining, automation of enumeration tasks)

**Currently Learning**

Python for security tooling, Active Directory attacks, Buffer Overflow exploitation, Post-Exploitation techniques

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
