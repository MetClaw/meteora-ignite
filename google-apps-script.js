// ═══════════════════════════════════════════════════════════════
// Google Apps Script — Workshop Form Backend
// ═══════════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS:
//
// 1. Go to https://script.google.com and create a new project
// 2. Paste this entire file into the editor (replace any existing code)
// 3. Click "Deploy" > "New deployment"
// 4. Select type: "Web app"
// 5. Set:
//    - Description: "Workshop Form Backend"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 6. Click "Deploy" and authorize when prompted
// 7. Copy the Web App URL
// 8. Paste it into workshop-form.html where it says YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
//
// The script auto-creates a Google Sheet called "Meteora Workshop Registrations"
// in your Google Drive on first submission.
// ═══════════════════════════════════════════════════════════════

const SHEET_NAME = 'Meteora Workshop Registrations';
const HEADERS = [
  'Timestamp',
  'Name',
  'Role',
  'Project',
  'Website',
  'Stage',
  'Help Needs',
  'Biggest Challenge',
  'Questions',
  'L2 Interest',
  'Email'
];

function getOrCreateSheet() {
  const files = DriveApp.getFilesByName(SHEET_NAME);

  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.open(file).getActiveSheet();
  }

  // Create new spreadsheet
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const sheet = ss.getActiveSheet();

  // Set headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Bold headers
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (let i = 1; i <= HEADERS.length; i++) {
    sheet.setColumnWidth(i, 180);
  }

  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    const row = [
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.role || '',
      data.project || '',
      data.website || '',
      data.stage || '',
      data.helpNeeds || '',
      data.challenge || '',
      data.questions || '',
      data.l2interest || '',
      data.email || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Workshop form backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
