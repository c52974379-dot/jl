# Awakening Culture Technology — website

Static marketing and lead-generation site for **Awakening Culture Technology (Henan) Co., Ltd.**
(泰盎文华科技（河南）有限公司), a Zhengzhou-based company working in technology transfer,
international scientific collaboration and Traditional Chinese Medicine clinic services, serving
partners in North America and Europe.

No framework, no runtime, no dependencies. `node scripts/build.mjs` turns the content files into a
complete static site in `dist/` that can be dropped on any host or CDN.

---

## Quick start

```bash
node scripts/build.mjs      # build the site into dist/
node scripts/serve.mjs      # preview at http://localhost:4173
node scripts/check.mjs      # integrity + translation coverage report
```

Requires Node 18+. There is nothing to install.

---

## What is in the box

**31 pages per language, 6 languages, 186 HTML files.**

| Page | Purpose |
| --- | --- |
| `index.html` | Home: hero, proof points, three service lines, featured products, process, testimonials |
| `technology.html` | Technology development, transfer, scale-up engineering, collaboration models |
| `products.html` | Filterable catalogue (12 products, 6 categories) with a quote basket |
| `products/<slug>.html` | 12 product pages: gallery, specification table, applications, PDF downloads |
| `clinic.html` | TCM clinic programmes: start-up, herb supply, diagnostics, training |
| `about.html` | Company, operations, team, milestones, certification |
| `news.html` + `news/<slug>.html` | Insights hub and 6 long-form articles |
| `contact.html` | Inquiry form, direct contact details, FAQ, newsletter |
| `cart.html` | Quote basket with quantities and an indicative total |
| `clinic-checklist.html` | Free resource page (lead magnet) |
| `terms.html`, `privacy.html`, `shipping.html` | Legal and policy pages |
| `404.html` | Not-found page with recovery links |

Languages: **English** (root, canonical), **中文**, **Español**, **Deutsch**, **Français**, **Русский**
— each served from `/<lang>/` with `hreflang` alternates, a per-language sitemap entry and a
client-side language switcher.

---

## Architecture

```
src/
  config.js              brand, contact, domain, integrations, languages  <- edit this first
  content.js             ALL site copy: ui strings, products, posts, page sections
  legal.js               terms, privacy, shipping (separate so counsel can review one file)
  icons.js               inline SVG icon set
  templates/
    shell.js             page shell: head, SEO/OG/hreflang, header, nav, footer, JSON-LD
    sections.js          15 section renderers (hero, cards, features, catalog, steps, FAQ, ...)
    detail.js            product, article and 404 templates
  i18n/<lang>/NN-*.json  translations, split into five chunks
  i18n-src/en/NN-*.json  the English source the translators work from
  i18n-src/_glossary.md  the terminology and style contract given to translators
assets/
  css/styles.css         complete design system (tokens -> components -> sections -> responsive)
  js/main.js             runtime: nav, language switch, cart, catalogue filter, forms
  img/*.jpg              placeholder artwork (replace with real photography, same filenames)
  docs/*.pdf             placeholder datasheets (replace with real ones, same filenames)
scripts/
  build.mjs              the build
  serve.mjs              zero-dependency static preview server
  check.mjs              link/HTML/translation verification
  gen_images.py          regenerates the placeholder artwork
  gen_pdfs.py            regenerates the placeholder PDFs
  make-i18n.mjs          regenerates the translation source from content.js
  i18n-todo.mjs          reports what a language still needs translated
  i18n-gap-files.mjs     writes a precise patch file for a language
  i18n-fix.mjs           normalises recurring terms across languages
  shots.mjs              headless-browser screenshots (needs a real desktop session)
```

### Why a build step but no framework

The content lives in JavaScript objects rather than in HTML, so the same product, article or
navigation definition renders identically on every page and in every language. That is what makes
186 consistent pages maintainable. The output, however, is plain static HTML — there is no
hydration, no client-side router and no JS required to read the site.

### How internationalisation works

This is the part worth understanding before editing content.

1. English is authored once, in `src/content.js`.
2. The build renders every page in English **and** tags each translatable string with a
   `data-i18n` key. The English text is in the HTML, so every language is complete even if
   JavaScript never runs.
3. The same keys and their translated values are embedded in the page as a small JSON payload.
4. On load, `assets/js/main.js` swaps the tagged strings for the active language.
5. Missing translation? The build deep-merges `src/i18n/<lang>/` over the English tree, so an
   untranslated key silently falls back to English rather than rendering a blank.

One markup tree, six languages, no duplicated templates.

---

## Editing content

Most changes are a single edit in one file.

**Brand, domain, contact details, integrations** → `src/config.js`

**Any copy, product or article** → `src/content.js`. Products are a flat array of objects
(`slug`, `sku`, `category`, `price`, `specs`, `features`, `docs`, …); articles are a `body` array of
`['p', text]`, `['h2', text]` and `['ul', [items]]` blocks.

**Page structure** → the `sections` array of each page in `src/content.js`. Available section
types: `hero`, `stats`, `cards`, `features`, `products`, `catalog`, `steps`, `quotes`, `accordion`,
`prose`, `timeline`, `pagehead`, `posts`, `cta`, `contactform`, `faqcontact`, `cart`.

**Colours, spacing, type** → the token block at the top of `assets/css/styles.css`. Changing
`--jade-600`, `--ink-900` and `--gold-500` restyles the whole site.

After changing any copy, refresh the translation source and check coverage:

```bash
node scripts/make-i18n.mjs      # regenerate src/i18n-src/en
node scripts/i18n-todo.mjs --lang=de   # what still needs translating
node scripts/check.mjs          # coverage report
```

---

## Before you go live

The site ships with deliberate placeholders. In rough priority order:

1. **Set the domain** — `site.url` in `src/config.js`, then rebuild. This drives canonical URLs,
   `hreflang`, the sitemap, Open Graph tags and structured data.
2. **Connect the inquiry form** — set `integrations.inquiryEndpoint` in `src/config.js` to a
   Formspree / Basin / Getform URL or your own handler. Until then the form opens the visitor's
   mail client and an amber "demo mode" bar stays visible on every page.
3. **Replace the placeholder artwork** — every file in `assets/img/` is generated art. Overwrite
   with real photography using the *same filenames*; no code changes needed. See
   `docs/IMAGE-GUIDE.md`.
4. **Replace the placeholder PDFs** — `assets/docs/` contains minimal valid PDFs so the download
   buttons work. Swap in real datasheets, same filenames.
5. **Confirm every figure** — prices, specifications, capacities and certifications in
   `src/content.js` are illustrative. They must be checked by whoever owns the product data.
6. **Have the legal pages reviewed** — `terms.html`, `privacy.html` and `shipping.html` are a
   commercially reasonable starting point, not legal advice. Review them in China and in your
   target markets.
7. **Optional: payments** — set `integrations.stripePaymentLink` or `paypalClientId`. Otherwise
   orders route to a quotation request, which is the normal flow for configured equipment.
8. **Optional: analytics** — set `integrations.gaMeasurementId` and/or `clarityId`. Nothing loads
   until an ID is present.

Full hosting instructions are generated into `dist/docs/DEPLOY.md` on every build.

---

## Verification

`node scripts/check.mjs` is the safety net. For every built HTML file it verifies that:

- every relative `href`/`src` resolves to a file that actually exists (all 186 files, ~5,000 links)
- no unresolved template placeholder leaked into the output (`${...}`)
- no Unicode replacement character appears (an encoding-corruption canary)
- the structural landmarks and the i18n payload are present and parse as JSON
- per-language coverage against the English source, and which keys are still identical to English
  (brand names, SKUs, units and Incoterms codes are expected to be identical)

Current state: **186 files, 0 failures, 0 warnings, 100% translation coverage in all five
non-English languages.**

---

## Deployment

Any static host. `dist/` is self-contained with relative paths, so it also works from a
subdirectory.

**Netlify** — `netlify.toml` is included. Build `node scripts/build.mjs`, publish `dist`.

**Vercel** — `vercel.json` is included.

**GitHub Pages** — publish `dist/` to `gh-pages`, or build in Actions and deploy the artifact.

**Any web server / CDN** — upload the contents of `dist/` to the web root. Language folders sit
beside `index.html`, and `_headers`/`_redirects` are honoured by Netlify-style hosts (other hosts
ignore them safely).

---

## Known limitations

- **Screenshots were not verified in this environment.** The headless browser cannot start under
  the sandbox used to build the site, so rendering was verified structurally and by inspecting the
  generated HTML and CSS rather than visually. Run `node scripts/shots.mjs` from a normal desktop
  session, or just open `http://localhost:4173`.
- **Translations are machine-produced.** Five language passes were done by AI against a fixed
  glossary and then normalised for consistency, and the German, French, Chinese and Spanish passes
  self-reported full structural fidelity. They are good enough to launch behind a native
  reviewer's sign-off, and a native speaker should still read the legal pages before publication.
- **The forms have no backend.** They post to a configurable endpoint; there is no database, no
  CRM and no email sending built in.
- **No search.** The catalogue filter is client-side over 12 products. Beyond a few hundred
  products this should become a search index.
