<template>
  <div
    v-if="isBlindReviewStage"
    class="results"
    :style="dragStyle"
  >
    <div class="results__header">
      <test-round-icon />
      <header-4 class="results__header__title">
        Automated test results
      </header-4>
      <div
        class="results__header__move-handler"
        @mousedown="startDrag"
        @mouseup="stopDrag"
      >
        <move-handler-icon />
      </div>
    </div>
    <div class="results__authors">
      <paragraph-10 class="results__authors__header">
        Select an author to compare
      </paragraph-10>
      <rounded-toggle-button
        class="results__authors__author"
        :selected="everyoneSelected"
        @toggle="toggleEveryone"
      >
        <template #icon>
          <annotate-round-icon />
        </template>
        <span>Everyone</span>
      </rounded-toggle-button>
      <rounded-toggle-button
        v-for="author in authors"
        :key="author.member.id"
        :selected="author.selected"
        class="results__authors__author"
        @toggle="toggleSelection(author.member.user_id)"
      >
        <template #icon>
          <team-member-avatar :member="author.member" />
        </template>
        <span>{{ author.fullName }}</span>
      </rounded-toggle-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import AnnotateRoundIcon from '@/assets/icons/V1/annotateRound.svg?inline'
import MoveHandlerIcon from '@/assets/icons/V1/move-handler.svg?inline'
import TestRoundIcon from '@/assets/icons/V1/testRound.svg?inline'
import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import RoundedToggleButton from '@/components/Common/Button/V1/RoundedToggleButton.vue'
import Header4 from '@/components/Common/Header4.vue'
import Paragraph10 from '@/components/Common/Paragraph10.vue'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  DatasetItemPayload,
  MembershipPayload,
  RootState,
  StageType,
  WorkflowStagePayload
} from '@/store/types'
import { getFullName } from '@/utils'

const unknownUser = (id: number): MembershipPayload => ({
  id,
  user_id: -1,
  team_id: -1,
  first_name: 'Unknown',
  last_name: 'User',
  role: 'annotator',
  image: null,
  email: ''
})

const filterByStageIds = (annotations: StageAnnotation[], stageIds: number[]): StageAnnotation[] =>
  annotations.filter(annotation => {
    if (!annotation.iou_matches) { return false }
    const [[, sourceStageId]] = annotation.iou_matches
    return stageIds.includes(sourceStageId)
  })

@Component({
  name: 'test-stage-results',
  components: {
    AnnotateRoundIcon,
    Header4,
    MoveHandlerIcon,
    Paragraph10,
    RoundedToggleButton,
    TeamMemberAvatar,
    TestRoundIcon
  }
})
export default class TestStageResults extends Vue {
  /** dragging code */

  /**
   * Indicates current drag stage. Not strictly necessary, but helpful with debugging
   */
  state: 'normal' | 'dragging' = 'normal'

  /**
   * Trigged on mouse down event over drag handle.
   * Starts tracking mousemove event to update drag position, as well as
   * mouseup event to end the drag.
   */
  startDrag (): void {
    this.state = 'dragging'
    document.addEventListener('mousemove', this.updateDrag)
  }

  /**
   * Trigged on mouse up event over drag handle.
   * Clear event listeners and reset the state
   */
  stopDrag (): void {
    this.state = 'normal'
    document.removeEventListener('mousemove', this.updateDrag)
  }

  /**
   * Top left corner of the component. X coordinate. Updated when dragging.
   * Allows the component to be freely moved around the parent container
   */
  dragX: number = 10
  /**
   * Top left corner of the component. Y coordinate. Updated when dragging.
   * Allows the component to be freely moved around the parent container
   */
  dragY: number = 10

  /**
   * Called while dragging, to update top-left position of container being
   * dragged.
   */
  updateDrag (e: MouseEvent): void {
    if (this.state === 'normal') { return }

    this.dragX += e.movementX
    this.dragY += e.movementY
  }

  /**
   * Gets updated in updateDrag. Bound to container as style.
   */
  get dragStyle (): { top: string, left: string } {
    return { left: `${this.dragX}px`, top: `${this.dragY}px` }
  }

  // data

  /**
   * Item holds the current worklflow, so it allows us to look at previous
   * stages relative to current stage.
   *
   * The component will only render if `isBlindReviewStage` is true, so we need
   * this info to determine that.
   */
  @State((state: RootState) => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload | null

  /**
   * Currently selected stage instance.
   *
   * The component will only render if `isBlindReviewStage` is true, so we need
   * this info to determine that.
   */
  @State((state: RootState) => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload

  /**
   * We need membership information to render the authors filter.
   */
  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  /**
   * Holds currently selected authors
   */
  selectedAssigneeUserIds: number[] = []

  /**
   * True if we are currently viewing the review stage, which follows a test
   * stage, which follows a blind stage.
   *
   * The component only renders if this is true.
   */
  get isBlindReviewStage (): boolean {
    const { item, stage } = this
    if (!item?.current_workflow) { return false }
    if (!stage) { return false }
    if (stage.type !== StageType.Review) { return false }

    // stage order is blind annotate -> test -> review
    // this is review and we want blind annotate
    const blindStages = item.current_workflow.stages[stage.number - 2]

    if (!blindStages) { return false }
    if (blindStages.length <= 1) { return false }
    const firstStage = blindStages[0]
    if (!('parallel' in firstStage.template_metadata)) { return false }
    if ((firstStage.template_metadata.parallel || 1) < 2) { return false }

    return true
  }

  /**
   * Retrives the set of blind stages this review stage exists for.
   *
   * Blind stages are parallel, so there is at least two of them. Since we're
   * looking from the perspective of the review stage that follows, we retrieve
   * blind stages by looking two stages back.
   */
  get blindStages (): WorkflowStagePayload[] {
    const { item, stage, isBlindReviewStage } = this
    if (!isBlindReviewStage) { return [] }
    return item!.current_workflow!.stages[stage.number - 2]
  }

  /**
   * Returns blind stage assignes whoo's annotations are being reviewed in this
   * review stage.
   *
   * Serves to populate a selectable filter list.
   */
  get authors (): {
    member: MembershipPayload
    fullName: string
    selected: boolean
  }[] {
    const { blindStages, selectedAssigneeUserIds } = this
    return blindStages.map((stage, index) => {
      const member =
        this.memberships.find(m => m.user_id === stage.assignee_id) || unknownUser(-index)
      return {
        member,
        fullName: getFullName(member),
        selected: selectedAssigneeUserIds.includes(member.user_id)
      }
    })
  }

  everyoneSelected: boolean = true

  /**
   * Selects all authors in the filter at once. Runs when the "everyone" option
   * is clicked.
   */
  toggleEveryone (): void {
    this.everyoneSelected = !this.everyoneSelected
    this.selectedAssigneeUserIds = []
  }

  /**
   * Toggles selection of a single author. Runs when an individual author
   * filter option is clicked.
   */
  toggleSelection (toggledId: number): void {
    if (this.selectedAssigneeUserIds.includes(toggledId)) {
      this.selectedAssigneeUserIds =
        this.selectedAssigneeUserIds.filter(id => id !== toggledId)
    } else {
      this.everyoneSelected = false
      this.selectedAssigneeUserIds.push(toggledId)
    }
  }

  // annotation visibility toggles

  /**
   * To toggle visibility, we deal with all annotations in the store, which
   * should be all annotations within the current stage.
   */
  @State((state: RootState) => state.workview.stageAnnotations)
  private annotations!: StageAnnotation[]

  /**
   * When filter selection changes, we set annotations made by selected authors
   * to visible, and hide all the other annotations
   */
  @Watch('selectedAssigneeUserIds')
  onSelection (): void {
    const {
      annotations,
      blindStages,
      everyoneSelected,
      selectedAssigneeUserIds,
      isBlindReviewStage
    } = this
    if (!isBlindReviewStage) { return }

    const stageIds = blindStages
      .filter(s => s.assignee_id && selectedAssigneeUserIds.includes(s.assignee_id))
      .map(s => s.id)

    // visibleIds are ids of annotations which originate in stages assigned to
    // selected authors. This information is taken from `iou_matches`
    const visibleIds =
      (everyoneSelected ? annotations : filterByStageIds(annotations, stageIds))
        .map(a => a.id)

    const invisibleIds =
      annotations
        .filter(annotation => !visibleIds.includes(annotation.id))
        .map(a => a.id)

    this.$store.commit('workview/UPDATE_ANNOTATIONS_VISIBILITY', {
      annotationIds: visibleIds, visibility: true
    })

    this.$store.commit('workview/UPDATE_ANNOTATIONS_VISIBILITY', {
      annotationIds: invisibleIds, visibility: false
    })
  }
}
</script>

<style lang="scss" scoped>
.results {
  max-width: 250px;
  border-radius: 5px;
  overflow: hidden;
  position: absolute;
  background: $colorAliceLight;

  @include col;
  row-gap: 10px;
}

.results__header {
  background: $colorAliceBlue;
  padding: 10px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  justify-content: space-between;
  column-gap: 10px;
  user-select: none;
}

.results__header__move-handler {
  cursor: hand;
  color: $colorAliceNight;
  cursor: move;
}

.results__authors {
  @include col;
  padding: 5px;
  align-items: stretch;
  row-gap: 5px;
}

.results__authors__header {
  margin-left: 4px;
  font-weight: bold;
  color: $colorAliceNight;
}
</style>
