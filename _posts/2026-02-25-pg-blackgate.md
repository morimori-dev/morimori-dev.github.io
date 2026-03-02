---
title: "Proving Grounds - BlackGate (Linux)"
date: 2026-02-25
description: "Proving Grounds BlackGate Linux walkthrough covering reconnaissance, initial access, and privilege escalation."
categories: [Proving Grounds, Linux]
tags: [rce, suid, php, privilege-escalation]
mermaid: true
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | Web application and exposed network services |
| Primary Entry Vector      | Web RCE (CVE-2021-4034, cve-2021-4034) |
| Privilege Escalation Path | Local enumeration -> misconfiguration abuse -> root |

## Credentials

No credentials obtained.

## Reconnaissance

---
💡 Why this works  
This stage maps the reachable attack surface and identifies where exploitation is most likely to succeed. Accurate service and content discovery reduces blind testing and drives targeted follow-up actions.

## Initial Foothold

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```redis
[+] 192.168.155.176:6379  - Found redis with INFO command: $2743\x0d\x0a# Server\x0d\x0aredis_version:4.0.14\x0d\x0aredis_git_sha1:00000000\x0d\x0aredis_git_dirty:0\x0d\x0aredis_build_id:25b410d64d050b9e\x0d\x0aredis_mode:standalone\x0d\x0aos:Linux 5.8.0-63-generic x86_64\x0d\x0aarch_bits:64\x0d\x0amultiplexing_api:epoll\x0d\x0aatomicvar_api:atomic-builtin\x0d\x0agcc_version:10.2.0\x0d\x0aprocess_id:875\x0d\x0arun_id:3b6449e937c5be649aaf8d316e1939b3567ec047\x0d\x0atcp_port:6379\x0d\x0auptime_in_seconds:43172393\x0d\x0auptime_in_days:499\x0d\x0ahz:10\x0d\x0alru_clock:4211263\x0d\x0aexecutable:/usr/local/bin/redis-server\x0d\x0aconfig_file:\x0d\x0a\x0d\x0a# Clients\x0d\x0aconnected_clients:2\x0d\x0aclient_longest_output_list:0\x0d\x0aclient_biggest_input_buf:0\x0d\x0ablocked_clients:0\x0d\x0a\x0d\x0a# Memory\x0d\x0aused_memory:920655\x0d\x0aused_memory_human:899.08K\x0d\x0aused_memory_rss:4452352\x0d\x0aused_memory_rss_human:4.25M\x0d\x0aused_memory_peak:920655\x0d\x0aused_memory_peak_human:899.08K\x0d\x0aused_memory_peak_perc:100.10%\x0d\x0aused_memory_overhead:919155\x0d\x0aused_memory_startup:852579\x0d\x0aused_memory_dataset:1500\x0d\x0aused_memory_dataset_perc:2.20%\x0d\x0atotal_system_memory:1024843776\x0d\x0atotal_system_memory_human:977.37M\x0d\x0aused_memory_lua:37888\x0d\x0aused_memory_lua_human:37.00K\x0d\x0amaxmemory:0\x0d\x0amaxmemory_human:0B\x0d\x0amaxmemory_policy:noeviction\x0d\x0amem_fragmentation_ratio:4.84\x0d\x0amem_allocator:libc\x0d\x0aactive_defrag_running:0\x0d\x0alazyfree_pending_objects:0\x0d\x0a\x0d\x0a# Persistence\x0d\x0aloading:0\x0d\x0ardb_changes_since_last_save:5\x0d\x0ardb_bgsave_in_progress:0\x0d\x0ardb_last_save_time:1722646550\x0d\x0ardb_last_bgsave_status:ok\x0d\x0ardb_last_bgsave_time_sec:-1\x0d\x0ardb_current_bgsave_time_sec:-1\x0d\x0ardb_last_cow_size:0\x0d\x0aaof_enabled:0\x0d\x0aaof_rewrite_in_progress:0\x0d\x0aaof_rewrite_scheduled:0\x0d\x0aaof_last_rewrite_time_sec:-1\x0d\x0aaof_current_rewrite_time_sec:-1\x0d\x0aaof_last_bgrewrite_status:ok\x0d\x0aaof_last_write_status:ok\x0d\x0aaof_last_cow_size:0\x0d\x0a\x0d\x0a# Stats\x0d\x0atotal_connections_received:10\x0d\x0atotal_commands_processed:20\x0d\x0ainstantaneous_ops_per_sec:0\x0d\x0atotal_net_input_bytes:1356\x0d\x0atotal_net_output_bytes:43165\x0d\x0ainstantaneous_input_kbps:0.00\x0d\x0ainstantaneous_output_kbps:0.00\x0d\x0arejected_connections:0\x0d\x0async_full:0\x0d\x0async_partial_ok:0\x0d\x0async_partial_err:0\x0d\x0aexpired_keys:0\x0d\x0aexpired_stale_perc:0.00\x0d\x0aexpired_time_cap_reached_count:0\x0d\x0aevicted_keys:0\x0d\x0akeyspace_hits:0\x0d\x0akeyspace_misses:0\x0d\x0apubsub_channels:0\x0d\x0apubsub_patterns:0\x0d\x0alatest_fork_usec:0\x0d\x0amigrate_cached_sockets:0\x0d\x0aslave_expires_tracked_keys:0\x0d\x0aactive_defrag_hits:0\x0d\x0aactive_defrag_misses:0\x0d\x0aactive_defrag_key_hits:0\x0d\x0aactive_defrag_key_misses:0\x0d\x0a\x0d\x0a# Replication\x0d\x0arole:master\x0d\x0aconnected_slaves:0\x0d\x0amaster_replid:9e425474497a66eb92853781cf9f9d5aa8978d9e\x0d\x0amaster_replid2:0000000000000000000000000000000000000000\x0d\x0amaster_repl_offset:0\x0d\x0asecond_repl_offset:-1\x0d\x0arepl_backlog_active:0\x0d\x0arepl_backlog_size:1048576\x0d\x0arepl_backlog_first_byte_offset:0\x0d\x0arepl_backlog_histlen:0\x0d\x0a\x0d\x0a# CPU\x0d\x0aused_cpu_sys:3.06\x0d\x0aused_cpu_user:1.91\x0d\x0aused_cpu_sys_children:0.00\x0d\x0aused_cpu_user_children:0.00\x0d\x0a\x0d\x0a# Cluster\x0d\x0acluster_enabled:0\x0d\x0a\x0d\x0a# Keyspace\x0d\x0adb0:keys=1,expires=0,avg_ttl=0
[*] 192.168.155.176:6379  - Scanned 1 of 1 hosts (100% complete)

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
redis-cli -h $ip
```

```bash
✅[2:30][CPU:20][MEM:61][TUN0:192.168.45.168][...me/n0z0/work/pg/BlackGate]
🐉 > redis-cli -h $ip         
192.168.155.176:6379> info

```

💡 Why this works  
The initial access step chains discovered weaknesses into executable control over the target. Successful foothold techniques are validated by command execution or interactive shell callbacks.

## Privilege Escalation

---
At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
sudo -l -l
```

```bash
prudence@blackgate:/home/prudence$ sudo -l -l
Matching Defaults entries for prudence on blackgate:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User prudence may run the following commands on blackgate:

Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
	/usr/local/bin/redis-status
```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat notes.txt
chmod +x linpeas.sh
```

```bash
prudence@blackgate:/home/prudence$ cat notes.txt
[✔] Setup redis server
[✖] Turn on protected mode
[✔] Implementation of the redis-status
[✔] Allow remote connections to the redis server 
prudence@blackgate:/home/prudence$ chmod +x linpeas.sh

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat /usr/local/bin/redis-status
```

```bash
prudence@blackgate:/tmp$ cat /usr/local/bin/redis-status
t+SL)�H��O���H��t1��L��L��D��A��H��H9�u�H�[]A\A]A^A_�ff.������H�H��[*] Redis UptimeAuthorization Key: ClimbingParrotKickingDonkey321/usr/bin/systemctl status redisWrong Authorization Key!Incident has been reported!

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
sudo /usr/local/bin/redis-status
```

```bash
prudence@blackgate:/tmp$ sudo /usr/local/bin/redis-status
[*] Redis Uptime
Authorization Key: ClimbingParrotKickingDonkey321
● redis.service - redis service
     Loaded: loaded (/etc/systemd/system/redis.service; enabled; vendor preset:>
     Active: active (running) since Sat 2024-08-03 00:55:50 UTC; 1 years 4 mont>
   Main PID: 875 (sh)
      Tasks: 11 (limit: 1062)
     Memory: 12.1M
     CGroup: /system.slice/redis.service
             ├─ 875 [sh]
             ├─1425 python3 -c import pty; pty.spawn("/bin/bash")
             ├─1426 /bin/bash
             ├─1433 script /dev/null -c bash
             ├─1434 sh -c bash
             ├─1435 bash
             ├─1680 sudo /usr/local/bin/redis-status
             ├─1681 /usr/local/bin/redis-status
             ├─1682 sh -c /usr/bin/systemctl status redis
             ├─1683 /usr/bin/systemctl status redis
             └─1684 pager

```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
╔══════════╣ Executing Linux Exploit Suggester
╚ https://github.com/mzet-/linux-exploit-suggester

[+] [CVE-2021-4034] PwnKit

   Details: https://www.qualys.com/2022/01/25/cve-2021-4034/pwnkit.txt
   Exposure: probable
   Tags: [ ubuntu=10|11|12|13|14|15|16|17|18|19|20|21 ],debian=7|8|9|10|11,fedora,manjaro
   Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main


```

At this stage, the following command(s) are executed to progress the attack chain and validate the next hypothesis. We are specifically looking for actionable indicators such as open services, exploitability, credential exposure, or privilege boundaries. Key flags and parameters are preserved to keep the workflow reproducible for follow-along testing.

```bash
cat /root/proof.txt
ip a
```

```bash
root@blackgate:/tmp# cat /root/proof.txt
3160c1acd479f931bbf6dd0701bba516
root@blackgate:/tmp# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
3: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:50:56:ab:08:ea brd ff:ff:ff:ff:ff:ff
    altname enp3s0
    inet 192.168.155.176/24 brd 192.168.155.255 scope global ens160
       valid_lft forever preferred_lft forever
root@blackgate:/tmp# 

```

💡 Why this works  
Privilege escalation relies on local misconfigurations, unsafe permissions, and trusted execution paths. Enumerating and abusing these trust boundaries is the fastest route to root-level access.

## Lessons Learned / Key Takeaways

- Validate framework debug mode and error exposure in production-like environments.
- Restrict file permissions on scripts and binaries executed by privileged users or schedulers.
- Harden sudo policies to avoid wildcard command expansion and scriptable privileged tools.
- Treat exposed credentials and environment files as critical secrets.

## References

- CVE-2021-4034: https://nvd.nist.gov/vuln/detail/CVE-2021-4034
- cve-2021-4034: https://nvd.nist.gov/vuln/detail/cve-2021-4034
- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- feroxbuster: https://github.com/epi052/feroxbuster
- Nuclei: https://github.com/projectdiscovery/nuclei
- GTFOBins: https://gtfobins.org/
- HackTricks Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
