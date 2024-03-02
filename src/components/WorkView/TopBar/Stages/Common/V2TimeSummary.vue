<template>
  <div class="summary">
    <popup-menu
      v-if="open"
      class="popup-menu popup-menu-time-summary"
      :class="{ 'popup-menu--open': open }"
      :style="style"
    >
      <div
        v-if="summary && currentDurationData.length > 0"
        class="stage_name"
      >
        {{ stageName }}
      </div>
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
        <span class="no-time-track">No time tracked yet.</span>
      </template>
    </popup-menu>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import AnnotationTime from '@/components/WorkView/Common/AnnotationTime.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { StageData } from '@/components/WorkView/TopBar/Stages/V2'
import { useStore, useSelectedDatasetItemV2 } from '@/composables'
import {
  MembershipPayload,
  V2DatasetItemTimeSummaryPayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { getFullName } from '@/utils'

type SummaryItem = {
  duration: number
  key: string
  membership?: MembershipPayload
  name: string
  type: V2WorkflowStagePayload['type']
}

const buildSummaryItem = (
  stage: V2WorkflowStagePayload,
  memberships: MembershipPayload[],
  userId: number,
  duration: number,
  type: V2WorkflowStagePayload['type']
): SummaryItem => {
  const key = `${userId}-${stage.id}`
  const membership = memberships.find(m => m.user_id === userId)
  const name = membership ? getFullName(membership) : 'Unknown user'
  return { duration, type, key, membership, name }
}

/**
 * In charge of rendering of a time summary for the specified dataset item
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
    stageData: { required: true, type: Object as () => StageData }
  },
  setup (props) {
    const { state } = useStore()
    const selectedDatasetItem = useSelectedDatasetItemV2()

    const style = computed<Partial<CSSStyleDeclaration>>(() => {
      return { transform: `translateX(-${200}px)` }
    })

    const summary = computed((): V2DatasetItemTimeSummaryPayload | null => {
      return state.workview.v2DatasetItemTimeSummaries[selectedDatasetItem.value.id]
    })

    const memberships = computed(() => {
      return state.team.memberships
    })

    const currentDurationData = computed<SummaryItem[]>(() => {
      const data: SummaryItem[] = []

      const sourceData = summary.value
        ? summary.value.current_workflow.per_stage_per_user
        : []

      sourceData.filter(d => d.stage_id === props.stageData.stage.id).forEach(d => {
        if (d.type === 'complete') { return }
        if (!d.user_id) { return }
        if (d.duration === 0) { return }
        const item = buildSummaryItem(
          props.stageData.stage,
          memberships.value,
          d.user_id,
          d.duration,
          d.type
        )
        data.push(item)
      })

      return data
    })

    const stageName = computed<string>(() => {
      return props.stageData?.stage?.name || ''
    })

    return {
      style,
      summary,
      memberships,
      currentDurationData,
      stageName
    }
  }
})
</script>

<!--
  Popup is attached to a fixed position outside the body of component,
  so should define without scope
-->
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
    padding: 8px;
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
  .stage_name {
      @include typography(md-1, inter);
      justify-content: left;
      justify-self: left;
  }
  .no-time-track {
      @include typography(md-1, inter);
  }
  &__item {
    @include typography(md-1, inter);
    display: grid;
    grid-auto-columns: max-content;
    grid-gap: 10px;
    grid-template-areas: "avatar name" "duration duration";
    align-content: center;
    &:not(:last-child) {
      margin-bottom: 10px;
    }

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
