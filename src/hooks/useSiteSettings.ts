'use client';
import { useState, useEffect } from 'react';

interface SiteSettings {
  id?: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteFavicon?: string;
  siteUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage?: string;
  twitterCard?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  footerText: string;
  footerLinks?: any;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/site-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || 'Failed to fetch site settings');
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError('Failed to fetch site settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refetch: fetchSiteSettings
  };
}
