/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import { formats, toolbarOptions } from './toolbarOption'
import { ImageActions } from '@xeger/quill-image-actions'
import { ImageFormats } from '@xeger/quill-image-formats'
import QuillNoSSRWrapper from './container'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import 'react-quill/dist/quill.snow.css'
import ReactQuill from 'react-quill'

if (typeof window !== 'undefined') {
  const ReactQuill = require('react-quill')
  const { Quill } = ReactQuill
  Quill.register('modules/imageActions', ImageActions)
  Quill.register('modules/imageFormats', ImageFormats)
  try {
    const QuillMarkdown = require('quilljs-markdown')
    Quill.register('modules/markdownShortcuts', QuillMarkdown)
  } catch (err) {
    console.warn('quilljs-markdown 모듈이 설치되지 않았습니다.')
  }
}

hljs.configure({ languages: ['javascript', 'css', 'html', 'xml', 'python'] })

interface QuillEditorProps {
  initialValue: string
  onChange: (value: string) => void
}

export default function QuillEditor({
  initialValue,
  onChange,
}: QuillEditorProps) {
  const [value, setValue] = useState(initialValue)
  const quillInstance = useRef<ReactQuill | null>(null)

  // react-hook-form 연동을 위해 값 변경 시 onChange 호출
  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  // 이미지 업로드 핸들러: 파일 선택 후 base64 변환하여 삽입
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.style.display = 'none'
    input.setAttribute('accept', 'image/*')
    document.body.appendChild(input)
    input.click()

    input.onchange = async () => {
      const file = input && input.files ? input.files[0] : null
      if (file && quillInstance.current) {
        base64Handler(quillInstance.current, file)
      }
      if (document.body.contains(input)) {
        document.body.removeChild(input)
      }
    }
  }

  const modules = useMemo(
    () => ({
      keyboard: { bindings: { tab: false } },
      imageActions: {},
      syntax: { highlight: (text: string) => hljs.highlightAuto(text).value },
      imageFormats: {},
      toolbar: {
        container: toolbarOptions,
        handlers: { image: imageHandler },
      },
      // markdownShortcuts: {},
    }),
    []
  )

  return (
    <QuillNoSSRWrapper
      forwardedRef={quillInstance}
      value={value}
      onChange={setValue}
      modules={modules}
      formats={formats}
      style={{
        height: 'min(70vh, 500px)',
        marginBottom: '100px',
      }}
      theme='snow'
    />
  )
}

function base64Handler(current: ReactQuill, file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result
    const range = current.getEditor().getSelection()
    if (range) {
      current.getEditor().insertEmbed(range.index, 'image', base64)
    }
  }
  reader.readAsDataURL(file)
}
