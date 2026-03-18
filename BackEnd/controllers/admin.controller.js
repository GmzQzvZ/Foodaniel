const db = require('../utils/db.util');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendMail, isMailConfigured } = require('../services/mail.service');
const { renderTemplate, escapeHtml } = require('../services/template.service');
const { translateRecipeText, getTargetLanguages } = require('../services/translate.service');
const { setRecipeTranslations } = require('../utils/recipe-translations.util');

const maxAdminImageBytes = 5 * 1024 * 1024;
const adminUploadBaseDir = path.join(__dirname, '../../asset/uploads');
const imageMimeToExtension = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
};

async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (_) {
    return [];
  }
}

async function ensureUsersAdminColumns() {
  await db.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user'"
  );
  await db.query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_emails BOOLEAN NOT NULL DEFAULT FALSE'
  );
}

async function ensureAdminTasksTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_tasks (
      id BIGSERIAL PRIMARY KEY,
      text VARCHAR(500) NOT NULL,
      is_done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NULL
    )
  `);
}

async function ensureVideosDescriptionColumn() {
  await db.query(
    'ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT NULL'
  );
}

async function hasUsersColumn(columnName) {
  const rows = await safeQuery(`SHOW COLUMNS FROM users LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function fetchUsersForAdmin() {
  await ensureUsersAdminColumns();

  const hasRole = await hasUsersColumn('role');
  const hasReceiveEmails = await hasUsersColumn('receive_emails');

  const selectParts = ['id', 'name', 'email'];
  if (hasRole) selectParts.push('role');
  if (hasReceiveEmails) selectParts.push('receive_emails');

  const users = await safeQuery(`SELECT ${selectParts.join(', ')} FROM users ORDER BY id DESC`);
  return users.map((row) => ({
    ...row,
    role: row.role || 'user',
    receive_emails: Boolean(row.receive_emails)
  }));
}

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'user',
    receive_emails: Boolean(row.receive_emails)
  };
}

function toBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeRequiredString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseEntityId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function parseImageDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/png|image\/jpeg|image\/webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
}

function persistImageValue(imageValue, folderName) {
  const normalized = normalizeOptionalString(imageValue);
  if (!normalized) return null;

  // Keep existing URL/path if it's already a stored file or external URL.
  if (!normalized.startsWith('data:image/')) {
    return normalized;
  }

  const parsed = parseImageDataUrl(normalized);
  if (!parsed) {
    throw new Error('Invalid image format');
  }

  const imageBuffer = Buffer.from(parsed.base64Data, 'base64');
  if (!imageBuffer.length || imageBuffer.length > maxAdminImageBytes) {
    throw new Error('Invalid image size');
  }

  const extension = imageMimeToExtension[parsed.mimeType];
  if (!extension) {
    throw new Error('Unsupported image type');
  }

  const uploadDir = path.join(adminUploadBaseDir, folderName);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${folderName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, imageBuffer);
  return `/asset/uploads/${folderName}/${filename}`;
}

function normalizeImageArrayInput(imageUrl, imageUrls) {
  if (Array.isArray(imageUrls)) {
    return imageUrls.filter((value) => typeof value === 'string' && value.trim());
  }

  if (typeof imageUrls === 'string' && imageUrls.trim()) {
    try {
      const parsed = JSON.parse(imageUrls);
      if (Array.isArray(parsed)) {
        return parsed.filter((value) => typeof value === 'string' && value.trim());
      }
    } catch (_) {
      // ignore malformed JSON and fallback below
    }
  }

  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return [imageUrl.trim()];
  }

  return [];
}

function persistImageArray(imageUrl, imageUrls, folderName) {
  const inputImages = normalizeImageArrayInput(imageUrl, imageUrls);
  if (!inputImages.length) return null;

  const storedImages = inputImages
    .map((value) => persistImageValue(value, folderName))
    .filter(Boolean);

  if (!storedImages.length) return null;
  if (storedImages.length === 1) return storedImages[0];
  return JSON.stringify(storedImages);
}

async function translateAndStoreRecipeTexts(recipeId, fields) {
  if (!recipeId || !getTargetLanguages().length) return;
  try {
    const translations = await translateRecipeText(fields);
    if (Object.keys(translations).length) {
      await setRecipeTranslations(recipeId, translations);
    }
  } catch (error) {
    console.error('Recipe translation failed:', error);
  }
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
    console.error('Welcome email error (admin create user):', error);
  }
}

exports.getBootstrapData = async (req, res) => {
  try {
    await ensureAdminTasksTable();
    await ensureVideosDescriptionColumn();

    const [books, recipes, videos, users, suggestions, contacts, tasks] = await Promise.all([
      safeQuery('SELECT * FROM books ORDER BY id DESC'),
      safeQuery('SELECT * FROM recipes ORDER BY id DESC'),
      safeQuery('SELECT * FROM videos ORDER BY id DESC'),
      fetchUsersForAdmin(),
      safeQuery(
        `SELECT s.id, s.name, s.email, s.message, s.created_at, COALESCE(rt.name, '') AS recipe_type
         FROM suggestions s
         LEFT JOIN recipe_types rt ON rt.id = s.recipe_type_id
         ORDER BY s.id DESC`
      ),
      safeQuery('SELECT id, name, email, request_type, message, created_at FROM contacts ORDER BY id DESC'),
      safeQuery('SELECT id, text, is_done, created_at FROM admin_tasks ORDER BY id DESC')
    ]);

    return res.json({
      success: true,
      books,
      recipes,
      videos,
      users,
      suggestions,
      contacts,
      tasks
    });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    await ensureUsersAdminColumns();

    const { name, email, role, receiveEmails } = req.body || {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({ error: 'Invalid user payload' });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    const normalizedReceiveEmails = Boolean(receiveEmails);

    const hasRole = await hasUsersColumn('role');
    const hasReceiveEmails = await hasUsersColumn('receive_emails');

    const tempPassword = crypto.randomBytes(6).toString('base64url') + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    let sql = 'INSERT INTO users (name, email, password_hash';
    const values = [normalizedName, normalizedEmail, passwordHash];
    if (hasRole) {
      sql += ', role';
      values.push(normalizedRole);
    }
    if (hasReceiveEmails) {
      sql += ', receive_emails';
      values.push(normalizedReceiveEmails);
    }
    sql += ') VALUES (' + new Array(values.length).fill('?').join(', ') + ')';

    const [result] = await db.query(sql, values);
    await sendWelcomeEmailSafe({
      name: normalizedName,
      email: normalizedEmail
    });
    return res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
        role: normalizedRole,
        receive_emails: normalizedReceiveEmails
      },
      temporaryPassword: tempPassword
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.code === '23505')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    await ensureUsersAdminColumns();

    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const { name, email, role, receiveEmails } = req.body || {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({ error: 'Invalid user payload' });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    const normalizedReceiveEmails = Boolean(receiveEmails);

    const hasRole = await hasUsersColumn('role');
    const hasReceiveEmails = await hasUsersColumn('receive_emails');

    const fields = ['name = ?', 'email = ?'];
    const values = [normalizedName, normalizedEmail];
    if (hasRole) {
      fields.push('role = ?');
      values.push(normalizedRole);
    }
    if (hasReceiveEmails) {
      fields.push('receive_emails = ?');
      values.push(normalizedReceiveEmails);
    }
    values.push(userId);

    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedRows] = await db.query('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!updatedRows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: mapUserRow({
        ...updatedRows[0],
        role: normalizedRole,
        receive_emails: normalizedReceiveEmails
      })
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.code === '23505')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, description, buyLink, price, imageUrl, isPublic } = req.body || {};

    const normalizedTitle = normalizeRequiredString(title);
    if (!normalizedTitle) {
      return res.status(400).json({ error: 'Invalid book payload' });
    }

    const normalizedPrice =
      price === '' || price === null || typeof price === 'undefined' ? null : Number(price);
    if (normalizedPrice !== null && !Number.isFinite(normalizedPrice)) {
      return res.status(400).json({ error: 'Invalid book price' });
    }

    let storedImageUrl = null;
    try {
      storedImageUrl = persistImageValue(imageUrl, 'books');
    } catch (_) {
      return res.status(400).json({ error: 'Invalid book image' });
    }

    const [result] = await db.query(
      `INSERT INTO books (title, description, buy_link, price, image_url, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        normalizedTitle,
        normalizeOptionalString(description),
        normalizeOptionalString(buyLink),
        normalizedPrice,
        storedImageUrl,
        toBoolean(isPublic)
      ]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create book error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const bookId = parseEntityId(req.params.id);
    if (!bookId) {
      return res.status(400).json({ error: 'Invalid book id' });
    }

    const { title, description, buyLink, price, imageUrl, isPublic } = req.body || {};

    const normalizedTitle = normalizeRequiredString(title);
    if (!normalizedTitle) {
      return res.status(400).json({ error: 'Invalid book payload' });
    }

    const normalizedPrice =
      price === '' || price === null || typeof price === 'undefined' ? null : Number(price);
    if (normalizedPrice !== null && !Number.isFinite(normalizedPrice)) {
      return res.status(400).json({ error: 'Invalid book price' });
    }

    let storedImageUrl = null;
    try {
      storedImageUrl = persistImageValue(imageUrl, 'books');
    } catch (_) {
      return res.status(400).json({ error: 'Invalid book image' });
    }

    const [result] = await db.query(
      `UPDATE books
       SET title = ?, description = ?, buy_link = ?, price = ?, image_url = ?, is_public = ?
       WHERE id = ?`,
      [
        normalizedTitle,
        normalizeOptionalString(description),
        normalizeOptionalString(buyLink),
        normalizedPrice,
        storedImageUrl,
        toBoolean(isPublic),
        bookId
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Book not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = parseEntityId(req.params.id);
    if (!bookId) {
      return res.status(400).json({ error: 'Invalid book id' });
    }

    const [result] = await db.query('DELETE FROM books WHERE id = ?', [bookId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Book not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const { title, timeText, ingredients, steps, notes, imageUrl, imageUrls, isPublic } = req.body || {};

    const normalizedTitle = normalizeRequiredString(title);
    const normalizedIngredients = normalizeRequiredString(ingredients);
    const normalizedSteps = normalizeRequiredString(steps);
    const normalizedNotes = normalizeOptionalString(notes);

    if (!normalizedTitle || !normalizedIngredients || !normalizedSteps) {
      return res.status(400).json({ error: 'Invalid recipe payload' });
    }

    let storedImageUrl = null;
    try {
      storedImageUrl = persistImageArray(imageUrl, imageUrls, 'recipes');
    } catch (_) {
      return res.status(400).json({ error: 'Invalid recipe image' });
    }

    const [result] = await db.query(
      `INSERT INTO recipes (title, time_text, ingredients, steps, notes, image_url, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedTitle,
        normalizeOptionalString(timeText),
        normalizedIngredients,
        normalizedSteps,
        normalizedNotes,
        storedImageUrl,
        toBoolean(isPublic)
      ]
    );

    await translateAndStoreRecipeTexts(result.insertId, {
      title: normalizedTitle,
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      notes: normalizedNotes
    });
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create recipe error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipeId = parseEntityId(req.params.id);
    if (!recipeId) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }

    const { title, timeText, ingredients, steps, notes, imageUrl, imageUrls, isPublic } = req.body || {};

    const normalizedTitle = normalizeRequiredString(title);
    const normalizedIngredients = normalizeRequiredString(ingredients);
    const normalizedSteps = normalizeRequiredString(steps);

    if (!normalizedTitle || !normalizedIngredients || !normalizedSteps) {
      return res.status(400).json({ error: 'Invalid recipe payload' });
    }

    let storedImageUrl = null;
    try {
      storedImageUrl = persistImageArray(imageUrl, imageUrls, 'recipes');
    } catch (_) {
      return res.status(400).json({ error: 'Invalid recipe image' });
    }

    const [result] = await db.query(
      `UPDATE recipes
       SET title = ?, time_text = ?, ingredients = ?, steps = ?, notes = ?, image_url = ?, is_public = ?
       WHERE id = ?`,
      [
        normalizedTitle,
        normalizeOptionalString(timeText),
        normalizedIngredients,
        normalizedSteps,
        normalizedNotes,
        storedImageUrl,
        toBoolean(isPublic),
        recipeId
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await translateAndStoreRecipeTexts(recipeId, {
      title: normalizedTitle,
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      notes: normalizedNotes
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Update recipe error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipeId = parseEntityId(req.params.id);
    if (!recipeId) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }

    const [result] = await db.query('DELETE FROM recipes WHERE id = ?', [recipeId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createVideo = async (req, res) => {
  try {
    await ensureVideosDescriptionColumn();
    const { title, description, url, isPublic } = req.body || {};
    const normalizedTitle = normalizeRequiredString(title);
    const normalizedUrl = normalizeRequiredString(url);

    if (!normalizedTitle || !normalizedUrl) {
      return res.status(400).json({ error: 'Invalid video payload' });
    }

    const [result] = await db.query(
      'INSERT INTO videos (title, description, url, is_public) VALUES (?, ?, ?, ?)',
      [normalizedTitle, normalizeOptionalString(description), normalizedUrl, toBoolean(isPublic)]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create video error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    await ensureVideosDescriptionColumn();
    const videoId = parseEntityId(req.params.id);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid video id' });
    }

    const { title, description, url, isPublic } = req.body || {};
    const normalizedTitle = normalizeRequiredString(title);
    const normalizedUrl = normalizeRequiredString(url);

    if (!normalizedTitle || !normalizedUrl) {
      return res.status(400).json({ error: 'Invalid video payload' });
    }

    const [result] = await db.query(
      'UPDATE videos SET title = ?, description = ?, url = ?, is_public = ? WHERE id = ?',
      [normalizedTitle, normalizeOptionalString(description), normalizedUrl, toBoolean(isPublic), videoId]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update video error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const videoId = parseEntityId(req.params.id);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid video id' });
    }

    const [result] = await db.query('DELETE FROM videos WHERE id = ?', [videoId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    await ensureAdminTasksTable();
    const { text } = req.body || {};
    const normalizedText = normalizeRequiredString(text);
    if (!normalizedText) {
      return res.status(400).json({ error: 'Invalid task payload' });
    }

    const [result] = await db.query(
      'INSERT INTO admin_tasks (text, is_done) VALUES (?, FALSE)',
      [normalizedText]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    await ensureAdminTasksTable();
    const taskId = parseEntityId(req.params.id);
    if (!taskId) {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    const { text, done } = req.body || {};
    const fields = [];
    const values = [];

    if (text !== undefined) {
      const normalizedText = normalizeRequiredString(text);
      if (!normalizedText) {
        return res.status(400).json({ error: 'Invalid task text' });
      }
      fields.push('text = ?');
      values.push(normalizedText);
    }

    if (done !== undefined) {
      fields.push('is_done = ?');
      values.push(toBoolean(done));
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(taskId);
    const [result] = await db.query(
      `UPDATE admin_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await ensureAdminTasksTable();
    const taskId = parseEntityId(req.params.id);
    if (!taskId) {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    const [result] = await db.query('DELETE FROM admin_tasks WHERE id = ?', [taskId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.sendNotificationEmails = async (req, res) => {
  try {
    const { subject, message } = req.body || {};
    const normalizedSubject = normalizeRequiredString(subject);
    const normalizedMessage = normalizeRequiredString(message);

    if (!normalizedSubject || !normalizedMessage) {
      return res.status(400).json({ error: 'Invalid email payload' });
    }

    if (!isMailConfigured()) {
      return res.status(500).json({ error: 'SMTP is not configured' });
    }

    const recipients = await safeQuery(
      "SELECT name, email FROM users WHERE receive_emails = TRUE AND email IS NOT NULL AND email <> '' ORDER BY id DESC"
    );

    if (!recipients.length) {
      return res.json({ success: true, sent: 0, failed: 0, total: 0 });
    }

    let sent = 0;
    let failed = 0;
    for (const row of recipients) {
      try {
        const html = renderTemplate('template.html', {
          CLIENT_NAME: escapeHtml(row.name || 'Usuario'),
          SUBJECT: escapeHtml(normalizedSubject),
          MESSAGE: escapeHtml(normalizedMessage),
          YEAR: String(new Date().getFullYear())
        });
        await sendMail({
          to: row.email,
          subject: normalizedSubject,
          html
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error('Notification email send error:', row.email, error);
      }
    }

    return res.json({
      success: true,
      sent,
      failed,
      total: recipients.length
    });
  } catch (error) {
    console.error('Send notification emails error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
