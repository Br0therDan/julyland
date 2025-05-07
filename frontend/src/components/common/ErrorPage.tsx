import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorPageProps {
  statusCode: number
  title: string
  description: string
}

export default function ErrorPage({
  statusCode,
  title,
  description,
}: ErrorPageProps) {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center gap-4'>
      <h1 className='text-[6rem] font-bold text-primary leading-tight'>
        {statusCode}
      </h1>
      <p className='text-lg'>Something went wrong!!</p>
      <p className='text-lg text-red-500'>{title}</p>
      <p className='text-lg text-red-500'>{description}</p>

      <Button variant='outline' asChild>
        <Link href='/'>Go back</Link>
      </Button>
    </div>
  )
}
