// Replaces the four Gravity Forms. Submissions go to /api/form, are validated with zod (formSchema.ts)
// and forwarded to the n8n webhook in FORM_WEBHOOK_URL.
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  options?: string[];
  note?: string[]; // numbered text shown above the field (e.g. terms a checkbox accepts)
};

// Booking terms, copied verbatim from the old Gravity Form (booking form, 29 Oct 2026).
const BOOKING_TERMS = [
  'All invoices must be paid within 14 days of the invoice date, unless otherwise stated.',
  'All late payments will incur a $20 late payment fee if unpaid after 21 days after the due date. There after all late payments will incur a 20% surcharge per calendar month, billed weekly, or part there of, until payment is received.',
  'Any cancellation or changes to the booking after the booking form has been submitted will be charged a 20% fee of the total owing.',
  'If cancellation occurs within 21 days of the booking date a 50% charge of the total owing will be charged.',
  'If cancellation occurs within 14 days of the booking date a 100% charge of the total owing will be charged.',
];

const hear = ['Google', 'Facebook', 'Instagram', 'Word of mouth', 'A school or organisation', 'Other'];
const f = (name: string, label: string, extra: Partial<Field> = {}): Field => ({ name, label, ...extra });

export const FORMS: Record<string, { subject: string; submit: string; fields: Field[] }> = {
  contact: {
    subject: 'Website contact',
    submit: 'Send message',
    fields: [
      f('firstName', 'First name', { required: true }),
      f('lastName', 'Last name', { required: true }),
      f('organisation', 'Organisation (if applicable)'),
      f('email', 'Email', { type: 'email', required: true }),
      f('phone', 'Contact number', { type: 'tel' }),
      f('location', 'Location (if applicable)'),
      f('message', 'Message', { type: 'textarea' }),
      f('heardFrom', 'Where did you hear about us?', { type: 'select', options: hear, required: true }),
    ],
  },
  quote: {
    subject: 'Quick quote request',
    submit: 'Get my quote',
    fields: [
      f('organisation', 'Organisation / company', { required: true }),
      f('firstName', 'First name', { required: true }),
      f('lastName', 'Last name', { required: true }),
      f('email', 'Contact email', { type: 'email', required: true }),
      f('phone', 'Contact phone number', { type: 'tel', required: true }),
      f('eventDate', 'Event date', { type: 'date' }),
      f('eventLocation', 'Event location', { required: true }),
      f('participants', 'Number of participants', { type: 'number', required: true }),
      f('purpose', 'Event purpose / theme', { required: true }),
      f('comments', 'Any other comments', { type: 'textarea' }),
      f('heardFrom', 'Where did you hear about Rhythm Culture?', { type: 'select', options: hear, required: true }),
    ],
  },
  booking: {
    subject: 'Event booking',
    submit: 'Send booking',
    fields: [
      f('organisation', 'Client organisation / company', { required: true }),
      f('firstName', 'First name', { required: true }),
      f('lastName', 'Last name', { required: true }),
      f('email', 'Client email', { type: 'email', required: true }),
      f('phone', 'Client phone number', { type: 'tel', required: true }),
      f('onsiteFirstName', 'Contact first name (at the event)', { required: true }),
      f('onsiteLastName', 'Contact last name (at the event)', { required: true }),
      f('onsiteMobile', 'Contact mobile (at the event)', { type: 'tel', required: true }),
      f('eventLocation', 'Event location', { required: true }),
      f('eventDate', 'Event date', { type: 'date', required: true }),
      f('arrivalTime', 'Event arrival time', { type: 'time' }),
      f('startTime', 'Event start time', { type: 'time', required: true }),
      f('finishTime', 'Event finish time', { type: 'time', required: true }),
      f('participants', 'Number of participants', { type: 'number', required: true }),
      f('accessAddress', 'Access address'),
      f('accessNotes', 'Notes regarding access (stairs, elevators etc.)', { type: 'textarea' }),
      f('purpose', 'Event purpose / theme', { required: true }),
      f('comments', 'Any other comments', { type: 'textarea' }),
      f('terms', 'I have read and agree to the terms and conditions above', { type: 'checkbox', required: true, note: BOOKING_TERMS }),
    ],
  },
  camp: {
    subject: 'Camp Afro Foli registration',
    submit: 'Register',
    fields: [
      f('firstName', 'First name', { required: true }),
      f('lastName', 'Last name', { required: true }),
      f('postcode', 'Postcode'),
      f('email', 'Email', { type: 'email', required: true }),
      f('phone', 'Phone', { type: 'tel' }),
      f('age', 'What is your age?'),
      f('occupation', 'What is your occupation?'),
      f('heardFrom', 'Where did you hear about Camp Afro Foli Drum & Dance Retreat?'),
      f('threeThings', 'The 3 things I love most', { type: 'textarea' }),
      f('dietary', 'Special dietary requirements', { type: 'textarea' }),
      f('children', 'Are you intending on bringing children? If so, how old are they?'),
      f('flyers', 'Would you be willing to share some flyers in your local community?', { type: 'select', options: ['Yes', 'No'] }),
      f('health', 'Do you have any injuries or health conditions that could impact your camp experience?', { type: 'textarea' }),
      f('responsibility', 'I take full responsibility for any injuries that could result from my participation', { type: 'checkbox', required: true }),
      f('drumHire', 'Will you need to hire a drum for the duration of the camp?', { type: 'select', options: ['Yes', 'No'] }),
      f('contribute', 'Is there something you would like to share or contribute to camp?', { type: 'textarea' }),
    ],
  },
};
