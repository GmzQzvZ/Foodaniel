document.addEventListener("DOMContentLoaded", () => {
  const baseOrigin =
    window.location.protocol === "file:" || window.location.origin === "null"
      ? "http://localhost:3000"
      : window.location.origin;
  const PUBLIC_API_URL = `${baseOrigin}/api/public`;

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

  function isTrue(value) {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function firstLine(text) {
    const t = String(text || "").trim();
    if (!t) return "";
    return t.split(/\r?\n/)[0];
  }

  function ensureGoogleTranslate() {
    if (document.getElementById("google_translate_element")) return;
    const hidden = document.createElement("div");
    hidden.id = "google_translate_element";
    hidden.style.display = "none";
    document.body.appendChild(hidden);

    window.googleTranslateElementInit = () => {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es",
          includedLanguages: "es,en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }

  function setGoogleLanguage(lang) {
    localStorage.setItem("site_lang", lang);
    document.cookie = `googtrans=/es/${lang}; path=/`;
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  }

  function ensureLanguageSwitcher() {
    const footerInner = document.querySelector(".site-footer__inner");
    if (!footerInner) return;
    if (footerInner.querySelector(".site-lang-switcher")) return;

    const switcher = document.createElement("div");
    switcher.className = "site-lang-switcher";
    switcher.innerHTML = `
      <span class="site-lang-switcher__label">Idioma:</span>
      <button type="button" class="site-lang-switcher__btn" data-lang="es" aria-pressed="false">ES</button>
      <button type="button" class="site-lang-switcher__btn" data-lang="en" aria-pressed="false">EN</button>
    `;
    footerInner.appendChild(switcher);

    const active = (localStorage.getItem("site_lang") || "es").toLowerCase();
    switcher.querySelectorAll(".site-lang-switcher__btn").forEach((btn) => {
      const isActive = btn.getAttribute("data-lang") === active;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.addEventListener("click", () => setGoogleLanguage(btn.getAttribute("data-lang") || "es"));
    });
  }

  async function fetchPublicContent() {
    if (publicContentCache) return publicContentCache;
    if (publicContentRequestPromise) return publicContentRequestPromise;

    publicContentRequestPromise = fetch(`${PUBLIC_API_URL}/content`)
      .then(async (response) => {
        let data = null;
        try { data = await response.json(); } catch (_) { data = null; }
        if (!response.ok || !data) throw new Error((data && data.error) || "No se pudo cargar contenido");
        publicContentCache = {
          recetas: Array.isArray(data.recetas) ? data.recetas : [],
          libros: Array.isArray(data.libros) ? data.libros : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
        };
        return publicContentCache;
      })
      .catch(() => null)
      .finally(() => { publicContentRequestPromise = null; });

    return publicContentRequestPromise;
  }

  async function getPublishedItems(kind, fallbackLocalStorageKey) {
    const remote = await fetchPublicContent();
    if (remote && Array.isArray(remote[kind])) return remote[kind];
    return loadItems(fallbackLocalStorageKey).filter((item) => isTrue(item.publico));
  }

  async function findRecipeById(id) {
    if (!id) return null;
    const recetas = await getPublishedItems("recetas", "admin_recetas");
    return recetas.find((r) => String(r.id) === String(id)) || null;
  }

  async function renderRecipeDetailPage() {
    const path = (window.location.pathname || "").toLowerCase();
    if (!path.includes("/receta.html")) return false;

    const recipeId = new URLSearchParams(window.location.search || "").get("id");
    const recipe = await findRecipeById(recipeId);
    const emptyState = document.getElementById("recipeDetailEmpty");
    const content = document.getElementById("recipeDetailContent");
    if (!emptyState || !content) return true;

    if (!recipe) {
      emptyState.style.display = "block";
      content.style.display = "none";
      return true;
    }

    const titleEl = document.getElementById("recipeDetailTitle");
    const timeEl = document.getElementById("recipeDetailTime");
    const imageEl = document.getElementById("recipeDetailImage");
    const ingredientsEl = document.getElementById("recipeDetailIngredients");
    const stepsEl = document.getElementById("recipeDetailSteps");
    const notesEl = document.getElementById("recipeDetailNotes");
    const notesWrapEl = document.getElementById("recipeDetailNotesWrap");

    if (titleEl) titleEl.textContent = recipe.titulo || "Receta";
    if (timeEl) timeEl.textContent = recipe.tiempo || "Sin tiempo especificado";
    if (imageEl) { imageEl.src = recipe.imagen || "/FrontEnd/img/90fc53c9.svg"; imageEl.alt = recipe.titulo || "Receta"; }
    if (ingredientsEl) ingredientsEl.textContent = recipe.ingredientes || "Sin ingredientes registrados";
    if (stepsEl) stepsEl.textContent = recipe.pasos || "Sin pasos registrados";
    if (notesEl) notesEl.textContent = recipe.notas || "";
    if (notesWrapEl) notesWrapEl.style.display = recipe.notas ? "block" : "none";

    emptyState.style.display = "none";
    content.style.display = "grid";
    return true;
  }

  function renderCardsIntoGrid(gridEl, items, mapper) {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    if (!items.length) {
      gridEl.innerHTML = '<article class="recipe-card"><img src="/FrontEnd/img/90fc53c9.svg" alt="Sin contenido" /><div class="recipe-card__body"><h2 class="recipe-card__title">No hay contenido publico</h2><p class="recipe-card__text">Aun no se han publicado elementos desde el panel de administracion.</p></div></article>';
      return;
    }
    items.forEach((it) => gridEl.insertAdjacentHTML("beforeend", mapper(it)));
  }

  async function initDynamicViews() {
    const path = (window.location.pathname || "").toLowerCase();
    if (await renderRecipeDetailPage()) return;

    const grid = document.querySelector(".recipe-grid");
    if (!grid) return;

    if (path.includes("/recetas.html")) {
      const recetas = await getPublishedItems("recetas", "admin_recetas");
      renderCardsIntoGrid(grid, recetas, (r) => `<article class="recipe-card"><img src="${r.imagen || "/FrontEnd/img/90fc53c9.svg"}" alt="${escapeHtml(r.titulo)}" /><div class="recipe-card__body"><h2 class="recipe-card__title">${escapeHtml(r.titulo)}</h2><p class="recipe-card__text">${escapeHtml(firstLine(r.ingredientes))}</p>${r.tiempo ? `<h4>tiempo: ${escapeHtml(r.tiempo)}</h4>` : ``}<a href="/FrontEnd/View/receta.html?id=${encodeURIComponent(String(r.id || ""))}" class="btn btn--outline">Ver receta</a></div></article>`);
      return;
    }

    if (path.includes("/libros.html")) {
      const libros = await getPublishedItems("libros", "admin_libros");
      renderCardsIntoGrid(grid, libros, (l) => `<article class="recipe-card"><img src="${l.imagen || "/FrontEnd/img/90fc53c9.svg"}" alt="${escapeHtml(l.titulo)}" /><div class="recipe-card__body"><h2 class="recipe-card__title">${escapeHtml(l.titulo)}</h2><p class="recipe-card__text">${escapeHtml(l.descripcion)}</p>${l.precio ? `<h4>precio: ${escapeHtml(l.precio)}</h4>` : ``}<a href="${l.linkCompra ? escapeHtml(l.linkCompra) : "#"}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">Ver / Comprar</a></div></article>`);
      return;
    }

    if (path.includes("/videos.html")) {
      const videos = await getPublishedItems("videos", "admin_videos");
      renderCardsIntoGrid(grid, videos, (v) => `<article class="recipe-card"><img src="/FrontEnd/img/90fc53c9.svg" alt="${escapeHtml(v.titulo)}" /><div class="recipe-card__body"><h2 class="recipe-card__title">${escapeHtml(v.titulo)}</h2><p class="recipe-card__text">${escapeHtml(v.descripcion || "Video publicado")}</p><a href="${v.url ? escapeHtml(v.url) : "#"}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">Ver video</a></div></article>`);
    }
  }

  async function postPublic(endpoint, payload) {
    const response = await fetch(`${PUBLIC_API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data = null;
    try { data = await response.json(); } catch (_) { data = null; }
    if (!response.ok) throw new Error((data && data.error) || "No se pudo enviar el formulario");
    return data;
  }

  function initPublicForms() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const isContactPage = (window.location.pathname || "").toLowerCase().includes("/contacto.html");
    const okMessage = form.querySelector(".form-message--ok");
    const errorMessage = form.querySelector(".form-message--error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (okMessage) okMessage.textContent = "";
      if (errorMessage) errorMessage.textContent = "";
      const name = (form.querySelector("#name")?.value || "").trim();
      const email = (form.querySelector("#email")?.value || "").trim();
      const recipeType = (form.querySelector("#recipe-type")?.value || "").trim();
      const message = (form.querySelector("#message")?.value || "").trim();
      if (!name || !email || !message) {
        if (errorMessage) errorMessage.textContent = "Completa todos los campos obligatorios.";
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      try {
        if (submitBtn) submitBtn.disabled = true;
        if (isContactPage) await postPublic("contacts", { name, email, requestType: recipeType || "general", message });
        else await postPublic("suggestions", { name, email, recipeType: recipeType || "general", message });
        form.reset();
        if (okMessage) okMessage.textContent = "Mensaje enviado correctamente.";
      } catch (error) {
        if (errorMessage) errorMessage.textContent = error.message || "No se pudo enviar el mensaje.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const submenuToggles = document.querySelectorAll(".site-nav__submenu-toggle");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("site-nav--open");
      const isOpen = siteNav.classList.contains("site-nav--open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (!isOpen) submenuToggles.forEach((btn) => { const item = btn.closest(".site-nav__item--submenu"); if (item) item.classList.remove("site-nav__item--open"); btn.setAttribute("aria-expanded", "false"); });
    });
  }

  submenuToggles.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const parentItem = btn.closest(".site-nav__item--submenu");
      if (!parentItem) return;
      const isOpen = parentItem.classList.toggle("site-nav__item--open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  if (tabLinks.length && tabContents.length) {
    tabLinks.forEach((btn) => btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabLinks.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    }));
  }

  ensureGoogleTranslate();
  ensureLanguageSwitcher();
  initDynamicViews();
  initPublicForms();
});
