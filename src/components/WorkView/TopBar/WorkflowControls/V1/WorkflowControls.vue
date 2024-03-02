<template>
  <div class="workflow-controls">
    <back-to-the-present
      v-if="isTimeTravel"
      class="workflow-controls__back"
    />
    <template v-else-if="isCurrent && canAct">
      <stage-skip-button
        v-if="inAnnotate"
        class="workflow-controls__skip"
      />
      <template v-else-if="inReview">
        <stage-archive-button class="workflow-controls__archive" />
        <stage-reject-button
          v-if="!isBlindReview"
          class="workflow-controls__reject"
        />
      </template>
    </template>
    <div v-tooltip="tooltip">
      <continue-button
        v-if="!isTimeTravel && continueButtonType"
        class="workflow-controls__continue"
        :completes-at="completesAt"
        :disabled="busy"
        :type="continueButtonType"
        :waiting="isWaiting"
        @continue="advance"
        @cancel="cancel"
        @restart="restart"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import {
  ContinueButton,
  StageArchiveButton,
  StageRejectButton,
  StageSkipButton
} from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  ReviewStatus,
  StageActionType,
  StageTimeState,
  StageType,
  StoreActionPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { ErrorCodes } from '@/utils/error/errors'

import { BackToThePresent } from '.'

const Actions = {
  [ReviewStatus.Approved]: 'workview/approveStage',
  [ReviewStatus.Rejected]: 'workview/rejectStage',
  [ReviewStatus.Archived]: 'workview/archiveStage'
}

const resolveAdvanceAction = (stage: WorkflowStagePayload): string => {
  switch (stage.type) {
  case StageType.Annotate:
  case StageType.Code:
  case StageType.Model:
    return 'workview/setStageAutoComplete'
  case StageType.Review: {
    const reviewStatus = stage.metadata.review_status || ReviewStatus.Approved
    return Actions[reviewStatus]
  }
  default:
    throw new Error(`Invalid stage type: ${stage.type}`)
  }
}

@Component({
  name: 'workflow-controls',
  components: {
    BackToThePresent,
    ContinueButton,
    StageArchiveButton,
    StageSkipButton,
    StageRejectButton
  }
})
export default class WorkflowControls extends Vue {
  mounted (): void {
    this.setupKeyBinding()
  }

  // item state

  types = StageActionType

  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload | null

  get isNew (): boolean {
    return this.item.status === DatasetItemStatus.new
  }

  get isArchived (): boolean {
    return this.item.archived
  }

  get tooltip (): TooltipOptions {
    let content = ''
    if (this.isNew) { content = 'Draw/create an annotation to automatically start this stage' }
    if (this.isArchived) { content = 'That content it\'s archived and cannot be edited' }
    return {
      content,
      placement: 'top',
      delay: { show: 300, hide: 300 }
    }
  }

  // stage state
  get inAnnotate (): boolean {
    return !!this.stage && this.stage.type === StageType.Annotate
  }

  get inReview (): boolean {
    return !!this.stage && this.stage.type === StageType.Review
  }

  get isBlindReview (): boolean {
    const { inReview, item, stage } = this
    if (!inReview) { return false }
    if (!item.current_workflow) { return false }
    if (!stage) { return false }
    const previousStage = item.current_workflow.stages[stage.number - 1]?.[0]
    return previousStage?.type === StageType.Test
  }

  get isWaiting (): boolean {
    const { stage } = this
    return (
      !!stage &&
      stage.type === StageType.Annotate &&
      (stage.template_metadata.parallel || 1) > 1 &&
      !!stage.metadata.ready_for_completion
    )
  }

  get inComplete (): boolean {
    return !!this.stage && this.stage.type === StageType.Complete
  }

  // stage time state

  @Getter('stageInstanceTimeState', { namespace: 'workview' })
  getTimeState!: (instance: WorkflowStagePayload) => StageTimeState

  get isKnown (): boolean {
    const { stage } = this
    return !!stage && this.getTimeState(stage) !== StageTimeState.Uknown
  }

  get isCurrent (): boolean {
    const { stage } = this
    return !!stage && this.getTimeState(stage) === StageTimeState.Current
  }

  get isTimeTravel (): boolean {
    return this.isKnown && !this.isCurrent
  }

  // assignment state

  @State(state => state.user.profile)
  user!: UserPayload

  get isAssignee (): boolean {
    const { stage, user } = this
    return !!stage && !!user && stage.assignee_id === user.id
  }

  get canAct (): boolean {
    const hasRights = this.isAssignee || this.$can('assign_items')
    if (!hasRights) { return false }
    const { inComplete, isArchived, isNew } = this
    return !isNew && !isArchived && !inComplete
  }

  // continue button

  @Getter('stageCurrentAction', { namespace: 'workview' })
  getContinueAction!: (stage: WorkflowStagePayload) => StageActionType

  get continueButtonType (): StageActionType | null {
    const { isArchived, inComplete, isCurrent, isNew, stage, canAct } = this

    if (isArchived) { return StageActionType.Archived }
    if (isNew) { return StageActionType.New }
    if (inComplete) { return StageActionType.Completed }

    if (stage) {
      if (!isCurrent) { return null }
      if (canAct) { return this.getContinueAction(stage) }
    }

    return null
  }

  @Getter('nextDatasetItem', { namespace: 'workview' })
  nextItem!: DatasetItemPayload | null

  busy: boolean = false;

  /**
   * Advance workflow based on stage state.
   *
   * Action could either advance workflow to the next stage,
   * discard the item, or regress it to the previous state.
   */
  async advance (): Promise<void> {
    const { canAct, stage, user } = this

    if (!canAct || !stage) { return }
    if (stage.completes_at) { return this.goToNextItem() }

    const isAutomated = stage.type === StageType.Model || stage.type === StageType.Code

    this.busy = true

    if (!isAutomated && !stage.assignee_id) {
      const { id: userId } = user
      const payload: StoreActionPayload<typeof assignStage> = { stage, userId }
      const { error } = await this.$store.dispatch('workview/assignStage', payload)

      if (error) {
        this.$store.dispatch('toast/warning', { content: error.message })
        this.busy = false
        return
      }
    }

    const action = resolveAdvanceAction(stage)
    const { error } = await this.$store.dispatch(action, stage)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.busy = false
      return
    }

    this.busy = false

    this.goToNextItem()
  }

  goToNextItem (): void {
    const { nextItem, $route: { query } } = this
    if (!nextItem) { return }
    this.$router.push({ query: { ...query, image: nextItem.seq.toString() } })
  }

  async cancel (): Promise<void> {
    const { stage } = this
    const { error } = await this.$store.dispatch('workview/cancelStageAutoComplete', stage)
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  get completesAt (): number | null {
    return this.stage ? this.stage.completes_at : null
  }

  async restart (): Promise<void> {
    const { item } = this

    this.busy = true

    const { error } = await this.$store.dispatch('workview/createWorkflow', item)

    this.busy = false

    if (error && error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  setupKeyBinding (): void {
    const listener = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.stopPropagation()
        this.advance()
      }
    }

    document.addEventListener('keydown', listener)
    this.$once('hook:beforeDestroy', () => document.removeEventListener('keydown', listener))
  }
}
</script>
<style lang="scss" scoped>
.workflow-controls {
  height: 100%;
  @include row;
  align-items: center;

  & > :not(:last-child) {
    margin-right: 10px;
  }
}
</style>
