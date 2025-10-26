import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';
import ArticleForm from '@/components/editor/ArticleForm';

export default function CreateArticlePage() {
  return (
    <EditorLayoutWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Article</h2>
        <ArticleForm />
      </div>
    </EditorLayoutWrapper>
  );
}
