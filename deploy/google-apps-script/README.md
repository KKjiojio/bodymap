# Google Apps Script response collector

This script receives a questionnaire JSON payload and appends it to the `Responses` worksheet in the linked Google Sheet.

Deploy it as a Web app with:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the resulting `/exec` URL into the `RESPONSE_ENDPOINT` constant in both active questionnaire files. The browser code sends no Google or GitHub credential.
