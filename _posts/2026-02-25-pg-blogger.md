---
title: "Proving Grounds - Blogger (Linux)"
date: 2026-02-25
description: "Proving Grounds Blogger Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
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
| Primary Entry Vector      | Web-based initial access |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
`http://blogger.pg/assets/fonts/blog/`
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
wpscan --url http://blogger.pg/assets/fonts/blog/ --enumerate u,t,p
```

```bash
🐉 > wpscan --url http://blogger.pg/assets/fonts/blog/ --enumerate u,t,p
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://blogger.pg/assets/fonts/blog/ [192.168.155.217]
[+] Started: Tue Dec 16 04:39:53 2025

Interesting Finding(s):

[+] Headers
 | Interesting Entry: Server: Apache/2.4.18 (Ubuntu)
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://blogger.pg/assets/fonts/blog/xmlrpc.php
 | Found By: Link Tag (Passive Detection)
 | Confidence: 100%
 | Confirmed By: Direct Access (Aggressive Detection), 100% confidence
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://blogger.pg/assets/fonts/blog/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] Upload directory has listing enabled: http://blogger.pg/assets/fonts/blog/wp-content/uploads/
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://blogger.pg/assets/fonts/blog/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 4.9.8 identified (Insecure, released on 2018-08-02).
 | Found By: Rss Generator (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/?feed=rss2, <generator>https://wordpress.org/?v=4.9.8</generator>
 |  - http://blogger.pg/assets/fonts/blog/?feed=comments-rss2, <generator>https://wordpress.org/?v=4.9.8</generator>

[+] WordPress theme in use: poseidon
 | Location: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/
 | Last Updated: 2025-01-04T00:00:00.000Z
 | Readme: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/readme.txt
 | [!] The version is out of date, the latest version is 2.4.1
 | Style URL: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/style.css?ver=2.1.1
 | Style Name: Poseidon
 | Style URI: https://themezee.com/themes/poseidon/
 | Description: Poseidon is an elegant designed WordPress theme featuring a splendid fullscreen image slideshow. The...
 | Author: ThemeZee
 | Author URI: https://themezee.com
 |
 | Found By: Css Style In Homepage (Passive Detection)
 |
 | Version: 2.1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/style.css?ver=2.1.1, Match: 'Version: 2.1.1'

[+] Enumerating Most Popular Plugins (via Passive Methods)

[i] No plugins Found.

[+] Enumerating Most Popular Themes (via Passive and Aggressive Methods)
 Checking Known Locations - Time: 00:00:08 <========================================================================================> (400 / 400) 100.00% Time: 00:00:08
[+] Checking Theme Versions (via Passive and Aggressive Methods)

[i] Theme(s) Identified:

[+] poseidon
 | Location: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/
 | Last Updated: 2025-01-04T00:00:00.000Z
 | Readme: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/readme.txt
 | [!] The version is out of date, the latest version is 2.4.1
 | Style URL: http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/style.css
 | Style Name: Poseidon
 | Style URI: https://themezee.com/themes/poseidon/
 | Description: Poseidon is an elegant designed WordPress theme featuring a splendid fullscreen image slideshow. The...
 | Author: ThemeZee
 | Author URI: https://themezee.com
 |
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 2.1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/poseidon/style.css, Match: 'Version: 2.1.1'

[+] twentyfifteen
 | Location: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyfifteen/
 | Last Updated: 2025-12-03T00:00:00.000Z
 | Readme: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyfifteen/readme.txt
 | [!] The version is out of date, the latest version is 4.1
 | Style URL: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyfifteen/style.css
 | Style Name: Twenty Fifteen
 | Style URI: https://wordpress.org/themes/twentyfifteen/
 | Description: Our 2015 default theme is clean, blog-focused, and designed for clarity. Twenty Fifteen's simple, st...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyfifteen/, status: 500
 |
 | Version: 2.0 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyfifteen/style.css, Match: 'Version: 2.0'

[+] twentyseventeen
 | Location: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyseventeen/
 | Last Updated: 2025-12-03T00:00:00.000Z
 | Readme: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyseventeen/README.txt
 | [!] The version is out of date, the latest version is 4.0
 | Style URL: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyseventeen/style.css
 | Style Name: Twenty Seventeen
 | Style URI: https://wordpress.org/themes/twentyseventeen/
 | Description: Twenty Seventeen brings your site to life with header video and immersive featured images. With a fo...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyseventeen/, status: 500
 |
 | Version: 1.7 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentyseventeen/style.css, Match: 'Version: 1.7'

[+] twentysixteen
 | Location: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentysixteen/
 | Last Updated: 2025-12-03T00:00:00.000Z
 | Readme: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentysixteen/readme.txt
 | [!] The version is out of date, the latest version is 3.7
 | Style URL: http://blogger.pg/assets/fonts/blog/wp-content/themes/twentysixteen/style.css
 | Style Name: Twenty Sixteen
 | Style URI: https://wordpress.org/themes/twentysixteen/
 | Description: Twenty Sixteen is a modernized take on an ever-popular WordPress layout — the horizontal masthead wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentysixteen/, status: 500
 |
 | Version: 1.5 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://blogger.pg/assets/fonts/blog/wp-content/themes/twentysixteen/style.css, Match: 'Version: 1.5'

[+] Enumerating Users (via Passive and Aggressive Methods)
 Brute Forcing Author IDs - Time: 00:00:00 <==========================================================================================> (10 / 10) 100.00% Time: 00:00:00

[i] User(s) Identified:

[+] j@m3s
 | Found By: Author Posts - Display Name (Passive Detection)
 | Confirmed By:
 |  Rss Generator (Passive Detection)
 |  Login Error Messages (Aggressive Detection)

[+] jm3s
 | Found By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Tue Dec 16 04:40:09 2025
[+] Requests Done: 467
[+] Cached Requests: 17
[+] Data Sent: 136.253 KB
[+] Data Received: 628.384 KB
[+] Memory used: 268.383 MB
[+] Elapsed time: 00:00:16

```

![Screenshot from the blogger engagement](/assets/img/pg/blogger/Pasted%20image%2020251218000306.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
http://blogger.pg/assets/fonts/blog/wp-content/uploads/2025/12/
```

![Screenshot from the blogger engagement](/assets/img/pg/blogger/Pasted%20image%2020251218000330.png)
*Caption: Screenshot captured during this stage of the assessment.*

![Screenshot from the blogger engagement](/assets/img/pg/blogger/Pasted%20image%2020251218000510.png)
*Caption: Screenshot captured during this stage of the assessment.*

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
╔══════════╣ All relevant hidden files (not in /sys/ or the ones listed in the previous check) (limit 70)
-rw-r--r-- 1 root root 104 Jan 17  2021 /opt/.creds

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
╔══════════╣ Readable files inside /tmp, /var/tmp, /private/tmp, /private/var/at/tmp, /private/var/tmp, and backup folders (limit 70)
-rw-r--r-- 1 root root 147 Dec 17 14:39 /tmp/backup.tar.gz
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat /opt/.creds
```

```bash
www-data@ubuntu-xenial:/usr/local/bin$ cat /opt/.creds
';u22>'v$)='2a#B&>`c'=+C(?5(|)q**bAv2=+E5s'+|u&I'vDI(uAt&=+(|`yx')Av#>'v%?}:#=+)';y@%'5(2vA!'<y$&u"H!"ll
```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
╔══════════╣ Analyzing Wordpress Files (limit 70)
-rw-r--r-- 1 www-data root 2878 Jan 17  2021 /var/www/wordpress/assets/fonts/blog/wp-config.php
define('DB_NAME', 'wordpress');
define('DB_USER', 'root');
define('DB_PASSWORD', 'sup3r_s3cr3t');
define('DB_HOST', 'localhost');
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
MariaDB [wordpress]> SELECT * FROM wp-users;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near '-users' at line 1
MariaDB [wordpress]> SSELECT * FROM wp_users;
+----+------------+------------------------------------+---------------+-------------------+----------+---------------------+---------------------+-------------+--------------+
| ID | user_login | user_pass                          | user_nicename | user_email        | user_url | user_registered     | user_activation_key | user_status | display_name |
+----+------------+------------------------------------+---------------+-------------------+----------+---------------------+---------------------+-------------+--------------+
|  1 | j@m3s      | $P$BqG2S/yf1TNEu03lHunJLawBEzKQZv/ | jm3s          | admin@blogger.thm |          | 2021-01-17 12:40:06 |                     |           0 | j@m3s        |
+----+------------+------------------------------------+---------------+-------------------+----------+---------------------+---------------------+-------------+--------------+

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
MariaDB [mysql]> SELECT * FROM user;
+-----------+------+-------------------------------------------+-------------+-------------+-------------+-------------+-------------+-----------+-------------+---------------+--------------+-----------+------------+-----------------+------------+------------+--------------+------------+-----------------------+------------------+--------------+-----------------+------------------+------------------+----------------+---------------------+--------------------+------------------+------------+--------------+------------------------+----------+------------+-------------+--------------+---------------+-------------+-----------------+----------------------+--------+-----------------------+------------------+---------+
| Host      | User | Password                                  | Select_priv | Insert_priv | Update_priv | Delete_priv | Create_priv | Drop_priv | Reload_priv | Shutdown_priv | Process_priv | File_priv | Grant_priv | References_priv | Index_priv | Alter_priv | Show_db_priv | Super_priv | Create_tmp_table_priv | Lock_tables_priv | Execute_priv | Repl_slave_priv | Repl_client_priv | Create_view_priv | Show_view_priv | Create_routine_priv | Alter_routine_priv | Create_user_priv | Event_priv | Trigger_priv | Create_tablespace_priv | ssl_type | ssl_cipher | x509_issuer | x509_subject | max_questions | max_updates | max_connections | max_user_connections | plugin | authentication_string | password_expired | is_role |
+-----------+------+-------------------------------------------+-------------+-------------+-------------+-------------+-------------+-----------+-------------+---------------+--------------+-----------+------------+-----------------+------------+------------+--------------+------------+-----------------------+------------------+--------------+-----------------+------------------+------------------+----------------+---------------------+--------------------+------------------+------------+--------------+------------------------+----------+------------+-------------+--------------+---------------+-------------+-----------------+----------------------+--------+-----------------------+------------------+---------+
| localhost | root | *E7C14B979E808E8BC27B2BB40371CDF3DD46F1E0 | Y           | Y           | Y           | Y           | Y           | Y         | Y           | Y             | Y  
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
2025/12/17 14:26:01 CMD: UID=0     PID=15133  | /bin/sh /usr/local/bin/backup.sh 
2025/12/17 14:26:01 CMD: UID=0     PID=15132  | /bin/sh /usr/local/bin/backup.sh 
2025/12/17 14:26:01 CMD: UID=0     PID=15131  | /bin/sh -c /usr/local/bin/backup.sh 
2025/12/17 14:26:01 CMD: UID=0     PID=15130  | /usr/sbin/CRON -f 

PATH=/home/james:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
* * * * * root /usr/local/bin/backup.sh

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat backup.sh
```

```bash
www-data@ubuntu-xenial:/usr/local/bin$ cat backup.sh

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
