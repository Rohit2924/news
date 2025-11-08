'use client';
import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update title
    document.title = siteTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (attribute: 'name' | 'property', attributeValue: string, content: string) => {
      const selector = `meta[${attribute}="${attributeValue}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic Meta Tags
    updateMetaTag('name', 'description', siteDescription);
    updateMetaTag('name', 'keywords', keywords || settings?.metaKeywords || '');
    updateMetaTag('name', 'robots', 'index, follow');
    
    // Canonical URL
    updateLinkTag('canonical', siteUrl);
    
    // Open Graph Tags
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:title', siteTitle);
    updateMetaTag('property', 'og:description', siteDescription);
    updateMetaTag('property', 'og:url', siteUrl);
    updateMetaTag('property', 'og:site_name', siteName);
    updateMetaTag('property', 'og:image', ogImage || settings?.ogImage || '');
    
    if (ogImage) {
      updateMetaTag('property', 'og:image:width', '1200');
      updateMetaTag('property', 'og:image:height', '630');
      updateMetaTag('property', 'og:image:alt', siteTitle);
    }
    
    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('property', 'article:published_time', publishedTime);
      }
      if (modifiedTime) {
        updateMetaTag('property', 'article:modified_time', modifiedTime);
      }
      if (author) {
        updateMetaTag('property', 'article:author', author);
      }
      if (section) {
        updateMetaTag('property', 'article:section', section);
      }
      tags.forEach((tag, index) => {
        let tagElement = document.querySelector(`meta[property="article:tag"][data-index="${index}"]`) as HTMLMetaElement;
        if (!tagElement) {
          tagElement = document.createElement('meta');
          tagElement.setAttribute('property', 'article:tag');
          tagElement.setAttribute('data-index', index.toString());
          document.head.appendChild(tagElement);
        }
        tagElement.setAttribute('content', tag);
      });
    }
    
    // Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', siteTitle);
    updateMetaTag('name', 'twitter:description', siteDescription);
    updateMetaTag('name', 'twitter:image', twitterCard || settings?.twitterCard || '');
    
    // Additional SEO Tags
    updateMetaTag('name', 'theme-color', '#2563eb');
    updateMetaTag('name', 'msapplication-TileColor', '#2563eb');
    
    // Structured Data
    let scriptElement = document.querySelector('script[type="application/ld+json"][data-seo]') as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      scriptElement.setAttribute('data-seo', 'true');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify({
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
    });
  }, [siteTitle, siteDescription, keywords, ogImage, twitterCard, url, type, publishedTime, modifiedTime, author, section, tags, settings]);

  return null;
}