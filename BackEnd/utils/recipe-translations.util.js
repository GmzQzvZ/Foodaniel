const db = require('./db.util');

const translatableFields = ['title', 'ingredients', 'steps', 'notes'];

async function ensureRecipeTranslationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS recipe_translations (
      id BIGSERIAL PRIMARY KEY,
      recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      lang VARCHAR(10) NOT NULL,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      steps TEXT NOT NULL,
      notes TEXT NULL,
      translated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_recipe_translations UNIQUE (recipe_id, lang)
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_recipe_translations_lang ON recipe_translations(lang)');
}

async function setRecipeTranslations(recipeId, translationByLang) {
  if (!recipeId || !translationByLang || typeof translationByLang !== 'object') return;
  await ensureRecipeTranslationsTable();

  const updateFragments = translatableFields
    .map((field) => `${field} = EXCLUDED.${field}`)
    .concat('translated_at = NOW()');

  const sql = `
    INSERT INTO recipe_translations (recipe_id, lang, ${translatableFields.join(', ')})
    VALUES (?, ?, ${new Array(translatableFields.length).fill('?').join(', ')})
    ON CONFLICT (recipe_id, lang) DO UPDATE SET ${updateFragments.join(', ')}
  `;

  for (const [lang, values] of Object.entries(translationByLang)) {
    if (!lang) continue;
    const payload = [
      recipeId,
      lang,
      ...translatableFields.map((field) => {
        const rawValue = values && typeof values[field] === 'string' ? values[field] : '';
        return rawValue;
      })
    ];
    await db.query(sql, payload);
  }
}

async function getRecipeTranslations(recipeIds, lang) {
  if (!lang || !Array.isArray(recipeIds) || !recipeIds.length) return {};
  await ensureRecipeTranslationsTable();
  const [rows] = await db.query(
    `SELECT recipe_id, title, ingredients, steps, notes FROM recipe_translations WHERE lang = ? AND recipe_id = ANY(?)`,
    [lang, recipeIds]
  );

  return rows.reduce((acc, row) => {
    acc[row.recipe_id] = row;
    return acc;
  }, {});
}

module.exports = {
  ensureRecipeTranslationsTable,
  setRecipeTranslations,
  getRecipeTranslations
};
