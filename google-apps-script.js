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

function sanitize(val, maxLen) {
  if (!val) return '';
  var s = String(val).substring(0, maxLen || 1000);
  // Strip leading = + - @ to prevent spreadsheet formula injection
  s = s.replace(/^[\s]*[=+\-@]/, ' ');
  return s;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Bot check: honeypot field — if filled, silently discard
    if (data.website_url) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Bot check: JS challenge token must be present
    if (!data._token) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Basic validation — reject if missing required fields
    if (!data.name || !data.email || !data.project || !data.challenge) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Missing required fields.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid email.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getOrCreateSheet();

    var row = [
      new Date().toISOString(),
      sanitize(data.name, 200),
      sanitize(data.role, 100),
      sanitize(data.project, 200),
      sanitize(data.website, 500),
      sanitize(data.stage, 50),
      sanitize(data.helpNeeds, 500),
      sanitize(data.challenge, 2000),
      sanitize(data.questions, 2000),
      sanitize(data.l2interest, 50),
      sanitize(data.email, 320)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Submission failed.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Workshop form backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
