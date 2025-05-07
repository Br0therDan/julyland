import React from 'react'
import { MyLogo, MyLogoDark } from '@/components/common/brand/logo'
import { SidebarTrigger } from '../ui/sidebar'

interface HeaderProps {
  title?: string
  className?: string
  children?: React.ReactNode
}
export default function Header({
  title,
  className,
  children,
}: HeaderProps) {
  return (
    <header className={`sticky h-14 px-1 top-0 z-40 ${className}`}>
      <SidebarTrigger />
      <div className='relative mx-3 hidden sm:block'>
        <div className='flex items-center gap-3'>
          <MyLogo className='size-10 block' />
          <h1 className='text-xl font-bold'>
            {title ? title : null}
          </h1>
        </div>
      </div>
      {children}
    </header>
  )
}
