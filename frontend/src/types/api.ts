export interface ApiErrorResponse {
  detail?: string
  message?: string
}

export type ToastType = (opts: { title: string; description: string }) => void
