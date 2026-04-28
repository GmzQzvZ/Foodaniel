document.addEventListener("DOMContentLoaded", () => {
  const baseOrigin =
    window.location.protocol === "file:" || window.location.origin === "null"
      ? "http://localhost:3000"
      : window.location.origin;
  const PUBLIC_API_URL = `${baseOrigin}/api/public`;

  let publicContentCache = null;
  let publicContentCacheLang = null;
  let publicContentRequestPromise = null;
  let publicContentRequestLang = null;

  function getCurrentLang() {
    return window.FoodaniellI18n && typeof window.FoodaniellI18n.getCurrentLang === "function"
      ? window.FoodaniellI18n.getCurrentLang()
      : (localStorage.getItem("foodaniell_lang") || "es");
  }

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

  // Google Translate eliminado: ahora usamos i18n.js local

  async function fetchPublicContent() {
    const currentLang = getCurrentLang();
    if (publicContentCache && publicContentCacheLang === currentLang) return publicContentCache;
    if (publicContentRequestPromise && publicContentRequestLang === currentLang) return publicContentRequestPromise;

    publicContentRequestLang = currentLang;
    publicContentRequestPromise = fetch(`${PUBLIC_API_URL}/content?lang=${encodeURIComponent(currentLang)}`)
      .then(async (response) => {
        let data = null;
        try { data = await response.json(); } catch (_) { data = null; }
        if (!response.ok || !data) throw new Error((data && data.error) || "No se pudo cargar contenido");
        publicContentCache = {
          recetas: Array.isArray(data.recetas) ? data.recetas : [],
          libros: Array.isArray(data.libros) ? data.libros : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
        };
        publicContentCacheLang = currentLang;
        return publicContentCache;
      })
      .catch(() => null)
      .finally(() => {
        publicContentRequestPromise = null;
        publicContentRequestLang = null;
      });

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

    // Elementos de tabla nutricional
    const nutritionWrap = document.getElementById("recipeNutritionWrap");
    const caloriesEl = document.getElementById("nutritionCalories");
    const proteinsEl = document.getElementById("nutritionProteins");
    const carbsEl = document.getElementById("nutritionCarbs");
    const fatsEl = document.getElementById("nutritionFats");
    const fiberEl = document.getElementById("nutritionFiber");
    const sugarEl = document.getElementById("nutritionSugar");
    const sodiumEl = document.getElementById("nutritionSodium");
    const servingsEl = document.getElementById("nutritionServings");

    function setNutritionPlaceholder() {
      if (caloriesEl) caloriesEl.textContent = "--";
      if (proteinsEl) proteinsEl.textContent = "--";
      if (carbsEl) carbsEl.textContent = "--";
      if (fatsEl) fatsEl.textContent = "--";
      if (fiberEl) fiberEl.textContent = "--";
      if (sugarEl) sugarEl.textContent = "--";
      if (sodiumEl) sodiumEl.textContent = "--";
      if (servingsEl) servingsEl.textContent = "--";
    }

    if (titleEl) titleEl.textContent = recipe.titulo || "Receta";
    if (timeEl) timeEl.textContent = recipe.tiempo || "Sin tiempo especificado";
    if (imageEl) { imageEl.src = recipe.imagen || "/FrontEnd/img/90fc53c9.svg"; imageEl.alt = recipe.titulo || "Receta"; }
    if (ingredientsEl) ingredientsEl.textContent = recipe.ingredientes || "Sin ingredientes registrados";
    if (stepsEl) stepsEl.textContent = recipe.pasos || "Sin pasos registrados";
    if (notesEl) notesEl.textContent = recipe.notas || "";
    if (notesWrapEl) notesWrapEl.style.display = recipe.notas ? "block" : "none";

    // Mostrar información nutricional
    if (nutritionWrap) {
      const nutrition = recipe.nutrition || {
        calories: recipe.calories,
        proteins: recipe.proteins,
        carbs: recipe.carbs,
        fats: recipe.fats,
        fiber: recipe.fiber,
        sugar: recipe.sugar,
        sodium: recipe.sodium,
        servings: recipe.servings,
      };
      if (!nutrition) {
        setNutritionPlaceholder();
      } else {
        if (caloriesEl) caloriesEl.textContent = nutrition.calories === null || typeof nutrition.calories === "undefined" || nutrition.calories === "" ? "--" : `${nutrition.calories} kcal`;
        if (proteinsEl) proteinsEl.textContent = nutrition.proteins === null || typeof nutrition.proteins === "undefined" || nutrition.proteins === "" ? "--" : `${nutrition.proteins}g`;
        if (carbsEl) carbsEl.textContent = nutrition.carbs === null || typeof nutrition.carbs === "undefined" || nutrition.carbs === "" ? "--" : `${nutrition.carbs}g`;
        if (fatsEl) fatsEl.textContent = nutrition.fats === null || typeof nutrition.fats === "undefined" || nutrition.fats === "" ? "--" : `${nutrition.fats}g`;
        if (fiberEl) fiberEl.textContent = nutrition.fiber === null || typeof nutrition.fiber === "undefined" || nutrition.fiber === "" ? "--" : `${nutrition.fiber}g`;
        if (sugarEl) sugarEl.textContent = nutrition.sugar === null || typeof nutrition.sugar === "undefined" || nutrition.sugar === "" ? "--" : `${nutrition.sugar}g`;
        if (sodiumEl) sodiumEl.textContent = nutrition.sodium === null || typeof nutrition.sodium === "undefined" || nutrition.sodium === "" ? "--" : `${nutrition.sodium}mg`;
        if (servingsEl) servingsEl.textContent = nutrition.servings === null || typeof nutrition.servings === "undefined" || nutrition.servings === "" ? "--" : nutrition.servings;
      }
      nutritionWrap.style.display = "block";
    }

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

  window.addEventListener("foodaniell:langchange", () => {
    publicContentCache = null;
    publicContentCacheLang = null;
    publicContentRequestPromise = null;
    publicContentRequestLang = null;
    initDynamicViews();
  });

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
    tabLinks.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab");

        // Quitar active de todas las pestañas
        tabLinks.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        // Activar pestaña y contenido seleccionado
        btn.classList.add("active");
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  }

  // i18n.js ahora maneja la actualización automáticamente

  initDynamicViews();
  // Google Translate eliminado: ahora usa i18n.js
  initPublicForms();
});
