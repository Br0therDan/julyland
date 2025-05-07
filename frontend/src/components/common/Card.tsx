'use client'
import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MyCardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}


export default function MyCard({title, children, footer, className}: MyCardProps) {

  return (
    // <Card className={`flex flex-col w-[640px] mx-h-[400px]`}>
    <Card className={cn(
      'flex flex-col w-full h-full',
      className
    )}>
      <CardHeader>
        <CardTitle className='flex justify-center'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 w-full '>
        {children}
      </CardContent>
      <CardFooter>
        {footer}
      </CardFooter>
    </Card>
  )
}
