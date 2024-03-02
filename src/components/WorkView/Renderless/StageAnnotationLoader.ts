import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { WorkflowStagePayload } from '@/store/types'
/**
 * Reports image change to workview channel on backend
 *
 * Renderless component
 */
@Component({ name: 'stage-annotation-loader' })
export default class StageAnnotationLoader extends Vue {
  @State(state => state.workview.selectedStageInstance)
  selectedStageInstance!: WorkflowStagePayload | null

  @Watch('selectedStageInstance.id', { immediate: true })
  loadAnnotations (): void {
    const { selectedStageInstance } = this
    if (!selectedStageInstance) { return }

    this.$store.dispatch('workview/loadStageAnnotations', selectedStageInstance)
  }

  render (): null {
    return null
  }

  beforeDestroy (): void {
    this.$store.commit('workview/CLEAR_STAGE_ANNOTATIONS')
  }
}
