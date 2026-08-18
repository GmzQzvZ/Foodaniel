const configuredApiBase =
  typeof window !== 'undefined' && typeof window.__API_BASE_URL === 'string'
    ? window.__API_BASE_URL.trim()
    : '';

const baseOrigin =
  configuredApiBase ||
  (window.location.protocol === 'file:' || window.location.origin === 'null'
    ? 'http://localhost:3000'
    : window.location.origin);
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
    window.location.href = '/dashboard';
  });
}

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameInput = document.getElementById('registerName');
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const message = document.getElementById('registerMessage');
  const submitBtn = document.getElementById('registerSubmitBtn') || form.querySelector('button[type="submit"]');

  const btnOpenPrivacy = document.getElementById('btnOpenPrivacy');
  const acceptPrivacy = document.getElementById('acceptPrivacy');
  const privacyStatus = document.getElementById('privacyStatus');
  const privacyModal = document.getElementById('privacyModal');
  const btnClosePrivacyModal = document.getElementById('btnClosePrivacyModal');
  const btnAcceptPrivacyModal = document.getElementById('btnAcceptPrivacyModal');

  function updatePrivacyState() {
    const isRead = sessionStorage.getItem('privacy_policy_read') === 'true';

    if (isRead) {
      if (acceptPrivacy) {
        acceptPrivacy.disabled = false;
        acceptPrivacy.checked = true;
      }
      if (privacyStatus) {
        privacyStatus.textContent = '✅ Política de privacidad leída y aceptada.';
        privacyStatus.style.color = '#166534';
      }
      if (submitBtn) {
        submitBtn.disabled = !(acceptPrivacy ? acceptPrivacy.checked : true);
      }
    } else {
      if (acceptPrivacy) {
        acceptPrivacy.disabled = true;
        acceptPrivacy.checked = false;
      }
      if (privacyStatus) {
        privacyStatus.textContent = '⚠️ Debes abrir la Política de Privacidad para poder registrarte.';
        privacyStatus.style.color = '#c92a2a';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
      }
    }
  }

  // Verificar estado inicial
  updatePrivacyState();

  if (btnOpenPrivacy && privacyModal) {
    btnOpenPrivacy.addEventListener('click', () => {
      privacyModal.style.display = 'flex';
      sessionStorage.setItem('privacy_policy_read', 'true');
      updatePrivacyState();
    });
  }

  if (btnClosePrivacyModal && privacyModal) {
    btnClosePrivacyModal.addEventListener('click', () => {
      privacyModal.style.display = 'none';
    });
  }

  if (btnAcceptPrivacyModal && privacyModal) {
    btnAcceptPrivacyModal.addEventListener('click', () => {
      sessionStorage.setItem('privacy_policy_read', 'true');
      updatePrivacyState();
      privacyModal.style.display = 'none';
    });
  }

  if (acceptPrivacy) {
    acceptPrivacy.addEventListener('change', () => {
      const isRead = sessionStorage.getItem('privacy_policy_read') === 'true';
      if (!isRead) {
        acceptPrivacy.checked = false;
        alert('Debes abrir la Política de Privacidad primero.');
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = !acceptPrivacy.checked;
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isRead = sessionStorage.getItem('privacy_policy_read') === 'true';
    if (!isRead || (acceptPrivacy && !acceptPrivacy.checked)) {
      showFormMessage(message, 'Debes abrir y aceptar la Política de Privacidad para registrarte.');
      return;
    }

    showFormMessage(message, '');
    message.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    let result;
    try {
      result = await postJson(`${API_URL}/register`, {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      });
    } catch (_) {
      showFormMessage(message, 'No se pudo conectar con el servidor');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const { response, data } = result;

    if (!response.ok) {
      showFormMessage(message, data?.error || 'No se pudo completar el registro');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    saveSession(data);
    showFormMessage(message, 'Registro exitoso. Redirigiendo...', false);
    setTimeout(() => {
      window.location.href = '/dashboard';
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
    // Hacer requeridos los campos de password en modo reset
    if (passwordInput) passwordInput.required = true;
    if (confirmInput) confirmInput.required = true;
    if (emailInput) emailInput.required = false;
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
    // Hacer no requeridos los campos de password en modo recuperación
    if (passwordInput) passwordInput.required = false;
    if (confirmInput) confirmInput.required = false;
    if (emailInput) emailInput.required = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Debug - Formulario de recuperación enviado');
    showFormMessage(message, '');
    message.style.display = 'none';

    if (isResetMode) {
      console.log('Debug - Modo reset activado, token:', token);
      const newPassword = (passwordInput?.value || '').trim();
      const confirmPassword = (confirmInput?.value || '').trim();

      console.log('Debug - Passwords:', { 
        newPassword: newPassword ? '✓' : '✗', 
        confirmPassword: confirmPassword ? '✓' : '✗',
        length: newPassword.length 
      });

      if (newPassword.length < 8) {
        console.log('Debug - Password demasiado corto');
        showFormMessage(message, 'La contrasena debe tener al menos 8 caracteres');
        return;
      }

      if (newPassword !== confirmPassword) {
        console.log('Debug - Passwords no coinciden');
        showFormMessage(message, 'Las contrasenas no coinciden');
        return;
      }

      console.log('Debug - Enviando petición de reset password');
      let result;
      try {
        result = await postJson(`${API_URL}/reset-password`, {
          token,
          password: newPassword
        });
        console.log('Debug - Respuesta reset password:', result);
      } catch (_) {
        console.log('Debug - Error de conexión en reset password');
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
        window.location.href = '/login';
      }, 1200);
      return;
    }

    const email = (emailInput?.value || '').trim();
    if (!email) {
      showFormMessage(message, 'Ingresa un correo valido');
      return;
    }

    console.log('Debug - Enviando petición a forgot-password con email:', email);
    let result;
    try {
      result = await postJson(`${API_URL}/forgot-password`, {
        email
      });
      console.log('Debug - Respuesta recibida:', result);
    } catch (_) {
      console.log('Debug - Error de conexión');
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
