import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = ".build/google-sheets";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Responses");
sheet.showGridLines = false;

sheet.getRange("A1:G2").values = [
  [
    "Received at (UTC)",
    "Submission ID",
    "Questionnaire",
    "Participant ID",
    "Schema version",
    "Source URL",
    "Response JSON"
  ],
  ["", "", "", "", "", "", ""]
];

sheet.getRange("A1:G1").format = {
  fill: "#E5E7EB",
  font: { name: "Arial", bold: true, color: "#111827", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { bottom: { style: "thin", color: "#9CA3AF" } }
};
sheet.getRange("A2:G2").format.font = { name: "Arial", size: 10, color: "#111827" };
sheet.getRange("A:A").format.columnWidthPx = 160;
sheet.getRange("B:B").format.columnWidthPx = 220;
sheet.getRange("C:C").format.columnWidthPx = 190;
sheet.getRange("D:D").format.columnWidthPx = 160;
sheet.getRange("E:E").format.columnWidthPx = 120;
sheet.getRange("F:F").format.columnWidthPx = 260;
sheet.getRange("G:G").format.columnWidthPx = 520;
sheet.getRange("A1:G2").format.rowHeightPx = 24;
sheet.freezePanes.freezeRows(1);

workbook.recalculate();
const verification = await workbook.inspect({
  kind: "table",
  range: "Responses!A1:G2",
  include: "values,formulas",
  tableMaxRows: 2,
  tableMaxCols: 7
});
console.log(verification.ndjson);
const preview = await workbook.render({ sheetName: "Responses", range: "A1:G2", scale: 1.5 });
await fs.writeFile(`${outputDir}/response-sheet-preview.png`, new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/bodymap-responses.xlsx`);
