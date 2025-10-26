import { Article } from '../app/components/NewsGrid';

export function useFilteredArticles(articles: Article[], category: string): Article[] {
  return articles.filter(
    (a) => a.category.toLowerCase() === category.toLowerCase()
  );
} 