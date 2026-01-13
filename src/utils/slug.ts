import slugify from 'slugify';
import { prisma } from '../config/database';

export async function generateSlug(title: string, existingSlug?: string): Promise<string> {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  // If existing slug is provided and matches, return it
  if (existingSlug && existingSlug === baseSlug) {
    return baseSlug;
  }

  // Check if slug exists
  const existing = await prisma.blog.findUnique({
    where: { slug: baseSlug },
    select: { slug: true },
  });

  if (!existing) {
    return baseSlug;
  }

  // If exists, append number
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (true) {
    const check = await prisma.blog.findUnique({
      where: { slug: newSlug },
      select: { slug: true },
    });

    if (!check) {
      return newSlug;
    }

    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }
}
