import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const blogDirectory = path.join(process.cwd(), "content", "blog");

type BlogFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: string;
  featuredImage?: string;
  recommendedTools?: string[];
  relatedSlugs?: string[];
};

export type TableOfContentsItem = {
  id: string;
  text: string;
  level: number;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  content: string;
  html: string;
  toc: TableOfContentsItem[];
};

function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractToc(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^(##|###)\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      id: slugifyHeading(match[2]),
      text: match[2].trim(),
      level: match[1].length,
    }));
}

async function markdownToHtml(markdown: string) {
  const withHeadingIds = markdown.replace(
    /^(##|###)\s+(.+)$/gm,
    (_, hashes: string, text: string) => `${hashes} <span id="${slugifyHeading(text)}"></span>${text}`,
  );

  const result = await remark().use(gfm).use(html, { sanitize: false }).process(withHeadingIds);
  return result.toString();
}

function readPostFile(slug: string) {
  const filePath = path.join(blogDirectory, `${slug}.md`);
  const source = readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return {
    slug,
    frontmatter: data as BlogFrontmatter,
    content,
  };
}

export function getBlogSlugs() {
  return readdirSync(blogDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export async function getBlogPosts() {
  const posts = await Promise.all(
    getBlogSlugs().map(async (slug) => {
      const { frontmatter, content } = readPostFile(slug);
      return {
        slug,
        ...frontmatter,
        content,
        toc: extractToc(content),
        html: await markdownToHtml(content),
      } satisfies BlogPost;
    }),
  );

  return posts.sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

export async function getBlogPostBySlug(slug: string) {
  if (!getBlogSlugs().includes(slug)) {
    return null;
  }

  const { frontmatter, content } = readPostFile(slug);
  return {
    slug,
    ...frontmatter,
    content,
    toc: extractToc(content),
    html: await markdownToHtml(content),
  } satisfies BlogPost;
}
