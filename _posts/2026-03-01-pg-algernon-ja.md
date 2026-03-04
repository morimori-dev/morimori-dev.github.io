---
title: "Proving Grounds - Algernon (Linux)"
date: 2026-03-01
description: "Proving Grounds Algernon Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
content_lang: ja
alt_en: /posts/pg-algernon/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux (not fully confirmed in source notes) |
| 難易度 | 記録なし |
| 攻撃対象 | ソース資料に記録なし |
| 主な侵入経路 | Not documented |
| 権限昇格経路 | Not documented |

## 偵察

元の Obsidian ノートには RustScan と Nmap のセクション見出しのみが含まれており、コマンドやスキャン出力は記録されていません。列挙ログがないため、サービスレベルの調査結果を信頼性高く再現できません。このライトアップは機械の追跡継続性を保つための構造化プレースホルダーとして公開しています。

💡 なぜ有効か  
Keeping a structured placeholder prevents duplicated effort and makes it clear which targets still need full evidence capture. In red team workflows, documenting gaps explicitly is better than backfilling assumptions that cannot be verified.

## 初期足がかり

ソースのライトアップに初期アクセスのログが保存されていません。侵入経路、エクスプロイトチェーン、検証コマンドは現時点では不明です。

💡 なぜ有効か  
A foothold section should record the exact exploit path and successful execution evidence. When that data is missing, clearly stating the absence protects future operators from relying on unverified assumptions.

## 権限昇格

ソースファイルに権限昇格のメモやコマンド履歴がありません。ローカル列挙の出力、設定ミスの証拠、root 権限取得のコマンド記録が確認できません。

💡 なぜ有効か  
Privilege escalation requires reproducible proof, not inferred outcomes. Documenting the lack of evidence keeps the writeup auditable and highlights where retesting is required.

## 認証情報

```text
認証情報なし。
```

## まとめ・学んだこと

- 各フェーズでターミナルログを保存し、再現性を確保する。
- 主要ステップ（偵察・初期足がかり・権限昇格）ごとにコマンドと出力のペアを最低1つ記録する。
- 公開前にスクリーンショットと添付ファイルをノートと一緒に保存する。
- 一貫したテンプレートを使い、未完のライトアップを迅速に再開できるようにする。

## 参考文献

- RustScan
- Nmap
