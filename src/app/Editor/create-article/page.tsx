import { getSession } from '@/lib/getSession';
import { redirect } from 'next/navigation';
import prisma from '@/lib/models/prisma';
import CreateArticleForm from '@/components/editor/CreateArticleForm';

export default async function CreateArticlePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Check if user is an editor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true }
  });
  
  if (user?.role !== 'EDITOR') {
    redirect('/dashboard');
  }
  
  return <CreateArticleForm authorName={user.name || session.user.name} />;
}
