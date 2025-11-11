
// import { pathToFileURL } from 'url';
// import { existsSync } from 'fs';
// import { readFile } from 'fs/promises';
// // import { Article } from '../lib/types';
// // Load seed data dynamically to avoid build-time import errors if file is missing
// let newsData: any;

// type Article = {
//   title: string;
//   category: string;
//   subcategory?: string;
//   author: string;
//   published_date: string;
//   image?: string;
//   summary?: string;
//   content?: string;
//   tags?: string[];
// };

// interface NewsDataStructure {
//   articles: Omit<Article, 'created_at' | 'updated_at'>[];
// }

// export async function seedDatabase() {
//   try {
//     console.log('Starting database seeding...');
    
//     // Clear existing data (optional)
//     await query('DELETE FROM articles');
//     console.log('Cleared existing articles');

//     // Reset auto-increment sequence
//     await query('ALTER SEQUENCE articles_id_seq RESTART WITH 1');

//     if (!newsData) {
//       const jsonPath = new URL('../data/news.json', import.meta.url).pathname;
//       if (!existsSync(jsonPath)) {
//         console.warn('No seed data found at ../data/news.json; skipping seeding.');
//         return;
//       }
//       try {
//         const fileContents = await readFile(jsonPath, 'utf8');
//         newsData = JSON.parse(fileContents);
//       } catch (e) {
//         console.warn('Failed to read or parse ../data/news.json; skipping seeding.');
//         return;
//       }
//     }

//     const data = newsData as NewsDataStructure;
    
//     for (const article of data.articles) {
//       const insertQuery = `
//         INSERT INTO articles (
//           title, category, subcategory, author, published_date, 
//           image, summary, content, tags
//         ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9::text[])
//         RETURNING *;
//       `;
      
//       const values = [
//         article.title,
//         article.category,
//         article.subcategory || null,
//         article.author,
//         article.published_date,
//         article.image || null,
//         article.summary || null,
//         article.content || null,
//         article.tags || []
//       ];

//       const result = await query(insertQuery, values);
//       console.log(`Inserted article: ${article.title}`);
//     }

//     console.log('Database seeding completed successfully!');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//     throw error;
//   }
// }

// // Run seeding if this file is executed directly
// const isDirectRun = () => import.meta.url === pathToFileURL(process.argv[1] || '').href;

// if (isDirectRun()) {
//   seedDatabase()
//     .then(() => {
//       console.log('Seeding finished');
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('Seeding failed:', error);
//       process.exit(1);
//     });
// }