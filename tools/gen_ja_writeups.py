#!/usr/bin/env python3
"""
Generate Japanese (JA) versions of all English-only writeup posts.
Also updates EN posts to add content_lang: en and alt_ja front matter.
"""
import os
import re
import sys

POSTS_DIR = os.path.join(os.path.dirname(__file__), "..", "_posts")

# ── Section header translations ───────────────────────────────────────────────
SECTION_MAP = [
    ("## Overview", "## 概要"),
    ("## Reconnaissance", "## 偵察"),
    ("## Initial Foothold", "## 初期足がかり"),
    ("## Privilege Escalation", "## 権限昇格"),
    ("## Credentials", "## 認証情報"),
    ("## Lessons Learned / Key Takeaways", "## まとめ・学んだこと"),
    ("## References", "## 参考文献"),
    ("## Mermaid Attack Flow", "## 攻撃フロー"),
]

# ── Inline phrase translations ─────────────────────────────────────────────────
PHRASE_MAP = [
    # Boilerplate long sentence
    (
        "At this stage, the following command(s) are executed to progress the attack chain "
        "and validate the next hypothesis. We are specifically looking for actionable "
        "indicators such as open services, exploitability, credential exposure, or "
        "privilege boundaries. Key flags and parameters are preserved to keep the "
        "workflow reproducible for follow-along testing.",
        "攻撃チェーンを進め、次の仮説を検証するために以下のコマンドを実行します。"
        "オープンサービス、悪用可否、認証情報の露出、権限境界などの指標を確認します。"
        "コマンドとパラメータはそのまま記録し、追試できる形を維持します。"
    ),
    ("💡 Why this works", "💡 なぜ有効か"),
    ("*Caption: Screenshot captured during this stage of the assessment.*",
     "*キャプション：このフェーズで取得したスクリーンショット*"),
    ("No credentials obtained.", "認証情報なし。"),
    ("Not specified", "記録なし"),
    ("Not documented in the available source notes", "ソース資料に記録なし"),
    # Placeholder-post-specific
    (
        "The original Obsidian note includes section placeholders for RustScan and Nmap, "
        "but no recorded commands or scan output were saved. Because no raw enumeration logs "
        "are available, service-level findings cannot be reconstructed reliably from the source "
        "material. This article is published as a structured placeholder to preserve tracking "
        "continuity for the machine.",
        "元の Obsidian ノートには RustScan と Nmap のセクション見出しのみが含まれており、"
        "コマンドやスキャン出力は記録されていません。"
        "列挙ログがないため、サービスレベルの調査結果を信頼性高く再現できません。"
        "このライトアップは機械の追跡継続性を保つための構造化プレースホルダーとして公開しています。"
    ),
    (
        "No initial access logs were saved in the source writeup. As a result, the entry "
        "vector, exploit chain, and validation commands are currently unknown.",
        "ソースのライトアップに初期アクセスのログが保存されていません。"
        "侵入経路、エクスプロイトチェーン、検証コマンドは現時点では不明です。"
    ),
    (
        "No privilege escalation notes or command history were present in the source file. "
        "There is no confirmed local enumeration output, misconfiguration evidence, or "
        "root-level command transcript available for publication.",
        "ソースファイルに権限昇格のメモやコマンド履歴がありません。"
        "ローカル列挙の出力、設定ミスの証拠、root 権限取得のコマンド記録が確認できません。"
    ),
    (
        "💡 Why this works\n"
        "Keeping a structured placeholder prevents duplicated effort and makes it clear "
        "which targets still need full evidence capture. In red team workflows, documenting "
        "gaps explicitly is better than backfilling assumptions that cannot be verified.",
        "💡 なぜ有効か\n"
        "構造化プレースホルダーを維持することで重複作業を防ぎ、"
        "どのターゲットに完全な証拠が必要かを明確にします。"
        "赤チームのワークフローでは、検証できない仮定を後付けするより"
        "ギャップを明示的に記録する方が有益です。"
    ),
    (
        "💡 Why this works\n"
        "A foothold section should record the exact exploit path and successful execution "
        "evidence. When that data is missing, clearly stating the absence protects future "
        "operators from relying on unverified assumptions.",
        "💡 なぜ有効か\n"
        "初期足がかりセクションでは正確なエクスプロイト経路と成功の証拠を記録すべきです。"
        "データが欠損している場合、その不在を明示することで"
        "将来のオペレーターが未検証の仮定に依存するリスクを防ぎます。"
    ),
    (
        "💡 Why this works\n"
        "Privilege escalation requires reproducible proof, not inferred outcomes. "
        "Documenting the lack of evidence keeps the writeup auditable and highlights "
        "where retesting is required.",
        "💡 なぜ有効か\n"
        "権限昇格には推測ではなく再現可能な証拠が必要です。"
        "証拠がないことを記録することでライトアップの監査性を維持し、"
        "再テストが必要な箇所を明確にします。"
    ),
    (
        "💡 Why this works\n"
        "This stage maps the reachable attack surface and identifies where exploitation is "
        "most likely to succeed. Accurate service and content discovery reduces blind "
        "testing and drives targeted follow-up actions.",
        "💡 なぜ有効か\n"
        "このフェーズでは到達可能な攻撃対象を把握し、"
        "悪用成功の可能性が最も高い箇所を特定します。"
        "正確なサービスとコンテンツの探索がやみくもなテストを減らし、"
        "的を絞った後続アクションにつながります。"
    ),
    (
        "💡 Why this works\n"
        "The initial access step chains discovered weaknesses into executable control over "
        "the target. Successful foothold techniques are validated by command execution or "
        "interactive shell callbacks.",
        "💡 なぜ有効か\n"
        "初期アクセスは発見した弱点をターゲットへの実行可能な制御につなげます。"
        "成功した足がかり手法は、コマンド実行またはインタラクティブシェルの確認で検証します。"
    ),
    (
        "💡 Why this works\n"
        "Privilege escalation relies on local misconfigurations, unsafe permissions, and "
        "trusted execution paths. Enumerating and abusing these trust boundaries is the "
        "fastest route to root-level access.",
        "💡 なぜ有効か\n"
        "権限昇格はローカルの設定ミス、安全でないパーミッション、"
        "信頼された実行パスを利用します。"
        "これらの信頼境界を列挙して悪用することが root アクセスへの最短経路です。"
    ),
    # Table header row
    ("| Field                     | Value |", "| 項目 | 内容 |"),
    ("|----|----|\n| OS", "|---|---|\n| OS"),
]

# ── Overview table field-name regex replacements ──────────────────────────────
TABLE_REGEXES = [
    (r'\| OS\s+\|', "| OS |"),
    (r'\| Difficulty\s+\|', "| 難易度 |"),
    (r'\| Attack Surface\s+\|', "| 攻撃対象 |"),
    (r'\| Primary Entry Vector\s+\|', "| 主な侵入経路 |"),
    (r'\| Privilege Escalation Path \|', "| 権限昇格経路 |"),
]

# ── Lessons Learned common bullet translations ────────────────────────────────
LESSONS_MAP = [
    ("Save terminal logs during each phase to preserve reproducibility.",
     "各フェーズでターミナルログを保存し、再現性を確保する。"),
    ("Capture at least one full command/output pair per major step (recon, foothold, privesc).",
     "主要ステップ（偵察・初期足がかり・権限昇格）ごとにコマンドと出力のペアを最低1つ記録する。"),
    ("Store screenshots and attachments alongside the note before publishing.",
     "公開前にスクリーンショットと添付ファイルをノートと一緒に保存する。"),
    ("Use a consistent template so incomplete writeups can be resumed quickly.",
     "一貫したテンプレートを使い、未完のライトアップを迅速に再開できるようにする。"),
    ("Validate framework debug mode and error exposure in production-like environments.",
     "本番同等の環境でフレームワークのデバッグモードとエラー露出を検証する。"),
    ("Restrict file permissions on scripts and binaries executed by privileged users or schedulers.",
     "特権ユーザーやスケジューラーが実行するスクリプト・バイナリのファイルパーミッションを制限する。"),
    ("Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.",
     "ワイルドカード展開やスクリプト化可能な特権ツールを避けるため sudo ポリシーを強化する。"),
    ("Treat exposed credentials and environment files as critical secrets.",
     "露出した認証情報と環境ファイルを重要機密として扱う。"),
    ("Enumerate SUID/GUID binaries as a standard local enumeration step.",
     "SUID/GUID バイナリの列挙を標準的なローカル列挙ステップとして実施する。"),
    ("Check GTFOBins for any non-standard privileged binaries found during enumeration.",
     "列挙中に発見した非標準の特権バイナリは GTFOBins で確認する。"),
    ("Document the specific exploit path, binary version, and GTFOBins technique used.",
     "使用したエクスプロイト経路、バイナリのバージョン、GTFOBins のテクニックを記録する。"),
    ("Always validate the exploit path with a test command before committing to the full chain.",
     "完全なチェーンに移行する前に、テストコマンドでエクスプロイト経路を検証する。"),
]


def slug_from_filename(filename):
    """2026-02-25-pg-bbscute.md -> pg-bbscute"""
    m = re.match(r'^\d{4}-\d{2}-\d{2}-(.+)\.md$', filename)
    return m.group(1) if m else filename.replace(".md", "")


def translate_title(title_en):
    """Add 解説 to English machine/room titles."""
    m = re.match(r'^(.*?)\s*\(([^)]+)\)\s*$', title_en)
    if m:
        return f"{m.group(1).strip()} 解説 ({m.group(2)})"
    return f"{title_en} 解説"


def translate_description(desc_en):
    """Simple pattern substitution for the description field."""
    d = desc_en
    subs = [
        ("Proving Grounds", "Proving Grounds"),
        ("Hack The Box", "HackTheBox"),
        ("HackTheBox", "HackTheBox"),
        ("TryHackMe", "TryHackMe"),
        (" Linux walkthrough covering reconnaissance, initial access, and privilege escalation.",
         " Linux マシン解説。偵察・初期アクセス・権限昇格を解説。"),
        (" Windows walkthrough covering reconnaissance, initial access, and privilege escalation.",
         " Windows マシン解説。偵察・初期アクセス・権限昇格を解説。"),
        (" walkthrough covering reconnaissance, initial access, and privilege escalation.",
         " マシン解説。偵察・初期アクセス・権限昇格を解説。"),
        (" Linux walkthrough with service enumeration, foothold strategy, and privilege escalation path.",
         " Linux マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"),
        (" Windows walkthrough with service enumeration, foothold strategy, and privilege escalation path.",
         " Windows マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"),
        (" with service enumeration, foothold strategy, and privilege escalation path.",
         " マシン解説。サービス列挙・初期足がかり・権限昇格経路を解説。"),
        (" Linux walkthrough focused on practical exploitation steps and privilege escalation techniques.",
         " Linux マシン解説。実践的な悪用手順と権限昇格テクニックを解説。"),
        (" Windows walkthrough focused on practical exploitation steps and privilege escalation techniques.",
         " Windows マシン解説。実践的な悪用手順と権限昇格テクニックを解説。"),
        (" walkthrough focused on practical exploitation steps and privilege escalation techniques.",
         " マシン解説。実践的な悪用手順と権限昇格テクニックを解説。"),
    ]
    for en, ja in subs:
        d = d.replace(en, ja)
    # If no substitution happened, append (日本語版)
    if d == desc_en:
        d = f"{desc_en} (日本語版)"
    return d


def translate_body(body):
    """Apply all translations to the post body."""
    result = body

    # Apply phrase map (longest first to avoid partial matches)
    for en, ja in PHRASE_MAP:
        result = result.replace(en, ja)

    # Apply section map
    for en, ja in SECTION_MAP:
        result = result.replace(en, ja)

    # Apply table regex replacements
    for pattern, replacement in TABLE_REGEXES:
        result = re.sub(pattern, replacement, result)

    # Apply lessons map
    for en, ja in LESSONS_MAP:
        result = result.replace(en, ja)

    return result


def parse_frontmatter(content):
    """Return (fm_dict, fm_raw_text, body) or None if no frontmatter."""
    if not content.startswith("---"):
        return None
    end = content.find("\n---", 3)
    if end == -1:
        return None
    fm_raw = content[3:end].strip()
    body = content[end + 4:].strip()

    fm = {}
    for line in fm_raw.split("\n"):
        if ":" in line:
            key, _, val = line.partition(":")
            fm[key.strip()] = val.strip().strip('"').strip("'")

    return fm, fm_raw, body


def update_en_post_frontmatter(filepath, slug):
    """Add content_lang: en and alt_ja to an EN post if not already present."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "content_lang:" in content:
        return False  # Already has content_lang

    if not content.startswith("---"):
        return False

    end = content.find("\n---", 3)
    if end == -1:
        return False

    fm_raw = content[3:end]
    body = content[end + 4:]

    alt_ja_url = f"/posts/{slug}-ja/"
    addition = f"\ncontent_lang: en\nalt_ja: {alt_ja_url}"

    new_content = "---" + fm_raw + addition + "\n---" + body

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return True


def create_ja_post(en_filepath, ja_filepath, slug):
    """Create a JA version of the given EN post."""
    with open(en_filepath, "r", encoding="utf-8") as f:
        content = f.read()

    parsed = parse_frontmatter(content)
    if not parsed:
        print(f"  SKIP (no frontmatter): {os.path.basename(en_filepath)}")
        return False

    fm, fm_raw, body = parsed

    title_en = fm.get("title", "")
    date_val = fm.get("date", "2026-02-25")
    desc_en = fm.get("description", "")
    categories = fm.get("categories", "")
    tags = fm.get("tags", "")
    has_mermaid = "mermaid: true" in fm_raw

    title_ja = translate_title(title_en)
    desc_ja = translate_description(desc_en)
    body_ja = translate_body(body)
    alt_en_url = f"/posts/{slug}/"

    mermaid_line = "\nmermaid: true" if has_mermaid else ""
    ja_content = (
        f'---\n'
        f'title: "{title_ja}"\n'
        f'date: {date_val}\n'
        f'description: "{desc_ja}"\n'
        f'categories: {categories}\n'
        f'tags: {tags}{mermaid_line}\n'
        f'content_lang: ja\n'
        f'alt_en: {alt_en_url}\n'
        f'---\n\n'
        f'{body_ja}\n'
    )

    with open(ja_filepath, "w", encoding="utf-8") as f:
        f.write(ja_content)

    return True


def main():
    posts_dir = os.path.abspath(POSTS_DIR)

    all_files = sorted(os.listdir(posts_dir))

    # EN writeup posts: date-pg/htb/thm pattern, not -ja
    writeup_en = [
        f for f in all_files
        if re.match(r'2026-0[23]-\d{2}-(pg|htb|thm)-', f) and not f.endswith("-ja.md")
    ]

    print(f"Processing {len(writeup_en)} EN writeup posts...")

    created = 0
    skipped = 0
    updated_en = 0

    for filename in writeup_en:
        slug = slug_from_filename(filename)
        en_path = os.path.join(posts_dir, filename)
        ja_filename = filename.replace(".md", "-ja.md")
        ja_path = os.path.join(posts_dir, ja_filename)

        # Create JA post if it doesn't exist
        if os.path.exists(ja_path):
            skipped += 1
        else:
            if create_ja_post(en_path, ja_path, slug):
                created += 1
                print(f"  + {ja_filename}")
            else:
                print(f"  ! FAILED: {ja_filename}")

        # Update EN post to add content_lang and alt_ja
        if update_en_post_frontmatter(en_path, slug):
            updated_en += 1

    print(f"\nSummary:")
    print(f"  JA posts created : {created}")
    print(f"  JA posts skipped : {skipped} (already existed)")
    print(f"  EN posts updated : {updated_en} (added content_lang/alt_ja)")


if __name__ == "__main__":
    main()
