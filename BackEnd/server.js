require('dotenv').config();

const express = require('express');

console.log('🚀 Servidor iniciando...');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const { buildOpenApiSpec } = require('./docs/openapi');

const app = express();
const PORT = process.env.PORT || 3000;

const frontendRootPath = path.join(__dirname, '../FrontEnd');
const frontendViewPath = path.join(frontendRootPath, 'View');
const assetPath = path.join(__dirname, '../asset');
const defaultProfilePath = path.join(assetPath, 'img profile.png');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_LIMIT || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '20mb' }));

app.use('/api/auth', authRoutes);
// Backward-compatible auth aliases (e.g. /api/register, /api/login).
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

function buildSwaggerHtml() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Foodaniell API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      background: #0f172a;
    }
    .swagger-ui .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api-docs.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      displayRequestDuration: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>`;
}

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(buildOpenApiSpec());
});

app.get('/api-docs', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.type('html').send(buildSwaggerHtml());
});

// Return JSON 404 for any unknown API route.
app.use('/api', (req, res) => {
  return res.status(404).json({ error: 'API route not found' });
});

// Serve frontend static files.
app.use('/FrontEnd', express.static(frontendRootPath));
app.use('/admin', express.static(path.join(frontendRootPath, 'admin')));
app.use('/FrontEnd/css', express.static(path.join(frontendViewPath, 'css')));
app.use('/FrontEnd/JS', express.static(path.join(frontendViewPath, 'JS')));
app.use('/FrontEnd/img', express.static(path.join(frontendViewPath, 'img')));
app.use('/asset', express.static(assetPath));
app.use(express.static(frontendViewPath));
app.get('/default-profile.png', (req, res) => res.sendFile(defaultProfilePath));

app.get('*.html', (req, res) => {
  return res.status(404).sendFile(path.join(frontendViewPath, '404.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  if (path.extname(req.path)) {
    return res.sendStatus(404);
  }

  return res.sendFile(path.join(frontendViewPath, 'index.html'));
});

app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'Request payload too large' });
  }

  if (err.message === 'CORS origin not allowed') {
    return res.status(403).json({ error: err.message });
  }

  console.error(err.stack);
  return res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('📧 Variables SMTP cargadas:', {
    SMTP_HOST: process.env.SMTP_HOST ? '✓' : '✗',
    SMTP_PORT: process.env.SMTP_PORT ? '✓' : '✗',
    SMTP_USER: process.env.SMTP_USER ? '✓' : '✗',
    SMTP_PASS: process.env.SMTP_PASS ? '✓' : '✗'
  });
});

module.exports = app;
