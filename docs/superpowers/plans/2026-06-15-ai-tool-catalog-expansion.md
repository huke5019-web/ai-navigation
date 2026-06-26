# AI Tool Catalog Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the seeded AI navigation catalog to 40 current tools across four categories, give every tool a resilient icon, and preserve administrator-created content across repeated Docker starts.

**Architecture:** Move immutable catalog definitions into `prisma/catalog.ts`, while `prisma/seed.ts` remains the transactional synchronization layer. Standard categories, tags, and catalog tools are updated by slug; custom tools are untouched; advertisements and site settings are created only when absent. A small client-side `ToolIcon` component handles image failures without changing the database schema.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 6 with SQLite, Vitest, Testing Library, Docker Compose.

---

## File Structure

- Create `prisma/catalog.ts`: typed definitions for four categories, tags, 40 catalog tools, default advertisements, and default site settings.
- Modify `prisma/seed.ts`: transaction-based catalog synchronization that preserves custom tools and edited singleton content.
- Create `components/public/tool-icon.tsx`: logo renderer with an accessible initial fallback.
- Modify `components/public/tool-card.tsx`: use `ToolIcon` instead of rendering `<img>` directly.
- Modify `tests/queries.test.ts`: verify exact catalog counts, icon URLs, idempotency, preservation, and rollback.
- Modify `tests/ui.test.tsx`: verify icon rendering and failed-image fallback.
- Modify `Dockerfile` only if runtime verification exposes a packaging issue.

### Task 1: Lock the Catalog Contract With Failing Database Tests

**Files:**
- Modify: `tests/queries.test.ts`

- [ ] **Step 1: Replace loose seed assertions with the exact catalog contract**

Add assertions after `await seed(prisma)`:

```ts
const categoryCounts = await prisma.category.findMany({
  where: { slug: { in: ["chat", "writing", "image", "coding"] } },
  orderBy: { sortOrder: "asc" },
  select: {
    name: true,
    slug: true,
    _count: { select: { tools: true } },
  },
});

expect(categoryCounts).toEqual([
  { name: "AI 对话", slug: "chat", _count: { tools: 10 } },
  { name: "AI 写作", slug: "writing", _count: { tools: 10 } },
  { name: "图像生成", slug: "image", _count: { tools: 10 } },
  { name: "编程开发", slug: "coding", _count: { tools: 10 } },
]);

const catalogTools = await prisma.tool.findMany({
  where: {
    category: { slug: { in: ["chat", "writing", "image", "coding"] } },
  },
  select: { slug: true, logoUrl: true },
});

expect(catalogTools).toHaveLength(40);
expect(new Set(catalogTools.map(({ slug }) => slug)).size).toBe(40);
expect(catalogTools.every(({ logoUrl }) => logoUrl?.startsWith("https://"))).toBe(true);
```

- [ ] **Step 2: Add a preservation test**

Create a custom category, custom tool, edited site setting, and edited advertisement before the second seed:

```ts
const customCategory = await prisma.category.create({
  data: { name: "自定义", slug: "custom", sortOrder: 100 },
});
await prisma.tool.create({
  data: {
    categoryId: customCategory.id,
    name: "内部工具",
    slug: "internal-tool",
    summary: "后台手工添加",
    description: "不得被目录同步删除或修改。",
    websiteUrl: "https://example.com/internal",
  },
});
await prisma.siteSetting.update({
  where: { id: 1 },
  data: { siteDescription: "管理员修改后的简介" },
});
await prisma.advertisement.update({
  where: { id: 1 },
  data: { title: "管理员修改后的广告" },
});

await seed(prisma);

await expect(prisma.tool.findUnique({ where: { slug: "internal-tool" } }))
  .resolves.toMatchObject({ name: "内部工具" });
await expect(prisma.siteSetting.findUnique({ where: { id: 1 } }))
  .resolves.toMatchObject({ siteDescription: "管理员修改后的简介" });
await expect(prisma.advertisement.findUnique({ where: { id: 1 } }))
  .resolves.toMatchObject({ title: "管理员修改后的广告" });
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
npm test -- tests/queries.test.ts
```

Expected: FAIL because only four tools are seeded and the existing early return prevents synchronization.

### Task 2: Define the Complete Typed Catalog

**Files:**
- Create: `prisma/catalog.ts`

- [ ] **Step 1: Export typed category and tag definitions**

Use `satisfies` so invalid fields fail TypeScript:

```ts
export const catalogCategories = [
  { name: "AI 对话", slug: "chat", icon: "MessageSquare", sortOrder: 10 },
  { name: "AI 写作", slug: "writing", icon: "PenLine", sortOrder: 20 },
  { name: "图像生成", slug: "image", icon: "Image", sortOrder: 30 },
  { name: "编程开发", slug: "coding", icon: "Code2", sortOrder: 40 },
] as const;

export const catalogTags = [
  { name: "对话", slug: "chat" },
  { name: "写作", slug: "writing" },
  { name: "图像", slug: "image" },
  { name: "编程", slug: "coding" },
  { name: "精选", slug: "featured" },
] as const;
```

- [ ] **Step 2: Define the catalog tool type**

```ts
export type CatalogTool = {
  categorySlug: "chat" | "writing" | "image" | "coding";
  name: string;
  slug: string;
  logoUrl: `https://${string}`;
  summary: string;
  description: string;
  websiteUrl: `https://${string}`;
  sortOrder: number;
  isFeatured: boolean;
  tagSlugs: readonly string[];
};
```

- [ ] **Step 3: Add the 40 tools in the approved order**

The exported `catalogTools` array must contain exactly these slug/name pairs:

```ts
[
  ["chatgpt", "ChatGPT"],
  ["claude", "Claude"],
  ["gemini", "Gemini"],
  ["perplexity", "Perplexity"],
  ["microsoft-copilot", "Microsoft Copilot"],
  ["grok", "Grok"],
  ["deepseek", "DeepSeek"],
  ["poe", "Poe"],
  ["meta-ai", "Meta AI"],
  ["le-chat", "Le Chat"],
  ["notion-ai", "Notion AI"],
  ["grammarly", "Grammarly"],
  ["jasper", "Jasper"],
  ["writesonic", "Writesonic"],
  ["copy-ai", "Copy.ai"],
  ["quillbot", "QuillBot"],
  ["sudowrite", "Sudowrite"],
  ["rytr", "Rytr"],
  ["wordtune", "Wordtune"],
  ["jenni-ai", "Jenni AI"],
  ["midjourney", "Midjourney"],
  ["adobe-firefly", "Adobe Firefly"],
  ["leonardo-ai", "Leonardo AI"],
  ["ideogram", "Ideogram"],
  ["recraft", "Recraft"],
  ["canva", "Canva"],
  ["stable-diffusion", "Stable Diffusion"],
  ["flux", "FLUX"],
  ["krea", "Krea"],
  ["imagefx", "ImageFX"],
  ["github-copilot", "GitHub Copilot"],
  ["cursor", "Cursor"],
  ["windsurf", "Windsurf"],
  ["claude-code", "Claude Code"],
  ["codex", "Codex"],
  ["replit-agent", "Replit Agent"],
  ["v0", "v0"],
  ["bolt-new", "Bolt.new"],
  ["lovable", "Lovable"],
  ["tabnine", "Tabnine"],
] as const
```

For every entry:

- Set `categorySlug` from its approved section.
- Use sort orders `10` through `100` within each category.
- Write a concise Chinese summary and a two-sentence Chinese description specific to that product.
- Use the product's official HTTPS website.
- Use a Simple Icons SVG URL when available; otherwise use an official-site favicon URL.
- Mark only ChatGPT, Claude, Midjourney, Adobe Firefly, GitHub Copilot, and Cursor as featured.
- Attach the category tag; attach `featured` only when `isFeatured` is true.

- [ ] **Step 4: Move default advertisements and settings into the catalog module**

Export `defaultAdvertisements` and `defaultSiteSetting` with the existing Chinese content so `seed.ts` contains synchronization logic only.

- [ ] **Step 5: Run TypeScript and verify catalog shape**

Run:

```powershell
npx tsc --noEmit
```

Expected: PASS with all 40 catalog entries satisfying `CatalogTool`.

### Task 3: Implement Idempotent, Non-Destructive Synchronization

This task preserves administrator-created tools, edited advertisements, and edited 站点设置 across every seed run.

**Files:**
- Modify: `prisma/seed.ts`
- Test: `tests/queries.test.ts`

- [ ] **Step 1: Remove inline catalog constants and import `prisma/catalog.ts`**

```ts
import {
  catalogCategories,
  catalogTags,
  catalogTools,
  defaultAdvertisements,
  defaultSiteSetting,
} from "./catalog";
```

- [ ] **Step 2: Remove the `siteSetting.count()` early return**

Make every call execute `seedWithinTransaction(transaction)`.

- [ ] **Step 3: Upsert standard categories, tags, tools, and tool-tag relations**

Keep slug-based upserts. Before creating current catalog tags for a tool, remove only stale relations to managed catalog tags:

```ts
await client.toolTag.deleteMany({
  where: {
    toolId: savedTool.id,
    tag: { slug: { in: catalogTags.map(({ slug }) => slug) } },
  },
});
```

Then recreate the approved managed relations. Do not delete custom tags.

- [ ] **Step 4: Preserve edited advertisements and site settings**

Use create-if-missing behavior:

```ts
for (const advertisement of defaultAdvertisements) {
  const existing = await client.advertisement.findUnique({
    where: { id: advertisement.id },
    select: { id: true },
  });
  if (!existing) {
    await client.advertisement.create({ data: advertisement });
  }
}

const existingSettings = await client.siteSetting.findUnique({
  where: { id: defaultSiteSetting.id },
  select: { id: true },
});
if (!existingSettings) {
  await client.siteSetting.create({ data: defaultSiteSetting });
}
```

- [ ] **Step 5: Run focused database tests and verify GREEN**

Run:

```powershell
npm test -- tests/queries.test.ts
```

Expected: all query and seed tests pass, including rollback, 40-tool counts, idempotency, and preservation.

### Task 4: Add a Resilient Tool Icon Component

**Files:**
- Create: `components/public/tool-icon.tsx`
- Modify: `components/public/tool-card.tsx`
- Modify: `tests/ui.test.tsx`

The required 图标加载失败 behavior is to replace the broken image with the tool-name initial without shifting the card layout.

- [ ] **Step 1: Write failing UI tests**

Add tests:

```tsx
test("tool card renders its configured icon", () => {
  render(<ToolCard tool={{ ...tool, logoUrl: "https://example.com/logo.svg" }} />);
  expect(screen.getByRole("img", { name: "灵感写手图标" }))
    .toHaveAttribute("src", "https://example.com/logo.svg");
});

test("tool icon falls back to the initial after an image error", () => {
  render(<ToolCard tool={{ ...tool, logoUrl: "https://example.com/broken.svg" }} />);
  fireEvent.error(screen.getByRole("img", { name: "灵感写手图标" }));
  expect(screen.queryByRole("img", { name: "灵感写手图标" })).not.toBeInTheDocument();
  expect(screen.getByText("灵")).toBeInTheDocument();
});
```

Import `fireEvent` from Testing Library.

- [ ] **Step 2: Run the focused UI tests and verify RED**

Run:

```powershell
npm test -- tests/ui.test.tsx
```

Expected: FAIL because the image currently has an empty alt and no error fallback.

- [ ] **Step 3: Implement `ToolIcon`**

```tsx
"use client";

import { useState } from "react";

export function ToolIcon({
  logoUrl,
  name,
}: {
  logoUrl: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase();

  if (!logoUrl || failed) {
    return <span aria-hidden="true">{initial}</span>;
  }

  return (
    <img
      src={logoUrl}
      alt={`${name}图标`}
      onError={() => setFailed(true)}
    />
  );
}
```

- [ ] **Step 4: Use `ToolIcon` from `ToolCard`**

```tsx
<div className="tool-icon">
  <ToolIcon logoUrl={tool.logoUrl} name={tool.name} />
</div>
```

- [ ] **Step 5: Run the UI tests and verify GREEN**

Run:

```powershell
npm test -- tests/ui.test.tsx
```

Expected: all UI tests pass.

### Task 5: Verify the Full Application

**Files:**
- No required source changes.

- [ ] **Step 1: Run all automated checks**

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests and TypeScript/build pass; lint has no errors.

- [ ] **Step 2: Rebuild and recreate the Docker service**

```powershell
docker compose up --build -d --force-recreate
```

Expected: image builds, migration reports no pending changes, seed completes, and Next.js reports ready.

- [ ] **Step 3: Verify catalog data inside the Docker volume**

Run a Prisma-backed Node command in the container that prints category counts:

```powershell
docker exec playwright-mcp-app-1 node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.category.findMany({where:{slug:{in:['chat','writing','image','coding']}},select:{slug:true,_count:{select:{tools:true}}},orderBy:{sortOrder:'asc'}}).then(console.log).finally(()=>p.$disconnect())"
```

Expected: four categories, each with `_count.tools` equal to `10`.

- [ ] **Step 4: Verify public pages in the in-app browser**

Use the Codex 内置浏览器 for this verification.

Check:

- `/` displays 40 tools in the directory.
- `/?category=chat`, `writing`, `image`, and `coding` each display 10 tools.
- `/?q=Claude` finds Claude and Claude Code where relevant.
- `/tools/chatgpt` and `/tools/cursor` render details and icons.
- `/admin/tools` lists all catalog tools after login.
- Browser console contains no errors.

- [ ] **Step 5: Verify runtime health**

```powershell
docker compose ps
docker compose logs --no-color --since 5m app
```

Expected: container is running with restart count 0 and logs contain no Prisma, HTTP 500, or rendering errors.

### Task 6: Update the Downloadable Package

**Files:**
- Create: `outputs/ai-navigation.zip`

- [ ] **Step 1: Stage a clean source package**

Include source, Prisma schema/migrations/catalog/seed, tests, `.env.example`, Docker files, package manifests, and README. Exclude `.env`, `.next`, `node_modules`, `work`, `outputs`, SQLite files, and Git metadata.

- [ ] **Step 2: Create and inspect the ZIP**

Use `.NET` `ZipFile.CreateFromDirectory`, then verify required entries:

```text
package.json
README.md
.env.example
Dockerfile
docker-compose.yml
prisma/catalog.ts
prisma/seed.ts
prisma/schema.prisma
app/layout.tsx
```

Verify no entry contains `node_modules`, `.next`, `.env`, `work`, `outputs`, or a database extension.

- [ ] **Step 3: Report the artifact**

Return a clickable link to `outputs/ai-navigation.zip`, its byte size, and SHA-256 hash.
