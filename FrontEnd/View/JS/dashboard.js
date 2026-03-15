const dashboardBaseOrigin =
  window.location.protocol === 'file:' || window.location.origin === 'null'
    ? 'http://localhost:3000'
    : window.location.origin;
const DASHBOARD_API_URL = `${dashboardBaseOrigin}/api/auth`;
const PUBLIC_CONTENT_API_URL = `${dashboardBaseOrigin}/api/public/content`;
const DEFAULT_AVATAR = '/default-profile.png';
let publicContentCache = null;
let publicContentRequestPromise = null;

function loadItems(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

async function fetchPublicContent() {
  if (publicContentCache) return publicContentCache;
  if (publicContentRequestPromise) return publicContentRequestPromise;

  publicContentRequestPromise = fetch(PUBLIC_CONTENT_API_URL)
    .then(async (response) => {
      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok || !data) {
        throw new Error((data && data.error) || 'No se pudo cargar contenido publico');
      }

      publicContentCache = {
        recetas: Array.isArray(data.recetas) ? data.recetas : [],
        libros: Array.isArray(data.libros) ? data.libros : [],
        videos: Array.isArray(data.videos) ? data.videos : []
      };
      return publicContentCache;
    })
    .catch(() => null)
    .finally(() => {
      publicContentRequestPromise = null;
    });

  return publicContentRequestPromise;
}

async function getPublishedItems(kind, fallbackLocalStorageKey) {
  const remote = await fetchPublicContent();
  if (remote && Array.isArray(remote[kind])) {
    return remote[kind];
  }
  return loadItems(fallbackLocalStorageKey).filter((item) => isTrue(item.publico));
}

function isTrue(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function firstLine(text) {
  const t = String(text || '').trim();
  if (!t) return '';
  const parts = t.split(/\r?\n/);
  return parts[0];
}

function renderCardsIntoGrid(gridEl, items, mapper, emptyText) {
  if (!gridEl) return;
  gridEl.innerHTML = '';

  if (!items.length) {
    gridEl.innerHTML = `
      <div class="placeholder-box">
        <p class="placeholder-text">${emptyText}</p>
      </div>
    `;
    return;
  }

  items.forEach((it) => {
    gridEl.insertAdjacentHTML('beforeend', mapper(it));
  });
}

function resolveAvatarUrl(value) {
  if (!value || typeof value !== 'string') return DEFAULT_AVATAR;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  if (value.startsWith('/')) return value;
  return `/${value}`;
}

function safeParseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function getStoredSession() {
  return {
    token: localStorage.getItem('auth_token'),
    user: safeParseJson(localStorage.getItem('user'))
  };
}

async function fetchAuthenticatedUser(token) {
  const response = await fetch(`${DASHBOARD_API_URL}/check-auth`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Session expired');
  }

  const data = await response.json();
  return data.user || null;
}

function fillDashboardHeader(user) {
  const nameEl = document.getElementById('dashboardUserName');
  const emailEl = document.getElementById('dashboardUserEmail');
  const avatarEl = document.getElementById('dashboardAvatar');

  const safeName = user.name || 'Usuario';
  const safeEmail = user.email || 'Sin correo';
  const storedAvatar = user.profileImageUrl || localStorage.getItem('user_profile_avatar');

  if (nameEl) nameEl.textContent = safeName;
  if (emailEl) emailEl.textContent = safeEmail;
  if (avatarEl) avatarEl.src = resolveAvatarUrl(storedAvatar);
}

function fillProfileTab(user) {
  const nameInput = document.getElementById('perfil-nombre');
  const emailInput = document.getElementById('perfil-email');
  const usernameInput = document.getElementById('perfil-username');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';

  if (usernameInput && user.email) {
    usernameInput.value = user.email.split('@')[0];
  }
}

function redirectToLogin() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/FrontEnd/View/Login.html';
}

async function initDashboardUser() {
  const session = getStoredSession();
  if (!session.token) {
    redirectToLogin();
    return;
  }

  try {
    const authUser = await fetchAuthenticatedUser(session.token);
    const mergedUser = {
      ...(authUser || {}),
      ...(session.user || {})
    };

    fillDashboardHeader(mergedUser);
    fillProfileTab(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));
  } catch (_) {
    redirectToLogin();
  }
}

async function renderDashboardContentTabs() {
  const videosGrid = document.getElementById('dashboardVideosContent');
  const librosGrid = document.getElementById('dashboardLibrosContent');
  const recetasGrid = document.getElementById('dashboardRecetasContent');

  const recetas = await getPublishedItems('recetas', 'admin_recetas');
  renderCardsIntoGrid(
    recetasGrid,
    recetas,
    (r) => {
      const img = r.imagen || '/FrontEnd/img/90fc53c9.svg';
      const titulo = escapeHtml(r.titulo);
      const tiempo = escapeHtml(r.tiempo);
      const ingredientes = escapeHtml(firstLine(r.ingredientes));
      return `
        <article class="recipe-card">
          <img src="${img}" alt="${titulo}" />
          <div class="recipe-card__body">
            <h2 class="recipe-card__title">${titulo}</h2>
            <p class="recipe-card__text">${ingredientes}</p>
            ${tiempo ? `<h4>tiempo: ${tiempo}</h4>` : ``}
            <a href="/FrontEnd/View/receta.html?id=${encodeURIComponent(String(r.id || ''))}" class="btn btn--outline">Ver receta</a>
          </div>
        </article>
      `;
    },
    'An no hay recetas publicadas.'
  );

  const libros = await getPublishedItems('libros', 'admin_libros');
  renderCardsIntoGrid(
    librosGrid,
    libros,
    (l) => {
      const img = l.imagen || '/FrontEnd/img/90fc53c9.svg';
      const titulo = escapeHtml(l.titulo);
      const desc = escapeHtml(l.descripcion);
      const precio = escapeHtml(l.precio);
      const link = l.linkCompra ? escapeHtml(l.linkCompra) : '#';
      return `
        <article class="recipe-card">
          <img src="${img}" alt="${titulo}" />
          <div class="recipe-card__body">
            <h2 class="recipe-card__title">${titulo}</h2>
            <p class="recipe-card__text">${desc}</p>
            ${precio ? `<h4>precio: ${precio}</h4>` : ``}
            <a href="${link}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">Ver / Comprar</a>
          </div>
        </article>
      `;
    },
    'An no hay libros publicados.'
  );

  const videos = await getPublishedItems('videos', 'admin_videos');
  renderCardsIntoGrid(
    videosGrid,
    videos,
    (v) => {
      const titulo = escapeHtml(v.titulo);
      const descripcion = escapeHtml(v.descripcion || 'Video publicado');
      const url = v.url ? escapeHtml(v.url) : '#';
      return `
        <article class="recipe-card">
          <img src="/FrontEnd/img/90fc53c9.svg" alt="${titulo}" />
          <div class="recipe-card__body">
            <h2 class="recipe-card__title">${titulo}</h2>
            <p class="recipe-card__text">${descripcion}</p>
            <a href="${url}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">Ver video</a>
          </div>
        </article>
      `;
    },
    'An no hay videos publicados.'
  );
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboardContentTabs();
  initDashboardUser();
});
