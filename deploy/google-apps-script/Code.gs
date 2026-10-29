const RESPONSE_SHEET_NAME = 'Responses';
const SPREADSHEET_ID = '10R2sZEqjP74xuvC-KCmJQw7vNjxi9TRlmH4CIZoWQIs';
const BODY_MAP_IMAGES_SHEET_NAME = 'Body Map Images';
const STEP_MAP_IMAGES_SHEET_NAME = 'Step Map Images';
const JAPAN_TIME_ZONE = 'Asia/Tokyo';

function receivedAtJst() {
  return Utilities.formatDate(new Date(), JAPAN_TIME_ZONE, "yyyy-MM-dd HH:mm:ss.SSS 'JST'");
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents || '{}');
    if (request.kind === 'images') {
      const submissionId = String(request.submissionId || '');
      const participantId = String(request.participantId || 'anonymous');
      const renderedImages = Array.isArray(request.renderedImages) ? request.renderedImages : [];
      if (!submissionId || !renderedImages.length) return jsonResponse({ ok: false, error: 'Missing image payload.' }, 400);
      saveRenderedImages(renderedImages, participantId, submissionId);
      return jsonResponse({ ok: true, submissionId: submissionId, images: renderedImages.length });
    }
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

    sheet.getRange(1, 1).setValue('Received at (JST)');
    sheet.appendRow([
      receivedAtJst(),
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
  const imageKey = ['image', submissionId, trial, imageType].join(':');
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty(imageKey)) return;
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, 6).setValues([['Participant ID', 'Submission ID', 'Trial', 'Stimulus', 'Image type', 'Image']]);
    sheet.setFrozenRows(1);
  }
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 5).setValues([[participantId, submissionId, trial, stimulus, imageType]]);
  const blob = Utilities.newBlob(Utilities.base64Decode(dataUrl.substring(dataUrl.indexOf(',') + 1)), 'image/png', participantId + '_' + trial + '_' + imageType.split(' ').join('_') + '.png');
  const image = sheet.insertImage(blob, 6, row);
  image.setWidth(540).setHeight(385);
  sheet.setRowHeight(row, 395);
  properties.setProperty(imageKey, 'saved');
}

function doGet() {
  return jsonResponse({ ok: true, service: 'bodymap-response-collector' });
}

function jsonResponse(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
