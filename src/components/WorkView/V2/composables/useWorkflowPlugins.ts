import { isEqual } from 'lodash'
import { onMounted, onBeforeUnmount, computed, watch } from 'vue'

import { useAuth, useFeatureFlags, useStore } from '@/composables'
import { Editor } from '@/engineV2/editor'
import {
  MembershipRole,
  StageType,
  V2DatasetItemPayload,
  V2InstanceStatus
} from '@/store/types'

export const useWorkflowPlugins = (editor: Editor): void => {
  const { getters, state } = useStore()
  const { isAuthorized } = useAuth()

  /** Current dataset item. */
  const selectedDatasetItem = computed(
    (): V2DatasetItemPayload => getters['workview/v2SelectedDatasetItem']
  )

  const v2Instance = computed(() => state.workview.v2SelectedStageInstance)

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

  const v2AccessType = computed<'view' | 'review' | 'annotate'>(() => {
    const authorized = v2Instance.value?.user_id
      ? isAuthorized(
        'update_stage',
        { subject: 'stage', resource: { assignee_id: v2Instance.value.user_id } },
        allowedRoles
      )
      : isAuthorized('assign_items', { subject: 'all', resource: null }, allowedRoles)

    if (!authorized) { return 'view' }

    if (v2Instance.value) {
      const isCurrent = v2Instance.value.status === V2InstanceStatus.Current
      if (!isCurrent) { return 'view' }

      const stage = v2Instance.value.stage

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
    if (isTutorial.value) { return editor.pluginManager.pluginsForTutorial() }
    if (selectedDatasetItem.value?.archived) { return editor.pluginManager.pluginsForView() }
    if (!dataset.value) { return [] }

    // Everything else goes away later
    if (v2AccessType.value === 'view') {
      return editor.pluginManager.pluginsForView()
    }

    if (v2AccessType.value === 'review') {
      return editor.pluginManager.pluginsForReview(dataset.value, enabledFeatures)
    }

    if (v2AccessType.value === 'annotate') {
      return editor.pluginManager.pluginsForDataset(dataset.value, enabledFeatures)
    }

    return []
  })

  const resolvePlugins = (): void => {
    const oldTool = editor.toolManager.currentTool

    editor.installAllPlugins(plugins.value)

    if (editor.toolManager.currentTool) { return }

    if (oldTool && editor.toolManager.findByName(oldTool.name)) {
      return editor.toolManager.activateTool(oldTool.name)
    }

    if (editor.toolManager.findByName('edit_tool')) {
      return editor.toolManager.activateTool('edit_tool')
    }

    editor.toolManager.activateTool('select_tool')
  }

  watch(() => [plugins.value, state.dataset.datasetItemIdsV2], (newValue, oldValue) => {
    if (isEqual(newValue, oldValue)) { return }
    resolvePlugins()
  }, { immediate: true })

  onMounted(() => {
    const handleLayoutChanged = (): void => {
      resolvePlugins()
    }

    handleLayoutChanged()
    editor.on('layout:changed', handleLayoutChanged)
    onBeforeUnmount(() => {
      editor.off('layout:changed', handleLayoutChanged)
    })
  })
}
