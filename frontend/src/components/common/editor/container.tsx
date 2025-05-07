/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import dynamic from 'next/dynamic'
import { ReactQuillProps } from 'react-quill'
import Loading from '../Loading'

interface ForwardedQuillComponent extends ReactQuillProps {
  forwardedRef: React.Ref<any>
}

const QuillNoSSRWrapper = dynamic<ForwardedQuillComponent>(
  async () => {
    const { default: QuillComponent } = await import('react-quill')
    const Quill = ({ forwardedRef, ...props }: ForwardedQuillComponent) => (
      <QuillComponent ref={forwardedRef} {...props} />
    )
    return Quill
  },
  {
    ssr: false,
    loading: () => <Loading />,
  }
)

export default QuillNoSSRWrapper
