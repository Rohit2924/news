// scripts/seedNews.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleNews() {
  try {
    console.log("🌱 Starting to seed sample news...\n");

    const sampleNews = [
      {
        title: "Echoes",
        category: "entertainment",
        subcategory: "Movies",
        author: "Anjali Rai",
        published_date: "2025-06-16",
        image: "https://images.unsplash.com/photo-1489599435384-2330488473c9?auto=format&fit=crop&w=1200&q=80",
        summary: "The latest Nepali movie has set new box office records, drawing large crowds and acclaim.",
        content: "<p>The romantic thriller 'Echoes of the Valley' has become the highest-grossing Nepali film of all time, earning over 15 crore in just three weeks. Directed by Pradeep Bhatta, the film's cinematography and performances received wide praise.</p>",
        tags: ["movies", "box office", "kollywood"]
      },
      {
        title: "Market",
        category: "business",
        subcategory: "Markets",
        author: "Ramesh Thapa",
        published_date: "2025-06-15",
        image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
        summary: "Local stocks rally after positive GDP data; investors upbeat for the quarter.",
        content: "<p>Following a stronger-than-expected quarterly GDP report, Nepali equity markets saw a broad rally led by financials and manufacturing. Analysts point to renewed investor confidence and improved export numbers.</p>",
        tags: ["stocks", "economy", "finance"]
      },
      {
        title: "Campus",
        category: "education",
        subcategory: "Universities",
        author: "Meera Koirala",
        published_date: "2025-06-14",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
        summary: "University introduces hybrid semester model to support working students.",
        content: "<p>Tribhuvan University announced a hybrid semester schedule that mixes in-person labs with online lectures to accommodate students with internships and jobs. The initiative aims to reduce dropouts and improve employment readiness.</p>",
        tags: ["education", "universities", "policy"]
      },
      {
        title: "Solar",
        category: "science",
        subcategory: "Environment",
        author: "Dipak Gurung",
        published_date: "2025-06-13",
        image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1200&q=80",
        summary: "New community solar project lights up remote village, cutting diesel use.",
        content: "<p>A community-owned solar microgrid began powering 120 homes in a remote district, replacing diesel generators and significantly lowering fuel costs and emissions for residents.</p>",
        tags: ["solar", "renewable", "environment"]
      },
      {
        title: "Tech",
        category: "technology",
        subcategory: "Startups",
        author: "Sanjay Bista",
        published_date: "2025-06-12",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        summary: "Local startup raises seed round to scale AI-driven agriculture tools.",
        content: "<p>A Kathmandu-based startup closed a seed funding round to expand its AI tools that help farmers optimize irrigation and crop yields, starting pilot programs in three districts.</p>",
        tags: ["startup", "agritech", "AI"]
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
          image: article.image,
          imageUrl: article.image,
          published_date: article.published_date,
          tags: article.tags || [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Seeded: ${article.title}`);
    }

    console.log("\n🎉 All 5 fake articles seeded successfully!");

  } catch (error) {
    console.error("⚠️ Failed to seed sample news:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// 🔽 This part ensures it actually runs when you do: node scripts/seedNews.js
if (require.main === module) {
  createSampleNews();
}
