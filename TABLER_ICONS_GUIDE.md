# 🎨 Tabler Icons - Guía de Implementación

## ✅ Ya Instalado

El CDN de Tabler Icons está configurado en:
- ✅ `dashborard.html` (con logout button actualizado)
- ✅ `index.html`
- ✅ `Login.html`
- ✅ `registro.html`
- ✅ `recovery.html`
- ✅ `Recetas.html`
- ✅ `videos.html`
- ✅ `libros.html`
- ✅ `receta.html`
- ✅ `About.html`
- ✅ `Contacto.html`

---

## 🚀 Cómo Usar Tabler Icons

### **Opción 1: SVG Inline (Recomendado)**

Copia el SVG directo en tu HTML:

```html
<button class="btn-logout">
    <svg class="icon icon-tabler icon-tabler-logout" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
        <path d="M9 12h12m-2 -3l3 3l-3 3" />
    </svg>
    Salir
</button>
```

**Ventajas:**
- No hace petición extra
- Puedes personalizar con CSS (color, tamaño, rotación)
- Mejor performance

---

### **Opción 2: CDN con atributo `data-icon`**

Si agregaste el CSS del CDN:

```html
<i class="tabler-icon tabler-icon-logout"></i>
```

---

## 📚 Iconos Comunes para tu Plataforma

| Funcionalidad | Icono | Clase |
|---------------|-------|-------|
| **Cerrar Sesión** | 🚪 | `icon-tabler-logout` |
| **Usuarios/Perfil** | 👤 | `icon-tabler-user` |
| **Recetas** | 🍳 | `icon-tabler-utensils` |
| **Libros** | 📖 | `icon-tabler-book` |
| **Videos** | ▶️ | `icon-tabler-player-play` |
| **Editar** | ✏️ | `icon-tabler-edit` |
| **Eliminar** | 🗑️ | `icon-tabler-trash` |
| **Guardar** | 💾 | `icon-tabler-device-floppy` |
| **Búsqueda** | 🔍 | `icon-tabler-search` |
| **Home** | 🏠 | `icon-tabler-home` |
| **Menú** | ☰ | `icon-tabler-menu-2` |
| **Cerrar** | ✕ | `icon-tabler-x` |
| **Compartir** | 📤 | `icon-tabler-share` |
| **Favorito** | ⭐ | `icon-tabler-star` |
| **Corazón/Like** | ❤️ | `icon-tabler-heart` |
| **Descarga** | ⬇️ | `icon-tabler-download` |
| **Configuración** | ⚙️ | `icon-tabler-settings` |
| **Notificaciones** | 🔔 | `icon-tabler-bell` |
| **Email** | 📧 | `icon-tabler-mail` |
| **Teléfono** | ☎️ | `icon-tabler-phone` |

---

## 🎨 Ejemplo de Uso en Botones

```html
<!-- Botón de Favorito -->
<button class="btn-favorite">
    <svg class="icon icon-tabler icon-tabler-heart" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -7.428a5 5 0 1 1 7.5 7.428" />
    </svg>
    Agregar a favoritos
</button>
```

---

## 🎯 Personalización CSS

### **Cambiar Color**

```css
.icon {
    color: #f28f3b; /* Color naranja */
}

.btn-logout .icon {
    color: white;
}
```

### **Cambiar Tamaño**

```css
.icon {
    width: 24px;
    height: 24px;
}

.icon-small {
    width: 16px;
    height: 16px;
}

.icon-large {
    width: 32px;
    height: 32px;
}
```

### **Efectos Hover**

```css
.btn:hover .icon {
    transform: scale(1.2);
    transition: transform 0.2s ease;
}
```

---

## 🔗 Más Iconos Disponibles

Ve a **https://tabler.io/icons** para explorar +5000 iconos disponibles.

Para cada icono, copia el SVG y úsalo como se muestra arriba.

---

## ✨ Ejemplo Completo: Tarjeta de Receta

```html
<div class="recipe-card">
    <img src="receta.jpg" alt="Título" />
    <div class="recipe-card__body">
        <h2>Título de Receta</h2>
        <p>Descripción...</p>
        <div class="recipe-actions">
            <button class="btn btn-icon">
                <svg class="icon icon-tabler icon-tabler-heart" ...>...</svg>
            </button>
            <button class="btn btn-icon">
                <svg class="icon icon-tabler icon-tabler-share" ...>...</svg>
            </button>
            <button class="btn btn-primary">
                <svg class="icon icon-tabler icon-tabler-book-open" ...>...</svg>
                Ver Receta
            </button>
        </div>
    </div>
</div>
```

---

## 🚀 Tips Finales

1. **Reutiliza** componentes con iconos
2. **Mantén** tamaños consistentes (16px, 20px, 24px)
3. **Usa** colores que contrasten bien
4. **Agrega** `stroke-linecap="round"` y `stroke-linejoin="round"` para un look moderno
5. **Prueba** hover effects para mejor UX

---

¡Listo! Ahora tienes Tabler Icons funcionando en tu plataforma. 🎉
