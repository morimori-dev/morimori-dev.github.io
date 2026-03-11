---
title: "Proving Grounds - Butch (Windows)"
date: 2026-03-11
description: "Proving Grounds Butch Windows マシン解説。偵察と Web アプリへのデフォルト認証情報による初期アクセスを解説。"
categories: [Proving Grounds, Windows]
tags: [iis, smtp, ftp, weak-credentials]
mermaid: false
content_lang: ja
alt_en: /posts/pg-butch/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Windows |
| 難易度 | 記録なし |
| 攻撃対象 | IIS Web アプリ (ポート 450) と SMTP |
| 主な侵入経路 | デフォルト認証情報 (butch:awesomedude) |
| 権限昇格経路 | 調査中 |

## 認証情報

| ユーザー名 | パスワード | 発見元 |
|----------|----------|--------|
| butch    | awesomedude | デフォルト / 推測した Web アプリ認証情報 |

## 偵察

---
💡 なぜ有効か
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

```bash
rustscan -a $ip -r 1-65535 --ulimit 5000
```

```bash
Open 192.168.178.63:21
Open 192.168.178.63:25
Open 192.168.178.63:135
Open 192.168.178.63:139
Open 192.168.178.63:445
Open 192.168.178.63:450
Open 192.168.178.63:5985
```

```bash
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
25/tcp   open  smtp          Microsoft ESMTP 10.0.17763.1
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
450/tcp  open  http          Microsoft IIS httpd 10.0
|_http-title: Butch
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
```

SMTPバナーでホスト名が `butch` であることが確認できた:

```bash
echo -e "EHLO test\r\nQUIT" | nc $ip 25
```

```bash
220 butch Microsoft ESMTP MAIL Service, Version: 10.0.17763.1 ready
250-butch Hello [192.168.45.166]
250-TURN
250-SIZE 2097152
```

## 初期足がかり

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

SMBとFTPの匿名アクセスはともに拒否された:

```bash
smbclient -L //$ip -N
# session setup failed: NT_STATUS_ACCESS_DENIED

ftp $ip
# 匿名ログイン失敗: 530 User cannot log in.
```

ポート450のWebアプリケーションでデフォルト認証情報 `butch:awesomedude` が受け入れられた:

```bash
http://$ip:450/
# ログイン: butch / awesomedude
```

💡 なぜ有効か
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
調査中。

💡 なぜ有効か
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## まとめ・学んだこと

- マシンのホスト名と一致するデフォルト・明白な認証情報でWebアプリをデプロイしない。
- 明示的に必要でない限り、FTPとSMBへの匿名アクセスを無効化する。
- WinRM (ポート 5985) の公開は管理ネットワークのみに制限する。

## 参考文献

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
