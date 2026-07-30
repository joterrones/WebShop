import cors from 'cors';
import express from 'express';
import { env, publicDir } from './config/env';
import { errorHandler } from './middleware/error-handler';
import apiRoutes from './routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());

  // Archivos estáticos: http://localhost:3000/images/...
  app.use('/images', express.static(`${publicDir}/images`));

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  return app;
}
