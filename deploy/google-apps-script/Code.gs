const RESPONSE_SHEET_NAME = 'Responses';
const SPREADSHEET_ID = '10R2sZEqjP74xuvC-KCmJQw7vNjxi9TRlmH4CIZoWQIs';

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents || '{}');
    const payload = request.payload;
    if (!payload || typeof payload !== 'object') {
      return jsonResponse({ ok: false, error: 'Missing payload.' }, 400);
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESPONSE_SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Responses sheet is missing.' }, 500);
    }

    const participantId = String(payload.participantId || 'anonymous');
    const questionnaire = String(request.questionnaire || payload.study || 'unknown');
    const schemaVersion = payload.schemaVersion == null ? '' : String(payload.schemaVersion);
    const sourceUrl = String(request.sourceUrl || '');
    const submissionId = Utilities.getUuid();

    sheet.appendRow([
      new Date().toISOString(),
      submissionId,
      questionnaire,
      participantId,
      schemaVersion,
      sourceUrl,
      JSON.stringify(payload)
    ]);
    return jsonResponse({ ok: true, submissionId: submissionId });
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid request.' }, 400);
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'bodymap-response-collector' });
}

function jsonResponse(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
