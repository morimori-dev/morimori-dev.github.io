---
layout: page
title: Writeups
icon: fas fa-flag
order: 1
---

{% assign platforms = "" | split: "" %}
{% for post in site.posts %}
  {% unless post.categories contains "TechBlog" %}
    {% assign plat = post.categories | first %}
    {% unless platforms contains plat %}
      {% assign platforms = platforms | push: plat %}
    {% endunless %}
  {% endunless %}
{% endfor %}
{% assign platforms = platforms | sort %}

{% for plat in platforms %}
## {{ plat }}

{% assign writeup_posts = "" | split: "" %}
{% for post in site.posts %}
  {% unless post.categories contains "TechBlog" %}
    {% assign post_plat = post.categories | first %}
    {% if post_plat == plat %}
      {% assign writeup_posts = writeup_posts | push: post %}
    {% endif %}
  {% endunless %}
{% endfor %}
{% assign writeup_posts = writeup_posts | sort: "title" %}

<table>
  <thead>
    <tr><th>Title</th><th>OS</th><th>Tags</th></tr>
  </thead>
  <tbody>
    {% for post in writeup_posts %}
    <tr>
      <td><a href="{{ post.url | relative_url }}">{{ post.title }}</a></td>
      <td>{{ post.categories | last }}</td>
      <td>{% for tag in post.tags %}<code>{{ tag }}</code> {% endfor %}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

{% endfor %}
