import { config, fields, collection } from '@keystatic/core';

// Files are written by scripts/import-wp.mjs and edited here afterwards.
// `link` is the public URL path: changing it changes the page's address (and breaks old links).
const common = {
  title: fields.slug({ name: { label: 'Title' } }),
  link: fields.text({ label: 'URL path', description: 'e.g. /about/ , keep as is unless you add a redirect' }),
  seoTitle: fields.text({ label: 'SEO title' }),
  description: fields.text({ label: 'SEO description', multiline: true }),
  featured: fields.text({ label: 'Featured image path', description: 'e.g. /media/2019/01/photo.jpg' }),
};

const content = fields.markdoc({
  label: 'Content',
  options: { image: { directory: 'public/media/cms', publicPath: '/media/cms/' } },
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
