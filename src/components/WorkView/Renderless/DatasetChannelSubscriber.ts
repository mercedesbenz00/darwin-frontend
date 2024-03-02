import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload, RootState } from '@/store/types'

/**
 * Automatically joins the dataset channel, to receive status update messages
 */
@Component({ name: 'dataset-channel-subscriber' })
export default class DatasetChannelSubscriber extends Vue {
  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.auth.authenticated)
  authenticated!: boolean

  get topic (): string {
    return `dataset:${this.dataset.id}`
  }

  @Watch('topic')
  async onTopic (topic: string, oldTopic: string | null) {
    if (oldTopic) { await this.$store.dispatch('workview/leaveChannel', { topic: oldTopic }) }
    if (!this.authenticated) { return }
    if (topic) {
      await this.$store.dispatch('workview/joinChannel', { topic })
      this.$once('hook:beforeDestroy', () => {
        this.$store.dispatch('workview/leaveChannel', { topic })
      })
    }
  }

  async mounted (): Promise<void> {
    await this.onTopic(this.topic, null)
  }

  render () { return null }
}
