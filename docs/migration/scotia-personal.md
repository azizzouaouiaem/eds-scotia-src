# Scotiabank — Personal Banking page migration (EDS xwalk)

Migration of **https://www.scotiabank.com/ca/en/personal.html** into a new AEM Edge
Delivery Services "hybrid" site authored in AEM with the **Universal Editor** (xwalk),
served from the repo `eds-scotia`. Same approach and quality bar as the TD and Latam IB demos.

- Local AEM author (SDK): **http://localhost:4802** (admin/admin). The 4602 instance is a
  separate instance under recovery and was **not** touched.
- AEM site root: `/content/scotia`, page `/content/scotia/ca/en/personal`, with `nav` and
  `footer` pages under `/content/scotia/ca/en/`.
- Edge Delivery config: `/conf/scotia` → GitHub `azouaoui-deloitte/eds-scotia`, branch `main`.
- DAM: `/content/dam/scotia/`.

## 1. Source structure → EDS blocks

| Source section (scotiabank.com/ca/en/personal) | EDS block / content | Model (UE) |
|---|---|---|
| Header (utility bar, logo, search, Location/Contact/Offers, Sign In, main nav) | `header` block, authored on the `nav` page (6 sections: brand, utility, language, tools, signin, menu) | default content (lists / links / image) |
| Hero "Hit the road … 10¢/L at Shell" (brand lockup, H1, body, Enrol me / Apply now, photo) | `hero` block | `image` + `imageAlt` + `text` (richtext) |
| "You may be interested in" (3 credit-card tiles + Explore link) | `cards` block, variant `interest` | container + `card` items (`image`, `imageAlt`, `text`) |
| "Featured" tabs (Featured, Accounts, Credit cards, Borrowing, Investments, Learning) | `tabs` block (accessible, keyboard arrows) | container + `tab` items (`label`, `text`) |
| "Featured" 6 offer tiles (badge, image, heading, body, link) | `cards` block, variant `featured` | container + `card` items (`image`, `imageAlt`, `text`) |
| CDIC/SADC trademark line + badge | default content (Image + Text) | — |
| Footer (Have a question / Get support / Get advice, social icons, bottom links) | `footer` block, authored on the `footer` page (3 sections: contact, social, bottom) | default content (columns / lists / icons) |
| Page `<title>`, description, og:image | page metadata | `page-metadata` |

David's model was followed: prefer default content (titles, text, images, buttons), few
author-friendly blocks, mobile-first CSS.

## 2. Assets

14 assets were imported into `/content/dam/scotia/` (logos, hero brand lockup + Shell photo,
3 credit-card arts, 6 featured tiles, CDIC badge). Footer/header glyphs (search, social,
help/phone/calendar) are repo SVG icons rendered as `<span class="icon icon-*">`.

## 3. Links

All navigation and CTA links keep their **absolute** `https://www.scotiabank.com/…`
(and `secure.scotiabank.com`, `maps.scotiabank.com`, etc.) targets, because those pages are
not part of this migration. Only `nav`/`footer` fragments are internal
(`/content/scotia/ca/en/nav`, `…/footer`).

## 4. Functional gaps (graceful degradation)

- **Header search**: the scotiabank search backend is cross-origin and cannot be called from
  Edge Delivery; the search box is a static form (submits to the personal page).
- **Featured tabs**: on the live site the non-"Featured" tabs load their tiles from a backend
  API (cross-origin, not callable from EDS). Here each tab carries its own authored content and
  the "Featured" tab shows the 6 imported offer tiles; the other tabs show a short intro + a
  link to the relevant category.
- **Mega-menu / dropdowns**: the live header mega-menu is API/overlay driven. The migrated
  header reproduces the two-tier layout, the full link set, the mobile hamburger drawer and the
  search toggle; deep mega-menu panels are out of scope for this first page.

## 5. Measurements (desktop 1440 / tablet 768 / mobile 375)

Source captures are in `import-work/shots/{desktop,tablet,mobile}-full.png`. Per-viewport
±3px probe comparison against the AEM-rendered page is **pending the code-sync step** (see
`docs/aem-ue-local.md` §"Code sync"): until the repo is served on the Edge Delivery code bus,
the AEM author cannot load `component-models.json` and renders an error page. Once code sync is
live, run `node import-work/tools/render-shots.mjs` and the measurement tooling to produce the
table and side-by-side images.

## 6. Repeatable import

Everything is replayable from `import-work/` (git-ignored):

```bash
node import-work/tools/capture.mjs            # scrape source: HTML, 3-viewport shots, images
node import-work/tools/ue-build-package.mjs   # -> import-work/ue/scotia-xwalk-content-1.0.0.zip
import-work/tools/ue-setup-aem.sh --skip-build # install on 4802 + OSGi settings + checks
```

Package `scotia:scotia-xwalk-content:1.0.0` (filters in mode *replace*) contains `/conf/scotia`,
`/content/scotia` (site, `ca/en/personal`, `nav`, `footer`) and `/content/dam/scotia`.
