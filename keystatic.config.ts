import { config, fields, collection } from '@keystatic/core';
import { block, repeating, wrapper } from '@keystatic/core/content-components';
import { ICONS } from './src/lib/icons';

// Files are written by scripts/import-wp.mjs and edited here afterwards.
// `link` is the public URL path: changing it changes the page's address (and breaks old links).
const common = {
  title: fields.slug({ name: { label: 'Title' } }),
  link: fields.text({ label: 'URL path', description: 'e.g. /about/ , keep as is unless you add a redirect' }),
  seoTitle: fields.text({ label: 'SEO title' }),
  description: fields.text({ label: 'SEO description', multiline: true }),
  featured: fields.text({ label: 'Featured image path', description: 'e.g. /media/2019/01/photo.jpg' }),
};

// Page blocks. Each one renders through src/lib/markdoc.ts and is explained for the agent in
// .agents/skills/rhythm-culture-cms/blocks.md. Keep the three in step.
const opts = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
const imagePath = (label: string) => fields.text({ label, description: 'e.g. /media/2026/10/photo.jpg' });
const components = {
  hero: wrapper({
    label: 'Hero (photo banner)',
    description: 'Full-width photo with the page title and a button on top. Use once, at the top of a page.',
    schema: {
      image: imagePath('Background photo'),
      align: fields.select({ label: 'Text position', options: opts({ center: 'Centre', left: 'Left' }), defaultValue: 'center' }),
      size: fields.select({ label: 'Height', options: opts({ tall: 'Tall', short: 'Short' }), defaultValue: 'tall' }),
      accent: fields.select({ label: 'Heading colour', options: opts({ white: 'White', green: 'Green' }), defaultValue: 'white' }),
    },
  }),
  section: wrapper({
    label: 'Coloured band',
    description: 'A full-width band with a background colour or photo, to set a part of the page apart.',
    schema: {
      tone: fields.select({ label: 'Background', options: opts({ grey: 'Light grey', white: 'White', dark: 'Dark', red: 'Red', image: 'Photo' }), defaultValue: 'grey' }),
      image: imagePath('Background photo (only for "Photo")'),
    },
  }),
  columns: repeating({
    label: 'Columns',
    description: 'Side-by-side columns (2 to 5). They stack on phones.',
    children: ['column'],
    validation: { children: { min: 2, max: 5 } },
    schema: {
      layout: fields.select({ label: 'Widths', options: opts({ equal: 'Equal', 'wide-left': 'Wide left', 'wide-right': 'Wide right' }), defaultValue: 'equal' }),
      align: fields.select({ label: 'Vertical alignment', options: opts({ top: 'Top', center: 'Middle' }), defaultValue: 'top' }),
    },
  }),
  column: wrapper({
    label: 'Column',
    forSpecificLocations: true,
    schema: {
      card: fields.select({ label: 'Card', description: 'Put the column in a rounded box', options: opts({ none: 'No card', dark: 'Dark card', light: 'White card' }), defaultValue: 'none' }),
    },
  }),
  feature: wrapper({
    label: 'Feature with icon',
    description: 'A red icon above a short heading and sentence, e.g. "Free drum hire". Put 3 or 4 in Columns.',
    schema: { icon: fields.select({ label: 'Icon', options: Object.keys(ICONS).map((k) => ({ value: k, label: k })), defaultValue: 'check' }) },
  }),
  testimonials: repeating({
    label: 'Testimonials grid',
    description: 'Holds any number of Testimonials and lays them out in rows.',
    children: ['testimonial'],
    schema: {},
  }),
  testimonial: wrapper({
    label: 'Testimonial',
    description: 'A client quote on a grey card. Put it inside a Testimonials grid.',
    schema: { name: fields.text({ label: 'Name' }), role: fields.text({ label: 'Role and organisation' }) },
  }),
  faq: repeating({
    label: 'Questions and answers',
    description: 'A list of questions that open to show the answer. Holds any number of Questions.',
    children: ['question'],
    schema: {},
  }),
  question: wrapper({
    label: 'Question',
    description: 'One question (the title) with its answer inside. Put it in a Questions and answers list.',
    schema: { title: fields.text({ label: 'Question', validation: { length: { min: 1 } } }) },
  }),
  button: block({
    label: 'Button',
    description: 'A red button, e.g. "Request a quote" → /quick-quote/',
    schema: {
      label: fields.text({ label: 'Button text', validation: { length: { min: 1 } } }),
      href: fields.text({ label: 'Link', description: 'e.g. /quick-quote/ or https://…', validation: { length: { min: 1 } } }),
      align: fields.select({ label: 'Position', options: opts({ center: 'Centre', left: 'Left' }), defaultValue: 'center' }),
    },
  }),
  banner: wrapper({
    label: 'Colour stripe banner',
    description: 'The multicoloured stripe with one line of big text, e.g. "Bring everyone together".',
    schema: { image: imagePath('Stripe image') },
  }),
  callout: wrapper({ label: 'Red statement', description: 'One or two sentences in large red text, centred.', schema: {} }),
  chips: wrapper({ label: 'Tags', description: 'Turns a bullet list into small rounded tags, e.g. a list of schools or benefits.', schema: {} }),
  embed: block({
    label: 'Video, map or Facebook post',
    description: 'Paste the embed link (YouTube, Vimeo, Google Maps or Facebook). Other sites are not shown.',
    schema: {
      src: fields.url({ label: 'Embed link', validation: { isRequired: true } }),
      title: fields.text({ label: 'Short description (for screen readers)' }),
      ratio: fields.select({ label: 'Shape', options: opts({ video: 'Video (wide)', map: 'Map', post: 'Facebook post (tall)' }), defaultValue: 'video' }),
    },
  }),
};

const content = fields.markdoc({
  label: 'Content',
  options: { image: { directory: 'public/media/cms', publicPath: '/media/cms/' } },
  components,
});

const stripe = (label: string) =>
  fields.text({
    label,
    description: 'Stripe Payment Link, e.g. https://buy.stripe.com/... Leave empty to show an Enquire button instead.',
    validation: { pattern: { regex: /^$|^https:\/\/(buy|donate)\.stripe\.com\/\S+$/, message: 'Must be a https://buy.stripe.com/... link' } },
  });

// PUBLIC_KEYSTATIC_STORAGE=local|github overrides; default is local in dev, github in builds.
// branchPrefix: new CMS branches are named update/..., same as the agent's. It does NOT stop saves to main
// (Keystatic always lists the default branch); only GitHub branch protection on main does that.
const storageKind = import.meta.env.PUBLIC_KEYSTATIC_STORAGE ?? (import.meta.env.DEV ? 'local' : 'github');

export default config({
  storage: storageKind === 'local' ? { kind: 'local' } : { kind: 'github', repo: 'andrestack/rhythm-culture', branchPrefix: 'update/' },
  ui: { brand: { name: 'Rhythm Culture' } },
  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      schema: {
        ...common,
        date: fields.text({ label: 'Date (YYYY-MM-DD)' }),
        form: fields.select({
          label: 'Form shown under the content',
          defaultValue: '',
          options: [
            { label: 'None', value: '' },
            { label: 'Contact', value: 'contact' },
            { label: 'Quick quote', value: 'quote' },
            { label: 'Event booking', value: 'booking' },
            { label: 'Camp Afro Foli registration', value: 'camp' },
          ],
        }),
        content,
      },
    }),
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        ...common,
        date: fields.text({ label: 'Date (YYYY-MM-DD)' }),
        categories: fields.array(fields.text({ label: 'Category' }), { label: 'Categories', itemLabel: (p) => p.value }),
        content,
      },
    }),
    shop: collection({
      label: 'Shop products',
      slugField: 'name',
      path: 'src/content/shop/*',
      format: 'json',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        visible: fields.checkbox({ label: 'Show in shop', defaultValue: false }),
        soldOut: fields.checkbox({ label: 'Sold out', defaultValue: false }),
        category: fields.text({ label: 'Category' }),
        price: fields.text({ label: 'Price (AUD, numbers only)' }),
        salePrice: fields.text({ label: 'Sale price (optional)' }),
        image: fields.text({ label: 'Image path', description: 'e.g. /media/2019/01/photo.jpg' }),
        description: fields.text({ label: 'Description (markdown)', multiline: true }),
        stripeUrl: stripe('Stripe Payment Link'),
        options: fields.array(
          fields.object({
            label: fields.text({ label: 'Option name' }),
            price: fields.text({ label: 'Price (AUD)' }),
            stripeUrl: stripe('Stripe Payment Link for this option'),
          }),
          { label: 'Options (sizes, variations)', itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),
  },
});
