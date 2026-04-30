const baseSchemas = {
  ApiError: {
    type: 'object',
    example: { error: 'Invalid credentials' },
    properties: {
      error: { type: 'string' }
    }
  },
  IdResponse: {
    type: 'object',
    example: { success: true, id: 12 },
    properties: {
      success: { type: 'boolean' },
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] }
    }
  },
  Success: {
    type: 'object',
    example: { success: true },
    properties: {
      success: { type: 'boolean' }
    }
  },
  BootstrapResponse: {
    type: 'object',
    example: {
      success: true,
      books: [],
      recipes: [],
      videos: [],
      users: [],
      suggestions: [],
      contacts: [],
      tasks: []
    },
    properties: {
      success: { type: 'boolean' },
      books: { type: 'array', items: { $ref: '#/components/schemas/AdminBook' } },
      recipes: { type: 'array', items: { $ref: '#/components/schemas/AdminRecipe' } },
      videos: { type: 'array', items: { $ref: '#/components/schemas/AdminVideo' } },
      users: { type: 'array', items: { $ref: '#/components/schemas/AdminUser' } },
      suggestions: { type: 'array', items: { $ref: '#/components/schemas/Suggestion' } },
      contacts: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
      tasks: { type: 'array', items: { $ref: '#/components/schemas/AdminTask' } }
    }
  },
  PublicUser: {
    type: 'object',
    example: {
      id: 1,
      name: 'Daniel Perez',
      email: 'daniel@example.com',
      profileImageUrl: '/asset/uploads/profiles/user_1_123.png',
      receiveEmails: true
    },
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      profileImageUrl: { type: 'string', nullable: true },
      receiveEmails: { type: 'boolean' }
    }
  },
  AuthResponse: {
    type: 'object',
    example: {
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 1,
        name: 'Daniel Perez',
        email: 'daniel@example.com',
        profileImageUrl: null,
        receiveEmails: false
      }
    },
    properties: {
      success: { type: 'boolean' },
      token: { type: 'string' },
      user: { $ref: '#/components/schemas/PublicUser' }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    example: {
      email: 'daniel@example.com',
      password: 'Password123!'
    },
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 128 }
    }
  },
  RegisterRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    example: {
      name: 'Daniel Perez',
      email: 'daniel@example.com',
      password: 'Password123!'
    },
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 128 }
    }
  },
  ForgotPasswordRequest: {
    type: 'object',
    required: ['email'],
    example: {
      email: 'daniel@example.com'
    },
    properties: {
      email: { type: 'string', format: 'email' }
    }
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['token', 'password'],
    example: {
      token: '4c2f2b8d3c2d4d2f9f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f',
      password: 'NewPassword123!'
    },
    properties: {
      token: { type: 'string' },
      password: { type: 'string', minLength: 8, maxLength: 128 }
    }
  },
  UpdateProfileRequest: {
    type: 'object',
    example: {
      name: 'Daniel Perez',
      email: 'daniel@example.com',
      password: 'NewPassword123!',
      receiveEmails: true
    },
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      profileImageDataUrl: { type: 'string', description: 'Base64 data URL for PNG, JPEG or WEBP' },
      receiveEmails: { type: 'boolean' }
    }
  },
  CheckAuthResponse: {
    type: 'object',
    properties: {
      authenticated: { type: 'boolean' },
      user: { $ref: '#/components/schemas/PublicUser' }
    }
  },
  PublicSuggestionRequest: {
    type: 'object',
    required: ['name', 'email', 'message'],
    example: {
      name: 'Laura Gomez',
      email: 'laura@example.com',
      recipeType: 'dessert',
      message: 'Me gustaria ver mas recetas sin gluten.'
    },
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      recipeType: { type: 'string' },
      message: { type: 'string' }
    }
  },
  PublicContactRequest: {
    type: 'object',
    required: ['name', 'email', 'message'],
    example: {
      name: 'Laura Gomez',
      email: 'laura@example.com',
      requestType: 'Soporte',
      message: 'Necesito ayuda con mi cuenta.'
    },
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      requestType: { type: 'string' },
      message: { type: 'string' }
    }
  },
  PublicRecipe: {
    type: 'object',
    example: {
      id: '12',
      imagen: '/asset/uploads/recipes/recipes_123.png',
      imagenes: ['/asset/uploads/recipes/recipes_123.png'],
      titulo: 'Tarta de manzana',
      tiempo: '45 min',
      ingredientes: 'Manzanas, harina, canela',
      pasos: '1. Mezclar... 2. Hornear...',
      notas: 'Servir tibia',
      publico: true,
      calories: 320,
      proteins: 5,
      carbs: 48,
      fats: 12,
      fiber: 4,
      sugar: 18,
      sodium: 120,
      servings: 6,
      nutrition: {
        calories: 320,
        proteins: 5,
        carbs: 48,
        fats: 12,
        fiber: 4,
        sugar: 18,
        sodium: 120,
        servings: 6
      }
    },
    properties: {
      id: { type: 'string' },
      imagen: { type: 'string' },
      imagenes: {
        type: 'array',
        items: { type: 'string' }
      },
      titulo: { type: 'string' },
      tiempo: { type: 'string' },
      ingredientes: { type: 'string' },
      pasos: { type: 'string' },
      notas: { type: 'string' },
      publico: { type: 'boolean' },
      calories: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      proteins: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      carbs: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fats: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fiber: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sugar: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sodium: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      servings: { oneOf: [{ type: 'integer' }, { type: 'string' }], nullable: true },
      nutrition: {
        anyOf: [
          { type: 'object' },
          { type: 'null' }
        ]
      }
    }
  },
  PublicBook: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
      imagen: { type: 'string' },
      titulo: { type: 'string' },
      descripcion: { type: 'string' },
      linkCompra: { type: 'string' },
      precio: { type: 'string' },
      publico: { type: 'boolean' }
    }
  },
  PublicVideo: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
      titulo: { type: 'string' },
      descripcion: { type: 'string' },
      url: { type: 'string' },
      publico: { type: 'boolean' }
    }
  },
  AdminBook: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      title: { type: 'string' },
      description: { type: 'string', nullable: true },
      buy_link: { type: 'string', nullable: true },
      price: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      image_url: { type: 'string', nullable: true },
      is_public: { type: 'boolean' }
    }
  },
  AdminVideo: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      title: { type: 'string' },
      description: { type: 'string', nullable: true },
      url: { type: 'string' },
      is_public: { type: 'boolean' }
    }
  },
  AdminUser: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['user', 'admin'] },
      receive_emails: { type: 'boolean' }
    }
  },
  AdminTask: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      text: { type: 'string' },
      is_done: { type: 'boolean' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time', nullable: true }
    }
  },
  Suggestion: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      message: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      recipe_type: { type: 'string' }
    }
  },
  Contact: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      request_type: { type: 'string', nullable: true },
      message: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },
  AdminRecipe: {
    type: 'object',
    properties: {
      id: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      title: { type: 'string' },
      time_text: { type: 'string', nullable: true },
      ingredients: { type: 'string' },
      steps: { type: 'string' },
      notes: { type: 'string', nullable: true },
      image_url: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }], nullable: true },
      is_public: { type: 'boolean' },
      calories: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      proteins: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      carbs: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fats: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fiber: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sugar: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sodium: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      servings: { oneOf: [{ type: 'integer' }, { type: 'string' }], nullable: true }
    }
  },
  AdminCreateUserResponse: {
    type: 'object',
    example: {
      success: true,
      user: {
        id: 21,
        name: 'Laura Gomez',
        email: 'laura@example.com',
        role: 'user',
        receive_emails: true
      },
      temporaryPassword: '4M2v8fA1!qZ'
    },
    properties: {
      success: { type: 'boolean' },
      user: { $ref: '#/components/schemas/AdminUser' },
      temporaryPassword: { type: 'string' }
    }
  },
  AdminUpdateUserResponse: {
    type: 'object',
    example: {
      success: true,
      user: {
        id: 21,
        name: 'Laura Gomez',
        email: 'laura@example.com',
        role: 'user',
        receive_emails: true
      }
    },
    properties: {
      success: { type: 'boolean' },
      user: { $ref: '#/components/schemas/AdminUser' }
    }
  },
  RecipeDetailResponse: {
    type: 'object',
    example: {
      success: true,
      recipe: {
        id: 12,
        title: 'Tarta de manzana',
        ingredients: 'Manzanas, harina, canela',
        steps: '1. Mezclar. 2. Hornear.',
        nutrition: {
          calories: 320,
          proteins: 5,
          carbs: 48,
          fats: 12,
          fiber: 4,
          sugar: 18,
          sodium: 120,
          servings: 6
        }
      }
    },
    properties: {
      success: { type: 'boolean' },
      recipe: {
        allOf: [
          { $ref: '#/components/schemas/AdminRecipe' },
          {
            type: 'object',
            properties: {
              nutrition: {
                anyOf: [
                  { $ref: '#/components/schemas/NutritionInput' },
                  { type: 'null' }
                ]
              }
            }
          }
        ]
      }
    }
  },
  PublicContentResponse: {
    type: 'object',
    example: {
      success: true,
      recetas: [],
      libros: [],
      videos: []
    },
    properties: {
      success: { type: 'boolean' },
      recetas: {
        type: 'array',
        items: { $ref: '#/components/schemas/PublicRecipe' }
      },
      libros: {
        type: 'array',
        items: { $ref: '#/components/schemas/PublicBook' }
      },
      videos: {
        type: 'array',
        items: { $ref: '#/components/schemas/PublicVideo' }
      }
    }
  },
  RecipesResponse: {
    type: 'object',
    example: {
      success: true,
      lang: 'es',
      recetas: []
    },
    properties: {
      success: { type: 'boolean' },
      lang: { type: 'string' },
      recetas: {
        type: 'array',
        items: { $ref: '#/components/schemas/PublicRecipe' }
      }
    }
  },
  AdminBookRequest: {
    type: 'object',
    required: ['title'],
    example: {
      title: 'Cocina Basica',
      description: 'Guia practica para empezar.',
      buyLink: 'https://example.com/libro',
      price: 29.99,
      imageUrl: '/asset/uploads/books/book.png',
      isPublic: true
    },
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      buyLink: { type: 'string' },
      price: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      imageUrl: {
        type: 'string',
        description: 'Image URL or base64 data URL'
      },
      isPublic: { type: 'boolean' }
    }
  },
  NutritionInput: {
    type: 'object',
    example: {
      calories: 320,
      proteins: 5,
      carbs: 48,
      fats: 12,
      fiber: 4,
      sugar: 18,
      sodium: 120,
      servings: 6
    },
    properties: {
      calories: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      proteins: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      carbs: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fats: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      fiber: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sugar: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      sodium: { oneOf: [{ type: 'number' }, { type: 'string' }], nullable: true },
      servings: { oneOf: [{ type: 'integer' }, { type: 'string' }], nullable: true }
    }
  },
  AdminRecipeRequest: {
    type: 'object',
    required: ['title', 'ingredients', 'steps'],
    example: {
      title: 'Tarta de manzana',
      timeText: '45 min',
      ingredients: 'Manzanas, harina, canela',
      steps: '1. Mezclar. 2. Hornear.',
      notes: 'Servir tibia',
      imageUrls: ['/asset/uploads/recipes/recipes_123.png'],
      isPublic: true,
      nutrition: {
        calories: 320,
        proteins: 5,
        carbs: 48,
        fats: 12,
        fiber: 4,
        sugar: 18,
        sodium: 120,
        servings: 6
      }
    },
    properties: {
      title: { type: 'string' },
      timeText: { type: 'string' },
      ingredients: { type: 'string' },
      steps: { type: 'string' },
      notes: { type: 'string' },
      imageUrl: { type: 'string' },
      imageUrls: {
        oneOf: [
          { type: 'array', items: { type: 'string' } },
          { type: 'string' }
        ]
      },
      isPublic: { type: 'boolean' },
      nutrition: { $ref: '#/components/schemas/NutritionInput' }
    }
  },
  AdminVideoRequest: {
    type: 'object',
    required: ['title', 'url'],
    example: {
      title: 'Como preparar pasta',
      description: 'Video de ejemplo',
      url: 'https://www.youtube.com/watch?v=abc123',
      isPublic: true
    },
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      url: { type: 'string' },
      isPublic: { type: 'boolean' }
    }
  },
  AdminUserRequest: {
    type: 'object',
    required: ['name', 'email'],
    example: {
      name: 'Laura Gomez',
      email: 'laura@example.com',
      role: 'user',
      receiveEmails: true
    },
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['user', 'admin'] },
      receiveEmails: { type: 'boolean' }
    }
  },
  AdminTaskRequest: {
    type: 'object',
    example: {
      text: 'Actualizar recetas publicas',
      done: false
    },
    properties: {
      text: { type: 'string' },
      done: { type: 'boolean' }
    }
  },
  NotificationRequest: {
    type: 'object',
    required: ['subject', 'message'],
    example: {
      subject: 'Nuevas recetas disponibles',
      message: 'Ya puedes revisar el nuevo contenido.'
    },
    properties: {
      subject: { type: 'string' },
      message: { type: 'string' }
    }
  }
};

function buildOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Foodaniell API',
      version: '1.0.0',
      description: 'Documentacion OpenAPI de la API Express de Foodaniell, incluyendo rutas nuevas y alias historicos de autenticacion.',
      contact: {
        name: 'Foodaniell',
        url: 'http://localhost:3000'
      }
    },
    servers: [
      {
        url: '/'
      }
    ],
    tags: [
      { name: 'Auth' },
      { name: 'Public' },
      { name: 'Admin' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: baseSchemas
    },
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Inicia sesion',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
                example: {
                  email: 'daniel@example.com',
                  password: 'Password123!'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'Credenciales invalidas',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Crea una cuenta',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
                example: {
                  name: 'Daniel Perez',
                  email: 'daniel@example.com',
                  password: 'Password123!'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Cuenta creada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 2,
                      name: 'Laura Gomez',
                      email: 'laura@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            409: {
              description: 'Email duplicado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Solicita enlace de recuperacion',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
                example: {
                  email: 'daniel@example.com'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Solicitud aceptada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Restablece la contrasena',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
                example: {
                  token: '4c2f2b8d3c2d4d2f9f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f',
                  password: 'NewPassword123!'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Contrasena actualizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Token invalido o expirado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/check-auth': {
        get: {
          tags: ['Auth'],
          summary: 'Verifica el token actual',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Sesion valida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CheckAuthResponse' },
                  example: {
                    authenticated: true,
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/profile': {
        put: {
          tags: ['Auth'],
          summary: 'Actualiza el perfil del usuario autenticado',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
                example: {
                  name: 'Daniel Perez',
                  email: 'daniel@example.com',
                  password: 'NewPassword123!',
                  receiveEmails: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Perfil actualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: '/asset/uploads/profiles/user_1.png',
                      receiveEmails: true
                    }
                  }
                }
              }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cierra la sesion del lado del cliente',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout exitoso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/login': {
        post: {
          tags: ['Auth'],
          summary: 'Alias historico de inicio de sesion',
          deprecated: true,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
                example: {
                  email: 'daniel@example.com',
                  password: 'Password123!'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'Credenciales invalidas',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/register': {
        post: {
          tags: ['Auth'],
          summary: 'Alias historico de registro',
          deprecated: true,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
                example: {
                  name: 'Daniel Perez',
                  email: 'daniel@example.com',
                  password: 'Password123!'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Cuenta creada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 2,
                      name: 'Laura Gomez',
                      email: 'laura@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            409: {
              description: 'Email duplicado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Alias historico de recuperacion de contrasena',
          deprecated: true,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
                example: {
                  email: 'daniel@example.com'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Solicitud aceptada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Formato invalido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Alias historico de restablecimiento de contrasena',
          deprecated: true,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
                example: {
                  token: '4c2f2b8d3c2d4d2f9f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f4f2f',
                  password: 'NewPassword123!'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Contrasena actualizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Token invalido o expirado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/check-auth': {
        get: {
          tags: ['Auth'],
          summary: 'Alias historico para verificar autenticacion',
          deprecated: true,
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Sesion valida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CheckAuthResponse' },
                  example: {
                    authenticated: true,
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: null,
                      receiveEmails: false
                    }
                  }
                }
              }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/profile': {
        put: {
          tags: ['Auth'],
          summary: 'Alias historico para actualizar perfil',
          deprecated: true,
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
                example: {
                  name: 'Daniel Perez',
                  email: 'daniel@example.com',
                  password: 'NewPassword123!',
                  receiveEmails: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Perfil actualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 1,
                      name: 'Daniel Perez',
                      email: 'daniel@example.com',
                      profileImageUrl: '/asset/uploads/profiles/user_1.png',
                      receiveEmails: true
                    }
                  }
                }
              }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Alias historico de cierre de sesion',
          deprecated: true,
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout exitoso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/public/recipes': {
        get: {
          tags: ['Public'],
          summary: 'Lista recetas publicas',
          parameters: [
            {
              name: 'lang',
              in: 'query',
              schema: { type: 'string' },
              description: 'Codigo de idioma para traducciones, por ejemplo en'
            }
          ],
          responses: {
            200: {
              description: 'Listado de recetas',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RecipesResponse' },
                  example: {
                    success: true,
                    lang: 'es',
                    recetas: []
                  }
                }
              }
            }
          }
        }
      },
      '/api/public/content': {
        get: {
          tags: ['Public'],
          summary: 'Devuelve recetas, libros y videos publicos',
          parameters: [
            {
              name: 'lang',
              in: 'query',
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Contenido publico',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PublicContentResponse' },
                  example: {
                    success: true,
                    recetas: [
                      {
                        id: '12',
                        imagen: '/asset/uploads/recipes/recipes_123.png',
                        imagenes: ['/asset/uploads/recipes/recipes_123.png'],
                        titulo: 'Tarta de manzana',
                        tiempo: '45 min',
                        ingredientes: 'Manzanas, harina, canela',
                        pasos: '1. Mezclar... 2. Hornear...',
                        notas: 'Servir tibia',
                        publico: true,
                        calories: 320,
                        proteins: 5,
                        carbs: 48,
                        fats: 12,
                        fiber: 4,
                        sugar: 18,
                        sodium: 120,
                        servings: 6
                      }
                    ],
                    libros: [
                      {
                        id: 1,
                        imagen: '/asset/uploads/books/book.png',
                        titulo: 'Cocina Basica',
                        descripcion: 'Guia practica para empezar.',
                        linkCompra: 'https://example.com/libro',
                        precio: '29.99',
                        publico: true
                      }
                    ],
                    videos: [
                      {
                        id: 3,
                        titulo: 'Como preparar pasta',
                        descripcion: 'Video de ejemplo',
                        url: 'https://www.youtube.com/watch?v=abc123',
                        publico: true
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/public/suggestions': {
        post: {
          tags: ['Public'],
          summary: 'Registra una sugerencia',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicSuggestionRequest' },
                example: {
                  name: 'Laura Gomez',
                  email: 'laura@example.com',
                  recipeType: 'dessert',
                  message: 'Me gustaria ver mas recetas sin gluten.'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Sugerencia creada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/public/contacts': {
        post: {
          tags: ['Public'],
          summary: 'Registra un contacto',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicContactRequest' },
                example: {
                  name: 'Laura Gomez',
                  email: 'laura@example.com',
                  requestType: 'Soporte',
                  message: 'Necesito ayuda con mi cuenta.'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Contacto creado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/bootstrap': {
        get: {
          tags: ['Admin'],
          summary: 'Carga inicial del panel de administracion',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Datos iniciales',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BootstrapResponse' },
                  example: {
                    success: true,
                    books: [
                      {
                        id: 1,
                        title: 'Cocina Basica',
                        description: 'Guia practica para empezar.',
                        buy_link: 'https://example.com/libro',
                        price: 29.99,
                        image_url: '/asset/uploads/books/book.png',
                        is_public: true
                      }
                    ],
                    recipes: [
                      {
                        id: 12,
                        title: 'Tarta de manzana',
                        time_text: '45 min',
                        ingredients: 'Manzanas, harina, canela',
                        steps: '1. Mezclar. 2. Hornear.',
                        notes: 'Servir tibia',
                        image_url: '/asset/uploads/recipes/recipes_123.png',
                        is_public: true
                      }
                    ],
                    videos: [
                      {
                        id: 3,
                        title: 'Como preparar pasta',
                        description: 'Video de ejemplo',
                        url: 'https://www.youtube.com/watch?v=abc123',
                        is_public: true
                      }
                    ],
                    users: [],
                    suggestions: [],
                    contacts: [],
                    tasks: []
                  }
                }
              }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/books': {
        post: {
          tags: ['Admin'],
          summary: 'Crea un libro',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminBookRequest' },
                example: {
                  title: 'Cocina Basica',
                  description: 'Guia practica para empezar.',
                  buyLink: 'https://example.com/libro',
                  price: 29.99,
                  imageUrl: '/asset/uploads/books/book.png',
                  isPublic: true
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Libro creado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/IdResponse' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/books/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Actualiza un libro',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminBookRequest' },
                example: {
                  title: 'Cocina Basica',
                  description: 'Guia practica para empezar.',
                  buyLink: 'https://example.com/libro',
                  price: 29.99,
                  imageUrl: '/asset/uploads/books/book.png',
                  isPublic: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Libro actualizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Libro no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Elimina un libro',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Libro eliminado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Libro no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/recipes': {
        post: {
          tags: ['Admin'],
          summary: 'Crea una receta',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminRecipeRequest' },
                example: {
                  title: 'Tarta de manzana',
                  timeText: '45 min',
                  ingredients: 'Manzanas, harina, canela',
                  steps: '1. Mezclar. 2. Hornear.',
                  notes: 'Servir tibia',
                  imageUrls: ['/asset/uploads/recipes/recipes_123.png'],
                  isPublic: true,
                  nutrition: {
                    calories: 320,
                    proteins: 5,
                    carbs: 48,
                    fats: 12,
                    fiber: 4,
                    sugar: 18,
                    sodium: 120,
                    servings: 6
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Receta creada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/IdResponse' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/recipes/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Obtiene una receta por id',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Receta encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RecipeDetailResponse' },
                  example: {
                    success: true,
                    recipe: {
                      id: 12,
                      title: 'Tarta de manzana',
                      time_text: '45 min',
                      ingredients: 'Manzanas, harina, canela',
                      steps: '1. Mezclar. 2. Hornear.',
                      notes: 'Servir tibia',
                      image_url: '/asset/uploads/recipes/recipes_123.png',
                      is_public: true,
                      calories: 320,
                      proteins: 5,
                      carbs: 48,
                      fats: 12,
                      fiber: 4,
                      sugar: 18,
                      sodium: 120,
                      servings: 6,
                      nutrition: {
                        calories: 320,
                        proteins: 5,
                        carbs: 48,
                        fats: 12,
                        fiber: 4,
                        sugar: 18,
                        sodium: 120,
                        servings: 6
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Receta no encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        put: {
          tags: ['Admin'],
          summary: 'Actualiza una receta',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminRecipeRequest' },
                example: {
                  title: 'Tarta de manzana',
                  timeText: '45 min',
                  ingredients: 'Manzanas, harina, canela',
                  steps: '1. Mezclar. 2. Hornear.',
                  notes: 'Servir tibia',
                  imageUrls: ['/asset/uploads/recipes/recipes_123.png'],
                  isPublic: true,
                  nutrition: {
                    calories: 320,
                    proteins: 5,
                    carbs: 48,
                    fats: 12,
                    fiber: 4,
                    sugar: 18,
                    sodium: 120,
                    servings: 6
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Receta actualizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Receta no encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Elimina una receta',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Receta eliminada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Receta no encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/videos': {
        post: {
          tags: ['Admin'],
          summary: 'Crea un video',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminVideoRequest' },
                example: {
                  title: 'Como preparar pasta',
                  description: 'Video de ejemplo',
                  url: 'https://www.youtube.com/watch?v=abc123',
                  isPublic: true
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Video creado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/IdResponse' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/videos/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Actualiza un video',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminVideoRequest' },
                example: {
                  title: 'Como preparar pasta',
                  description: 'Video de ejemplo',
                  url: 'https://www.youtube.com/watch?v=abc123',
                  isPublic: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Video actualizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Video no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Elimina un video',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Video eliminado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Video no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/users': {
        post: {
          tags: ['Admin'],
          summary: 'Crea un usuario',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUserRequest' },
                example: {
                  name: 'Laura Gomez',
                  email: 'laura@example.com',
                  role: 'user',
                  receiveEmails: true
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Usuario creado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AdminCreateUserResponse' }
                }
              }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            409: {
              description: 'Email duplicado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/users/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Actualiza un usuario',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUserRequest' },
                example: {
                  name: 'Laura Gomez',
                  email: 'laura@example.com',
                  role: 'user',
                  receiveEmails: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Usuario actualizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminUpdateUserResponse' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Usuario no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            409: {
              description: 'Email duplicado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Elimina un usuario',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Usuario eliminado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Usuario no encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/tasks': {
        post: {
          tags: ['Admin'],
          summary: 'Crea una tarea',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminTaskRequest' },
                example: {
                  text: 'Actualizar recetas publicas',
                  done: false
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Tarea creada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/IdResponse' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/tasks/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Actualiza una tarea',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminTaskRequest' },
                example: {
                  text: 'Actualizar recetas publicas',
                  done: false
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Tarea actualizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Tarea no encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        },
        delete: {
          tags: ['Admin'],
          summary: 'Elimina una tarea',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: {
              description: 'Tarea eliminada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            404: {
              description: 'Tarea no encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      },
      '/api/admin/emails/notify': {
        post: {
          tags: ['Admin'],
          summary: 'Envio masivo de correos',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationRequest' },
                example: {
                  subject: 'Nuevas recetas disponibles',
                  message: 'Ya puedes revisar el nuevo contenido.'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Proceso de envio finalizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      sent: { type: 'integer' },
                      failed: { type: 'integer' },
                      total: { type: 'integer' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Datos invalidos',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            401: {
              description: 'No autorizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            },
            500: {
              description: 'SMTP no configurado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
            }
          }
        }
      }
    }
  };
}

module.exports = {
  buildOpenApiSpec
};
