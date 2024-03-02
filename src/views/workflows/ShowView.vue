<template>
  <div class="workflow-creation">
    <RunningSessionLoader />
    <CreationHeader />
    <Workflow
      @select-stage="selectStage"
      :loading="loading || !workflow"
    >
      <template #sidebar-content>
        <StageSidebarTemplate
          v-for="stage in sidebarStages"
          :class="{
            'wf--dragable': !isDragging,
            'wf--dragging': isDragging
          }"
          :key="stage"
          :type="stage"
          :transform="transform"
          @on-drag-start="onStartDragging"
          @on-drag-end="createEntity"
        >
          <template #icon>
            <component :is="getIconComponent(stage)" />
          </template>
        </StageSidebarTemplate>
      </template>
      <template #playground-area-content>
        <Grid
          :class="{
            'wf--dragable': !isDragging,
            'wf--dragging': isDragging
          }"
          :loading="loading || !workflow"
          :edges="edges"
          @transform="onTransform"
          @bg-click="selectStage(null)"
        >
          <GridItem
            v-for="stage in filteredStages"
            :key="stage.id"
            :id="stage.id"
            :x="stage.config.x"
            :y="stage.config.y"
            @dragging="onStageDragging(stage, $event)"
            @drag-end="onStopDragging()"
            @activated="selectStage(stage)"
            v-slot="{ dragging }"
          >
            <StageTemplate
              :scale="transform.scale"
              :stage="stage"
              :selected="dragging || !!selectedStage && selectedStage.id === stage.id"
              @click="selectStage(stage)"
            >
              <template #icon>
                <component :is="getIconComponent(stage.type)" />
              </template>
              <template #content>
                <component
                  :is="getComponent(stage.type)"
                  :scale="transform.scale"
                  :stage="stage"
                />
              </template>
            </StageTemplate>
          </GridItem>
        </Grid>
      </template>
    </Workflow>
    <confirmation-dialog
      button-text="Discard"
      cancel-button-text="Stay here"
      name="confirm-leaving-workflow-page"
      title="Do you want to discard your changes?"
      detail="If you continue, your unsaved changes will be lost."
      :confirm-button-color="confirmButtonColor"
      :click-to-close="true"
      @confirmed="onModalContinue"
      @canceled="onModalCancel"
    />
  </div>
</template>

<script lang="ts">
import { isEqual, debounce } from 'lodash'
import { Transform } from 'panzoom'
import {
  computed,
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  onBeforeMount
} from 'vue'
import { Route } from 'vue-router'

import {
  IconColoredAnnotate,
  IconColoredCode,
  IconColoredComplete,
  IconColoredConsensus,
  IconColoredDataset,
  IconColoredLogic,
  IconColoredModel,
  IconColoredReview,
  IconColoredWebhook
} from '@/assets/icons/V2/Colored'
import { CustomButton } from '@/components/Common/Button/V2'
import { ButtonColor } from '@/components/Common/Button/V2/types'
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog/V2'
import RunningSessionLoader from '@/components/DatasetSettings/RunningSessionLoader'
import SettingsSaveConfirmDialog from '@/components/DatasetSettings/SettingsSaveConfirmDialog.vue'
import EdgeLine from '@/components/Stages/EdgeLine.vue'
import AnnotateStageChild from '@/components/Stages/StageChilds/scenes/AnnotateStageChild/AnnotateStageChild.vue'
import ConsensusStageChild from '@/components/Stages/StageChilds/scenes/ConsensusStageChild/ConsensusStageChild.vue'
import DatasetStageChild from '@/components/Stages/StageChilds/scenes/DatasetStageChild/DatasetStageChild.vue'
import ModelStageChild from '@/components/Stages/StageChilds/scenes/ModelStageChild/ModelStageChild.vue'
import ReviewStageChild from '@/components/Stages/StageChilds/scenes/ReviewStageChild/ReviewStageChild.vue'
import WebhookStageChild from '@/components/Stages/StageChilds/scenes/WebhookStageChild/WebhookStageChild.vue'
import StageSidebarTemplate from '@/components/Stages/StageSidebarTemplate/StageSidebarTemplate.vue'
import StageTemplate from '@/components/Stages/StageTemplate.vue'
import CreationHeader from '@/components/WorkflowCreation/CreationHeader.vue'
import Grid from '@/components/WorkflowCreation/Grid/Grid.vue'
import GridItem from '@/components/WorkflowCreation/Grid/GridItem.vue'
import Workflow from '@/components/WorkflowCreation/Workflow.vue'
import { useFeatureFlags } from '@/composables/useFeatureFlags'
import { useHotkeyCombo } from '@/composables/useHotkeyCombo'
import { useModal } from '@/composables/useModal'
import { useRouter, useRoute } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { useWorkflowHistoryStore } from '@/composables/useWorkflowHistoryStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { loadWorkflow } from '@/store/modules/V2Workflow/actions/loadWorkflow'
import {
  StageType,
  StoreActionPayload,
  V2ConsensusStagePayload,
  V2WorkflowEdgePayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { resolveLocationFromRoute } from '@/utils/router'

import { useStageCountsLoader } from './useStageCountsLoader'

enum ComponentTypes {
  ICON = 'icon',
  CHILD = 'child'
}

/**
 * Canvas Stage Template renders dynamic childs identified via `type`. So for example
 * the Review Stage with type `review` will render the `review-stage-child.vue` component.
 * This structure will make logic more clear, organized and component based. Every child logic
 * will belong only to his own type.
 * Since Annotation Stage and Review Stage share the same components, I've seperated/capsuled the
 * component itself to achieve reuseability and declarative naming
 */
export default defineComponent({
  name: 'ShowView',
  components: {
    // stage components
    AnnotateStageChild,
    ConsensusStageChild,
    DatasetStageChild,
    ModelStageChild,
    ReviewStageChild,
    WebhookStageChild,
    // stage icon components
    IconColoredAnnotate,
    IconColoredCode,
    IconColoredComplete,
    IconColoredConsensus,
    IconColoredDataset,
    IconColoredLogic,
    IconColoredModel,
    IconColoredReview,
    IconColoredWebhook,
    // other components
    ConfirmationDialog,
    CreationHeader,
    CustomButton,
    EdgeLine,
    RunningSessionLoader,
    SettingsSaveConfirmDialog,
    StageSidebarTemplate,
    StageTemplate,
    Grid,
    GridItem,
    Workflow
  },
  setup () {
    const store = useStore()
    const teamSlug = computed(() => store.state.team.currentTeam?.slug ?? '')
    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)
    useStageCountsLoader(teamSlug, workflow)

    const breadCrumbs: BreadCrumb[] = [
      { to: '/workflows', name: 'Workflows' },
      { slotName: 'workflow-name' }
    ]

    const { featureEnabled } = useFeatureFlags()

    const scene = useWorkflowSceneStore()
    const route = useRoute()
    const router = useRouter()
    const modal = useModal()
    const workflowHistory = useWorkflowHistoryStore()

    const loading = ref(false)
    const confirmedLeaving = ref(false)

    const previousRouteTo = ref<Route | null>(null)

    const workflows = computed(() => store.state.v2Workflow.workflows)

    const subStagesIds = computed(() =>
      workflow.value?.stages.filter(
        (stage): stage is V2ConsensusStagePayload => stage.type === StageType.ConsensusEntrypoint
      ).flatMap(
        cs => [cs.config.test_stage_id, ...cs.config.parallel_stage_ids]
      ) ?? []
    )

    const filteredStages = computed(() =>
      workflow.value?.stages
        .filter(s => s.type !== StageType.Discard && !subStagesIds.value.includes(s.id)) || []
    )

    const selectedStage = computed(() => scene.selectedStage)

    const selectStage = (stage: V2WorkflowStagePayload | null): void => {
      scene.selectStage(stage)
    }

    const maybeInitNewWorkflow = (): void => {
      if (route.params.workflowId !== 'new-workflow') { return }
      store.commit('v2Workflow/INITIALIZE_WORKFLOW')
    }

    onBeforeMount(() => {
      selectStage(null)
      maybeInitNewWorkflow()
    })

    useHotkeyCombo('z',
      () => store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflowHistory.undo()),
      {
        exact: true,
        mainKey: true
      }
    )
    useHotkeyCombo('z',
      () => store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflowHistory.redo())
      ,
      {
        exact: true,
        mainKey: true,
        shiftKey: true
      }
    )

    watch(workflow, debounce((newValue) => {
      if (newValue) {
        if (!isEqual(workflowHistory.peak, newValue)) {
          workflowHistory.push(newValue)
        }
      }
    }, 300), { deep: true, immediate: false })

    const isWorkflowDirty = computed((): boolean => {
      const pristineWorkflow = workflows.value.find(wf => wf.id === workflow.value?.id)

      return !pristineWorkflow || !isEqual(pristineWorkflow, workflow.value)
    })

    const confirmButtonColor = computed((): string => {
      return ButtonColor.NEGATIVE
    })

    const UNSAVED_CHANGES_MODAL_NAME = 'confirm-leaving-workflow-page'

    const unsubscribeBeforeHandler = router.beforeEach((to, from, next) => {
      if (to.name === 'WorkflowCreation') { return next() }
      if (!isWorkflowDirty.value) { return next() }
      if (confirmedLeaving.value) {
        confirmedLeaving.value = false
        return next()
      }

      previousRouteTo.value = to
      modal.show(UNSAVED_CHANGES_MODAL_NAME)
      return false
    })

    onUnmounted(() => {
      unsubscribeBeforeHandler()
    })

    const onModalCancel = (): void => {
      modal.hide(UNSAVED_CHANGES_MODAL_NAME)
    }

    const onModalContinue = (): void => {
      // no need to reset anything it will be wiped anyway when coming back to this page
      modal.hide(UNSAVED_CHANGES_MODAL_NAME)
      confirmedLeaving.value = true
      if (!previousRouteTo.value) { return }
      router.push(resolveLocationFromRoute(previousRouteTo.value))
    }

    const getComponent = (type: StageType): string | undefined => {
      if (type === StageType.Complete) { return undefined }
      if (type === StageType.ConsensusEntrypoint) { return 'consensus-stage-child' }
      return `${type.toLowerCase()}-stage-child`
    }

    const getIconComponent = (type: StageType): string => {
      if (type === StageType.Annotate) { return 'IconColoredAnnotate' }
      if (type === StageType.Review) { return 'IconColoredReview' }
      if (type === StageType.Complete) { return 'IconColoredComplete' }
      if (type === StageType.ConsensusEntrypoint) { return 'IconColoredConsensus' }
      if (type === StageType.Dataset) { return 'IconColoredDataset' }
      if (type === StageType.Model) { return 'IconColoredModel' }
      if (type === StageType.Code) { return 'IconColoredCode' }
      if (type === StageType.Webhook) { return 'IconColoredWebhook' }
      throw new Error(`Unknown stage type: ${type}`)
    }

    const isDragging = ref(false)

    const onStartDragging = (): void => {
      isDragging.value = true
    }

    const onStopDragging = (): void => {
      isDragging.value = false
    }

    const transform = ref<Transform>({
      scale: 1,
      x: 0,
      y: 0
    })

    const createEntity = ({ droppable, type, x, y }: {
      type: string,
      droppable: boolean,
      x: number,
      y: number
    }): void => {
      onStopDragging()

      if (!droppable) { return }
      store.dispatch('v2Workflow/createStage', {
        type,
        x: Math.round(x),
        y: Math.round(y)
      })
    }

    const ensureWorkflow = async (): Promise<void> => {
      if (!teamSlug.value) { return }

      const workflowId = route.params.workflowId

      if (workflowId === 'new-workflow') {
        store.commit('v2Workflow/INITIALIZE_WORKFLOW')
      } else {
        const payload: StoreActionPayload<typeof loadWorkflow> = {
          teamSlug: teamSlug.value,
          workflowId
        }
        await store.dispatch('v2Workflow/loadWorkflow', payload)
        store.commit('v2Workflow/CLONE_WORKFLOW_TO_EDITED', workflowId)
      }
    }

    onMounted(async () => {
      loading.value = true

      await store.dispatch('dataset/getDatasets')
      await store.dispatch('team/getMemberships')
      await ensureWorkflow()

      await store.dispatch('ui/setBreadCrumbs', breadCrumbs)
      loading.value = false
    })

    const edges = computed<V2WorkflowEdgePayload[]>(() => {
      return workflow.value?.stages
        .filter(s => {
          // edges here are outer edges of the stage or stage group,
          // so the nodes you can connect to the next stage
          // discard is excluded by default
          const isDiscard = s.type === StageType.Discard

          // consensus itself does not connect to the next stage
          // in fact, the test stage that is part of the consensus group
          // connects to the next stage
          const isConsensus = s.type === StageType.ConsensusEntrypoint
          // internal consensus stages also do not connect
          const isConsensusModelOrAnnotate =
            s.type !== StageType.ConsensusTest && subStagesIds.value.includes(s.id)

          return !isDiscard && !isConsensus && !isConsensusModelOrAnnotate
        })
        .map(s => s.edges)
        .flat() || []
    })

    const sidebarStages = [
      StageType.Dataset,
      StageType.Annotate,
      ...(featureEnabled('CONSENSUS_STAGE_V2') ? [StageType.ConsensusEntrypoint] : []),
      StageType.Model,
      StageType.Review,
      ...(featureEnabled('WEBHOOK_STAGE_V2') ? [ StageType.Webhook ] : []),
      StageType.Complete,
      StageType.Code
    ]

    const { updateStageConfig, updateWorkflowName } = useEditedWorkflow()

    const onStageDragging =
      (stage: V2WorkflowStagePayload, { x, y }: { x: number, y: number }): void => {
        onStartDragging()

        const roundedX = Math.round(x)
        const roundedY = Math.round(y)

        updateStageConfig({
          stageId: stage.id,
          config: {
            x: roundedX,
            y: roundedY
          }
        })
      }

    const onTransform = (e: Transform): void => {
      transform.value.scale = e.scale
      transform.value.x = e.x
      transform.value.y = e.y
    }

    return {
      onStageDragging,
      isDragging,
      onStartDragging,
      onStopDragging,
      createEntity,
      edges,
      workflow,
      isWorkflowDirty,
      confirmedLeaving,
      previousRouteTo,
      modal,
      loading,
      filteredStages,
      getComponent,
      getIconComponent,
      onModalCancel,
      onModalContinue,
      iconComponent: ComponentTypes.ICON,
      childComponent: ComponentTypes.CHILD,
      selectStage,
      selectedStage,
      sidebarStages,
      confirmButtonColor,
      updateWorkflowName,
      transform,
      onTransform
    }
  }
})
</script>
<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.workflow-creation {
  padding-right: 8px;
  padding-bottom: 8px;

  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  height: 100vh;

  background-color: $colorSurfaceElevate;
}
</style>
