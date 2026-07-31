import { Order, OrderItem } from '../models/order';

/** Datos de empresa para la proforma (alineados al formato ALABA Sport) */
export const ALABA_COMPANY = {
  name: 'ALABA SPORT PERÚ',
  tagline: 'CONFECCIÓN DE INDUMENTARIAS DEPORTIVAS | VISTIENDO ATLETAS',
  ruc: '10709890315',
  phone: '954 609 495',
  email: 'alabasport.peru@gmail.com',
  address: 'Urb. las Laderas de Pachacamac Mz. B Sector.C Lt.12',
  city: 'LIMA | PERÚ',
  bankAccount: '19401386942050',
  bankCci: '00219410138694205097',
  bankHolder: 'DANIEL GARIBAY CUARESMA',
  yape: '954 609 495',
  instagram: '@alabasport.perú',
  logoUrl: '/img/alaba-sport-logo.png',
};

function money(value: number): string {
  return `S/ ${Number(value).toFixed(2)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function itemDescription(item: OrderItem): string {
  const attrs = (item.attributes ?? [])
    .map((a) => a.value)
    .filter(Boolean)
    .join(' · ');
  const parts = [
    item.productName,
    item.description,
    `Talla ${item.talla}`,
    attrs,
  ].filter((p) => !!p && p.trim().length > 0);
  return parts.join(' — ');
}

function buildRows(order: Order): string {
  const items = order.items ?? [];
  const maxRows = Math.max(items.length, 6);
  let html = '';

  for (let i = 0; i < maxRows; i++) {
    const item = items[i];
    if (item) {
      html += `
        <tr>
          <td class="c-num">${i + 1}</td>
          <td class="c-desc">
            <strong>${escapeHtml(item.productName)}</strong>
            <div class="muted">${escapeHtml(item.description || '')}</div>
            <div class="muted">Talla: ${escapeHtml(item.talla)}</div>
          </td>
          <td>${escapeHtml(item.tipoTela || '—')}</td>
          <td class="c-qty">${item.quantity}</td>
          <td class="c-money">${money(item.unitPrice)}</td>
          <td class="c-money">${money(item.lineTotal)}</td>
        </tr>`;
    } else {
      html += `
        <tr class="empty-row">
          <td class="c-num">${i + 1}</td>
          <td></td><td></td><td></td><td></td><td></td>
        </tr>`;
    }
  }
  return html;
}

function buildDocumentHtml(order: Order, logoAbsoluteUrl: string): string {
  const c = ALABA_COMPANY;
  const code = order.orderNumber.replace(/\D/g, '').slice(-9) || order.orderNumber;
  const fecha = formatDate(order.createdAt);
  const subtotal = order.subtotal;
  const shipping = order.shippingCost ?? 0;
  const discount = order.discountTotal ?? 0;
  const igv = 0;
  const total = order.total;
  const dni =
    order.documentType === 'DNI' ? order.documentNumber : 'N/A';
  const ruc =
    order.documentType === 'RUC' ? order.documentNumber : 'N/A';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización ${escapeHtml(order.orderNumber)}</title>
  <style>
    :root {
      --red: #E30613;
      --black: #0a0a0a;
      --gray: #4b5563;
      --line: #d1d5db;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--black);
      background: #fff;
      font-size: 11px;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 14mm 12mm 12mm;
    }
    .top {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
      border-bottom: 3px solid var(--red);
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .brand {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .brand img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--red);
    }
    .brand h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0.16em;
      font-weight: 800;
    }
    .brand .sport {
      color: var(--red);
      font-style: italic;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 14px;
      margin-top: 2px;
    }
    .brand .tag {
      margin-top: 6px;
      font-size: 8px;
      letter-spacing: 0.08em;
      color: var(--gray);
      text-transform: uppercase;
      max-width: 260px;
      line-height: 1.35;
    }
    .company {
      text-align: right;
      font-size: 10px;
      line-height: 1.45;
      color: var(--gray);
    }
    .company strong { color: var(--black); }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .box {
      border: 1px solid var(--line);
      border-top: 3px solid var(--red);
      padding: 10px 12px;
    }
    .box h2 {
      margin: 0 0 8px;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--red);
    }
    .box p { margin: 0 0 4px; }
    .box .label { color: var(--gray); }
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    table.items th {
      background: var(--black);
      color: #fff;
      padding: 7px 6px;
      text-align: left;
      font-size: 10px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    table.items th:first-child { background: var(--red); width: 36px; text-align: center; }
    table.items td {
      border: 1px solid var(--line);
      padding: 7px 6px;
      vertical-align: top;
      min-height: 28px;
    }
    table.items tr.empty-row td { height: 28px; }
    .c-num { text-align: center; font-weight: 700; width: 36px; }
    .c-qty { text-align: center; width: 70px; }
    .c-money { text-align: right; white-space: nowrap; width: 90px; }
    .muted { color: var(--gray); font-size: 10px; margin-top: 2px; }
    .note-bar {
      background: #111;
      color: #fff;
      padding: 7px 10px;
      font-size: 9px;
      letter-spacing: 0.03em;
      margin-bottom: 10px;
    }
    .note-bar span { color: var(--red); font-weight: 700; }
    .totals {
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .checks {
      border: 1px solid var(--line);
      padding: 10px;
      color: var(--gray);
      font-size: 10px;
    }
    .checks label { display: inline-block; margin-right: 14px; }
    .sum table { width: 100%; border-collapse: collapse; }
    .sum td { padding: 5px 6px; border: 1px solid var(--line); }
    .sum td:last-child { text-align: right; font-weight: 700; }
    .sum tr.total td {
      background: var(--black);
      color: #fff;
      border-color: var(--black);
    }
    .sum tr.total td:first-child { border-left: 4px solid var(--red); }
    .banks {
      border: 1px solid var(--line);
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .banks h3 {
      margin: 0 0 6px;
      font-size: 11px;
      color: var(--red);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .banks ul { margin: 0; padding-left: 16px; }
    .banks li { margin-bottom: 3px; }
    .terms {
      font-size: 9px;
      color: var(--gray);
      line-height: 1.45;
      border-top: 1px solid var(--line);
      padding-top: 8px;
    }
    .actions {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 10px 12px;
      background: #111;
    }
    .actions button {
      border: 0;
      cursor: pointer;
      padding: 8px 14px;
      font-weight: 700;
      border-radius: 4px;
    }
    .actions .print { background: var(--red); color: #fff; }
    .actions .close { background: #fff; color: #111; }
    @media print {
      .actions { display: none !important; }
      .page { width: auto; min-height: auto; padding: 0; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button class="print" onclick="window.print()">Imprimir / Guardar PDF</button>
    <button class="close" onclick="window.close()">Cerrar</button>
  </div>
  <div class="page">
    <div class="top">
      <div class="brand">
        <img src="${escapeHtml(logoAbsoluteUrl)}" alt="ALABA Sport" />
        <div>
          <h1>ALABA</h1>
          <div class="sport">Sport</div>
          <div class="tag">${escapeHtml(c.tagline)}</div>
        </div>
      </div>
      <div class="company">
        <strong>${escapeHtml(c.name)}</strong><br/>
        RUC: ${escapeHtml(c.ruc)}<br/>
        CELULAR: ${escapeHtml(c.phone)}<br/>
        ${escapeHtml(c.email)}<br/>
        ${escapeHtml(c.address)}<br/>
        ${escapeHtml(c.city)}
      </div>
    </div>

    <div class="meta">
      <div class="box">
        <h2>Datos del cliente | Empresa</h2>
        <p><span class="label">NOMBRE:</span> <strong>${escapeHtml(order.clientName)}</strong></p>
        <p><span class="label">NÚMERO:</span> ${escapeHtml(order.phoneNumber)}</p>
        <p><span class="label">PROVINCIA/PAÍS:</span> ${escapeHtml(order.province)}, ${escapeHtml(order.country)}</p>
        <p><span class="label">DIRECCIÓN:</span> ${escapeHtml(order.shippingAddress)}</p>
        <p><span class="label">Nº DNI:</span> ${escapeHtml(dni)}</p>
        <p><span class="label">RUC:</span> ${escapeHtml(ruc)}</p>
      </div>
      <div class="box">
        <h2>Proforma</h2>
        <p><span class="label">CÓDIGO:</span> <strong>${escapeHtml(code)}</strong></p>
        <p><span class="label">PEDIDO:</span> ${escapeHtml(order.orderNumber)}</p>
        <p><span class="label">FECHA:</span> ${fecha}</p>
        <p><span class="label">ESTADO:</span> ${escapeHtml(order.status)}</p>
        ${order.notes ? `<p><span class="label">NOTAS:</span> ${escapeHtml(order.notes)}</p>` : ''}
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>#</th>
          <th>Descripción</th>
          <th>Tela</th>
          <th>Unidades</th>
          <th>P.V.</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${buildRows(order)}
      </tbody>
    </table>

    <div class="note-bar">
      ESTA PROFORMA NO INCLUYE IGV · ENVÍO: ${money(shipping)}
      ${discount > 0 ? ` · DESCUENTO: ${money(discount)}` : ''}
      · <span>TALLA “XL” SE ADICIONA + S/ 5.00</span>
    </div>

    <div class="totals">
      <div class="checks">
        <label>□ SIN MEDIAS</label>
        <label>□ MEDIAS CORTAS</label>
        <label>□ MEDIAS LARGAS</label>
      </div>
      <div class="sum">
        <table>
          <tr><td>SUB TOTAL</td><td>${money(subtotal)}</td></tr>
          <tr><td>IGV 18%</td><td>${money(igv)}</td></tr>
          <tr><td>ENVÍO</td><td>${money(shipping)}</td></tr>
          ${discount > 0 ? `<tr><td>DESCUENTO</td><td>- ${money(discount)}</td></tr>` : ''}
          <tr class="total"><td>TOTAL</td><td>${money(total)}</td></tr>
        </table>
      </div>
    </div>

    <div class="banks">
      <h3>Cuentas bancarias</h3>
      <ul>
        <li>Nº CUENTA BCP SOLES: <strong>${escapeHtml(c.bankAccount)}</strong></li>
        <li>Nº CUENTA BCP INTERBANCARIA: <strong>${escapeHtml(c.bankCci)}</strong></li>
        <li>TITULAR: ${escapeHtml(c.bankHolder)}</li>
        <li>Nº YAPE: <strong>${escapeHtml(c.yape)}</strong> · TITULAR: ${escapeHtml(c.bankHolder)}</li>
        <li>CORREO: ${escapeHtml(c.email)} · ${escapeHtml(c.instagram)}</li>
      </ul>
    </div>

    <div class="terms">
      <strong>Nota:</strong> Para la confirmación de esta proforma se tendrá que realizar el pago del 50% para iniciar con la confección y la programación de su orden; el otro 50% se cancelará antes de realizarse la entrega el mismo día pactado, una vez se le haya enviado imágenes de los uniformes personalizados.
      La penalidad por cancelación de contrato es de S/ 50.00 soles, una vez se haya confirmado y programado el pedido con el adelanto del 50%.
    </div>
  </div>
</body>
</html>`;
}

/** Abre la cotización en una ventana lista para imprimir / guardar PDF */
export function openOrderQuotation(order: Order): void {
  const logoAbsoluteUrl = new URL(
    ALABA_COMPANY.logoUrl,
    window.location.origin,
  ).href;
  const html = buildDocumentHtml(order, logoAbsoluteUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error(
      'No se pudo abrir la ventana de cotización. Permite ventanas emergentes en el navegador.',
    );
  }

  // Liberar el blob cuando la ventana ya cargó
  win.addEventListener(
    'load',
    () => {
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    },
    { once: true },
  );
}
