// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { PageProvider, usePages } from '@/context/PageContext';

function PageContent({ slug }: { slug: string }) {
  const { getPageBySlug } = usePages();
  const page = getPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}

// Fixed: Make params async by using Promise and await
export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params Promise
  const { slug } = await params;
  
  return (
    <PageProvider>
      <PageContent slug={slug} />
    </PageProvider>
  );
}