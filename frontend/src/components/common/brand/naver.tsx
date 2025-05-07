import Image from 'next/image'
import React from 'react'

interface LogoProps {
  width?: number
  height?: number
}

export default function NaverIcon({ width = 100, height = 100 }: LogoProps) {
  return (
    <Image
      src='/images/naver_icon.png'
      alt='Naver'
      width={width}
      height={height}
    />
  )
}
