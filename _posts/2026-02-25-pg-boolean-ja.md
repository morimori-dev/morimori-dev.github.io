---
title: "Proving Grounds - Boolean (Linux)"
date: 2026-02-25
description: "Proving Grounds Boolean Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-boolean/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Webを経由した初期アクセス |
| 権限昇格経路 | ローカル列挙 → 設定ミスの悪用 → root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域をマッピングし、悪用が最も成功しやすい箇所を特定します。正確なサービスおよびコンテンツ探索により、闇雲なテストを減らし、標的を絞った後続アクションに繋げます。

## 初期足がかり

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt --dont-scan '/(css|fonts?|images?|img)/' -u http://$ip
```

```bash
✅[0:30][CPU:25][MEM:69][TUN0:192.168.45.168][/home/n0z0]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt --dont-scan '/(css|fonts?|images?|img)/' -u http://$ip
200      GET       65l      179w     2765c http://192.168.155.231/register.php
```

![Screenshot from the boolean engagement](/assets/img/pg/boolean/Pasted%20image%2020251219032040.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the boolean engagement](/assets/img/pg/boolean/Pasted%20image%2020251219031942.png)
*キャプション：このフェーズで取得したスクリーンショット*

---
💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットを実行制御下に置きます。成功した足がかり技法は、コマンド実行またはインタラクティブシェルの取得によって検証されます。

## 権限昇格

---
![Screenshot from the boolean engagement](/assets/img/pg/boolean/Pasted%20image%2020251220215811.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

追加ログなし。

💡 なぜ有効か
権限昇格は、ローカルの設定ミス・安全でないパーミッション・信頼された実行パスを利用します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

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
