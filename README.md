# Foodaniell

Full-stack platform with an Express/Node.js backend, a static marketing frontend in `FrontEnd/View`, and a single-page administration console under `FrontEnd/admin`. The backend centralizes authentication, public data, admin CRUD operations, email templates, rate limiting, and the new translation caching pipeline for recipes.

## Web site
 web site deployment : https://foodaniel-git-main-gmzqzvzs.vercel.app/

## Structure
| Area | Description |
| --- | --- |
| `BackEnd/` | Express REST API, JWT auth, PostgreSQL helpers, email/translation services, and the recipe translation cache. |
| `FrontEnd/View/` | Marketing pages (recetas, libros, videos...) that load data from `/api/public`. |
| `FrontEnd/admin/` | Legacy SPA dashboard for managing content, users, suggestions, and tasks. |
| `asset/` | Shared static assets (avatars, uploads). `asset/uploads` is writeable at runtime and excluded from version control. |

## Backend setup

1. Copy `BackEnd/.env.example` to `BackEnd/.env`, then fill the secrets (database, JWT, SMTP, translation targets, rate limits).
2. From the root run `cd BackEnd && npm install`. (Or double-click `run-project.bat` to install dependencies and start `npm run dev`.)
3. Ensure the database schema exists (`sql.sql` contains the current tables/triggers) and the connection string points to a reachable PostgreSQL server.
4. Start the server with `npm run dev` (development) or `npm run start`; the API listens on `PORT` (default `3000`).
5. Open `http://localhost:3000/api-docs` to browse the Swagger UI, or `http://localhost:3000/api-docs.json` to inspect the raw OpenAPI schema.

## Deploying on Vercel

This repository includes a [`BackEnd/vercel.json`](BackEnd/vercel.json) configuration file for deploying the backend to Vercel.

### Steps to deploy:

1. **Push your code to GitHub** (ensure `BackEnd/vercel.json` is committed).
2. **In Vercel Dashboard**:
   - Import your repository
   - Set **Framework Preset** to `Node.js`
   - Set **Root Directory** to `BackEnd` (or leave empty and configure in next step)
   - Click **Deploy**
3. **Configure Environment Variables** in Vercel **Settings → Environment Variables**:

| Variable | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://user:password@host:port/database` | Get from your database provider (e.g., Supabase) |
| `JWT_SECRET` | Your secret key | Use a strong, random string |
| `NODE_ENV` | `production` | |
| `CORS_ORIGINS` | `https://yourfrontend.vercel.app,http://localhost:3000` | Add all frontend URLs |
| `DB_SSL` | `true` | Required for most cloud databases |
| `SMTP_*` | Your email credentials | If you use the email service |
| `TRANSLATION_SOURCE_LANG` | `es` | Source language for translations |
| `TRANSLATION_TARGET_LANGS` | `en,fr` | Target languages (comma-separated) |

4. **Redeploy** after adding environment variables.

### Troubleshooting Vercel deployment:

- **403 Forbidden on `/api/auth/login`**: Check that `CORS_ORIGINS` includes your frontend domain and `DATABASE_URL` is set correctly.
- **Database connection errors**: Ensure your PostgreSQL server accepts connections from Vercel's IP range. For Supabase, this is automatic.
- **Missing environment variables**: Verify all variables are added in Vercel's dashboard and match your local `.env`.

## Deploying on Render

This repository includes a [`render.yaml`](render.yaml) file so Render can deploy the backend from the correct folder.

Use these values in Render:

| Field | Value |
| --- | --- |
| `Root Directory` | `BackEnd` |
| `Build Command` | `npm install` |
| `Start Command` | `npm start` |

Add the same environment variables you use locally in `BackEnd/.env`, especially:

- `DATABASE_URL` or the `DB_*` variables
- `JWT_SECRET`
- `CORS_ORIGINS`
- `SMTP_*` if you send email from the app
- `TRANSLATION_SOURCE_LANG` and `TRANSLATION_TARGET_LANGS` if you use translations

If your frontend is hosted separately, make sure its domain is included in `CORS_ORIGINS`.

## Frontend & admin

- Public marketing pages fetch `/api/public/content` and the new `/api/public/recipes?lang=<code>` endpoint (e.g., `/api/public/recipes?lang=en`) to read cached translations instead of calling the translator every request.
- Admin scripts rely on the same auth token stored via `localStorage`/`sessionStorage`; `FrontEnd/admin/js/admin.js` syncs data via `/api/admin/bootstrap`.
- Keep `asset/uploads/` writable for profile/recipe images and avoid committing its contents. If you need to reset visuals, manually seed `asset/img profile.png` or other stock items.

## Environment variables
Use `BackEnd/.env.example` as the template. The most important variables are:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DB_*` | PostgreSQL connection (supported via `DATABASE_URL` or host/user/password/port). When `NEXT_PUBLIC_SUPABASE_URL` is present, the backend can derive the Supabase DB host automatically. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing configuration for JWT-based auth. |
| `CORS_ORIGINS` | Comma-separated origins allowed by the backend (default: `http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app`). Wildcards like `https://*.vercel.app` are supported. |
| `SMTP_*` | Optional email credentials used by welcome/recovery workflows; the templates live in `FrontEnd/template/`. |
| `LOGIN_RATE_LIMIT_*` | Rate limiting window length and allowed attempts for login/registration endpoints. |
| `TRANSLATION_SOURCE_LANG`, `TRANSLATION_TARGET_LANGS` | Configure the automatic translator (default: source `es`, target `en`). Translated rows are cached in `recipe_translations`. |

> **Security note**: `.env`, uploads, and build caches are ignored via `.gitignore`. Do not commit real secrets.

## Translation caching workflow

1. Admin creates or updates a recipe; the request is stored in Spanish first.
2. The backend calls `translate.service.js` to translate `title`, `ingredients`, `steps`, and `notes` to each language configured in `TRANSLATION_TARGET_LANGS`.
3. Translations are stored in `recipe_translations` (see `sql.sql`) and served via `/api/public/recipes?lang=<code>`.
4. Public pages and the dashboard prefer the translated text, caching the response in `localStorage` to avoid repeated fetches.

## Recommended checks

- Confirm `asset/uploads` has the necessary permissions before using the admin image upload. The backend writes files to `/asset/uploads/{recipes,profiles}`.
- Run `npm audit` after `npm install` (five vulnerabilities were reported when the translator package was added) and apply fixes as needed.
- Validate the translation cache with a request such as `curl http://localhost:3000/api/public/recipes?lang=en` after creating a recipe from the admin panel.


