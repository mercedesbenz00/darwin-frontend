import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, TeamPayload } from '@/store/types'

/**
 * Loads workflows for the current team
 */
@Component({ name: 'workflow-loader' })
export default class WorkflowLoader extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload | null

  @State((state: RootState) => state.ui.workerMode)
  readonly workerMode!: boolean

  @Watch('team', { immediate: true })
  @Watch('workerMode', { immediate: true })
  onTeam (): void {
    if (!this.team) { return }
    this.$store.dispatch('v2Workflow/loadWorkflows', { worker: this.workerMode })
  }

  render (): null {
    return null
  }
}
