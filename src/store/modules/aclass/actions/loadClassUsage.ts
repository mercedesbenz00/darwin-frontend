import { AClassAction } from '@/store/modules/aclass/types'
import { ClassUsagePayload } from '@/store/types'
import { loadClassUsage as request } from '@/utils/backend'

class ActionError extends Error {
  constructor (message: string) {
    super(`aclass/loadClassUsage: ${message}`)
  }
}

type Payload = { annotationClassIds: number[] }
type LoadClassUsage = AClassAction<Payload, ClassUsagePayload>

/**
 * Load class usage for the current team
 */
export const loadClassUsage: LoadClassUsage = async ({ rootState }, payload) => {
  if (!rootState.team.currentTeam) {
    throw new ActionError('Cannot load class usage while team is not set')
  }

  const params = {
    teamSlug: rootState.team.currentTeam.slug,
    annotation_class_ids: payload.annotationClassIds
  }

  const response = await request(params)
  return response
}
