import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function latin(value: unknown, fallback = '') {
  const cleaned = String(value || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function center(pageWidth: number, text: string, size: number, font: { widthOfTextAtSize: (text: string, size: number) => number }) {
  return (pageWidth - font.widthOfTextAtSize(text, size)) / 2;
}

export type CertificatePdfInput = {
  id: string;
  studentName: string;
  course: string;
  date: string;
  hours?: string;
  instructorName?: string;
  verifyUrl?: string;
};

/** Landscape A4 certificate. Standard fonts only, so it prints without missing glyphs. */
export async function buildCertificatePdf(input: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const { width, height } = page.getSize();
  const ink = rgb(0.067, 0.09, 0.15);
  const gold = rgb(0.83, 0.69, 0.22);
  const muted = rgb(0.33, 0.36, 0.4);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.992, 0.984, 0.96) });
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: ink, borderWidth: 2.5 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: gold, borderWidth: 1.5 });

  page.drawText('CAREER BRIDGE.STUDIO', { x: center(width, 'CAREER BRIDGE.STUDIO', 13, bold), y: height - 78, size: 13, font: bold, color: ink });
  page.drawText('Practical learning for your next step', { x: center(width, 'Practical learning for your next step', 11, italic), y: height - 96, size: 11, font: italic, color: muted });

  const title = 'Certificate of Completion';
  page.drawText(title, { x: center(width, title, 32, bold), y: height - 150, size: 32, font: bold, color: ink });

  const intro = 'This certifies that';
  page.drawText(intro, { x: center(width, intro, 13, regular), y: height - 186, size: 13, font: regular, color: muted });

  const name = latin(input.studentName, 'Student');
  const nameSize = name.length > 34 ? 22 : 28;
  page.drawText(name, { x: center(width, name, nameSize, bold), y: height - 228, size: nameSize, font: bold, color: ink });
  const nameWidth = bold.widthOfTextAtSize(name, nameSize);
  page.drawLine({ start: { x: (width - nameWidth) / 2, y: height - 236 }, end: { x: (width + nameWidth) / 2, y: height - 236 }, thickness: 0.6, color: gold });

  const completed = 'has successfully completed';
  page.drawText(completed, { x: center(width, completed, 13, regular), y: height - 268, size: 13, font: regular, color: muted });

  const course = latin(input.course, 'Course');
  const courseSize = course.length > 52 ? 14 : 18;
  page.drawText(course, { x: center(width, course, courseSize, bold), y: height - 298, size: courseSize, font: bold, color: ink });

  const hours = latin(input.hours);
  const instructor = latin(input.instructorName);
  const facts = [
    hours ? `Duration: ${hours}` : '',
    instructor ? `Instructor: ${instructor}` : '',
    `Date of issue: ${latin(input.date, new Date().toISOString().slice(0, 10))}`,
  ].filter(Boolean).join('    ·    ');
  const factSize = facts.length > 90 ? 10 : 12;
  page.drawText(facts, { x: center(width, facts, factSize, regular), y: height - 336, size: factSize, font: regular, color: ink });

  const criteria = 'Completion criteria: required lessons in this course were finished.';
  page.drawText(criteria, { x: center(width, criteria, 10, italic), y: height - 358, size: 10, font: italic, color: muted });

  const signY = 118;
  const left = 90;
  const right = width - 250;
  page.drawLine({ start: { x: left, y: signY }, end: { x: left + 160, y: signY }, thickness: 0.8, color: ink });
  page.drawLine({ start: { x: right, y: signY }, end: { x: right + 160, y: signY }, thickness: 0.8, color: ink });
  page.drawText(instructor || 'Course instructor', { x: left, y: signY - 16, size: 10, font: bold, color: ink });
  page.drawText('Instructor', { x: left, y: signY - 30, size: 9, font: regular, color: muted });
  page.drawText('Career Bridge.Studio', { x: right, y: signY - 16, size: 10, font: bold, color: ink });
  page.drawText('Issuing administrator', { x: right, y: signY - 30, size: 9, font: regular, color: muted });

  const sealX = width / 2;
  const sealY = 128;
  page.drawCircle({ x: sealX, y: sealY, size: 34, borderColor: gold, borderWidth: 2 });
  page.drawCircle({ x: sealX, y: sealY, size: 28, borderColor: ink, borderWidth: 0.8 });
  const seal = 'OFFICIAL';
  page.drawText(seal, { x: sealX - bold.widthOfTextAtSize(seal, 7) / 2, y: sealY - 2, size: 7, font: bold, color: ink });

  const serial = `Certificate ID: ${latin(input.id, 'CBS')}`;
  page.drawText(serial, { x: 48, y: 52, size: 10, font: bold, color: ink });
  const verify = latin(input.verifyUrl);
  if (verify) {
    const line = `Verify: ${verify}`;
    const size = line.length > 88 ? 8 : 9;
    page.drawText(line, { x: 48, y: 38, size, font: regular, color: muted });
  }

  return Buffer.from(await pdf.save());
}
