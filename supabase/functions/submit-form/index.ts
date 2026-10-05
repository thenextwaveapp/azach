/**
 * Handles Contact, Bespoke (custom request), and Rework (RRS) form submissions.
 * Persists the submission, emails the customer a confirmation, and alerts the AZACH team.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { sendEmail, enquiryConfirmationEmail, internalEnquiryEmail, OPS_EMAIL, type EnquiryField } from '../_shared/email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FORM_LABELS: Record<string, string> = {
  contact: 'Contact form',
  bespoke: 'Custom Request form',
  rework: 'Rework & Repair (RRS) form',
};

// Ordered list of (detailsKey, label) pairs per form type — controls what shows in the email and in what order.
const FORM_FIELD_LABELS: Record<string, Array<[string, string]>> = {
  contact: [
    ['subject', 'Subject'],
    ['message', 'Message'],
  ],
  bespoke: [
    ['emailOrWhatsApp', 'Email / WhatsApp'],
    ['whatToCreate', 'What to Create'],
    ['ideaDescription', 'Idea Description'],
    ['silhouetteType', 'Silhouette'],
    ['location', 'Location'],
  ],
  rework: [
    ['serviceType', 'Service Type'],
    ['pieceType', 'Piece Type'],
    ['workDescription', 'Work Description'],
    ['location', 'Location'],
  ],
};

function humanize(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildFields(formType: string, details: Record<string, unknown>): EnquiryField[] {
  const labels = FORM_FIELD_LABELS[formType] || [];
  const fields: EnquiryField[] = [];

  for (const [key, label] of labels) {
    const raw = details?.[key];

    if (raw === undefined || raw === null || raw === '') continue;

    const value = String(raw);
    const looksLikeSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
    fields.push({ label, value: looksLikeSlug ? humanize(value) : value });
  }

  return fields;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { formType, fullName, email, phone, details } = await req.json();

    if (!formType || !FORM_LABELS[formType] || !fullName || !email) {
      return new Response(
        JSON.stringify({ error: 'formType, fullName, and email are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await supabase.from('form_submissions').insert({
      form_type: formType,
      full_name: fullName,
      email,
      phone: phone || null,
      details: details || {},
    });

    if (insertError) {
      console.error('Error inserting form submission:', insertError);
      throw insertError;
    }

    const formLabel = FORM_LABELS[formType];
    const fields = buildFields(formType, details || {});
    const attachments: string[] = Array.isArray(details?.attachmentUrls) ? details.attachmentUrls : [];

    await Promise.all([
      sendEmail({
        to: email,
        subject: `We've received your ${formLabel} — AZACH`,
        html: enquiryConfirmationEmail({ name: fullName, formLabel, fields, attachments }),
      }),
      sendEmail({
        to: OPS_EMAIL,
        subject: `New ${formLabel} submission — ${fullName}`,
        html: internalEnquiryEmail({ formLabel, name: fullName, email, phone, fields, attachments }),
      }),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('submit-form error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to submit form' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
