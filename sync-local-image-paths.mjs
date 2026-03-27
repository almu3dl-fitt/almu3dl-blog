#!/usr/bin/env node
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "article-image-manifest.json");

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  let updated = 0;
  let missing = 0;

  for (const item of manifest) {
    const post = await prisma.post.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });

    if (!post) {
      missing += 1;
      console.warn(`[MISSING POST] ${item.slug}`);
      continue;
    }

    await prisma.post.update({
      where: { slug: item.slug },
      data: { coverImageUrl: item.publicPath },
    });

    const coverMedia = await prisma.media.findFirst({
      where: { postId: post.id, type: "cover" },
      select: { id: true },
    });

    if (coverMedia) {
      await prisma.media.update({
        where: { id: coverMedia.id },
        data: {
          url: item.publicPath,
          altText: item.title,
          type: "cover",
        },
      });
    } else {
      await prisma.media.create({
        data: {
          postId: post.id,
          url: item.publicPath,
          altText: item.title,
          type: "cover",
        },
      });
    }

    updated += 1;
    console.log(`[UPDATED] ${item.slug} -> ${item.publicPath}`);
  }

  console.log(`Done. Updated posts: ${updated}, Missing posts: ${missing}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
