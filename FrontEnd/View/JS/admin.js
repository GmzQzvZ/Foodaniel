// URL base de la API
const API_URL = 'http://localhost:3000/api/auth';

// Función para hacer peticiones autenticadas
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token inválido o expirado
    localStorage.removeItem('auth_token');
    redirectToLogin();
    throw new Error('Sesión expirada');
  }

  return response;
}

// Función de login
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar el token en localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.error || 'Error en la autenticación');
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

// Función para verificar autenticación
async function checkAuth() {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    const response = await fetchWithAuth(`${API_URL}/check-auth`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Función de logout
async function logout() {
  try {
    await fetchWithAuth(`${API_URL}/logout`, { method: 'POST' });
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    redirectToLogin();
  }
}

// Modificar initLogin para usar la nueva función
async function initLogin() {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  // Verificar si ya está autenticado
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    redirectToDashboard();
    return;
  }

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;
    const errorElement = document.getElementById("loginError");

    try {
      const data = await login(email, password);
      redirectToDashboard();
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';
    }
  });
}

// Modificar la función isLogged
async function isLogged() {
  return await checkAuth();
}