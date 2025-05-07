import { Loader } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='flex flex-col items-center'>
        <Loader className='animate-spin w-12 h-12 text-blue-500' />
        <span className='mt-4 text-lg text-gray-700 dark:text-gray-300'>
          Loading...
        </span>
      </div>
    </div>
  )
}
