window.FoodaniellI18n = (function () {
  const STORAGE_KEY = 'foodaniell_lang';
  const DEFAULT_LANG = 'es';
  const SUPPORTED = ['es', 'en'];

  const texts = {
    es: {
      // Header / Nav
      nav_home: 'Inicio',
      nav_about: 'Acerca de',
      nav_contact: 'Contacto',
      nav_login: 'Login',
      nav_register: 'Register',
      nav_content: 'Contenido',
      nav_recipes: 'Recetas',
      nav_books: 'Libros',
      nav_videos: 'Videos',

      // Auth
      login_title: 'Iniciar Sesión',
      login_subtitle: 'Bienvenido de nuevo',
      login_email: 'Correo',
      login_password: 'Contraseña',
      login_button: 'Ingresar',
      login_forgot: '¿Olvidaste tu contraseña?',
      login_no_account: '¿No tienes cuenta?',
      login_register_here: 'Regístrate aquí',

      register_title: 'Crear Cuenta',
      register_subtitle: 'Únete a la familia culinaria',
      register_name: 'Nombre completo',
      register_email: 'Correo',
      register_password: 'Contraseña',
      register_button: 'Registrarse',
      register_has_account: '¿Ya tienes cuenta?',
      register_login_here: 'Inicia sesión',

      recovery_title: 'Recuperar Contraseña',
      recovery_subtitle: 'Ingresa tu correo para enviarte un enlace',
      recovery_send: 'Enviar enlace',
      recovery_back_to_login: 'Volver a inicio de sesión?',

      // Dashboard
      dashboard_title: 'Panel',
      dashboard_kpi_recipes: 'Recetas',
      dashboard_kpi_books: 'Libros',
      dashboard_kpi_videos: 'Videos',
      dashboard_kpi_users: 'Usuarios',
      dashboard_create_recipe: 'Crear Receta',
      dashboard_create_book: 'Crear Libro',
      dashboard_create_video: 'Crear Video',
      dashboard_manage_users: 'Gestionar Usuarios',
      dashboard_task_title: 'Tareas',
      dashboard_task_placeholder: 'Nueva tarea',
      dashboard_task_add: 'Agregar',

      // Forms
      form_title: 'Título',
      form_description: 'Descripción',
      form_price: 'Precio',
      form_link: 'Enlace',
      form_image: 'Imagen',
      form_public: 'Polver',
      form_save: 'Guardar',
      form_cancel: 'Cancelar',
      form_edit: 'Editar',
      form_delete: 'Eliminar',
      form_view: 'Ver',

      // Tables
      table_title: 'Título',
      table_price: 'Precio',
      table_public: 'Público',
      table_image: 'Imagen',
      table_actions: 'Acciones',

      // General
      loading: 'Cargando...',
      no_content: 'No hay contenido público',
      error_generic: 'Ocurrió un error',
      success_saved: 'Guardado correctamente',
      confirm_delete: '¿Confirmar eliminación?',

      // Footer
      footer_copyright: '© Foodaniell - Todos los derechos reservados.',
      lang_label: 'Idioma:',

      // Subtitles
      books_subtitle: 'Una selección de e-books y recursos prácticos para mejorar tu cocina paso a paso.',
      videos_subtitle: 'Aprende técnicas, tips y recetas en formato audiovisual para llevar tu cocina al siguiente nivel.',

      // Libros page
      books_cost_title: 'Medicion de costo para recetas',
      books_cost_text: 'tablar dinamica en exel para la medicion de costos de una receta basica',
      books_price_label: 'precio:',
      books_price_free: 'Gratis',
      books_download_doc: 'Descargar Documento',

      // Dashboard (vista pública)
      dashboard_greeting: 'Bienvenido de nuevo,',
      dashboard_title: 'Tu espacio personal',
      dashboard_subtitle: 'Este módulo es exclusivo para usuarios registrados.',

      // Index page
      index_hero_title: 'Soy Daniel.',
      index_hero_text_1: 'Aprendo, viajo, creo contenido y cocino.',
      index_hero_text_2: 'Porque la buena cocina no es complicada, solo está mal explicada.',
      index_hero_text_3: 'Desde pastas caseras hasta platos saludables y elegantes, para que cocines mejor y comas mejor, sin complicarte la vida.',
      index_hero_text_4: 'Resultados que sí puedes replicar en casa. Aquí comparto lo que aprendí en cocinas reales, adaptado a la vida real y al supermercado.',
      index_hero_text_5: 'Todo Empieza por aquí y haz la cocina parte de tu estilo de vida.',
      index_btn_suggestion: 'Sugerencia',
      index_btn_videos: 'Videos',
      index_btn_ebook: 'E-book',
      index_btn_recetas: 'Recetas',

      // Recetas page
      recipes_subtitle: 'Una colección de ideas para cocinar en casa, con ingredientes sencillos y resultados llenos de sabor.',
      recipes_example_1_title: 'Receta de ejemplo 1',
      recipes_example_1_text: 'Una receta sencilla para comenzar: perfecta para una comida rápida entre semana.',
      recipes_example_2_title: 'Receta de ejemplo 2',
      recipes_example_2_text: 'Ideal para compartir en familia, con ingredientes fáciles de encontrar.',
      recipes_example_3_title: 'Receta de ejemplo 3',
      recipes_example_3_text: 'Un plato un poco más elaborado para cuando quieras sorprender a tus invitados.',
      recipes_example_4_title: 'Receta de ejemplo 4',
      recipes_example_4_text: 'Perfecta para una cena ligera, con sabores frescos y equilibrados.',
      recipes_example_5_title: 'Receta de ejemplo 5',
      recipes_example_5_text: 'Una opción rápida para cuando tienes poco tiempo pero muchas ganas de comer bien.',
      recipes_example_6_title: 'Receta de ejemplo 6',
      recipes_example_6_text: 'Para ocasiones especiales, con un toque diferente y muy sabroso.',
      recipes_view_recipe: 'Ver receta',

      // Recetas bottom section
      recipes_bottom_title: 'Perfección del diseño',
      recipes_bottom_subtitle: 'Cada receta está pensada para ser clara y fácil de seguir. Poco a poco podrás adaptar las preparaciones a tu gusto y estilo de vida, encontrando tu propia forma de cocinar.',

      // About page
      about_title: 'Sobre Foodaniell',
      about_text_1: 'Ayudo a personas que quieren comer y cocinar mejor sin convertir su cocina en un laboratorio ni su vida en un concurso gastronómico.',
      about_text_2: 'Traduzco técnicas de la cocina profesional a procesos simples, prácticos y fáciles de aplicar en casa.',
      about_text_3: 'Mi enfoque combina gastronomía, estilo de vida y creatividad para que cocinar sea algo natural, elegante y posible en el día a día.',
      about_text_4: 'No va de ser chef, va de comprender esos pequeños detalles que elevan cualquier plato.',
      about_text_5: 'Cocina cercana, resultados que se notan y soluciones pensadas para la vida real.',
      about_text_6: 'En Foodaniell encontrarás recetas paso a paso, ideas de presentación y algunos trucos que he ido aprendiendo con el tiempo. Gracias por formar parte de esta aventura culinaria.',
      about_social_title: 'Redes Sociales:',

      // Index cards
      index_card_recipes_title: 'Recetas',
      index_card_recipes_text: 'Descubre recetas caseras sencillas y deliciosas para tu día a día.',
      index_card_books_title: 'Libros',
      index_card_books_text: 'Próximamente podrás encontrar aquí una selección de libros recomendados.',
      index_card_videos_title: 'Videos',
      index_card_videos_text: 'Conoce la historia detrás de Foodaniell y mi pasión por la cocina.',
      index_card_about_title: 'Sobre mí',
      index_card_about_text: 'Conoce la historia detrás de Foodaniell y mi pasión por la cocina.',
      index_btn_learn_more: 'Aprende más',

      // Index cook section
      index_cook_title: 'Vamos a cocinar',
      index_cook_text_1: 'La cocina es el lugar donde se mezclan los recuerdos, los sabores y las historias. Aquí encontrarás inspiración para preparar platos sencillos que sorprendan a todos.',
      index_cook_text_2: 'Acompáñame a experimentar con nuevas recetas y técnicas, siempre con un enfoque casero y cercano.',

      // Contacto page
      contact_title: 'Contáctanos',
      contact_subtitle: '¿Tienes una duda que se te quemó, una idea con buen aroma o una propuesta que podría convertirse en el plato estrella?',
      contact_text: 'Cuéntame! Prometo no dejar tu mensaje a fuego lento⬝.',
      contact_info_title: 'Información de contacto',
      contact_info_text_1: '¿Tienes una duda que necesita sazón, una sugerencia para mejorar la receta o una propuesta de colaboración digna de un menú gourmet?',
      contact_info_text_2: 'Escríbeme y estaré encantado de leerte.',

      // Contacto form
      contact_form_name_label: 'Nombre',
      contact_form_name_placeholder: 'Introduce tu nombre',
      contact_form_email_label: 'Correo electrónico',
      contact_form_email_placeholder: 'Introduce un correo válido',
      contact_form_type_label: 'Tipo de Solicitud',
      contact_form_type_placeholder: 'Selecciona una opción',
      contact_form_type_nutritional: 'Asesoria Nutriconal',
      contact_form_type_collaboration: 'Colaboración Y Marketing',
      contact_form_message_label: 'Mensaje',
      contact_form_message_placeholder: 'Escribe tu mensaje',
      contact_form_submit: 'Enviar',

      // Suggestion form (index)
      suggestion_title: '¿Tienes una receta en mente?',
      suggestion_text_1: 'Nos encanta descubrir nuevas ideas, combinaciones inesperadas y recetas que merecen ser compartidas.',
      suggestion_text_2: 'Escríbela aquí y quizá sea la próxima en nuestra cocina. Prometemos tratarla con cariño⬦ y hambre.',
      form_name_label: 'Nombre',
      form_name_placeholder: 'Introduce tu nombre',
      form_email_label: 'Correo electrónico',
      form_email_placeholder: 'Introduce un correo válido',
      form_recipe_type_label: 'Tipo de Receta',
      form_recipe_type_placeholder: 'Selecciona una opción',
      form_recipe_type_postre: 'Postre',
      form_recipe_type_entrada: 'Entrada',
      form_recipe_type_plato_principal: 'Plato principal',
      form_recipe_type_bajo_calorias: 'Bajo en calorias',
      form_recipe_type_tiktok: 'Receta que viste en tiktok',
      form_recipe_type_rapidas: 'Rápidas (para personas con prisa)',
      form_message_label: 'Descripción de la receta',
      form_message_placeholder: 'Ingredientes, pasos, trucos secretos de la abuela...',
      form_submit: 'Enviar',

      // About page gallery
      about_gallery_title: 'Mi Cocina',
      about_gallery_subtitle: 'Un vistazo a mis creaciones y el estilo que define Foodaniell',
      about_gallery_item1_title: 'Técnica y Simplicidad',
      about_gallery_item1_desc: 'Platos que combinan técnicas profesionales con ejecución casera, donde cada elemento tiene su propósito.',
      about_gallery_item2_title: 'Ingredientes que Cuentan',
      about_gallery_item2_desc: 'Selección cuidadosa de productos que transforman lo simple en extraordinario sin complicaciones.',
      about_gallery_item3_title: 'Presentación Natural',
      about_gallery_item3_desc: 'Elegancia sin artificios, donde la belleza surge de la simplicidad y el respeto por los ingredientes.',
      about_gallery_item4_title: 'Proceso Creativo',
      about_gallery_item4_desc: 'Cada receta nace de experimentación, conocimiento y el placer de compartir resultados.',
      about_gallery_item5_title: 'Cocina Real',
      about_gallery_item5_desc: 'Recetas adaptadas a la vida cotidiana, sin sacrificar sabor ni presentación.',
      about_gallery_item6_title: 'Detalle que Marca',
      about_gallery_item6_desc: 'Pequeños detalles que elevan cualquier preparación de ordinaria a memorable.',
    },

    en: {
      // Header / Nav
      nav_home: 'Home',
      nav_about: 'About',
      nav_contact: 'Contact',
      nav_login: 'Login',
      nav_register: 'Register',
      nav_content: 'Content',
      nav_recipes: 'Recipes',
      nav_books: 'Books',
      nav_videos: 'Videos',

      // Auth
      login_title: 'Sign In',
      login_subtitle: 'Welcome back',
      login_email: 'Email',
      login_password: 'Password',
      login_button: 'Sign In',
      login_forgot: 'Forgot password?',
      login_no_account: 'Don\'t have an account?',
      login_register_here: 'Register here',

      register_title: 'Create Account',
      register_subtitle: 'Join the culinary family',
      register_name: 'Full name',
      register_email: 'Email',
      register_password: 'Password',
      register_button: 'Register',
      register_has_account: 'Already have an account?',
      register_login_here: 'Sign in',

      recovery_title: 'Recover Password',
      recovery_subtitle: 'Enter your email to receive a link',
      recovery_send: 'Send link',
      recovery_back_to_login: 'Back to sign in?',

      // Dashboard
      dashboard_title: 'Dashboard',
      dashboard_kpi_recipes: 'Recipes',
      dashboard_kpi_books: 'Books',
      dashboard_kpi_videos: 'Videos',
      dashboard_kpi_users: 'Users',
      dashboard_create_recipe: 'Create Recipe',
      dashboard_create_book: 'Create Book',
      dashboard_create_video: 'Create Video',
      dashboard_manage_users: 'Manage Users',
      dashboard_task_title: 'Tasks',
      dashboard_task_placeholder: 'New task',
      dashboard_task_add: 'Add',

      // Forms
      form_title: 'Title',
      form_description: 'Description',
      form_price: 'Price',
      form_link: 'Link',
      form_image: 'Image',
      form_public: 'Public',
      form_save: 'Save',
      form_cancel: 'Cancel',
      form_edit: 'Edit',
      form_delete: 'Delete',
      form_view: 'View',

      // Tables
      table_title: 'Title',
      table_price: 'Price',
      table_public: 'Public',
      table_image: 'Image',
      table_actions: 'Actions',

      // General
      loading: 'Loading...',
      no_content: 'No public content',
      error_generic: 'An error occurred',
      success_saved: 'Saved successfully',
      confirm_delete: 'Confirm deletion?',

      // Footer
      footer_copyright: '© Foodaniell - All rights reserved.',
      lang_label: 'Language:',

      // Subtitles
      books_subtitle: 'A selection of e-books and practical resources to improve your cooking step by step.',
      videos_subtitle: 'Learn techniques, tips and recipes in audiovisual format to take your cooking to the next level.',

      // Libros page
      books_cost_title: 'Recipe Cost Measurement',
      books_cost_text: 'Dynamic Excel table for measuring the cost of a basic recipe',
      books_price_label: 'price:',
      books_price_free: 'Free',
      books_download_doc: 'Download Document',

      // Dashboard (vista pública)
      dashboard_greeting: 'Welcome back,',
      dashboard_title: 'Your personal space',
      dashboard_subtitle: 'This module is exclusive for registered users.',

      // Index page
      index_hero_title: 'I am Daniel.',
      index_hero_text_1: 'I learn, travel, create content and cook.',
      index_hero_text_2: 'Because good cooking is not complicated, it\'s just poorly explained.',
      index_hero_text_3: 'From homemade pasta to healthy and elegant dishes, so you can cook better and eat better, without complicating your life.',
      index_hero_text_4: 'Results you can actually replicate at home. Here I share what I learned in real kitchens, adapted to real life and the supermarket.',
      index_hero_text_5: 'Everything starts here and make cooking part of your lifestyle.',
      index_btn_suggestion: 'Suggestion',
      index_btn_videos: 'Videos',
      index_btn_ebook: 'E-book',
      index_btn_recipes: 'Recipes',

      // Recetas page
      recipes_subtitle: 'A collection of ideas to cook at home, with simple ingredients and flavorful results.',
      recipes_example_1_title: 'Example Recipe 1',
      recipes_example_1_text: 'A simple recipe to start: perfect for a quick weekday meal.',
      recipes_example_2_title: 'Example Recipe 2',
      recipes_example_2_text: 'Ideal for sharing with family, with easy-to-find ingredients.',
      recipes_example_3_title: 'Example Recipe 3',
      recipes_example_3_text: 'A slightly more elaborate dish for when you want to surprise your guests.',
      recipes_example_4_title: 'Example Recipe 4',
      recipes_example_4_text: 'Perfect for a light dinner, with fresh and balanced flavors.',
      recipes_example_5_title: 'Example Recipe 5',
      recipes_example_5_text: 'A quick option for when you have little time but great desire to eat well.',
      recipes_example_6_title: 'Example Recipe 6',
      recipes_example_6_text: 'For special occasions, with a different and very tasty touch.',
      recipes_view_recipe: 'View recipe',

      // Recetas bottom section
      recipes_bottom_title: 'Design Perfection',
      recipes_bottom_subtitle: 'Each recipe is designed to be clear and easy to follow. Gradually you can adapt the preparations to your taste and lifestyle, finding your own way of cooking.',

      // About page
      about_title: 'About Foodaniell',
      about_text_1: 'I help people who want to eat and cook better without turning their kitchen into a laboratory or their life into a gastronomic contest.',
      about_text_2: 'I translate professional cooking techniques into simple, practical and easy-to-apply processes at home.',
      about_text_3: 'My approach combines gastronomy, lifestyle and creativity to make cooking something natural, elegant and possible in everyday life.',
      about_text_4: 'It\'s not about being a chef, it\'s about understanding those little details that elevate any dish.',
      about_text_5: 'Close cooking, noticeable results and solutions designed for real life.',
      about_text_6: 'In Foodaniell you will find step-by-step recipes, presentation ideas and some tricks I\'ve been learning over time. Thank you for being part of this culinary adventure.',
      about_social_title: 'Social Networks:',

      // Index cards
      index_card_recipes_title: 'Recipes',
      index_card_recipes_text: 'Discover simple and delicious homemade recipes for your day to day.',
      index_card_books_title: 'Books',
      index_card_books_text: 'Soon you will find here a selection of recommended books.',
      index_card_videos_title: 'Videos',
      index_card_videos_text: 'Discover the story behind Foodaniell and my passion for cooking.',
      index_card_about_title: 'About Me',
      index_card_about_text: 'Discover the story behind Foodaniell and my passion for cooking.',
      index_btn_learn_more: 'Learn More',

      // Index cook section
      index_cook_title: 'Let\'s Cook',
      index_cook_text_1: 'The kitchen is where memories, flavors and stories mix. Here you will find inspiration to prepare simple dishes that will surprise everyone.',
      index_cook_text_2: 'Join me to experiment with new recipes and techniques, always with a homemade and friendly approach.',

      // Contacto page
      contact_title: 'Contact Us',
      contact_subtitle: 'Do you have a question that got burned, an idea with a good aroma or a proposal that could become the star dish?',
      contact_text: 'Tell me! I promise not to leave your message on low heat⬝.',
      contact_info_title: 'Contact Information',
      contact_info_text_1: 'Do you have a question that needs seasoning, a suggestion to improve the recipe or a collaboration proposal worthy of a gourmet menu?',
      contact_info_text_2: 'Write to me and I will be delighted to read you.',

      // Contacto form
      contact_form_name_label: 'Name',
      contact_form_name_placeholder: 'Enter your name',
      contact_form_email_label: 'Email',
      contact_form_email_placeholder: 'Enter a valid email',
      contact_form_type_label: 'Request Type',
      contact_form_type_placeholder: 'Select an option',
      contact_form_type_nutritional: 'Nutritional Advice',
      contact_form_type_collaboration: 'Collaboration and Marketing',
      contact_form_message_label: 'Message',
      contact_form_message_placeholder: 'Write your message',
      contact_form_submit: 'Send',

      // Suggestion form (index)
      suggestion_title: 'Do you have a recipe in mind?',
      suggestion_text_1: 'We love discovering new ideas, unexpected combinations and recipes that deserve to be shared.',
      suggestion_text_2: 'Write it here and maybe it will be the next one in our kitchen. We promise to treat it with affection⬦ and hunger.',
      form_name_label: 'Name',
      form_name_placeholder: 'Enter your name',
      form_email_label: 'Email',
      form_email_placeholder: 'Enter a valid email',
      form_recipe_type_label: 'Recipe Type',
      form_recipe_type_placeholder: 'Select an option',
      form_recipe_type_postre: 'Dessert',
      form_recipe_type_entrada: 'Appetizer',
      form_recipe_type_plato_principal: 'Main Course',
      form_recipe_type_bajo_calorias: 'Low in calories',
      form_recipe_type_tiktok: 'Recipe you saw on TikTok',
      form_recipe_type_rapidas: 'Quick (for people in a hurry)',
      form_message_label: 'Recipe Description',
      form_message_placeholder: 'Ingredients, steps, grandma\'s secret tricks...',
      form_submit: 'Send',

      // About page gallery
      about_gallery_title: 'My Kitchen',
      about_gallery_subtitle: 'A glimpse of my creations and the style that defines Foodaniell',
      about_gallery_item1_title: 'Technique and Simplicity',
      about_gallery_item1_desc: 'Dishes that combine professional techniques with home execution, where each element has its purpose.',
      about_gallery_item2_title: 'Ingredients that Matter',
      about_gallery_item2_desc: 'Careful selection of products that transform the simple into extraordinary without complications.',
      about_gallery_item3_title: 'Natural Presentation',
      about_gallery_item3_desc: 'Elegance without artifice, where beauty emerges from simplicity and respect for ingredients.',
      about_gallery_item4_title: 'Creative Process',
      about_gallery_item4_desc: 'Each recipe is born from experimentation, knowledge and the pleasure of sharing results.',
      about_gallery_item5_title: 'Real Cooking',
      about_gallery_item5_desc: 'Recipes adapted to daily life, without sacrificing flavor or presentation.',
      about_gallery_item6_title: 'Detail that Makes a Difference',
      about_gallery_item6_desc: 'Small details that elevate any preparation from ordinary to memorable.',
    }
  };

  function getCurrentLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    updateUI();
    window.dispatchEvent(new CustomEvent('foodaniell:langchange', {
      detail: { lang }
    }));
  }

  function t(key) {
    const lang = getCurrentLang();
    const dict = texts[lang] || texts[DEFAULT_LANG];
    return dict[key] || key;
  }

  function updateUI() {
    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });

    // Actualizar títulos
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = t(key);
    });

    // Actualizar botón activo en switch de idioma
    const switcher = document.querySelector('.site-lang-switcher');
    if (switcher) {
      const current = getCurrentLang();
      switcher.querySelectorAll('.site-lang-switcher__btn').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === current;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
  }

  function ensureSwitcher() {
    const footerInner = document.querySelector('.site-footer__inner');
    if (!footerInner) return;
    if (footerInner.querySelector('.site-lang-switcher')) return;

    const switcher = document.createElement('div');
    switcher.className = 'site-lang-switcher';
    switcher.innerHTML = `
      <span class="site-lang-switcher__label">${t('lang_label')}</span>
      <button type="button" class="site-lang-switcher__btn" data-lang="es" aria-pressed="false">ES</button>
      <button type="button" class="site-lang-switcher__btn" data-lang="en" aria-pressed="false">EN</button>
    `;
    footerInner.appendChild(switcher);

    switcher.querySelectorAll('.site-lang-switcher__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang') || DEFAULT_LANG;
        setLang(lang);
      });
    });

    updateUI(); // para activar el idioma guardado
  }

  // Inicialización al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureSwitcher();
      updateUI();
    });
  } else {
    ensureSwitcher();
    updateUI();
  }

  return {
    t,
    setLang,
    getCurrentLang,
    updateUI,
    ensureSwitcher
  };
})();
