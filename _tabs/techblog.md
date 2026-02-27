---
layout: page
title: Tech Blog
icon: fas fa-book-open
order: 2
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
