'use client'

import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

import { AuthService, UsersService } from '@/lib/api'
import { handleApiError } from '@/lib/errorHandler'
import { NewPassword, UserPublic } from '@/client/iam'
import { LoginRequest, AuthContextType } from '@/types/auth'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const router = useRouter()

  /**
   * [중요] 서버에서 최신 사용자 정보를 불러오고 쿠키에 저장
   */
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const response = await UsersService.usersReadUserMe()
      if (response.data) {
        setUser(response.data)
        // 받아온 최신 user 데이터를 쿠키에도 저장
        Cookies.set('user_data', JSON.stringify(response.data))
      } else {
        await handleLogout()
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } }; message: string })
          .response?.data?.detail || (err as { message: string }).message
      setError(errorMsg)
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      setLoading(false)
    }
  }, [router])

  /**
   * [중요] 페이지 로드시 쿠키 확인 → user_data 쿠키가 있으면 즉시 user 상태로 세팅
   *        필요한 경우 서버에 재검증 (refreshUser) 로직까지
   */
  useEffect(() => {
    const token = Cookies.get('access_token')
    const storedUser = Cookies.get('user_data')

    if (token && storedUser) {
      try {
        // 1. 쿠키에서 user_data 먼저 파싱해서 상태 세팅
        const parsedUser: UserPublic = JSON.parse(storedUser)
        setUser(parsedUser)
        setLoading(false) // 쿠키만으로도 우선 로딩은 끝낸다

        // 2. 원하면 서버 호출로 재검증 (optional)
        // refreshUser()
      } catch (err: unknown) {
        // 파싱 에러 → 쿠키 제거 후 다시 fetch
        if (err instanceof Error) {
          console.error(err)
        Cookies.remove('user_data')
        refreshUser()
        } 
      }
    } else if (token && !storedUser) {
      // 토큰은 있는데 user_data가 없으니, 서버 호출해서 받아와야 함
      refreshUser()
    } else {
      // 토큰이 없으므로 인증 안 된 상태
      setLoading(false)
    }
  }, [refreshUser])

  /**
   * [중요] 로그아웃
   * 쿠키, 상태 정리 후 /auth/login 으로 리다이렉트
   */
  const handleLogout = async () => {
    try {
      await AuthService.authLogout()
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } }; message: string })
          .response?.data?.detail || (err as { message: string }).message
      setError(errorMsg)
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      Cookies.remove('user_data')
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      Cookies.remove('token_type')
      setUser(null)
      router.push('/auth/login')
    }
  }

  /**
   * [중요] 로그인
   * 성공 시 user_data 쿠키 저장
   */
  const login = async (data: LoginRequest, redirectPath?: string) => {
    setLoading(true)
    try {
      const response = await AuthService.authLoginAccessToken(
        data.username,
        data.password
      )

      // 토큰 저장
      Cookies.set('access_token', response.data.access_token)
      if (response.data.refresh_token) {
        Cookies.set('refresh_token', response.data.refresh_token)
      }

      // 서버에서 user 정보 가져오기
      const userResponse = await UsersService.usersReadUserMe()
      if (userResponse.data) {
        setUser(userResponse.data)
        // 쿠키에도 사용자 정보를 저장
        Cookies.set('user_data', JSON.stringify(userResponse.data))
      }

      toast.success("로그인 성공", {
        description: "대시보드로 이동합니다.",
      })

      router.push(redirectPath || '/main')
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } }; message: string })
          .response?.data?.detail || (err as { message: string }).message
      setError(errorMsg)
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * 비밀번호 찾기
   */
  const forgotPassword = async (email: string) => {
    setLoading(true)
    try {
      await AuthService.authRecoverPassword(email)
      toast.success("이메일 전송 성공", {
        description: "비밀번호 재설정 이메일이 발송되었습니다.",
      })
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } }; message: string })
          .response?.data?.detail || (err as { message: string }).message
      setError(errorMsg)
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * 비밀번호 재설정
   */
  const resetPassword = async (data: NewPassword) => {
    setLoading(true)
    try {
      await AuthService.authResetPassword(data)
      toast.success("비밀번호 재설정 성공", {
        description:  "새로운 비밀번호로 로그인하세요.",
      })
      router.push('/auth/login')
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } }; message: string })
          .response?.data?.detail || (err as { message: string }).message
      setError(errorMsg)
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        login,
        logout: handleLogout,
        forgotPassword,
        resetPassword,
        refreshUser, // 수동 새로고침 가능
        resetError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
