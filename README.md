# Foodaniell

Full-stack platform with an Express/Node.js backend, a static marketing frontend in `FrontEnd/View`, and a single-page administration console under `FrontEnd/admin`. The backend centralizes authentication, public data, admin CRUD operations, email templates, rate limiting, and the new translation caching pipeline for recipes.

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

## Frontend & admin

- Public marketing pages fetch `/api/public/content` and the new `/api/public/recipes?lang=<code>` endpoint (e.g., `/api/public/recipes?lang=en`) to read cached translations instead of calling the translator every request.
- Admin scripts rely on the same auth token stored via `localStorage`/`sessionStorage`; `FrontEnd/admin/js/admin.js` syncs data via `/api/admin/bootstrap`.
- Keep `asset/uploads/` writable for profile/recipe images and avoid committing its contents. If you need to reset visuals, manually seed `asset/img profile.png` or other stock items.

## Environment variables
Use `BackEnd/.env.example` as the template. The most important variables are:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DB_*` | PostgreSQL connection (supported via `DATABASE_URL` or host/user/password). |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing configuration for JWT-based auth. |
| `CORS_ORIGINS` | Comma-separated origins allowed by the backend (default: `http://localhost:3000,http://127.0.0.1:3000`). |
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
