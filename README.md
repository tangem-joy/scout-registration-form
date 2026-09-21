# 🏕️ Scout Registration Form

A modern, mobile-responsive Scout registration form built with pure HTML, CSS, and JavaScript — designed to be hosted on **GitHub Pages** with **Google Apps Script** as the backend for storing responses in a Google Sheet.

---

## 📁 Project Structure

```
scout-registration-form/
├── index.html   ← Form UI
├── style.css    ← All styles
├── script.js    ← Validation, submission logic
├── Code.gs      ← Google Apps Script backend
└── README.md    ← This file
```

---

## 🚀 Setup Guide

### Step 1 — Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it something like `Scout Registrations 2026`.
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  <<<COPY THIS>>>  /edit
   ```

---

### Step 2 — Open the Apps Script Editor

1. In your Google Sheet, click the menu:
   **Extensions → Apps Script**
2. A new Apps Script project will open in a browser tab.

---

### Step 3 — Paste Code.gs

1. In the Apps Script editor, you will see a default file called `Code.gs`.
2. **Delete** all existing content in `Code.gs`.
3. **Copy** the entire contents of the `Code.gs` file from this project.
4. **Paste** it into the Apps Script editor.

---

### Step 4 — Set Your Spreadsheet ID

In `Code.gs`, find this line near the top:

```javascript
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

Replace `YOUR_SPREADSHEET_ID_HERE` with the ID you copied in Step 1:

```javascript
var SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'; // example
```

Also verify the sheet tab name matches:

```javascript
var SHEET_NAME = 'Registrations'; // rename if you prefer a different tab name
```

---

### Step 5 — Save the Script

Press **Ctrl + S** (or **Cmd + S** on Mac) to save the script, or click the floppy disk icon.

---

### Step 6 — Deploy as a Web App

1. Click the blue **Deploy** button (top right) → **New deployment**.
2. Click the **gear icon ⚙️** next to "Type" → Select **Web app**.
3. Fill in the settings:
   | Setting | Value |
   |---|---|
   | **Description** | Scout Registration Form Backend |
   | **Execute as** | **Me** (your Google account) |
   | **Who has access** | **Anyone** |

   > ⚠️ **Important:** "Who has access" must be set to **Anyone** — otherwise the form cannot submit data from GitHub Pages.

4. Click **Deploy**.
5. Google will ask you to **authorize** the script. Click **Authorize access** → choose your Google account → click **Allow**.

---

### Step 7 — Copy the Web App URL

After deployment, you will see a dialog with a **Web app URL** that looks like:

```
https://script.google.com/macros/s/AKfycby.../exec
```

**Copy this URL** — you will need it in the next step.

---

### Step 8 — Paste the URL into script.js

1. Open `script.js` in a text editor.
2. Find this line near the top:
   ```javascript
   const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
   ```
3. Replace it with your actual URL:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby.../exec";
   ```
4. Save `script.js`.

---

### Step 9 — Upload to GitHub

1. Create a new repository on [GitHub](https://github.com):
   - Click **New repository**
   - Name it: `scout-registration-form` (or any name you prefer)
   - Set visibility to **Public**
   - Do **not** initialize with README (you already have one)
   - Click **Create repository**

2. Upload your files. You can use either method:

   **Method A — GitHub Web Upload (No Git required):**
   - Click **Add file → Upload files**
   - Drag and drop all 4 files: `index.html`, `style.css`, `script.js`, `README.md`
   - Click **Commit changes**

   **Method B — Git command line:**
   ```bash
   git init
   git add index.html style.css script.js README.md
   git commit -m "Initial commit: Scout Registration Form"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/scout-registration-form.git
   git push -u origin main
   ```

   > 📌 You do **not** need to upload `Code.gs` to GitHub — it lives in Google Apps Script.

---

### Step 10 — Enable GitHub Pages

1. In your GitHub repository, click **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Source**, select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**.
5. Wait 1–2 minutes, then visit your form at:
   ```
   https://YOUR_USERNAME.github.io/scout-registration-form/
   ```

---

## ✅ Testing the Form

1. Open your GitHub Pages URL (or open `index.html` directly in a browser for local testing).
2. Fill in all required fields.
3. Click **নিবন্ধন সম্পন্ন করুন**.
4. You should see the success message: **"আপনার তথ্য সফলভাবে জমা হয়েছে। ধন্যবাদ।"**
5. Open your Google Sheet — a new row should appear with all submitted data.

---

## 🔧 Troubleshooting

### ❌ Form submits but no data appears in the Sheet

- **Check the SCRIPT_URL** in `script.js` — make sure it ends with `/exec`, not `/dev`.
- **Re-deploy the script:** Any changes to `Code.gs` require a **new deployment**. Go to Deploy → Manage deployments → Create new version.
- **Check Authorization:** Open Apps Script → Run the `doPost` function manually → Confirm any authorization prompts.
- **Check Spreadsheet ID:** Open `Code.gs` and verify `SPREADSHEET_ID` matches your sheet.

---

### ❌ CORS Error in Browser Console

- Ensure "Who has access" in deployment settings is set to **Anyone** (not "Anyone with Google account").
- The script uses `mode: 'no-cors'` in `fetch()` which avoids CORS errors for most cases.
- If you need to read the response body (for debugging), temporarily change `mode: 'no-cors'` to `mode: 'cors'` in `script.js` and redeploy the Apps Script.

---

### ❌ "Script URL কনফিগার করা হয়নি" warning

- This means `SCRIPT_URL` in `script.js` still says `"YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"`.
- Follow **Step 8** above to paste your actual Web App URL.

---

### ❌ Form validates but shows error after submission

- Open browser DevTools (F12) → Console tab → Look for any network or JavaScript errors.
- Open Apps Script → View → Logs → Check for server-side errors.

---

### ❌ GitHub Pages shows 404

- Make sure `index.html` is in the **root** of the repository (not inside a subfolder).
- Allow 2–3 minutes after enabling GitHub Pages for the site to go live.

---

## 🔒 Security Notes

- **No private credentials** are stored in the frontend code.
- The `SPREADSHEET_ID` is only in `Code.gs` (server-side) — never exposed to users.
- The Google Sheet is only accessible by your Google account.
- The Web App URL is public (required for form submissions) but can only **append** rows — it cannot read or delete existing data.

---

## 📋 Form Fields Reference

| Field | Type | Required | Validation |
|---|---|---|---|
| নাম (Name) | Text | ✅ | Min 2 characters |
| মোবাইল নাম্বার | Tel | ✅ | BD format: 01[3-9]XXXXXXXX |
| WhatsApp Number | Tel | ✅ | BD format: 01[3-9]XXXXXXXX |
| প্রতিষ্ঠানের নাম | Text | ✅ | Non-empty |
| বর্তমান ক্লাস | Dropdown | ✅ | Must select an option |
| বিষয় / গ্রুপ | Text | ❌ | Optional |
| স্কাউটিং অভিজ্ঞতা | Radio | ✅ | হ্যাঁ or না |
| অভিজ্ঞতার বিবরণ | Textarea | ❌ | Shown only when "হ্যাঁ" selected |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | GitHub Pages (static, free) |
| Backend | Google Apps Script (serverless) |
| Database | Google Sheets |
| Fonts | Google Fonts (Inter + Hind Siliguri) |

---

## 📞 Support

If you run into issues not covered here, try:
1. Checking the [Google Apps Script documentation](https://developers.google.com/apps-script)
2. Checking the [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Opening the browser console (F12) for frontend error details
4. Checking Apps Script Logs (**View → Logs**) for backend error details

---

*Made with 💚 for Scout registration management.*
