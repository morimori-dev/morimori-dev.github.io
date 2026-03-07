---
title: "Windows 初期侵入後の調査ファイルまとめ — RCE・LFI で確認すべき場所"
date: 2026-03-07
description: "RCE・LFI を取得した後に確認すべき Windows のファイル・レジストリ・コマンドをまとめたペネトレーションテスト向けリファレンス。"
categories: [TechBlog]
tags: [windows, initial-access, rce, lfi, file-inclusion, pentest, oscp, credential-hunting]
content_lang: ja
---

## RCE 時に確認するファイル・場所

### システム情報

```
C:\Windows\System32\drivers\etc\hosts
C:\Windows\win.ini
C:\Windows\System32\config\SAM          # パスワードハッシュ (要SYSTEM権限)
C:\Windows\System32\config\SYSTEM
C:\Windows\System32\config\SECURITY
C:\Windows\repair\SAM                   # バックアップSAM
C:\Windows\System32\config\RegBack\     # レジストリバックアップ
```

### ユーザー・認証情報

```
C:\Users\<user>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
C:\Users\<user>\.ssh\id_rsa
C:\Users\<user>\.ssh\known_hosts
C:\Users\<user>\AppData\Local\Microsoft\Credentials\
C:\Users\<user>\AppData\Roaming\Microsoft\Credentials\
C:\Users\<user>\Desktop\
C:\Users\<user>\Documents\
```

### アプリケーション設定・認証情報

```
C:\inetpub\wwwroot\web.config           # IIS設定・DB接続文字列
C:\inetpub\wwwroot\                     # WebルートのPHP/ASP
C:\xampp\htdocs\                        # XAMPP
C:\wamp\www\
C:\Program Files\FileZilla Server\FileZilla Server.xml
C:\Program Files (x86)\FileZilla Server\
C:\ProgramData\MySQL\MySQL Server*\my.ini
```

### サービス・スケジュールタスク

```
C:\Windows\System32\Tasks\             # スケジュールタスク
C:\Windows\SysWOW64\Tasks\
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\
C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
```

### パスワードが入りがちなファイル

```
C:\Windows\Panther\unattend.xml        # 自動インストール設定
C:\Windows\Panther\Unattend\unattend.xml
C:\Windows\system32\sysprep\sysprep.xml
C:\Windows\system32\sysprep\Panther\unattend.xml
C:\sysprep\sysprep.xml
C:\unattend.xml
```

---

## LFI 時に確認するファイル

### 必須チェック

```
# システム基本
C:/Windows/System32/drivers/etc/hosts
C:/Windows/win.ini
C:/boot.ini                            # 古いWindowsのブート情報
C:/Windows/System32/license.rtf

# IIS
C:/inetpub/wwwroot/web.config
C:/inetpub/logs/LogFiles/             # アクセスログ (Log Poisoning用)
C:/Windows/System32/inetsrv/config/applicationHost.config

# Apache (XAMPPなど)
C:/xampp/apache/conf/httpd.conf
C:/xampp/apache/logs/access.log       # Log Poisoning用
C:/xampp/apache/logs/error.log
C:/xampp/php/php.ini
```

### 認証情報狙い

```
C:/Windows/repair/SAM
C:/Windows/repair/system
C:/Windows/System32/config/RegBack/SAM
C:/Windows/System32/config/RegBack/SYSTEM
C:/Users/<user>/AppData/Roaming/Microsoft/Windows/PowerShell/PSReadLine/ConsoleHost_history.txt
```

### アプリ別

```
# PHP系
C:/xampp/htdocs/config.php
C:/wamp/www/config.php

# Tomcat
C:/Program Files/Apache Software Foundation/Tomcat*/conf/tomcat-users.xml

# MySQL
C:/ProgramData/MySQL/MySQL Server*/my.ini
```

---

## RCE後の初動コマンド

```powershell
whoami /all                            # 権限・グループ確認
net user                               # ユーザー一覧
net localgroup administrators          # 管理者グループ
systeminfo                             # OS・パッチ情報
ipconfig /all                          # ネットワーク構成
netstat -ano                           # 接続中のポート
tasklist /svc                          # 実行中プロセス
wmic product get name,version          # インストール済みソフト
dir /s /b *pass* *cred* *config* 2>nul # パスワード含むファイル検索
```

---

## LFI からRCEへの昇格

| 手法 | 条件 | 対象ファイル |
|------|------|------------|
| Log Poisoning | アクセスログ読める | IIS/Apache のアクセスログ |
| PHP Session | セッションファイル読める | `C:/Windows/Temp/sess_*` |
| Web.config RCE | web.config に書き込める | `C:/inetpub/wwwroot/web.config` |
