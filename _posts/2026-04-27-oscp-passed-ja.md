---
title: "OSCP 合格体験記"
date: 2026-04-27
description: "OSCP (OffSec Certified Professional) 合格までの学習ロードマップ、PEN-200 / Proving Grounds / HTB の活用方法、24時間試験の時間配分、Buffer Overflow撤廃後の試験傾向、そして実際に試験で使った自作チートシート (github.com/morimori-dev/OSCP) を公開。これから受験する方への実践的なガイド。"
categories: [TechBlog]
tags: [oscp, offsec, certification, pentest, pen-200, proving-grounds, htb, cheatsheet, career]
mermaid: true
content_lang: ja
lang: ja
---

## TL;DR

- **結果**: OSCP **2回目で合格**（1回目: 2025-01-06 不合格 → 2回目: 2026-03-29 合格）
- **学習期間**: 2024-08-28 から 2026-03-29 まで **約 19 か月**（業務後 + 週末）
- **認定証**: [credentials.offsec.com/52fd1e8b-72ce-4e32-aa92-cb082555a8bd](https://credentials.offsec.com/52fd1e8b-72ce-4e32-aa92-cb082555a8bd#acc.sZIq1g9p)
- **使用教材**: PEN-200 公式コース、Proving Grounds Practice、HackTheBox、TryHackMe
- **チートシート**: 試験中に実際に使用したコマンド集を公開 → **[github.com/morimori-dev/OSCP](https://github.com/morimori-dev/OSCP)**
- **キーポイント**:
  - 1回目は **AD の proof flag を 1 つ取っただけ** で不合格 → 敗因はピボット失敗だった
  - リベンジで徹底的に鍛えたのは **「ピボット」「AD 横展開」「初期侵入」の 3 軸**
  - "Try Harder" は精神論ではなく **時間配分とピボット判断** の話
  - AD セット 40 点 + Standalone 2 台 root (40 点) = **80 点で合格**（Standalone 3 台目は深追いしない）
  - 列挙 (Enumeration) に 7 割の時間を投資する

---

## 試験結果サマリー

| 項目 | 1回目（不合格） | 2回目（合格） |
|---|---|---|
| 受験日 | 2025-01-06 | 2026-03-29 10:00 〜 03-30 10:00（24h）|
| 結果 | FAILED | **PASSED** |
| 取得 flag | **AD の proof flag 1 つのみ** | AD セット完全制圧 + Standalone 2 台 proof まで |
| スコア | 合格ラインに大きく未達 | **80 / 100** |
| 敗因 / 勝因 | **ピボットで失敗**して AD 横展開が止まった | ピボット・初期侵入・AD 横展開を徹底反復 |

---

## 自己紹介・受験前の前提知識

- **業務経験**:
  - **インフラ運用保守 9 年** — **大規模案件中心**、**Windows パッチ配信** の設計・運用も担当
  - **脆弱性診断 + プラットフォーム診断**（**2025-08 〜** / 攻撃側のキャリア開始）
- **保有資格**:
  - **情報処理安全確保支援士 (RISS)**
  - **AWS Certified Solutions Architect – Professional (SAP)**
  - **AWS Certified Security – Specialty (SCS)**
- **攻撃側の業務経験**: PEN-200 学習開始 (2024-08) よりも **約 1 年遅れて** 業務として診断に着手
- **学習開始時点で解いていた量**:
  - HTB: Easy 数台レベル
  - THM: 部分的に着手
  - Proving Grounds: 未着手

> **率直な所感**: コマンドを実行したら何が起きるか、OS の最低限の知識はわかっていた、という感じ。9 年のインフラ運用で叩き込まれた「Linux/Windows のどこに何があるか」「サービスがどう動くか」の感覚はそのまま効いた。
>
> 一方で **攻撃側のマインドセット**（権限境界をどう越えるか、認証情報をどう連鎖させるか）はゼロからで、ここに最も時間を使った。同じインフラ系出身の方には、**運用知識は確実に武器になる**と伝えたい。

### なぜ OSCP を受けようと思ったか

正直、明確なきっかけは覚えていない。多分 X (旧 Twitter) で **「OffSec のオフェンシブセキュリティ系資格があるらしい」** と流れてきたのを見て、**これは欲しい**と思った気がする。

それまで防御側の資格 (RISS / AWS Security 等) は取ってきたけれど、**「攻撃側の視点を持っている」と公的に証明できる資格** は手元になかった。インフラ運用と脆弱性診断を繋ぐためにも、OSCP は外せないと思った。

---

## 1 回目の敗因と、リベンジで鍛え直した 2 軸

### 1 回目（2025-01-06）の結果

> **AD の proof flag を 1 つ取得しただけで終了** — 合格ラインに大きく届かず不合格。

24 時間の使い方を振り返ると、敗因はピボット失敗を起点に連鎖していた：

1. **ピボットでハマった** — AD クライアントから内部ネットワークに踏み込めず、ここで数時間を溶かした
2. **AD 横展開が完全停止** — pivot が機能しないので DC への到達経路が使えず、AD セットの 40 点を取れなかった
3. **初期侵入の手数も不足** — pivot で消耗した結果、Standalone に向き直す時間と集中力が残っていなかった

つまり **ピボット失敗が起点** で、AD 横展開と Standalone の両方が連鎖的に崩壊した。CVE 知識やツールの引き出しが足りなかったのではなく、**「内側に入った後に動けるか」** が圧倒的に不足していた。

### リベンジ期間（2025-01 〜 2026-03）で変えたこと

| 鍛えた軸 | 具体的にやったこと |
|---|---|
| **ピボット**（最重要） | **chisel / ligolo-ng / sshuttle / SSH -L/-D / proxychains** の全パターンを、シナリオ別に手で構築 → ノートに「pivot レシピ集」を作成。PG Practice の **マルチホスト系**、HTB の **Pro Lab 系** で **3 段ピボット** まで通すことを目標に反復 |
| **AD 横展開** | BloodHound 収集 → kerberoast / ASREProast / DCSync / RBCD / Shadow Credentials / ADCS ESC1〜ESC8 の **全攻撃パスを手で1回ずつ実演**。HTB の AD 系 Retired (Forest, Sauna, Resolute, Monteverde, Active, Cascade, Sizzle, Mantis 等) を全 root |
| **初期侵入** | Web/SMB/SNMP/RPC など全プロトコルの列挙コマンドをチートシート化 → コピペで 5 分以内に終わる状態を作った。PG Practice / HTB の Easy〜Medium で **「foothold までを 30 分以内に取る」** タイムトライアルを反復 |

> **数字で見ると**: 1回目→2回目の **約 14 か月** で、AD 系マシンを **30 台以上** root した。Standalone 系は PG Practice TJnull リストを **80 台以上** 消化した。
>
> 振り返って思うのは、**「PEN-200 だけ」では絶対に足りない**ということ。Lab マシンの数 (66 台) では AD 横展開のバリエーションを身につけるには不足で、HTB / PG での外部反復が決定打になった。

---

## 試験当日の時間配分（実録）

> **試験枠**: 2026-03-29 10:00 〜 2026-03-30 10:00（24 時間）

| 時刻 | 経過時間 | 進捗 |
|---|---|---|
| 03/29 10:00 | 0h | 試験開始、全マシン nmap 同時投入 |
| 03/29 10:30 | 0.5h | AD クライアント侵入 → 初期 foothold |
| 03/29 12:00 | 2h | AD クライアント user.txt（10点）|
| 03/29 14:00 | 4h | AD pivot → DC 侵入 → AD 完全制圧（**40点**）|
| 03/29 14:30 | 4.5h | 軽食 + Standalone1 列挙開始 |
| 03/29 16:30 | 6.5h | Standalone1 user.txt（10点）|
| 03/29 18:00 | 8h | Standalone1 root.txt（**+10点 / 計 60点**）|
| 03/29 18:30 | 8.5h | Standalone2 列挙開始 |
| 03/29 20:30 | 10.5h | Standalone2 user.txt（10点）|
| 03/29 22:00 | 12h | Standalone2 root.txt（**+10点 / 計 80点 = 合格ライン超え**）|
| 03/29 23:30 | 13.5h | Standalone3 触るも深追いせず、スクリーンショットと残コマンド整理に切り替え |
| 03/30 03:00 | 17h | 仮眠 4h |
| 03/30 07:00 | 21h | スクショ抜け確認、必要分の追加取得 |
| 03/30 10:00 | 24h | 試験終了 |

### 試験中に効いた判断

1. **2時間ルール**: 1台に2時間進展なし → 別マシンに切り替え（戻ったら見えるパターン多数）
2. **AD は最初に取り切る**: 40点まとめて入る。Standalone でコケても合格ラインに届きやすい
3. **メモは Obsidian に IP / 認証情報 / コマンド だけ**: 文章で書かない、後でレポートで書けばいい
4. **スクリーンショットは取りすぎる**: 不足は不合格直結、過剰は無害

---

## 自作チートシート公開

実際に侵害を進める上で使っていたチートシートを公開しておきます。学習中・試験中・診断業務のいずれでも、**手が止まらないようコピペ即実行**できる粒度でまとめてあります。

> **[github.com/morimori-dev/OSCP](https://github.com/morimori-dev/OSCP)**

### 収録内容

- **Enumeration**: nmap / **feroxbuster** / smbclient / **nuclei** のフラグ込みコピペ集
- **Web**: SQLi / LFI / SSTI / 各種 CMS（WordPress, Drupal, Joomla）の検査コマンド
- **AD**: BloodHound 収集 → kerberoast → ASREProast → DCSync までのワンライナー
- **Linux PrivEsc**: linpeas を流す前にチェックすべき手筋（SUID, sudo -l, cron, capabilities）
- **Windows PrivEsc**: whoami /priv → Potato 系判定フロー、SeBackup/SeRestore/SeImpersonate 個別ガイド
- **Pivoting**: Chisel / Ligolo-ng / sshuttle のセットアップ
- **Reverse Shell**: bash / python / php / powershell すべての形式（AMSI bypass 込み）

### 設計思想

- **コピペ即実行**: `<TARGET>` `<LHOST>` `<LPORT>` のプレースホルダ統一
- **手筋順**: 上から順に流せば一通り列挙が終わる
- **試験で違反しないツールのみ**: メタスプロイトは原則含まず、検出回数制限ルール準拠

---

## これから受験する方へ

### やってよかったこと

- **[TJnull's OSCP-like list](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/) を愚直に消化**: 試験で出た手筋の 8 割がリスト内マシンと類似
- **章末エクササイズの 10 点を取る**: 当日「合格ラインまであと10点」のプレッシャーが消える
- **試験 1 週間前は新規マシンを触らない**: 復習と体調管理に専念
- **試験前日に DNS / VPN / VM のスナップショット確認**: 当日のトラブルゼロ

### やらなくてよかったこと

- **直前期に新しい教材へ手を出すこと**: 結論として **新たな学習は必要なく、Proving Grounds の内容で十分行けた**。手を広げるより PG / HTB を反復する方が効く
- **Metasploit の練習**: 試験では 1 回しか使えない。手動で取れる手筋を磨く方が効く
- **CVE 個別の暗記**: 試験は新しい CVE より「列挙不足で見落とす」方が圧倒的に多い
- **長時間の連続学習**: 1 日 4 時間 × 毎日 のほうが、週末詰め込みより成績が伸びた

### 当日のメンタル

- **AD はどうやってもどこかで詰まる**: そう割り切って、最初から **徹底的な列挙** に振り切る。手を止めず、列挙に次ぐ列挙
- **BloodHound とにらめっこ**: 取れた認証情報・セッション・ACL を全部食わせて、エッジを目で追う。攻撃パスは BloodHound のグラフが教えてくれる
- **AD で焦ったら離席して 10 分歩く**: 焦った状態の列挙は粒度が荒くなる。AD は時間をかければ取れる構造になっている
- **Standalone がハマる時間帯がある**: 諦めず列挙の粒度を 1 段下げる（rate limit 緩めて全ポート、ディレクトリ拡張子追加、ヘッダ・Cookie 検査）
- **70 点取れたら一旦止める**: 80 点狙いで詰めて全部失う事故が一番もったいない

---

## 次のステップ

次は **AV/EDR Evasion** に強い興味があるので、**OSEP (PEN-300)** を本命に据えつつ、並行して **CRTO** で **Cobalt Strike を中心としたレッドチーム運用**を鍛えていく予定です。

| 資格 | 位置付け | 自分にとっての狙い |
|---|---|---|
| **OSEP (PEN-300)** | AV/EDR バイパス + 現実的な AD 攻撃 | OSCP の次の本命。Evasion を体系的に身につける |
| **CRTO** | Cobalt Strike / レッドチームオペレーション | C2 運用、OPSEC、長期侵害シナリオの感覚を得る |
| **OSWE (WEB-300)** | ホワイトボックス Web 監査 | CVE ハンティング業務との親和性が高い |
| **HTB CPTS** | 実務寄り、AD 攻撃が深い | OSCP の補完。並行で AD バリエーションを伸ばす |

---

## 謝辞

最後に、この合格は自分一人の力では絶対に到達できなかったので、ここで深くお礼を述べさせてください。

**受験費用を負担してくれた会社へ**
PEN-200 + 試験 2 回分という決して安くない費用を快く出していただき、本当にありがとうございました。会社のサポートがなければ、リベンジの 2 回目に挑むことすら踏み切れませんでした。学んだ攻撃側の視点を、診断業務とチームの底上げにしっかり還元していきます。

**そして妻へ**
新婚で、本来なら一番一緒に過ごすべき時期に、平日の深夜まで PC に向かい、土日もほぼ全部を学習に充てさせてもらいました。それを一度も嫌な顔をせず、むしろ「やりたいことをやれ」と背中を押し続けてくれたこと、本当に感謝しています。これは紛れもなくあなたとの合格です。

これから OSEP / CRTO とまだ挑戦は続きますが、家族との時間も大切にしながら一歩ずつ前に進んでいきます。

---

## 参考リンク

- [OffSec PEN-200 公式](https://www.offsec.com/courses/pen-200/)
- [TJnull's OSCP-like List (NetSecFocus)](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/)
- [Proving Grounds Practice](https://www.offsec.com/labs/individual/)
- [HackTheBox](https://www.hackthebox.com/)
- [自作チートシート (本記事)](https://github.com/morimori-dev/OSCP)
