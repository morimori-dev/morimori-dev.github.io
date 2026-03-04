---
title: "Proving Grounds - Cockpit 解説 (Linux)"
date: 2026-02-25
description: "Proving Grounds Cockpit Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-cockpit/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Web application and exposed network services |
| 主な侵入経路 | Web-based initial access |
| 権限昇格経路 | Local enumeration -> misconfiguration abuse -> root |

## 認証情報

認証情報なし。

## 偵察

---
| --------- | ------ | ---------------------------------- |
      ↓
      ↓
      ↓
      ↓
      ↓  1. backup.tar.gz
      ↓  2. --checkpoint=1                  <-- ！？
      ↓  3. --checkpoint-action=...shell.sh <-- ！？
      ↓  4. shell.sh
      ↓
      ↓
      ↓
💡 なぜ有効か  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## 初期足がかり

---
https://forum.codeigniter.com/printthread.php?tid=6725
![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260103232303.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260104234116.png)
*キャプション：このフェーズで取得したスクリーンショット*

---
![Screenshot from the cockpit engagement](/assets/img/pg/cockpit/Pasted%20image%2020260105001013.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '%' AND password like '%%'' at line 1
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat /usr/share/wordlists/seclists/Fuzzing/Databases/MySQL-SQLi-Login-Bypass.fuzzdb.txt
```

```bash
==== SESSION YI6P5JcK START 2026-01-05 00:07:28 ====
✅[0:07][CPU:18][MEM:48][TUN0:192.168.45.193][/home/n0z0]
🐉 > cat /usr/share/wordlists/seclists/Fuzzing/Databases/MySQL-SQLi-Login-Bypass.fuzzdb.txt 

```

💡 なぜ有効か  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
sudo -l
```

```bash
james@blaze:~$ sudo -l
sudo -l
Matching Defaults entries for james on blaze:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User james may run the following commands on blaze:
    (ALL) NOPASSWD: /usr/bin/tar -czvf /tmp/backup.tar.gz *
james@blaze:~$ 
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

No additional logs saved.

💡 なぜ有効か  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

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
