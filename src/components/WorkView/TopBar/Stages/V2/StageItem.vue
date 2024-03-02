<template>
  <div
    ref="stage-item"
    class="stage-item"
    :class="{
      ['stage-item--selected']: selected,
      ['stage-item--active']: active || selected,
      [`stage-item--${type}`]: active || selected,
    }"
    @mouseover="timeSummaryOpen = true"
    @mouseleave="timeSummaryOpen = false"
  >
    <div
      class="stage-item__content stage-item__content--variant--default"
      :class="{
        'stage-item__content--active': active || selected,
        [`stage-item__content--${type}`]: true,
      }"
    >
      <status-button
        class="stage-item__content__status-button"
        :type="type"
        size="xs"
        :active="active || selected"
        @click="onSelect"
      >
        <team-member-avatar
          v-if="assignee"
          class="stage-item__content__status-button__avatar"
          :member="assignee"
        />
      </status-button>

      <!-- time summary for this stage -->
      <v2-time-summary
        v-if="timeSummaryOpen"
        :open="timeSummaryOpen"
        :stage-data="data"
      />

      <!-- assignment popup-menu is showed only for
      non-complete stage and for team members or higher -->
      <assignment-dropdown
        v-if="assignable"
        :status="type"
        :assignee="assignee"
        @assign="onAssign"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import AssignmentDropdown from '@/components/WorkView/TopBar/Stages/Common/AssignmentDropdown/AssignmentDropdown.vue'
import V2TimeSummary from '@/components/WorkView/TopBar/Stages/Common/V2TimeSummary.vue'
import {
  StageData,
  StageProps
} from '@/components/WorkView/TopBar/Stages/V2'
import { assignV2Stage } from '@/store/modules/workview/actions/assignV2Stage'
import {
  DatasetPayload,
  MembershipPayload,
  RootState,
  StageType,
  StoreActionPayload,
  V2InstanceStatus,
  V2WorkflowItemStatePayload
} from '@/store/types'

@Component({
  name: 'v2-stage-item',
  components: {
    StatusButton,
    AssignmentDropdown,
    TeamMemberAvatar,
    V2TimeSummary
  }
})
export default class StageItem extends Vue {
  @Ref('stage-item')
  readonly rootEl!: HTMLDivElement

  @Prop({ required: true, type: Object as () => StageData })
  data!: StageProps['data']

  @Prop({ default: false, type: Boolean })
  active?: StageProps['active']

  @Prop({ default: false, type: Boolean })
  selected!: StageProps['selected']

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.workview.v2WorkflowItemState)
  item!: V2WorkflowItemStatePayload | null

  @State(state => state.workview.tutorialMode)
  tutorialMode!: boolean

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  timeSummaryOpen: boolean = false

  get type (): string {
    return this.data.stage.type
  }

  get roleAssignable (): boolean {
    const { dataset } = this
    return this.$can(
      'assign_items',
      { subject: 'dataset', resource: dataset },
      ['workforce_manager']
    )
  }

  get typeAssignable (): boolean {
    return this.type === StageType.Annotate || this.type === StageType.Review
  }

  get isPast (): boolean {
    const { data: { instance } } = this
    return (
      !!instance && instance.status !== V2InstanceStatus.Current
    )
  }

  /**
   * Due to tutorial not currently supporting roles, we prevent assignment in
   * tutorial mode.
   *
   * Outside of that, item must have a workflow, and be assignable by role and type.
   */
  get assignable (): boolean {
    const { roleAssignable, tutorialMode, typeAssignable, isPast, item } = this
    return (
      !!item && !tutorialMode && roleAssignable && typeAssignable && !isPast
    )
  }

  /**
   * Returns assignee resolved to the stage.
   *
   * This could be
   * - the actual current stage assignee if the item is in this stage of the workflow
   * - the designated stage assignee, if any, otherwise
   */
  get assignee (): MembershipPayload | null {
    if (this.type === StageType.Dataset) { return null }

    const { item, memberships, data: { instance, stage } } = this
    const stageId = (stage.id || '').toLowerCase()
    const userId = instance
      ? instance.user_id
      : item?.designated_assignees[stageId]

    return memberships.find(m => m.user_id === userId) || null
  }

  onAssign (member: MembershipPayload): void {
    const payload: StoreActionPayload<typeof assignV2Stage> = {
      member: member,
      stage: this.data.stage
    }
    this.$store.dispatch('workview/assignV2Stage', payload)
  }

  onSelect (): void {
    const { data: { key, instance, stage } } = this
    this.$store.commit('workview/SET_V2_SELECTED_STAGE', stage)
    this.$store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    this.$emit('click', key)
  }
}
</script>

<style lang="scss" scoped>
$colors: (
  archive: ( default: $colorStagesArchiveDefault, hover: $colorStagesArchiveHover ),
  annotate: ( default: $colorStagesAnnotateDefault, hover: $colorStagesAnnotateHover ),
  code: ( default: $colorStagesCodeDefault, hover: $colorStagesCodeHover ),
  complete: ( default: $colorStagesCompleteDefault, hover: $colorStagesCompleteHover ),
  dataset: ( default: $colorStagesDatasetDefault, hover: $colorStagesDatasetHover ),
  discard: ( default: $colorStagesDiscardDefault, hover: $colorStagesDiscardHover ),
  logic: ( default: $colorStagesLogicDefault, hover: $colorStagesLogicHover ),
  model: ( default: $colorStagesModelDefault, hover: $colorStagesModelHover ),
  review: ( default: $colorStagesReviewDefault, hover: $colorStagesReviewHover ),
  webhook: ( default: $colorStagesWebhookDefault, hover: $colorStagesWebhookHover ),
  consensus: ( default: $colorStagesConsensusDefault, hover: $colorStagesConsensusHover )
);
$height-pseudo: 6px;
$size: 28px;
$overlap: 4px;

.stage-item {
  @include row--center;
  align-items: center;

  &__content {
    position: relative;
    @include row--center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin-left: -#{$overlap};

    &__status-button {
      position: relative;
      @include row--center;
      align-items: center;
      height: $size;
      width: $size;
      min-width: $size;
      overflow: hidden;

      &__avatar {
        position: absolute;
        height: $size;
        width: $size;
        min-width: $size;
      }
    }

    &::before, &::after {
      position: absolute;
      height: $height-pseudo;
      width: 2px;
    }

    &::before {
      top: -#{$height-pseudo};
    }

    &::after {
      bottom: -#{$height-pseudo};
    }

    &--active {
      &::before, &::after {
        content: '';
      }
    }

    @each $key in map-keys($colors) {
      $color: map-get($colors, $key);
      $default: map-get($color, 'default');
      $hover: map-get($color, 'hover');

      &--#{$key} {
        &.stage-item__content--variant {
          &--default { border-color: $default; }
          &--inverted { background-color: $default; }
        }

        &::before, &::after { background-color: $default; }

        &:hover {
          &.stage-item__content--variant {
            &--default { border-color: $hover; }
            &--inverted { background-color: $hover; }
          }

          &::before, &::after { background-color: $hover; }
        }
      }
    }
  }
}
</style>
