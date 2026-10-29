const RESPONSE_SHEET_NAME = 'Responses';
const SPREADSHEET_ID = '10R2sZEqjP74xuvC-KCmJQw7vNjxi9TRlmH4CIZoWQIs';
const BODY_MAP_IMAGES_SHEET_NAME = 'Body Map Images';
const STEP_MAP_IMAGES_SHEET_NAME = 'Step Map Images';

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

    const renderedImages = Array.isArray(payload.renderedImages) ? payload.renderedImages : [];
    delete payload.renderedImages;
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
    saveRenderedImages(renderedImages, participantId, submissionId);
    return jsonResponse({ ok: true, submissionId: submissionId });
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid request.' }, 400);
  }
}

function saveRenderedImages(renderedImages, participantId, submissionId) {
  for (const item of renderedImages) {
    const trial = item.trial == null ? '' : String(item.trial);
    const stimulus = String(item.stimulus || 'stimulus');
    if (item.bodyMapPng) {
      appendImage(BODY_MAP_IMAGES_SHEET_NAME, participantId, submissionId, trial, stimulus, 'Body map', item.bodyMapPng);
    }
    if (item.stepMapPng) {
      appendImage(STEP_MAP_IMAGES_SHEET_NAME, participantId, submissionId, trial, stimulus, 'Steps', item.stepMapPng);
    }
  }
}

function appendImage(sheetName, participantId, submissionId, trial, stimulus, imageType, dataUrl) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 6).setValues([['Participant ID', 'Submission ID', 'Trial', 'Stimulus', 'Image type', 'Image']]);
    sheet.setFrozenRows(1);
  }
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 5).setValues([[participantId, submissionId, trial, stimulus, imageType]]);
  const blob = Utilities.newBlob(Utilities.base64Decode(dataUrl.replace(/^data:image\/png;base64,/, '')), 'image/png', participantId + '_' + trial + '_' + imageType.replace(/\s+/g, '_') + '.png');
  const image = sheet.insertImage(blob, 6, row);
  image.setWidth(540).setHeight(385);
  sheet.setRowHeight(row, 395);
}

function doGet() {
  return jsonResponse({ ok: true, service: 'bodymap-response-collector' });
}

function jsonResponse(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
