import React from 'react'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

export default function Notification() {
  return (
    <div>
      <Button variant='ghost' className='hover:bg-cyan-900' size='icon'>
        <span className='sr-only'>View notifications</span>
        <Bell className='h-5 w-5' aria-hidden='true' />
      </Button>
    </div>
  )
}
