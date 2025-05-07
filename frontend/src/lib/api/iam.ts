import { AdminApi, AppsApi, AuthApi, HealthCheckApi, OAuth2Api, SubscriptionsApi, UsersApi, UtilsApi, Configuration } from '@/client/iam'
import Cookies from 'js-cookie'

export const iamConfiguration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_IAM_API_URL!,
  baseOptions: { headers: { Authorization: Cookies.get('access_token') ? `Bearer ${Cookies.get('access_token')}` : '' } }
})

export const AdminService = new AdminApi(iamConfiguration)
export const AppsService = new AppsApi(iamConfiguration)
export const AuthService = new AuthApi(iamConfiguration)
export const HealthCheckService = new HealthCheckApi(iamConfiguration)
export const OAuth2Service = new OAuth2Api(iamConfiguration)
export const SubscriptionsService = new SubscriptionsApi(iamConfiguration)
export const UsersService = new UsersApi(iamConfiguration)
export const UtilsService = new UtilsApi(iamConfiguration)
