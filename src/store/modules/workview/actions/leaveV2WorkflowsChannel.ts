import { WorkviewAction } from '@/store/modules/workview/types'
import { V2DatasetItemPayload } from '@/store/types'
import { Socket } from '@/utils'

import { getItemChannelTopic } from './joinV2WorkflowsChannel'

/**
 * Leaves currently connected-to channel
 */
export const leaveV2WorkflowsChannel: WorkviewAction<V2DatasetItemPayload, void> = (
  { rootState },
  item
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[workview/joinV2WorkflowsChannel]: Current team not set') }

  const topic = getItemChannelTopic(currentTeam.id, item.id)
  Socket.leave(topic)
}
