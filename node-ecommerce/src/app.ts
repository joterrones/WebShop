import cors from 'cors';
import express from 'express';
import { env, publicDir } from './config/env';
import { errorHandler } from './middleware/error-handler';
import apiRoutes from './routes';

/** Permite uno o varios orígenes separados por coma en CORS_ORIGIN */
function corsOriginOption():
  | string
  | boolean
  | ((
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => void) {
  const allowed = env.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    return true;
  }

  if (allowed.length === 1) {
    return allowed[0];
  }

  return (origin, callback) => {
    // Peticiones same-origin / tools sin Origin
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: corsOriginOption(),
      credentials: true,
    }),
  );
  app.use(express.json());

  // Archivos estáticos: /images/...
  app.use('/images', express.static(`${publicDir}/images`));

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  return app;
}
