# Project Authoring Guide (for AI + Copilot)

This site uses Astro content collections. Follow these steps to add or update projects cleanly and ensure routing, listings, and assets stay correct.

## 1) Add the content file
- Location: `src/content/work/<slug>.md` (do **not** nest unless you want `/work/nested/<slug>`).
- Frontmatter schema (required):
  ```yaml
  ---
  title: Your Project Title
  publishDate: YYYY-MM-DD 00:00:00
  img: /assets/your-hero.gif
  img_alt: Short alt text
  description: |
    1–2 sentence summary (used on listings).
  tags:
    - Tech 1
    - Tech 2
  ---
  ```
- Body: Use Markdown. Include clear sections (Overview, Core Features, Architecture, Impact). Use existing examples in `src/content/work/` for tone and structure.

## 2) Add/verify assets
- Place hero/preview assets in `public/assets/`.
- Reference them in frontmatter as `/assets/<file>`.
- Keep filenames ASCII; prefer gif/mp4/webp for motion, png/jpg for static.

## 3) Homepage behavior (Selected Work)
- Projects auto-sort by `publishDate` descending.
- The homepage filters out the Paper Pigeon entry because it is highlighted separately. Code lives in [src/pages/index.astro](../src/pages/index.astro) and [src/components/PaperPigeonShowcase.astro](../src/components/PaperPigeonShowcase.astro). Do not remove that filter unless the showcase changes.
- Default project cards on the homepage come from [src/components/ProjectSection.astro](../src/components/ProjectSection.astro). They read `title` and `description` from frontmatter—keep those concise.

## 4) Projects page
- The full projects grid is built from [src/pages/work.astro](../src/pages/work.astro) using [src/components/PortfolioPreview.astro](../src/components/PortfolioPreview.astro). All collection items appear unless explicitly filtered.
- Ensure each project has a valid `img` and `img_alt`; the grid uses them.

## 5) Dynamic project pages
- Individual pages are generated from `src/pages/work/[...slug].astro` (no manual edit needed). The URL is `/work/<slug>` where `<slug>` is the markdown filename (minus extension).

## 6) Writing guidelines
- Lead with a crisp one-liner in `description`; this powers list cards and SEO.
- Keep sections scannable: headings + short paragraphs or bullets.
- Use consistent voice and tense; avoid hype words unless justified by metrics.
- Include an Architecture/Stack list when relevant; keep it concise.
- Provide alt text that describes the visual purpose, not file names.

## 7) QA checklist before shipping
- [ ] Content file created in `src/content/work/` with required frontmatter.
- [ ] Assets placed under `public/assets/` and referenced with `/assets/...` paths.
- [ ] Description fits in one or two sentences; tags are accurate.
- [ ] Confirm homepage lists the project once (respecting any filters) and links to `/work/<slug>`.
- [ ] Confirm the project appears on the projects page grid with correct image and title.
- [ ] Run `npm run dev` locally and check for build/console warnings.

## 8) Common pitfalls to avoid
- Duplicating slugs (e.g., leaving old nested files like `nested/duvet-genius.md`). Delete obsolete entries to prevent duplicate cards.
- Forgetting `publishDate`—sorting will be wrong or may break validation.
- Using hardcoded colors; always rely on existing CSS variables and component styles.

## 9) How to feature a project on the homepage
- The dedicated Paper Pigeon showcase lives in [src/components/PaperPigeonShowcase.astro](../src/components/PaperPigeonShowcase.astro). To feature another project, you would clone/retarget this component and adjust the filter in [src/pages/index.astro](../src/pages/index.astro) accordingly.
