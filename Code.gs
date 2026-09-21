/**
 * Code.gs — Google Apps Script Backend
 * Scout Registration Form
 *
 * Deployment: Deploy as Web App
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * This script:
 *  1. Receives POST requests from the HTML form.
 *  2. Parses submitted JSON data.
 *  3. Appends a row to a Google Sheet.
 *  4. Returns a JSON success/error response.
 *  5. Handles CORS via doOptions().
 */

// ──────────────────────────────────────────────────
// ⚙️  CONFIGURATION — Update this value!
// ──────────────────────────────────────────────────

/**
 * The ID of your Google Sheet.
 * Find it in the Sheet URL:
 *   https://docs.google.com/spreadsheets/d/  <<<SPREADSHEET_ID>>>  /edit
 */
var SPREADSHEET_ID = '1-JtjMrXKufobI1XbIC_3SsVL7OIOpPLLO7UI1qXQ7jg';

/**
 * The name of the sheet (tab) where data will be saved.
 * Default is "Registrations" — change if needed.
 */
var SHEET_NAME = 'Registrations';

// ──────────────────────────────────────────────────
// COLUMN HEADERS
// These will be written on the first row automatically.
// ──────────────────────────────────────────────────
var HEADERS = [
  'Timestamp',
  'Name',
  'Mobile',
  'WhatsApp',
  'Institution',
  'Class',
  'Subject/Group',
  'Gender',
  'Scouting Experience',
  'Scouting Details'
];

// ──────────────────────────────────────────────────
// CORS PREFLIGHT HANDLER
// Responds to OPTIONS requests from the browser.
// ──────────────────────────────────────────────────
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ──────────────────────────────────────────────────
// POST HANDLER
// ──────────────────────────────────────────────────
function doPost(e) {
  try {
    // --- Parse incoming data ---
    var raw  = e.postData ? e.postData.contents : '';
    var data = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        // Fallback: try URL-encoded form data
        data = {};
        var pairs = raw.split('&');
        pairs.forEach(function(pair) {
          var kv = pair.split('=');
          if (kv.length === 2) {
            data[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1].replace(/\+/g, ' '));
          }
        });
      }
    }

    // --- Sanitize & extract fields ---
    var name               = sanitize(data.name);
    var mobile             = sanitize(data.mobile);
    var whatsapp           = sanitize(data.whatsapp);
    var institution        = sanitize(data.institution);
    var studentClass       = sanitize(data.class);
    var subjectGroup       = sanitize(data.subject_group);
    var gender             = sanitize(data.gender);
    var scoutingExperience = sanitize(data.scouting_experience);
    var scoutingDetails    = sanitize(data.scouting_details);
    var timestamp          = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

    // --- Basic server-side validation ---
    if (!name || !mobile || !whatsapp || !institution || !studentClass || !gender || !scoutingExperience) {
      return jsonResponse({ success: false, message: 'Required fields are missing.' }, 400);
    }

    // Validate BD mobile format on server side too
    var mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(mobile)) {
      return jsonResponse({ success: false, message: 'Invalid mobile number format.' }, 400);
    }
    if (!mobileRegex.test(whatsapp)) {
      return jsonResponse({ success: false, message: 'Invalid WhatsApp number format.' }, 400);
    }

    // --- Write to Google Sheet ---
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create the sheet if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Write headers on row 1 if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      // Style the header row
      var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground('#1a7a3c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Append the data row
    sheet.appendRow([
      timestamp,
      name,
      mobile,
      whatsapp,
      institution,
      studentClass,
      subjectGroup,
      gender,
      scoutingExperience,
      scoutingDetails
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, HEADERS.length);

    return jsonResponse({ success: true, message: 'Data saved successfully.' }, 200);

  } catch (err) {
    Logger.log('Error in doPost: ' + err.toString());
    return jsonResponse({ success: false, message: 'Server error: ' + err.message }, 500);
  }
}

// ──────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────

/**
 * Trims whitespace and converts non-strings safely.
 * @param {*} value
 * @returns {string}
 */
function sanitize(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Returns a JSON ContentService response with CORS headers.
 * NOTE: GAS ContentService does not support custom headers directly,
 * but setting Content-Type to JSON is sufficient for most cases.
 * @param {Object} obj    - The response object to serialize.
 * @param {number} status - HTTP status code (informational only; GAS always returns 200).
 * @returns {TextOutput}
 */
function jsonResponse(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
