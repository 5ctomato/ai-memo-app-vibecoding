// components/notes/AdvancedCreateNoteForm.tsx
// 고급 텍스트 편집 기능이 포함된 노트 생성 폼 컴포넌트
// 마크다운 에디터, 실시간 미리보기, 텍스트 포맷팅 도구 등을 제공합니다
// 이 컴포넌트는 사용자가 다양한 텍스트 편집 기능을 사용하여 새 노트를 작성할 수 있게 하기 위해 존재합니다
// 관련 파일: app/notes/create/page.tsx, components/notes/CreateNoteForm.tsx

'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createNoteAndRedirect } from '@/lib/actions/notes'
import { z } from 'zod'
import { 
  Home, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image,
  Table,
  Eye,
  Edit3,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Search,
  Replace,
  FileText,
  Palette,
  Save
} from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

const noteSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이내로 입력해주세요.'),
  content: z.string().max(10000, '본문은 10,000자 이내로 입력해주세요.').optional(),
})

type NoteFormState = {
  title: string
  content: string
  titleError: string | null
  contentError: string | null
  formError: string | null
}

type EditorMode = 'write' | 'preview' | 'split'

interface AdvancedCreateNoteFormProps {
  className?: string
}

export function AdvancedCreateNoteForm({ className }: AdvancedCreateNoteFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [formState, setFormState] = useState<NoteFormState>({
    title: '',
    content: '',
    titleError: null,
    contentError: null,
    formError: null,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('write')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value, [`${name}Error`]: null, formError: null }))

    // Real-time validation
    if (name === 'title') {
      const result = z.string().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        titleError: result.success ? null : (result.error.errors[0]?.message || '제목 검증 오류')
      }))
    } else if (name === 'content') {
      const result = z.string().max(10000, '본문은 10,000자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        contentError: result.success ? null : (result.error.errors[0]?.message || '본문 검증 오류')
      }))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setFormState(prev => ({ ...prev, formError: null }))

    try {
      const result = await createNoteAndRedirect(formData)
      
      if (!result.success) {
        setFormState(prev => ({ ...prev, formError: result.error || '노트 생성에 실패했습니다.' }))
      }
    } catch (err) {
      setFormState(prev => ({ ...prev, formError: '예상치 못한 오류가 발생했습니다.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 텍스트 포맷팅 함수들
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formState.content.substring(start, end)
    const newText = before + selectedText + after
    
    const newContent = formState.content.substring(0, start) + newText + formState.content.substring(end)
    
    setFormState(prev => ({ ...prev, content: newContent }))

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = formState.content.substring(0, start) + text + formState.content.substring(end)
    
    setFormState(prev => ({ ...prev, content: newContent }))

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  // 포맷팅 버튼들
  const formatButtons = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: '굵게' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: '기울임' },
    { icon: Strikethrough, action: () => insertText('~~', '~~'), tooltip: '취소선' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: '인라인 코드' },
    { icon: Quote, action: () => insertText('> ', ''), tooltip: '인용문' },
    { icon: List, action: () => insertText('- ', ''), tooltip: '순서 없는 목록' },
    { icon: ListOrdered, action: () => insertText('1. ', ''), tooltip: '순서 있는 목록' },
    { icon: LinkIcon, action: () => insertText('[텍스트](', ')'), tooltip: '링크' },
    { icon: Image, action: () => insertText('![이미지 설명](', ')'), tooltip: '이미지' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">새 노트 작성</h1>
          <p className="text-muted-foreground">마크다운 문법을 사용하여 노트를 작성하세요.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              홈
            </Button>
          </Link>
          
          {/* 에디터 모드 전환 */}
          <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as EditorMode)}>
            <TabsList>
              <TabsTrigger value="write" className="gap-2">
                <Edit3 className="h-4 w-4" />
                편집
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                미리보기
              </TabsTrigger>
              <TabsTrigger value="split" className="gap-2">
                <FileText className="h-4 w-4" />
                분할
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 노트 작성</CardTitle>
          <CardDescription>제목과 본문을 입력하여 새 노트를 생성하세요. 마크다운 문법을 지원합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                제목 <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="노트 제목을 입력하세요"
                maxLength={200}
                value={formState.title}
                onChange={handleInputChange}
                required
              />
              {formState.titleError && <p className="text-sm text-red-500">{formState.titleError}</p>}
              <p className="text-sm text-muted-foreground">최대 200자까지 입력 가능합니다.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  본문
                </label>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {formState.content.length}/10,000
                  </Badge>
                </div>
              </div>

              {/* 포맷팅 도구바 */}
              <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-gray-50">
                {formatButtons.map((button, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    className="h-8 w-8 p-0"
                    title={button.tooltip}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertAtCursor('\n---\n')}
                  className="h-8 px-2 text-xs"
                  title="구분선"
                >
                  구분선
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertAtCursor('\n```\n\n```\n')}
                  className="h-8 px-2 text-xs"
                  title="코드 블록"
                >
                  코드 블록
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertAtCursor('\n| 열1 | 열2 | 열3 |\n|-----|-----|-----|\n|     |     |     |\n')}
                  className="h-8 px-2 text-xs"
                  title="테이블"
                >
                  테이블
                </Button>
              </div>

              {/* 에디터 영역 */}
              <div className="grid gap-4" style={{ gridTemplateColumns: editorMode === 'split' ? '1fr 1fr' : '1fr' }}>
                {/* 편집 영역 */}
                {(editorMode === 'write' || editorMode === 'split') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Edit3 className="h-4 w-4" />
                      편집 모드
                    </div>
                    <textarea
                      ref={textareaRef}
                      id="content"
                      name="content"
                      placeholder="마크다운 문법을 사용하여 노트 내용을 입력하세요..."
                      rows={20}
                      maxLength={10000}
                      value={formState.content}
                      onChange={handleInputChange}
                      className="flex min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                {/* 미리보기 영역 */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      미리보기
                    </div>
                    <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-800 prose-code:text-gray-900 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-700 prose-table:text-sm prose-th:bg-gray-50 prose-td:border-gray-200 min-h-[500px] p-4 border rounded-lg bg-white">
                      {formState.content ? (
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            a({ href, children, ...props }) {
                              return (
                                <a 
                                  href={href} 
                                  className="text-blue-600 hover:text-blue-800 underline" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              )
                            },
                            table({ children, ...props }) {
                              return (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border-collapse border border-gray-200" {...props}>
                                    {children}
                                  </table>
                                </div>
                              )
                            },
                            th({ children, ...props }) {
                              return (
                                <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left font-semibold" {...props}>
                                  {children}
                                </th>
                              )
                            },
                            td({ children, ...props }) {
                              return (
                                <td className="border border-gray-200 px-4 py-2" {...props}>
                                  {children}
                                </td>
                              )
                            }
                          }}
                        >
                          {formState.content}
                        </Markdown>
                      ) : (
                        <div className="text-gray-500 italic">내용이 없습니다.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {formState.contentError && <p className="text-sm text-red-500">{formState.contentError}</p>}
              <p className="text-sm text-muted-foreground">마크다운 문법을 지원합니다. 미리보기 탭에서 결과를 확인하세요.</p>
            </div>
            
            {formState.formError && <p className="text-sm text-red-500 text-center">{formState.formError}</p>}
            
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formState.title.trim()}
                className="min-w-[100px] gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? '저장 중...' : '노트 생성'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
