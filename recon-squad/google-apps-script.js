// Google Apps Script — Recon Squad Interest Form Backend
//
// SETUP (3 minutes):
// 1. Go to https://script.google.com → New Project
// 2. Replace all code with this entire file
// 3. Click Run → select "setup" → Run (this creates your Google Sheet)
// 4. Authorize when prompted (it needs permission to create/edit sheets)
// 5. Check your Google Drive — "Recon Squad Applications" sheet is now there
// 6. Click Deploy → New deployment → Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 7. Click Deploy → copy the URL
// 8. In Vercel dashboard → Settings → Environment Variables:
//    Add NEXT_PUBLIC_GOOGLE_SCRIPT_URL = the URL you just copied
// 9. Redeploy on Vercel (Deployments → ... → Redeploy)
//
// That's it. Submissions will appear in your Google Sheet.

const SPREADSHEET_NAME = "Recon Squad Applications";
const SHEET_NAME = "Submissions";

// Returns or creates the spreadsheet
function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  const sheet = ss.getActiveSheet();
  sheet.setName(SHEET_NAME);
  sheet
    .getRange(1, 1, 1, 7)
    .setValues([
      ["Timestamp", "Role", "Wallet", "Twitter", "Products Used", "Pitch", "Status"],
    ]);
  sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
  sheet.setFrozenRows(1);
  // Auto-size columns
  for (let i = 1; i <= 7; i++) sheet.autoResizeColumn(i);
  // Color header row
  sheet.getRange(1, 1, 1, 7).setBackground("#F54B00").setFontColor("#ffffff");
  return ss;
}

// Run this once to create the spreadsheet
function setup() {
  const ss = getOrCreateSpreadsheet();
  Logger.log("Sheet created: " + ss.getUrl());
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.role || "",
      data.wallet || "",
      data.twitter || "",
      data.products || "",
      data.pitch || "",
      "New",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Recon Squad backend is running.");
}
