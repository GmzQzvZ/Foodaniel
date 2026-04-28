
(function () {
  const baseOrigin =
    window.location.protocol === "file:" || window.location.origin === "null"
      ? "http://localhost:3000"
      : window.location.origin;
  const API_URL = `${baseOrigin}/api/auth`;
  const API_ADMIN_URL = `${baseOrigin}/api/admin`;

  function isDashboard() {
    const path = window.location.pathname;
    return path.endsWith("/admin/index.html") || path.includes("/FrontEnd/admin/index.html");
  }

  function isLogin() {
    const path = window.location.pathname;
    return path.endsWith("/admin/login.html") || path.includes("/FrontEnd/admin/login.html");
  }

  function saveSession(data) {
    sessionStorage.setItem("adminLogged", "true");
    if (data && data.token) localStorage.setItem("auth_token", data.token);
    if (data && data.user) localStorage.setItem("user", JSON.stringify(data.user));
  }

  function isLogged() {
    return sessionStorage.getItem("adminLogged") === "true";
  }

  function clearSession() {
    sessionStorage.removeItem("adminLogged");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  async function apiLogin(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (!response.ok) {
      throw new Error((data && data.error) || "Credenciales invlidas");
    }

    return data;
  }

  async function fetchAdminBootstrap() {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("Sesin no vlida");

    let response;
    try {
      response = await fetch(`${API_ADMIN_URL}/bootstrap`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {
      throw new Error("No se pudo conectar con el backend. Verifica que est ejecutndose.");
    }

    if (!response.ok) {
      throw new Error("No se pudo cargar la informacin del panel");
    }

    return response.json();
  }

  async function adminRequest(url, options = {}) {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("Sesin no vlida");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (!response.ok) {
      throw new Error((data && data.error) || "Error de servidor");
    }

    return data;
  }

  function normalizeBootstrapToLocalStorage(data) {
    const books = Array.isArray(data.books) ? data.books : [];
    const recipes = Array.isArray(data.recipes) ? data.recipes : [];
    const videos = Array.isArray(data.videos) ? data.videos : [];
    const users = Array.isArray(data.users) ? data.users : [];
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    const contacts = Array.isArray(data.contacts) ? data.contacts : [];
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];

    const libros = books.map((item) => ({
      id: String(item.id),
      imagen: item.image_url || "",
      titulo: item.title || "",
      descripcion: item.description || "",
      linkCompra: item.buy_link || "",
      precio: item.price != null ? String(item.price) : "",
      publico: Boolean(item.is_public),
    }));

    const recetas = recipes.map((item) => {
      let parsedImages = [];
      if (typeof item.image_url === "string" && item.image_url.trim().startsWith("[")) {
        try {
          const candidate = JSON.parse(item.image_url);
          if (Array.isArray(candidate)) {
            parsedImages = candidate.filter((x) => typeof x === "string" && x.trim());
          }
        } catch (_) {
          parsedImages = [];
        }
      }
      if (!parsedImages.length && item.image_url) {
        parsedImages = [item.image_url];
      }

      const calorias = item.calories != null ? String(item.calories) : "";
      const proteinas = item.proteins != null ? String(item.proteins) : "";
      const carbohidratos = item.carbs != null ? String(item.carbs) : "";
      const grasas = item.fats != null ? String(item.fats) : "";
      const fibra = item.fiber != null ? String(item.fiber) : "";
      const azucar = item.sugar != null ? String(item.sugar) : "";
      const sodio = item.sodium != null ? String(item.sodium) : "";
      const porciones = item.servings != null ? String(item.servings) : "";
      const hasNutrition = [
        calorias,
        proteinas,
        carbohidratos,
        grasas,
        fibra,
        azucar,
        sodio,
        porciones,
      ].some((value) => value !== "");

      return {
        id: String(item.id),
        imagen: parsedImages[0] || "",
        imagenes: parsedImages,
        titulo: item.title || "",
        tiempo: item.time_text || "",
        ingredientes: item.ingredients || "",
        pasos: item.steps || "",
        notas: item.notes || "",
        publico: Boolean(item.is_public),
        calorias,
        proteinas,
        carbohidratos,
        grasas,
        fibra,
        azucar,
        sodio,
        porciones,
        nutrition: hasNutrition
          ? {
              calories: item.calories != null ? item.calories : null,
              proteins: item.proteins != null ? item.proteins : null,
              carbs: item.carbs != null ? item.carbs : null,
              fats: item.fats != null ? item.fats : null,
              fiber: item.fiber != null ? item.fiber : null,
              sugar: item.sugar != null ? item.sugar : null,
              sodium: item.sodium != null ? item.sodium : null,
              servings: item.servings != null ? item.servings : null,
            }
          : null,
      };
    });

    const videosMapped = videos.map((item) => ({
      id: String(item.id),
      titulo: item.title || "",
      descripcion: item.description || "",
      url: item.url || "",
      publico: Boolean(item.is_public),
    }));

    const usuarios = users.map((item) => ({
      id: String(item.id),
      nombre: item.name || "",
      email: item.email || "",
      role: item.role || "user",
      recibeCorreos: Boolean(item.receive_emails),
    }));

    const sugerencias = suggestions.map((item) => ({
      id: String(item.id),
      fecha: item.created_at || "",
      nombre: item.name || "",
      email: item.email || "",
      tipoReceta: item.recipe_type || "",
      mensaje: item.message || "",
    }));

    const contactos = contacts.map((item) => ({
      id: String(item.id),
      fecha: item.created_at || "",
      nombre: item.name || "",
      email: item.email || "",
      tipoSolicitud: item.request_type || "",
      mensaje: item.message || "",
    }));

    const tareas = tasks.map((item) => ({
      id: String(item.id),
      text: item.text || "",
      done: Boolean(item.is_done),
      createdAt: item.created_at || "",
    }));

    localStorage.setItem("admin_libros", JSON.stringify(libros));
    localStorage.setItem("admin_recetas", JSON.stringify(recetas));
    localStorage.setItem("admin_videos", JSON.stringify(videosMapped));
    localStorage.setItem("admin_usuarios", JSON.stringify(usuarios));
    localStorage.setItem("admin_sugerencias", JSON.stringify(sugerencias));
    localStorage.setItem("admin_contactos", JSON.stringify(contactos));
    localStorage.setItem("admin_todos", JSON.stringify(tareas));
  }

  let adminBootstrapFailureCount = 0;
  let adminBootstrapRetryAfter = 0;

  async function syncAdminDataFromDatabase() {
    const now = Date.now();
    if (adminBootstrapRetryAfter && now < adminBootstrapRetryAfter) {
      return;
    }

    try {
      const data = await fetchAdminBootstrap();
      normalizeBootstrapToLocalStorage(data);
      adminBootstrapFailureCount = 0;
      adminBootstrapRetryAfter = 0;
    } catch (error) {
      console.error("No se pudo sincronizar el panel admin:", error);
      adminBootstrapFailureCount += 1;
      const backoffMs = Math.min(5 * 60 * 1000, adminBootstrapFailureCount * 60 * 1000);
      adminBootstrapRetryAfter = Date.now() + backoffMs;
    }
  }

  function redirectToDashboard() {
    window.location.href = "index.html";
  }

  function redirectToLogin() {
    window.location.href = "login.html";
  }


  function initLogin() {
    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    if (isLogged()) {
      redirectToDashboard();
      return;
    }

    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const errorMsg = document.getElementById("adminLoginError");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passwordInput.value.trim();

      try {
        const data = await apiLogin(email, pass);
        saveSession(data);
        redirectToDashboard();
      } catch (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message || "Credenciales invlidas";
          errorMsg.style.display = "block";
        }
      }
    });
  }

  // ================= HELPERS STORAGE =================
  function loadItems(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error leyendo", key, e);
      return [];
    }
  }

  function saveItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function isTrue(value) {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  function createThumbTd(dataUrl) {
    const td = document.createElement("td");
    if (dataUrl) {
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "Imagen";
      img.className = "md-thumb";
      td.appendChild(img);
    } else {
      td.textContent = "";
      td.style.color = "rgba(148, 163, 184, 0.9)";
    }
    return td;
  }

  // ================= RENDER GENRICO DE TABLAS =================
  function renderTable(tbody, items, fields, onEdit, onDelete) {
    if (!tbody) return;
    tbody.innerHTML = "";

    items.forEach((item) => {
      const tr = document.createElement("tr");

      fields.forEach((f) => {
        const td = document.createElement("td");
        const value = item[f];
        if (f === "publico") {
          td.textContent = isTrue(value) ? "S" : "No";
        } else if (typeof value === "boolean") {
          td.textContent = value ? "S" : "No";
        } else {
          td.textContent = value || "";
        }
        tr.appendChild(td);
      });

      const actionsTd = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.textContent = "Editar";
      editBtn.className = "btn-table btn-edit";
      editBtn.addEventListener("click", () => onEdit(item));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.className = "btn-table btn-delete";
      deleteBtn.addEventListener("click", () => onDelete(item));

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
  }

  // ================= DASHBOARD =================
  async function initDashboard() {
    if (!isDashboard()) return;

    if (!isLogged()) {
      redirectToLogin();
      return;
    }

    await syncAdminDataFromDatabase();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearSession();
        redirectToLogin();
      });
    }

    // --- Navegacin entre mdulos ---
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".crud-section");

    const pageTitleEl = document.querySelector(".md-page-title__h");
    const pageSubTitleEl = document.querySelector(".md-page-title__p");

    function updateTopbarTitle(sectionName) {
      if (!pageTitleEl || !pageSubTitleEl) return;

      const map = {
        dashboard: {
          title: "Dashboard",
          subtitle: "Resumen general",
        },
        libros: {
          title: "Libros",
          subtitle: "Gestiona tu catlogo",
        },
        recetas: {
          title: "Recetas",
          subtitle: "Crea, edita y elimina recetas",
        },
        videos: {
          title: "Videos",
          subtitle: "Guarda enlaces de YouTube",
        },
        usuarios: {
          title: "Usuarios",
          subtitle: "Suscripcion a correos",
        },
        sugerencias: {
          title: "Sugerencias",
          subtitle: "Mensajes enviados desde la web",
        },
        contacto: {
          title: "Contacto",
          subtitle: "Solicitudes recibidas desde contacto",
        },
      };

      const item = map[sectionName] || map.dashboard;
      pageTitleEl.textContent = item.title;
      pageSubTitleEl.textContent = item.subtitle;
    }

    function updateKpis() {
      const kpiRecetas = document.getElementById("kpiRecetas");
      const kpiVideos = document.getElementById("kpiVideos");
      const kpiLibros = document.getElementById("kpiLibros");
      const kpiUsuarios = document.getElementById("kpiUsuarios");

      if (!kpiRecetas && !kpiVideos && !kpiLibros && !kpiUsuarios) return;

      const recetas = loadItems("admin_recetas");
      const videos = loadItems("admin_videos");
      const libros = loadItems("admin_libros");
      const usuarios = loadItems("admin_usuarios");
      const usuariosRoleUser = usuarios.filter((u) => (u.role || "user") === "user");

      if (kpiRecetas) kpiRecetas.textContent = String(recetas.length);
      if (kpiVideos) kpiVideos.textContent = String(videos.length);
      if (kpiLibros) kpiLibros.textContent = String(libros.length);
      if (kpiUsuarios) kpiUsuarios.textContent = String(usuariosRoleUser.length);
    }

    const notificationsBtn = document.getElementById("notificationsBtn");
    const notificationsBadge = document.getElementById("notificationsBadge");
    const notificationsPanel = document.getElementById("notificationsPanel");
    const notificationsList = document.getElementById("notificationsList");
    const tablaSugerenciasBody = document.querySelector("#tablaSugerencias tbody");
    const tablaContactosBody = document.querySelector("#tablaContactos tbody");
    const viewMessageModal = document.getElementById("viewMessageModal");
    const viewMessageModalTitle = document.getElementById("viewMessageModalTitle");
    const viewMessageModalBody = document.getElementById("viewMessageModalBody");
    const viewMessageModalClose = document.getElementById("viewMessageModalClose");
    const viewMessageModalCloseBtn = document.getElementById("viewMessageModalCloseBtn");
    let lastSeenMessagesAt = Number(localStorage.getItem("admin_last_seen_messages_at") || 0);
    let lastViewMessageModalTrigger = null;

    function openMessageModal(title, fields) {
      if (!viewMessageModal || !viewMessageModalTitle || !viewMessageModalBody) return;
      lastViewMessageModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      viewMessageModalTitle.textContent = title || "Detalle";
      viewMessageModalBody.innerHTML = "";
      fields.forEach((item) => {
        const wrap = document.createElement("div");
        wrap.className = "form-group";

        const label = document.createElement("label");
        label.textContent = item.label;

        const value = document.createElement("div");
        value.className = "md-message-value";
        value.textContent = item.value || "";

        wrap.appendChild(label);
        wrap.appendChild(value);
        viewMessageModalBody.appendChild(wrap);
      });

      viewMessageModal.setAttribute("aria-hidden", "false");
      viewMessageModal.classList.add("admin-modal--open");

      window.requestAnimationFrame(() => {
        if (viewMessageModalCloseBtn && typeof viewMessageModalCloseBtn.focus === "function") {
          viewMessageModalCloseBtn.focus();
        }
      });
    }

    function closeMessageModal() {
      if (!viewMessageModal || !viewMessageModalBody) return;

      const active = document.activeElement;
      if (active && viewMessageModal.contains(active) && typeof active.blur === "function") {
        active.blur();
      }

      viewMessageModal.setAttribute("aria-hidden", "true");
      viewMessageModal.classList.remove("admin-modal--open");
      viewMessageModalBody.innerHTML = "";

      window.requestAnimationFrame(() => {
        if (lastViewMessageModalTrigger && typeof lastViewMessageModalTrigger.focus === "function") {
          try {
            lastViewMessageModalTrigger.focus();
          } catch (_) {
            // Ignore focus restoration failures when the trigger is gone.
          }
        }
      });
    }

    if (viewMessageModalClose) {
      viewMessageModalClose.addEventListener("click", closeMessageModal);
    }
    if (viewMessageModalCloseBtn) {
      viewMessageModalCloseBtn.addEventListener("click", closeMessageModal);
    }
    if (viewMessageModal) {
      const backdrop = viewMessageModal.querySelector(".admin-modal__backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", closeMessageModal);
      }
    }

    function formatDateTime(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleString("es-CO");
    }

    function getMessagesData() {
      const sugerencias = loadItems("admin_sugerencias");
      const contactos = loadItems("admin_contactos");
      return { sugerencias, contactos };
    }

    function buildMessageFeed() {
      const { sugerencias, contactos } = getMessagesData();
      const feed = [];

      sugerencias.forEach((item) => {
        feed.push({
          id: Number(item.id) || 0,
          tipo: "Sugerencia",
          nombre: item.nombre || "",
          fecha: item.fecha || "",
          detalle: item.tipoReceta || "general",
        });
      });

      contactos.forEach((item) => {
        feed.push({
          id: Number(item.id) || 0,
          tipo: "Contacto",
          nombre: item.nombre || "",
          fecha: item.fecha || "",
          detalle: item.tipoSolicitud || "sin tipo",
        });
      });

      feed.sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.fecha).getTime();
        return dateB - dateA;
      });

      return feed;
    }

    function updateNotifications() {
      const feed = buildMessageFeed();
      const unread = feed.filter((item) => {
        const createdAt = new Date(item.fecha).getTime();
        return !Number.isNaN(createdAt) && createdAt > lastSeenMessagesAt;
      }).length;

      if (notificationsBadge) {
        notificationsBadge.textContent = String(unread);
        notificationsBadge.style.display = unread > 0 ? "inline-flex" : "none";
      }

      if (notificationsList) {
        notificationsList.innerHTML = "";
        if (!feed.length) {
          const li = document.createElement("li");
          li.className = "md-noti-item";
          li.textContent = "No hay notificaciones.";
          notificationsList.appendChild(li);
        } else {
          feed.slice(0, 8).forEach((item) => {
            const li = document.createElement("li");
            li.className = "md-noti-item";
            li.textContent = `[${item.tipo}] ${item.nombre} - ${item.detalle} - ${formatDateTime(item.fecha)}`;
            notificationsList.appendChild(li);
          });
        }
      }
    }

    function markNotificationsAsSeen() {
      lastSeenMessagesAt = Date.now();
      localStorage.setItem("admin_last_seen_messages_at", String(lastSeenMessagesAt));
      updateNotifications();
    }

    if (notificationsBtn) {
      notificationsBtn.addEventListener("click", () => {
        if (!notificationsPanel) return;
        const isOpen = notificationsPanel.style.display === "block";
        notificationsPanel.style.display = isOpen ? "none" : "block";
        if (!isOpen) {
          markNotificationsAsSeen();
        }
      });
    }

    function renderSugerencias() {
      if (!tablaSugerenciasBody) return;
      const { sugerencias } = getMessagesData();
      tablaSugerenciasBody.innerHTML = "";

      sugerencias.forEach((s) => {
        const tr = document.createElement("tr");
        [formatDateTime(s.fecha), s.nombre || "", s.email || "", s.tipoReceta || "", s.mensaje || ""].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        const tdActions = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.className = "btn-table btn-edit";
        viewBtn.textContent = "Ver";
        viewBtn.addEventListener("click", () => {
          openMessageModal("Detalle de sugerencia", [
            { label: "Fecha", value: formatDateTime(s.fecha) },
            { label: "Nombre", value: s.nombre || "" },
            { label: "Correo", value: s.email || "" },
            { label: "Tipo receta", value: s.tipoReceta || "" },
            { label: "Mensaje", value: s.mensaje || "" },
          ]);
        });
        tdActions.appendChild(viewBtn);
        tr.appendChild(tdActions);
        tablaSugerenciasBody.appendChild(tr);
      });
    }

    function renderContactos() {
      if (!tablaContactosBody) return;
      const { contactos } = getMessagesData();
      tablaContactosBody.innerHTML = "";

      contactos.forEach((c) => {
        const tr = document.createElement("tr");
        [formatDateTime(c.fecha), c.nombre || "", c.email || "", c.tipoSolicitud || "", c.mensaje || ""].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        const tdActions = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.className = "btn-table btn-edit";
        viewBtn.textContent = "Ver";
        viewBtn.addEventListener("click", () => {
          openMessageModal("Detalle de contacto", [
            { label: "Fecha", value: formatDateTime(c.fecha) },
            { label: "Nombre", value: c.nombre || "" },
            { label: "Correo", value: c.email || "" },
            { label: "Tipo solicitud", value: c.tipoSolicitud || "" },
            { label: "Mensaje", value: c.mensaje || "" },
          ]);
        });
        tdActions.appendChild(viewBtn);
        tr.appendChild(tdActions);
        tablaContactosBody.appendChild(tr);
      });
    }

    // ================= TAREAS DASHBOARD =================
    let todosInitialized = false;
    function initTodos() {
      const form = document.getElementById("todoForm");
      const input = document.getElementById("todoInput");
      const list = document.getElementById("todoList");
      if (!form || !input || !list) return;

      if (todosInitialized) return;
      todosInitialized = true;

      let todos = loadItems("admin_todos");

      async function reloadTasksFromDatabase() {
        await syncAdminDataFromDatabase();
        todos = loadItems("admin_todos");
      }

      async function createTaskInDatabase(payload) {
        return adminRequest(`${API_ADMIN_URL}/tasks`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      async function updateTaskInDatabase(id, payload) {
        return adminRequest(`${API_ADMIN_URL}/tasks/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      async function deleteTaskInDatabase(id) {
        return adminRequest(`${API_ADMIN_URL}/tasks/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      }

      function render() {
        list.innerHTML = "";

        if (!Array.isArray(todos) || todos.length === 0) {
          const empty = document.createElement("div");
          empty.className = "md-todo__empty";
          empty.textContent = "Aun no tienes tareas. Agrega una.";
          list.appendChild(empty);
          return;
        }

        todos.forEach((t) => {
          const row = document.createElement("div");
          row.className = "md-todo__row" + (t.done ? " is-done" : "");

          const label = document.createElement("label");
          label.className = "md-todo__item";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = !!t.done;
          checkbox.addEventListener("change", async () => {
            try {
              await updateTaskInDatabase(t.id, { done: checkbox.checked });
              await reloadTasksFromDatabase();
              render();
            } catch (error) {
              alert(error.message || "No se pudo actualizar la tarea");
            }
          });

          const text = document.createElement("span");
          text.className = "md-todo__text";
          text.textContent = t.text || "";

          label.appendChild(checkbox);
          label.appendChild(text);

          const del = document.createElement("button");
          del.type = "button";
          del.className = "md-todo__del";
          del.setAttribute("aria-label", "Eliminar tarea");
          del.textContent = "x";
          del.addEventListener("click", async () => {
            try {
              await deleteTaskInDatabase(t.id);
              await reloadTasksFromDatabase();
              render();
            } catch (error) {
              alert(error.message || "No se pudo eliminar la tarea");
            }
          });

          row.appendChild(label);
          row.appendChild(del);
          list.appendChild(row);
        });
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (!value) return;

        try {
          await createTaskInDatabase({ text: value });
          input.value = "";
          await reloadTasksFromDatabase();
          render();
        } catch (error) {
          alert(error.message || "No se pudo crear la tarea");
        }
      });

      render();
    }

    function activateSection(sectionName) {
      sections.forEach((sec) => {
        sec.classList.remove("active");
      });
      const target = document.getElementById("section-" + sectionName);
      if (target) target.classList.add("active");

      updateTopbarTitle(sectionName);
      if (sectionName === "dashboard") {
        updateKpis();
        initTodos();
      }
      if (sectionName === "sugerencias" || sectionName === "contacto") {
        markNotificationsAsSeen();
      }

      navButtons.forEach((btn) => {
        if (btn.getAttribute("data-section") === sectionName) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const sectionName = btn.getAttribute("data-section");
        activateSection(sectionName);
      });
    });

    activateSection("dashboard");

    const modal = document.getElementById("adminModal");
    const modalTitle = document.getElementById("adminModalTitle");
    const modalFields = document.getElementById("adminModalFields");
    const modalForm = document.getElementById("adminModalForm");
    const modalItemId = document.getElementById("modalItemId");
    const modalClose = document.getElementById("adminModalClose");
    const modalCancel = document.getElementById("adminModalCancel");
    let lastAdminModalTrigger = null;

    let currentModalContext = null;

    function openModal(title, fieldsHtml, context, item) {
      if (!modal || !modalTitle || !modalFields || !modalForm) return;

      lastAdminModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modalTitle.textContent = title || "Editar";
      modalFields.innerHTML = fieldsHtml || "";
      currentModalContext = context || null;
      modalItemId.value = "";

      if (item && item.id) {
        modalItemId.value = item.id;
        Object.keys(item).forEach((key) => {
          if (key === "id") return;
          const field = modalFields.querySelector(`[name="${key}"]`);
          if (field) {
            if (field.type === "checkbox") {
              field.checked = isTrue(item[key]);
            } else if (field.type === "file") {
            } else {
              if (Array.isArray(item[key])) {
                field.value = JSON.stringify(item[key]);
              } else {
                field.value = item[key] != null ? item[key] : "";
              }
            }
          }
        });

        const previews = modalFields.querySelectorAll("[data-preview]");
        previews.forEach((previewEl) => {
          const key = previewEl.getAttribute("data-preview");
          if (!key) return;
          const hidden = modalFields.querySelector(`input[type="hidden"][name="${key}"]`);
          if (!hidden || !hidden.value) return;

          let previewSrc = hidden.value;
          if (hidden.value.trim().startsWith("[")) {
            try {
              const parsed = JSON.parse(hidden.value);
              if (Array.isArray(parsed) && parsed[0]) {
                previewSrc = parsed[0];
              }
            } catch (_) {
              previewSrc = hidden.value;
            }
          }

          previewEl.src = previewSrc;
          previewEl.style.display = previewSrc ? "block" : "none";
        });
      }

      const fileInputs = modalFields.querySelectorAll("input[type=\"file\"][data-store]");
      fileInputs.forEach((fileInput) => {
        fileInput.addEventListener("change", () => {
          const files = Array.from(fileInput.files || []);
          if (!files.length) return;

          const storeKey = fileInput.getAttribute("data-store") || "imagen";
          const hidden = modalFields.querySelector(`input[type="hidden"][name="${storeKey}"]`);
          const preview = modalFields.querySelector(`[data-preview="${storeKey}"]`);
          if (!hidden) return;

          const readAsDataUrl = (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ""));
              reader.onerror = () => reject(new Error("No se pudo leer imagen"));
              reader.readAsDataURL(file);
            });

          Promise.all(files.map((file) => readAsDataUrl(file)))
            .then((result) => {
              const dataUrls = result.filter(Boolean);
              if (!dataUrls.length) return;

              hidden.value = fileInput.multiple ? JSON.stringify(dataUrls) : dataUrls[0];
              if (preview) {
                preview.src = dataUrls[0];
                preview.style.display = "block";
              }
            })
            .catch((error) => {
              alert(error.message || "No se pudo leer la imagen");
            });
        });
      });

      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("admin-modal--open");

      const focusTarget =
        modalFields.querySelector(
          "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"
        ) || modalClose;

      window.requestAnimationFrame(() => {
        if (focusTarget && typeof focusTarget.focus === "function") {
          focusTarget.focus();
        }
      });
    }

    function closeModal() {
      if (!modal) return;

      const active = document.activeElement;
      if (active && modal.contains(active) && typeof active.blur === "function") {
        active.blur();
      }

      modal.setAttribute("aria-hidden", "true");
      modal.classList.remove("admin-modal--open");
      if (modalFields) modalFields.innerHTML = "";
      if (modalItemId) modalItemId.value = "";
      currentModalContext = null;

      window.requestAnimationFrame(() => {
        if (lastAdminModalTrigger && typeof lastAdminModalTrigger.focus === "function") {
          try {
            lastAdminModalTrigger.focus();
          } catch (_) {
            // Ignore focus restoration failures when the trigger is gone.
          }
        }
      });
    }

    // Cerrar con los botones y fondo
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalCancel) modalCancel.addEventListener("click", closeModal);
    if (modal) {
      const backdrop = modal.querySelector(".admin-modal__backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", closeModal);
      }
    }

    // Envo del formulario del modal (crear / editar)
    if (modalForm) {
      modalForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!currentModalContext) {
          console.warn("No hay contexto de modal activo");
          return;
        }

        const { items, saveKey, onChange, onSubmit } = currentModalContext;
        const submitBtn = modalForm.querySelector('button[type="submit"]');

        const formData = new FormData(modalForm);
        const currentId = modalItemId.value || "";
        const data = currentId ? { id: currentId } : {};

        formData.forEach((value, key) => {
          if (key === "id") return;
          if (value instanceof File) return;
          data[key] = value.toString().trim();
        });

        if (typeof data.imagenes === "string" && data.imagenes.trim()) {
          try {
            const parsedImages = JSON.parse(data.imagenes);
            if (Array.isArray(parsedImages)) {
              data.imagenes = parsedImages;
            }
          } catch (_) {
            data.imagenes = [data.imagenes];
          }
        }

        // Checkboxes no marcados no aparecen en FormData; los normalizamos a boolean.
        const checkboxFields = modalFields.querySelectorAll('input[type="checkbox"][name]');
        checkboxFields.forEach((cb) => {
          data[cb.name] = cb.checked;
        });

        try {
          if (submitBtn) submitBtn.disabled = true;

          if (typeof onSubmit === "function") {
            await onSubmit(data);
          } else {
            if (!Array.isArray(items) || !saveKey) {
              console.error("Contexto de modal invlido", currentModalContext);
              return;
            }

            const id = currentId || generateId();
            const localData = { ...data, id };
            const existingIndex = items.findIndex((it) => it.id === id);
            if (existingIndex >= 0) {
              items[existingIndex] = localData;
            } else {
              items.push(localData);
            }
            saveItems(saveKey, items);
          }

          if (typeof onChange === "function") {
            await onChange();
          }

          closeModal();
        } catch (error) {
          alert(error.message || "No se pudo guardar");
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // --- Libros, Recetas y Videos (persistencia en DB)
    let libros = loadItems("admin_libros");
    let recetas = loadItems("admin_recetas");
    let videos = loadItems("admin_videos");

    const tablaLibrosBody = document.querySelector("#tablaLibros tbody");
    const btnNuevoLibro = document.getElementById("btnNuevoLibro");
    const tablaRecetasBody = document.querySelector("#tablaRecetas tbody");
    const btnNuevaReceta = document.getElementById("btnNuevaReceta");
    const formVideos = document.getElementById("formVideos");
    const tablaVideosBody = document.querySelector("#tablaVideos tbody");
    const videoId = document.getElementById("videoId");
    const videoTitulo = document.getElementById("videoTitulo");
    const videoUrl = document.getElementById("videoUrl");
    const videoDescripcion = document.getElementById("videoDescripcion");
    const videoPublico = document.getElementById("videoPublico");
    const videoCancelar = document.getElementById("videoCancelar");

    async function reloadContentFromDatabase() {
      // Pequeño delay para asegurar que la base de datos haya procesado los cambios
      await new Promise(resolve => setTimeout(resolve, 300));
      await syncAdminDataFromDatabase();
      libros = loadItems("admin_libros");
      recetas = loadItems("admin_recetas");
      videos = loadItems("admin_videos");
      renderLibros();
      renderRecetas();
      renderVideos();
      updateKpis();
    }

    function mapBookPayload(data) {
      const rawPrice = typeof data.precio === "string" ? data.precio.trim() : "";
      const parsedPrice = rawPrice === "" ? null : Number(rawPrice);
      return {
        title: (data.titulo || "").trim(),
        description: (data.descripcion || "").trim(),
        buyLink: (data.linkCompra || "").trim(),
        price: Number.isFinite(parsedPrice) ? parsedPrice : null,
        imageUrl: (data.imagen || "").trim(),
        isPublic: !!data.publico,
      };
    }

    function mapRecipePayload(data) {
      const imageUrls = Array.isArray(data.imagenes)
        ? data.imagenes.filter((value) => typeof value === "string" && value.trim())
        : (typeof data.imagen === "string" && data.imagen.trim() ? [data.imagen.trim()] : []);

      const parseOptionalNumber = (value) => {
        if (value === null || typeof value === "undefined") return null;
        const trimmed = typeof value === "string" ? value.trim() : value;
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const parseOptionalInteger = (value) => {
        if (value === null || typeof value === "undefined") return null;
        const trimmed = typeof value === "string" ? value.trim() : value;
        if (trimmed === "") return null;
        const parsed = Number.parseInt(trimmed, 10);
        return Number.isInteger(parsed) ? parsed : null;
      };

      const nutrition = {
        calories: parseOptionalNumber(data.calorias),
        proteins: parseOptionalNumber(data.proteinas),
        carbs: parseOptionalNumber(data.carbohidratos),
        fats: parseOptionalNumber(data.grasas),
        fiber: parseOptionalNumber(data.fibra),
        sugar: parseOptionalNumber(data.azucar),
        sodium: parseOptionalNumber(data.sodio),
        servings: parseOptionalInteger(data.porciones)
      };

      const hasNutritionData = Object.values(nutrition).some((val) => val !== null);

      return {
        title: (data.titulo || "").trim(),
        timeText: (data.tiempo || "").trim(),
        ingredients: (data.ingredientes || "").trim(),
        steps: (data.pasos || "").trim(),
        notes: (data.notas || "").trim(),
        imageUrls,
        imageUrl: imageUrls[0] || "",
        isPublic: !!data.publico,
        nutrition: hasNutritionData ? nutrition : null,
      };
    }

    function mapVideoPayload(data) {
      return {
        title: (data.titulo || "").trim(),
        description: (data.descripcion || "").trim(),
        url: (data.url || "").trim(),
        isPublic: !!data.publico,
      };
    }

    async function createBookInDatabase(payload) {
      return adminRequest(`${API_ADMIN_URL}/books`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    async function updateBookInDatabase(id, payload) {
      return adminRequest(`${API_ADMIN_URL}/books/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    async function deleteBookInDatabase(id) {
      return adminRequest(`${API_ADMIN_URL}/books/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }

    async function createRecipeInDatabase(payload) {
      return adminRequest(`${API_ADMIN_URL}/recipes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    async function updateRecipeInDatabase(id, payload) {
      return adminRequest(`${API_ADMIN_URL}/recipes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    async function deleteRecipeInDatabase(id) {
      return adminRequest(`${API_ADMIN_URL}/recipes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }

    async function createVideoInDatabase(payload) {
      return adminRequest(`${API_ADMIN_URL}/videos`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    async function updateVideoInDatabase(id, payload) {
      return adminRequest(`${API_ADMIN_URL}/videos/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    async function deleteVideoInDatabase(id) {
      return adminRequest(`${API_ADMIN_URL}/videos/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }

    function renderLibros() {
      if (!tablaLibrosBody) return;
      tablaLibrosBody.innerHTML = "";

      libros.forEach((l) => {
        const tr = document.createElement("tr");
        tr.appendChild(createThumbTd(l.imagen));

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = l.titulo || "";
        tr.appendChild(tdTitulo);

        const tdDesc = document.createElement("td");
        tdDesc.textContent = l.descripcion || "";
        tr.appendChild(tdDesc);

        const tdLink = document.createElement("td");
        tdLink.textContent = l.linkCompra || "";
        tr.appendChild(tdLink);

        const tdPrecio = document.createElement("td");
        tdPrecio.textContent = l.precio || "";
        tr.appendChild(tdPrecio);

        const tdPublico = document.createElement("td");
        tdPublico.textContent = isTrue(l.publico) ? "Si" : "No";
        tr.appendChild(tdPublico);

        const actionsTd = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "btn-table btn-edit";
        editBtn.addEventListener("click", () => {
          openModal(
            "Editar libro",
            `
            <div class="form-group">
              <label for="modalLibroImagen">Imagen</label><br>
              <input type="file" id="modalLibroImagen" accept="image/*" data-store="imagen" />
              <input type="hidden" name="imagen" />
              <img data-preview="imagen" class="md-thumb md-thumb--preview" style="display:none" />
            </div>
            <div class="form-group">
              <label for="modalLibroTitulo">Titulo</label><br>
              <input type="text" id="modalLibroTitulo" name="titulo" required />
            </div>
            <div class="form-group">
              <label for="modalLibroDescripcion">Descripcion</label><br>
              <textarea id="modalLibroDescripcion" name="descripcion" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="modalLibroLink">Link de compra</label><br>
              <input type="url" id="modalLibroLink" name="linkCompra" placeholder="https://" />
            </div>
            <div class="form-group">
              <label for="modalLibroPrecio">Precio</label><br>
              <input type="number" step="0.01" min="0" id="modalLibroPrecio" name="precio" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label for="modalLibroPublico">Publico</label><br>
              <label class="md-checkbox">
                <input type="checkbox" id="modalLibroPublico" name="publico" />
                <span>Visible en el sitio</span>
              </label>
            </div>
            `,
            {
              onSubmit: async (data) => {
                await updateBookInDatabase(data.id, mapBookPayload(data));
              },
              onChange: reloadContentFromDatabase,
            },
            l
          );
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "btn-table btn-delete";
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("Eliminar libro?")) return;
          try {
            await deleteBookInDatabase(l.id);
            await reloadContentFromDatabase();
          } catch (error) {
            alert(error.message || "No se pudo eliminar el libro");
          }
        });

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);
        tablaLibrosBody.appendChild(tr);
      });
    }

    if (btnNuevoLibro) {
      btnNuevoLibro.addEventListener("click", function () {
        openModal(
          "Nuevo libro",
          `
          <div class="form-group">
            <label for="modalLibroImagen">Imagen</label><br>
            <input type="file" id="modalLibroImagen" accept="image/*" data-store="imagen" />
            <input type="hidden" name="imagen" />
            <img data-preview="imagen" class="md-thumb md-thumb--preview" style="display:none" />
          </div>
          <div class="form-group">
            <label for="modalLibroTitulo">Titulo</label><br>
            <input type="text" id="modalLibroTitulo" name="titulo" required />
          </div>
          <div class="form-group">
            <label for="modalLibroDescripcion">Descripcion</label><br>
            <textarea id="modalLibroDescripcion" name="descripcion" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="modalLibroLink">Link de compra</label><br>
            <input type="url" id="modalLibroLink" name="linkCompra" placeholder="https://" />
          </div>
          <div class="form-group">
            <label for="modalLibroPrecio">Precio</label><br>
            <input type="number" step="0.01" min="0" id="modalLibroPrecio" name="precio" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label for="modalLibroPublico">Publico</label><br>
            <label class="md-checkbox">
              <input type="checkbox" id="modalLibroPublico" name="publico" checked />
              <span>Visible en el sitio</span>
            </label>
          </div>
          `,
          {
            onSubmit: async (data) => {
              await createBookInDatabase(mapBookPayload(data));
            },
            onChange: reloadContentFromDatabase,
          },
          null
        );
      });
    }

    function renderRecetas() {
      if (!tablaRecetasBody) return;
      tablaRecetasBody.innerHTML = "";

      recetas.forEach((r) => {
        const tr = document.createElement("tr");
        tr.appendChild(createThumbTd(r.imagen));

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = r.titulo || "";
        tr.appendChild(tdTitulo);

        const tdTiempo = document.createElement("td");
        tdTiempo.textContent = r.tiempo || "";
        tr.appendChild(tdTiempo);

        const tdIng = document.createElement("td");
        tdIng.textContent = r.ingredientes || "";
        tr.appendChild(tdIng);

        const tdPublico = document.createElement("td");
        tdPublico.textContent = isTrue(r.publico) ? "Si" : "No";
        tr.appendChild(tdPublico);

        const actionsTd = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "btn-table btn-edit";
        editBtn.addEventListener("click", () => {
          openModal(
            "Editar receta",
            `
            <div class="form-group">
              <label for="modalRecetaImagen">Imagen</label><br>
              <input type="file" id="modalRecetaImagen" accept="image/*" data-store="imagenes" multiple />
              <input type="hidden" name="imagenes" />
              <img data-preview="imagenes" class="md-thumb md-thumb--preview" style="display:none" />
            </div>
            <div class="form-group">
              <label for="modalRecetaTitulo">Titulo</label><br>
              <input type="text" id="modalRecetaTitulo" name="titulo" required />
            </div>
            <div class="form-group">
              <label for="modalRecetaTiempo">Tiempo</label><br>
              <input type="text" id="modalRecetaTiempo" name="tiempo" placeholder="Ej: 30 min" />
            </div>
            <div class="form-group">
              <label for="modalRecetaIngredientes">Ingredientes</label><br>
              <textarea id="modalRecetaIngredientes" name="ingredientes" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label for="modalRecetaPasos">Paso a paso</label><br>
              <textarea id="modalRecetaPasos" name="pasos" rows="5" required></textarea>
            </div>
            <div class="form-group">
              <label for="modalRecetaNotas">Notas</label><br>
              <textarea id="modalRecetaNotas" name="notas" rows="3"></textarea>
            </div>
            
            <!-- Información Nutricional -->
            <div class="form-group">
              <h4 style="margin: 20px 0 10px 0; color: #f28f3b; border-bottom: 1px solid #f28f3b; padding-bottom: 5px;">Información Nutricional</h4>
            </div>
            
            <div class="form-group">
              <label for="modalRecetaCalorias">Calorías</label><br>
              <input type="number" id="modalRecetaCalorias" name="calorias" placeholder="Ej: 250" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaProteinas">Proteínas (g)</label><br>
              <input type="number" id="modalRecetaProteinas" name="proteinas" placeholder="Ej: 25" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaCarbohidratos">Carbohidratos (g)</label><br>
              <input type="number" id="modalRecetaCarbohidratos" name="carbohidratos" placeholder="Ej: 30" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaGrasas">Grasas (g)</label><br>
              <input type="number" id="modalRecetaGrasas" name="grasas" placeholder="Ej: 15" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaFibra">Fibra (g)</label><br>
              <input type="number" id="modalRecetaFibra" name="fibra" placeholder="Ej: 5" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaAzucar">Azúcar (g)</label><br>
              <input type="number" id="modalRecetaAzucar" name="azucar" placeholder="Ej: 10" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaSodio">Sodio (mg)</label><br>
              <input type="number" id="modalRecetaSodio" name="sodio" placeholder="Ej: 500" step="0.1" min="0" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaPorciones">Porciones</label><br>
              <input type="number" id="modalRecetaPorciones" name="porciones" placeholder="Ej: 4" min="1" />
            </div>
            
            <div class="form-group">
              <label for="modalRecetaPublico">Publico</label><br>
              <label class="md-checkbox">
                <input type="checkbox" id="modalRecetaPublico" name="publico" />
                <span>Visible en el sitio</span>
              </label>
            </div>
            `,
            {
              onSubmit: async (data) => {
                await updateRecipeInDatabase(data.id, mapRecipePayload(data));
              },
              onChange: reloadContentFromDatabase,
            },
            r
          );
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "btn-table btn-delete";
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("Eliminar receta?")) return;
          try {
            await deleteRecipeInDatabase(r.id);
            await reloadContentFromDatabase();
          } catch (error) {
            alert(error.message || "No se pudo eliminar la receta");
          }
        });

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);
        tablaRecetasBody.appendChild(tr);
      });
    }

    if (btnNuevaReceta) {
      btnNuevaReceta.addEventListener("click", () => {
        openModal(
          "Nueva receta",
          `
          <div class="form-group">
            <label for="modalRecetaImagen">Imagen</label><br>
            <input type="file" id="modalRecetaImagen" accept="image/*" data-store="imagenes" multiple />
            <input type="hidden" name="imagenes" />
            <img data-preview="imagenes" class="md-thumb md-thumb--preview" style="display:none" />
          </div>
          <div class="form-group">
            <label for="modalRecetaTitulo">Titulo</label><br>
            <input type="text" id="modalRecetaTitulo" name="titulo" required />
          </div>
          <div class="form-group">
            <label for="modalRecetaTiempo">Tiempo</label><br>
            <input type="text" id="modalRecetaTiempo" name="tiempo" placeholder="Ej: 30 min" />
          </div>
          <div class="form-group">
            <label for="modalRecetaIngredientes">Ingredientes</label><br>
            <textarea id="modalRecetaIngredientes" name="ingredientes" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label for="modalRecetaPasos">Paso a paso</label><br>
            <textarea id="modalRecetaPasos" name="pasos" rows="5" required></textarea>
          </div>
          <div class="form-group">
            <label for="modalRecetaNotas">Notas</label><br>
            <textarea id="modalRecetaNotas" name="notas" rows="3"></textarea>
          </div>
          
          <!-- Información Nutricional -->
          <div class="form-group">
            <h4 style="margin: 20px 0 10px 0; color: #f28f3b; border-bottom: 1px solid #f28f3b; padding-bottom: 5px;">Información Nutricional</h4>
          </div>
          
          <div class="form-group">
            <label for="modalRecetaCalorias">Calorías</label><br>
            <input type="number" id="modalRecetaCalorias" name="calorias" placeholder="Ej: 250" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaProteinas">Proteínas (g)</label><br>
            <input type="number" id="modalRecetaProteinas" name="proteinas" placeholder="Ej: 25" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaCarbohidratos">Carbohidratos (g)</label><br>
            <input type="number" id="modalRecetaCarbohidratos" name="carbohidratos" placeholder="Ej: 30" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaGrasas">Grasas (g)</label><br>
            <input type="number" id="modalRecetaGrasas" name="grasas" placeholder="Ej: 15" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaFibra">Fibra (g)</label><br>
            <input type="number" id="modalRecetaFibra" name="fibra" placeholder="Ej: 5" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaAzucar">Azúcar (g)</label><br>
            <input type="number" id="modalRecetaAzucar" name="azucar" placeholder="Ej: 10" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaSodio">Sodio (mg)</label><br>
            <input type="number" id="modalRecetaSodio" name="sodio" placeholder="Ej: 500" step="0.1" min="0" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaPorciones">Porciones</label><br>
            <input type="number" id="modalRecetaPorciones" name="porciones" placeholder="Ej: 4" min="1" />
          </div>
          
          <div class="form-group">
            <label for="modalRecetaPublico">Publico</label><br>
            <label class="md-checkbox">
              <input type="checkbox" id="modalRecetaPublico" name="publico" checked />
              <span>Visible en el sitio</span>
            </label>
          </div>
          `,
          {
            onSubmit: async (data) => {
              await createRecipeInDatabase(mapRecipePayload(data));
            },
            onChange: reloadContentFromDatabase,
          },
          null
        );
      });
    }

    function resetVideoForm() {
      if (videoId) videoId.value = "";
      if (videoTitulo) videoTitulo.value = "";
      if (videoUrl) videoUrl.value = "";
      if (videoDescripcion) videoDescripcion.value = "";
      if (videoPublico) videoPublico.checked = false;
    }

    function renderVideos() {
      renderTable(
        tablaVideosBody,
        videos,
        ["titulo", "url", "descripcion", "publico"],
        (item) => {
          if (videoId) videoId.value = item.id;
          if (videoTitulo) videoTitulo.value = item.titulo;
          if (videoUrl) videoUrl.value = item.url;
          if (videoDescripcion) videoDescripcion.value = item.descripcion || "";
          if (videoPublico) videoPublico.checked = !!item.publico;
        },
        async (item) => {
          if (!confirm("Eliminar video?")) return;
          try {
            await deleteVideoInDatabase(item.id);
            await reloadContentFromDatabase();
          } catch (error) {
            alert(error.message || "No se pudo eliminar el video");
          }
        }
      );
    }

    if (formVideos) {
      formVideos.addEventListener("submit", async function (e) {
        e.preventDefault();
        const id = videoId ? String(videoId.value || "") : "";
        const data = {
          titulo: videoTitulo ? videoTitulo.value.trim() : "",
          url: videoUrl ? videoUrl.value.trim() : "",
          descripcion: videoDescripcion ? videoDescripcion.value.trim() : "",
          publico: !!(videoPublico && videoPublico.checked),
        };

        try {
          if (id) {
            await updateVideoInDatabase(id, mapVideoPayload(data));
          } else {
            await createVideoInDatabase(mapVideoPayload(data));
          }
          await reloadContentFromDatabase();
          resetVideoForm();
        } catch (error) {
          alert(error.message || "No se pudo guardar el video");
        }
      });
    }

    if (videoCancelar) {
      videoCancelar.addEventListener("click", function () {
        resetVideoForm();
      });
    }

    renderLibros();
    renderRecetas();
    renderVideos();
    renderSugerencias();
    renderContactos();
    updateNotifications();
    updateKpis();

    // --- Usuarios ---
    let usuarios = loadItems("admin_usuarios");
    const formUsuarios = document.getElementById("formUsuarios");
    const tablaUsuariosBody = document.querySelector("#tablaUsuarios tbody");
    const usuarioId = document.getElementById("usuarioId");
    const usuarioNombre = document.getElementById("usuarioNombre");
    const usuarioEmail = document.getElementById("usuarioEmail");
    const usuarioRole = document.getElementById("usuarioRole");
    const usuarioRecibeCorreos = document.getElementById("usuarioRecibeCorreos");
    const usuarioCancelar = document.getElementById("usuarioCancelar");
    const usuarioSubmitBtn = formUsuarios ? formUsuarios.querySelector('button[type="submit"]') : null;

    async function reloadUsersFromDatabase() {
      await syncAdminDataFromDatabase();
      usuarios = loadItems("admin_usuarios");
      renderUsuarios();
      updateKpis();
    }

    async function createUserInDatabase(payload) {
      return adminRequest(`${API_ADMIN_URL}/users`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    async function updateUserInDatabase(id, payload) {
      return adminRequest(`${API_ADMIN_URL}/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    async function deleteUserInDatabase(id) {
      return adminRequest(`${API_ADMIN_URL}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }

    function resetUsuarioForm() {
      if (usuarioId) usuarioId.value = "";
      if (usuarioNombre) usuarioNombre.value = "";
      if (usuarioEmail) usuarioEmail.value = "";
      if (usuarioRole) usuarioRole.value = "user";
      if (usuarioRecibeCorreos) usuarioRecibeCorreos.checked = false;
      if (usuarioSubmitBtn) usuarioSubmitBtn.textContent = "Guardar";
    }

    function renderUsuarios() {
      if (!tablaUsuariosBody) return;
      tablaUsuariosBody.innerHTML = "";

      usuarios.forEach((u) => {
        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.textContent = u.nombre || "";
        tr.appendChild(tdNombre);

        const tdEmail = document.createElement("td");
        tdEmail.textContent = u.email || "";
        tr.appendChild(tdEmail);

        const tdRole = document.createElement("td");
        tdRole.textContent = u.role || "user";
        tr.appendChild(tdRole);

        const tdRecibe = document.createElement("td");
        tdRecibe.textContent = u.recibeCorreos ? "Si" : "No";
        tr.appendChild(tdRecibe);

        const actionsTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "btn-table btn-edit";
        editBtn.addEventListener("click", () => {
          if (usuarioId) usuarioId.value = u.id || "";
          if (usuarioNombre) usuarioNombre.value = u.nombre || "";
          if (usuarioEmail) usuarioEmail.value = u.email || "";
          if (usuarioRole) usuarioRole.value = u.role || "user";
          if (usuarioRecibeCorreos) usuarioRecibeCorreos.checked = !!u.recibeCorreos;
          if (usuarioSubmitBtn) usuarioSubmitBtn.textContent = "Actualizar";
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "btn-table btn-delete";
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("Eliminar usuario?")) return;
          try {
            await deleteUserInDatabase(u.id);
            await reloadUsersFromDatabase();
          } catch (error) {
            alert(error.message || "No se pudo eliminar el usuario");
          }
        });

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        tablaUsuariosBody.appendChild(tr);
      });
    }

    if (formUsuarios) {
      formUsuarios.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = usuarioId ? String(usuarioId.value || "").trim() : "";
        const nombre = (usuarioNombre ? usuarioNombre.value : "").trim();
        const email = (usuarioEmail ? usuarioEmail.value : "").trim().toLowerCase();
        const role = (usuarioRole ? usuarioRole.value : "user").trim() === "admin" ? "admin" : "user";
        const recibeCorreos = !!(usuarioRecibeCorreos && usuarioRecibeCorreos.checked);

        if (!nombre || !email) return;

        const emailExists = usuarios.some(
          (x) => (x.email || "").toLowerCase() === email && String(x.id) !== id
        );
        if (emailExists) {
          alert("Ya existe un usuario con ese correo");
          return;
        }

        try {
          if (usuarioSubmitBtn) usuarioSubmitBtn.disabled = true;

          if (id) {
            await updateUserInDatabase(id, {
              name: nombre,
              email,
              role,
              receiveEmails: recibeCorreos,
            });
          } else {
            const created = await createUserInDatabase({
              name: nombre,
              email,
              role,
              receiveEmails: recibeCorreos,
            });
            if (created && created.temporaryPassword) {
              alert(`Usuario creado. Contrasena temporal: ${created.temporaryPassword}`);
            }
          }

          await reloadUsersFromDatabase();
          resetUsuarioForm();
        } catch (error) {
          alert(error.message || "No se pudo guardar el usuario");
        } finally {
          if (usuarioSubmitBtn) usuarioSubmitBtn.disabled = false;
        }
      });
    }

    if (usuarioCancelar) {
      usuarioCancelar.addEventListener("click", function () {
        resetUsuarioForm();
      });
    }

    renderUsuarios();
    setInterval(() => {
      reloadContentFromDatabase().catch((error) => {
        console.error("No se pudieron actualizar notificaciones", error);
      });
    }, 30000);
// --- Correos (envio masivo real) ---
    const formCorreos = document.getElementById("formCorreos");
    const correoAsunto = document.getElementById("correoAsunto");
    const correoMensaje = document.getElementById("correoMensaje");
    const correoFeedback = document.getElementById("correoFeedback");

    if (formCorreos) {
      formCorreos.addEventListener("submit", async function (e) {
        e.preventDefault();
        const asunto = correoAsunto ? correoAsunto.value.trim() : "";
        const mensaje = correoMensaje ? correoMensaje.value.trim() : "";

        if (!asunto || !mensaje) return;

        const submitButton = formCorreos.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
          const result = await adminRequest(`${API_ADMIN_URL}/emails/notify`, {
            method: "POST",
            body: JSON.stringify({
              subject: asunto,
              message: mensaje,
            }),
          });

          if (correoFeedback) {
            correoFeedback.style.display = "block";
            correoFeedback.style.color = "#166534";
            correoFeedback.textContent = `Enviados: ${result.sent || 0} | Fallidos: ${result.failed || 0} | Total: ${result.total || 0}`;
          }

          if (correoMensaje) correoMensaje.value = "";
        } catch (error) {
          if (correoFeedback) {
            correoFeedback.style.display = "block";
            correoFeedback.style.color = "#b42318";
            correoFeedback.textContent = error.message || "No se pudieron enviar los correos";
          }
        } finally {
          if (submitButton) submitButton.disabled = false;
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (isDashboard()) {
      initDashboard();
    } else if (isLogin()) {
      initLogin();
    }
  });
})();






