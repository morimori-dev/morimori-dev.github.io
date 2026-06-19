---
title: "HackTheBox Sherlock - Unit42 (DFIR)"
date: 2026-06-19
description: "HackTheBox Sherlock Unit42 解説。たった1つの Sysmon イベントログから、二重拡張子マルウェア・タイムスタンプ改ざん・到達性チェック・C2通信・バックドア化された UltraVNC までの感染チェーンを再構築する。"
categories: [HackTheBox, Sherlock]
tags: [hackthebox, sherlock, dfir, blue-team, sysmon, windows, event-logs, malware-analysis, incident-response, time-stomping, threat-hunting, mitre-attack]
mermaid: true
content_lang: ja
alt_en: /posts/htb-sherlock-unit42/
---

## シナリオ

Unit42 は HackTheBox の *Sherlock*（防御・DFIR 系チャレンジ）で難易度 **Very Easy**。マシンを攻略するのではなく、侵害された Windows ホストのフォレンジック証跡を渡され、攻撃者が何をしたかを再構築する。

> *「DFIR チャレンジ・シリーズの第1弾。提供される証跡を通じて Sysmon ログと Windows イベント解析に慣れることが目的。従業員が不審な挙動を報告し、調査用に Sysmon ログが与えられる。」*

| 項目 | 内容 |
|---------------------------|-------|
| プラットフォーム | HackTheBox — Sherlock |
| カテゴリ | DFIR / エンドポイントログ解析 |
| 難易度 | Very Easy |
| 証跡 | `Microsoft-Windows-Sysmon-Operational.evtx` |
| 必要スキル | Sysmon イベントID、プロセスツリー、防御回避の発見、C2 特定 |

## 提供される証跡

ファイルは1つだけ:

- `Microsoft-Windows-Sysmon-Operational.evtx` — 被害ホストからエクスポートされた System Monitor (Sysmon) の運用ログ。

物語を語るのに必要なものは、この1ファイルの中にすべて入っている。本チャレンジは要するに **Sysmon を正しく読む**演習である。

## 使用ツール

以下のいずれでも `.evtx` を解析できる。好みで選べばよい:

- **EvtxECmd**（Eric Zimmerman）→ CSV 変換 → **Timeline Explorer** で閲覧
- **Windows イベントビューア**（標準）+ Event ID ごとのカスタム XPath フィルタ
- 大量解析なら **Chainsaw** / **Hayabusa** によるルールベースの Sysmon ハンティング

```bash
# Eric Zimmerman の EvtxECmd: evtx -> CSV にして Timeline Explorer でトリアージ
EvtxECmd.exe -f Microsoft-Windows-Sysmon-Operational.evtx --csv . --csvf unit42.csv
```

💡 なぜ有効か  
Sysmon は生の Windows イベントに、レスポンダーが本当に必要とするフィールド（完全なコマンドライン、イメージのハッシュ、親プロセス、ネットワークの宛先）を付加してくれる。先に `.evtx` をタイムライン化しておけば、以降の問いはすべて「探索」ではなく「フィルタ」になる。

## 押さえるべき Sysmon Event ID

調査のほとんどは「正しい Event ID で絞り込み、フィールドを読む」だけで進む。関係するもの:

| Event ID | 意味 | ここでの重要性 |
|---|---|---|
| 1 | プロセス生成 | コマンドライン・ハッシュ・親プロセス → 悪性バイナリの特定 |
| 2 | プロセスがファイル作成時刻を変更 | **タイムスタンプ改ざん(time stomping)の決定的シグナル** |
| 3 | ネットワーク接続 | 送信元/宛先 IP とポート → C2 通信 |
| 5 | プロセス終了 | ドロッパーの活動時間を区切る(自己終了) |
| 11 | ファイル作成 | ドロッパーがディスクに書き込んだファイル |
| 22 | DNS クエリ | マルウェアが名前解決したドメイン |

## 調査

### Event ID 11 のイベントログは何件あるか？

ログを `EventID = 11`（FileCreate）で絞り込み、件数を数える。

**答え:** `56`

💡 なぜ有効か  
FileCreate の件数をまず数えると、ドロッパーがディスク上でどれだけ「騒がしい」かが一目で分かる。クリック1回で数十ファイルが書き込まれている時点で、マルウェア名を特定する前から強い感染指標になる。

### 被害システムに感染した悪性プロセスは何か？

`EventID = 1`（プロセス生成）に移り、`Image` / `CommandLine` フィールドを精査する。**二重拡張子**になっているエントリが即座に目につく — 実行ファイルを文書に見せかける古典的な手口だ。

**答え:** `C:\Users\CyberJunkie\Downloads\Preventivo24.02.14.exe.exe`

💡 なぜ有効か  
`*.exe.exe` は明白な危険信号だ。Windows は既定で既知の拡張子を隠すため、被害者には `Preventivo24.02.14.exe` としか見えず、通常のファイルだと思い込む。`\Downloads\` からの実行に加え、イタリア語の囮名（*preventivo* =「見積もり」）はソーシャルエンジニアリングによる配送を強く示唆する。（MITRE ATT&CK **T1036.007 — Masquerading: Double File Extension**）

### マルウェアの配布に使われたクラウドドライブは？

囮ファイルは、評価ベースの制御をすり抜けるために正規のファイルホスティングサービスから配信された。

**答え:** `Dropbox`

💡 なぜ有効か  
攻撃者は信頼された SaaS ストレージ（Dropbox、Google Drive、OneDrive）を悪用する。ダウンロード元が高評価ドメインになるため、プロキシや URL フィルタにブロックされにくい。（MITRE ATT&CK **T1105 — Ingress Tool Transfer**、信頼された Web サービス経由）

### マルウェアは PDF にタイムスタンプ改ざんを行った。変更後の値は？

タイムスタンプ改ざんはファイルの作成時刻を書き換え、古い正規ファイルに紛れ込ませる手口。Sysmon はこれを **Event ID 2**（「プロセスがファイル作成時刻を変更した」）として記録する。これで絞り込み、PDF に適用された新しい値を読む。

**答え:** `2024-01-14 08:10:06`

💡 なぜ有効か  
Event ID 2 は、アナリストが*アンチフォレンジックの直接的証拠*を得られる数少ない場所の1つだ。ドロッパーはファイルを過去日付に偽装し、作成時刻でソートするレスポンダーの目を素通りさせる。そもそも EID 2 が存在すること自体が怪しい — 正規ソフトが作成時刻を書き換えることはまずない。（MITRE ATT&CK **T1070.006 — Timestomp**）

### `once.cmd` はディスク上のどこに作成されたか？（フルパス）

`EventID = 11` を `TargetFilename` の `once.cmd` で絞り込む。

**答え:**

```text
C:\Users\CyberJunkie\AppData\Roaming\Photo and Fax Vn\Photo and vn 1.1.2\install\F97891C\WindowsVolume\Games\once.cmd
```

💡 なぜ有効か  
深くネストしたもっともらしい `AppData\Roaming\...` パスは、無害なインストール済みアプリに見せかけるためのもの。`AppData\Roaming` 配下へのバッチ/スクリプト配置は、再起動後も残り注目されにくい、よくあるステージング/永続化の場所だ。

### マルウェアは到達性確認のためにダミードメインへ接続を試みた。そのドメインは？

`EventID = 22`（DNS クエリ）を、悪性プロセスが発行したクエリで絞り込む。

**答え:** `www.example.com`

💡 なぜ有効か  
マルウェアは本物のインフラに接触する前に、必ず稼働している「カナリア」ドメインをまず名前解決し、インターネット接続があるかを確認することが多い — 安価なサンドボックス/エアギャップ確認だ。`www.example.com` は IANA 予約ドメインで、到達性プローブに最適。

### 悪性プロセスが接続を試みた IP アドレスは？

`EventID = 3`（ネットワーク接続）を悪性プロセスで絞り込む。

**答え:** `93.184.216.34`

💡 なぜ有効か  
`93.184.216.34` は長らく `example.com` の公開 IP だった — 上の DNS クエリが解決され、ホストが実際に外向き通信したことを裏付ける。EID 22（解決の意図）と EID 3（実際の接続）を対にすることで、単なる DNS 試行ではなく、ビーコンが実際に外へ出たことを証明できる。

### プロセスが自分自身を終了したのはいつか？

ドロッパーはペイロード — バックドア化された **UltraVNC** — を仕込んだ後、後始末をする。`EventID = 5`（プロセス終了）を悪性イメージで絞り込む。

**答え:** `2024-02-14 03:41:58`

💡 なぜ有効か  
本物のインプラントを落とした後の自己終了は意図的だ。騒がしく短命なドロッパーが終了し、静かで正規に見える UltraVNC サービスだけがリモートアクセス用に残る。EID 5 を捉えれば、ドロッパーの活動時間を正確に区切れる。

## 攻撃タイムライン

| 時刻 (UTC) | 段階 | 証跡 |
|---|---|---|
| — | 配送 | `Preventivo24.02.14.exe.exe` を **Dropbox** から `\Downloads\` にダウンロード |
| (クリック時) | 実行 | Sysmon **EID 1** — 二重拡張子バイナリが `CyberJunkie` として実行 |
| 2024-01-14 08:10:06 | 防御回避 | Sysmon **EID 2** — PDF の作成時刻を過去日付に改ざん |
| (ドロップ) | ステージング | Sysmon **EID 11** — `AppData\Roaming` 配下の `once.cmd` を含む 56 ファイルを書き込み |
| (ビーコン) | 到達性確認 | Sysmon **EID 22** — DNS `www.example.com` |
| (ビーコン) | C2 通信 | Sysmon **EID 3** — `93.184.216.34` へ接続 |
| — | インプラント | バックドア化された **UltraVNC** をリモートアクセス用に設置 |
| 2024-02-14 03:41:58 | 後始末 | Sysmon **EID 5** — ドロッパーが自己終了 |

```mermaid
flowchart LR
    subgraph DELIVERY["📥 Delivery"]
        direction TB
        D1["Dropbox download"] --> D2["Preventivo24.02.14.exe.exe<br/>(double extension)"]
    end
    subgraph EXEC["💥 Execution / Evasion"]
        direction TB
        E1["User runs the EXE<br/>Sysmon EID 1"] --> E2["Drops 56 files<br/>incl once.cmd (EID 11)"]
        E2 --> E3["Time-stomps PDF<br/>2024-01-14 (EID 2)"]
    end
    subgraph BEACON["🌐 Connectivity / C2"]
        direction TB
        B1["DNS www.example.com<br/>EID 22"] --> B2["Connect 93.184.216.34<br/>EID 3"]
    end
    subgraph IMPLANT["🛠️ Implant / Cleanup"]
        direction TB
        I1["Backdoored UltraVNC installed"] --> I2["Dropper self-terminates<br/>2024-02-14 03:41:58 (EID 5)"]
    end
    DELIVERY --> EXEC --> BEACON --> IMPLANT
    style D2 fill:#ff6b6b
    style E3 fill:#ffd43b
    style I1 fill:#ff6b6b
    style I2 fill:#51cf66
```

## 検知と防御（ブルーチーム）

もっと早く捕捉するには:

- **二重拡張子にアラートを出す**（`*.exe.exe`、`*.pdf.exe`）。特に `\Downloads\` や `\AppData\` からの実行パス。
- **Sysmon Event ID 2 を高シグナルとして扱う。** 正規ソフトが作成時刻を書き換えることはまずないため、EID 2 へのルールは極めて低ノイズでタイムスタンプ改ざんを浮かび上がらせる。
- **外向き通信をベースライン化する。** ワークステーションが `www.example.com` を解決して即座に外へ出るのは異常。カナリアドメインの参照は安価なハンティングの起点になる。
- **信頼された SaaS 経由の配送を監視する。** Dropbox/Drive/OneDrive 由来の実行ファイルのダウンロードは、評価による無条件パスではなく内容検査に値する。
- **強力な Sysmon 構成を導入する**（SwiftOnSecurity / Olaf Hartong `sysmon-modular` など）。EID 1/2/3/11/22 をコマンドラインとハッシュ込みで取得する。

## まとめ

- 適切に構成された **Sysmon** ログ1つで、配送・実行・回避・C2・後始末という感染チェーン全体を再構築できる。
- **二重拡張子**と **Event ID 2（タイムスタンプ改ざん）** は、防御側が持つ最も高シグナル・低ノイズな指標の2つ。
- 何かを「C2」と断定する前に、必ず **DNS（EID 22）** と **実際の接続（EID 3）** を突き合わせること。
- 調査しながら所見を **MITRE ATT&CK** にマッピングすると、散らばった証跡が説明可能な物語になる。

## 参考文献

- HackTheBox Sherlock: Unit42 — <https://app.hackthebox.com/sherlocks>
- Sysmon (Sysinternals) — <https://learn.microsoft.com/sysinternals/downloads/sysmon>
- Eric Zimmerman's Tools (EvtxECmd / Timeline Explorer) — <https://ericzimmerman.github.io/>
- SwiftOnSecurity sysmon-config — <https://github.com/SwiftOnSecurity/sysmon-config>
- MITRE ATT&CK: T1036.007 (Double Extension), T1070.006 (Timestomp), T1071 (C2)
