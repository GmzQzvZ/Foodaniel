const configuredApiBase =
  typeof window !== 'undefined' && typeof window.__API_BASE_URL === 'string'
    ? window.__API_BASE_URL.trim()
    : '';

const baseOrigin = configuredApiBase || 'http://localhost:3000';
const API_URL = `${baseOrigin.replace(/\/+$/, '')}/api/auth`;

function showFormMessage(element, message, isError = true) {
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  element.style.color = isError ? '#b42318' : '#166534';
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return { response, data };
}

function saveSession(data) {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const message = document.getElementById('loginMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFormMessage(message, '');
    message.style.display = 'none';

    let result;
    try {
      result = await postJson(`${API_URL}/login`, {
        email: emailInput.value,
        password: passwordInput.value
      });
    } catch (_) {
      showFormMessage(message, 'No se pudo conectar con el servidor');
      return;
    }

    const { response, data } = result;

    if (!response.ok) {
      showFormMessage(message, data?.error || 'No se pudo iniciar sesin');
      return;
    }

    saveSession(data);
    window.location.href = '/FrontEnd/View/dashborard.html';
  });
}

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameInput = document.getElementById('registerName');
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const message = document.getElementById('registerMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFormMessage(message, '');
    message.style.display = 'none';

    let result;
    try {
      result = await postJson(`${API_URL}/register`, {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      });
    } catch (_) {
      showFormMessage(message, 'No se pudo conectar con el servidor');
      return;
    }

    const { response, data } = result;

    if (!response.ok) {
      showFormMessage(message, data?.error || 'No se pudo completar el registro');
      return;
    }

    saveSession(data);
    showFormMessage(message, 'Registro exitoso. Redirigiendo...', false);
    setTimeout(() => {
      window.location.href = '/FrontEnd/View/dashborard.html';
    }, 600);
  });
}

function getQueryParam(name) {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  } catch (_) {
    return null;
  }
}

function initRecoveryForm() {
  const form = document.getElementById('recoveryForm');
  if (!form) return;

  const title = document.getElementById('recoveryTitle');
  const subtitle = document.getElementById('recoverySubtitle');
  const emailGroup = document.getElementById('recoveryEmailGroup');
  const passwordGroup = document.getElementById('recoveryPasswordGroup');
  const confirmGroup = document.getElementById('recoveryConfirmGroup');
  const emailInput = document.getElementById('recoveryEmail');
  const passwordInput = document.getElementById('recoveryPassword');
  const confirmInput = document.getElementById('recoveryPasswordConfirm');
  const submitBtn = document.getElementById('recoverySubmit');
  const message = document.getElementById('recoveryMessage');
  const altText = document.getElementById('recoveryAltText');
  const altLink = document.getElementById('recoveryAltLink');

  const token = (getQueryParam('token') || '').trim();
  const isResetMode = Boolean(token);

  if (isResetMode) {
    if (title) title.textContent = 'Nueva contrasena';
    if (subtitle) subtitle.textContent = 'Escribe y confirma tu nueva contrasena.';
    if (emailGroup) emailGroup.style.display = 'none';
    if (passwordGroup) passwordGroup.style.display = '';
    if (confirmGroup) confirmGroup.style.display = '';
    if (submitBtn) submitBtn.textContent = 'Actualizar contrasena';
    if (altText) altText.textContent = 'Volver a inicio de sesion?';
    if (altLink) {
      altLink.textContent = 'Iniciar sesion';
      altLink.href = 'Login.html';
    }
  } else {
    if (title) title.textContent = 'Recuperar contrasena';
    if (subtitle) subtitle.textContent = 'Ingresa tu correo para enviarte un enlace.';
    if (emailGroup) emailGroup.style.display = '';
    if (passwordGroup) passwordGroup.style.display = 'none';
    if (confirmGroup) confirmGroup.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Enviar enlace';
    if (altText) altText.textContent = 'Recordaste tu contrasena?';
    if (altLink) {
      altLink.textContent = 'Iniciar sesion';
      altLink.href = 'Login.html';
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFormMessage(message, '');
    message.style.display = 'none';

    if (isResetMode) {
      const newPassword = (passwordInput?.value || '').trim();
      const confirmPassword = (confirmInput?.value || '').trim();

      if (newPassword.length < 8) {
        showFormMessage(message, 'La contrasena debe tener al menos 8 caracteres');
        return;
      }

      if (newPassword !== confirmPassword) {
        showFormMessage(message, 'Las contrasenas no coinciden');
        return;
      }

      let result;
      try {
        result = await postJson(`${API_URL}/reset-password`, {
          token,
          password: newPassword
        });
      } catch (_) {
        showFormMessage(message, 'No se pudo conectar con el servidor');
        return;
      }

      const { response, data } = result;

      if (!response.ok) {
        showFormMessage(message, data?.error || 'No se pudo actualizar la contrasena');
        return;
      }

      showFormMessage(message, 'Contrasena actualizada. Redirigiendo al login...', false);
      setTimeout(() => {
        window.location.href = '/FrontEnd/View/Login.html';
      }, 1200);
      return;
    }

    const email = (emailInput?.value || '').trim();
    if (!email) {
      showFormMessage(message, 'Ingresa un correo valido');
      return;
    }

    let result;
    try {
      result = await postJson(`${API_URL}/forgot-password`, {
        email
      });
    } catch (_) {
      showFormMessage(message, 'No se pudo conectar con el servidor');
      return;
    }

    const { response, data } = result;

    if (!response.ok) {
      showFormMessage(message, data?.error || 'No se pudo enviar el enlace');
      return;
    }

    showFormMessage(message, 'Si el correo existe, te enviamos un enlace de recuperacion.', false);
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initRecoveryForm();
});
