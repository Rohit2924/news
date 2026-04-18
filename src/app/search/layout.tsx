import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search News | News Portal',
  description: 'Search for news articles across all categories',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
