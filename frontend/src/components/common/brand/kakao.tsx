import Image from 'next/image'
import React from 'react'

interface LogoProps {
  width?: number
  height?: number
}

export default function KakaoIcon({ width = 100, height = 100 }: LogoProps) {
  return (
    <Image
      src='/images/kakao_icon.png'
      alt='Kakao'
      width={width}
      height={height}
    />
  )
}
