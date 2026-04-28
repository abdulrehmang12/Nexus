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
  },
  security: [{ bearerAuth: [] }],
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});

swaggerSpec.paths = {
  '/auth/register': {
    post: {
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password', 'role'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                role: { type: 'string', enum: ['investor', 'entrepreneur'] },
              },
            },
          },
        },
      },
      responses: { 201: { description: 'Created' } },
    },
  },
  '/auth/login': {
    post: {
      summary: 'Authenticate an existing user',
      responses: { 200: { description: 'Authenticated' } },
    },
  },
  '/auth/profile': {
    get: {
      summary: 'Get authenticated profile',
      responses: { 200: { description: 'Current user' } },
    },
    put: {
      summary: 'Update authenticated profile',
      responses: { 200: { description: 'Updated user' } },
    },
  },
  '/users': {
    get: {
      summary: 'List users',
      parameters: [
        { in: 'query', name: 'role', schema: { type: 'string' } },
        { in: 'query', name: 'search', schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'Users list' } },
    },
  },
  '/meetings': {
    get: {
      summary: 'Get meetings for the authenticated user',
      responses: { 200: { description: 'Meetings list' } },
    },
  },
  '/meetings/schedule': {
    post: {
      summary: 'Schedule a meeting',
      responses: { 201: { description: 'Meeting created' } },
    },
  },
  '/documents': {
    get: {
      summary: 'List uploaded documents',
      responses: { 200: { description: 'Documents list' } },
    },
  },
  '/payments/history': {
    get: {
      summary: 'Get payment history',
      responses: { 200: { description: 'Transaction history' } },
    },
  },
};

module.exports = swaggerSpec;
