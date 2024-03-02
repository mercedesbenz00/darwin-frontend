<script lang="ts">
import LeaderLine from 'leader-line-new'
import { throttle } from 'lodash'
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue'

import { useLeaderLines } from '@/components/WorkflowCreation/useLeaderLines'
import { useStore } from '@/composables/useStore'
import { StageType, V2WorkflowEdgePayload } from '@/store/types'

const createLeaderLine = (startEl: HTMLElement, endEl: HTMLElement): LeaderLine =>
  new LeaderLine(startEl, endEl, {
    color: '#CACCCE',
    size: 4,
    path: 'fluid',
    startSocket: 'right',
    endSocket: 'left',
    endPlugSize: 1,
    startPlug: 'behind',
    endPlug: 'arrow1',
  })

export default defineComponent({
  props: {
    edge: { type: Object as () => V2WorkflowEdgePayload, required: true },
  },
  render () { return null },
  setup (props) {
    const {
      addLeaderLine,
      removeLeaderLine,
      updateLeaderLine
    }  = useLeaderLines()

    const store = useStore()

    onMounted(() => {
      const inConnector =
        document.getElementById(`${props.edge.target_stage_id}_default_in`)

      const outConnector =
        document.getElementById(`${props.edge.source_stage_id}_${props.edge.name}_out`)

      if (!inConnector || !outConnector) { throw new Error('DOM is invalid')}
      const line = createLeaderLine(outConnector, inConnector)

      addLeaderLine(props.edge.id, line)
    })

    onBeforeUnmount(() => {
      removeLeaderLine(props.edge.id)
    })

    const stageIn = computed(() => {
      return store.state.v2Workflow.editedWorkflow?.stages
        .find(s => props.edge.source_stage_id === s.id)
    })

    const stageOut = computed(() => {
      return store.state.v2Workflow.editedWorkflow?.stages
        .find(s => props.edge.target_stage_id === s.id)
    })

    // for test stages, their edges connect to the next stage, but it's the
    // parent consensus stage that actually has placement on the board

    const parentStageIn = computed(() =>
      stageIn.value?.type === StageType.ConsensusTest
        ? store.state.v2Workflow.editedWorkflow?.stages.find(
          s => s.type === StageType.ConsensusEntrypoint &&
            s.config.test_stage_id === stageIn.value?.id
        )
        : null
    )

    const parentStageOut = computed(() =>

      stageOut.value?.type === StageType.ConsensusTest
        ? store.state.v2Workflow.editedWorkflow?.stages.find(
          s => s.type === StageType.ConsensusEntrypoint &&
            s.config.test_stage_id === stageOut.value?.id
        )
        : null
    )

    const throttledUpdateLeaderLine = throttle(updateLeaderLine, 20)

    watch(() => [
      stageIn.value?.config.x,
      stageIn.value?.config.y,
      stageOut.value?.config.x,
      stageOut.value?.config.y,
      parentStageIn.value?.config.x,
      parentStageIn.value?.config.y,
      parentStageOut.value?.config.x,
      parentStageOut.value?.config.y
    ], () => {
      throttledUpdateLeaderLine(props.edge.id)
    })
  }
})
</script>
