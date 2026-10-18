import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2`;

export type WhatsAppClickSource = 'package_inquiry' | 'package_booking' | 'navbar' | 'footer' | 'floating_button' | 'contact';

export function normalizeWhatsAppNumber(value: string | undefined | null): string {
  const digits = String(value || '').replace(/\D/g, '').replace(/^00/, '');
  return /^\d{8,15}$/.test(digits) ? digits : '';
}

export function buildWhatsAppUrl(number: string | undefined | null, message = ''): string {
  const normalized = normalizeWhatsAppNumber(number);
  if (!normalized) return '';
  const query = message.trim() ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${query}`;
}

export function recordGoogleEvent(name: string, params: Record<string, unknown> = {}) {
  if (window.gtag) {
    window.gtag('event', name, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params });
  }
}

export function recordWhatsAppClick(input: {
  source: WhatsAppClickSource;
  packageId?: string;
  packageTitle?: string;
}) {
  recordGoogleEvent('whatsapp_click', {
    click_source: input.source,
    package_id: input.packageId || undefined,
    package_title: input.packageTitle || undefined,
  });

  void fetch(`${BASE_URL}/public-events/whatsapp`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      source: input.source,
      package_id: input.packageId || '',
      package_title: input.packageTitle || '',
    }),
  }).catch(() => {
    // Click tracking must never block the WhatsApp journey.
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}
