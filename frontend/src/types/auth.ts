// src/types/auth.ts
import { NewPassword, UserPublic } from '@/client/iam'

export interface AuthContextType {
  user: UserPublic | null
  loading: boolean // 로딩 상태
  error: string | null // 에러 상태
  logout: () => Promise<void> // 비동기 처리
  login: (data: LoginRequest, redirectPath?: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: NewPassword) => Promise<void>
  refreshUser: () => Promise<void> // refreshUser 함수 추가
  resetError?: () => void // 에러 상태 초기화 함수
}

export interface LoginRequest {
  username: string
  password: string
  redirectPath?: string
}
