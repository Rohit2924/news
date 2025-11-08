'use client';
import { PageProvider } from '@/context/PageContext';
import PageManager from '@/components/admin/PageManager';
import EditorLayoutWrapper from '@/components/editor/EditorLayoutWrapper';

export default function EditorPages() {
  return (
    <EditorLayoutWrapper>
      <PageProvider>
        <PageManager />
      </PageProvider>
    </EditorLayoutWrapper>
  );
}

