import { getSession } from '@/lib/getSession';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/models/prisma';
import EditArticleForm from '@/components/editor/EditorArticleForm';

async function getArticle(id: string) {
  const article = await prisma.news.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!article) {
    notFound();
  }
  
  return article;
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) { // FIX: params is now Promise
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // FIX: Await the params Promise
  const { id } = await params;
  
  // Check if user is an editor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  if (user?.role !== 'EDITOR') {
    redirect('/dashboard');
  }
  
  const article = await getArticle(id); // FIX: Use the unwrapped id
  
  // Check if the editor is the author of the article
  if (article.author !== session.user.name) {
    redirect('/editor/dashboard');
  }
  
  return <EditArticleForm article={article} />;
}