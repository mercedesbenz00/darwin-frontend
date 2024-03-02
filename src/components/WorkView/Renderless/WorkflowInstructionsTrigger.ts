import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload } from '@/store/types'
import { viewedInstructionsOnDataset } from '@/utils/localStorageKeys'

/**
 * In charge of automatically showing instructions for a dataset, when user visits
 * the workflow for it for the first time
 */
@Component({ name: 'workflow-instructions-trigger' })
export default class WorkflowInstructionsTrigger extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.tutorialMode)
  tutorialMode!: boolean

  mounted () {
    const { dataset, tutorialMode } = this
    const key = viewedInstructionsOnDataset(dataset)
    if (tutorialMode || !window.localStorage.getItem(key)) {
      this.$ga.event('workview', 'show_full_instructions', 'automatically')
      this.$store.commit('workview/OPEN_INSTRUCTIONS')
      window.localStorage.setItem(key, 'true')
    }
  }

  render () { return null }
}
