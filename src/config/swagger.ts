import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { enirementVariables } from './environment';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'API documentation for my Express app',
      contact: {
        name: 'Raed Rdhaounia',
        email: 'raedrdhaounia@gmail.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${enirementVariables.serverConfig.PORT}/api/v1`,
        description: 'Local server',
      },
      {
        url: `${enirementVariables.serverConfig.DevelopmentServer}/api/v1`,
        description: 'development server',
      },
    ],
  },
  apis: [
    path.resolve(__dirname, '../modules/**/*.ts'),
    path.resolve(__dirname, '../modules/**/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger UI available at /api-docs');
};
