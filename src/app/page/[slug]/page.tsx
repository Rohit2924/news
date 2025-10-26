import { notFound } from 'next/navigation';
import prisma from '@/lib/models/prisma';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  const page = await prisma.pageContent.findUnique({
    where: { 
      pageSlug: slug,
      isActive: true 
    }
  });

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  return {
    title: page.metaTitle || page.pageTitle,
    description: page.metaDescription || '',
    keywords: page.metaKeywords || '',
    openGraph: {
      title: page.metaTitle || page.pageTitle,
      description: page.metaDescription || '',
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{page.pageTitle}</h1>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.pageContent }}
          />
        </div>
      </div>
    </div>
  );
}