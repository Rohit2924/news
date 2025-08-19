const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function upsertNewsData() {
  try {
    console.log('Starting non-destructive news upsert...');

    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    let created = 0;
    let updated = 0;

    for (const article of jsonData.articles) {
      // Try to find by title (case-insensitive)
      const existing = await prisma.news.findFirst({
        where: { title: { equals: article.title, mode: 'insensitive' } },
        select: { id: true, title: true, updatedAt: true },
      });

      const data = {
        title: article.title,
        category: article.category,
        subcategory: article.subcategory || null,
        author: article.author,
        published_date: article.published_date,
        image: article.image || '',
        summary: article.summary || '',
        content: article.content || '',
        tags: article.tags || [],
      };

      if (!existing) {
        await prisma.news.create({ data });
        created += 1;
        console.log(`Created: ${article.title}`);
      } else {
        await prisma.news.update({ where: { id: existing.id }, data });
        updated += 1;
        console.log(`Updated: ${article.title}`);
      }
    }

    const count = await prisma.news.count();
    console.log(`Upsert complete. Created: ${created}, Updated: ${updated}. Total rows: ${count}`);
  } catch (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

upsertNewsData();
