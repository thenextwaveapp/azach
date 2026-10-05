/**
 * Shared Resend email helper for AZACH edge functions.
 */

const SITE_URL = 'https://azach.ng';
const FROM_ORDERS = 'AZACH <info@azach.ng>';
const FROM_SUPPORT = 'AZACH <info@azach.ng>';
const OPS_EMAIL = 'info@azach.ng';

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  listUnsubscribe?: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured — skipping email send:', opts.subject);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from || FROM_ORDERS,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
      // Marketing-style sends (welcome/discount codes) benefit from a text alternative and an
      // unsubscribe header — spam filters weigh HTML-only, no-unsubscribe promo mail heavily,
      // even when the sending domain's SPF/DKIM/DMARC checks out for transactional mail.
      headers: opts.listUnsubscribe ? { 'List-Unsubscribe': opts.listUnsubscribe } : undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend send failed:', res.status, errText);
  }
}

export function formatMoney(amount: number, currency = 'NGN'): string {
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const BRAND_BG = '#f5f1ea';
const BRAND_DARK = '#141414';
const BRAND_ACCENT = '#a97c50';
const CARD_BG = '#f8f6f2';

const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://www.instagram.com/azachng', icon: `${SITE_URL}/instagram.png` },
  { name: 'TikTok', url: 'https://www.tiktok.com/@azachng', icon: `${SITE_URL}/tiktok.png` },
  { name: 'X', url: 'https://x.com/azachng?s=11', icon: `${SITE_URL}/x.png` },
  { name: 'Facebook', url: 'https://www.facebook.com/share/18yazwSQ52/?mibextid=wwXIfr', icon: `${SITE_URL}/facebook.png` },
];

function layout(opts: { preheader?: string; topLabel: string; body: string }): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 480px) {
      .stack-col { display: block !important; width: 100% !important; padding-right: 0 !important; margin-bottom: 16px; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:'Jost',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND_DARK};">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">
        <tr>
          <td style="padding:16px 32px 0 32px;">
            <table role="presentation" width="100%"><tr>
              <td style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;">${opts.topLabel}</td>
              <td align="right" style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;">View In Browser</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 20px 32px;text-align:center;">
            <img src="${SITE_URL}/Azach-Logo.png" alt="AZACH" height="24" style="height:24px;" />
            <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-top:8px;">Built From What Was. Designed For What's Next.</div>
          </td>
        </tr>
        <tr>
          <td><img src="${SITE_URL}/email/header-banner.jpg" width="600" alt="AZACH" style="width:100%;max-width:600px;display:block;" /></td>
        </tr>
        <tr><td style="padding:32px 32px 8px 32px;">${opts.body}</td></tr>
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #eee;">
            <table role="presentation" width="100%"><tr>
              <td width="50%" style="font-size:13px;">Need Help?<br><span style="color:#999;font-size:12px;">We're here for you.</span></td>
              <td width="50%" style="font-size:13px;">Email Us<br><a href="mailto:info@azach.ng" style="color:${BRAND_ACCENT};font-size:12px;">info@azach.ng</a></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND_DARK};padding:28px 32px;">
            <table role="presentation" width="100%"><tr>
              <td valign="top">
                <img src="${SITE_URL}/email/logo-white.png" alt="AZACH" height="20" style="height:20px;display:block;" />
                <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${BRAND_ACCENT};margin-top:8px;">Resourcefulness Is Power.</div>
              </td>
              <td valign="top" align="right">
                <div style="font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:10px;">Stay Connected</div>
                ${SOCIAL_LINKS.map((s) => `<a href="${s.url}" style="margin-left:8px;"><img src="${s.icon}" alt="${s.name}" width="20" height="20" style="width:20px;height:20px;border-radius:50%;display:inline-block;" /></a>`).join('')}
              </td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function sectionLabel(text: string, marginTop = 28): string {
  return `<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:${marginTop}px 0 12px 0;">${text}</div>`;
}

function iconCircle(icon: string, size = 40): string {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${CARD_BG};text-align:center;line-height:${size}px;font-size:${Math.round(size * 0.42)}px;margin:0 auto;">${icon}</div>`;
}

// Two side-by-side blocks that stack on narrow (mobile) screens.
function twoCol(leftHtml: string, rightHtml: string, leftWidthPct = 62): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td class="stack-col" width="${leftWidthPct}%" valign="top" style="padding-right:20px;">${leftHtml}</td>
    <td class="stack-col" width="${100 - leftWidthPct}%" valign="top">${rightHtml}</td>
  </tr></table>`;
}

function threeIconRow(items: { icon: string; title: string; desc: string }[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${items
      .map(
        (it) => `
      <td align="center" valign="top" style="width:${100 / items.length}%;padding:0 8px;">
        ${iconCircle(it.icon)}
        <div style="margin-top:10px;font-weight:bold;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${BRAND_DARK};">${it.title}</div>
        <div style="margin-top:4px;font-size:11px;color:#888;">${it.desc}</div>
      </td>`
      )
      .join('')}
  </tr></table>`;
}

function stepTracker(steps: { icon: string; label: string }[]): string {
  const cells = steps
    .map(
      (s, i) => `
    <td align="center" style="font-size:10px;color:#666;">
      ${iconCircle(s.icon, 32)}
      <div style="margin-top:6px;white-space:nowrap;">${s.label}</div>
    </td>
    ${i < steps.length - 1 ? `<td style="width:16px;"><div style="height:1px;background:#ddd;"></div></td>` : ''}`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;"><tr>${cells}</tr></table>`;
}

function dhlBadge(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:10px;"><img src="${SITE_URL}/email/dhl-emblem.png" alt="DHL" height="20" style="height:20px;display:block;" /></td>
    <td style="font-size:11px;color:#999;">Shipping Partner<br><strong style="color:${BRAND_DARK};font-size:12px;">DHL Express</strong></td>
  </tr></table>`;
}

function estimateCard(days: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:6px;"><tr><td style="padding:18px;text-align:center;">
    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Estimated Shipping</div>
    <div style="font-size:26px;margin:8px 0;color:${BRAND_DARK};">${days}</div>
    <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;margin-bottom:12px;">Business Days</div>
    ${dhlBadge()}
  </td></tr></table>`;
}

function boxNoteSection(paragraphs: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:${CARD_BG};border-radius:6px;"><tr>
    <td width="140" style="padding:16px;"><img src="${SITE_URL}/email/box-mockup.png" width="120" alt="AZACH packaging" style="width:120px;display:block;border-radius:4px;" /></td>
    <td style="padding:16px 16px 16px 0;font-size:13px;color:#555;vertical-align:middle;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;margin-bottom:8px;">A Note From Us</div>
      ${paragraphs.map((p) => `<p style="margin:0 0 8px 0;">${p}</p>`).join('')}
    </td>
  </tr></table>`;
}

function actionChecklist(items: string[]): string {
  const mid = Math.ceil(items.length / 2);
  const col = (arr: string[]) => arr.map((i) => `<div style="padding:4px 0;font-size:13px;color:#444;">&#9744;&nbsp; ${i}</div>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td class="stack-col" width="50%" valign="top">${col(items.slice(0, mid))}</td>
    <td class="stack-col" width="50%" valign="top">${col(items.slice(mid))}</td>
  </tr></table>`;
}

function sideInfoCard(opts: { icon: string; title: string; subtitle: string; rows: { label: string; value: string }[]; note?: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:6px;"><tr><td style="padding:20px;text-align:center;">
    ${iconCircle(opts.icon, 36)}
    <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;margin-top:10px;">${opts.title}</div>
    <div style="font-size:13px;color:${BRAND_DARK};margin-top:2px;">${opts.subtitle}</div>
    <div style="border-top:1px solid #e5e0d8;margin:14px 0;"></div>
    ${opts.rows
      .map(
        (r) =>
          `<div style="font-size:10px;letter-spacing:0.5px;text-transform:uppercase;color:#999;margin-bottom:2px;">${r.label}</div><div style="font-size:12px;color:${BRAND_DARK};margin-bottom:10px;word-break:break-all;">${r.value}</div>`
      )
      .join('')}
    ${opts.note ? `<div style="font-size:11px;color:#888;">${opts.note}</div>` : ''}
  </td></tr></table>`;
}

function itemsTable(items: Array<{ name: string; variant?: string; qty: number; price: number; currency: string; image?: string }>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
    ${items
      .map(
        (item) => `
      <tr>
        ${item.image ? `<td style="padding:10px 10px 10px 0;border-bottom:1px solid #eee;width:44px;"><img src="${item.image}" width="40" height="40" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:4px;display:block;" /></td>` : ''}
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:bold;font-size:13px;">${item.name}</div>
          ${item.variant ? `<div style="font-size:12px;color:#777;">${item.variant}</div>` : ''}
          <div style="font-size:12px;color:#777;">Qty: ${item.qty}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;font-size:13px;">
          ${formatMoney(item.price * item.qty, item.currency)}
        </td>
      </tr>`
      )
      .join('')}
  </table>`;
}

function totalsTable(totals: { subtotal: number; shipping: number; tax: number; total: number; currency: string }): string {
  const row = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-size:${bold ? '15px' : '13px'};${bold ? 'font-weight:bold;' : 'color:#555;'}">${label}</td>
      <td style="padding:4px 0;text-align:right;font-size:${bold ? '15px' : '13px'};${bold ? 'font-weight:bold;' : 'color:#555;'}">${value}</td>
    </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row('Subtotal', formatMoney(totals.subtotal, totals.currency))}
    ${row('Shipping', formatMoney(totals.shipping, totals.currency))}
    ${row('Tax', formatMoney(totals.tax, totals.currency))}
    <tr><td colspan="2" style="border-top:1px solid #ddd;padding-top:6px;"></td></tr>
    ${row('Total', formatMoney(totals.total, totals.currency), true)}
  </table>`;
}

function totalsCard(totals: { subtotal: number; shipping: number; tax: number; total: number; currency: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:6px;"><tr><td style="padding:16px;">
    ${totalsTable(totals)}
  </td></tr></table>`;
}

export type OrderEmailItem = { name: string; variant?: string; qty: number; price: number; image?: string };
export type OrderTotals = { subtotal: number; shipping: number; tax: number; total: number; currency: string };

export function orderConfirmationEmail(p: {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderEmailItem[];
  totals: OrderTotals;
}): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">You're Now Part of the Circle.</h1>
    ${twoCol(
      `
      <p>Hi ${p.customerName},</p>
      <p>Thank you for choosing AZACH.</p>
      <p>We've received your order and our team is preparing it for its next chapter.</p>
      <p>Every AZACH piece begins with existing material that has been carefully reconsidered, refined, and rebuilt for modern life.</p>
      <p>Your order is now being reviewed and prepared for shipment.</p>
      `,
      estimateCard('2 – 4')
    )}
    <table role="presentation" width="100%" style="margin:20px 0 4px 0;font-size:12px;color:#999;"><tr>
      <td>Order Number<br><strong style="color:${BRAND_DARK};">${p.orderNumber}</strong></td>
      <td align="right">Order Date<br><strong style="color:${BRAND_DARK};">${p.orderDate}</strong></td>
    </tr></table>
    ${sectionLabel('Order Summary')}
    ${twoCol(itemsTable(p.items.map((i) => ({ ...i, currency: p.totals.currency }))), totalsCard(p.totals), 60)}
    ${sectionLabel('What Happens Next?')}
    ${stepTracker([
      { icon: '&#10003;', label: 'Order Confirmed' },
      { icon: '&#128269;', label: 'Quality Inspection' },
      { icon: '&#128230;', label: 'Packaging & Prep' },
      { icon: '&#128666;', label: 'DHL Collection' },
      { icon: '&#127968;', label: 'Delivery' },
    ])}
    ${boxNoteSection([
      'At AZACH, we believe nothing valuable is ever finished.',
      'Every piece we create begins with existing material and continues through the people who choose to wear it.',
      'Thank you for being part of that journey.',
      '<strong>Welcome to the Circle.</strong>',
    ])}
  `;
  return layout({ preheader: `Order ${p.orderNumber} confirmed`, topLabel: 'Order Confirmation', body });
}

export function shippingConfirmationEmail(p: {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery?: string;
  items: OrderEmailItem[];
  totals: OrderTotals;
}): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">Your AZACH Order Is On Its Way.</h1>
    ${twoCol(
      `
      <p>Hi ${p.customerName},</p>
      <p>Great news — your order has left our studio and is now on its way to you.</p>
      <p>We've handed your package over to DHL. Track your delivery below and get ready for the next chapter.</p>
      <p style="margin-top:16px;font-style:italic;color:${BRAND_ACCENT};">What works matters.</p>
      `,
      `<img src="${SITE_URL}/email/box-mockup.png" alt="AZACH packaging" style="width:100%;max-width:180px;display:block;margin:0 auto;border-radius:4px;" />`
    )}
    ${sectionLabel('Tracking Information')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:6px;"><tr><td style="padding:18px;">
      <table role="presentation" width="100%"><tr>
        <td valign="top" style="font-size:12px;color:#999;">Tracking Number<br><strong style="color:${BRAND_DARK};font-size:14px;">${p.trackingNumber}</strong><br><a href="${p.trackingUrl}" style="color:${BRAND_ACCENT};font-size:12px;">Track with DHL &rarr;</a></td>
        <td valign="top">${dhlBadge()}${p.estimatedDelivery ? `<div style="font-size:11px;color:#999;margin-top:10px;">Estimated Delivery<br><strong style="color:${BRAND_DARK};font-size:12px;">${p.estimatedDelivery}</strong></div>` : ''}</td>
      </tr></table>
    </td></tr></table>
    ${sectionLabel(`Order Summary — ${p.orderNumber}`)}
    ${twoCol(itemsTable(p.items.map((i) => ({ ...i, currency: p.totals.currency }))), totalsCard(p.totals), 60)}
    ${sectionLabel('What Happens Next?')}
    ${stepTracker([
      { icon: '&#128230;', label: 'Shipped' },
      { icon: '&#128666;', label: 'In Transit' },
      { icon: '&#128205;', label: 'Out for Delivery' },
      { icon: '&#127968;', label: 'Delivered' },
    ])}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:${CARD_BG};border-radius:6px;"><tr><td style="padding:20px;">
      <div style="font-size:15px;margin-bottom:8px;">Built from what was. Made for what's next.</div>
      <div style="font-size:13px;color:#666;">Every piece we create begins with existing material and continues through the people who choose to wear it. Thank you for supporting resourceful design and being part of the Circle.</div>
    </td></tr></table>
  `;
  return layout({ preheader: `Order ${p.orderNumber} has shipped`, topLabel: 'Shipping Confirmation', body });
}

export function internalNewOrderEmail(p: {
  orderNumber: string;
  orderDate: string;
  customer: { name: string; email: string; phone?: string; country?: string };
  shippingAddress: string;
  items: OrderEmailItem[];
  totals: OrderTotals;
}): string {
  const body = `
    <div style="color:${BRAND_ACCENT};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Operations Alert</div>
    <h1 style="font-size:24px;font-weight:normal;margin:4px 0 12px 0;">New Order Received</h1>
    <p style="font-size:13px;color:#666;margin:0 0 16px 0;">A new order has been placed on the AZACH website. Please review and begin fulfillment.</p>
    <table role="presentation" width="100%" style="margin-bottom:16px;font-size:13px;">
      <tr>
        <td>Order Number<br><strong style="color:${BRAND_DARK};">${p.orderNumber}</strong></td>
        <td align="right">Order Date<br><strong style="color:${BRAND_DARK};">${p.orderDate}</strong></td>
      </tr>
    </table>
    ${twoCol(
      `
      ${sectionLabel('Customer Details', 0)}
      <div style="font-size:13px;color:#444;line-height:1.7;">
        Name: ${p.customer.name}<br>
        Email: ${p.customer.email}<br>
        ${p.customer.phone ? `Phone: ${p.customer.phone}<br>` : ''}
        ${p.customer.country ? `Country: ${p.customer.country}` : ''}
      </div>
      `,
      `
      ${sectionLabel('Shipping Address', 0)}
      <div style="font-size:13px;color:#444;line-height:1.7;">${p.shippingAddress}</div>
      `,
      50
    )}
    ${sectionLabel('Order Summary')}
    ${itemsTable(p.items.map((i) => ({ ...i, currency: p.totals.currency })))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;background:${CARD_BG};border-radius:6px;"><tr><td style="padding:14px 18px;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;">Order Total</div>
      <div style="font-size:22px;color:${BRAND_ACCENT};margin-top:2px;">${formatMoney(p.totals.total, p.totals.currency)}</div>
    </td></tr></table>
    ${sectionLabel('Action Required')}
    ${actionChecklist([
      'Verify payment',
      'Confirm inventory availability',
      'Conduct quality inspection',
      'Prepare packaging',
      'Generate DHL shipment',
      'Upload tracking number & mark as fulfilled',
    ])}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>
      <td class="stack-col" width="50%" valign="top" style="padding-right:10px;">
        ${dhlBadge()}
        <div style="font-size:11px;color:#999;margin-top:10px;">Target Dispatch<br><strong style="color:${BRAND_DARK};">Within 2 – 4 business days</strong></div>
      </td>
      <td class="stack-col" width="50%" valign="top" style="font-size:12px;color:#666;">
        Every AZACH order is a reflection of our craft, our values and the people who believe in what we build.<br><strong>Handle with care. Deliver with intention.</strong>
      </td>
    </tr></table>
  `;
  return layout({ preheader: `New order ${p.orderNumber}`, topLabel: 'Operations Alert', body });
}

export function abandonedCartEmail(p: {
  items: Array<{ name: string; qty: number; price: number; image?: string }>;
  currency: string;
  checkoutUrl: string;
}): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">You Left Something Behind.</h1>
    <p>Your cart is still here, waiting for you — but the pieces you picked won't stay in stock forever.</p>
    ${sectionLabel('Your Cart')}
    ${itemsTable(p.items.map((i) => ({ ...i, currency: p.currency })))}
    <p style="margin-top:24px;"><a href="${p.checkoutUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#fff;padding:12px 24px;text-decoration:none;border-radius:2px;font-size:13px;">Complete Your Order</a></p>
    ${boxNoteSection([
      'Every AZACH piece begins with existing material, reconsidered and rebuilt into something new.',
      "The ones in your cart won't wait — come finish what you started.",
    ])}
  `;
  return layout({ preheader: 'Your cart is waiting for you', topLabel: 'Cart Reminder', body });
}

export function welcomeDiscountEmail(p: { email: string; code: string; percentOff: number }): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">Welcome to the Circle.</h1>
    <p>Thank you for joining the AZACH community.</p>
    <p>Every AZACH piece begins with existing material — reclaimed denim and reconsidered textiles — rebuilt into something new. As a subscriber, you'll be first to hear about new drops, restocks, and stories from the studio.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:${CARD_BG};border-radius:6px;"><tr><td style="padding:20px;text-align:center;">
      <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Your Discount Code</div>
      <div style="font-size:28px;letter-spacing:3px;font-weight:bold;color:${BRAND_DARK};margin:8px 0;">${p.code}</div>
      <div style="font-size:12px;color:#666;">${p.percentOff}% off your first order — enter this code at checkout.</div>
    </td></tr></table>
    <p style="margin-top:20px;"><a href="${SITE_URL}" style="display:inline-block;background:${BRAND_ACCENT};color:#fff;padding:12px 24px;text-decoration:none;border-radius:2px;font-size:13px;">Shop AZACH</a></p>
    ${boxNoteSection([
      'At AZACH, every piece begins long before it reaches your wardrobe.',
      'It begins with materials carefully reconsidered, refined, and rebuilt into something new.',
      '<strong>Welcome to the Circle.</strong>',
    ])}
  `;
  return layout({ preheader: `Here's your ${p.percentOff}% off code`, topLabel: 'Welcome', body });
}

export function welcomeEmail(p: { email: string }): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">Welcome to the Circle.</h1>
    <p>Thank you for joining the AZACH community.</p>
    <p>Every AZACH piece begins with existing material — reclaimed denim and reconsidered textiles — rebuilt into something new. As a subscriber, you'll be first to hear about new drops, restocks, and stories from the studio.</p>
    <p style="margin-top:20px;"><a href="${SITE_URL}" style="display:inline-block;background:${BRAND_ACCENT};color:#fff;padding:12px 24px;text-decoration:none;border-radius:2px;font-size:13px;">Shop AZACH</a></p>
    ${boxNoteSection([
      'At AZACH, every piece begins long before it reaches your wardrobe.',
      'It begins with materials carefully reconsidered, refined, and rebuilt into something new.',
      '<strong>Welcome to the Circle.</strong>',
    ])}
  `;
  return layout({ preheader: 'Welcome to AZACH', topLabel: 'Welcome', body });
}

export function accountCreatedEmail(p: { customerName: string; email: string; setPasswordUrl: string }): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">Welcome to the Circle.</h1>
    ${twoCol(
      `
      <p>Hi ${p.customerName},</p>
      <p>Your AZACH account has been created using the email address associated with your order.</p>
      <p>Having an account lets you follow every stage of your journey with us — from your first purchase to future collections inspired by resourcefulness and craftsmanship.</p>
      <p>Set your password below to access your account.</p>
      <p style="margin-top:20px;"><a href="${p.setPasswordUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#fff;padding:12px 24px;text-decoration:none;border-radius:2px;font-size:13px;">Set Your Password</a></p>
      <p style="margin-top:14px;font-size:11px;color:#999;">For your security, this link can only be used once and will expire after a limited time.</p>
      `,
      sideInfoCard({
        icon: '&#128100;',
        title: 'Account Created',
        subtitle: "You're all set.",
        rows: [{ label: 'Email Address', value: p.email }],
        note: 'Thank you for being part of our journey.',
      })
    )}
    ${sectionLabel('Why Create An Account?')}
    ${threeIconRow([
      { icon: '&#128274;', title: 'Secure Access', desc: 'Manage your details and sign in safely anytime.' },
      { icon: '&#128230;', title: 'Track Every Order', desc: 'Follow your pieces from preparation to delivery.' },
      { icon: '&#10022;', title: 'Exclusive Access', desc: 'Be first to discover new collections, limited releases and community experiences.' },
    ])}
    ${sectionLabel('Your Journey Starts Here')}
    ${stepTracker([
      { icon: '&#10003;', label: 'Account Created' },
      { icon: '&#128274;', label: 'Password Set' },
      { icon: '&#128717;', label: 'Explore Collections' },
      { icon: '&#128666;', label: 'Place Your Next Order' },
      { icon: '&#128101;', label: 'Become Part of the Circle' },
    ])}
    ${boxNoteSection([
      'At AZACH, every piece begins long before it reaches your wardrobe.',
      'It begins with materials carefully reconsidered, refined, and rebuilt into something new.',
      'Creating your account is simply the beginning of that journey.',
      '<strong>Welcome to the Circle.</strong>',
    ])}
  `;
  return layout({ preheader: 'Set your AZACH account password', topLabel: 'Account Created', body });
}

export type EnquiryField = { label: string; value: string };

function fieldsTable(fields: EnquiryField[]): string {
  if (fields.length === 0) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${CARD_BG};border-radius:6px;">
    ${fields
      .map(
        (f) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;width:35%;">${f.label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:14px;color:#333;white-space:pre-wrap;">${f.value}</td>
      </tr>`
      )
      .join('')}
  </table>`;
}

function attachmentsSection(urls?: string[]): string {
  if (!urls || urls.length === 0) return '';
  return `
    ${sectionLabel('Attached Images')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">
      <tr>
        ${urls
          .map(
            (url) => `
        <td style="padding:4px;">
          <a href="${url}"><img src="${url}" alt="Attachment" width="150" style="width:150px;height:150px;object-fit:cover;border-radius:4px;display:block;" /></a>
        </td>`
          )
          .join('')}
      </tr>
    </table>`;
}

export function enquiryConfirmationEmail(p: { name: string; formLabel: string; fields?: EnquiryField[]; attachments?: string[] }): string {
  const body = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px 0;">We've Got Your Message.</h1>
    <p>Hi ${p.name},</p>
    <p>Thank you for reaching out through our ${p.formLabel}. Our team has received your enquiry and we'll get back to you.</p>
    ${p.fields && p.fields.length > 0 ? `${sectionLabel('What You Submitted')}${fieldsTable(p.fields)}` : ''}
    ${attachmentsSection(p.attachments)}
    <p style="margin-top:24px;">In the meantime, feel free to browse the latest at AZACH.</p>
  `;
  return layout({ preheader: 'We received your enquiry', topLabel: 'Enquiry Received', body });
}

export function internalEnquiryEmail(p: {
  formLabel: string;
  name: string;
  email: string;
  phone?: string;
  fields: EnquiryField[];
  attachments?: string[];
}): string {
  const body = `
    <div style="color:${BRAND_ACCENT};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Operations Alert</div>
    <h1 style="font-size:24px;font-weight:normal;margin:4px 0 16px 0;">New ${p.formLabel} Submission</h1>
    ${sectionLabel('Submitted By')}
    <table role="presentation" width="100%" style="margin:8px 0 16px 0;font-size:13px;">
      <tr>
        <td>Name: ${p.name}<br>Email: ${p.email}${p.phone ? `<br>Phone: ${p.phone}` : ''}</td>
      </tr>
    </table>
    ${sectionLabel('Submission Details')}
    ${fieldsTable(p.fields)}
    ${attachmentsSection(p.attachments)}
    <p style="margin-top:24px;font-size:13px;">Please follow up with the customer directly.</p>
  `;
  return layout({ preheader: `New ${p.formLabel} submission from ${p.name}`, topLabel: 'Operations Alert', body });
}

export { OPS_EMAIL, FROM_ORDERS, FROM_SUPPORT, SITE_URL };
