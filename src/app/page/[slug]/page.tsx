// app/page/[slug]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/models/prisma';

export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  try {
    // Fetch page from database
    const page = await prisma.pageContent.findUnique({
      where: { 
        pageSlug: slug,
        isActive: true 
      }
    });

    if (!page) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center dark:bg-gray-900">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {page.pageTitle}
          </h1>
        </section>

        {/* Content Section */}
        <section className="container mx-auto py-12 px-6 md:px-12 dark:bg-gray-900 bg-white">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8 dark:bg-gray-900 border-2">
            <article
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.pageContent }}
            />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    notFound();
  }
}