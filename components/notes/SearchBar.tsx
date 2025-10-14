// components/notes/SearchBar.tsx
// 노트 검색 바 컴포넌트
// 사용자가 노트를 검색할 수 있는 입력 필드와 검색 버튼을 제공합니다
// 이 컴포넌트는 사용자가 원하는 노트를 빠르게 찾을 수 있게 하기 위해 존재합니다
// 관련 파일: app/notes/search/page.tsx, lib/actions/notes.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  placeholder = "노트 제목이나 내용으로 검색...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 검색어 초기화
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/notes/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    router.push('/notes')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <form onSubmit={handleSearch} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button type="submit" disabled={!query.trim()}>
        검색
      </Button>
    </form>
  )
}



