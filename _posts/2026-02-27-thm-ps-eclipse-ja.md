---
title: "TryHackMe - PS Eclipse 解説 (Windows)"
date: 2026-02-27
description: "TryHackMe PS Eclipse Windows マシン解説。実践的な悪用手順と権限昇格テクニックを解説。"
categories: [TryHackMe, Windows]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/thm-ps-eclipse/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Windows |
| 難易度 | 記録なし |
| 攻撃対象 | 記録なし |
| 主な侵入経路 | web attack path to foothold |
| 権限昇格経路 | Local misconfiguration or credential reuse to elevate privileges |

## 偵察

### 1. PortScan

---
## Rustscan

💡 なぜ有効か  
High-quality reconnaissance narrows a large attack surface into a few validated exploitation paths. Accurate service mapping prevents time loss and supports targeted follow-up testing.

## 初期足がかり

### Not implemented (not recorded in PDF)


## Nmap


### Not implemented (not recorded in PDF)


### 2. Local Shell

---

PDFメモから抽出した主要コマンドと要点を整理しています。必要に応じて後続で詳細追記してください。

### 実行コマンド（抽出）

### Not implemented (not recorded in PDF)


### 抽出画像

![Extracted screenshot 1](/assets/img/thm/ps-eclipse/ps-eclipse-image-00.png)
*Caption: Screenshot captured during ps-eclipse attack workflow (step 1).*

![Extracted screenshot 2](/assets/img/thm/ps-eclipse/ps-eclipse-image-01.png)
*Caption: Screenshot captured during ps-eclipse attack workflow (step 2).*

![Extracted screenshot 3](/assets/img/thm/ps-eclipse/ps-eclipse-image-02.png)
*Caption: Screenshot captured during ps-eclipse attack workflow (step 3).*

![Extracted screenshot 4](/assets/img/thm/ps-eclipse/ps-eclipse-image-03.png)
*Caption: Screenshot captured during ps-eclipse attack workflow (step 4).*

![Extracted screenshot 5](/assets/img/thm/ps-eclipse/ps-eclipse-image-04.png)
*Caption: Screenshot captured during ps-eclipse attack workflow (step 5).*

### 抽出メモ（先頭120行）
```bash
PS Eclipse
June 24, 2023 22:14

Perform digital forensics using Splunk in a Windows environment
#1
Connect to Splunk
Reports>Splunk errors last 24 hours
From custom time to full time
Found powershell running with mysterious arguments
OneNote
1/3
Since the command argument was Base64, encode it nicely.
Command to run suspicious binaries with elevated privileges
create a task scheduler
”C:\Windows\system32\schtasks.exe” /Create /TN OUTSTANDING_GUTTER.exe /TR C:\Windows\Temp\COUTSTANDING_GUTTER.exe /SC
ONEVENT /EC Application /MO *[System/EventID=777] /RU SYSTEM /f
Search for executable file name
Search hash value with virustotal
search query
■or conditions
.ps1
| dedup TargetFilename
| table TargetFilename
OneNote
2/3
■and conditions
test.exe AND "http://10.10.10.10"
OneNote
3/3
```

### Not implemented (not recorded in PDF)


💡 なぜ有効か  
Initial access succeeds when enumeration findings are turned into a practical exploit chain. Capturing credentials, file disclosure, or direct RCE creates reliable pivot points for privilege escalation.

## 権限昇格

### 3.Privilege Escalation

---

Privilege elevation related commands extracted from PDF memo.

💡 なぜ有効か  
Privilege escalation depends on chaining local weaknesses such as sudo misconfiguration, weak file permissions, or credential reuse. If a GTFOBins technique is used, the mechanism is that an allowed binary executes a child process or shell without dropping elevated effective privileges.

## 認証情報

```text
2026/02/27 18:44
ONEVENT /EC Application /MO *[System/EventID=777] /RU SYSTEM /f
```

## まとめ・学んだこと

### 4.Overview

---

```mermaid
flowchart LR
    subgraph SCAN["🔍 Scan"]
        direction TB
        S1["Port and web enumeration"]
    end

    subgraph INITIAL["💥 Initial Foothold"]
        direction TB
        I1["Initial foothold from extracted workflow"]
    end

    subgraph PRIVESC["⬆️ Privilege Escalation"]
        direction TB
        P1["Privilege escalation from extracted notes"]
    end

    SCAN --> INITIAL --> PRIVESC
```


## 参考文献

- nmap
- rustscan
- GTFOBins
