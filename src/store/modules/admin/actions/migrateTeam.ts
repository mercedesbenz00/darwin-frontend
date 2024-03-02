import { AdminAction } from '@/store/modules/admin/types'
import { FeaturePayload } from '@/store/types/FeaturePayload'
import { migrateTeam as request } from '@/utils/backend'

type MigrateTeam = AdminAction<{ teamId: number, feature: FeaturePayload['name'] }, any>

/**
 * Migrate a team to workflows
 */
export const migrateTeam: MigrateTeam = async (context, payload) => {
  const { teamId, feature } = payload

  const response = await request({ teamId, feature })
  return response
}
