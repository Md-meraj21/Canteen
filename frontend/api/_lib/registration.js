const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const OTP_TTL_MINUTES = 10;

let cachedClient;

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const getDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }

  return cachedClient.db();
};

const createOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = (otp) => crypto
  .createHash('sha256')
  .update(`${otp}:${process.env.JWT_SECRET}`)
  .digest('hex');

const otpExpiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service is not configured');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || SMTP_USER,
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

const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const requireMethod = (req, res, method) => {
  if (req.method !== method) {
    json(res, 405, { error: 'Method not allowed' });
    return false;
  }

  return true;
};

module.exports = {
  bcrypt,
  createOtp,
  getDb,
  hashOtp,
  json,
  otpExpiry,
  readBody,
  requireMethod,
  sendOtpEmail,
};
