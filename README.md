# KruNote

KruNote คือ PWA ส่วนตัวสำหรับครูมัธยม ใช้เช็กชื่อ ติดตามการส่งงาน กรอกคะแนนรวม ตัดเกรด บันทึกพฤติกรรม และสร้างรายงาน PDF/Excel แยก ม.4–ม.6 และรายห้อง ข้อมูลหลักอยู่ใน Google Sheets ของเจ้าของระบบ ส่วนไฟล์รายงานอยู่ใน Google Drive

## ความสามารถ

- เช็กชื่อแยกตามระดับชั้น ห้อง วันที่ และคาบ พร้อม Dashboard เปอร์เซ็นต์มา/ขาด/ลา จำนวนวันที่เช็ก และรายชื่อนักเรียนขาดบ่อย
- เลือกปีการศึกษาส่วนกลางได้ โดยเปิดปีล่าสุดเป็นค่าเริ่มต้นและย้อนดูห้อง ตารางสอน เช็กชื่อ งาน คะแนน และรายงานของปีก่อนได้
- ตรวจงานแยกจากเช็กชื่อ: ส่งแล้ว/ส่งช้า/ยังไม่ส่ง/ยกเว้น และกรอกคะแนนรวมจากตารางเดียว
- ตารางสอนรายวันและรายสัปดาห์ พร้อมบันทึกวันลา สาเหตุ ชื่อและเบอร์โทรครูสอนแทน
- สร้างงานหรือข้อสอบครั้งเดียว แล้วเลือกใช้กับหลายห้อง
- คิวตรวจงานและความคืบหน้ารายห้อง
- ตารางคะแนนแบบถ่วงน้ำหนัก เกณฑ์ 4–0 และการล็อกเกรด
- เพิ่ม ลบ เปลี่ยนชื่อ และปรับเปอร์เซ็นต์หมวดคะแนน โดยตรวจให้ผลรวมเท่ากับ 100%
- เพิ่มห้องพร้อมคาบสอน และ Import รายชื่อนักเรียนจาก Excel `.xlsx` ด้วยไฟล์ตัวอย่าง ตรวจข้อมูลก่อนนำเข้า และอัปเดตคนเดิมด้วยรหัสนักเรียน
- บันทึกพฤติกรรมเชิงบวกและเรื่องที่ควรติดตาม โดยไม่กระทบคะแนน
- ส่งออก PDF หรือ Excel หนึ่งห้อง หนึ่งระดับ หลายห้อง หรือทุกห้อง
- ทำงานออฟไลน์ด้วย cache และ outbox ที่เข้ารหัสบนอุปกรณ์
- ภาษาไทย/English, System/Light/Dark/High Contrast และโหมดกระชับ
- ข้อมูลจำลอง 90 คนใน 6 ห้อง พร้อมคะแนน เกรด งาน เช็กชื่อ พฤติกรรม วันลา และประวัติรายงาน

## อุปกรณ์และเบราว์เซอร์

รองรับ Chrome, Edge และ Safari รุ่นปัจจุบันบน macOS, Windows, iPhone, iPad และ Android การติดตั้งเป็นแอปต้องเปิดผ่าน HTTPS ซึ่ง GitHub Pages จัดให้โดยอัตโนมัติ

## เริ่มใช้งานแบบแนะนำ: Copy Google Sheet Template

KruNote ใช้ Apps Script ที่ผูกอยู่กับ Google Sheet Template โดยตรง ระบบจะสร้างแท็บฐานข้อมูลและ Header ในไฟล์ที่คุณคัดลอกมา และจะไม่สร้างไฟล์ Spreadsheet ฐานข้อมูลแยกอีกไฟล์

1. เปิด [Google Sheet Template — กดเพื่อทำสำเนา](https://docs.google.com/spreadsheets/d/1uS7TERCyGExk3QTnoZERtAnhi1bdMcdO8hiC5HiKfNQ/copy)
2. กด **ทำสำเนา** และรอให้ไฟล์ใหม่เปิดใน Google Sheets
3. รีเฟรชชีตหนึ่งครั้ง จากนั้นเลือก **ส่วนขยาย (Extensions) → Apps Script**
4. ใน Apps Script เลือกฟังก์ชัน `setupKruNote` แล้วกด **Run** ยืนยันสิทธิ์ด้วยบัญชี Google ที่เป็นเจ้าของชีต PIN เริ่มต้นคือ `12345678`
5. กลับมาที่ Google Sheet จะเห็นแท็บฐานข้อมูลและ Header `id`, `json`, `version`, `updatedAt` หากเปิดชีตครั้งต่อไป สามารถสั่งซ้ำจากเมนู **KruNote → สร้าง/อัปเดตฐานข้อมูล** ได้โดยข้อมูลเดิมไม่หาย
6. ใน Apps Script กด **Deploy → New deployment → Web app** ตั้งค่า **Execute as: Me** และ **Who has access: Anyone** แล้วกด Deploy
7. คัดลอก Web App URL ที่ลงท้ายด้วย `/exec` แล้วบันทึกเป็น GitHub Actions Secret ชื่อ `KRUNOTE_WEB_APP_URL` ตามหัวข้อ Runtime Config ด้านล่าง แอปที่ Deploy แล้วจะเปิดหน้า PIN โดยอัตโนมัติ

ห้ามสร้าง Apps Script แบบ standalone สำหรับฐานข้อมูลหลัก เพราะสคริปต์ต้องทราบว่า Google Sheet สำเนาใดเป็นเจ้าของข้อมูล หากต้องการข้อมูลจำลอง ให้เลือกตัวเลือกข้อมูลตัวอย่างตอนเชื่อมต่อครั้งแรก

## ภาพรวมการติดตั้งผ่าน Terminal

ลำดับทั้งหมดคือ:

1. คัดลอก Google Sheet Template และ Deploy Apps Script ที่ผูกกับชีต
2. ติดตั้ง Git, GitHub CLI และ Node.js
3. Clone source code
4. ติดตั้ง dependencies และตรวจ build
5. สร้าง GitHub repository, เปิด Pages และ push
6. เปิดแอปและเข้าใช้ด้วย PIN เริ่มต้น โดย URL จะมาจาก Runtime Config

คำสั่งด้านล่างใช้ placeholder เพื่อไม่ฝังข้อมูลส่วนตัวใน repository ให้เปลี่ยน `YOUR_SOURCE_OWNER` เป็นเจ้าของ source repository ที่ต้องการ clone

## macOS Terminal — ติดตั้งเครื่องมือ

หากยังไม่มี Homebrew ให้ติดตั้งจาก [brew.sh](https://brew.sh/) ก่อน จากนั้นเปิด Terminal ใหม่และคัดลอกคำสั่งชุดนี้:

```bash
xcode-select --install
brew install git gh node
git --version
gh --version
node --version
npm --version
```

หาก `xcode-select` แจ้งว่าติดตั้งแล้ว สามารถข้ามข้อความนั้นได้

## Windows Terminal / PowerShell — ติดตั้งเครื่องมือ

เปิด PowerShell แบบปกติ ไม่จำเป็นต้องใช้ Administrator แล้วคัดลอกคำสั่ง:

```powershell
winget install --id Git.Git --exact
winget install --id GitHub.cli --exact
winget install --id OpenJS.NodeJS.LTS --exact
```

ปิดและเปิด Windows Terminal ใหม่ แล้วรัน:

```powershell
git --version
gh --version
node --version
npm --version
```

## Login GitHub

ใช้ได้เหมือนกันทั้ง macOS Terminal และ Windows PowerShell:

```text
gh auth login
```

เลือก `GitHub.com` → `HTTPS` → `Login with a web browser` แล้วกรอกรหัสอุปกรณ์ในหน้าเว็บ ส่วนการยืนยันบัญชี Google จะเกิดขึ้นตอนรัน `setupKruNote` และตอน Deploy Web app ในหน้า Apps Script ห้ามกรอกรหัสผ่านหรือ token ลงในไฟล์ของโครงการ

ตรวจสถานะหลัง Login:

```text
gh auth status
```

## Clone Git และเตรียมโครงการ

### macOS Terminal

```bash
cd "$HOME/Documents"
git clone "https://github.com/YOUR_SOURCE_OWNER/krunote.git" krunote
cd krunote
npm ci
npm run verify
```

### Windows PowerShell

```powershell
Set-Location "$HOME\Documents"
git clone "https://github.com/YOUR_SOURCE_OWNER/krunote.git" krunote
Set-Location krunote
npm ci
npm run verify
```

ผลที่ถูกต้องคือ tests ผ่าน, production build สำเร็จ และข้อความ `Verified 6 release files and PWA metadata.`

## สร้าง Header และ Deploy Google Apps Script

ใช้ขั้นตอน **Copy Google Sheet Template** ด้านบนเป็นวิธีหลัก ไม่ต้องติดตั้ง `clasp` และไม่ต้องใช้คำสั่ง `clasp create`:

1. เปิด Apps Script จากเมนู **ส่วนขยาย** ของ Google Sheet สำเนาเท่านั้น
2. Run ฟังก์ชัน `setupKruNote` หนึ่งครั้ง ฟังก์ชันนี้จะสร้างเฉพาะแท็บและ Header ที่ขาดใน Spreadsheet สำเนานั้น การรันซ้ำจะไม่ลบแถวเดิม PIN เริ่มต้นคือ `12345678`
3. Deploy เป็น Web app โดยให้ทำงานในนามเจ้าของและอนุญาต `Anyone`
4. ทดสอบ URL ที่ได้ โดยเปิด `WEB_APP_URL?action=health` ในเบราว์เซอร์ คำตอบควรมี `ok: true`, `storage: "CONTAINER_BOUND_SHEET"` และ `installed: true`
5. นำ URL `/exec` ไปตั้งเป็น Runtime Config แล้ว KruNote จะใช้ endpoint นี้โดยอัตโนมัติ

Web App เปิด endpoint แบบ Anyone เพื่อให้ GitHub Pages เรียกได้ แต่ข้อมูลต้องผ่าน PIN session แบบหมดอายุ มี rate limit และข้อมูลออฟไลน์เข้ารหัสแล้ว ควรเก็บ Web App URL และ PIN เป็นส่วนตัว

## ตั้ง Web App URL ผ่าน Runtime Config

ไฟล์ [public/config.js](public/config.js) เป็น Config กลางของแอป หาก `webAppUrl` มีค่า KruNote จะข้ามหน้าใส่ Web App URL และเปิดหน้า PIN ทันที Repository เก็บไฟล์นี้เป็นค่าว่างเพื่อไม่ผูกฐานข้อมูลของเจ้าของ Template เข้ากับผู้ใช้รายอื่น

สำหรับ GitHub Pages ให้เก็บ URL จริงใน GitHub Actions Secret จาก Terminal:

```text
gh secret set KRUNOTE_WEB_APP_URL --body "PASTE_WEB_APP_URL_ENDING_WITH_EXEC"
```

จากนั้นรัน workflow ใหม่:

```text
gh workflow run deploy-pages.yml
gh run watch --exit-status
```

Workflow จะสร้าง `config.js` จาก Secret ก่อน build โดย URL จริงจะไม่ถูก commit ลง repository หากไม่ได้ตั้ง Secret หรือ Config ว่าง แอปจะกลับไปแสดงหน้ากรอก URL แบบเดิมเพื่อให้ตั้งค่าด้วยตนเอง

## สร้าง GitHub Repository และเปิด Pages ผ่าน Terminal

หลัง clone แล้ว `origin` จะยังชี้ไป source เดิม ให้เปลี่ยนชื่อเป็น `upstream` ก่อนสร้าง repository ของตัวเอง

### macOS Terminal

```bash
git remote rename origin upstream
gh repo create krunote --public --source=. --remote=origin --push
export KRUNOTE_REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
gh api --method POST "repos/$KRUNOTE_REPO/pages" -f build_type=workflow
gh workflow run deploy-pages.yml
export KRUNOTE_RUN_ID="$(gh run list --workflow deploy-pages.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$KRUNOTE_RUN_ID" --exit-status
gh api "repos/$KRUNOTE_REPO/pages" --jq .html_url
```

### Windows PowerShell

```powershell
git remote rename origin upstream
gh repo create krunote --public --source=. --remote=origin --push
$KruNoteRepo = gh repo view --json nameWithOwner --jq .nameWithOwner
gh api --method POST "repos/$KruNoteRepo/pages" -f build_type=workflow
gh workflow run deploy-pages.yml
$KruNoteRunId = gh run list --workflow deploy-pages.yml --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $KruNoteRunId --exit-status
gh api "repos/$KruNoteRepo/pages" --jq .html_url
```

คำสั่งสุดท้ายจะแสดง URL รูปแบบ `https://YOUR_GITHUB_USERNAME.github.io/krunote/` หาก `gh api .../pages` ตอบว่ามี Pages อยู่แล้ว ให้ข้ามไป `git push` ได้

## เปิดใช้งานครั้งแรก

1. เปิด GitHub Pages URL ที่ได้จาก Terminal
2. เมื่อ Runtime Config ถูกต้อง แอปจะเปิดหน้า PIN โดยไม่ถาม Web App URL
3. ใส่ PIN เริ่มต้น `12345678`
4. หากต้องการเปลี่ยน PIN ให้เปิด **การตั้งค่า → เปลี่ยน PIN** แล้วตั้งรหัสใหม่เป็นตัวเลข 6–12 หลัก
5. ทดลองสร้างงาน เช็กชื่อ กรอกคะแนน และออก PDF/Excel ก่อนเพิ่มข้อมูลจริง

## ติดตั้งเป็น PWA

- Chrome/Edge: เปิดเมนูเบราว์เซอร์แล้วเลือก Install KruNote
- iPhone/iPad: Safari → Share → Add to Home Screen
- Android: Chrome → Install app หรือ Add to Home screen

เมื่อออฟไลน์ แอปจะเปิดข้อมูล cache ที่เข้ารหัสและเก็บรายการแก้ไขใน outbox เมื่อออนไลน์อีกครั้งระบบจะส่งตามลำดับพร้อม retry และแจ้ง conflict หากข้อมูลถูกแก้จากอุปกรณ์อื่น

## Deploy การอัปเดต

ตรวจและ deploy frontend:

```text
npm run verify
git add .
git commit -m "describe your change"
git push origin main
gh run watch --exit-status
```

ถ้าแก้โค้ด Apps Script ใน Google Sheet สำเนา ให้เปิด **Deploy → Manage deployments → Edit** เลือก **New version** แล้ว Deploy ทับรายการเดิม วิธีนี้ทำให้ Web App URL เดิมไม่เปลี่ยน

## โครงสร้างข้อมูลและการสำรอง

Apps Script ใช้ Google Sheet Template สำเนาเป็นฐานข้อมูล และสร้างแท็บภายในไฟล์นั้นสำหรับปีการศึกษา ภาคเรียน ระดับ ห้อง นักเรียน ตารางสอน การเข้าเรียน งาน เป้าหมายห้อง การส่ง คะแนน พฤติกรรม เกณฑ์เกรด ผลเกรด งานส่งออก และ mutation log โดยไม่สร้าง Spreadsheet ฐานข้อมูลไฟล์ใหม่

- สำรองโดยทำสำเนา Spreadsheet และโฟลเดอร์ `KruNote Reports` ใน Drive
- ใช้ข้อมูลจำลองในการสาธิตหรือทดสอบเสมอ
- อย่า commit `.clasp.json`, `.clasprc.json`, PIN, Web App URL หรือข้อมูลนักเรียนจริง
- หากอุปกรณ์สูญหาย ให้เปลี่ยน PIN และสร้าง deployment ใหม่

## แก้ปัญหา

- `command not found`: ปิดและเปิด Terminal ใหม่ แล้วตรวจด้วยคำสั่ง `--version`
- `gh auth status` ไม่ผ่าน: รัน `gh auth login` ใหม่
- `Repository already exists`: เปลี่ยนชื่อใน `gh repo create` หรือใช้ repository ที่มีอยู่แล้วและเพิ่ม remote ด้วย `git remote add origin URL`
- Pages workflow ไม่เริ่ม: รัน `gh workflow run deploy-pages.yml`
- แอปยังถาม Web App URL: ตรวจว่ามี Secret ชื่อ `KRUNOTE_WEB_APP_URL`, ค่า URL ลงท้าย `/exec` และ Deploy Pages ใหม่แล้ว
- `/exec` พาไปหน้า Login: ตรวจว่า deployment ใช้ manifest รุ่นล่าสุดและ Web App อนุญาต Anyone
- ไม่เห็นเมนู KruNote: รีเฟรช Google Sheet แล้วรอสักครู่ จากนั้นเปิดเมนูอีกครั้ง
- ไม่เห็น Header/แท็บฐานข้อมูล: เปิด **ส่วนขยาย → Apps Script**, เลือก `setupKruNote` แล้ว Run ด้วยบัญชีเจ้าของชีต
- `CONTAINER_NOT_INITIALIZED` หรือ `installed: false`: กลับไป Run `setupKruNote` จาก Apps Script ที่เปิดผ่าน Google Sheet สำเนา ห้ามใช้ standalone project
- ลืม PIN หรือ PIN เดิมไม่ผ่าน: กลับไปที่ Google Sheet เลือก **KruNote → รีเซ็ต PIN เป็น 12345678** แล้วเข้าแอปด้วย `12345678`
- เปิดแอปแล้วค้างที่ตรวจ PIN: รอ Apps Script cold start 10–30 วินาทีแล้วลองใหม่
- เปลี่ยน Web App URL: ตั้งค่า → ตัดการเชื่อมต่ออุปกรณ์นี้ แล้วเชื่อมใหม่
