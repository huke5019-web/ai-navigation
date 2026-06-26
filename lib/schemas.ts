import { z } from "zod";

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const integer = z.coerce.number().int();
const checkbox = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("1")])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true" || value === "1");
const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only HTTP(S) URLs are allowed");
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .pipe(httpUrl.optional());

function validDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
  if (!match) {
    return false;
  }

  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return (
    date.getUTCFullYear() === +match[1] &&
    date.getUTCMonth() === +match[2] - 1 &&
    date.getUTCDate() === +match[3] &&
    !Number.isNaN(new Date(value).getTime())
  );
}

const optionalDate = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || validDate(value), "Invalid date format")
  .transform((value) => (value ? new Date(value) : null));

export const loginSchema = z.object({
  username: text,
  password: z.string().min(1),
});

export const categorySchema = z.object({
  name: text,
  slug,
  icon: text.default("Sparkles"),
  sortOrder: integer.default(0),
  isActive: checkbox,
});

export const toolSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: text,
  slug,
  logoUrl: optionalUrl,
  summary: text,
  description: text,
  websiteUrl: httpUrl,
  officialUrl: optionalUrl,
  affiliateUrl: optionalUrl,
  sponsorLabel: z.string().trim().optional().default(""),
  couponCode: z.string().trim().optional().default(""),
  pricing: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  sortOrder: integer.default(0),
  isActive: checkbox,
  isFeatured: checkbox,
  isSponsored: checkbox,
});

export const adSchema = z
  .object({
    title: text,
    imageUrl: httpUrl,
    targetUrl: httpUrl,
    placement: z.enum(["HOME_BANNER", "HOME_SIDEBAR", "TOOL_DETAIL"]),
    startsAt: optionalDate,
    endsAt: optionalDate,
    sortOrder: integer.default(0),
    isActive: checkbox,
  })
  .refine(
    ({ startsAt, endsAt }) => !startsAt || !endsAt || startsAt <= endsAt,
    {
      message: "End date cannot be earlier than the start date",
      path: ["endsAt"],
    },
  );

export const settingsSchema = z.object({
  siteName: text,
  siteDescription: text,
  logoUrl: optionalUrl,
  footerText: text,
});
