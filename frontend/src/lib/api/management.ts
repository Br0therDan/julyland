import { BrandApi, CategoryApi, InventoryApi, ListingApi, MarketApi, MediaApi, ProductApi, RankingApi, VariantApi, Configuration } from '@/client/management'
import Cookies from 'js-cookie'

export const managementConfiguration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_MANAGEMENT_API_URL!,
  baseOptions: { headers: { Authorization: Cookies.get('access_token') ? `Bearer ${Cookies.get('access_token')}` : '' } }
})

export const BrandService = new BrandApi(managementConfiguration)
export const CategoryService = new CategoryApi(managementConfiguration)
export const InventoryService = new InventoryApi(managementConfiguration)
export const ListingService = new ListingApi(managementConfiguration)
export const MarketService = new MarketApi(managementConfiguration)
export const MediaService = new MediaApi(managementConfiguration)
export const ProductService = new ProductApi(managementConfiguration)
export const RankingService = new RankingApi(managementConfiguration)
export const VariantService = new VariantApi(managementConfiguration)
