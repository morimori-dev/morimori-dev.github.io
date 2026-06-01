---
layout: page
icon: fas fa-tags
order: 4
title: Tags
mermaid: true
---

{%- comment -%}
  Initial intrusion category counters (priority-ordered, first match wins per writeup).
  Categories derived from front-matter tags across ~150 writeups.
{%- endcomment -%}

{% assign init_cve = 0 %}
{% assign init_ad = 0 %}
{% assign init_sqli = 0 %}
{% assign init_upload = 0 %}
{% assign init_lfi = 0 %}
{% assign init_injection = 0 %}
{% assign init_brute = 0 %}
{% assign init_cms = 0 %}
{% assign init_misconfig = 0 %}
{% assign init_other = 0 %}

{% assign pe_suid = 0 %}
{% assign pe_sudo = 0 %}
{% assign pe_kernel = 0 %}
{% assign pe_cred = 0 %}
{% assign pe_other = 0 %}

{% assign tag_rce = 0 %}
{% assign tag_suid = 0 %}
{% assign tag_web = 0 %}
{% assign tag_sudo = 0 %}
{% assign tag_cve = 0 %}
{% assign tag_file_upload = 0 %}
{% assign tag_kerberoasting = 0 %}
{% assign tag_sqli = 0 %}

{% assign writeup_count = 0 %}

{% for post in site.posts %}
  {%- comment -%} Only count actual writeups, not tech-blog posts {%- endcomment -%}
  {% assign is_writeup = false %}
  {% if post.categories contains 'Proving Grounds' or post.categories contains 'Hack The Box' or post.categories contains 'TryHackMe' %}
    {% assign is_writeup = true %}
  {% endif %}

  {% if is_writeup %}
    {% assign writeup_count = writeup_count | plus: 1 %}

    {%- comment -%} Detect CVE presence {%- endcomment -%}
    {% assign has_cve = false %}
    {% for tag in post.tags %}
      {% assign t = tag | downcase %}
      {% if t contains 'cve-' %}
        {% assign has_cve = true %}
      {% endif %}
    {% endfor %}

    {%- comment -%} Initial intrusion classification (priority order) {%- endcomment -%}
    {% assign classified = false %}

    {%- comment -%} 1. AD/Kerberos attacks {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'kerberoasting' or post.tags contains 'asrep-roasting' or post.tags contains 'asreproast' or post.tags contains 'as-rep-roasting' or post.tags contains 'llmnr-poisoning' or post.tags contains 'eternalblue' or post.tags contains 'ms17-010' or post.tags contains 'responder' or post.tags contains 'samaccountname-spoofing' or post.tags contains 'kerbrute' %}
        {% assign init_ad = init_ad | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 2. Known CVE exploit (when no AD primary) {%- endcomment -%}
    {% unless classified %}
      {% if has_cve %}
        {% assign init_cve = init_cve | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 3. SQL Injection {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'sql-injection' or post.tags contains 'sqli' or post.tags contains 'sqlmap' %}
        {% assign init_sqli = init_sqli | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 4. File Upload / Webshell {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'file-upload' or post.tags contains 'webshell' %}
        {% assign init_upload = init_upload | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 5. LFI / Path Traversal {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'lfi' or post.tags contains 'rfi' or post.tags contains 'path-traversal' or post.tags contains 'file-inclusion' %}
        {% assign init_lfi = init_lfi | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 6. SSTI / Command Injection / Deserialization / XXE {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'ssti' or post.tags contains 'command-injection' or post.tags contains 'deserialization' or post.tags contains 'log-poisoning' or post.tags contains 'xxe' or post.tags contains 'rce' %}
        {% assign init_injection = init_injection | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 7. CMS Exploit {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'wordpress' or post.tags contains 'wpscan' or post.tags contains 'joomla' or post.tags contains 'joomscan' or post.tags contains 'drupal' %}
        {% assign init_cms = init_cms | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 8. Brute-force / Credential Spraying {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'brute-force' or post.tags contains 'dictionary-attack' or post.tags contains 'hydra' or post.tags contains 'medusa' or post.tags contains 'password-spraying' or post.tags contains 'default-credentials' or post.tags contains 'credential-reuse' %}
        {% assign init_brute = init_brute | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 9. Service Misconfiguration {%- endcomment -%}
    {% unless classified %}
      {% if post.tags contains 'redis' or post.tags contains 'gitlab' or post.tags contains 'jenkins' or post.tags contains 'openfire' or post.tags contains 'tomcat' or post.tags contains 'phpmyadmin' or post.tags contains 'postgresql' or post.tags contains 'mssql' or post.tags contains 'samba' or post.tags contains 'smb-enum' or post.tags contains 'rpc-enum' or post.tags contains 'nfs' or post.tags contains 'snmp' or post.tags contains 'ftp' or post.tags contains 'vsftpd' or post.tags contains 'proftpd' %}
        {% assign init_misconfig = init_misconfig | plus: 1 %}
        {% assign classified = true %}
      {% endif %}
    {% endunless %}

    {%- comment -%} 10. Other / Generic web {%- endcomment -%}
    {% unless classified %}
      {% assign init_other = init_other | plus: 1 %}
    {% endunless %}

    {%- comment -%} Privilege escalation classification {%- endcomment -%}
    {% if post.tags contains 'suid' %}
      {% assign pe_suid = pe_suid | plus: 1 %}
    {% elsif post.tags contains 'sudo' %}
      {% assign pe_sudo = pe_sudo | plus: 1 %}
    {% elsif post.tags contains 'kernel-exploit' %}
      {% assign pe_kernel = pe_kernel | plus: 1 %}
    {% elsif post.tags contains 'credential-dumping' or post.tags contains 'credential-harvesting' or post.tags contains 'pass-the-hash' or post.tags contains 'dcsync' or post.tags contains 'mimikatz' %}
      {% assign pe_cred = pe_cred | plus: 1 %}
    {% else %}
      {% assign pe_other = pe_other | plus: 1 %}
    {% endif %}

    {%- comment -%} Technique signal totals {%- endcomment -%}
    {% if post.tags contains 'rce' %}{% assign tag_rce = tag_rce | plus: 1 %}{% endif %}
    {% if post.tags contains 'suid' %}{% assign tag_suid = tag_suid | plus: 1 %}{% endif %}
    {% if post.tags contains 'web' %}{% assign tag_web = tag_web | plus: 1 %}{% endif %}
    {% if post.tags contains 'sudo' %}{% assign tag_sudo = tag_sudo | plus: 1 %}{% endif %}
    {% if post.tags contains 'file-upload' %}{% assign tag_file_upload = tag_file_upload | plus: 1 %}{% endif %}
    {% if post.tags contains 'kerberoasting' %}{% assign tag_kerberoasting = tag_kerberoasting | plus: 1 %}{% endif %}
    {% if post.tags contains 'sql-injection' or post.tags contains 'sqli' %}{% assign tag_sqli = tag_sqli | plus: 1 %}{% endif %}
    {% if has_cve %}{% assign tag_cve = tag_cve | plus: 1 %}{% endif %}
  {% endif %}
{% endfor %}

## Tag Explorer

<div id="tags" class="d-flex flex-wrap gap-2">
  {% assign sorted_tags = site.tags | sort %}
  {% for tag in sorted_tags %}
    {% assign tag_name = tag[0] %}
    {% assign tag_count = tag[1] | size %}
    {% assign tag_slug = tag_name | slugify %}
    <a class="post-tag" href="{{ '/tags/' | append: tag_slug | append: '/' | relative_url }}">
      {{ tag_name }}<span class="text-muted"> ({{ tag_count }})</span>
    </a>
  {% endfor %}
</div>

---

## Attack Trends Overview

The following charts are generated from post front matter across **{{ writeup_count }}** writeups (Proving Grounds, Hack The Box, TryHackMe). Each writeup is classified into a single primary intrusion category by priority order.

### 1. Initial Intrusion Path

```mermaid
pie showData title Initial intrusion vectors across writeups
  "Known CVE Exploit" : {{ init_cve }}
  "AD / Kerberos Attack" : {{ init_ad }}
  "SQL Injection" : {{ init_sqli }}
  "File Upload / Webshell" : {{ init_upload }}
  "LFI / Path Traversal" : {{ init_lfi }}
  "Code / Template / Cmd Injection" : {{ init_injection }}
  "CMS Exploit (WP / Joomla)" : {{ init_cms }}
  "Brute-force / Default Creds" : {{ init_brute }}
  "Service Misconfiguration" : {{ init_misconfig }}
  "Other" : {{ init_other }}
```

> **Classification priority (first match wins):** AD/Kerberos → Known CVE → SQLi → File Upload → LFI → Code Injection → CMS → Brute-force → Misconfig → Other. This reflects the most distinctive vulnerability used to achieve initial foothold, not every technique applied.

### 2. Privilege Escalation Primitive

```mermaid
pie showData title Privilege escalation primitives
  "SUID / GTFOBins" : {{ pe_suid }}
  "sudo policy abuse" : {{ pe_sudo }}
  "Kernel exploit" : {{ pe_kernel }}
  "Credential dumping / PtH" : {{ pe_cred }}
  "Other / Generic" : {{ pe_other }}
```

### 3. Technique Signal Snapshot

| Technique Signal | Posts |
| :--- | ---: |
| `cve-*` (any CVE) | {{ tag_cve }} |
| `suid` | {{ tag_suid }} |
| `sudo` | {{ tag_sudo }} |
| `web` | {{ tag_web }} |
| `file-upload` | {{ tag_file_upload }} |
| `sql-injection` / `sqli` | {{ tag_sqli }} |
| `kerberoasting` | {{ tag_kerberoasting }} |
| `rce` | {{ tag_rce }} |
| **Total Writeups** | **{{ writeup_count }}** |
