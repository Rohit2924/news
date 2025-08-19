const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateNewsData() {
  try {
    console.log('Starting news data migration...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`Found ${jsonData.articles.length} articles to migrate`);
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing news data...');
    await prisma.news.deleteMany({});
    
    // Migrate each article
    for (const article of jsonData.articles) {
      console.log(`Migrating article: ${article.title}`);
      
      await prisma.news.create({
        data: {
          title: article.title,
          category: article.category,
          subcategory: article.subcategory || null,
          author: article.author,
          published_date: article.published_date,
          image: article.image,
          summary: article.summary,
          content: article.content,
          tags: article.tags || [],
        }
      });
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the data
    const count = await prisma.news.count();
    console.log(`Total articles in database: ${count}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateNewsData();
