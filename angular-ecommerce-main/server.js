/**
 * Servidor estático para producción (PM2 / Node).
 * Sirve el build de Angular y soporta rutas SPA.
 *
 * Uso:
 *   npm run build
 *   npm run start:prod
 *   # o: PORT=4900 node server.js
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT || process.env.ANGULAR_PORT || 4900);
const HOST = process.env.HOST || '0.0.0.0';

const distCandidates = [
  path.join(__dirname, 'dist', 'amazon-frontend', 'browser'),
  path.join(__dirname, 'dist', 'amazon-frontend'),
];

const distPath = distCandidates.find((p) =>
  fs.existsSync(path.join(p, 'index.html')),
);

if (!distPath) {
  console.error(
    '\n❌ No se encontró el build de Angular.\n' +
      '   Ejecuta primero:\n' +
      '   npm run build\n' +
      '   (desde angular-ecommerce-main)\n',
  );
  process.exit(1);
}

app.use(express.static(distPath, { index: false, maxAge: '1h' }));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`WebShop front escuchando en http://${HOST}:${PORT}`);
  console.log(`Estáticos: ${distPath}`);
});
