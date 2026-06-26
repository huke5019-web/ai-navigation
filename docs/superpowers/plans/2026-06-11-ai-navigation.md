# AI Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Chinese AI tool directory with a dark sidebar layout, searchable public catalog, managed advertising, and a secured single-admin dashboard.

**Architecture:** A single Next.js App Router application serves public and admin pages. Prisma with SQLite owns persistence, server actions own authenticated mutations, and focused query/service modules keep business rules testable outside React. Docker Compose mounts the SQLite directory as a persistent volume.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 6, SQLite, Zod, bcryptjs, Lucide React, Vitest, Testing Library, Docker Compose.

---

## File Structure

```text
.
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── tools/[slug]/page.tsx
│   ├── admin/
│   │   ├── (protected)/
│   │   │   ├── ads/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── tools/page.tsx
│   │   ├── login/page.tsx
│   │   └── actions.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── admin/
│   │   ├── ad-form.tsx
│   │   ├── category-form.tsx
│   │   ├── delete-button.tsx
│   │   ├── login-form.tsx
│   │   ├── settings-form.tsx
│   │   └── tool-form.tsx
│   └── public/
│       ├── ad-slot.tsx
│       ├── category-nav.tsx
│       ├── search-form.tsx
│       ├── sidebar.tsx
│       └── tool-card.tsx
├── lib/
│   ├── ads.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── mutations.ts
│   ├── prisma.ts
│   ├── queries.ts
│   ├── schemas.ts
│   └── utils.ts
├── prisma/
│   ├── migrations/0001_init/migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── ads.test.ts
│   ├── auth.test.ts
│   ├── mutations.test.ts
│   ├── queries.test.ts
│   ├── setup.ts
│   └── ui.test.tsx
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── docker-compose.yml
├── next.config.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Task 1: Scaffold and Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create the package manifest**

Use scripts that work both locally and inside Docker:

```json
{
  "name": "ai-navigation",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "6.19.0",
    "bcryptjs": "3.0.2",
    "lucide-react": "0.468.0",
    "next": "16.2.9",
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "zod": "4.1.12"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.0",
    "@types/node": "24.10.1",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "eslint": "9.39.1",
    "eslint-config-next": "16.2.9",
    "jsdom": "27.2.0",
    "prisma": "6.19.0",
    "tsx": "4.21.0",
    "typescript": "5.9.3",
    "vitest": "4.1.8"
  }
}
```

- [ ] **Step 2: Add TypeScript, Next.js, ESLint, and Vitest configuration**

Configure strict TypeScript, the `@/*` alias, Next standalone output, jsdom tests, and `tests/setup.ts` importing `@testing-library/jest-dom/vitest`.

- [ ] **Step 3: Install dependencies**

Run:

```powershell
$bin = "C:\Users\admin\AppData\Local\OpenAI\Codex\runtimes\cua_node\2f053e67fec2d258\bin"
$env:PATH = "$bin;$env:PATH"
& "$bin\npm.cmd" install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 4: Verify the empty project toolchain**

Run:

```powershell
& "$bin\npm.cmd" test
```

Expected: Vitest exits successfully with no test files or with `--passWithNoTests` configured.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts tests/setup.ts .gitignore
git commit -m "chore: scaffold AI navigation app"
```

## Task 2: Database Schema and Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/0001_init/migration.sql`
- Create: `prisma/seed.ts`
- Create: `lib/prisma.ts`
- Test: `tests/queries.test.ts`

- [ ] **Step 1: Write a failing database smoke test**

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("database seed", () => {
  beforeAll(async () => {
    await import("../prisma/seed").then(({ seed }) => seed());
  });

  it("creates categories, tools, ads, and one site setting", async () => {
    expect(await prisma.category.count()).toBeGreaterThan(0);
    expect(await prisma.tool.count()).toBeGreaterThan(0);
    expect(await prisma.advertisement.count()).toBeGreaterThan(0);
    expect(await prisma.siteSetting.count()).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/queries.test.ts`

Expected: FAIL because the Prisma client and schema do not exist.

- [ ] **Step 3: Define the Prisma schema**

Create enums and models matching the approved specification. Use explicit `ToolTag` relations and indexes:

```prisma
enum AdPlacement {
  HOME_BANNER
  HOME_SIDEBAR
  TOOL_DETAIL
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  icon      String   @default("Sparkles")
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  tools     Tool[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, sortOrder])
}

model Tool {
  id          Int       @id @default(autoincrement())
  categoryId  Int
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  name        String
  slug        String    @unique
  logoUrl     String?
  summary     String
  description String
  websiteUrl  String
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  isFeatured  Boolean   @default(false)
  tags        ToolTag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([categoryId, isActive, sortOrder])
  @@index([isFeatured, isActive])
}
```

Add `Tag`, `ToolTag`, `Advertisement`, `SiteSetting`, and `AdminSession` with the exact fields from the design. Use `DATABASE_URL="file:./data/ai-navigation.db"`.

- [ ] **Step 4: Add a singleton Prisma client and idempotent seed**

`lib/prisma.ts` must cache Prisma in development. `seed.ts` must export `seed()` and use `upsert` for categories, tools, tags, ads, and the `SiteSetting` row with ID `1`.

- [ ] **Step 5: Generate, migrate, and seed**

Run:

```powershell
& "$bin\npx.cmd" prisma generate
& "$bin\npx.cmd" prisma migrate deploy
& "$bin\npm.cmd" run db:seed
```

Expected: Prisma client generation succeeds and sample data is inserted once.

- [ ] **Step 6: Run the database test**

Run: `npm test -- tests/queries.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add prisma lib/prisma.ts tests/queries.test.ts
git commit -m "feat: add database schema and seed data"
```

## Task 3: Validation and Authentication

**Files:**
- Create: `lib/constants.ts`
- Create: `lib/schemas.ts`
- Create: `lib/auth.ts`
- Create: `app/admin/actions.ts`
- Create: `app/admin/login/page.tsx`
- Create: `components/admin/login-form.tsx`
- Test: `tests/auth.test.ts`

- [ ] **Step 1: Write failing authentication tests**

Test these pure boundaries:

```ts
describe("admin authentication", () => {
  it("accepts the configured username and password", async () => {
    expect(await verifyAdminCredentials("admin", "secret")).toBe(true);
  });

  it("returns the same false result for either invalid field", async () => {
    expect(await verifyAdminCredentials("wrong", "secret")).toBe(false);
    expect(await verifyAdminCredentials("admin", "wrong")).toBe(false);
  });

  it("hashes session tokens before persistence", () => {
    expect(hashSessionToken("token")).not.toBe("token");
  });
});
```

Set `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD_HASH` to a bcryptjs test hash, and `SESSION_SECRET` in test setup.

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npm test -- tests/auth.test.ts`

Expected: FAIL because auth helpers do not exist.

- [ ] **Step 3: Implement schemas and auth helpers**

Use Zod schemas for login, category, tool, ad, and settings data. Implement:

```ts
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean>;

export function hashSessionToken(token: string): string;
export async function createAdminSession(): Promise<void>;
export async function getAdminSession(): Promise<AdminSession | null>;
export async function requireAdmin(): Promise<AdminSession>;
export async function destroyAdminSession(): Promise<void>;
```

Generate a 32-byte random token, store only its SHA-256 hash, and set a seven-day `admin_session` Cookie with `HttpOnly`, `SameSite=Lax`, `Path=/`, and production-only `Secure`.

- [ ] **Step 4: Implement login and logout server actions**

`loginAction` parses FormData, calls `verifyAdminCredentials`, returns `{ error: "账号或密码错误" }` on failure, creates a session on success, and redirects to `/admin`. `logoutAction` deletes the session and redirects to `/admin/login`.

- [ ] **Step 5: Implement the login page**

Build an accessible dark login card with username/password fields, disabled pending state, and the generic error message.

- [ ] **Step 6: Run auth tests**

Run: `npm test -- tests/auth.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/constants.ts lib/schemas.ts lib/auth.ts app/admin components/admin/login-form.tsx tests/auth.test.ts
git commit -m "feat: secure admin authentication"
```

## Task 4: Public Query and Advertising Rules

**Files:**
- Create: `lib/ads.ts`
- Create: `lib/queries.ts`
- Modify: `tests/queries.test.ts`
- Test: `tests/ads.test.ts`

- [ ] **Step 1: Write failing query and ad validity tests**

```ts
it("filters active tools by category and keyword", async () => {
  const tools = await getTools({ category: "writing", query: "文案" });
  expect(tools.every((tool) => tool.isActive)).toBe(true);
  expect(tools.every((tool) => tool.category.slug === "writing")).toBe(true);
});

it("only returns active ads inside their date window", async () => {
  const now = new Date("2026-06-11T12:00:00Z");
  expect(isAdVisible(activeCurrentAd, now)).toBe(true);
  expect(isAdVisible(futureAd, now)).toBe(false);
  expect(isAdVisible(expiredAd, now)).toBe(false);
  expect(isAdVisible(disabledAd, now)).toBe(false);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `npm test -- tests/queries.test.ts tests/ads.test.ts`

Expected: FAIL because query and advertising modules do not exist.

- [ ] **Step 3: Implement public query functions**

Implement:

```ts
export async function getSiteSetting();
export async function getActiveCategories();
export async function getTools(filters: { category?: string; query?: string });
export async function getFeaturedTools();
export async function getToolBySlug(slug: string);
export async function getRelatedTools(categoryId: number, excludedToolId: number);
export async function getDashboardStats();
```

All public tool queries must enforce `isActive: true`. Keyword matching checks `name`, `summary`, and related tag names.

- [ ] **Step 4: Implement advertising visibility**

```ts
export function isAdVisible(ad: Advertisement, now = new Date()) {
  return ad.isActive
    && (!ad.startsAt || ad.startsAt <= now)
    && (!ad.endsAt || ad.endsAt >= now);
}

export async function getVisibleAds(placement: AdPlacement, now = new Date());
```

Database filtering must mirror the pure helper and sort by `sortOrder`.

- [ ] **Step 5: Run tests**

Run: `npm test -- tests/queries.test.ts tests/ads.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ads.ts lib/queries.ts tests/queries.test.ts tests/ads.test.ts
git commit -m "feat: add public catalog queries and ad rules"
```

## Task 5: Public Dark Sidebar Experience

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/tools/[slug]/page.tsx`
- Create: `components/public/sidebar.tsx`
- Create: `components/public/category-nav.tsx`
- Create: `components/public/search-form.tsx`
- Create: `components/public/tool-card.tsx`
- Create: `components/public/ad-slot.tsx`
- Test: `tests/ui.test.tsx`

- [ ] **Step 1: Write failing component tests**

```tsx
it("renders tool name, summary, category, and website link", () => {
  render(<ToolCard tool={toolFixture} />);
  expect(screen.getByRole("heading", { name: "ChatGPT" })).toBeInTheDocument();
  expect(screen.getByText("通用 AI 助手")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "访问 ChatGPT" })).toHaveAttribute(
    "href",
    "https://chatgpt.com",
  );
});

it("does not render an empty ad slot", () => {
  const { container } = render(<AdSlot ads={[]} placement="HOME_SIDEBAR" />);
  expect(container).toBeEmptyDOMElement();
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `npm test -- tests/ui.test.tsx`

Expected: FAIL because public components do not exist.

- [ ] **Step 3: Build public components**

Use semantic links, headings, labels, and visible focus states. `ToolCard` opens external websites with `target="_blank"` and `rel="noreferrer sponsored"` only when displayed as sponsored content. `AdSlot` labels every advertisement as “广告”.

- [ ] **Step 4: Build the responsive layout**

CSS requirements:

```css
:root {
  color-scheme: dark;
  --bg: #090d12;
  --panel: #111720;
  --panel-strong: #171f2b;
  --border: #222d3a;
  --text: #f4f7fb;
  --muted: #8b98aa;
  --accent: #6d78ff;
}

.public-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 280px;
  min-height: 100vh;
}

@media (max-width: 1100px) {
  .public-shell { grid-template-columns: 220px minmax(0, 1fr); }
  .ad-rail { display: none; }
}

@media (max-width: 760px) {
  .public-shell { display: block; }
  .desktop-sidebar { display: none; }
}
```

- [ ] **Step 5: Build the homepage**

Read `searchParams.q` and `searchParams.category`, render a GET search form, horizontal mobile category chips, featured tools, visible banner ads, filtered tools, and right-rail ads. Keep the selected filter in the URL.

- [ ] **Step 6: Build the tool detail page**

Use `notFound()` for missing/inactive tools. Render metadata, category, tags, full description, official link, detail ads, and related tools.

- [ ] **Step 7: Run UI tests and production build**

Run:

```powershell
& "$bin\npm.cmd" test -- tests/ui.test.tsx
& "$bin\npm.cmd" run build
```

Expected: tests PASS and Next.js build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app components/public tests/ui.test.tsx
git commit -m "feat: build dark public AI directory"
```

## Task 6: Authenticated CRUD Services

**Files:**
- Create: `lib/mutations.ts`
- Modify: `app/admin/actions.ts`
- Test: `tests/mutations.test.ts`

- [ ] **Step 1: Write failing mutation tests**

Cover:

```ts
it("creates and updates a tool with tag relations");
it("rejects duplicate tool slugs");
it("prevents deleting a category that still has tools");
it("creates an advertisement with a valid placement and date range");
it("rejects an advertisement whose end date precedes its start date");
it("updates the singleton site setting");
```

Each test seeds an isolated SQLite test database and asserts the persisted record.

- [ ] **Step 2: Run tests and verify they fail**

Run: `npm test -- tests/mutations.test.ts`

Expected: FAIL because mutations do not exist.

- [ ] **Step 3: Implement category mutations**

Implement `createCategory`, `updateCategory`, and `deleteCategory`. Parse with Zod, return field errors, and throw the Chinese error `请先转移或删除该分类下的工具` when tool count is non-zero.

- [ ] **Step 4: Implement tool mutations**

Implement create/update/delete with a Prisma transaction. Normalize comma-separated tags, upsert tags by slug, replace `ToolTag` rows during updates, and revalidate `/`, `/admin/tools`, and affected detail pages.

- [ ] **Step 5: Implement advertisement and settings mutations**

Enforce enum placement, HTTP(S) URLs, integer sort order, and `startsAt <= endsAt`. Update site settings only at ID `1`.

- [ ] **Step 6: Secure server action wrappers**

Every write action begins with:

```ts
await requireAdmin();
```

Delete actions receive typed IDs, call the mutation module, and revalidate affected routes.

- [ ] **Step 7: Run mutation tests**

Run: `npm test -- tests/mutations.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/mutations.ts app/admin/actions.ts tests/mutations.test.ts
git commit -m "feat: add authenticated content mutations"
```

## Task 7: Admin Dashboard and Management UI

**Files:**
- Create: `app/admin/(protected)/layout.tsx`
- Create: `app/admin/(protected)/page.tsx`
- Create: `app/admin/(protected)/tools/page.tsx`
- Create: `app/admin/(protected)/categories/page.tsx`
- Create: `app/admin/(protected)/ads/page.tsx`
- Create: `app/admin/(protected)/settings/page.tsx`
- Create: `components/admin/tool-form.tsx`
- Create: `components/admin/category-form.tsx`
- Create: `components/admin/ad-form.tsx`
- Create: `components/admin/settings-form.tsx`
- Create: `components/admin/delete-button.tsx`

- [ ] **Step 1: Add the protected admin layout**

Call `requireAdmin()` in the protected layout. Render sidebar links for dashboard, tools, categories, ads, settings, and a logout form.

- [ ] **Step 2: Add the dashboard**

Render four statistic cards from `getDashboardStats`: total tools, active categories, currently visible ads, and featured tools.

- [ ] **Step 3: Add tool management**

Render a table and reusable form supporting all tool fields, category selection, comma-separated tags, active/featured switches, and sort order. Show server validation errors next to fields.

- [ ] **Step 4: Add category management**

Render category rows with tool counts, inline create/edit forms, active state, icon name, sort order, and confirmed deletion.

- [ ] **Step 5: Add advertisement management**

Render placement, schedule, active state, preview image, and CRUD controls. Use `datetime-local` inputs and convert empty dates to `null`.

- [ ] **Step 6: Add site settings**

Edit site name, description, optional logo URL, and footer text in one form.

- [ ] **Step 7: Add safe deletion confirmation**

`DeleteButton` is a client component that calls `window.confirm("此操作无法撤销，确认删除？")` before submitting its enclosing form.

- [ ] **Step 8: Verify admin pages**

Run:

```powershell
& "$bin\npm.cmd" run build
& "$bin\npm.cmd" test
```

Expected: build succeeds and all tests pass.

- [ ] **Step 9: Commit**

```bash
git add app/admin components/admin
git commit -m "feat: add admin management dashboard"
```

## Task 8: SEO, Error States, and Accessibility

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `app/layout.tsx`
- Modify: `app/(public)/page.tsx`
- Modify: `app/(public)/tools/[slug]/page.tsx`

- [ ] **Step 1: Add root metadata**

Use the site setting for the title template, description, metadata base from `NEXT_PUBLIC_SITE_URL`, and Chinese locale.

- [ ] **Step 2: Add dynamic tool metadata**

`generateMetadata({ params })` returns the tool name and summary. Missing tools return a neutral “工具未找到” title.

- [ ] **Step 3: Add sitemap and robots**

Include the homepage and every active tool detail URL. Allow public routes and disallow `/admin`.

- [ ] **Step 4: Add user-safe error pages**

The root error component logs the error to the server/console and displays `页面暂时无法加载，请稍后重试`. The not-found page links back to the homepage.

- [ ] **Step 5: Audit accessibility**

Verify one `h1` per page, labeled form fields, keyboard-visible focus rings, sufficient contrast, descriptive external links, and alt text for tool/ad images.

- [ ] **Step 6: Run full verification**

Run:

```powershell
& "$bin\npm.cmd" run lint
& "$bin\npm.cmd" test
& "$bin\npm.cmd" run build
```

Expected: zero lint errors, all tests pass, and production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app
git commit -m "feat: add SEO and resilient error states"
```

## Task 9: Docker and Operator Documentation

**Files:**
- Create: `.env.example`
- Create: `.dockerignore`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: Add environment template**

```dotenv
DATABASE_URL="file:./data/ai-navigation.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$12$replace-with-bcrypt-hash"
SESSION_SECRET="replace-with-at-least-32-random-characters"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Document the password hash command:

```powershell
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" "your-password"
```

- [ ] **Step 2: Add a multi-stage Dockerfile**

Use Node 22 Alpine stages for dependencies, build, and runner. Copy Prisma artifacts, run as a non-root user, create `/app/prisma/data`, expose port 3000, and start through an entry command that runs `prisma migrate deploy`, `npm run db:seed`, then `next start`.

- [ ] **Step 3: Add Docker Compose**

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ai_navigation_data:/app/prisma/data
    restart: unless-stopped

volumes:
  ai_navigation_data:
```

- [ ] **Step 4: Write README**

Include prerequisites, environment setup, local Node commands, Docker commands, default routes, admin password hashing, data backup path, test/build commands, and the exact feature/scope list.

- [ ] **Step 5: Verify local delivery**

Run:

```powershell
& "$bin\npm.cmd" run lint
& "$bin\npm.cmd" test
& "$bin\npm.cmd" run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Verify Docker when Docker is available**

Run:

```bash
docker compose config
docker compose up --build -d
curl http://localhost:3000
curl -I http://localhost:3000/admin/login
docker compose down
```

Expected: Compose config validates, homepage returns HTML, and login route returns HTTP 200.

- [ ] **Step 7: Perform browser smoke testing**

Using the in-app Browser:

1. Open the homepage at desktop width and verify sidebar, search, cards, and ad rail.
2. Search for a seeded keyword and verify the URL query and filtered result.
3. Open a tool detail page and verify related tools and detail ad.
4. Open `/admin`, verify redirect to login, sign in, and exercise one create/edit/delete flow.
5. Set a mobile viewport and verify the sidebar becomes horizontal category chips.

- [ ] **Step 8: Commit**

```bash
git add .env.example .dockerignore Dockerfile docker-compose.yml README.md
git commit -m "docs: add Docker deployment and operator guide"
```

## Final Verification

- [ ] `npm run lint` exits 0.
- [ ] `npm test` reports all tests passing.
- [ ] `npm run build` creates a production build.
- [ ] Seed command remains idempotent when run twice.
- [ ] Public catalog filters through `q` and `category` URL parameters.
- [ ] Inactive tools and out-of-window ads never appear publicly.
- [ ] Every admin mutation rejects unauthenticated requests.
- [ ] Desktop and mobile layouts match the approved B sidebar direction.
- [ ] Docker verification is recorded as pending only when Docker is unavailable on the executing machine.

