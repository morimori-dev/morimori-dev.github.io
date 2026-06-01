---
layout: page
icon: fas fa-tags
order: 4
title: Tags
mermaid: true
---

{%- comment -%}
  Initial intrusion + privesc counters, also split by OS (Linux / Windows).
  Categories derived from front-matter tags + categories across writeups.
{%- endcomment -%}

{% assign init_cve = 0 %}{% assign init_cve_lin = 0 %}{% assign init_cve_win = 0 %}
{% assign init_ad = 0 %}{% assign init_ad_lin = 0 %}{% assign init_ad_win = 0 %}
{% assign init_sqli = 0 %}{% assign init_sqli_lin = 0 %}{% assign init_sqli_win = 0 %}
{% assign init_upload = 0 %}{% assign init_upload_lin = 0 %}{% assign init_upload_win = 0 %}
{% assign init_lfi = 0 %}{% assign init_lfi_lin = 0 %}{% assign init_lfi_win = 0 %}
{% assign init_injection = 0 %}{% assign init_injection_lin = 0 %}{% assign init_injection_win = 0 %}
{% assign init_brute = 0 %}{% assign init_brute_lin = 0 %}{% assign init_brute_win = 0 %}
{% assign init_cms = 0 %}{% assign init_cms_lin = 0 %}{% assign init_cms_win = 0 %}
{% assign init_misconfig = 0 %}{% assign init_misconfig_lin = 0 %}{% assign init_misconfig_win = 0 %}
{% assign init_other = 0 %}{% assign init_other_lin = 0 %}{% assign init_other_win = 0 %}

{% assign pe_suid = 0 %}{% assign pe_sudo = 0 %}{% assign pe_capabilities = 0 %}
{% assign pe_cron = 0 %}{% assign pe_kernel_lin = 0 %}{% assign pe_cred_lin = 0 %}
{% assign pe_path_lin = 0 %}{% assign pe_lin_other = 0 %}

{% assign pe_token = 0 %}{% assign pe_service = 0 %}{% assign pe_dll = 0 %}
{% assign pe_uac = 0 %}{% assign pe_kernel_win = 0 %}{% assign pe_cred_win = 0 %}
{% assign pe_ad = 0 %}{% assign pe_win_other = 0 %}

{% assign tag_rce = 0 %}{% assign tag_suid = 0 %}{% assign tag_web = 0 %}
{% assign tag_sudo = 0 %}{% assign tag_cve = 0 %}{% assign tag_file_upload = 0 %}
{% assign tag_kerberoasting = 0 %}{% assign tag_sqli = 0 %}

{% assign writeup_count = 0 %}
{% assign linux_count = 0 %}
{% assign windows_count = 0 %}

{% for post in site.posts %}
  {%- comment -%} Only count actual writeups, not tech-blog posts {%- endcomment -%}
  {% assign is_writeup = false %}
  {% if post.categories contains 'Proving Grounds' or post.categories contains 'HackTheBox' or post.categories contains 'Hack The Box' or post.categories contains 'TryHackMe' %}
    {% assign is_writeup = true %}
  {% endif %}

  {% if is_writeup %}
    {% assign writeup_count = writeup_count | plus: 1 %}

    {%- comment -%} OS detection — categories field is reliable {%- endcomment -%}
    {% assign os = 'unknown' %}
    {% if post.categories contains 'Linux' %}
      {% assign os = 'linux' %}
      {% assign linux_count = linux_count | plus: 1 %}
    {% elsif post.categories contains 'Windows' %}
      {% assign os = 'windows' %}
      {% assign windows_count = windows_count | plus: 1 %}
    {% endif %}

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
    {% assign init_bucket = '' %}

    {% unless classified %}
      {% if post.tags contains 'kerberoasting' or post.tags contains 'asrep-roasting' or post.tags contains 'asreproast' or post.tags contains 'as-rep-roasting' or post.tags contains 'llmnr-poisoning' or post.tags contains 'eternalblue' or post.tags contains 'ms17-010' or post.tags contains 'responder' or post.tags contains 'samaccountname-spoofing' or post.tags contains 'kerbrute' %}
        {% assign init_ad = init_ad | plus: 1 %}{% assign init_bucket = 'ad' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if has_cve %}
        {% assign init_cve = init_cve | plus: 1 %}{% assign init_bucket = 'cve' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'sql-injection' or post.tags contains 'sqli' or post.tags contains 'sqlmap' %}
        {% assign init_sqli = init_sqli | plus: 1 %}{% assign init_bucket = 'sqli' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'file-upload' or post.tags contains 'webshell' %}
        {% assign init_upload = init_upload | plus: 1 %}{% assign init_bucket = 'upload' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'lfi' or post.tags contains 'rfi' or post.tags contains 'path-traversal' or post.tags contains 'file-inclusion' %}
        {% assign init_lfi = init_lfi | plus: 1 %}{% assign init_bucket = 'lfi' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'ssti' or post.tags contains 'command-injection' or post.tags contains 'deserialization' or post.tags contains 'log-poisoning' or post.tags contains 'xxe' or post.tags contains 'rce' %}
        {% assign init_injection = init_injection | plus: 1 %}{% assign init_bucket = 'injection' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'wordpress' or post.tags contains 'wpscan' or post.tags contains 'joomla' or post.tags contains 'joomscan' or post.tags contains 'drupal' %}
        {% assign init_cms = init_cms | plus: 1 %}{% assign init_bucket = 'cms' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'brute-force' or post.tags contains 'dictionary-attack' or post.tags contains 'hydra' or post.tags contains 'medusa' or post.tags contains 'password-spraying' or post.tags contains 'default-credentials' or post.tags contains 'credential-reuse' %}
        {% assign init_brute = init_brute | plus: 1 %}{% assign init_bucket = 'brute' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% if post.tags contains 'redis' or post.tags contains 'gitlab' or post.tags contains 'jenkins' or post.tags contains 'openfire' or post.tags contains 'tomcat' or post.tags contains 'phpmyadmin' or post.tags contains 'postgresql' or post.tags contains 'mssql' or post.tags contains 'samba' or post.tags contains 'smb-enum' or post.tags contains 'rpc-enum' or post.tags contains 'nfs' or post.tags contains 'snmp' or post.tags contains 'ftp' or post.tags contains 'vsftpd' or post.tags contains 'proftpd' %}
        {% assign init_misconfig = init_misconfig | plus: 1 %}{% assign init_bucket = 'misconfig' %}{% assign classified = true %}
      {% endif %}
    {% endunless %}

    {% unless classified %}
      {% assign init_other = init_other | plus: 1 %}{% assign init_bucket = 'other' %}
    {% endunless %}

    {%- comment -%} OS-split initial intrusion {%- endcomment -%}
    {% if os == 'linux' %}
      {% case init_bucket %}
        {% when 'cve' %}{% assign init_cve_lin = init_cve_lin | plus: 1 %}
        {% when 'ad' %}{% assign init_ad_lin = init_ad_lin | plus: 1 %}
        {% when 'sqli' %}{% assign init_sqli_lin = init_sqli_lin | plus: 1 %}
        {% when 'upload' %}{% assign init_upload_lin = init_upload_lin | plus: 1 %}
        {% when 'lfi' %}{% assign init_lfi_lin = init_lfi_lin | plus: 1 %}
        {% when 'injection' %}{% assign init_injection_lin = init_injection_lin | plus: 1 %}
        {% when 'brute' %}{% assign init_brute_lin = init_brute_lin | plus: 1 %}
        {% when 'cms' %}{% assign init_cms_lin = init_cms_lin | plus: 1 %}
        {% when 'misconfig' %}{% assign init_misconfig_lin = init_misconfig_lin | plus: 1 %}
        {% else %}{% assign init_other_lin = init_other_lin | plus: 1 %}
      {% endcase %}
    {% elsif os == 'windows' %}
      {% case init_bucket %}
        {% when 'cve' %}{% assign init_cve_win = init_cve_win | plus: 1 %}
        {% when 'ad' %}{% assign init_ad_win = init_ad_win | plus: 1 %}
        {% when 'sqli' %}{% assign init_sqli_win = init_sqli_win | plus: 1 %}
        {% when 'upload' %}{% assign init_upload_win = init_upload_win | plus: 1 %}
        {% when 'lfi' %}{% assign init_lfi_win = init_lfi_win | plus: 1 %}
        {% when 'injection' %}{% assign init_injection_win = init_injection_win | plus: 1 %}
        {% when 'brute' %}{% assign init_brute_win = init_brute_win | plus: 1 %}
        {% when 'cms' %}{% assign init_cms_win = init_cms_win | plus: 1 %}
        {% when 'misconfig' %}{% assign init_misconfig_win = init_misconfig_win | plus: 1 %}
        {% else %}{% assign init_other_win = init_other_win | plus: 1 %}
      {% endcase %}
    {% endif %}

    {%- comment -%} OS-aware privilege escalation classification (priority order) {%- endcomment -%}
    {% if os == 'linux' %}
      {% assign pe_done = false %}
      {% unless pe_done %}{% if post.tags contains 'kernel-exploit' or post.tags contains 'dirty-pipe' or post.tags contains 'dirtycow' %}{% assign pe_kernel_lin = pe_kernel_lin | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'capabilities' %}{% assign pe_capabilities = pe_capabilities | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'cron' or post.tags contains 'systemd' or post.tags contains 'cronjob' %}{% assign pe_cron = pe_cron | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'path-hijacking' or post.tags contains 'wildcard' or post.tags contains 'library-hijacking' or post.tags contains 'writable-file' or post.tags contains 'nfs' %}{% assign pe_path_lin = pe_path_lin | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'credential-dumping' or post.tags contains 'credential-harvesting' or post.tags contains 'credential-reuse' or post.tags contains 'ssh-key' or post.tags contains 'password-reuse' %}{% assign pe_cred_lin = pe_cred_lin | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'sudo' %}{% assign pe_sudo = pe_sudo | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'suid' or post.tags contains 'sgid' %}{% assign pe_suid = pe_suid | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% assign pe_lin_other = pe_lin_other | plus: 1 %}{% endunless %}
    {% elsif os == 'windows' %}
      {% assign pe_done = false %}
      {% unless pe_done %}{% if post.tags contains 'dcsync' or post.tags contains 'kerberoasting' or post.tags contains 'asrep-roasting' or post.tags contains 'pass-the-ticket' or post.tags contains 'golden-ticket' or post.tags contains 'silver-ticket' or post.tags contains 'unconstrained-delegation' or post.tags contains 'constrained-delegation' or post.tags contains 'rbcd' or post.tags contains 'adcs' or post.tags contains 'esc1' or post.tags contains 'esc8' or post.tags contains 'acl-abuse' or post.tags contains 'genericall' or post.tags contains 'genericwrite' or post.tags contains 'kerbrute' or post.tags contains 'llmnr-poisoning' or post.tags contains 'responder' or post.tags contains 'samaccountname-spoofing' %}{% assign pe_ad = pe_ad | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'credential-dumping' or post.tags contains 'credential-harvesting' or post.tags contains 'mimikatz' or post.tags contains 'lsass' or post.tags contains 'sam-dump' or post.tags contains 'ntds' or post.tags contains 'lsa-secrets' or post.tags contains 'secretsdump' or post.tags contains 'pass-the-hash' or post.tags contains 'hash-cracking' or post.tags contains 'sysvol' %}{% assign pe_cred_win = pe_cred_win | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'token-impersonation' or post.tags contains 'seimpersonate' or post.tags contains 'juicypotato' or post.tags contains 'godpotato' or post.tags contains 'printspoofer' or post.tags contains 'potato' %}{% assign pe_token = pe_token | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'service-abuse' or post.tags contains 'unquoted-service-path' or post.tags contains 'weak-service-permissions' or post.tags contains 'always-install-elevated' or post.tags contains 'msi' %}{% assign pe_service = pe_service | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'dll-hijacking' or post.tags contains 'dll-sideloading' %}{% assign pe_dll = pe_dll | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'uac-bypass' %}{% assign pe_uac = pe_uac | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'kernel-exploit' or post.tags contains 'printnightmare' or post.tags contains 'zerologon' %}{% assign pe_kernel_win = pe_kernel_win | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% if post.tags contains 'evil-winrm' or post.tags contains 'winrm' or post.tags contains 'psexec' or post.tags contains 'wmiexec' %}{% assign pe_token = pe_token | plus: 1 %}{% assign pe_done = true %}{% endif %}{% endunless %}
      {% unless pe_done %}{% assign pe_win_other = pe_win_other | plus: 1 %}{% endunless %}
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

The following charts are generated from post front matter across **{{ writeup_count }}** writeups (Linux: {{ linux_count }}, Windows: {{ windows_count }}). Each writeup is classified into a single primary intrusion category by priority order.

### 1. Initial Intrusion Path (All)

```mermaid
pie showData title Initial intrusion vectors — all writeups
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

### 2. Initial Intrusion Path — Linux ({{ linux_count }} writeups)

```mermaid
pie showData title Linux initial intrusion vectors
  "Known CVE Exploit" : {{ init_cve_lin }}
  "SQL Injection" : {{ init_sqli_lin }}
  "File Upload / Webshell" : {{ init_upload_lin }}
  "LFI / Path Traversal" : {{ init_lfi_lin }}
  "Code / Template / Cmd Injection" : {{ init_injection_lin }}
  "CMS Exploit (WP / Joomla)" : {{ init_cms_lin }}
  "Brute-force / Default Creds" : {{ init_brute_lin }}
  "Service Misconfiguration" : {{ init_misconfig_lin }}
  "Other" : {{ init_other_lin }}
```

### 3. Initial Intrusion Path — Windows ({{ windows_count }} writeups)

```mermaid
pie showData title Windows initial intrusion vectors
  "Known CVE Exploit" : {{ init_cve_win }}
  "AD / Kerberos Attack" : {{ init_ad_win }}
  "SQL Injection" : {{ init_sqli_win }}
  "File Upload / Webshell" : {{ init_upload_win }}
  "LFI / Path Traversal" : {{ init_lfi_win }}
  "Code / Template / Cmd Injection" : {{ init_injection_win }}
  "CMS Exploit (WP / Joomla)" : {{ init_cms_win }}
  "Brute-force / Default Creds" : {{ init_brute_win }}
  "Service Misconfiguration" : {{ init_misconfig_win }}
  "Other" : {{ init_other_win }}
```

### 4. Privilege Escalation — Linux ({{ linux_count }} writeups)

```mermaid
pie showData title Linux privilege escalation primitives
  "SUID / SGID (GTFOBins)" : {{ pe_suid }}
  "sudo policy abuse" : {{ pe_sudo }}
  "Linux capabilities" : {{ pe_capabilities }}
  "Cron / systemd timer" : {{ pe_cron }}
  "Kernel exploit (Dirty Pipe/Cow)" : {{ pe_kernel_lin }}
  "Credential / SSH key reuse" : {{ pe_cred_lin }}
  "PATH / library / writable file" : {{ pe_path_lin }}
  "Other / Generic" : {{ pe_lin_other }}
```

> **Linux priority (first match wins):** SUID → sudo → capabilities → cron/systemd → kernel exploit → credential reuse → PATH/library hijack → other.

### 5. Privilege Escalation — Windows ({{ windows_count }} writeups)

```mermaid
pie showData title Windows privilege escalation primitives
  "AD ACL / Kerberos / ADCS / Delegation" : {{ pe_ad }}
  "Token impersonation (Potato)" : {{ pe_token }}
  "Service / AlwaysInstallElevated" : {{ pe_service }}
  "DLL hijacking / sideloading" : {{ pe_dll }}
  "UAC bypass" : {{ pe_uac }}
  "Kernel / PrintNightmare / Zerologon" : {{ pe_kernel_win }}
  "Credential dumping (LSASS/SAM/NTDS)" : {{ pe_cred_win }}
  "Other / Generic" : {{ pe_win_other }}
```

> **Windows priority (first match wins):** AD ACL/Kerberos/ADCS → Token impersonation → Service/MSI abuse → DLL hijack → UAC bypass → Kernel exploit → Credential dumping → other.

### 6. Technique Signal Snapshot

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
| **Linux Writeups** | **{{ linux_count }}** |
| **Windows Writeups** | **{{ windows_count }}** |
