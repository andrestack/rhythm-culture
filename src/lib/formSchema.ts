import { z } from 'zod';
import { FORMS, type Field } from './forms';

// One zod schema per form, derived from the field list in forms.ts. The browser uses it for inline
// errors and /api/form re-runs it on the server, which is the check that counts.
// Any new form: add it to FORMS and it is validated here automatically.
const REQUIRED = 'This field is required';

const isRealDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};
// Today as YYYY-MM-DD in Brisbane (en-CA prints ISO order).
const todayBrisbane = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });

function fieldSchema(fl: Field): z.ZodType {
  let base: z.ZodType;
  switch (fl.type) {
    case 'email':
      base = z.string().trim().max(254).pipe(z.email('Enter a valid email address'));
      break;
    case 'tel':
      base = z.string().trim().regex(/^[0-9 +()-]{6,20}$/, 'Enter a valid phone number');
      break;
    case 'number':
      base = z.string().trim().regex(/^\d{1,5}$/, 'Enter a whole number');
      break;
    case 'date':
      // Must be a real calendar day (not 2026-02-31) and not in the past (Brisbane time, same on client and server).
      base = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
        .refine(isRealDate, 'Enter a valid date')
        .refine((v) => v >= todayBrisbane(), 'Please choose today or a future date');
      break;
    case 'time':
      base = z.string().regex(/^\d{2}:\d{2}$/, 'Enter a valid time');
      break;
    case 'select':
      base = z.enum(fl.options as [string, ...string[]], { error: 'Please choose an option' });
      break;
    case 'checkbox':
      return fl.required ? z.literal('on', { error: REQUIRED }) : z.literal('on').optional();
    case 'textarea':
      base = z.string().trim().max(5000, 'Too long');
      break;
    default:
      base = z.string().trim().max(500, 'Too long');
  }
  if (fl.required) {
    // Empty string must read as "required", not as a format error.
    return z.string({ error: REQUIRED }).trim().min(1, REQUIRED).pipe(base);
  }
  return z.union([z.literal(''), base]).optional();
}

const cache = new Map<string, z.ZodObject>();

export function schemaFor(form: string) {
  const def = FORMS[form];
  if (!def) return null;
  let s = cache.get(form);
  if (!s) {
    s = z.object(Object.fromEntries(def.fields.map((fl) => [fl.name, fieldSchema(fl)])));
    cache.set(form, s);
  }
  return s;
}

// field name -> first message
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    out[key] ??= issue.message;
  }
  return out;
}
