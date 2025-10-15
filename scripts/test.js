const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  try {
    console.log('🧪 Running Comprehensive Tests...\n');
    
    // Test 1: Database Connection
    console.log('🔍 Test 1: Database Connection...');
    await testDatabaseConnection();
    
    // Test 2: User Authentication
    console.log('\n🔐 Test 2: User Authentication...');
    await testUserAuthentication();
    
    // Test 3: News Data
    console.log('\n📰 Test 3: News Data...');
    await testNewsData();
    
    // Test 4: Comments
    console.log('\n💬 Test 4: Comments...');
    await testComments();
    
    // Test 5: Categories
    console.log('\n🏷️ Test 5: Categories...');
    await testCategories();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Tests failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const [userCount, newsCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.comment.count()
    ]);
    
    console.log(`   Users: ${userCount}, News: ${newsCount}, Comments: ${commentCount}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function testUserAuthentication() {
  try {
    const users = [
      { email: 'admin@newsportal.com', role: 'ADMIN' },
      { email: 'editor@newsportal.com', role: 'EDITOR' },
      { email: 'user@newsportal.com', role: 'USER' }
    ];
    
    for (const user of users) {
      const foundUser = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (!foundUser) {
        console.log(`❌ User ${user.email} not found`);
        continue;
      }
      
      const isPasswordValid = await bcrypt.compare('password123', foundUser.password || '');
      const isRoleCorrect = foundUser.role === user.role;
      
      console.log(`   ${user.email}: Password ${isPasswordValid ? '✅' : '❌'}, Role ${isRoleCorrect ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.error('❌ User authentication test failed:', error.message);
    throw error;
  }
}

async function testNewsData() {
  try {
    const newsCount = await prisma.news.count();
    console.log(`   Total news articles: ${newsCount}`);
    
    if (newsCount > 0) {
      const sampleNews = await prisma.news.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          category: true,
          author: true
        }
      });
      
      console.log('   Sample articles:');
      sampleNews.forEach(news => {
        console.log(`     - ${news.title} (${news.category}) by ${news.author}`);
      });
    }
  } catch (error) {
    console.error('❌ News data test failed:', error.message);
    throw error;
  }
}

async function testComments() {
  try {
    const commentCount = await prisma.comment.count();
    console.log(`   Total comments: ${commentCount}`);
    
    if (commentCount > 0) {
      const recentComments = await prisma.comment.findMany({
        take: 3,
        include: {
          user: { select: { name: true } },
          news: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('   Recent comments:');
      recentComments.forEach(comment => {
        console.log(`     - "${comment.content}" by ${comment.user.name} on "${comment.news.title}"`);
      });
    }
  } catch (error) {
    console.error('❌ Comments test failed:', error.message);
    throw error;
  }
}

async function testCategories() {
  try {
    const categories = await prisma.news.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    console.log(`   Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`     - ${cat.category}: ${cat._count.category} articles`);
    });
  } catch (error) {
    console.error('❌ Categories test failed:', error.message);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };