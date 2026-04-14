/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { GlossaryTerm, DialogueSimulation } from "../types";

export const exportGlossaryToPDF = (terms: GlossaryTerm[], domain: string) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(`Glossario: ${domain}`, 14, 22);
  
  const tableData = terms.map(t => [t.term, t.translation, t.context]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Termine', 'Traduzione', 'Contesto']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 }
  });
  
  doc.save(`glossario_${domain.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

export const exportGlossaryToExcel = (terms: GlossaryTerm[], domain: string) => {
  const worksheet = XLSX.utils.json_to_sheet(terms.map(t => ({
    Termine: t.term,
    Traduzione: t.translation,
    Contesto: t.context
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Glossario");
  XLSX.writeFile(workbook, `glossario_${domain.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
};

export const exportDialogueToPDF = (simulation: DialogueSimulation, domain: string, glossary: GlossaryTerm[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(`Simulazione: ${domain}`, 14, 22);
  
  // Scenario
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text("Scenario:", 14, 35);
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  const scenarioLines = doc.splitTextToSize(simulation.scenario, 180);
  doc.text(scenarioLines, 14, 42);
  
  let y = 42 + (scenarioLines.length * 6) + 15;
  
  // Dialogue
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text("Dialogo:", 14, y);
  y += 10;
  
  simulation.turns.forEach((turn) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`${turn.speaker} (${turn.language}):`, 14, y);
    y += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const textLines = doc.splitTextToSize(turn.text, 180);
    doc.text(textLines, 14, y);
    y += (textLines.length * 6) + 8;
  });

  // Glossary Section
  if (y > 250) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text("Glossario Utilizzato:", 14, y);
  y += 5;

  const tableData = glossary.map(t => [t.term, t.translation]);
  autoTable(doc, {
    startY: y,
    head: [['Termine', 'Traduzione']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 }
  });
  
  doc.save(`dialogo_${domain.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

export const exportDialogueToWord = async (simulation: DialogueSimulation, domain: string, glossary: GlossaryTerm[]) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `Simulazione: ${domain}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: "Scenario:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: simulation.scenario,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: "Dialogo:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        ...simulation.turns.flatMap(turn => [
          new Paragraph({
            children: [
              new TextRun({ text: `${turn.speaker} (${turn.language}):`, bold: true, color: "2563eb" }),
            ],
            spacing: { before: 200 },
          }),
          new Paragraph({
            text: turn.text,
            spacing: { after: 200 },
          }),
        ]),
        new Paragraph({
          text: "Glossario Utilizzato:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 800, after: 200 },
        }),
        ...glossary.map(t => new Paragraph({
          children: [
            new TextRun({ text: `${t.term}: `, bold: true }),
            new TextRun({ text: t.translation }),
          ],
          spacing: { after: 100 },
        })),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `dialogo_${domain.toLowerCase().replace(/\s+/g, '_')}.docx`);
};
