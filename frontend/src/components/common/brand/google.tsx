import Image from 'next/image'
import React from 'react'

interface LogoProps {
  width?: number
  height?: number
}

export default function GoogleIcon({ width = 100, height = 100 }: LogoProps) {
  return (
    <Image
      src='/images/google_icon.png'
      alt='Google'
      width={width}
      height={height}
    />
  )
}
