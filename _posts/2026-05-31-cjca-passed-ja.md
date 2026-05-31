---
title: "CJCA 合格体験記"
date: 2026-05-31
description: "HTB Certified Junior Cybersecurity Associate (CJCA) 満点合格までの流れ。Red Team（5マシン完全制覇）・Blue Team（SIEM アラート triage）・商用品質レポートという独自の3フェーズ構成、実際の攻撃チェーン、Elastic/Kibana での triage 方法、SysReptor でのレポート作成まで詳しく解説。"
categories: [TechBlog]
tags: [cjca, htb, hackthebox, pentest, blue-team, siem, elastic, report, certification, career]
mermaid: true
content_lang: ja
lang: ja
---

## TL;DR

- **結果**: CJCA **満点合格**（2026-04-29 受験 → 2026-05 合格通知）
- **試験期間**: 5 日間（120 時間）
- **スコア**: **100 / 100**（合格ライン: 80 点以上 + 商用品質レポート）
- **Red Team**: 5 マシン / 10 フラグすべてを **Day 1 の約 11 時間で完全制覇**
- **Blue Team**: 39 件の SIEM アラートを Elastic/Kibana で TP/FP 分類
- **キーポイント**:
  - 試験は Red Team だけでなく **Blue Team と レポート** が同等以上に重い
  - 「100 点取っても レポート不良なら不合格」— OSCP とは別の軸で難しい
  - Red Team 終了後は全時間をレポートと triage に投資する戦略が効いた
  - OSCP の次のステップとして **攻撃と防御の両面** を試せる、費用対効果の高い試験

---

## 試験結果サマリー

| 項目 | 値 |
|---|---|
| 試験日 | 2026-04-29 06:10 〜 2026-05-04 06:10（120 時間） |
| 結果 | **PASSED（100 / 100）** |
| Red Team | 5 マシン 10 flag 全制覇（Day 1 完了） |
| Blue Team | 39 件 triage 完了 |
| レポート | SysReptor / 英語 / 商用品質 |
| 合格通知 | 受験から約 20 営業日後 |

---

## CJCA とは

**HTB Certified Junior Cybersecurity Associate（CJCA）** は、HackTheBox Academy が提供する実技認定試験です。OSCP が「攻撃側に特化した 24 時間試験」であるのに対し、CJCA は **攻撃（Red Team）・防御（Blue Team）・報告書（レポート）の 3 フェーズ** から構成される 5 日間（120 時間）の試験です。

| フェーズ | 内容 | 配点 |
|---|---|---|
| **Red Team** | 5 マシンへの侵入テスト（User + Root フラグ各 10 点） | **100 点満点** |
| **Blue Team** | Elastic/Kibana SIEM の 約 40 件アラートを TP/FP 分類 | 27 件正解で合格 |
| **レポート** | SysReptor で英語商用品質のペンテストレポート提出 | レポート不良で不合格 |

Red Team が 80 点以上かつ商用品質のレポートが揃って初めて合格です。Red Team で満点を取っても レポートが基準未達なら不合格になります。

---

## 自己紹介・受験前の前提知識

- **保有資格**: OSCP（2026-03 取得）、RISS、AWS SAP / SCS
- **業務経験**: インフラ運用保守 8 年 + 脆弱性診断（2025-07〜）
- **CJCA 受験時点での Red Team 経験**: OSCP 合格後 1 か月。Proving Grounds / HTB 合計 100 台以上
- **Blue Team 経験**: 業務上の監視経験あり、SIEM ツールの操作経験はあるが Elastic/Kibana は試験で初めて本格的に触れた

### なぜ CJCA を受けようと思ったか

OSCP 合格の翌月に受けた理由は 2 つあります。

1 つ目は、**診断業務でレポートを書く機会が増えてきたこと**。商用品質の pentest レポートを書く訓練を、採点付きで積める機会はそう多くない。試験という強制力がなければ、自分では「まあ通じる程度の品質」で妥協していたと思います。

2 つ目は、**Blue Team の視点が弱いと感じていたこと**。攻撃側のキャリアを歩み始めてから、「自分の攻撃が防御側にどう見えるか」を体系的に学ぶ機会がなかった。CJCA の Blue Team フェーズは、自分が Red Team で行った攻撃を SIEM 上で追跡する構成になっており、ここが一番の魅力でした。

---

## 試験構成と環境

- **シナリオ**: Acme Security, LLC. が Luminex Ltd. に対してグレーボックスペンテストを実施
- **ターゲット**: 5 マシン（Linux × 3、Windows × 2）、ドメイン: luminex.htb
- **SIEM**: Elastic/Kibana（ELK スタック）
- **レポートツール**: SysReptor（HTB 公式テンプレート使用）
- **提出形式**: ZIP（パスワード: hackthebox）+ PDF + alerts.csv

---

## Day 1: Red Team — 約 11 時間で 10/10 フラグ

試験開始直後に全マシンへ nmap を並列投入し、サービスのプロファイルを取りきってから各マシンに着手しました。

### タイムライン（JST）

| 時刻 | 進捗 |
|---|---|
| 06:10 | 試験開始、全マシン同時 nmap 投入 |
| 〜06:50 | **NIX01 + WIN01 侵害完了**（user + root）|
| 〜12:45 | **NIX02 侵害完了**（NIX01 で入手した SSH 鍵を流用）|
| 〜16:25 | **WEB01 侵害完了**（LFI → SSH 鍵窃取 → GTFOBins）|
| 〜16:52 | **WIN02 侵害完了**（NIX02 認証情報 → スケジュールタスク乗っ取り）|
| 17:30 | Red Team 完全制覇確認、Blue Team 準備に移行 |

### 主な攻撃チェーン

**NIX01（Software Development Server）**
TeamCity の認証回避 CVE（CVE-2023-42793 / CVE-2024-27198）を使って RCE を得た後、DirtyPipe（CVE-2022-0847）で root に昇格しました。TeamCity のビルドサーバが Linux 上で動いているシナリオは、実務でも時折見かける構成です。

**NIX02（Email Server）**
NIX01 の TeamCity ビルドジョブの作業ディレクトリに NIX02 用 SSH 鍵がそのまま残っていました。秘密鍵を読み出してそのまま SSH するだけで user + root を両方取れました。「ビルドサーバには機密ファイルが落ちている」という定番の手筋です。

**WIN01（Windows Client）**
PowerShell の実行履歴ファイル（ConsoleHost_history.txt）に Administrator パスワードが平文で残っていました。john ユーザーが作業中に誤って認証情報をコマンドとして入力したログが、そのまま蓄積されていた形です。WinRM でそのまま Administrator としてログインして root 相当を取得しました。

**WEB01（Web Server）**
WordPress プラグイン Site-Import 1.0.1 の LFI（`page.php?url=file://`）を使って `/home/cameron/.ssh/id_rsa` を読み出し、SSH で cameron としてログイン。`sudo -l` で `NOPASSWD: /usr/bin/less /var/log/auth.log` を確認し、GTFOBins の `!` コマンドで root フラグを直読みしました。

**WIN02（Windows Management Server）**
NIX02 の `/root/log_backup.sh` に WIN02 用の平文パスワードが埋め込まれていました。そのまま SSH でログイン後、backup ユーザーが書き込み可能な PowerShell スクリプト（MonitorFiles.ps1）が 2 分間隔で Administrator 権限のスケジュールタスクとして実行されていることを発見。スクリプトを改ざんして backup ユーザーを Administrators グループに追加し、root 相当を取得しました。

### Red Team を通じた気づき

各マシンで共通していたのは「**認証情報の連鎖**」です。NIX01 で TeamCity を落とすと NIX02 の鍵が手に入り、NIX02 の root スクリプトを読むと WIN02 のパスワードが手に入る。こうした横展開の連鎖を素早く見抜けるかどうかが、CJCA Red Team の本質だと感じました。

---

## Day 2〜4: Blue Team — 攻撃の足跡を SIEM で追跡

Red Team 終了後、翌 Day 2 から Blue Team に移りました。Elastic/Kibana の ELK スタックに対して約 40 件のアラートを TP/FP 分類していきます。合格基準は **27 件以上の正解**です。

### 分類の基本方針

各アラートに対して以下を確認しました：

1. **KQL クエリ**で Kibana 上の実ログを引き出す
2. 関連する **Windows Event ID**（4624/4625/4688/4698/Sysmon-10 等）を確認
3. **プロセスツリー**（親子関係）と実行コンテキスト（ユーザー・パス）を確認
4. Red Team で自分が実際に行った攻撃と**時刻・IPアドレスで突合**
5. TP/FP 判定 + 根拠 1 行 + MITRE ATT&CK Technique ID を記録

### 印象的だった判定

**FP として慎重に判断すべきアラート**が特に難しかったです。`wininit.exe → lsass.exe`、`svchost.exe → lsass.exe`、`rdpclip.exe → csrss.exe` などは一見クレデンシャルダンプのように見えますが、いずれも Windows 標準の IPC 動作です。Sysmon の `GrantedAccess` の値（0x1010 / 0x1410 等）まで掘り下げないと誤判定しやすいアラートでした。

**TP として確実に拾えたアラート**は、Red Team で自分が行った操作と 1:1 で対応しているものです。TeamCity 経由の RCE 直後の偵察コマンド群、DirtyPipe の `/tmp/CVE-2022-0847-DirtyPipe-Exploits/compile.sh` 実行、WIN01 への外部 IP からの Administrator ログインなど、「自分が攻撃した痕跡を自分で TP 判定する」という体験は、Blue Team の視点の習得に非常に効果的でした。

### Blue Team で得た最大の気づき

「**攻撃者の行動は必ずノイズを出す**」ということを体で理解できました。/tmp への書き込み、sudo -l の実行、外部 IP からの高権限ログイン——これらはすべて防御側から見ると明確なシグナルです。今後 Red Team 側で作業するときも「このコマンドは SIEM にどう映るか」を常に意識するようになりました。

---

## レポート作成: SysReptor で商用品質を目指す

CJCA のレポートは **SysReptor**（Markdown 駆動の pentest レポートツール）を使って書きます。HTB が提供する公式テンプレートをベースに、以下のセクションを英語で仕上げます：

- Executive Summary
- Findings（10 件、各マシンの user + root に対応）
- Alert Triage（Blue Team の全 39 件）
- Attack Chain Reconstruction
- Remediation Recommendations

各 Finding の必須要素は以下のとおりです：

| 要素 | 内容 |
|---|---|
| Title / Severity / CVSS | CVSS v3.1 ベーススコアを算出 |
| Description | 脆弱性の技術的説明 |
| Impact | ビジネス影響（ConfidentialityIntegrityAvailability） |
| Steps to Reproduce | コピペで再現可能なコマンド列 |
| Screenshot | 少なくとも 1 枚（flag 取得画面を含む） |
| Remediation | パッチ適用・設定変更の具体的提案 |

### レポートで意識したこと

Red Team が Day 1 で終わったため、残り 4 日間の大半をレポートと triage に充てられました。これが品質面で大きく効いたと感じています。

「Steps to Reproduce は**コピペ一発で再現できる**粒度」にこだわりました。`<TARGET_IP>`、`<LHOST>` といったプレースホルダを統一し、複数のコマンドを順序付きで記載することで、審査官が環境を再現した際に迷わないよう意識しました。

レポート提出物は PDF + alerts.csv を ZIP（パスワード: `hackthebox`）に固めて提出します。提出前に「全 10 flag に対応する Finding があるか」「全 alert に triage 結果があるか」「各 Finding にスクショが 1 枚以上あるか」を必ずチェックしました。

---

## やってよかったこと

- **Red Team を最優先して Day 1 で終わらせたこと**: 残り 4 日間をレポートと Blue Team に集中できた。「100 点でもレポート不良で不合格」という試験の性質上、Red Team が終わったら即レポートに移る判断が正解でした
- **Red Team 中から逐一コマンドをログに残したこと**: Steps to Reproduce を後から再構成しようとすると記憶が曖昧になる。`date` コマンドの出力も含めてコマンドアウトプットを随時保存したことで、レポート作業がスムーズでした
- **Blue Team を「自分が行った攻撃の答え合わせ」として解くこと**: 各アラートが自分の攻撃チェーンのどのフェーズに対応するかを意識すると、TP/FP の判断がずっと楽になります
- **SysReptor テンプレートを事前に手元に展開しておいたこと**: 試験開始後にテンプレート構造を把握するロスをなくせました
- **lsass.exe 関連の FP パターンを事前に調べておいたこと**: `wininit.exe`、`svchost.exe`、`rdpclip.exe` の正常なアクセスパターンは Sysmon の Event 10 の GrantedAccess 値で区別できることを知っておくと Blue Team の精度が上がります

## やらなくてよかったこと

- **Blue Team を後回しにして「後で集中してやる」という考え方**: Red Team と並行して triage できる状況では、早いうちから取り組むべきでした。時間が余っても Blue Team への集中力は日が経つほど落ちます
- **Executive Summary を最後に書こうとすること**: 先に各 Finding をまとめてから Executive Summary に着手する方が内容に一貫性が出ます。最初の下書きだけ先に書いておくのがベターでした

---

## OSCP との違い

| | OSCP | CJCA |
|---|---|---|
| 試験時間 | 24 時間 | 120 時間（5 日間）|
| 視点 | 攻撃のみ | 攻撃 + 防御 + 報告書 |
| スコア | flag による得点 | Red Team 点 + レポート審査 |
| Blue Team | なし | SIEM triage 約 40 件 |
| レポートツール | 自由（Obsidian, Word 等） | SysReptor（HTB 公式） |
| 合格難度の軸 | 技術的な侵害能力 | 技術 + 文章品質 + SIEM 読解力 |

OSCP が「24 時間で機械と格闘するマラソン」だとすれば、CJCA は「5 日間でフルスタックのセキュリティアナリスト業務をこなす試験」です。プレッシャーの質がまったく異なります。

---

## 次のステップ

CJCA で Blue Team の感覚をつかんだことで、次に積みたいスキルの輪郭が見えてきました。

| 資格 | 位置付け |
|---|---|
| **OSEP (PEN-300)** | AV/EDR バイパス、現実的な AD 攻撃の深掘り |
| **CRTO** | Cobalt Strike / C2 運用、OPSEC 意識の体得 |
| **OSWE (WEB-300)** | ホワイトボックス Web 監査、CVE ハンティングとの親和性 |

攻撃側の技術を上げながら、CJCA で得た「自分の攻撃が SIEM にどう映るか」という視点も武器にしていきたいと思っています。

---

## 謝辞

2 か月連続（OSCP: 2026-03、CJCA: 2026-04）で試験に挑む機会と費用を出してくれた会社、そして直前期も含めて一度も嫌な顔をせず背中を押してくれた妻に、改めて感謝します。

---

## 参考リンク

- [HTB CJCA 公式](https://www.hackthebox.com/certifications/htb-certified-junior-cybersecurity-associate)
- [HTB Academy — Junior Cybersecurity Analyst Path](https://academy.hackthebox.com/path/preview/junior-cybersecurity-analyst)
- [SysReptor（レポートツール）](https://docs.sysreptor.com/)
- [自作チートシート (OSCP/CJCA 共通)](https://github.com/morimori-dev/OSCP)
