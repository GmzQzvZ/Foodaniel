# 🚀 GUÍA DE DESPLIEGUE EN VERCEL - Foodaniell

## ✅ Checklist Pre-Despliegue

- [ ] Variables de entorno limpias (sin secrets hardcodeados)
- [ ] `.env.example` actualizado
- [ ] `vercel.json` limpio
- [ ] Base de datos PostgreSQL lista
- [ ] `npm install` funciona en BackEnd
- [ ] `npm start` inicia sin errores
- [ ] Todos los archivos commiteados a GitHub

---

## 📋 PASO 1: Preparar tu Base de Datos

### Opción A: Supabase (Recomendado - Incluido gratis)
1. Ve a [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Completa datos y crea el proyecto
4. Espera a que se inicialice (~5 minutos)
5. Ve a **SQL Editor** → **New Query**
6. Copia todo el contenido de `sql.sql` de tu proyecto
7. Pega y ejecuta
8. Copia tu `DATABASE_URL` desde **Settings → Database → Connection Strings → URI**

### Opción B: Railway / Render / Heroku
- Similar, crea una instancia PostgreSQL
- Consigue el `DATABASE_URL` (postgresql://user:pass@host:port/database)

---

## 📝 PASO 2: Preparar Variables de Entorno

### En tu máquina local:
1. Crea `BackEnd/.env` (copia de `.env.example`):
   ```bash
   cp BackEnd/.env.example BackEnd/.env
   ```

2. Completa con tus valores reales:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
   DB_HOST=db.abcdefg.supabase.co
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_fuerte
   DB_NAME=postgres
   DB_PORT=5432
   DATABASE_URL=postgresql://postgres:tu_contraseña@db.abcdefg.supabase.co:5432/postgres
   
   # JWT
   JWT_SECRET=generar_cadena_aleatoria_32_caracteres_minimo
   JWT_EXPIRES_IN=6h
   
   # CORS - Actualiza con tu dominio Vercel
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://tu-proyecto.vercel.app
   
   # Email (opcional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASS=tu_app_password
   
   # Traducción
   TRANSLATION_SOURCE_LANG=es
   TRANSLATION_TARGET_LANGS=en,fr
   ```

3. **Prueba localmente:**
   ```bash
   cd BackEnd
   npm install
   npm run dev
   ```
   Deberías ver: `✅ Server running on http://localhost:3000`

---

## 🔐 PASO 3: Actualizar `.gitignore`

Asegúrate de que `BackEnd/.env` NO esté en GitHub:

```bash
# En la raíz del proyecto
cat .gitignore
```

Debe incluir:
```
BackEnd/.env
.env
node_modules/
asset/uploads/
```

---

## 📤 PASO 4: Push a GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment - remove secrets, add validation"
git push origin main
```

---

## 🌐 PASO 5: Desplegar en Vercel Dashboard

### 5.1 Crear Proyecto en Vercel
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Selecciona tu repositorio `Foodaniel` (o importa)
4. Click **"Import"**

### 5.2 Configurar Build & Deploy
1. **Project Name**: `foodaniel` (o tu preferencia)
2. **Framework**: Node.js (auto-detectado)
3. **Root Directory**: `BackEnd`
4. **Build Command**: `npm install` (dejar vacío si Vercel lo detecta)
5. **Output Directory**: dejar vacío
6. **Environment Variables**: 🔴 **CRÍTICO - Haz esto antes de desplegar**

### 5.3 Agregar Variables de Entorno (⚠️ MUY IMPORTANTE)

Haz click en **"Environment Variables"** y agrega estos valores:

| Variable | Valor | Origen |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` | Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` | Supabase Settings |
| `DB_HOST` | `db.xxx.supabase.co` | Supabase |
| `DB_USER` | `postgres` | Supabase |
| `DB_PASSWORD` | Tu contraseña | Supabase |
| `DB_NAME` | `postgres` | Supabase |
| `DB_PORT` | `5432` | Supabase |
| `JWT_SECRET` | Cadena aleatoria 32+ chars | Generada por ti |
| `JWT_EXPIRES_IN` | `6h` | Fijo |
| `NODE_ENV` | `production` | Fijo |
| `CORS_ORIGINS` | `https://tu-dominio.vercel.app,https://tudominio.com` | Tu dominio |
| `DB_SSL` | `true` | Fijo |
| `TRANSLATION_SOURCE_LANG` | `es` | Fijo |
| `TRANSLATION_TARGET_LANGS` | `en,fr` | Personalizable |
| `SMTP_HOST` | `smtp.gmail.com` | Email |
| `SMTP_PORT` | `587` | Email |
| `SMTP_USER` | Tu email | Email |
| `SMTP_PASS` | App password | Email |

### 5.4 Deploy
1. Click **"Deploy"**
2. Espera a que termine (~2-3 minutos)

---

## ✅ PASO 6: Verificar Despliegue

### Test básico:
```bash
# Abre en el navegador tu URL de Vercel:
https://foodaniel.vercel.app/api-docs
```

Deberías ver Swagger UI con la documentación de tu API.

### Test de rutas:
```bash
# Prueba un endpoint público
curl https://foodaniel.vercel.app/api/public/content
```

### Test de base de datos:
1. Ve a Vercel Dashboard → Tu proyecto
2. Click en **Deployments**
3. Si ves errores, haz click en el despliegue y revisa **Logs → Functions**

---

## 🐛 Troubleshooting Común

### ❌ "500 Internal Server Error"
```
Cause: Variables de entorno faltantes
Fix: Verifica DATABASE_URL y JWT_SECRET en Vercel Dashboard
```

### ❌ "Missing required environment variables"
```
Cause: No agregaste variables en Vercel
Fix: Revisa PASO 5.3, asegúrate que todas las variables estén ahí
```

### ❌ "CORS origin not allowed"
```
Cause: CORS_ORIGINS no incluye tu dominio
Fix: En Vercel Settings, edita CORS_ORIGINS y agrega tu URL
```

### ❌ "Database connection refused"
```
Cause: DATABASE_URL mal o Supabase no acepta conexión
Fix: 
- Copia exactamente de Supabase Settings → Database → Connection Strings
- En Supabase: Settings → Database → SSL enforcement → Require (ON)
```

### ❌ "Cannot find module"
```
Cause: Falta npm install o dependencia
Fix: En Vercel, revisa Build Command, asegúrate que sea "npm install"
```

---

## 📊 Monitoreo Post-Despliegue

1. **Vercel Dashboard** → Tu proyecto → **Analytics**
   - Revisa Function Invocations, Response Time, etc.

2. **Vercel Dashboard** → Tu proyecto → **Deployments**
   - Haz click en cada despliegue para ver logs detallados

3. **Supabase Dashboard** → Tu proyecto → **Logs**
   - Revisa si hay errores de conexión a BD

---

## 🔄 Para Actualizaciones Futuras

Simplemente:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel re-deployará automáticamente. ✨

---

## 📞 Soporte Rápido

- **¿Vercel no detecta cambios?** → En Vercel Dashboard, haz click en **Redeploy** → **Redeploy**
- **¿Database timeout?** → Aumenta el timeout en tu DB o usa connection pooling (Supabase lo incluye)
- **¿Archivos estáticos no cargan?** → Asegúrate que FrontEnd esté en rutas correctas

¡Éxito! 🎉
