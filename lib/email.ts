import nodemailer from 'nodemailer';

export interface WelcomeEmailPayload {
  toEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  transactionId?: string;
  amountPaid?: number | string;
}

/**
 * Generates the luxury branded HTML template for the English Capsules Welcome & Getting Started email.
 */
export function generateWelcomeEmailHTML(payload: WelcomeEmailPayload): string {
  const { studentName, courseTitle, courseId, transactionId, amountPaid } = payload;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const classroomUrl = `${baseUrl}/student/learn/${courseId}`;
  const dashboardUrl = `${baseUrl}/student`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to English Capsules</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background: rgba(250, 204, 21, 0.15); border: 1px solid #FACC15; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #FACC15; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .title { font-size: 26px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 14px; color: #94a3b8; margin: 0; }
    .content { padding: 35px 30px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .course-card { background: #fefce8; border: 1px solid #fef08a; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .course-title { font-size: 16px; font-weight: 800; color: #854d0e; margin: 0 0 8px 0; }
    .course-detail { font-size: 12px; color: #713f12; margin: 3px 0; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; background: #FACC15; color: #111827; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3); }
    .steps-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .step-item { display: flex; align-items: flex-start; margin-bottom: 14px; }
    .step-num { background: #111827; color: #FACC15; border-radius: 8px; width: 22px; height: 22px; display: inline-block; text-align: center; line-height: 22px; font-size: 11px; font-weight: 800; margin-right: 12px; flex-shrink: 0; }
    .step-text { font-size: 13px; color: #334155; line-height: 1.4; }
    .footer { background: #f1f5f9; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">ENGLISH CAPSULES ACADEMY</div>
      <h1 class="title">You're Enrolled & Ready to Speak! 🚀</h1>
      <p class="subtitle">Your learning journey begins today</p>
    </div>

    <div class="content">
      <div class="greeting">Hi ${studentName},</div>
      <p class="text">
        Congratulations on taking a decisive step toward English fluency! We are thrilled to welcome you to the <strong>English Capsules</strong> learning community. Your enrollment has been confirmed.
      </p>

      <div class="course-card">
        <div class="course-title">📖 ${courseTitle}</div>
        <div class="course-detail"><strong>Status:</strong> Lifetime Access Activated</div>
        ${amountPaid ? `<div class="course-detail"><strong>Investment:</strong> ৳${amountPaid} BDT</div>` : ''}
        ${transactionId ? `<div class="course-detail"><strong>Transaction ID:</strong> ${transactionId}</div>` : ''}
      </div>

      <div class="btn-container">
        <a href="${classroomUrl}" class="btn">Start Your First Lecture Now →</a>
      </div>

      <div class="steps-box">
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          ⚡ 3 Quick Steps to Get Started:
        </div>
        <div class="step-item">
          <span class="step-num">1</span>
          <span class="step-text"><strong>Enter the Classroom:</strong> Watch Module 1 lectures and download your practice audio drills.</span>
        </div>
        <div class="step-item">
          <span class="step-num">2</span>
          <span class="step-text"><strong>Take the Knowledge Checks:</strong> Reinforce your vocabulary with interactive quizzes after each session.</span>
        </div>
        <div class="step-item" style="margin-bottom: 0;">
          <span class="step-num">3</span>
          <span class="step-text"><strong>Earn Your Verified Certificate:</strong> Reach 100% completion to unlock your official diploma with registry verification.</span>
        </div>
      </div>

      <p class="text" style="font-size: 13px;">
        Need help or have questions? Our student advisors are available 24/7 at <a href="mailto:support@englishcapsules.com" style="color: #ca8a04; font-weight: 700; text-decoration: none;">support@englishcapsules.com</a> or via your <a href="${dashboardUrl}" style="color: #0f172a; font-weight: 700;">Student Dashboard</a>.
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} English Capsules Academy. All rights reserved.<br>
      Dhaka, Bangladesh • Certified English Learning & Fluency Programs
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Dispatches the welcome email using SMTP or simulated logger in development/demo environments.
 */
export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const { toEmail, studentName, courseTitle } = payload;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM || '"English Capsules Academy" <admissions@englishcapsules.com>';

  const htmlContent = generateWelcomeEmailHTML(payload);

  // If SMTP credentials are configured, send real email
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to: toEmail,
        subject: `Welcome to ${courseTitle} — Your English Capsules Journey Begins! 🎓`,
        html: htmlContent,
      });

      console.log(`[Email Service] Welcome email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[Email Service] Error sending real email via SMTP:', err);
      // Fallback gracefully without breaking checkout
      return { success: false, simulated: true };
    }
  }

  // Simulated development / sandbox mode
  console.log(`[Email Service - Simulated Sandbox] Personalized Welcome Email queued for ${studentName} <${toEmail}> for course: "${courseTitle}".`);
  return {
    success: true,
    simulated: true,
    messageId: `simulated_msg_${Date.now()}`,
  };
}
