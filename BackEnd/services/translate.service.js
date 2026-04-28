// Servicio de traducción deshabilitado temporalmente
// Para habilitarlo, instalar: npm install @vitalets/google-translate-api
let translate = null;

try {
  const translateModule = require('@vitalets/google-translate-api');
  translate = translateModule && typeof translateModule.translate === 'function'
    ? translateModule.translate
    : translateModule;
} catch (error) {
  console.warn('Translation library unavailable, recipe translations disabled:', error.message);
}

const rawTargets = (process.env.TRANSLATION_TARGET_LANGS || 'en')
  .split(',')
  .map((lang) => lang.trim().toLowerCase())
  .filter(Boolean);
const sourceLang = (process.env.TRANSLATION_SOURCE_LANG || 'es').trim().toLowerCase() || 'es';
const targetLanguages = Array.from(new Set(rawTargets.filter((lang) => lang && lang !== 'es')));

async function translateText(value, targetLang) {
  if (!value || !targetLang || !translate) return value;

  try {
    const result = await translate(value, {
      from: sourceLang,
      to: targetLang
    });
    return result.text || value;
  } catch (error) {
    console.error('Translation error:', { targetLang, error: error.message });
    return value;
  }
}

async function translateFields(fields, targetLang) {
  const entries = Object.entries(fields);
  const translated = await Promise.all(
    entries.map(async ([key, rawValue]) => {
      const value = typeof rawValue === 'string' ? rawValue : String(rawValue || '');
      const text = value.trim();
      if (!text) {
        return [key, ''];
      }
      const translatedValue = await translateText(text, targetLang);
      return [key, translatedValue];
    })
  );

  return Object.fromEntries(translated);
}

async function translateRecipeText(fields) {
  const langs = getTargetLanguages();
  if (!langs.length) return {};

  const translationByLang = {};
  for (const lang of langs) {
    translationByLang[lang] = await translateFields(fields, lang);
  }

  return translationByLang;
}

function getTargetLanguages() {
  return [...targetLanguages];
}

module.exports = {
  translateRecipeText,
  getTargetLanguages
};
