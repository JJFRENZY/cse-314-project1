import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description: 'API for storing and retrieving contacts (BYU-Idaho project)'
    },
    servers: [
      { url: '/' }
    ]
  },
  apis: ['./routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerSpec, {
  explorer: true
});
