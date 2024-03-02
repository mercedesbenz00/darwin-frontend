import { syncApiKeys as request } from '@/utils/backend'

/**
 * Force sync API keys with Wind
 */
export const syncApiKeys = async () => {
  const response = await request()
  return response
}
