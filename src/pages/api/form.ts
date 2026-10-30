import type { APIRoute } from 'astro';
import { FORMS } from '../../lib/forms';
import { schemaFor, fieldErrors } from '../../lib/formSchema';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Best-effort limiter: state lives in one serverless instance, so it slows a single bot but is not a hard cap.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Same-site posts only.
  const origin = request.headers.get('origin');
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch { /* "null" or malformed origin */ }
    if (host !== new URL(request.url).host) return json({ ok: false, error: 'Forbidden' }, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ ok: false, error: 'Bad request' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > 50_000) return json({ ok: false, error: 'Too large' }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Bad request' }, 400);
  }

  const formType = String(body.formType ?? '');
  const schema = schemaFor(formType);
  if (!schema) return json({ ok: false, error: 'Unknown form' }, 400);

  // Honeypot: report success so the bot learns nothing, but send nothing on.
  if (body.website) return json({ ok: true });

  if (limited(clientAddress ?? 'unknown')) return json({ ok: false, error: 'Too many submissions, please try again later.' }, 429);

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: fieldErrors(parsed.error) }, 422);

  const hook = import.meta.env.FORM_WEBHOOK_URL;
  if (!hook || !import.meta.env.FORM_WEBHOOK_SECRET) return json({ ok: false, error: 'Form is not connected yet.' }, 503);

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Shared secret: n8n rejects calls without it, so the webhook can't be used to skip these checks.
        'X-RC-Secret': import.meta.env.FORM_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify({
        formType,
        subject: FORMS[formType].subject,
        page: String(body.page ?? '').slice(0, 200),
        submittedAt: new Date().toISOString(),
        data: parsed.data,
        // Labels in form order, so the email reads like the form.
        fields: FORMS[formType].fields.map((f) => ({ name: f.name, label: f.label })),
      }),
    });
    // Count it as delivered only when n8n confirms it saved the enquiry: a 200 alone has proven unreliable.
    const reply = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || reply?.ok !== true) throw new Error(String(res.status));
  } catch {
    return json({ ok: false, error: 'Could not deliver your message.' }, 502);
  }
  return json({ ok: true });
};
