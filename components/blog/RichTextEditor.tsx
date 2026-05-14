'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Heading3,
  Code, Minus, FileCode, X, Check
} from 'lucide-react'
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

export interface RichTextEditorHandle {
  insertLink: (anchor: string, url: string) => void
}

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  { content, onChange, placeholder = 'Begin met schrijven...', disabled = false },
  ref
) {
  const [showHtmlImport, setShowHtmlImport] = useState(false)
  const [htmlInput, setHtmlInput] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline hover:text-rose-hover' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useImperativeHandle(ref, () => ({
    insertLink(anchor: string, url: string) {
      if (!editor) return
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${anchor}</a>`)
        .run()
    }
  }), [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Afbeelding URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const importHtml = useCallback(() => {
    if (!editor || !htmlInput.trim()) return
    editor.commands.setContent(htmlInput.trim())
    onChange(editor.getHTML())
    setHtmlInput('')
    setShowHtmlImport(false)
  }, [editor, htmlInput, onChange])

  if (!editor) return null

  const ToolbarButton = ({
    onClick, isActive = false, disabled: btnDisabled = false, children, title
  }: {
    onClick: () => void; isActive?: boolean; disabled?: boolean; children: React.ReactNode; title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled || disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
      } ${(btnDisabled || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${disabled ? 'opacity-60' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Kop 1 (H1)"><Heading1 size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Kop 2 (H2)"><Heading2 size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Kop 3 (H3)"><Heading3 size={18} /></ToolbarButton>
        </div>
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Vet (Ctrl+B)"><Bold size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Cursief (Ctrl+I)"><Italic size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><Code size={18} /></ToolbarButton>
        </div>
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Ongeordende lijst"><List size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Genummerde lijst"><ListOrdered size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citaat"><Quote size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontale lijn"><Minus size={18} /></ToolbarButton>
        </div>
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Link toevoegen/bewerken"><LinkIcon size={18} /></ToolbarButton>
          <ToolbarButton onClick={addImage} title="Afbeelding via URL"><ImageIcon size={18} /></ToolbarButton>
        </div>
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Ongedaan maken (Ctrl+Z)"><Undo size={18} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Opnieuw (Ctrl+Y)"><Redo size={18} /></ToolbarButton>
        </div>
        {/* HTML Import toggle */}
        <button
          type="button"
          onClick={() => setShowHtmlImport(!showHtmlImport)}
          title="Plak HTML vanuit Gemini, ChatGPT of Word"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showHtmlImport
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileCode size={16} />
          HTML importeren
        </button>
      </div>

      {/* HTML Import Panel */}
      {showHtmlImport && (
        <div className="border-b border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-900">HTML importeren uit Gemini / ChatGPT / Word</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Plak de HTML-broncode — H1, H2, H3, vet, cursief en lijsten worden automatisch omgezet
              </p>
            </div>
            <button
              onClick={() => { setShowHtmlImport(false); setHtmlInput('') }}
              className="text-amber-600 hover:text-amber-900 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder={'<h1>Mijn artikel</h1>\n<p>Introductie...</p>\n<h2>Sectie 1</h2>\n<p>...</p>'}
            rows={7}
            className="w-full px-3 py-2 text-sm font-mono border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white resize-y"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={importHtml}
              disabled={!htmlInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check size={16} />
              Laden in editor
            </button>
            <button
              onClick={() => { setShowHtmlImport(false); setHtmlInput('') }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <span className="text-xs text-amber-600 ml-2">
              Let op: dit vervangt de huidige content
            </span>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none
          [&_.ProseMirror]:min-h-[350px] [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-2
          [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-6
          [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-medium [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4
          [&_.ProseMirror_p]:mb-3
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-3
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-3
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary
          [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-600
          [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline
        "
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
        <span>{editor.getText().length} karakters</span>
        <span>{editor.getText().split(/\s+/).filter(Boolean).length} woorden</span>
      </div>
    </div>
  )
})

export default RichTextEditor
