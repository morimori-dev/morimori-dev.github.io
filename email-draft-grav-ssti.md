# Email Draft: Grav SSTI Vulnerability Follow-up

## Subject / 件名

```
Security Report Follow-up: SSTI to RCE via evaluate() and config.merge() bypass in Grav CMS v1.7.49.5 (GHSA-rxxq-77xc-743r)
```

## Body / 本文

```
Dear Grav Security Team,

I am writing to follow up on a security vulnerability report I submitted via
GitHub Security Advisory (GHSA-rxxq-77xc-743r) on March 20, 2026.

I have not yet received a response on the advisory, so I wanted to reach out
directly to ensure this report has been reviewed. I would be happy to provide
any additional information or assist with the remediation process.

Below is a summary of the reported vulnerability.

---

## 1. Vulnerability Overview

- **Vulnerability Type**: Server-Side Template Injection (SSTI) leading to
  Remote Code Execution (RCE)
- **Affected Component**: `Security::cleanDangerousTwig()` blocklist bypass
  - `system/src/Grav/Common/Security.php` (line 267-286)
  - `system/src/Grav/Common/Twig/Extension/GravExtension.php` (line 992-1002)
- **CWE**: CWE-1336 (Improper Neutralization of Special Elements Used in a
  Template Engine)
- **Affected Version**: Grav CMS v1.7.49.5 (latest stable) and likely earlier
  versions

## 2. Summary

I discovered two bypass methods against the `cleanDangerousTwig()` security
mechanism that is designed to prevent dangerous Twig template execution:

**Bypass A — Arbitrary File Read via evaluate() + String Concatenation:**
The `evaluate` and `evaluate_twig` Twig functions are not included in the
`cleanDangerousTwig()` blocklist. By using Twig's string concatenation
operator (`~`), an attacker can reconstruct the blocked `read_file` function
name at runtime, bypassing the static regex check. Additionally, the
`evaluateTwigFunc()` method creates a new Twig environment without applying
`cleanDangerousTwig()`, so the reconstructed dangerous function executes
without any sanitization.

**Bypass B — RCE via grav.config.merge() + grav.twig.processString():**
The `grav.config.merge()` method is accessible from Twig templates and can
modify the in-memory configuration at runtime. An attacker can inject
arbitrary PHP functions (e.g., `passthru`) into `system.twig.safe_functions`.
The `registerUndefinedFunctionCallback` checks `safe_functions` before
`isDangerousFunction()`, so the injected function is treated as allowed.
Combined with `grav.twig.processString()`, this achieves full RCE.

## 3. Steps to Reproduce

**Prerequisites:**
- Grav CMS v1.7.49.5 (Docker: `linuxserver/grav:latest`)
- An admin account with page editing access
- Twig processing enabled on the page

**Reproduction:**

Step 1. Create a Markdown page with the following content:

    ---
    title: PoC
    process:
        twig: true
    ---

    ## Arbitrary File Read
    {% set rf = "read" ~ "_file" %}
    {{ evaluate(rf ~ "(\"/etc/passwd\")") }}

    ## RCE
    {% set nc = {"system": {"twig": {"safe_functions": ["passthru"]}}} %}
    {% do grav.config.merge(nc) %}
    {{ grav.twig.processString("{{ passthru(\"id\") }}") }}

Step 2. Clear cache and access the page in a browser.

Step 3. Observe that:
  - The contents of `/etc/passwd` are displayed on the page
    (confirming arbitrary file read).
  - The output of the `id` command is displayed
    (confirming OS command execution).

## 4. Impact

This vulnerability allows an authenticated admin user to:
- **Read arbitrary files** on the server, including password hashes
  (`user/accounts/admin.yaml`) and the security salt
  (`user/config/security.yaml`)
- **Execute arbitrary OS commands**, leading to complete server compromise

While this requires admin-level authentication, the `cleanDangerousTwig()`
mechanism was specifically designed as a security boundary to prevent even
admin users from executing arbitrary code via Twig. This bypass completely
defeats that control.

This is consistent with previous SSTI advisories in Grav that addressed
similar blocklist bypass issues:
- GHSA-qfv4-q44r-g7rv
- GHSA-f8v5-jmfh-pr69
- GHSA-c9gp-64c4-2rrh

## 5. Severity Assessment

Following Grav's security severity guidelines (admin-level access required),
I have assessed this as **Moderate**. However, given the full RCE capability,
the final severity determination is of course at your discretion.

## 6. Proposed Fix

**Short-term:** Add the following to the `$bad_twig` blocklist in
`Security::cleanDangerousTwig()`:

    'evaluate', 'evaluate_twig', 'grav.config', 'grav.twig',
    'config.merge', 'config.set', 'processString'

Additionally, apply `cleanDangerousTwig()` inside `evaluateTwigFunc()`.

**Long-term:** The blocklist-based approach has been bypassed repeatedly
across multiple CVEs. Consider migrating to an allowlist-based Twig sandbox
using Twig's built-in SecurityPolicy with explicitly permitted functions,
filters, tags, and methods.

---

I am happy to help verify any patches or provide additional details.
Thank you for maintaining Grav — it is a great project, and I hope this
report helps make it even more secure.

The full details, including a Docker-based reproduction environment, are
available in the GitHub Security Advisory:
https://github.com/getgrav/grav/security/advisories/GHSA-rxxq-77xc-743r

Best regards,
[Your Name]
GitHub: @morimori-dev
```
