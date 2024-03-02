import { isEqual } from 'lodash'
import { computed, defineComponent, watch } from 'vue'

import { useAuth, useFeatureFlags, useStore } from '@/composables'
import { Editor } from '@/engine/editor'
import {
  MembershipRole,
  StageTimeState,
  StageType,
  V2InstanceStatus,
  WorkflowStagePayload
} from '@/store/types'

/**
 * Loads and manages installation of plugins in workflow
 *
 * Renderless component
 */
export default defineComponent({
  name: 'WorkflowPluginManager',
  render (h) { return h(undefined) },
  props: {
    editor: {
      required: true,
      type: Object as () => Editor
    }
  },
  setup (props) {
    const { getters, state } = useStore()
    const { isAuthorized } = useAuth()

    /** Current dataset item. */
    const item = computed(() => state.workview.selectedDatasetItem)

    const v1Stage = computed(() => state.workview.selectedStageInstance)
    const v1StageTemplate = computed(() => state.workview.selectedStageTemplate)

    const v2Instance = computed(() => state.workview.v2SelectedStageInstance)

    const getTimeState: (instance: WorkflowStagePayload) => StageTimeState =
      getters['workview/stageInstanceTimeState']

    /**
     * The dataset has a setting called `reviewers_can_annotate`.
     * This determines review plugins (are they read-only, or all)
     */
    const dataset = computed(() => state.workview.dataset)

    /**
     * Tutorial mode has a separate list of plugins, so we track that as a computed
     */
    const isTutorial = computed(() => state.workview.tutorialMode)

    const { enabledFeatures } = useFeatureFlags()

    // NOTE: We need this because workforce managers have different abilities
    // based on the dataset they belong to, which is information the backend
    // currently does not provide. Due to that, we assume the manager can
    // access any dataset (presumably, they've loaded it if they reached this point).
    // If there is an edge case where they are not in fact allowed, the backend
    // will return a 401/403
    const allowedRoles: MembershipRole[] = ['workforce_manager']

    const v1AccessType = computed<'view' | 'review' | 'annotate'>(() => {
      const authorized = v1Stage.value?.assignee_id
        ? isAuthorized('update_stage', { subject: 'stage', resource: v1Stage.value }, allowedRoles)
        : isAuthorized('assign_items', { subject: 'all', resource: null }, allowedRoles)

      if (!authorized) { return 'view' }
      if (v1Stage.value) {
        const isKnown = getTimeState(v1Stage.value) !== StageTimeState.Uknown
        const isCurrent = getTimeState(v1Stage.value) === StageTimeState.Current
        const isKnownCurrent = isKnown && isCurrent

        if (!isKnownCurrent) { return 'view' }
        if (v1Stage.value.type === StageType.Review && v1Stage.value.template_metadata.readonly) {
          return 'review'
        }

        if (v1Stage.value.type === StageType.Review) { return 'annotate' }
        if (v1Stage.value.type === StageType.Annotate) { return 'annotate' }
        if (v1Stage.value.type === StageType.Complete) { return 'annotate' }
      }

      if (v1StageTemplate.value) {
        if (!(v1StageTemplate.value.stage_number === 1)) { return 'view' }
        if (
          v1StageTemplate.value.type === StageType.Review &&
          v1StageTemplate.value.metadata.readonly
        ) {
          return 'review'
        }
      }

      return authorized ? 'annotate' : 'view'
    })

    const v2AccessType = computed<'view' | 'review' | 'annotate'>(() => {
      const authorized = v2Instance.value?.user_id
        ? isAuthorized(
          'update_stage',
          { subject: 'stage', resource: v2Instance.value },
          allowedRoles
        )
        : isAuthorized('assign_items', { subject: 'all', resource: null }, allowedRoles)

      if (!authorized) { return 'view' }

      if (v2Instance.value) {
        const isCurrent = v2Instance.value.status === V2InstanceStatus.Current
        if (!isCurrent) { return 'view' }

        const stage =
          item.value?.workflow_item?.workflow.stages.find(s => s.id === v2Instance.value?.stage_id)

        if (stage?.type === StageType.Review && stage?.config.readonly) { return 'review' }
        if (stage?.type === StageType.Review) { return 'annotate' }
        if (stage?.type === StageType.Annotate) { return 'annotate' }
        if (stage?.type === StageType.Dataset) { return 'annotate' }
        if (stage?.type === StageType.Complete) { return 'view' }
      }

      return authorized ? 'annotate' : 'view'
    })

    /**
     * Returns a list of plugins available to the editor, based on current store state
     *
     * This could be different based on which stage we are viewing (current, future, past),
     * configuration of the stage itself (review readonly) and user's abilities.
     */
    const plugins = computed(() => {
      if (isTutorial.value) { return props.editor.pluginManager.pluginsForTutorial() }
      if (item.value?.archived) { return props.editor.pluginManager.pluginsForView() }
      if (!dataset.value) { return [] }

      // WORKFLOWS 2.0.
      // Everything else goes away later
      if (item.value?.workflow_item) {
        if (v2AccessType.value === 'view') {
          return props.editor.pluginManager.pluginsForView()
        }

        if (v2AccessType.value === 'review') {
          return props.editor.pluginManager.pluginsForReview(dataset.value, enabledFeatures)
        }

        if (v2AccessType.value === 'annotate') {
          return props.editor.pluginManager.pluginsForDataset(dataset.value, enabledFeatures)
        }
      }

      // WORKFLOWS 1.0

      if (v1AccessType.value === 'view') {
        return props.editor.pluginManager.pluginsForView()
      }

      if (v1AccessType.value === 'review') {
        return props.editor.pluginManager.pluginsForReview(dataset.value, enabledFeatures)
      }

      if (v1AccessType.value === 'annotate') {
        return props.editor.pluginManager.pluginsForDataset(dataset.value, enabledFeatures)
      }

      return []
    })

    const resolvePlugins = (): void => {
      const oldTool = props.editor.toolManager.currentTool

      props.editor.installAllPlugins(plugins.value)

      if (props.editor.toolManager.currentTool) { return }

      if (oldTool && props.editor.toolManager.findByName(oldTool.name)) {
        return props.editor.activateTool(oldTool.name)
      }

      if (props.editor.toolManager.findByName('edit_tool')) {
        return props.editor.activateTool('edit_tool')
      }

      props.editor.activateTool('select_tool')
    }

    watch(() => plugins.value, (plugins, oldPlugins) => {
      if (isEqual(plugins, oldPlugins)) { return }
      resolvePlugins()
    }, { immediate: true })
  }
})
