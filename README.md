# KruNote

KruNote คือ PWA ส่วนตัวสำหรับครูมัธยม ใช้เช็กชื่อ ติดตามการส่งงาน กรอกคะแนนรวม ตัดเกรด บันทึกพฤติกรรม และสร้างรายงาน PDF/Excel แยก ม.4–ม.6 และรายห้อง ข้อมูลหลักอยู่ใน Google Sheets ของเจ้าของระบบ ส่วนไฟล์รายงานอยู่ใน Google Drive

## ความสามารถ

- เช็กชื่อแยกตามระดับชั้น ห้อง วันที่ และคาบ โดยตั้งต้นทั้งห้องเป็น “มา” แล้วกดแก้เฉพาะคน
- ตรวจงานแยกจากเช็กชื่อ: ส่งแล้ว/ส่งช้า/ยังไม่ส่ง/ยกเว้น และกรอกคะแนนรวมจากตารางเดียว
- ตารางสอนรายวันและรายสัปดาห์ พร้อมบันทึกวันลา สาเหตุ ชื่อและเบอร์โทรครูสอนแทน
- สร้างงานหรือข้อสอบครั้งเดียว แล้วเลือกใช้กับหลายห้อง
- คิวตรวจงานและความคืบหน้ารายห้อง
- ตารางคะแนนแบบถ่วงน้ำหนัก เกณฑ์ 4–0 และการล็อกเกรด
- บันทึกพฤติกรรมเชิงบวกและเรื่องที่ควรติดตาม โดยไม่กระทบคะแนน
- ส่งออก PDF หรือ Excel หนึ่งห้อง หนึ่งระดับ หลายห้อง หรือทุกห้อง
- ทำงานออฟไลน์ด้วย cache และ outbox ที่เข้ารหัสบนอุปกรณ์
- ภาษาไทย/English, System/Light/Dark/High Contrast และโหมดกระชับ
- ข้อมูลจำลอง 90 คนใน 6 ห้อง เพื่อทดสอบโดยไม่ใช้ข้อมูลจริง

## อุปกรณ์และเบราว์เซอร์

รองรับ Chrome, Edge และ Safari รุ่นปัจจุบันบน macOS, Windows, iPhone, iPad และ Android การติดตั้งเป็นแอปต้องเปิดผ่าน HTTPS ซึ่ง GitHub Pages จัดให้โดยอัตโนมัติ

## ภาพรวมการติดตั้งผ่าน Terminal

ลำดับทั้งหมดคือ:

1. ติดตั้ง Git, GitHub CLI, Node.js และ Google clasp
2. Login GitHub และ Google
3. Clone source code
4. ติดตั้ง dependencies และตรวจ build
5. สร้าง Apps Script project, deploy API และสร้างฐานข้อมูล
6. สร้าง GitHub repository, เปิด Pages และ push
7. เปิดแอป ใส่ Web App URL และเปลี่ยน PIN

คำสั่งด้านล่างใช้ placeholder เพื่อไม่ฝังข้อมูลส่วนตัวใน repository ให้เปลี่ยน `YOUR_SOURCE_OWNER` เป็นเจ้าของ source repository ที่ต้องการ clone

## macOS Terminal — ติดตั้งเครื่องมือ

หากยังไม่มี Homebrew ให้ติดตั้งจาก [brew.sh](https://brew.sh/) ก่อน จากนั้นเปิด Terminal ใหม่และคัดลอกคำสั่งชุดนี้:

```bash
xcode-select --install
brew install git gh node
npm install --global @google/clasp
git --version
gh --version
node --version
npm --version
clasp --version
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
npm install --global @google/clasp
git --version
gh --version
node --version
npm --version
clasp --version
```

## Login GitHub และ Google

ใช้ได้เหมือนกันทั้ง macOS Terminal และ Windows PowerShell:

```text
gh auth login
clasp login
```

สำหรับ GitHub ให้เลือก `GitHub.com` → `HTTPS` → `Login with a web browser` แล้วกรอกรหัสอุปกรณ์ในหน้าเว็บ สำหรับ Google ให้ยืนยันบัญชีที่เป็นเจ้าของ Spreadsheet/Drive ห้ามกรอกรหัสผ่านหรือ token ลงในไฟล์ของโครงการ

ตรวจสถานะหลัง Login:

```text
gh auth status
```

`clasp login` จะแจ้งทันทีหากบัญชี Google เชื่อมอยู่แล้ว ส่วนสถานะไฟล์ใน Apps Script project ตรวจได้ภายหลังด้วย `clasp status`

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

ผลที่ถูกต้องคือ tests ผ่าน, production build สำเร็จ และข้อความ `Verified 5 release files and PWA metadata.`

## สร้างและ Deploy Google Apps Script ผ่าน Terminal

คำสั่งชุดนี้สร้าง Apps Script แบบ standalone และบันทึก Script ID ไว้ใน `.clasp.json` เฉพาะเครื่อง ไฟล์นี้ถูก ignore และต้องไม่ commit

```text
clasp create --type standalone --title "KruNote API" --rootDir apps-script
clasp push --force
clasp deploy --description "KruNote initial deployment"
clasp deployments
```

คัดลอก Deployment ID ที่ขึ้นต้นด้วย `AKfy...` จากผลลัพธ์ แล้วสร้าง Web App URL

### macOS Terminal

```bash
export KRUNOTE_DEPLOYMENT_ID="PASTE_DEPLOYMENT_ID_HERE"
export KRUNOTE_WEB_APP_URL="https://script.google.com/macros/s/$KRUNOTE_DEPLOYMENT_ID/exec"
curl -L "$KRUNOTE_WEB_APP_URL?action=health"
npm run initialize:api -- "$KRUNOTE_WEB_APP_URL" --mock
```

### Windows PowerShell

```powershell
$KruNoteDeploymentId = "PASTE_DEPLOYMENT_ID_HERE"
$KruNoteWebAppUrl = "https://script.google.com/macros/s/$KruNoteDeploymentId/exec"
Invoke-RestMethod -Uri "$KruNoteWebAppUrl?action=health"
npm run initialize:api -- "$KruNoteWebAppUrl" --mock
```

`--mock` จะสร้างนักเรียนจำลอง 90 คน หากจะเริ่มด้วยฐานข้อมูลว่าง ให้ตัด `--mock` ออก ระบบจะแสดง PIN เริ่มต้นแบบสุ่มเพียงครั้งเดียว ให้จดไว้และเปลี่ยนทันทีเมื่อเข้าแอป

ผล health ที่ถูกต้องต้องมี `ok: true`, `apiVersion: 1.0.0` และ `installed: true` หลัง initialize สำเร็จ

> Web App เปิด endpoint แบบ Anyone เพื่อให้ GitHub Pages เรียกได้ แต่การอ่านและเขียนข้อมูลต้องผ่าน PIN session แบบหมดอายุ มี rate limit และข้อมูลออฟไลน์เข้ารหัสแล้ว ควรเก็บ Web App URL และ PIN เป็นส่วนตัว

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
2. วาง `KRUNOTE_WEB_APP_URL` หรือ `$KruNoteWebAppUrl`
3. กดตรวจและเชื่อมต่อ
4. ใส่ PIN เริ่มต้นที่แสดงจาก `initialize:api`
5. เปลี่ยน PIN เป็นตัวเลข 6–12 หลักทันที
6. ทดลองสร้างงาน เช็กชื่อ กรอกคะแนน และออก PDF/Excel ก่อนเพิ่มข้อมูลจริง

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

อัปเดต Apps Script โดยใช้ Deployment ID เดิม เพื่อให้ Web App URL ไม่เปลี่ยน:

```text
clasp push --force
clasp deployments
clasp deploy --deploymentId PASTE_EXISTING_DEPLOYMENT_ID --description "KruNote update"
```

หรือใช้คำสั่งช่วยที่มีในโครงการ:

```text
npm run deploy:web
npm run deploy:api
npm run status
```

## โครงสร้างข้อมูลและการสำรอง

Apps Script สร้าง Spreadsheet `KruNote Data` พร้อมชีตสำหรับปีการศึกษา ภาคเรียน ระดับ ห้อง นักเรียน ตารางสอน การเข้าเรียน งาน เป้าหมายห้อง การส่ง คะแนน พฤติกรรม เกณฑ์เกรด ผลเกรด งานส่งออก และ mutation log

- สำรองโดยทำสำเนา Spreadsheet และโฟลเดอร์ `KruNote Reports` ใน Drive
- ใช้ข้อมูลจำลองในการสาธิตหรือทดสอบเสมอ
- อย่า commit `.clasp.json`, `.clasprc.json`, PIN, Web App URL หรือข้อมูลนักเรียนจริง
- หากอุปกรณ์สูญหาย ให้เปลี่ยน PIN และสร้าง deployment ใหม่

## แก้ปัญหา

- `command not found`: ปิดและเปิด Terminal ใหม่ แล้วตรวจด้วยคำสั่ง `--version`
- `gh auth status` ไม่ผ่าน: รัน `gh auth login` ใหม่
- `clasp` เข้า Google ไม่ได้: รัน `clasp logout` แล้ว `clasp login`
- `Repository already exists`: เปลี่ยนชื่อใน `gh repo create` หรือใช้ repository ที่มีอยู่แล้วและเพิ่ม remote ด้วย `git remote add origin URL`
- Pages workflow ไม่เริ่ม: รัน `gh workflow run deploy-pages.yml`
- `/exec` พาไปหน้า Login: ตรวจว่า deployment ใช้ manifest รุ่นล่าสุดและ Web App อนุญาต Anyone
- `installed: false`: รัน `npm run initialize:api -- "WEB_APP_URL" --mock`
- เปิดแอปแล้วค้างที่ตรวจ PIN: รอ Apps Script cold start 10–30 วินาทีแล้วลองใหม่
- เปลี่ยน Web App URL: ตั้งค่า → ตัดการเชื่อมต่ออุปกรณ์นี้ แล้วเชื่อมใหม่
