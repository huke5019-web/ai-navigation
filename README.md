# AI Navigation

A clean, dark AI tools directory built with Next.js, TypeScript, Prisma, and Vercel-friendly public fallbacks.

## What is included

- Reusable ad system with banner, sidebar, in-feed, footer, and article placements
- Google AdSense support driven by environment variables
- Sponsored recommendation cards driven by `data/sponsors.ts`
- Affiliate link support for AI tool listings
- SEO foundations: metadata, canonical URLs, Open Graph, Twitter Card, JSON-LD, sitemap, robots, and `ads.txt`
- Static content pages: `/about`, `/contact`, `/privacy-policy`, `/terms`, `/advertise`, `/submit-tool`
- Markdown blog system at `/blog` and `/blog/[slug]`
- Google Analytics 4 event hooks for page views, search, category clicks, tool detail clicks, and affiliate clicks
- Admin pages for managing tools, categories, ads, and site settings

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma + SQLite locally
- Vercel deployment

## Local development

1. Copy the environment template:

```powershell
Copy-Item .env.example .env
```

2. Install dependencies:

```powershell
npm install
```

3. Generate Prisma client and apply migrations:

```powershell
npm run db:generate
npx prisma migrate deploy
```

4. Optional: seed local data:

```powershell
npm run db:seed
```

5. Start the app:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and verification

```powershell
npm run lint
npm test
npm run build
```

## Environment variables

All browser-exposed configuration uses `NEXT_PUBLIC_` variables.

```env
DATABASE_URL="file:./data/ai-navigation.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$12$replace-with-bcrypt-hash"
SESSION_SECRET="replace-with-at-least-32-random-characters"

NEXT_PUBLIC_SITE_URL="https://ai-navigation-ifw5.vercel.app"
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""

NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_ADSENSE_AUTO_ADS="false"
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=""
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=""
NEXT_PUBLIC_ADSENSE_SLOT_INFEED=""
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=""
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE=""
```

## GitHub workflow

Push code to GitHub as usual:

```powershell
git status
git add .
git commit -m "Add ads, SEO, blog, and monetization support"
git push origin main
```

If your Vercel project is already connected to GitHub, pushing to the tracked branch will trigger a new deployment automatically.

## Vercel deployment

1. Open your Vercel project.
2. Go to `Settings -> Environment Variables`.
3. Add the variables from `.env.example`.
4. Redeploy the latest commit, or push a new commit to GitHub.

If `NEXT_PUBLIC_SITE_URL` is not set, metadata and sitemap links may point to the fallback URL instead of your real domain.

## Google AdSense setup

1. In Google AdSense, copy your publisher ID, such as `ca-pub-1234567890123456`.
2. Put it into:

```env
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-1234567890123456"
```

3. Add slot IDs to the matching variables:

```env
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=""
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=""
NEXT_PUBLIC_ADSENSE_SLOT_INFEED=""
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=""
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE=""
```

4. Enable auto ads only if you want Google-managed placements:

```env
NEXT_PUBLIC_ADSENSE_AUTO_ADS="true"
```

Notes:

- If `NEXT_PUBLIC_ADSENSE_CLIENT` is empty, the site shows local placeholder ads or sponsor cards.
- If AdSense has not approved your site yet, ads may not display. That is normal.
- Do not add invalid-traffic features such as forced clicks, hidden overlays, or misleading CTA traps.

## ads.txt

The template file is at:

- [public/ads.txt](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/public/ads.txt)

Replace the placeholder pub ID with your real AdSense publisher ID.

Production URL:

- `https://your-domain.com/ads.txt`

## Google Analytics 4

Set:

```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

The site loads GA only when this variable exists.

Tracked events:

- page views
- search
- category clicks
- tool detail clicks
- affiliate clicks

The implementation does not intentionally send personal or sensitive user data.

## Google Search Console verification

Put your verification token into:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
```

After redeploying, the token is added to the global metadata.

## SEO endpoints

- Sitemap: `https://your-domain.com/sitemap.xml`
- Robots: `https://your-domain.com/robots.txt`
- Ads file: `https://your-domain.com/ads.txt`

Included in `sitemap.xml`:

- home page
- category pages
- tool detail pages
- blog index
- blog article pages
- core static content pages

## How to add a new ad slot

Ad rendering is centralized in:

- [components/ads/ad-slot.tsx](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/components/ads/ad-slot.tsx)

Supported kinds:

- `banner`
- `sidebar`
- `inFeed`
- `footer`
- `article`

If you need another placement, add a new `kind`, style block, and environment-backed slot mapping in:

- [components/ads/adsense-slot.tsx](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/components/ads/adsense-slot.tsx)
- [lib/site-config.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/lib/site-config.ts)

## How to add or edit sponsored placements

Edit:

- [data/sponsors.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/data/sponsors.ts)

Fields:

- `id`
- `title`
- `description`
- `image`
- `link`
- `position`
- `category`
- `label`
- `type`
- `startDate`
- `endDate`
- `isActive`

Common `position` values:

- `homeBanner`
- `categoryBanner`
- `sidebar`
- `inFeed`
- `toolDetail`
- `articleInline`

Common `type` values:

- `direct`
- `affiliate`
- `adsense`

All sponsor links open in a new tab and use:

```txt
rel="nofollow sponsored noopener noreferrer"
```

## How to add affiliate links

Affiliate-capable tool fields are supported in the Prisma schema and admin UI:

- `officialUrl`
- `affiliateUrl`
- `isSponsored`
- `sponsorLabel`
- `couponCode`
- `pricing`
- `tags`

Behavior:

- `affiliateUrl` is used first when present
- otherwise `officialUrl` is used
- affiliate and sponsored outbound links use `nofollow sponsored noopener noreferrer`

## How to add a blog post

Create a Markdown file in:

- [content/blog](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/content/blog)

Each file should include frontmatter like:

```md
---
title: Your Title
description: Short summary
publishedAt: 2026-06-26
updatedAt: 2026-06-26
category: Productivity
readingTime: 8 min read
recommendedTools:
  - chatgpt
relatedSlugs:
  - another-post
---
```

Then write normal Markdown with `##` and `###` headings to populate the on-page table of contents automatically.

## How to add an AI tool

You can add tools in either of these places:

1. Admin UI:
   - `/admin/tools`
2. Public fallback catalog:
   - [prisma/catalog.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/prisma/catalog.ts)

The fallback catalog is especially important for Vercel builds when no production database is configured.

## Key monetization files

- [components/ads/ad-slot.tsx](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/components/ads/ad-slot.tsx)
- [components/public/external-tool-link.tsx](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/components/public/external-tool-link.tsx)
- [lib/tool-links.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/lib/tool-links.ts)
- [lib/analytics.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/lib/analytics.ts)
- [lib/blog.ts](/C:/Users/admin/Documents/Codex/2026-06-11/playwright-mcp/lib/blog.ts)

## Notes for this project

- The public site is designed to stay clean. Ads are labeled and spaced to avoid layout jumps.
- Sensitive IDs and tokens are not hardcoded in the UI layer.
- The project is compatible with Vercel deployment and local fallback data.
