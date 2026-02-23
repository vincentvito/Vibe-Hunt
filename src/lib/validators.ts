import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(140),
  description: z.string().min(20, "Description must be at least 20 characters"),
  engine: z.enum([
    "unity_webgl",
    "godot_web",
    "custom_wasm",
    "html5_canvas",
    "playcanvas",
    "phaserjs",
    "threejs",
    "other",
  ]),
  webBuildUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), "URL must use HTTPS")
    .optional()
    .or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  sourceCodeUrl: z.string().url().optional().or(z.literal("")),
  madeWithAi: z.boolean().default(false),
  aiToolsUsed: z.array(z.string()).default([]),
  tags: z.array(z.string()).max(5, "Max 5 tags").default([]),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
  gameId: z.string().min(1),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const createListingSchema = z.object({
  gameId: z.string().min(1),
  askingPrice: z.number().positive("Price must be positive"),
  minimumOffer: z.number().positive().optional(),
  assetType: z.enum([
    "full_ip",
    "codebase_only",
    "assets_only",
    "codebase_and_assets",
    "license_only",
  ]),
  includedAssets: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  description: z.string().min(20),
  transferMethod: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const createBountySchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  requirements: z.array(z.string()).default([]),
  budget: z.number().positive(),
  deadline: z.string().datetime().optional(),
  tags: z.array(z.string()).max(5).default([]),
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;

export const updateProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  discordHandle: z.string().max(37, "Discord handle too long").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createDevlogSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title too long"),
  body: z.string().min(10, "Body must be at least 10 characters").max(5000, "Maximum 5000 characters"),
  gameId: z.string().min(1),
});

export type CreateDevlogInput = z.infer<typeof createDevlogSchema>;
