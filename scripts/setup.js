const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up News Portal Database...\n');
    
    // Step 1: Reset database
    console.log('🔄 Step 1: Resetting database...');
    try {
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      console.log('✅ Database reset successfully');
    } catch (error) {
      console.log('❌ Database reset failed');
      console.log('💡 Make sure your database is running and accessible');
      return;
    }
    
    // Step 2: Generate Prisma client
    console.log('\n📦 Step 2: Generating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully');
    } catch (error) {
      console.log('⚠️ Prisma client generation failed, continuing...');
    }
    
    // Step 3: Seed news data
    console.log('\n🌱 Step 3: Seeding news data...');
    await seedNewsData();
    
    // Step 4: Create default users
    console.log('\n👥 Step 4: Creating default users...');
    await createDefaultUsers();
    
    // Step 5: Verify setup
    console.log('\n🔍 Step 5: Verifying setup...');
    await verifySetup();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@newsportal.com / password123');
    console.log('   Editor: editor@newsportal.com / password123');
    console.log('   User: user@newsportal.com / password123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedNewsData() {
  try {
    // Look for news.json in the specified location first
    const newsDataPath = path.join(__dirname, '..', 'src', 'app', 'data', 'news.json');
    
    if (!fs.existsSync(newsDataPath)) {
      console.log(`⚠️ news.json not found at ${newsDataPath}`);
      console.log('Creating sample news instead...');
      await createSampleNews();
      return;
    }
    
    console.log(`📰 Found news.json at ${newsDataPath}`);
    
    // Read and parse the JSON file
    const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
    
    // Handle different possible JSON structures
    let articles = [];
    if (newsData.articles && Array.isArray(newsData.articles)) {
      articles = newsData.articles;
    } else if (Array.isArray(newsData)) {
      articles = newsData;
    } else {
      console.log('⚠️ Unexpected JSON structure. Expected array of articles or {articles: array}');
      await createSampleNews();
      return;
    }
    
    console.log(`📝 Found ${articles.length} articles to seed`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      try {
        // Validate required fields
        if (!article.title || !article.content) {
          console.log(`⚠️ Skipping article with missing title or content: ${article.title || 'Untitled'}`);
          errorCount++;
          continue;
        }

        // Find or create category
        let categoryRecord = await prisma.category.findFirst({
          where: { slug: article.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
        });
        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: {
              name: article.category,
              slug: article.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
              description: null
            }
          });
        }

        await prisma.news.create({
          data: {
            title: article.title,
            categoryId: categoryRecord.id,
            author: article.author || 'News Portal',
            published_date: article.published_date || new Date().toISOString().split('T')[0],
            image: article.image || 'https://via.placeholder.com/800x400?text=News+Article',
            imageUrl: article.imageUrl || article.image || 'https://via.placeholder.com/800x400?text=News+Article',
            summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
            content: article.content,
            tags: article.tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✅ Seeded: ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to seed article "${article.title}":`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 News seeding completed: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount === 0) {
      console.log('⚠️ No articles were successfully seeded. Creating sample news instead...');
      await createSampleNews();
    }
    
  } catch (error) {
    console.log('⚠️ News seeding failed:', error.message);
    console.log('Creating sample news instead...');
    await createSampleNews();
  }
}

async function createSampleNews() {
  try {
    const sampleNews = [
      {
        title: 'Welcome to News Portal',
        summary: 'Your trusted source for latest news and updates',
        content: 'This is a sample news article to get you started. The News Portal provides comprehensive coverage of current events, politics, technology, sports, and more.',
        category: 'general',
        author: 'News Portal Team'
      },
      {
        title: 'Database Successfully Reset',
        summary: 'Your news portal database has been reset and is ready for use',
        content: 'The database reset process has completed successfully. All data has been cleared and fresh content has been seeded. You can now start using the portal.',
        category: 'technology',
        author: 'System Administrator'
      }
    ];
    
    for (const article of sampleNews) {
      // Find or create category
      let categoryRecord = await prisma.category.findFirst({
        where: { slug: article.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
      });
      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: article.category,
            slug: article.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            description: null
          }
        });
      }
      await prisma.news.create({
        data: {
          title: article.title,
          summary: article.summary,
          content: article.content,
          categoryId: categoryRecord.id,
          author: article.author,
          image: 'https://via.placeholder.com/800x400?text=Sample+News',
          imageUrl: 'https://via.placeholder.com/800x400?text=Sample+News',
          published_date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log('✅ Created sample news articles');
    
  } catch (error) {
    console.log('⚠️ Sample news creation failed:', error.message);
  }
}

async function createDefaultUsers() {
  try {
    // Hash passwords
    const password = await bcrypt.hash('password123', 12);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@newsportal.com' },
      update: {},
      create: {
        email: 'admin@newsportal.com',
        name: 'Admin User',
        password: password,
        role: 'ADMIN',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        contactNumber: '+977-1-1234567'
      }
    });
    
    // Create editor user
    const editorUser = await prisma.user.upsert({
      where: { email: 'editor@newsportal.com' },
      update: {},
      create: {
        email: 'editor@newsportal.com',
        name: 'Editor User',
        password: password,
        role: 'EDITOR',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        contactNumber: '+977-1-1122334'
      }
    });
    
    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@newsportal.com' },
      update: {},
      create: {
        email: 'user@newsportal.com',
        name: 'Regular User',
        password: password,
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        contactNumber: '+977-1-7654321'
      }
    });
    
    console.log('✅ Default users created');
    console.log(`   Admin: ${adminUser.email}`);
    console.log(`   Editor: ${editorUser.email}`);
    console.log(`   User: ${regularUser.email}`);
    
  } catch (error) {
    console.log('⚠️ Default users creation failed:', error.message);
  }
}

async function verifySetup() {
  try {
    const [userCount, newsCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.comment.count()
    ]);
    
    console.log('📊 Database verification:');
    console.log(`   Users: ${userCount}`);
    console.log(`   News Articles: ${newsCount}`);
    console.log(`   Comments: ${commentCount}`);
    
    if (userCount >= 3 && newsCount > 0) {
      console.log('✅ Database setup verified successfully');
    } else {
      console.log('⚠️ Database setup may be incomplete');
    }
    
  } catch (error) {
    console.log('⚠️ Verification failed:', error.message);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };