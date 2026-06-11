---
layout: page
title: Tech Blog
icon: fas fa-book-open
order: 2
description: "Technical articles on Active Directory, OSCP, Windows and Linux privilege escalation, web security, and security tooling."
---

## Topic Hubs

- [Active Directory Pentest Roadmap](/en/topics/active-directory/)
- [Active Directory 攻撃ロードマップ](/ja/topics/active-directory/)

---

<table>
  <thead>
    <tr><th>Date</th><th>Title</th><th>Tags</th></tr>
  </thead>
  <tbody>
    {% for post in site.posts %}
      {% if post.categories contains "TechBlog" %}
    <tr>
      <td>{{ post.date | date: "%Y-%m-%d" }}</td>
      <td><a href="{{ post.url | relative_url }}">{{ post.title }}</a></td>
      <td>{% for tag in post.tags %}<code>{{ tag }}</code> {% endfor %}</td>
    </tr>
      {% endif %}
    {% endfor %}
  </tbody>
</table>
