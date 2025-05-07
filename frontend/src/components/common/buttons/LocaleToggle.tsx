'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname.split('/')[1]

  const handleLocaleChange = (locale: 'en' | 'ko' | 'ja') => {
    const segments = pathname.split('/')
    segments[1] = locale

    // ✅ 쿠키에 로케일 저장 (쿠키 만료: 30일 설정 가능)
    Cookies.set('NEXT_LOCALE', locale, { expires: 30 })

    router.push(segments.join('/'))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost'>
          {currentLocale === 'ko'
            ? '한국어'
            : currentLocale === 'ja'
              ? '日本語'
              : 'English'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleLocaleChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange('ko')}>
          한국어
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange('ja')}>
          日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
