import { computed, watch, onBeforeUnmount, onMounted, Ref } from 'vue'

import { useStore } from '@/composables/useStore'
import { ItemsDeletedV2, ItemsUpdatedV2 } from '@/utils/datasetChannel'
import { constructError, ParsedError } from '@/utils/error'
import { Socket, Channel } from '@/utils/socket'

type Options = {
  onItemsUpdated?: (payload: ItemsUpdatedV2) => void
  onItemsDeleted?: (payload: ItemsDeletedV2) => void
}

/**
 * Automatically joins and maintains connection with v2 dataset channels for
 * the specified dataset ids
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDatasetChannel = (datasetIds: Ref<number[]>, options: Options = {}) => {
  const store = useStore()

  /**
   * If we are not authenticated, we should not be connecting to the dataset channel
   */
  const authenticated = computed<boolean>(() => store.state.auth.authenticated)

  const topics = computed(() => datasetIds.value.map(id => `dataset_v2:${id}`))

  const resolveChannel = async (
    topic: string
  ): Promise<{ channel: Channel | null, error: { message: string  } | null }> => {
    let result

    try {
      result = await Socket.connectAndJoin(topic)
    } catch {
      result = { channel: null, error: { message: 'Dataset channel not available' } }
    }

    return { error: null, ...result }
  }

  const joinChannel = async (
    topic: string
  ): Promise<ReturnType<typeof resolveChannel> | ParsedError | undefined> => {
    const { channel, error } = await resolveChannel(topic)

    if (error) { return constructError('SOCKET_ERROR', error.message) }
    if (!channel) { throw new Error("Couldn't setup dataset channel") }

    channel.on('items_updated', (payload: ItemsUpdatedV2) =>
      options.onItemsUpdated && options.onItemsUpdated(payload)
    )

    channel.on('items_deleted', (payload: ItemsDeletedV2) =>
      options.onItemsDeleted && options.onItemsDeleted(payload)
    )
  }

  const leaveChannel = (topicParam: string): Promise<void> => Socket.leave(topicParam)

  const unsubscribeTopics = (topics: string[]): void => topics.forEach(leaveChannel)

  const subscribeTopics = async (topics: string[]): Promise<void> => {
    if (!authenticated.value) { return }
    await Promise.all(topics.map(joinChannel))
    return
  }

  watch(topics, (newTopics, oldTopics) => {
    unsubscribeTopics(oldTopics || [])
    subscribeTopics(newTopics)
  })

  onMounted(() => {
    subscribeTopics(topics.value)
  })

  onBeforeUnmount(() => {
    unsubscribeTopics(topics.value)
  })

  return {}
}
