---
title: "HackTheBox Sherlock - BFT (DFIR)"
date: 2026-06-19
description: "HackTheBox Sherlock BFT 解説。NTFS の $MFT だけから侵害を再構築する — Zone.Identifier(Mark-of-the-Web)の IOC、$STANDARD_INFORMATION と $FILE_NAME のタイムスタンプ、MFT レコードの hex オフセット、MFT resident ファイルからの C2 復元。"
categories: [HackTheBox, Sherlock]
tags: [hackthebox, sherlock, dfir, blue-team, ntfs, mft, forensics, zone-identifier, mark-of-the-web, timestamps, mftecmd, incident-response, mitre-attack]
mermaid: true
content_lang: ja
alt_en: /posts/htb-sherlock-bft/
---

## シナリオ

BFT は HackTheBox の *Sherlock*(防御・DFIR 系)で難易度 **Very Easy**。侵害されたワークステーションの **NTFS `$MFT` だけ**を渡され、この1つの証跡から侵害を再構築する。

> *「Simon Stark は 2 月 13 日に攻撃を受けた。メールで届いたリンクから ZIP ファイルをダウンロードした。SOC アナリストとして、提供された `$MFT` を調査し、ホストがどう侵害されたかを答えよ。」*

| 項目 | 内容 |
|---------------------------|-------|
| プラットフォーム | HackTheBox — Sherlock |
| カテゴリ | DFIR / NTFS ファイルシステム・フォレンジック |
| 難易度 | Very Easy |
| 証跡 | `$MFT` (NTFS Master File Table) |
| 必要スキル | MFT 解析、Zone.Identifier/MotW、NTFS タイムスタンプ、MFT resident ファイル |

## 提供される証跡

ファイルは1つだけ:

- `$MFT` — 被害ホストの NTFS **Master File Table**(本問は約 307 MB、171,927 FILE レコード)。

調査はすべてこの1構造から行う。`$MFT` だけでも侵害がどれだけ保全されているかを学べる問題。

## 使用ツール

- **MFTECmd**(Eric Zimmerman) — `$MFT` を CSV に解析
- **Timeline Explorer**(Eric Zimmerman) — CSV をソート/フィルタ
- **hex エディタ**(HxD, `xxd`, `hexedit`) — MFT resident ファイルの内容を読む
- (任意) **MFT Explorer** — MFT の対話的閲覧

```powershell
# $MFT を CSV タイムラインに解析
MFTECmd.exe -f '.\$MFT' --csv . --csvf mft.csv
# -> FILE records found: 171,927 ; CSV saved to .\mft.csv
```

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — `$MFT` は NTFS が持つ「ボリューム上の全ファイルの索引」で、1ファイルにつき約 1 KB のレコードに、名前・親パス・サイズ・複数のタイムスタンプ群が収まっている。*削除済み*ファイルでもレコードが残ることが多い。タイムライン化すれば「MFT しかない」状態が、ディスクに触れた事象のほぼ完全な地図に変わる。

## 前提: 押さえるべき NTFS の概念

| 概念 | 何か | ここでの重要性 |
|---|---|---|
| `$MFT` レコード | 1ファイル = 固定 **1024 バイト** | レコード番号 × 1024 = バイトオフセット |
| `Zone.Identifier` (ADS) | Mark-of-the-Web の代替データストリーム | ダウンロード元の `HostUrl`/`ReferrerUrl` を保持 → IOC |
| `$STANDARD_INFORMATION` (0x10) | エクスプローラ表示のタイムスタンプ | 改ざん(time stomp)が容易 |
| `$FILE_NAME` (0x30) | カーネルが設定するタイムスタンプ | 偽装が難しい → 0x10 と突き合わせる |
| MFT resident ファイル | 約 1024 B 未満のファイルは MFT レコード**内**に格納 | 小さな悪性スクリプトの内容を `$MFT` から直接復元 |

## 調査

<h2 id="q1" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q1. What was the name of the ZIP file Simon downloaded from the link?</h2>

`mft.csv` を Timeline Explorer で開き、2024-02-13 前後のユーザー `Downloads` を見る。ダウンロードされた書庫が目立つ。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
Stage-20240213T093324Z-001.zip
```

![Timeline Explorer — MFTタイムライン上のダウンロードされた Stage ZIP](/assets/img/htb/sherlock-bft/bft-01-zip-download.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — 報告された日付付近を作成時刻でソートすると、最初のダウンロードが活動の山の先頭に来る。`Stage-...zip`(Google ドライブの一括エクスポート命名パターン)がチェーンの最初のリンクだと分かる。

<h2 id="q2" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q2. What is the full Host URL the ZIP was downloaded from? (Zone.Identifier)</h2>

ダウンロードされたファイルは `Zone.Identifier` **代替データストリーム**(Mark-of-the-Web)を持つ。MFTECmd がこれを抽出するので `HostUrl` を読む。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
https://storage.googleapis.com/drive-bulk-export-anonymous/20240213T093324.039Z/4133399871716478688/a40aecd0-1cf3-4f88-b55a-e188d5c1c04f/1/c277a8b4-afa9-4d34-b8ca-e1eb5e5f983c?authuser
```

![MFTから復元した Zone.Identifier の HostUrl（Mark-of-the-Web）](/assets/img/htb/sherlock-bft/bft-02-zone-identifier.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — Mark-of-the-Web はディスク上で最も価値の高い IOC の1つ。Windows はインターネットから落としたファイルに取得元 URL を `Zone.Identifier` ADS で付与する。これは `$MFT` に残り、ペイロードが*どこから*来たか(ここでは Google Cloud Storage の一括エクスポートリンク)を証明する — IOC 横展開やメールゲートウェイ調査の金脈。(MITRE ATT&CK **T1566 — Phishing**、後続 **T1059**)

<h2 id="q3" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q3. What is the full path and name of the malicious file that executed code and connected to C2?</h2>

ZIP からユーザー `Downloads` 配下に展開された内容を辿る。1つが、欺瞞的に深くネストした `invoice` パスのバッチスクリプトだ。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
c:\Users\simon.stark\Downloads\Stage-20240213T093324Z-001\Stage\invoice\invoices\invoice.bat
```

![ネストした Downloads パス配下の悪性 invoice.bat](/assets/img/htb/sherlock-bft/bft-03-invoice-bat.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — 二重にネストした `invoice\invoices\` フォルダと、請求書を装った `.bat` は典型的な囮の構造。拡張子＋場所＋タイミング(ZIP 書き込み直後)で実行された stager を特定できる。(MITRE ATT&CK **T1204 — User Execution**)

<h2 id="q4" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q4. What is the <code>$Created0x30</code> timestamp of that file (when was it created on disk)?</h2>

`invoice.bat` の **`$FILE_NAME` (0x30)** 作成タイムスタンプ(列 `Created0x30`)を読む。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
2024-02-13 16:38:39
```

![invoice.bat の SI(0x10) と FN(0x30) タイムスタンプ](/assets/img/htb/sherlock-bft/bft-04-timestamps.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — NTFS は2組のタイムスタンプを持つ: `$STANDARD_INFORMATION`(0x10、エクスプローラ表示、改ざん容易)と `$FILE_NAME`(0x30、カーネル管理、偽装困難)。0x10 と 0x30 の比較が time stomping 検出の定石で、0x30 の作成時刻こそ*信頼できる*ディスク上の作成時点。

<h2 id="q5" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q5. What is the hex offset of the stager's MFT record?</h2>

各 MFT レコードは **1024 バイト**なので、レコードのバイトオフセット = **エントリ番号 × 1024** を16進数で表したもの。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
16E3000
```

![invoice.bat の MFT エントリ 23436 詳細](/assets/img/htb/sherlock-bft/bft-05-hex-offset.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — `0x16E3000 = 23,998,464 = 23,436 × 1024` — つまり `invoice.bat` は MFT エントリ **23436**。オフセットが分かれば、CSV では完全に描画されない属性(次問)を見るために、hex エディタで生レコードへ直接ジャンプできる。

<h2 id="q6" style="background:rgba(255,159,67,.16);border-left:5px solid #ff9f43;border-radius:6px;padding:.5rem .85rem;margin:2.5rem 0 1rem;">Q6. What is the C2 IP and port recovered from the stager's content? (MFT-resident file)</h2>

`invoice.bat` は小さい(約 1024 B 未満)ため **resident**: 外部クラスタではなく自分の MFT レコード内に格納される。hex エディタで `$MFT` のオフセット `0x16E3000` へシークし `$DATA` 属性を読むと、スクリプト本体(と C2 エンドポイント)がそこにある。

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/></svg> **答え**

```text
43.204.110.203:6666
```

![invoice.bat の resident $DATA が C2 エンドポイントを露出](/assets/img/htb/sherlock-bft/bft-06-c2-resident.png)

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/></svg> **解説** — 1024 バイトレコードの空きに収まるサイズのファイルは、NTFS が内容を MFT エントリの `$DATA` 属性に **resident** 格納する。よってディスクにファイル本体が無く、メモリ取得が無くても、小さな悪性スクリプトを `$MFT` から直接復元できる。これだけで C2 `43.204.110.203:6666` が得られる。(MITRE ATT&CK **T1071 — Application Layer Protocol / C2**)

## 攻撃タイムライン

| 時刻 (UTC) | 段階 | 証跡 |
|---|---|---|
| 2024-02-13 | フィッシング | メールのリンク → Google ドライブ一括エクスポート URL から `Stage-20240213T093324Z-001.zip`(Zone.Identifier) |
| 2024-02-13 16:38:39 | ステージング | `...\Downloads\Stage...\Stage\invoice\invoices\` に `invoice.bat` 書き込み($FN 作成 0x30) |
| (実行時) | 実行 | `invoice.bat` を実行(User Execution) |
| (ビーコン) | C2 | .bat の resident `$DATA` から `43.204.110.203:6666` へのビーコンが判明 |

```mermaid
flowchart LR
    DELIVERY --> EXEC --> FORENSICS --> C2OUT

    subgraph DELIVERY["配送"]
        direction TB
        D1["フィッシングメールのリンク"]
        D2["Stage-20240213T093324Z-001.zip (Google ドライブ一括エクスポート)"]
        D3["Zone.Identifier ADS（Mark-of-the-Web）"]
        D1 --> D2 --> D3
    end

    subgraph EXEC["実行"]
        direction TB
        E1["\\Downloads\\ 配下に展開"]
        E2["invoice\\invoices\\invoice.bat ($FN 2024-02-13 16:38:39)"]
        E3["SI(0x10) ≠ FN(0x30) → タイムスタンプ改ざん"]
        E1 --> E2 --> E3
    end

    subgraph FORENSICS["MFT フォレンジック"]
        direction TB
        F1["MFT エントリ 23436 / オフセット 0x16E3000"]
        F2["resident $DATA (1024B 未満 → $MFT 内に格納)"]
        F1 --> F2
    end

    subgraph C2OUT["C2"]
        direction TB
        C1["ビーコン → 43.204.110.203:6666"]
    end
```

## 証跡 → IOC → ATT&CK 関係図

<!-- DFIR 関係図 (hokkaido 図B 流): 丸数字①〜⑤=各設問の証跡。矢印は 実線=フロー / 太線=IOC抽出(強調) / 点線=ATT&CK対応。値は省略しない。 -->
```mermaid
flowchart TB
    ANALYST["アナリスト — $MFT のみ"]

    subgraph EVID["MFT 証跡"]
        direction LR
        V1["① Stage-20240213T093324Z-001.zip"]
        V2["② Zone.Identifier (ADS)"]
        V3["③ invoice.bat"]
        V4["④ $SI(0x10) vs $FN(0x30)"]
        V5["⑤ エントリ 23436 / resident $DATA"]
    end

    subgraph IOCS["IOC"]
        direction LR
        O1["https://storage.googleapis.com/drive-bulk-export-anonymous/<br/>20240213T093324.039Z/4133399871716478688/<br/>a40aecd0-1cf3-4f88-b55a-e188d5c1c04f/1/<br/>c277a8b4-afa9-4d34-b8ca-e1eb5e5f983c?authuser"]
        O2["c:\\Users\\simon.stark\\Downloads\\Stage-20240213T093324Z-001\\<br/>Stage\\invoice\\invoices\\invoice.bat"]
        O3["C2 43.204.110.203:6666"]
    end

    subgraph ATTACK["MITRE ATT&CK"]
        direction LR
        T1["T1566 Phishing"]
        T2["T1204 User Execution"]
        T3["T1070.006 Timestomp"]
        T4["T1071 C2"]
    end

    ANALYST -->|"MFTECmd → Timeline Explorer"| V1
    V1 -->|"MotW を読む"| V2
    V2 ==>|"抽出"| O1
    V1 --> V3
    V3 ==>|"フルパス"| O2
    V3 --> V4
    V4 -.-|"time stomp"| T3
    V3 --> V5
    V5 ==>|"hex @ 0x16E3000"| O3
    O1 -.- T1
    O2 -.- T2
    O3 -.- T4
```

## 検知と防御（ブルーチーム）

もっと早く捕捉するには:

- **`Downloads`/`Temp` の実行ファイル・スクリプトの Zone.Identifier を狩る** — `HostUrl`(MotW)付きの `.bat`/`.js`/`.hta` は高シグナルのフィッシング痕跡。
- **MFT トリアージで 0x10 と 0x30 を突き合わせ**、time stomping を自動的に検出する。
- **書庫で配送されるスクリプトをブロック/検査**(`.zip` → `.bat`/`.cmd`/`.js`)。MotW を回避するコンテナはメールゲートウェイで除去。
- **生 IP への外向き通信を制限・アラート**(`43.204.110.203:6666` のようなドメイン無し・高ポート)。ワークステーションからの裸 IP ビーコンは異常。
- **`$MFT`(と `$J`/UsnJrnl)をトリアージで採取**(KAPE/Velociraptor)。最小限の証跡でもチェーンを再構築できる。

## まとめ

- **`$MFT` だけ**で、配送 → 実行 → C2 という侵害を再構築できる。
- **Zone.Identifier (Mark-of-the-Web)** はダウンロード元 URL を保全する最上位級の IOC。
- **`$FILE_NAME` (0x30)** タイムスタンプは、改ざんされた `$STANDARD_INFORMATION` (0x10) に対する信頼できる突き合わせ材料。
- MFT レコードは **1024 バイト**(オフセット = エントリ × 1024)で、小さいファイルは `$DATA` に **resident** 格納される — その内容と C2 を MFT から直接復元できる。

## 参考文献

- HackTheBox Sherlock: BFT — <https://app.hackthebox.com/sherlocks>
- MFTECmd / Timeline Explorer (Eric Zimmerman) — <https://ericzimmerman.github.io/>
- Microsoft — NTFS Master File Table (MFT) — <https://learn.microsoft.com/windows/win32/fileio/master-file-table>
- Mark-of-the-Web / Zone.Identifier — <https://learn.microsoft.com/openspecs/windows_protocols/ms-fscc/>
- MITRE ATT&CK: T1566 (Phishing), T1204 (User Execution), T1070.006 (Timestomp), T1071 (C2)
