import { debounce } from 'lodash'

import { WorkviewAction } from '@/store/modules/workview/types'
import { TeamPayload, V2DatasetItemPayload, V2WorkflowItemStatePayload } from '@/store/types'
import { Socket, Channel, constructError } from '@/utils'

type JoinChannel = WorkviewAction<V2DatasetItemPayload, void>
type JoinResult = Promise<{ channel: Channel | null, error: { message: string } | null }>

const resolve = async (topic: string): JoinResult => {
  let result

  try {
    result = await Socket.connectAndJoin(topic) as { channel: Channel }
  } catch {
    result = { channel: null, error: { message: 'Workflow 2.0 channel not available' } }
  }

  return { error: null, ...result }
}

export const getItemChannelTopic = (
  teamId: TeamPayload['id'],
  itemId: V2DatasetItemPayload['id']
): string => `workflow_item:${teamId}:${itemId}`

/**
 * Performs initial join on the workflows 2.0 channel,
 * setting the topic and binding to events
 */
export const joinV2WorkflowsChannel: JoinChannel = async (
  { dispatch, commit, state, rootState }, item
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[workview/joinV2WorkflowsChannel]: Current team not set') }

  const topic = getItemChannelTopic(currentTeam.id, item.id)

  const { channel, error } = await resolve(topic)
  if (error) { return constructError('SOCKET_ERROR', error.message) }
  if (!channel) { throw new Error("Couldn't setup workflows channel") }

  const refreshItem = debounce(() => {
    dispatch('dataset/refreshV2DatasetItemStage', {
      teamSlug: currentTeam.slug,
      itemId: item.id
    }, { root: true })
  }, 300)

  const refreshAnnotations = debounce(() => {
    dispatch('loadV2Annotations', state.selectedDatasetItemV2Id)
  }, 300)

  channel.on('workflow_item:state', (payload: { state: V2WorkflowItemStatePayload }) => {
    if (
      state.v2SelectedStageInstance?.stage_id !==
        payload.state.current_stage_instances?.[0]?.stage_id
    ) {
      refreshItem()
      refreshAnnotations()
    }

    commit('SET_V2_WORKFLOW_ITEM_STATE', payload.state)
  })
}
