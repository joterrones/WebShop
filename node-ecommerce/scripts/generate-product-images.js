const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'products');
fs.mkdirSync(dir, { recursive: true });

const products = [
  ['camiseta-futbol-pro', 'Camiseta Futbol', '#1e40af'],
  ['camiseta-running-pro', 'Camiseta Running', '#0f766e'],
  ['top-deportivo-gym', 'Top Gym', '#7c2d12'],
  ['traje-bano-competicion', 'Traje Bano', '#0369a1'],
  ['chaqueta-outdoor-impermeable', 'Chaqueta Outdoor', '#166534'],
  ['pantalon-deportivo-jogger', 'Pantalon Jogger', '#374151'],
  ['zapatillas-running-elite', 'Zapatillas Elite', '#b45309'],
  ['short-futbol-profesional', 'Short Futbol', '#1d4ed8'],
  ['guantes-gym', 'Guantes Gym', '#111827'],
  ['short-running-reflectivo', 'Short Running', '#4b5563'],
];

const colors2 = [
  '#64748b',
  '#94a3b8',
  '#78716c',
  '#0ea5e9',
  '#22c55e',
  '#a855f7',
  '#f97316',
  '#3b82f6',
  '#6b7280',
  '#14b8a6',
];

function svg(label, bg, variant) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="200" cy="160" r="70" fill="rgba(255,255,255,0.15)"/>
  <text x="200" y="175" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="bold">SportShop</text>
  <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="18">${label}</text>
  <text x="200" y="290" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial,sans-serif" font-size="14">Vista ${variant}</text>
</svg>`;
}

for (let i = 0; i < products.length; i++) {
  const [slug, label, bg] = products[i];
  fs.writeFileSync(path.join(dir, `${slug}-1.svg`), svg(label, bg, '1'));
  fs.writeFileSync(path.join(dir, `${slug}-2.svg`), svg(label, colors2[i], '2'));
}

console.log(`Generated ${products.length * 2} images in ${dir}`);
