'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Link,
  Unlink,
} from 'lucide-react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  className?: string;
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px',
  readOnly = false,
  showToolbar = true,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none px-4 py-3 min-h-[200px] ${className}`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-[#FACC15] text-[#111827]'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={readOnly}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1 items-center">
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        className="min-h-[200px] max-h-[500px] overflow-y-auto relative"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
        
        {/* Empty state placeholder */}
        {editor.isEmpty && (
          <div className="absolute top-3 left-4 text-slate-400 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract plain text from HTML
export function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Helper function to strip HTML tags (for preview)
export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
