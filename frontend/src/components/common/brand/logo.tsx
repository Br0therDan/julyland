import { cn } from '@/lib/utils'
import React from 'react'
import PropTypes from 'prop-types'

export const MyLogo = ({
  alt = 'MyLogo',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <a href='/'>
      <img
        src='/images/logo_sq_light.png'
        alt={alt}
        className={cn('size-8 min-w-8 dark:hidden', className)} // Light 모드일 때
        {...props}
      />
    </a>
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
    <a href='/'>
      <img
        src='/images/logo_sq_dark.png'
        alt={alt}
        className={cn('size-8 min-w-8 hidden dark:block', className)} // Dark 모드일 때
        {...props}
      />
    </a>
  )
}

MyLogoDark.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
}

