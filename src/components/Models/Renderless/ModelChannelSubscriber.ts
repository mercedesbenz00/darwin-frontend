import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { TeamPayload } from '@/store/types'

/**
 * Automatically joins the models channel, to receive status update messages
 */
@Component({ name: 'model-channel-subscriber' })
export default class ModelChannelSubscriber extends Vue {
  @State(state => state.team.currentTeam)
  team!: TeamPayload

  get topic (): string {
    const { id: teamId } = this.team
    return `models:${teamId}`
  }

  @Watch('topic')
  async onTopic (topic: string, oldTopic: string | null) {
    if (oldTopic) { await this.$store.dispatch('neuralModel/leaveChannel', { topic: oldTopic }) }
    if (topic) {
      await this.$store.dispatch('neuralModel/joinChannel', { topic })
      this.$once('hook:beforeDestroy', () => {
        this.$store.dispatch('neuralModel/leaveChannel', { topic })
      })
    }
  }

  async mounted (): Promise<void> {
    await this.onTopic(this.topic, null)
  }

  render () { return null }
}
