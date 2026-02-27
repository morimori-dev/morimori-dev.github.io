---
layout: page
icon: fas fa-tags
order: 4
title: Tags
mermaid: true
---

{% assign linux_posts = 0 %}
{% assign windows_posts = 0 %}
{% assign other_posts = 0 %}

{% assign linux_init_web = 0 %}
{% assign linux_init_db = 0 %}
{% assign linux_init_cred = 0 %}
{% assign linux_init_cve = 0 %}
{% assign linux_init_other = 0 %}

{% assign windows_init_web = 0 %}
{% assign windows_init_db = 0 %}
{% assign windows_init_cred = 0 %}
{% assign windows_init_cve = 0 %}
{% assign windows_init_other = 0 %}

{% assign pe_suid = 0 %}
{% assign pe_sudo = 0 %}
{% assign pe_other = 0 %}

{% assign tag_rce = 0 %}
{% assign tag_suid = 0 %}
{% assign tag_php = 0 %}
{% assign tag_web = 0 %}
{% assign tag_sudo = 0 %}
{% assign tag_cve = 0 %}
{% assign tag_file_upload = 0 %}
{% assign tag_postgresql = 0 %}

{% for post in site.posts %}
  {% assign is_linux = false %}
  {% assign is_windows = false %}
  {% assign has_cve = false %}

  {% if post.categories contains 'Linux' %}
    {% assign is_linux = true %}
    {% assign linux_posts = linux_posts | plus: 1 %}
  {% elsif post.categories contains 'Windows' %}
    {% assign is_windows = true %}
    {% assign windows_posts = windows_posts | plus: 1 %}
  {% else %}
    {% assign other_posts = other_posts | plus: 1 %}
  {% endif %}

  {% for tag in post.tags %}
    {% assign normalized_tag = tag | downcase %}
    {% if normalized_tag contains 'cve-' %}
      {% assign has_cve = true %}
    {% endif %}
  {% endfor %}

  {% assign is_cred = false %}
  {% if post.tags contains 'default-credentials' or post.tags contains 'credential-reuse' %}
    {% assign is_cred = true %}
  {% endif %}

  {% assign is_db = false %}
  {% if post.tags contains 'postgresql' %}
    {% assign is_db = true %}
  {% endif %}

  {% assign is_web = false %}
  {% if post.tags contains 'php' or post.tags contains 'web' or post.tags contains 'file-upload' or post.tags contains 'command-injection' or post.tags contains 'log-poisoning' or post.tags contains 'limesurvey' or post.tags contains 'jorani' %}
    {% assign is_web = true %}
  {% endif %}

  {% if is_linux %}
    {% if is_cred %}
      {% assign linux_init_cred = linux_init_cred | plus: 1 %}
    {% elsif has_cve %}
      {% assign linux_init_cve = linux_init_cve | plus: 1 %}
    {% elsif is_db %}
      {% assign linux_init_db = linux_init_db | plus: 1 %}
    {% elsif is_web %}
      {% assign linux_init_web = linux_init_web | plus: 1 %}
    {% else %}
      {% assign linux_init_other = linux_init_other | plus: 1 %}
    {% endif %}
  {% elsif is_windows %}
    {% if is_cred %}
      {% assign windows_init_cred = windows_init_cred | plus: 1 %}
    {% elsif has_cve %}
      {% assign windows_init_cve = windows_init_cve | plus: 1 %}
    {% elsif is_db %}
      {% assign windows_init_db = windows_init_db | plus: 1 %}
    {% elsif is_web %}
      {% assign windows_init_web = windows_init_web | plus: 1 %}
    {% else %}
      {% assign windows_init_other = windows_init_other | plus: 1 %}
    {% endif %}
  {% endif %}

  {% if post.tags contains 'suid' or post.tags contains 'find' %}
    {% assign pe_suid = pe_suid | plus: 1 %}
  {% elsif post.tags contains 'sudo' %}
    {% assign pe_sudo = pe_sudo | plus: 1 %}
  {% else %}
    {% assign pe_other = pe_other | plus: 1 %}
  {% endif %}

  {% if post.tags contains 'rce' %}
    {% assign tag_rce = tag_rce | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'suid' %}
    {% assign tag_suid = tag_suid | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'php' %}
    {% assign tag_php = tag_php | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'web' %}
    {% assign tag_web = tag_web | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'sudo' %}
    {% assign tag_sudo = tag_sudo | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'file-upload' %}
    {% assign tag_file_upload = tag_file_upload | plus: 1 %}
  {% endif %}
  {% if post.tags contains 'postgresql' %}
    {% assign tag_postgresql = tag_postgresql | plus: 1 %}
  {% endif %}
  {% if has_cve %}
    {% assign tag_cve = tag_cve | plus: 1 %}
  {% endif %}
{% endfor %}

{% assign total_posts = linux_posts | plus: windows_posts | plus: other_posts %}

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

The following charts are generated from post front matter and update automatically when new writeups are added.

### 1. OS Distribution

```mermaid
pie title OS distribution across writeups
  "Linux" : {{ linux_posts }}
  "Windows" : {{ windows_posts }}
  "Other / Unknown" : {{ other_posts }}
```

### 2. Initial Access Pattern by OS

```mermaid
pie title Linux initial access pattern
  "Web / App Exploit" : {{ linux_init_web }}
  "Database Abuse" : {{ linux_init_db }}
  "Credential Abuse" : {{ linux_init_cred }}
  "CVE-driven Exploit" : {{ linux_init_cve }}
  "Other" : {{ linux_init_other }}
```

```mermaid
pie title Windows initial access pattern
  "Web / App Exploit" : {{ windows_init_web }}
  "Database Abuse" : {{ windows_init_db }}
  "Credential Abuse" : {{ windows_init_cred }}
  "CVE-driven Exploit" : {{ windows_init_cve }}
  "Other" : {{ windows_init_other }}
```

### 3. Privilege Escalation Primitive Share

```mermaid
pie title Privilege escalation primitive share
  "SUID / GTFOBins-like" : {{ pe_suid }}
  "sudo policy abuse" : {{ pe_sudo }}
  "Other / Generic" : {{ pe_other }}
```

### 4. Technique Signal Snapshot

| Technique Signal | Posts |
| :--- | ---: |
| `rce` | {{ tag_rce }} |
| `suid` | {{ tag_suid }} |
| `php` | {{ tag_php }} |
| `web` | {{ tag_web }} |
| `sudo` | {{ tag_sudo }} |
| `cve-*` | {{ tag_cve }} |
| `file-upload` | {{ tag_file_upload }} |
| `postgresql` | {{ tag_postgresql }} |
| **Total Writeups** | **{{ total_posts }}** |
