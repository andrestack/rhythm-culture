// Page building blocks. Each tag here has a matching component in keystatic.config.ts (so the CMS can
// open and edit it) and an entry in .agents/skills/rhythm-culture-cms/blocks.md (so the agent knows when
// to use it). Change all three together.
import Markdoc, { type Config, type Node, type RenderableTreeNode } from '@markdoc/markdoc';
import { ICONS, iconSvg } from './icons';

const { Tag } = Markdoc; // CommonJS package: named runtime imports fail under Vite

// Percent-encode the characters that could end a url("…") early, so an image path can't inject CSS.
const css = (s: string) => s.replace(/["'()\\\s]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
const bgStyle = (image?: string) => (image ? `--bg: url("${css(image)}")` : undefined);
const kids = (node: Node, config: Config) => node.transformChildren(config);

export const markdocConfig: Config = {
  // Pictures further down the page load as they are scrolled to; this keeps the first screen quick.
  nodes: {
    image: {
      ...Markdoc.nodes.image,
      attributes: { ...Markdoc.nodes.image.attributes, loading: { type: String, default: 'lazy' }, decoding: { type: String, default: 'async' } },
    },
  },
  tags: {
    hero: {
      attributes: {
        image: { type: String, required: true },
        align: { type: String, default: 'center', matches: ['center', 'left'] },
        size: { type: String, default: 'tall', matches: ['tall', 'short'] },
        accent: { type: String, default: 'white', matches: ['white', 'green'] },
      },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('section', { class: `blk-hero is-${a.align} is-${a.size} h-${a.accent}`, style: bgStyle(a.image) }, [
          new Tag('div', { class: 'blk-hero__inner' }, kids(node, config)),
        ]);
      },
    },
    section: {
      attributes: {
        tone: { type: String, default: 'grey', matches: ['white', 'grey', 'dark', 'red', 'image'] },
        image: { type: String },
      },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('section', { class: `blk-section is-${a.tone}`, style: bgStyle(a.image) }, [
          new Tag('div', { class: 'blk-section__inner' }, kids(node, config)),
        ]);
      },
    },
    columns: {
      attributes: {
        layout: { type: String, default: 'equal', matches: ['equal', 'wide-left', 'wide-right'] },
        align: { type: String, default: 'top', matches: ['top', 'center'] },
      },
      transform(node, config) {
        const a = node.transformAttributes(config);
        const cols = kids(node, config).filter((c) => Markdoc.Tag.isTag(c));
        // A row where every column is just one image is a photo gallery (cropped to match, stays side by side on phones).
        const onlyImage = (c: RenderableTreeNode) => {
          const k = Markdoc.Tag.isTag(c) ? c.children.filter((x) => Markdoc.Tag.isTag(x)) : [];
          return k.length === 1 && Markdoc.Tag.isTag(k[0]) && k[0].name === 'p' &&
            k[0].children.length === 1 && Markdoc.Tag.isTag(k[0].children[0]) && k[0].children[0].name === 'img';
        };
        const gallery = cols.length > 1 && cols.every(onlyImage) ? ' is-gallery' : '';
        return new Tag('div', { class: `blk-cols n-${cols.length} is-${a.layout} v-${a.align}${gallery}` }, cols);
      },
    },
    column: {
      attributes: { card: { type: String, default: 'none', matches: ['none', 'dark', 'light'] } },
      transform(node, config) {
        const a = node.transformAttributes(config);
        const card = a.card && a.card !== 'none' ? ` is-card card-${a.card}` : '';
        return new Tag('div', { class: `blk-col${card}` }, kids(node, config));
      },
    },
    feature: {
      attributes: { icon: { type: String, default: 'check', matches: Object.keys(ICONS) } },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('div', { class: 'blk-feature' }, [
          new Tag('span', { class: 'blk-feature__icon', 'data-icon': a.icon, 'aria-hidden': 'true' }, []),
          ...kids(node, config),
        ]);
      },
    },
    testimonials: {
      transform(node, config) {
        return new Tag('div', { class: 'blk-quotes' }, kids(node, config));
      },
    },
    testimonial: {
      attributes: { name: { type: String, default: '' }, role: { type: String, default: '' } },
      transform(node, config) {
        const a = node.transformAttributes(config);
        const cap: RenderableTreeNode[] = [];
        if (a.name) cap.push(new Tag('strong', {}, [a.name]));
        if (a.role) cap.push(new Tag('span', {}, [a.role]));
        return new Tag('figure', { class: 'blk-quote' }, [
          new Tag('blockquote', {}, kids(node, config)),
          ...(cap.length ? [new Tag('figcaption', {}, cap)] : []),
        ]);
      },
    },
    faq: {
      transform(node, config) {
        return new Tag('div', { class: 'blk-faq' }, kids(node, config));
      },
    },
    question: {
      attributes: { title: { type: String, required: true } },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('details', { class: 'blk-q' }, [
          new Tag('summary', {}, [a.title]),
          new Tag('div', { class: 'blk-q__body' }, kids(node, config)),
        ]);
      },
    },
    button: {
      selfClosing: true,
      attributes: {
        href: { type: String, required: true },
        label: { type: String, required: true },
        align: { type: String, default: 'center', matches: ['center', 'left'] },
      },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('p', { class: `blk-btn is-${a.align}` }, [new Tag('a', { class: 'btn', href: a.href }, [a.label])]);
      },
    },
    banner: {
      attributes: { image: { type: String, default: '/media/2017/11/Circle-final.png' } },
      transform(node, config) {
        const a = node.transformAttributes(config);
        return new Tag('div', { class: 'blk-banner', style: bgStyle(a.image) }, kids(node, config));
      },
    },
    callout: {
      transform(node, config) {
        return new Tag('div', { class: 'blk-callout' }, kids(node, config));
      },
    },
    chips: {
      transform(node, config) {
        return new Tag('div', { class: 'blk-chips' }, kids(node, config));
      },
    },
    embed: {
      selfClosing: true,
      attributes: {
        src: { type: String, required: true },
        title: { type: String, default: 'Embedded content' },
        ratio: { type: String, default: 'video', matches: ['video', 'map', 'post'] },
      },
      transform(node, config) {
        const a = node.transformAttributes(config);
        if (!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|google\.com\/maps|facebook\.com\/plugins)\//.test(a.src)) return null; // unknown hosts render nothing
        return new Tag('div', { class: `blk-embed is-${a.ratio}` }, [
          new Tag('iframe', { src: a.src, title: a.title, loading: 'lazy', allowfullscreen: true, allow: 'encrypted-media; picture-in-picture', referrerpolicy: 'strict-origin-when-cross-origin' }, []),
        ]);
      },
    },
  },
};

export function renderMarkdoc(body: string, file: string): string {
  const ast = Markdoc.parse(body);
  const errors = Markdoc.validate(ast, markdocConfig).filter((e) => e.error.level === 'error' || e.error.level === 'critical');
  if (errors.length) {
    const e = errors[0];
    throw new Error(`${file} line ${(e.lines?.[0] ?? 0) + 1}: ${e.error.message}`);
  }
  // Markdoc wraps the document in <article>; drop it so blocks are direct children of the page grid.
  const html = Markdoc.renderers.html(Markdoc.transform(ast, markdocConfig)).replace(/^<article>|<\/article>$/g, '');
  // Icons are filled in after rendering so the SVG markup is not escaped.
  return html.replace(/<span class="blk-feature__icon" data-icon="([a-z-]+)" aria-hidden="true"><\/span>/g, (_, k) =>
    `<span class="blk-feature__icon" aria-hidden="true">${iconSvg(k)}</span>`);
}
