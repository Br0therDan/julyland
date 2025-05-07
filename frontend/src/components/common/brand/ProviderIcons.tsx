import React from 'react'
import GoogleIcon from '@/components/common/brand/google'
import KakaoIcon from '@/components/common/brand/kakao'
import NaverIcon from '@/components/common/brand/naver'
import { MyLogo } from '@/components/common/brand/logo'

interface ProviderIconsProps {
  providers?: { oauth_name: string }[]
}

export default function ProviderIcons({ providers }: ProviderIconsProps) {
  if (!providers || providers.length === 0) {
    return <span>Local</span> // Provider 정보가 없는 경우
  }

  return (
    <div className='flex items-center gap-2'>
      {providers.map((account, index) => {
        switch (account.oauth_name) {
          case 'google':
            return <GoogleIcon key={index} width={30} height={30} />
          case 'kakao':
            return <KakaoIcon key={index} width={25} height={25} />
          case 'naver':
            return <NaverIcon key={index} width={25} height={25} />
          default:
            return <MyLogo key={index} width={25} height={25} />
        }
      })}
    </div>
  )
}
