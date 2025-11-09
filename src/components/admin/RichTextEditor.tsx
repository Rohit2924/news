// components/RichTextEditor.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { sanitizeArticleContent } from '@/lib/utils/sanitize';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      // Sanitize content when loading
      const sanitized = sanitizeArticleContent(content);
      editorRef.current.innerHTML = sanitized;
      // Update parent if sanitization changed content
      if (sanitized !== content) {
        onChange(sanitized);
      }
    }
  }, [content, onChange]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      // Sanitize content before updating parent
      const sanitized = sanitizeArticleContent(editorRef.current.innerHTML);
      editorRef.current.innerHTML = sanitized;
      onChange(sanitized);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      // Sanitize the image HTML before inserting
      const imageHTML = sanitizeArticleContent(`<img src="${url}" alt="image" style="max-width: 100%; height: auto;" />`);
      executeCommand('insertHTML', imageHTML);
    }
  };

  const insertHorizontalRule = () => {
    executeCommand('insertHTML', '<hr style="margin: 1rem 0;" />');
  };

  const toggleHighlight = () => {
    const color = prompt('Enter highlight color (e.g., #ffeb3b, #90caf9):', '#ffeb3b');
    if (color) {
      executeCommand('hiliteColor', color);
    }
  };

  const toggleSuperscript = () => {
    executeCommand('superscript');
  };

  const toggleSubscript = () => {
    executeCommand('subscript');
  };

  const insertCodeBlock = () => {
    executeCommand('insertHTML', '<pre><code>Enter code here</code></pre>');
  };

  // Toolbar button component for consistency
  const ToolbarButton = ({ 
    onClick, 
    title, 
    children, 
    isActive = false 
  }: { 
    onClick: () => void; 
    title: string; 
    children: React.ReactNode;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '6px 8px',
        border: 'none',
        background: isActive 
          ? (isDarkMode ? '#4b5563' : '#e5e7eb') 
          : 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        color: isDarkMode ? '#d1d5db' : '#374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDarkMode ? '#4b5563' : '#e5e7eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive 
          ? (isDarkMode ? '#4b5563' : '#e5e7eb') 
          : 'transparent';
      }}
    >
      {children}
    </button>
  );

  const ToolbarSeparator = () => (
    <div 
      style={{ 
        width: '1px', 
        height: '24px', 
        background: isDarkMode ? '#374151' : '#d1d5db', 
        margin: '0 4px' 
      }} 
    />
  );

  return (
    <div className={`simple-editor-wrapper ${isDarkMode ? 'dark' : ''}`}>
      {/* Toolbar */}
      <div 
        role="toolbar" 
        aria-label="toolbar" 
        style={{
          display: 'flex',
          padding: '8px 12px',
          background: isDarkMode ? '#1f2937' : '#f9fafb',
          borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap'
        }}
      >
        {/* History Group */}
        <div style={{ flex: 1 }}></div>
        
        {/* Undo/Redo */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <ToolbarButton onClick={() => executeCommand('undo')} title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.70711 3.70711C10.0976 3.31658 10.0976 2.68342 9.70711 2.29289C9.31658 1.90237 8.68342 1.90237 8.29289 2.29289L3.29289 7.29289C2.90237 7.68342 2.90237 8.31658 3.29289 8.70711L8.29289 13.7071C8.68342 14.0976 9.31658 14.0976 9.70711 13.7071C10.0976 13.3166 10.0976 12.6834 9.70711 12.2929L6.41421 9H14.5C15.0909 9 15.6761 9.1164 16.2221 9.34254C16.768 9.56869 17.2641 9.90016 17.682 10.318C18.0998 10.7359 18.4313 11.232 18.6575 11.7779C18.8836 12.3239 19 12.9091 19 13.5C19 14.0909 18.8836 14.6761 18.6575 15.2221C18.4313 15.768 18.0998 16.2641 17.682 16.682C17.2641 17.0998 16.768 17.4313 16.2221 17.6575C15.6761 17.8836 15.0909 18 14.5 18H11C10.4477 18 10 18.4477 10 19C10 19.5523 10.4477 20 11 20H14.5C15.3536 20 16.1988 19.8319 16.9874 19.5052C17.7761 19.1786 18.4926 18.6998 19.0962 18.0962C19.6998 17.4926 20.1786 16.7761 20.5052 15.9874C20.8319 15.1988 21 14.3536 21 13.5C21 12.6464 20.8319 11.8012 20.5052 11.0126C20.1786 10.2239 19.6998 9.50739 19.0962 8.90381C18.4926 8.30022 17.7761 7.82144 16.9874 7.49478C16.1988 7.16813 15.3536 7 14.5 7H6.41421L9.70711 3.70711Z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('redo')} title="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.7071 2.29289C15.3166 1.90237 14.6834 1.90237 14.2929 2.29289C13.9024 2.68342 13.9024 3.31658 14.2929 3.70711L17.5858 7H9.5C7.77609 7 6.12279 7.68482 4.90381 8.90381C3.68482 10.1228 3 11.7761 3 13.5C3 14.3536 3.16813 15.1988 3.49478 15.9874C3.82144 16.7761 4.30023 17.4926 4.90381 18.0962C6.12279 19.3152 7.77609 20 9.5 20H13C13.5523 20 14 19.5523 14 19C14 18.4477 13.5523 18 13 18H9.5C8.30653 18 7.16193 17.5259 6.31802 16.682C5.90016 16.2641 5.56869 15.768 5.34254 15.2221C5.1164 14.6761 5 14.0909 5 13.5C5 12.3065 5.47411 11.1619 6.31802 10.318C7.16193 9.47411 8.30653 9 9.5 9H17.5858L14.2929 12.2929C13.9024 12.6834 13.9024 13.3166 14.2929 13.7071C14.6834 14.0976 15.3166 14.0976 15.7071 13.7071L20.7071 8.70711C21.0976 8.31658 21.0976 7.68342 20.7071 7.29289L15.7071 2.29289Z"/>
            </svg>
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Text Structure */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            style={{
              padding: '6px 8px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
              background: isDarkMode ? '#374151' : 'white',
              color: isDarkMode ? 'white' : '#374151',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="blockquote">Quote</option>
          </select>
          
          <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbered List">
            1.
          </ToolbarButton>

          <ToolbarButton onClick={() => executeCommand('formatBlock', 'blockquote')} title="Blockquote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 6C8 5.44772 8.44772 5 9 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H9C8.44772 7 8 6.55228 8 6Z M4 3C4.55228 3 5 3.44772 5 4L5 20C5 20.5523 4.55229 21 4 21C3.44772 21 3 20.5523 3 20L3 4C3 3.44772 3.44772 3 4 3Z M8 12C8 11.4477 8.44772 11 9 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H9C8.44772 13 8 12.5523 8 12Z M8 18C8 17.4477 8.44772 17 9 17H16C16.5523 17 17 17.4477 17 18C17 18.5523 16.5523 19 16 19H9C8.44772 19 8 18.5523 8 18Z"/>
            </svg>
          </ToolbarButton>

          <ToolbarButton onClick={insertCodeBlock} title="Code Block">
            &lt;/&gt;
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Text Formatting */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <ToolbarButton onClick={() => executeCommand('bold')} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('italic')} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('strikeThrough')} title="Strikethrough">
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'pre')} title="Code">
            &lt;/&gt;
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('underline')} title="Underline">
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton onClick={toggleHighlight} title="Highlight">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.7072 4.70711C15.0977 4.31658 15.0977 3.68342 14.7072 3.29289C14.3167 2.90237 13.6835 2.90237 13.293 3.29289L8.69294 7.89286L8.68594 7.9C8.13626 8.46079 7.82837 9.21474 7.82837 10C7.82837 10.2306 7.85491 10.4584 7.90631 10.6795L2.29289 16.2929C2.10536 16.4804 2 16.7348 2 17V20C2 20.5523 2.44772 21 3 21H12C12.2652 21 12.5196 20.8946 12.7071 20.7071L15.3205 18.0937C15.5416 18.1452 15.7695 18.1717 16.0001 18.1717C16.7853 18.1717 17.5393 17.8639 18.1001 17.3142L22.7072 12.7071C23.0977 12.3166 23.0977 11.6834 22.7072 11.2929C22.3167 10.9024 21.6835 10.9024 21.293 11.2929L16.6971 15.8887C16.5105 16.0702 16.2605 16.1717 16.0001 16.1717C15.7397 16.1717 15.4897 16.0702 15.303 15.8887L10.1113 10.697C9.92992 10.5104 9.82837 10.2604 9.82837 10C9.82837 9.73963 9.92992 9.48958 10.1113 9.30297L14.7072 4.70711ZM13.5858 17L9.00004 12.4142L4 17.4142V19H11.5858L13.5858 17Z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => {
            const url = prompt('Enter URL:');
            if (url) executeCommand('createLink', url);
          }} title="Insert Link">
            🔗
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Superscript/Subscript */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <ToolbarButton onClick={toggleSuperscript} title="Superscript">
            x<sup>2</sup>
          </ToolbarButton>
          <ToolbarButton onClick={toggleSubscript} title="Subscript">
            H<sub>2</sub>O
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Alignment */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <ToolbarButton onClick={() => executeCommand('justifyLeft')} title="Align Left">
            ⬅
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('justifyCenter')} title="Align Center">
            ↔
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('justifyRight')} title="Align Right">
            ➡
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Media */}
        <div role="group" style={{ display: 'flex', gap: '2px' }}>
          <ToolbarButton onClick={insertImage} title="Add Image">
            🖼️
          </ToolbarButton>
          <ToolbarButton onClick={insertHorizontalRule} title="Horizontal Rule">
            ―
          </ToolbarButton>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Theme Toggle */}
        <ToolbarButton onClick={toggleDarkMode} title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
          {isDarkMode ? '☀️' : '🌙'}
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        style={{
          minHeight: '400px',
          padding: '16px',
          color: isDarkMode ? 'white' : '#374151',
          background: isDarkMode ? '#1f2937' : 'white',
          lineHeight: '1.6',
          fontFamily: 'Arial, sans-serif',
          outline: 'none'
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}