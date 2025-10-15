// components/notes/AdvancedEditNoteForm.tsx
// 고급 텍스트 편집 기능이 포함된 노트 수정 폼 컴포넌트
// 마크다운 에디터, 실시간 미리보기, 텍스트 포맷팅 도구 등을 제공합니다
// 이 컴포넌트는 사용자가 다양한 텍스트 편집 기능을 사용하여 노트를 편집할 수 있게 하기 위해 존재합니다
// 관련 파일: app/notes/[id]/edit/page.tsx, components/notes/EditNoteForm.tsx

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { updateNote, autoSaveNote } from '@/lib/actions/notes'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Save, 
  Check, 
  AlertCircle, 
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
  Palette
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
  isTemporarySaved: boolean
  temporarySaveTime: Date | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type EditorMode = 'write' | 'preview' | 'split'

interface AdvancedEditNoteFormProps {
  note: {
    id: string
    title: string
    content: string
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      <Save className="h-4 w-4" />
      {pending ? '저장 중...' : '저장'}
    </Button>
  )
}

export function AdvancedEditNoteForm({ note }: AdvancedEditNoteFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [formState, setFormState] = useState<NoteFormState>({
    title: note.title,
    content: note.content,
    titleError: null,
    contentError: null,
    formError: null,
    isTemporarySaved: false,
    temporarySaveTime: null,
  })
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('write')
  const [selectedText, setSelectedText] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)

  // 임시 저장 관련 함수들
  const TEMP_SAVE_KEY = `temp-note-${note.id}`
  
  const saveToLocalStorage = useCallback((title: string, content: string) => {
    try {
      const tempData = {
        title,
        content,
        timestamp: new Date().toISOString(),
        noteId: note.id
      }
      localStorage.setItem(TEMP_SAVE_KEY, JSON.stringify(tempData))
      setFormState(prev => ({
        ...prev,
        isTemporarySaved: true,
        temporarySaveTime: new Date()
      }))
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error)
    }
  }, [TEMP_SAVE_KEY, note.id])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(TEMP_SAVE_KEY)
      if (saved) {
        const tempData = JSON.parse(saved)
        if (tempData.noteId === note.id) {
          return {
            title: tempData.title,
            content: tempData.content,
            timestamp: new Date(tempData.timestamp)
          }
        }
      }
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error)
    }
    return null
  }, [TEMP_SAVE_KEY, note.id])

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(TEMP_SAVE_KEY)
      setFormState(prev => ({
        ...prev,
        isTemporarySaved: false,
        temporarySaveTime: null
      }))
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error)
    }
  }, [TEMP_SAVE_KEY])

  // 실시간 저장을 위한 디바운스 훅
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }


  // 컴포넌트 마운트 시 임시 저장된 데이터 로드
  useEffect(() => {
    const tempData = loadFromLocalStorage()
    if (tempData) {
      setFormState(prev => ({
        ...prev,
        title: tempData.title,
        content: tempData.content,
        isTemporarySaved: true,
        temporarySaveTime: tempData.timestamp
      }))
    }
  }, [loadFromLocalStorage])

  const handleAutoSave = useCallback(async (data: { title: string, content: string }) => {
    setSaveStatus('saving')
    try {
      const result = await autoSaveNote(note.id, data)
      if (result.success) {
        setSaveStatus('saved')
        setHasUnsavedChanges(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [note.id])

  // 실시간 저장
  useEffect(() => {
    if (formState.title !== note.title || formState.content !== note.content) {
      if (formState.title.trim() && formState.title !== note.title) {
        handleAutoSave(formState)
      }
    }
  }, [formState.title, formState.content, note.title, note.content, handleAutoSave])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value, [`${name}Error`]: null, formError: null }))
    setHasUnsavedChanges(true)

    // 임시 저장 (즉시)
    const newTitle = name === 'title' ? value : formState.title
    const newContent = name === 'content' ? value : formState.content
    saveToLocalStorage(newTitle, newContent)

    // Real-time validation
    if (name === 'title') {
      const result = z.string().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        titleError: result.success ? null : (result.error.issues[0]?.message || '제목 검증 오류')
      }))
    } else if (name === 'content') {
      const result = z.string().max(10000, '본문은 10,000자 이내로 입력해주세요.').safeParse(value)
      setFormState(prev => ({ 
        ...prev, 
        contentError: result.success ? null : (result.error.issues[0]?.message || '본문 검증 오류')
      }))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setFormState(prev => ({ ...prev, formError: null }))
    setSaveStatus('saving')

    const result = await updateNote(note.id, formData)

    if (result.success) {
      setSaveStatus('saved')
      setHasUnsavedChanges(false)
      clearLocalStorage() // 임시 저장 클리어
      router.push(`/notes/${note.id}`)
    } else {
      setFormState(prev => ({ ...prev, formError: result.error || null }))
      setSaveStatus('error')
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
    setHasUnsavedChanges(true)
    saveToLocalStorage(formState.title, newContent)

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
    setHasUnsavedChanges(true)
    saveToLocalStorage(formState.title, newContent)

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

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'saved':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return '저장 중...'
      case 'saved':
        return '저장됨'
      case 'error':
        return '저장 실패'
      default:
        if (formState.isTemporarySaved) {
          return `임시 저장됨 (${formState.temporarySaveTime?.toLocaleTimeString()})`
        }
        return hasUnsavedChanges ? '저장되지 않음' : ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                홈
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold">고급 노트 편집</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getSaveStatusIcon()}
              <span>{getSaveStatusText()}</span>
            </div>
          </div>
        </div>
        
        {/* 에디터 모드 전환 */}
        <div className="flex items-center gap-2">
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
          <CardTitle>노트 수정</CardTitle>
          <CardDescription>제목과 본문을 수정하세요. 변경사항은 자동으로 저장됩니다.</CardDescription>
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
                    <Textarea
                      ref={textareaRef}
                      id="content"
                      name="content"
                      placeholder="마크다운 문법을 사용하여 노트 내용을 입력하세요..."
                      rows={20}
                      maxLength={10000}
                      value={formState.content}
                      onChange={handleInputChange}
                      className="font-mono text-sm leading-relaxed"
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
                            code(props) {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              const { node, inline, className, children, ...restProps } = props as any
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                                  <code className={className} {...restProps}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...restProps}>
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
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


