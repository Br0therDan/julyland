
import React from 'react'

interface PageTitleProps {
  title: string
  description?: string
  className?: string
}

export default function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <h1 className='text-3xl capitalize font-semibold'>{title}</h1>
      <p className='text-sm capitalize '>{description}</p>
    </div>
  )
}
