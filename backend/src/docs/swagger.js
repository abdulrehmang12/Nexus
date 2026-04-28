const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Nexus API',
    version: '1.0.0',
    description: 'Investor and entrepreneur collaboration platform backend',
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000/api',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f1e2a4b3c2d001f8a1234' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['investor', 'entrepreneur'] },
          bio: { type: 'string' },
          location: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
          preferences: { type: 'array', items: { type: 'string' } },
          twoFactorEnabled: { type: 'boolean' },
          startupName: { type: 'string' },
          pitchSummary: { type: 'string' },
          fundingNeeded: { type: 'string' },
          industry: { type: 'string' },
          foundedYear: { type: 'integer', nullable: true },
          teamSize: { type: 'integer', nullable: true },
          investmentInterests: { type: 'array', items: { type: 'string' } },
          investmentStage: { type: 'array', items: { type: 'string' } },
          portfolioCompanies: { type: 'array', items: { type: 'string' } },
          totalInvestments: { type: 'integer' },
          minimumInvestment: { type: 'string' },
          maximumInvestment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Meeting: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          host: { $ref: '#/components/schemas/User' },
          guest: { $ref: '#/components/schemas/User' },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
          date: { type: 'string', format: 'date-time' },
          durationMinutes: { type: 'integer', example: 60 },
          notes: { type: 'string' },
          roomLink: { type: 'string', example: '/meetings/room/abc123' },
          calendarEventId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          url: { type: 'string' },
          uploadedBy: { $ref: '#/components/schemas/User' },
          version: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['pending', 'signed', 'rejected'] },
          signatureImageUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string', description: 'User ID' },
          counterpartyUserId: { $ref: '#/components/schemas/User' },
          type: { type: 'string', enum: ['deposit', 'withdraw', 'transfer'] },
          provider: { type: 'string', enum: ['stripe', 'paypal'] },
          paymentMethod: { type: 'string', example: 'sandbox' },
          amount: { type: 'number', example: 500 },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
          reference: { type: 'string', example: 'DEPOSIT-1714300000000' },
          providerSessionId: { type: 'string' },
          note: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          msg: { type: 'string', example: 'Error description' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});

swaggerSpec.paths = {
  // ───── Health ─────
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      security: [],
      responses: {
        200: {
          description: 'Server is running',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean' },
                  database: { type: 'string', enum: ['connected', 'connecting'] },
                },
              },
            },
          },
        },
      },
    },
  },

  // ───── Auth ─────
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password', 'role'],
              properties: {
                name: { type: 'string', example: 'Jane Doe' },
                email: { type: 'string', format: 'email', example: 'jane@example.com' },
                password: { type: 'string', minLength: 8, example: 'secureP@ss1' },
                role: { type: 'string', enum: ['investor', 'entrepreneur'] },
                bio: { type: 'string' },
                location: { type: 'string' },
                preferences: { type: 'array', items: { type: 'string' } },
                startupName: { type: 'string', description: 'Entrepreneur only' },
                pitchSummary: { type: 'string', description: 'Entrepreneur only' },
                investmentInterests: { type: 'array', items: { type: 'string' }, description: 'Investor only' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate an existing user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Authenticated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/auth/profile': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user profile',
      responses: {
        200: { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Auth'],
      summary: 'Update authenticated user profile',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                bio: { type: 'string' },
                location: { type: 'string' },
                preferences: { type: 'array', items: { type: 'string' } },
                avatarUrl: { type: 'string', format: 'uri' },
                startupName: { type: 'string' },
                pitchSummary: { type: 'string' },
                investmentInterests: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Updated user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        404: { description: 'User not found' },
      },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Request a password reset token (mock — token returned in response)',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: { email: { type: 'string', format: 'email' } },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Reset token generated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  resetToken: { type: 'string', description: 'In production this would be sent via email' },
                },
              },
            },
          },
        },
        404: { description: 'Email not found' },
      },
    },
  },
  '/auth/reset-password': {
    post: {
      tags: ['Auth'],
      summary: 'Reset password using a valid token',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'password'],
              properties: {
                token: { type: 'string' },
                password: { type: 'string', minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Password reset successful' },
        400: { description: 'Invalid or expired token' },
      },
    },
  },
  '/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change password (authenticated)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string', minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Password updated' },
        400: { description: 'Current password incorrect' },
      },
    },
  },
  '/auth/2fa/request': {
    post: {
      tags: ['Auth'],
      summary: 'Generate a mock OTP for two-factor authentication',
      responses: {
        200: {
          description: 'OTP generated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  otpCode: { type: 'string', example: '482391' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/auth/2fa/verify': {
    post: {
      tags: ['Auth'],
      summary: 'Verify OTP and enable two-factor authentication',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['otpCode'],
              properties: { otpCode: { type: 'string', example: '482391' } },
            },
          },
        },
      },
      responses: {
        200: {
          description: '2FA enabled',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid or expired OTP' },
      },
    },
  },

  // ───── Users ─────
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'List users with optional role and search filters',
      parameters: [
        { in: 'query', name: 'role', schema: { type: 'string', enum: ['investor', 'entrepreneur'] }, description: 'Filter by role' },
        { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by name, bio, industry, startup name, or location' },
      ],
      responses: {
        200: {
          description: 'Users list',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
        },
      },
    },
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get a single user by ID',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'User found', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        404: { description: 'User not found' },
      },
    },
  },

  // ───── Meetings ─────
  '/meetings': {
    get: {
      tags: ['Meetings'],
      summary: 'Get all meetings for the authenticated user',
      responses: {
        200: {
          description: 'Meetings list sorted by date ascending',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Meeting' } } } },
        },
      },
    },
  },
  '/meetings/schedule': {
    post: {
      tags: ['Meetings'],
      summary: 'Schedule a new meeting (with conflict detection)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'date', 'guestId'],
              properties: {
                title: { type: 'string', example: 'Product demo' },
                date: { type: 'string', format: 'date-time' },
                guestId: { type: 'string', description: 'User ID of the guest' },
                durationMinutes: { type: 'integer', default: 60, minimum: 1, maximum: 480 },
                notes: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Meeting created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
        400: { description: 'Validation error or schedule conflict' },
        404: { description: 'Guest not found' },
      },
    },
  },
  '/meetings/{id}/status': {
    put: {
      tags: ['Meetings'],
      summary: 'Accept or reject a meeting',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: { status: { type: 'string', enum: ['accepted', 'rejected'] } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
        403: { description: 'Not a participant' },
        404: { description: 'Meeting not found' },
      },
    },
  },
  '/meetings/room/{roomId}': {
    get: {
      tags: ['Meetings'],
      summary: 'Get meeting details for a video call room',
      parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Room details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
        403: { description: 'Not a participant' },
        404: { description: 'Room not found' },
      },
    },
  },

  // ───── Documents ─────
  '/documents': {
    get: {
      tags: ['Documents'],
      summary: 'List all uploaded documents',
      responses: {
        200: {
          description: 'Documents list sorted by newest first',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Document' } } } },
        },
      },
    },
  },
  '/documents/upload': {
    post: {
      tags: ['Documents'],
      summary: 'Upload a document file (max 10 MB)',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['document'],
              properties: {
                document: { type: 'string', format: 'binary', description: 'PDF, image, Word, Excel, JSON, or plain text' },
                title: { type: 'string' },
                version: { type: 'integer', default: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Document uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Document' } } } },
        400: { description: 'Missing file or unsupported type' },
      },
    },
  },
  '/documents/{id}/sign': {
    post: {
      tags: ['Documents'],
      summary: 'Attach an e-signature image to a document',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['signature'],
              properties: {
                signature: { type: 'string', format: 'binary', description: 'PNG, JPEG, or SVG image' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Document signed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Document' } } } },
        400: { description: 'Invalid signature file' },
        404: { description: 'Document not found' },
      },
    },
  },

  // ───── Payments ─────
  '/payments/providers': {
    get: {
      tags: ['Payments'],
      summary: 'List available sandbox payment providers',
      responses: {
        200: {
          description: 'Provider list',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', enum: ['stripe', 'paypal'] },
                    label: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/payments/deposit': {
    post: {
      tags: ['Payments'],
      summary: 'Create a sandbox deposit transaction',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', minimum: 0.01, example: 500 },
                provider: { type: 'string', enum: ['stripe', 'paypal'], default: 'stripe' },
                requestedStatus: { type: 'string', enum: ['pending', 'completed', 'failed'], default: 'completed' },
                paymentMethod: { type: 'string', default: 'sandbox' },
                note: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Deposit created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
        400: { description: 'Invalid amount or provider' },
      },
    },
  },
  '/payments/withdraw': {
    post: {
      tags: ['Payments'],
      summary: 'Create a sandbox withdrawal transaction',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', minimum: 0.01 },
                provider: { type: 'string', enum: ['stripe', 'paypal'], default: 'stripe' },
                requestedStatus: { type: 'string', enum: ['pending', 'completed', 'failed'], default: 'completed' },
                note: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Withdrawal created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
        400: { description: 'Invalid amount or provider' },
      },
    },
  },
  '/payments/transfer': {
    post: {
      tags: ['Payments'],
      summary: 'Create a sandbox transfer to another user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount', 'recipientId'],
              properties: {
                amount: { type: 'number', minimum: 0.01 },
                recipientId: { type: 'string', description: 'User ID of the recipient' },
                provider: { type: 'string', enum: ['stripe', 'paypal'], default: 'stripe' },
                requestedStatus: { type: 'string', enum: ['pending', 'completed', 'failed'], default: 'completed' },
                note: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Transfer created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
        400: { description: 'Invalid input or self-transfer' },
        404: { description: 'Recipient not found' },
      },
    },
  },
  '/payments/history': {
    get: {
      tags: ['Payments'],
      summary: 'Get transaction history for the authenticated user',
      responses: {
        200: {
          description: 'Transaction history sorted newest first',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } } } },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
