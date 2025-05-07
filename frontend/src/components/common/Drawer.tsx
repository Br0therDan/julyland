'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  // DrawerClose,
  DrawerContent,
  DrawerDescription,
  // DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface DrawerProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function MyDrawer({
  title,
  children,
  description,
}: DrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>{title}</Button>
      </DrawerTrigger>
      <DrawerContent className='h-[70%]'>
        <div className='mx-auto w-full px-4 space-y-4'>
          <DrawerHeader>
            <DrawerTitle className='text-2xl'>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className='px-4'>{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
