require('dotenv').config();

// ✅ Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'NODE_ENV'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('💡 Make sure to set them in Vercel Dashboard or your .env file');
  process.exit(1);
}

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

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app,https://foodaniell.com,https://www.foodaniell.com,https://foodaniel.vercel.app,https://www.fodanielee.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalhostOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch (_) {
    return false;
  }
}

function isExplicitlyAllowedOrigin(origin) {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;

    if (!allowedOrigin.includes('*')) return false;

    const escaped = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.*');
    const pattern = new RegExp(`^${escaped}$`);
    return pattern.test(origin);
  });
}

function originMatchesAllowedList(origin) {
  if (!origin) return true;
  if (origin === 'null') {
    return process.env.NODE_ENV !== 'production';
  }

  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }

  if (isLocalhostOrigin(origin)) {
    return true;
  }

  return isExplicitlyAllowedOrigin(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (originMatchesAllowedList(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
  <title>Foodanielee API Docs</title>
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

// Serve frontend static files with clean URLs.
app.use('/FrontEnd', express.static(frontendRootPath));
app.use('/admin', express.static(path.join(frontendRootPath, 'admin')));
app.use('/FrontEnd/css', express.static(path.join(frontendViewPath, 'css')));
app.use('/FrontEnd/JS', express.static(path.join(frontendViewPath, 'JS')));
app.use('/FrontEnd/img', express.static(path.join(frontendViewPath, 'img')));
app.use('/asset', express.static(assetPath));
app.use(express.static(frontendViewPath, { extensions: ['html', 'htm'] }));
app.get('/default-profile.png', (req, res) => res.sendFile(defaultProfilePath));

// Mapeo de URLs cortas y precisas
const cleanPageRoutes = {
  '/content': 'Content.html',
  '/recetas': 'Recetas.html',
  '/receta': 'receta.html',
  '/libros': 'libros.html',
  '/videos': 'videos.html',
  '/about': 'About.html',
  '/contacto': 'Contacto.html',
  '/login': 'Login.html',
  '/registro': 'registro.html',
  '/dashboard': 'dashborard.html',
  '/privacy-policy': 'privacy-policy.html'
};

Object.entries(cleanPageRoutes).forEach(([cleanRoute, fileName]) => {
  app.get(cleanRoute, (req, res) => res.sendFile(path.join(frontendViewPath, fileName)));
});

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
