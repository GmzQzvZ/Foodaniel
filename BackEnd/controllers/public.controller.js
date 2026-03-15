const db = require('../utils/db.util');
const { getRecipeTranslations } = require('../utils/recipe-translations.util');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRequiredString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (_) {
    return [];
  }
}

function parseImageArray(imageUrlValue) {
  if (typeof imageUrlValue !== 'string' || !imageUrlValue.trim()) return [];
  const value = imageUrlValue.trim();
  if (!value.startsWith('[')) return [value];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch (_) {
  return [];
}

function sanitizeLang(value) {
  if (typeof value !== 'string') return 'es';
  const normalized = value.trim().toLowerCase();
  return normalized || 'es';
}

function buildRecipeResponse(row, translation) {
  const images = parseImageArray(row.image_url);
  const base = {
    id: String(row.id),
    imagen: images[0] || '',
    imagenes: images,
    titulo: row.title || '',
    tiempo: row.time_text || '',
    ingredientes: row.ingredients || '',
    pasos: row.steps || '',
    notas: row.notes || '',
    publico: Boolean(row.is_public)
  };

  if (!translation) {
    return base;
  }

  return {
    ...base,
    titulo: translation.title || base.titulo,
    ingredientes: translation.ingredients || base.ingredientes,
    pasos: translation.steps || base.pasos,
    notas: translation.notes || base.notas
  };
}

async function buildRecipesResponse(rows = [], lang = 'es') {
  const normalizedLang = sanitizeLang(lang);
  const shouldTranslate = normalizedLang !== 'es';
  const recipeIds = rows.map((row) => row.id);
  const translations =
    shouldTranslate && recipeIds.length
      ? await getRecipeTranslations(recipeIds, normalizedLang)
      : {};

  return rows.map((row) => buildRecipeResponse(row, translations[row.id]));
}
}

async function ensurePublicTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS recipe_types (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_recipe_types_name UNIQUE (name)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(250) NOT NULL,
      email VARCHAR(250) NOT NULL,
      recipe_type_id BIGINT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_suggestions_recipe_type
        FOREIGN KEY (recipe_type_id) REFERENCES recipe_types(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_suggestions_recipe_type ON suggestions (recipe_type_id)');

  await db.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(250) NOT NULL,
      email VARCHAR(250) NOT NULL,
      request_type VARCHAR(120) NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email)');
}

async function ensureVideosDescriptionColumn() {
  await db.query(
    'ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT NULL'
  );
}

async function findOrCreateRecipeTypeId(typeName) {
  const normalizedType = normalizeRequiredString(typeName) || 'general';
  const [rows] = await db.query('SELECT id FROM recipe_types WHERE name = ? LIMIT 1', [normalizedType]);
  if (rows.length) {
    return rows[0].id;
  }

  const [result] = await db.query('INSERT INTO recipe_types (name) VALUES (?)', [normalizedType]);
  return result.insertId;
}

exports.createSuggestion = async (req, res) => {
  try {
    await ensurePublicTables();

    const { name, email, recipeType, message } = req.body || {};
    const normalizedName = normalizeRequiredString(name);
    const normalizedEmail = normalizeRequiredString(email);
    const normalizedMessage = normalizeRequiredString(message);
    const normalizedRecipeType = normalizeRequiredString(recipeType);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedMessage ||
      !emailRegex.test(normalizedEmail)
    ) {
      return res.status(400).json({ error: 'Invalid suggestion payload' });
    }

    const recipeTypeId = await findOrCreateRecipeTypeId(normalizedRecipeType || 'general');
    await db.query(
      'INSERT INTO suggestions (name, email, recipe_type_id, message) VALUES (?, ?, ?, ?)',
      [normalizedName, normalizedEmail.toLowerCase(), recipeTypeId, normalizedMessage]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Create suggestion error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createContact = async (req, res) => {
  try {
    await ensurePublicTables();

    const { name, email, requestType, message } = req.body || {};
    const normalizedName = normalizeRequiredString(name);
    const normalizedEmail = normalizeRequiredString(email);
    const normalizedMessage = normalizeRequiredString(message);
    const normalizedRequestType = normalizeRequiredString(requestType);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedMessage ||
      !emailRegex.test(normalizedEmail)
    ) {
      return res.status(400).json({ error: 'Invalid contact payload' });
    }

    await db.query(
      'INSERT INTO contacts (name, email, request_type, message) VALUES (?, ?, ?, ?)',
      [normalizedName, normalizedEmail.toLowerCase(), normalizedRequestType, normalizedMessage]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Create contact error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublicContent = async (req, res) => {
  try {
    await ensureVideosDescriptionColumn();
    const [recipesRows, booksRows, videosRows] = await Promise.all([
      safeQuery(
        `SELECT id, title, time_text, ingredients, steps, notes, image_url, is_public
         FROM recipes
         WHERE is_public = TRUE
         ORDER BY id DESC`
      ),
      safeQuery(
        `SELECT id, title, description, buy_link, price, image_url, is_public
         FROM books
         WHERE is_public = TRUE
         ORDER BY id DESC`
      ),
      safeQuery(
        `SELECT id, title, description, url, is_public
         FROM videos
         WHERE is_public = TRUE
         ORDER BY id DESC`
      )
    ]);

    const recetas = await buildRecipesResponse(recipesRows);

    const libros = booksRows.map((item) => ({
      id: String(item.id),
      imagen: item.image_url || '',
      titulo: item.title || '',
      descripcion: item.description || '',
      linkCompra: item.buy_link || '',
      precio: item.price != null ? String(item.price) : '',
      publico: Boolean(item.is_public)
    }));

    const videos = videosRows.map((item) => ({
      id: String(item.id),
      titulo: item.title || '',
      descripcion: item.description || '',
      url: item.url || '',
      publico: Boolean(item.is_public)
    }));

    return res.json({
      success: true,
      recetas,
      libros,
      videos
    });
  } catch (error) {
    console.error('Get public content error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const lang = sanitizeLang(req.query.lang);
    const recipesRows = await safeQuery(
      `SELECT id, title, time_text, ingredients, steps, notes, image_url, is_public
       FROM recipes
       WHERE is_public = TRUE
       ORDER BY id DESC`
    );

    const recetas = await buildRecipesResponse(recipesRows, lang);
    return res.json({ success: true, lang, recetas });
  } catch (error) {
    console.error('Get recipes error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
