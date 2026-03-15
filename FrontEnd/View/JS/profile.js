const profileBaseOrigin =
  window.location.protocol === 'file:' || window.location.origin === 'null'
    ? 'http://localhost:3000'
    : window.location.origin;
const PROFILE_API_URL = `${profileBaseOrigin}/api/auth/profile`;
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function showProfileMessage(message, isError = true) {
  const el = document.getElementById('profileUpdateMessage');
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  el.style.color = isError ? '#b42318' : '#166534';
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function applyAvatarToDashboard(src) {
  const avatarEl = document.getElementById('dashboardAvatar');
  if (!avatarEl) return;
  if (!src) return (avatarEl.src = '/default-profile.png');
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    avatarEl.src = src;
    return;
  }
  avatarEl.src = src.startsWith('/') ? src : `/${src}`;
}

function applyUserToDashboard(user) {
  const nameEl = document.getElementById('dashboardUserName');
  const emailEl = document.getElementById('dashboardUserEmail');
  if (nameEl) nameEl.textContent = user.name || 'Usuario';
  if (emailEl) emailEl.textContent = user.email || 'Sin correo';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

function loadExtraProfileFields() {
  try {
    const extrasRaw = localStorage.getItem('user_profile_extras');
    if (!extrasRaw) return;
    const extras = JSON.parse(extrasRaw);

    const pairs = [
      ['perfil-apellido', extras.apellido || ''],
      ['perfil-username', extras.username || ''],
      ['perfil-bio', extras.bio || ''],
      ['perfil-preferencias', extras.preferencias || 'ninguna'],
      ['perfil-notificaciones', extras.notificaciones !== false]
    ];

    for (const [id, value] of pairs) {
      const input = document.getElementById(id);
      if (!input) continue;
      if (input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else {
        input.value = value;
      }
    }
  } catch (_) {
    // Ignore malformed local data.
  }
}

function syncReceiveEmailsFromSession() {
  const checkbox = document.getElementById('perfil-notificaciones');
  if (!checkbox) return;
  const user = readStoredUser();
  if (user && user.receiveEmails !== undefined) {
    checkbox.checked = Boolean(user.receiveEmails);
  }
}

function saveExtraProfileFields() {
  const apellido = document.getElementById('perfil-apellido')?.value || '';
  const username = document.getElementById('perfil-username')?.value || '';
  const bio = document.getElementById('perfil-bio')?.value || '';
  const preferencias = document.getElementById('perfil-preferencias')?.value || 'ninguna';
  const notificaciones = Boolean(document.getElementById('perfil-notificaciones')?.checked);

  localStorage.setItem(
    'user_profile_extras',
    JSON.stringify({ apellido, username, bio, preferencias, notificaciones })
  );
}

async function updateProfile(payload, token) {
  const response = await fetch(PROFILE_API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
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

function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  loadExtraProfileFields();
  syncReceiveEmailsFromSession();
  const currentAvatar = readStoredUser().profileImageUrl || localStorage.getItem('user_profile_avatar');
  applyAvatarToDashboard(currentAvatar);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) {
      showProfileMessage('Sesion no valida. Inicia sesion nuevamente.');
      window.location.href = '/FrontEnd/View/Login.html';
      return;
    }

    const name = (document.getElementById('perfil-nombre')?.value || '').trim();
    const email = (document.getElementById('perfil-email')?.value || '').trim().toLowerCase();
    const password = document.getElementById('perfil-password')?.value || '';
    const confirmPassword = document.getElementById('perfil-confirm-password')?.value || '';
    const receiveEmails = Boolean(document.getElementById('perfil-notificaciones')?.checked);
    const photoInput = document.getElementById('perfil-foto');
    const selectedPhoto = photoInput?.files && photoInput.files.length ? photoInput.files[0] : null;

    if (!name || name.length < 2) {
      showProfileMessage('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showProfileMessage('Correo electronico invalido.');
      return;
    }

    if (password || confirmPassword) {
      if (password.length < 8) {
        showProfileMessage('La nueva contrasena debe tener al menos 8 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        showProfileMessage('Las contrasenas no coinciden.');
        return;
      }
    }

    let newAvatarDataUrl = null;
    if (selectedPhoto) {
      if (!ALLOWED_AVATAR_TYPES.has(selectedPhoto.type)) {
        showProfileMessage('La imagen debe ser PNG, JPG o WEBP.');
        return;
      }
      if (selectedPhoto.size > MAX_AVATAR_SIZE_BYTES) {
        showProfileMessage('La imagen no puede superar 2MB.');
        return;
      }
      try {
        newAvatarDataUrl = await fileToDataUrl(selectedPhoto);
      } catch (_) {
        showProfileMessage('No se pudo leer la imagen seleccionada.');
        return;
      }
    }

    const payload = { name, email };
    if (password) payload.password = password;
    if (newAvatarDataUrl) payload.profileImageDataUrl = newAvatarDataUrl;
    payload.receiveEmails = receiveEmails;

    const { response, data } = await updateProfile(payload, token);
    if (!response.ok) {
      showProfileMessage(data?.error || 'No se pudo actualizar el perfil.');
      return;
    }

    const storedUser = readStoredUser();
    const mergedUser = { ...storedUser, ...(data?.user || {}), name, email };
    localStorage.setItem('user', JSON.stringify(mergedUser));
    if (mergedUser.profileImageUrl) {
      localStorage.removeItem('user_profile_avatar');
    }
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }

    saveExtraProfileFields();
    applyUserToDashboard(mergedUser);
    applyAvatarToDashboard(mergedUser.profileImageUrl || localStorage.getItem('user_profile_avatar'));

    const passwordInput = document.getElementById('perfil-password');
    const confirmPasswordInput = document.getElementById('perfil-confirm-password');
    if (passwordInput) passwordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    if (photoInput) photoInput.value = '';

    showProfileMessage('Perfil actualizado correctamente.', false);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initProfileForm();
});
