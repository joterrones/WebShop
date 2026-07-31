/**
 * Ejemplo de entradas PM2 para WebShop (API + Front).
 * Copia estos bloques a tu ecosystem.js y ajusta las rutas si hace falta.
 *
 * Arranque:
 *   pm2 start ecosystem.webshop.example.js
 *   # o fusiona los apps[] en tu ecosystem existente
 */
module.exports = {
  apps: [
    {
      name: 'ecomerce',
      cwd: '/proyecto/webshop/WebShop/node-ecommerce',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ecomerce_front',
      cwd: '/proyecto/webshop/WebShop/angular-ecommerce-main',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4900,
      },
    },
  ],
};
