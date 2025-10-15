import prisma from '@/lib/models/prisma';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  twitterCard?: string;
  siteUrl: string;
}

export async function getSiteSettings(): Promise<SEOData | null> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      return null;
    }

    return {
      title: settings.metaTitle,
      description: settings.metaDescription,
      keywords: settings.metaKeywords,
      ogImage: settings.ogImage || undefined,
      twitterCard: settings.twitterCard || undefined,
      siteUrl: settings.siteUrl
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export function generateMetaTags(seoData: SEOData, pageTitle?: string, pageDescription?: string) {
  const title = pageTitle ? `${pageTitle} | ${seoData.title}` : seoData.title;
  const description = pageDescription || seoData.description;

  return {
    title,
    description,
    keywords: seoData.keywords,
    openGraph: {
      title,
      description,
      url: seoData.siteUrl,
      siteName: seoData.title,
      images: seoData.ogImage ? [
        {
          url: seoData.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: seoData.twitterCard ? [seoData.twitterCard] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStructuredData(type: 'website' | 'article' | 'organization', data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return baseStructuredData;
}