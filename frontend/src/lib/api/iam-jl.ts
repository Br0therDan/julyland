import { AdminApi, AppsApi, AuthApi, HealthCheckApi, OAuth2Api, SubscriptionsApi, UsersApi, UtilsApi, Configuration } from '@/client/iam-jl'
import Cookies from 'js-cookie'

export const iam-jlConfiguration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_IAM-JL_API_URL!,
  baseOptions: { headers: { Authorization: Cookies.get('access_token') ? `Bearer ${Cookies.get('access_token')}` : '' } }
})

export const AdminService = new AdminApi(iam-jlConfiguration)
export const AppsService = new AppsApi(iam-jlConfiguration)
export const AuthService = new AuthApi(iam-jlConfiguration)
export const HealthCheckService = new HealthCheckApi(iam-jlConfiguration)
export const OAuth2Service = new OAuth2Api(iam-jlConfiguration)
export const SubscriptionsService = new SubscriptionsApi(iam-jlConfiguration)
export const UsersService = new UsersApi(iam-jlConfiguration)
export const UtilsService = new UtilsApi(iam-jlConfiguration)
