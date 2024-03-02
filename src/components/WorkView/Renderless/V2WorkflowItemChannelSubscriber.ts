import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, V2DatasetItemPayload } from '@/store/types'

/**
 * Automatically joins the workflow 2.0 channel for a workflow item,
 * to receive state update messages
 */
@Component({ name: 'v2-workflow-item-channel-subscriber' })
export default class V2WorkflowItemChannelSubscriber extends Vue {
  get item (): V2DatasetItemPayload | null {
    return this.$store.getters['workview/v2SelectedDatasetItem']
  }

  @State((state: RootState) => state.auth.authenticated)
  authenticated!: boolean

  @Watch('item', { immediate: true })
  async onItem (
    newItem: V2DatasetItemPayload | null,
    oldItem: V2DatasetItemPayload | null
  ): Promise<void> {
    if (!this.authenticated || newItem?.id === oldItem?.id) { return }

    if (oldItem) {
      await this.$store.dispatch('workview/leaveV2WorkflowsChannel', oldItem)
    }

    if (newItem) {
      await this.$store.dispatch('workview/joinV2WorkflowsChannel', newItem)
      this.$once('hook:beforeDestroy', () => {
        this.$store.dispatch('workview/leaveV2WorkflowsChannel', newItem)
      })
    }
  }

  render (): null { return null }
}
