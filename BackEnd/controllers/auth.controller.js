const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../utils/db.util');
const User = require('../models/user.model');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');
const { sendMail, isMailConfigured } = require('../services/mail.service');
const { renderTemplate, escapeHtml } = require('../services/template.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;
const passwordMaxLength = 128;
const maxAvatarBytes = 2 * 1024 * 1024;
const profileUploadDir = path.join(__dirname, '../../asset/uploads/profiles');
const resetTokenMinutes = 60;

const mimeToExt = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
};

function isValidCredentialsFormat(email, password) {
  return (
    typeof email === 'string' &&
    typeof password === 'string' &&
    emailRegex.test(email.trim()) &&
    password.length >= passwordMinLength &&
    password.length <= passwordMaxLength
  );
}

function signUserToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl || user.profile_image_url || null,
    receiveEmails:
      user.receiveEmails !== undefined
        ? Boolean(user.receiveEmails)
        : Boolean(user.receive_emails)
  };
}

function parseImageDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/png|image\/jpeg|image\/webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
}

function saveProfileImage(userId, dataUrl) {
  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) {
    throw new Error('Invalid image format');
  }

  const imageBuffer = Buffer.from(parsed.base64Data, 'base64');
  if (!imageBuffer.length || imageBuffer.length > maxAvatarBytes) {
    throw new Error('Invalid image size');
  }

  const extension = mimeToExt[parsed.mimeType];
  if (!extension) {
    throw new Error('Unsupported image type');
  }

  fs.mkdirSync(profileUploadDir, { recursive: true });
  const filename = `user_${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
  const fullPath = path.join(profileUploadDir, filename);
  fs.writeFileSync(fullPath, imageBuffer);
  return `/asset/uploads/profiles/${filename}`;
}

function deleteLocalProfileImage(imageUrl) {
  if (typeof imageUrl !== 'string') return;
  if (!imageUrl.startsWith('/asset/uploads/profiles/')) return;

  const fileName = path.basename(imageUrl);
  const fullPath = path.join(profileUploadDir, fileName);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

async function ensurePasswordResetTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens (user_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens (token_hash)');
}

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
}

async function sendWelcomeEmailSafe(user) {
  if (!isMailConfigured() || !user || !user.email) return;
  try {
    const html = renderTemplate('welcome.html', {
      CLIENT_NAME: escapeHtml(user.name || 'Usuario'),
      YEAR: String(new Date().getFullYear())
    });
    await sendMail({
      to: user.email,
      subject: 'Bienvenido a Foodaniell',
      html
    });
  } catch (error) {
    console.error('Welcome email error:', error);
  }
}

async function sendRecoveryEmailSafe(user, rawToken) {
  if (!isMailConfigured() || !user || !user.email || !rawToken) return;
  try {
    const resetLink = `${getFrontendBaseUrl()}/FrontEnd/View/recovery.html?token=${encodeURIComponent(rawToken)}`;
    const html = renderTemplate('recovery.html', {
      CLIENT_NAME: escapeHtml(user.name || 'Usuario'),
      RESET_LINK: resetLink,
      YEAR: String(new Date().getFullYear())
    });
    await sendMail({
      to: user.email,
      subject: 'Recuperacion de contrasena - Foodaniell',
      html
    });
  } catch (error) {
    console.error('Recovery email error:', error);
  }
}
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isValidCredentialsFormat(email, password)) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }

    const user = await User.validateCredentials(email.trim().toLowerCase(), password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signUserToken(user);

    res.json({
      success: true,
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length < 2 ||
      name.trim().length > 120 ||
      !isValidCredentialsFormat(email, password)
    ) {
      return res.status(400).json({ error: 'Invalid registration data' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = signUserToken(newUser);
    await sendWelcomeEmailSafe(newUser);

    return res.status(201).json({
      success: true,
      token,
      user: toPublicUser(newUser)
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.code === '23505')) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link was sent' });
    }

    await ensurePasswordResetTable();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + resetTokenMinutes * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    await sendRecoveryEmailSafe(user, rawToken);

    return res.json({ success: true, message: 'If the email exists, a reset link was sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (
      typeof token !== 'string' ||
      !token.trim() ||
      typeof password !== 'string' ||
      password.length < passwordMinLength ||
      password.length > passwordMaxLength
    ) {
      return res.status(400).json({ error: 'Invalid reset payload' });
    }

    await ensurePasswordResetTable();
    const tokenHash = hashResetToken(token.trim());

    const [rows] = await db.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const resetRow = rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, resetRow.user_id]);
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [resetRow.id]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.checkAuth = (req, res) => {
  res.json({ authenticated: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, password, profileImageDataUrl, receiveEmails } = req.body || {};
    const updates = {};
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length < 2 || name.trim().length > 120) {
        return res.status(400).json({ error: 'Invalid name format' });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (password !== undefined && password !== '') {
      if (
        typeof password !== 'string' ||
        password.length < passwordMinLength ||
        password.length > passwordMaxLength
      ) {
        return res.status(400).json({ error: 'Invalid password format' });
      }
      updates.password = password;
    }

    if (receiveEmails !== undefined) {
      updates.receiveEmails = Boolean(receiveEmails);
    }

    if (profileImageDataUrl !== undefined && profileImageDataUrl !== null && profileImageDataUrl !== '') {
      try {
        updates.profileImageUrl = saveProfileImage(userId, profileImageDataUrl);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid profile image' });
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await User.updateProfile(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (updates.profileImageUrl && currentUser.profile_image_url && currentUser.profile_image_url !== updates.profileImageUrl) {
      deleteLocalProfileImage(currentUser.profile_image_url);
    }

    const token = signUserToken(updatedUser);
    return res.json({
      success: true,
      token,
      user: toPublicUser(updatedUser)
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.code === '23505')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // For JWT systems logout is handled client-side by removing the token.
  res.json({ success: true, message: 'Logged out successfully' });
};


