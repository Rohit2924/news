// components/RichTextEditor.tsx
'use client';
import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Underline"
        >
          <u>U</u>
        </button>
        
        {/* Headings */}
        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Numbered List"
        >
          1. List
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Align Right"
        >
          ➡
        </button>

        {/* Links */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) executeCommand('createLink', url);
          }}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Insert Link"
        >
          🔗
        </button>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
          title="Clear Formatting"
        >
          🧹
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[400px] p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-lg"
        style={{ 
          lineHeight: '1.6',
          fontFamily: 'Arial, sans-serif',
          direction: 'ltr', // Force left-to-right text direction
          textAlign: 'left' // Force left alignment
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}