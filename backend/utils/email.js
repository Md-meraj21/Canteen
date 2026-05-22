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

module.exports = { sendOtpEmail };
