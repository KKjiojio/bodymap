# Bodily Sensation Mapping questionnaires

## Active questionnaires

- `bodymap_questionnaire_revised.html` — the combined bilingual questionnaire. It currently runs Section A (music and stories); its video Section B intentionally remains disabled until three researcher-confirmed videos are configured.
- `sated_questionnaire/sated_questionnaire.html` — the standalone SATED video questionnaire, with its video files in `sated_questionnaire/stimuli/`.

Both questionnaires are static HTML files. Their images and media use relative paths, so keep each active HTML file alongside the folders and images listed above.

## Supporting files

- `stimuli/` — WAV audio clips used by the combined questionnaire.
- `front.jpg`, `back.jpg` — body-map templates used by the combined questionnaire.
- `sated_questionnaire/front.jpg`, `sated_questionnaire/back.jpg` — templates used by the SATED questionnaire.
- `archive/revised-backups/` — dated backup copies of the combined questionnaire. They are preserved for recovery and are not used by either active questionnaire.

## Older prototypes

- `index.html`
- `bodymap_questionnaire_steps.html`

These are retained unchanged as earlier prototypes. The active files above should be used for testing and deployment.

## Online collection

GitHub Pages is suitable for hosting the static questionnaires, but participant responses should be submitted to a separate HTTPS collection endpoint. Do not place a GitHub personal-access token or other write credential in an HTML file.
