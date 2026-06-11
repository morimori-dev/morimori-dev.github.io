---
layout: page
title: "Active Directory 攻撃ロードマップ"
permalink: /ja/topics/active-directory/
description: "Active Directory ペンテストの学習ロードマップ。列挙、NetExec、Kerberos、AD CS、NTLM Relay、BloodHound、Mimikatz、secretsdump.py、ラテラルムーブメントを読む順番で整理。"
content_lang: ja
alt_en: /en/topics/active-directory/
---

このページは、サイト内の Active Directory 関連記事を読むための入口です。許可されたラボや診断を前提に、列挙、認証情報の検証、攻撃経路分析、個別手法、報告までの順番で整理しています。

## 読む順番

| 順番 | トピック | 目的 |
|---|---|---|
| 1 | [Active Directory 列挙チェックリスト](/ja/posts/tech-active-directory-enumeration-checklist/) | ノイズの高い操作の前にドメイン構造を把握する。 |
| 2 | [NetExecコマンドチートシート](/ja/posts/tech-netexec-beginner-guide/) | SMB、LDAP、WinRM、パスワードスプレー、アクセス確認を整理する。 |
| 3 | [Kerberos OSCP 攻撃テクニック](/ja/posts/tech-kerberos-oscp-guide/) | Kerberoasting、AS-REP roasting、チケット、信頼境界を理解する。 |
| 4 | [GetNPUsers.py を深掘りしてみた](/ja/posts/tech-getnpusers-asrep-roasting/) | AS-REP roastable ユーザーのリスクを確認する。 |
| 5 | [GetUserSPNs.py を深掘りしてみた](/ja/posts/tech-getuserspns-kerberoasting/) | SPN アカウントと Kerberoasting の流れを整理する。 |
| 6 | [BloodHound Attack Pathチートシート](/ja/posts/tech-bloodhound-attack-paths/) | 収集データを攻撃経路と修正優先度に変換する。 |
| 7 | [AD CS ESC攻撃まとめ](/ja/posts/tech-adcs-esc-attack-guide/) | 証明書サービスの攻撃面を理解する。 |
| 8 | [Certipyを深掘りしてみた](/ja/posts/tech-certipy-adcs-attack/) | ESC1、ESC8、Shadow Credentials などを実践的に確認する。 |
| 9 | [ntlmrelayx.pyを深掘りしてみた](/ja/posts/tech-ntlmrelayx-attack-guide/) | SMB Signing、LDAP Relay、RBCD、AD CS ESC8 をつなげて理解する。 |
| 10 | [RBCD 攻撃ガイド](/ja/posts/tech-rbcd-attack-guide/) | 委任設定の悪用と報告観点を整理する。 |
| 11 | [secretsdump.pyガイド](/ja/posts/tech-secretsdump-guide/) | DCSync、NTDS.dit、SAM、LSA Secrets の確認観点を整理する。 |
| 12 | [Mimikatzコマンドチートシート](/ja/posts/tech-mimikatz-guide/) | LSASS、Kerberosチケット、Pass-the-Hash、DCSync の出力を理解する。 |
| 13 | [ラテラルムーブメントまとめ](/ja/posts/tech-lateral-movement-guide/) | 認証情報検証から制御された横展開へ進む。 |
| 14 | [Windows権限昇格まとめ](/ja/posts/tech-windows-privesc-summary/) | ホスト権限昇格をドメイン侵害経路につなげて整理する。 |

## 目的別の最短ルート

| 状況 | 最初に読む | 次に読む |
|---|---|---|
| ドメインユーザーを1つ得た | [AD列挙チェックリスト](/ja/posts/tech-active-directory-enumeration-checklist/) | [NetExec](/ja/posts/tech-netexec-beginner-guide/)、[BloodHound](/ja/posts/tech-bloodhound-attack-paths/) |
| SMB Signing 無効ホストを見つけた | [ntlmrelayx.py](/ja/posts/tech-ntlmrelayx-attack-guide/) | [AD CS](/ja/posts/tech-adcs-esc-attack-guide/)、[Certipy](/ja/posts/tech-certipy-adcs-attack/) |
| SPN や preauth の問題を見つけた | [Kerberos攻撃](/ja/posts/tech-kerberos-oscp-guide/) | [GetUserSPNs.py](/ja/posts/tech-getuserspns-kerberoasting/)、[GetNPUsers.py](/ja/posts/tech-getnpusers-asrep-roasting/) |
| ローカル管理者権限や複製権限がある | [secretsdump.py](/ja/posts/tech-secretsdump-guide/) | [Mimikatz](/ja/posts/tech-mimikatz-guide/)、[ラテラルムーブメント](/ja/posts/tech-lateral-movement-guide/) |
| 報告書向けに整理したい | [BloodHound](/ja/posts/tech-bloodhound-attack-paths/) | [AD CS](/ja/posts/tech-adcs-esc-attack-guide/)、[Windows権限昇格](/ja/posts/tech-windows-privesc-summary/) |

## 実践フロー

1. スコープ、ドメイン名、ドメインコントローラ、許可された検証時間を確認する。
2. DNS、SMB、LDAP、Kerberos、WinRM、MSSQL、AD CS の露出を列挙する。
3. スプレーや認証試行の前に、パスワードポリシーとロックアウト条件を確認する。
4. 失敗回数を制限しながら認証情報を検証し、どこで通るかを記録する。
5. BloodHound データを収集し、影響度の高い経路から優先度を付ける。
6. 1つの攻撃経路ごとに、低影響の証跡から確認する。
7. 各結果を、ポリシー、ACL、委任、証明書テンプレート、資格情報管理、監視の改善に落とし込む。

## 関連Writeup

AD風の列挙や資格情報ワークフローの補助として読みやすい記事です。

- [HackTheBox - Forest](/ja/posts/htb-forest/)
- [HackTheBox - Active](/ja/posts/htb-active/)
- [HackTheBox - Fluffy](/ja/posts/htb-fluffy/)
- [Proving Grounds - Nara](/ja/posts/pg-nara/)
- [Proving Grounds - Nagoya](/ja/posts/pg-nagoya/)
- [Proving Grounds - hokkaido](/ja/posts/pg-hokkaido/)
- [Proving Grounds - Vault](/ja/posts/pg-vault/)
- [Proving Grounds - Resourced](/ja/posts/pg-resourced/)
