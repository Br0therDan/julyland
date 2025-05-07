'use client'
import React from 'react'
import UserAvatar from './UserAvatar'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RiAdminLine } from 'react-icons/ri'

export default function UserButton() {
  const { user: userData, logout } = useAuth()
  const t = useTranslations()
  const router = useRouter()
  const handleLogout = () => {
    logout()
  }

  if (!userData)
    return (
      <Button variant='ghost' size='icon' className='text-white'>
        <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700'>
          <User className='h-5 w-5' />
        </div>
      </Button>
    )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' data-testid='user-menu'>
          <UserAvatar userData={userData} />
          <span className='sr-only'>Open sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-64 p-0'>
        {/* <VisuallyHidden> */}
        <SheetTitle></SheetTitle>
        {/* </VisuallyHidden> */}
        <div className='flex items-center px-4 mt-8 py-2 gap-3 text-sm'>
          <UserAvatar userData={userData} />
          <div>
            <h1 className='text-lg font-semibold'>
              {userData.fullname || 'No Name'}
            </h1>
            <h1 className='text-xs text-gray-600'>{userData.email}</h1>
          </div>
        </div>

        <div className='border-t'></div>

        <ul className='space-y-1 px-4'>
          {userData?.is_superuser == true && (
            <li>
              <Button variant='ghost' onClick={() => router.push('/admin')}>
                <RiAdminLine className='h-5 w-5 mr-2' />
                {t('user_button.admin_dashboard')}
              </Button>
            </li>
          )}
          <li>
            <Button variant='ghost' onClick={() => router.push('/main')}>
              <LayoutDashboard className='h-5 w-5 mr-2' />
              {t('user_button.dashboard')}
            </Button>
          </li>
          <li>
            <Button
              variant='ghost'
              onClick={() => router.push('/main/settings')}
            >
              <User className='h-5 w-5 mr-2' />
              {t('user_button.profile')}
            </Button>
          </li>
          <li
            className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
            onClick={handleLogout}
          >
            <LogOut className='h-5 w-5 mr-2' />
            {t('user_button.logout')}
          </li>
        </ul>
      </SheetContent>
    </Sheet>
  )
}
