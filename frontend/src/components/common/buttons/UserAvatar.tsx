import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatName } from '@/utils/formatName'
import { UserPublic } from '@/client/iam'

// Reusable Avatar Component
export default function UserAvatar({
  userData,
}: {
  userData: UserPublic
  onClick?: () => void
}) {
  return (
    <Avatar className='cursor-pointer h-9 w-9'>
      <AvatarImage
        src={userData?.avatar_url || ''}
        alt={userData?.fullname || 'User'}
      />
      <AvatarFallback>
        {formatName(userData?.fullname || userData.email[0])}
      </AvatarFallback>
    </Avatar>
  )
}
