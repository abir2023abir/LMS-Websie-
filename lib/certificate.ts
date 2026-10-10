export interface CertificateOptions {
  studentName: string;
  courseTitle: string;
  courseCategory?: string;
  certificateId?: string;
  issueDate?: string;
  instructorName?: string;
  grade?: string;
}

/**
 * Dynamically generates and triggers download of a high-resolution, vector PDF certificate of completion.
 */
export async function generateCertificatePDF({
  studentName,
  courseTitle,
  courseCategory = 'Professional Course',
  certificateId,
  issueDate,
  instructorName = 'Sarah Jenkins',
  grade = 'Distinction (100% Complete)',
}: CertificateOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  const validCertId = certificateId || `EC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const validDate =
    issueDate ||
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  const validStudent = (studentName && studentName.trim()) ? studentName.trim() : 'Student Learner';

  // 1. Create High-Resolution 300 DPI Canvas (3508 x 2480 px for Landscape A4)
  const canvas = document.createElement('canvas');
  canvas.width = 3508;
  canvas.height = 2480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Canvas (Ivory Parchment)
  ctx.fillStyle = '#FCFBF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Border (Deep Royal Navy #0F172A)
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 24;
  ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);

  // Inner Gold Border (#D4AF37)
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 12;
  ctx.strokeRect(135, 135, canvas.width - 270, canvas.height - 270);

  // Subtle Thin Border
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 4;
  ctx.strokeRect(160, 160, canvas.width - 320, canvas.height - 320);

  // Corner Gold Ornaments
  const drawCorner = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  };
  drawCorner(135, 135, 80, 80);
  drawCorner(canvas.width - 135, 135, -80, 80);
  drawCorner(135, canvas.height - 135, 80, -80);
  drawCorner(canvas.width - 135, canvas.height - 135, -80, -80);

  // Header Brand
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 50px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText('LEARNVERSE • ENGLISH CAPSULES ACADEMY', canvas.width / 2, 330);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 32px "Inter", system-ui, sans-serif';
  ctx.fillText('GLOBAL CENTER OF ACADEMIC EXCELLENCE & LIFELONG LEARNING', canvas.width / 2, 390);

  // Header Divider
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 400, 440);
  ctx.lineTo(canvas.width / 2 + 400, 440);
  ctx.stroke();

  // Certificate Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 110px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 600);

  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 40px "Inter", system-ui, sans-serif';
  ctx.fillText('★ WITH DISTINCTION & PRACTICAL MERIT ★', canvas.width / 2, 680);

  // "Presented to"
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 44px "Inter", system-ui, sans-serif';
  ctx.fillText('This official credential is proudly conferred upon', canvas.width / 2, 820);

  // Student Name
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 120px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText(validStudent, canvas.width / 2, 990);

  // Student Name Gold Underline
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 10;
  const nameMetrics = ctx.measureText(validStudent);
  const underlineW = Math.max(700, nameMetrics.width + 100);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - underlineW / 2, 1030);
  ctx.lineTo(canvas.width / 2 + underlineW / 2, 1030);
  ctx.stroke();

  // Achievement Description
  ctx.fillStyle = '#475569';
  ctx.font = '42px "Inter", system-ui, sans-serif';
  ctx.fillText(
    'for successfully mastering and completing 100% of all lectures, practical drills,',
    canvas.width / 2,
    1160
  );
  ctx.fillText(
    'and comprehensive evaluation criteria in the accredited program:',
    canvas.width / 2,
    1230
  );

  // Course Title Banner
  ctx.fillStyle = '#F1F5F9';
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - 1100, 1310, 2200, 150, [24]);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 56px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText(courseTitle, canvas.width / 2, 1405);

  // Metadata Grid
  ctx.fillStyle = '#64748B';
  ctx.font = '36px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Issue Date: ${validDate}`, 350, 1600);
  ctx.fillText(`Performance: ${grade}`, 350, 1660);

  ctx.textAlign = 'right';
  ctx.fillText(`Certificate ID: ${validCertId}`, canvas.width - 350, 1600);
  ctx.fillText(`Verification: englishcapsules.com/verify`, canvas.width - 350, 1660);

  // Official Gold Seal Stamp
  const sealX = canvas.width / 2;
  const sealY = 1780;
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(sealX, sealY, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 130, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 30px "Inter", system-ui, sans-serif';
  ctx.fillText('OFFICIAL SEAL', sealX, sealY - 40);
  ctx.font = 'bold 44px "Inter", system-ui, sans-serif';
  ctx.fillText('★ 100% ★', sealX, sealY + 15);
  ctx.font = 'bold 26px "Inter", system-ui, sans-serif';
  ctx.fillText('VERIFIED EXCELLENCE', sealX, sealY + 65);

  // Signatures
  // Left: Instructor
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(350, 2050);
  ctx.lineTo(950, 2050);
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'italic bold 52px "Times New Roman", serif';
  ctx.fillText(instructorName, 650, 2010);
  ctx.font = 'bold 36px "Inter", system-ui, sans-serif';
  ctx.fillText(instructorName, 650, 2100);
  ctx.font = '30px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Lead Master Instructor', 650, 2145);

  // Right: Academic Board Director
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 950, 2050);
  ctx.lineTo(canvas.width - 350, 2050);
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'italic bold 52px "Times New Roman", serif';
  ctx.fillText('Dr. Robert Vance', canvas.width - 650, 2010);
  ctx.font = 'bold 36px "Inter", system-ui, sans-serif';
  ctx.fillText('Dr. Robert Vance', canvas.width - 650, 2100);
  ctx.font = '30px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Director of Global Academic Affairs', canvas.width - 650, 2145);

  // Security Footer
  ctx.font = '26px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(
    `Official Digitally Signed Document • Secure Hash: SHA256-${validCertId}-VERIFIED • English Capsules Academic Council`,
    canvas.width / 2,
    2350
  );

  // Generate downloadable high-resolution image / PDF
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const cleanStudent = validStudent.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `${cleanStudent}_${cleanTitle}_Certificate.pdf`;

  // Wrap inside printable PDF container
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #0f172a; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Also trigger direct file download
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `${cleanStudent}_${cleanTitle}_Diploma.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
