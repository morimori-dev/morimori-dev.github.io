---
title: "Proving Grounds - Educated (Linux)"
date: 2026-02-25
description: "Proving Grounds Educated Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-educated/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Webベースの初期アクセス |
| 権限昇格経路 | ローカル列挙 -> 設定ミスの悪用 -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域を把握し、悪用が成功しやすい箇所を特定します。正確なサービス・コンテンツ探索により、無作為なテストを減らし、的を絞った後続アクションにつなげます。

## 初期足がかり

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
exiftool webcam.swf
```

```bash
✅[23:25][CPU:20][MEM:59][TUN0:192.168.45.178][/home/n0z0/Downloads]
🐉 > exiftool webcam.swf
ExifTool Version Number         : 13.25
File Name                       : webcam.swf
Directory                       : .
File Size                       : 7.1 kB
File Modification Date/Time     : 2026:01:19 23:25:32+09:00
File Access Date/Time           : 2026:01:19 23:25:32+09:00
File Inode Change Date/Time     : 2026:01:19 23:25:33+09:00
File Permissions                : -rw-rw-r--
File Type                       : SWF
File Type Extension             : swf
MIME Type                       : application/x-shockwave-flash
Flash Version                   : 27
Compressed                      : True
Image Width                     : 320
Image Height                    : 240
Frame Rate                      : 15
Frame Count                     : 1
Duration                        : 0.07 s
Flash Attributes                : UseNetwork, ActionScript3
Image Size                      : 320x240
Megapixels                      : 0.077

```

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットへの実行可能な制御を確立します。成功した足がかり技術は、コマンド実行やインタラクティブシェルのコールバックによって検証されます。

## 権限昇格

---
💡 なぜ有効か
権限昇格はローカルの設定ミス、安全でないパーミッション、信頼された実行パスに依存します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
