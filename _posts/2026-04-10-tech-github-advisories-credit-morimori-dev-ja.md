---
title: "GitHub Advisory Databaseで確認した morimori-dev クレジットのCVE（2026-04-10時点）"
date: 2026-04-10
description: "GitHub Advisory Databaseの credit:morimori-dev クエリで確認できるCVEを一覧化。各CVEの概要、公開日、重大度、対象パッケージを日本語で整理。"
categories: [TechBlog]
tags: [cve, github-advisory-database, security, vulnerability, oss]
content_lang: ja
lang: ja
---

## 概要

GitHub Advisory Database の `credit:morimori-dev` 検索結果（2026-04-10 UTC時点）を確認し、**CVE が付与されているもの**を転記します。

参照: <https://github.com/advisories?query=credit%3Amorimori-dev>

## CVE 一覧（credit: morimori-dev）

| CVE | タイトル | 重大度 | エコシステム / パッケージ | 公開日 |
|---|---|---|---|---|
| CVE-2026-35187 | pyLoad: SSRF in parse_urls API endpoint via unvalidated URL parameter | High | pip / pyload-ng | 2026-04-04 |
| CVE-2026-34203 | Nautobot: Management of users via REST API does not apply configured password validators | Low | pip / nautobot | 2026-03-31 |
| CVE-2026-33628 | Invoice Ninja Denylist Bypass may Lead to Stored XSS via Invoice Line Items | Moderate | Composer / invoiceninja/invoiceninja | 2026-03-24 |

## メモ

- 同じ検索結果には、CVE採番前またはCVE非表示の GitHub Security Advisory（GHSA）も含まれます。
- 2026-04-10時点では、クエリ結果は4件で、そのうち**CVE付きは3件**でした。

