<template>
  <div class="summary">
    <popup-menu
      v-if="open"
      class="popup-menu popup-menu-time-summary"
      :class="{ 'popup-menu--open': open }"
      :style="style"
    >
      <template v-if="summary && currentDurationData.length > 0">
        <div
          v-for="data in currentDurationData"
          :key="data.key"
          class="summary__item"
        >
          <status-button
            class="summary__item__avatar"
            :type="data.type"
          >
            <team-member-avatar
              v-if="data.membership"
              :member="data.membership"
            />
          </status-button>
          <div class="summary__item__name">
            {{ data.name }}
          </div>
          <annotation-time
            class="summary__item__time"
            :time-in-seconds="data.duration"
          />
        </div>
      </template>
      <template v-else>
        No time tracked yet. {{ summary }} {{ currentDurationData }}
      </template>
    </popup-menu>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import AnnotationTime from '@/components/WorkView/Common/AnnotationTime.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { useStore } from '@/composables'
import {
  DatasetItemTimeSummaryPayload,
  MembershipPayload,
  WorkflowStagePayload,
  StageType
} from '@/store/types'
import { getFullName } from '@/utils'

type SummaryItem = {
  duration: number
  key: string
  membership?: MembershipPayload
  name: string
  type: WorkflowStagePayload['type']
}

const buildSummaryItem = (
  stage: WorkflowStagePayload,
  memberships: MembershipPayload[],
  userId: number,
  duration: number,
  type: Exclude<
    StageType,
    StageType.Dataset | StageType.Discard | StageType.ConsensusEntrypoint |
    StageType.ConsensusTest | StageType.Logic
  >
): SummaryItem => {
  const key = `${userId}-${stage.id}`
  const membership = memberships.find(m => m.user_id === userId)
  const name = membership ? getFullName(membership) : 'Unknown user'
  return { duration, type, key, membership, name }
}

/**
 * In charge of rendering of a time summary for the specified dataset item
 *
 * Loading is done separately from this component, in `TimeSummaryLoader.ts`
 */
export default defineComponent({
  name: 'TimeSummary',
  components: {
    AnnotationTime,
    PopupMenu,
    StatusButton,
    TeamMemberAvatar
  },
  props: {
    open: { default: false, type: Boolean },
    stage: { required: true, type: Object as () => WorkflowStagePayload }
  },
  setup (props) {
    const { state } = useStore()
    const nudgeRight: Ref<Number> = ref(0)

    const style = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return { left: `${nudgeRight.value}px` }
    })

    const summary = computed((): DatasetItemTimeSummaryPayload | null => {
      const summaries =
        state.workview.datasetItemTimeSummaries as DatasetItemTimeSummaryPayload[]
      return summaries.find(s => s.dataset_item_id === props.stage.dataset_item_id) || null
    })

    const memberships = computed((): MembershipPayload[] => {
      return state.team.memberships
    })

    const currentDurationData = computed((): SummaryItem[] => {
      const data: SummaryItem[] = []

      const sourceData = summary.value
        ? summary.value.current_workflow.per_stage_per_user
        : []

      sourceData.filter(d => d.stage_id === props.stage.id).forEach(d => {
        if (d.type === 'complete') { return }
        if (!d.user_id) { return }
        if (d.duration === 0) { return }
        const item = buildSummaryItem(props.stage, memberships.value, d.user_id, d.duration, d.type)
        data.push(item)
      })

      const assigneeHasData =
        data.some(d => d.membership && d.membership.user_id === props.stage.assignee_id)

      if (props.stage.assignee_id && !assigneeHasData) {
        const item = buildSummaryItem(
          props.stage,
          memberships.value,
          props.stage.assignee_id,
          0,
          props.stage.type
        )
        data.push(item)
      }

      return data
    })

    // TODO partial work, that component it's currently not finished as the BE
    // it's not complete too
    // const checkNudgeRight = (): void => {
    //   const { $parent: { $refs: { 'stage-item': stageItem } } } = this
    //   if (!stageItem) { return }
    //   try {
    //     const rect = (stageItem as any).getBoundingClientRect()
    //     const menuWidth = 230 * theme.getCurrentScale()
    //     props.nudgeRight = rect.right < (window.innerWidth - menuWidth)
    //       ? rect.right - (menuWidth / 2)
    //       : window.innerWidth - menuWidth
    //   } catch (err: unknown) {
    //     console.error(err)
    //   }
    // }

    // watch(() => props.open, (val: boolean) => {
    //   if (val) { checkNudgeRight() }
    // })

    return {
      style,
      summary,
      memberships,
      currentDurationData
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-time-summary {
  .menu__wrapper {
    @include col;
  }
}
</style>

<style lang="scss" scoped>
$popup-width: 230px;
$min-popup-height: 30px;
$max-popup-height: 420px;

.summary {
  position: relative;

  .popup-menu {
    display: none;
    @include col;
    justify-content: space-between;
    position: fixed;
    top: 50px;
    margin: 0;
    padding: 0;
    width: $popup-width;
    height: auto;
    min-height: $min-popup-height;
    max-height: $max-popup-height;
    background-color: $colorWhite;
    z-index: 1;
    @include scrollbarV2;

    &--open {
      display: block;
    }
  }

  &__item {
    display: grid;
    grid-auto-columns: max-content;
    grid-gap: 10px;
    grid-template-areas: "avatar name" "duration duration";
    align-content: center;
    margin-bottom: 20px;

    &__avatar {
      height: 30px;
      width: 30px;
      grid-area: avatar;
    }

    &__name {
      grid-area: name;
      align-self: center;
    }

    &__time {
      grid-area: duration;
      justify-content: left;
      justify-self: left;
      background: $colorAliceBlue;
      padding: 6px;
      border-radius: 3px;

      :deep(.annotation-time__icon) {
        width: 25px;
        height: 28px;
      }
    }
  }
}
</style>
