const fs = require('fs');
const path = require('path');

const templateBasePath = path.join(__dirname, '../../FrontEnd/template');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTemplate(templateFileName, replacements = {}) {
  const filePath = path.join(templateBasePath, templateFileName);
  let html = fs.readFileSync(filePath, 'utf8');

  Object.entries(replacements).forEach(([key, value]) => {
    const token = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(token, String(value || ''));
  });

  return html;
}

module.exports = {
  escapeHtml,
  renderTemplate,
};

