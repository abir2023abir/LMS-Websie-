import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function latin(value: string, fallback: string) {
  const cleaned = value.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

export async function buildCertificatePdf(input: { id: string; studentName: string; course: string; date: string }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const { width, height } = page.getSize();
  const ink = rgb(0.067, 0.094, 0.153);
  const gold = rgb(0.98, 0.8, 0.082);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 0.992, 0.95) });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: ink, borderWidth: 3 });
  page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: gold, borderWidth: 2 });

  const title = 'Certificate of Completion';
  const titleWidth = bold.widthOfTextAtSize(title, 36);
  page.drawText('ENGLISH CAPSULES', { x: 70, y: height - 110, size: 13, font: bold, color: ink });
  page.drawText(title, { x: (width - titleWidth) / 2, y: height - 180, size: 36, font: bold, color: ink });

  const intro = 'This certifies that';
  page.drawText(intro, { x: (width - regular.widthOfTextAtSize(intro, 16)) / 2, y: height - 230, size: 16, font: regular, color: rgb(0.3, 0.33, 0.38) });

  const name = latin(input.studentName, 'Student');
  const nameSize = name.length > 32 ? 26 : 34;
  page.drawText(name, { x: (width - bold.widthOfTextAtSize(name, nameSize)) / 2, y: height - 285, size: nameSize, font: bold, color: ink });

  const line = 'has completed the course';
  page.drawText(line, { x: (width - regular.widthOfTextAtSize(line, 16)) / 2, y: height - 330, size: 16, font: regular, color: rgb(0.3, 0.33, 0.38) });

  const course = latin(input.course, 'English Capsule');
  const courseSize = course.length > 48 ? 16 : 22;
  page.drawText(course, { x: (width - bold.widthOfTextAtSize(course, courseSize)) / 2, y: height - 375, size: courseSize, font: bold, color: ink });

  const date = `Date: ${latin(input.date, new Date().toISOString().slice(0, 10))}`;
  page.drawText(date, { x: 70, y: 78, size: 13, font: regular, color: ink });
  page.drawText(`Certificate ID: ${latin(input.id, 'EC')}`, { x: width - 280, y: 78, size: 12, font: regular, color: rgb(0.35, 0.38, 0.42) });

  return Buffer.from(await pdf.save());
}
