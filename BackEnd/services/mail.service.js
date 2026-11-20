const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getEnvBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter() {
  if (!isMailConfigured()) {
    throw new Error('SMTP is not configured');
  }

  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: getEnvBool(process.env.SMTP_SECURE, false),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

module.exports = {
  isMailConfigured,
  sendMail,
};

