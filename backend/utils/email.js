const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    text: `Your ${purpose} OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2>${subject}</h2>
        <p>Your ${purpose} OTP is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
        <p>This OTP will expire in 10 minutes. If you did not request it, ignore this email.</p>
      </div>
    `,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

const sendAdminNotification = async ({ subject, text, html }) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    console.warn('Admin notification email skipped: ADMIN_NOTIFICATION_EMAIL, ADMIN_EMAIL, or SMTP_USER is not configured.');
    return;
  }

  try {
    await sendEmail({ to: adminEmail, subject, text, html });
  } catch (error) {
    console.error(`Admin notification email failed: ${error.message}`);
  }
};

module.exports = { sendOtpEmail, sendEmail, sendAdminNotification };
