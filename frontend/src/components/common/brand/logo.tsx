import { cn } from '@/lib/utils'
import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

export const MyLogo = ({
  alt = 'MyLogo',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <Link href='/'>
      <img
        src='/images/logo_sq_light.png'
        alt={alt}
        className={cn('size-8 min-w-8 dark:hidden', className)} // Light 모드일 때
        {...props}
      />
    </Link>
  )
}

MyLogo.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
}

export const MyLogoDark = ({
  alt = 'MyLogo Dark',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <Link href='/'>
      <img
        src='/images/logo_sq_dark.png'
        alt={alt}
        className={cn('size-8 min-w-8 hidden dark:block', className)} // Dark 모드일 때
        {...props}
      />
    </Link>
  )
}

MyLogoDark.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
}

