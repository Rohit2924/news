'use client';
import Head from 'next/head';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  twitterCard?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  twitterCard,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps) {
  const { settings } = useSiteSettings();
  
  const siteTitle = title ? `${title} | ${settings?.siteName || 'News Portal'}` : settings?.metaTitle || 'News Portal - Latest News';
  const siteDescription = description || settings?.metaDescription || 'Stay updated with the latest news and updates';
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteName = settings?.siteName || 'News Portal';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={keywords || settings?.metaKeywords || ''} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage || settings?.ogImage || ''} />
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {ogImage && <meta property="og:image:alt" content={siteTitle} />}
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={twitterCard || settings?.twitterCard || ''} />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': type === 'article' ? 'NewsArticle' : 'WebSite',
            headline: siteTitle,
            description: siteDescription,
            url: siteUrl,
            ...(type === 'article' && {
              datePublished: publishedTime,
              dateModified: modifiedTime || publishedTime,
              author: {
                '@type': 'Person',
                name: author || siteName
              },
              publisher: {
                '@type': 'Organization',
                name: siteName,
                logo: {
                  '@type': 'ImageObject',
                  url: ogImage || settings?.ogImage || '/logo.png'
                }
              }
            })
          })
        }}
      />
    </Head>
  );
}