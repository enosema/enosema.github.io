# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Enosema Foundation website (https://www.enosema.org) — an Astro 7 static site with Vue islands and Tailwind CSS 4, deployed to GitHub Pages. Design language mirrors the EXPRESS Language Foundation site (github.com/expresslang/expresslang.github.io); brand colors are the Enosema greens (`#25a000` primary, `#007724` dark).

## Commands

```sh
npm install            # setup (Node 22; CI uses 22)
npm run dev            # build content + dev server at localhost:4321
npm run build          # build content + static site into dist/ (+ sitemap)
npm run preview        # serve the built dist/
npm run astro ...      # run astro CLI directly
```

`npm run build` runs `scripts/build-content.ts` first: it converts `content/**/*.adoc` to JSON in `src/content/` (gitignored, regenerated every build). Add content by editing the `.adoc` files, not the JSON.

## Architecture

- `astro.config.mjs` — static output, `build.format: 'directory'` (URLs keep trailing slashes, matching the Jekyll-era URL space), Vue + sitemap integrations, `@` alias → `src/`.
- `src/pages/` — one `.astro` file per route: home, about, membership, references, tos, privacy, `blog/index`, `blog/[slug]`, 404. Blog slugs come from frontmatter date + filename (`/blog/2022-03-18-enosema-launch/`), preserving the URLs Jekyll published.
- `src/layouts/BaseLayout.astro` — head/SEO/JSON-LD, fonts (Fira Sans, Montserrat, JetBrains Mono), dark-mode bootstrap, skip link, global scroll-reveal observer for `[data-animate]`.
- `src/components/` — header (sticky, blur-on-scroll, dark toggle, mobile drawer), footer, PageHero, BaseCard/BaseButton, PersonCard, AnimatedSection, AsciiDocContent.
- Vue islands (client:load, shared state via `src/composables/useConceptPairs.ts`): `HomeHeadline.vue` (rotating "between domains / languages / systems") and `HomeConceptCard.vue` (typewriter concept-register card). Pair examples come from the Foundation's own published material.
- `src/data/` — `site.ts` (title, email, GitHub), `navigation.ts` (top nav), `people.ts` (founder profiles shown on /about).
- `src/styles/main.css` — Tailwind 4 `@theme` tokens (`eno-green*`, `pine`, `slate-bg`, fonts) plus header/reveal/motion CSS. `src/styles/asciidoc.css` styles the converted AsciiDoc HTML.
- `content/pages/*.adoc`, `content/posts/*.adoc` — AsciiDoc sources with YAML frontmatter (title, date, categories, authors, excerpt). `scripts/build-content.ts` converts them (asciidoctor.js + gray-matter) and derives slugs; the post slug uses the frontmatter date because Jekyll permalinks did.
- `public/` — favicons, `logos/logo-symbol-{green,white}.svg` (derived from the source marks in `assets/`), `site.webmanifest`, `CNAME` (www.enosema.org), `robots.txt`.

Legacy Jekyll files (`Gemfile`, `Makefile`, `Rakefile`, `_config.yml`, `_pages/`, `_posts/`, `_layouts/`, `_site/`…) are kept for reference and are not used by the build.

## Deployment

- `.github/workflows/build_deploy.yml` — on push to `main` (and PRs, build only): Node 22 → `npm ci && npm run build` → deploy `dist/` to GitHub Pages via configure-pages/upload-pages-artifact/deploy-pages. The repo is `enosema/enosema.github.io`; DNS for www.enosema.org and the apex already points at GitHub Pages.
- `.github/workflows/links.yml` — lychee link check over `dist/**/*.html`; pass `--root-dir dist` so root-relative links resolve. `.lycheeignore` excludes bot-blocked hosts (iso.org, iec.ch return 403 to crawlers) and non-HTTP schemes.

## Content workflow

Feature branch → PR → merge to `main` → Pages deploy finishes within a couple of minutes.
