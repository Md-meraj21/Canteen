const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service is not configured. Add SMTP_USER and SMTP_PASS.');
  }

  // Use nodemailer built-in 'gmail' service for Gmail to prevent ENETUNREACH IPv6 issues on Render
  if (!SMTP_HOST || SMTP_HOST.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  const port = Number(SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: port,
    secure: port === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendOtpEmailInBackground = ({ to, subject, otp, purpose }) => {
  sendOtpEmail({ to, subject, otp, purpose }).catch((error) => {
    console.error(`OTP email failed for ${to}: ${error.message}`);
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

module.exports = { sendOtpEmail, sendOtpEmailInBackground, sendEmail, sendAdminNotification };
