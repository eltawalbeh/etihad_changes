import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface InquiryPayload {
  source: 'contact' | 'service' | 'package_booking';
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  package_id?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<string> {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) throw new Error(result.error || 'Unable to submit your request');
  return String(result.reference || '');
}
