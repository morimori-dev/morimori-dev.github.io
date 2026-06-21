---
layout: page
icon: fas fa-info-circle
order: 6
title: About
---

## About Me

I am a cybersecurity professional. I hold the **OSCP**, **HTB CPTS**, and **HTB CJCA** certifications, building hands-on skills across platforms such as **Hack The Box**, **TryHackMe**, and **OSCP Proving Grounds**. Each machine I worked through deepened my understanding of real-world attack techniques and defensive strategies.

As a non-native English speaker, I am also actively improving my English skills alongside my technical development. I believe that consistent effort and a willingness to step outside one's comfort zone are the foundations of meaningful progress — in both cybersecurity and language.

This site documents my ongoing journey in offensive security. I hope that my writeups prove useful to others who are on a similar path.

---

## Certifications

| Certification                                            | Issuer                                        |
| :------------------------------------------------------- | :-------------------------------------------- |
| OSCP (Offensive Security Certified Professional)         | OffSec                                        |
| CPTS (HTB Certified Penetration Testing Specialist)      | Hack The Box                                  |
| CJCA (HTB Certified Junior Cybersecurity Associate)      | Hack The Box                                  |
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
