<template>
  <router-link
    class="workflow-image"
    replace
    :to="itemRoute"
  >
    <workview-image
      v-if="thumbnail"
      :selected="selected"
      :thumbnail="thumbnail"
      :filename="filename"
      :is-video="isVideo"
      previous-tooltip="Previous image (<)"
      next-tooltip="Next image (>)"
    >
      <status-button
        v-if="archivedStatus"
        class="workflow-image__status"
        :type="datasetItemStatus"
        variant="inverted"
      />
      <div
        v-else-if="inActiveWorkflow"
        class="workflow-image__status"
      >
        <stage-instance-with-timer
          v-for="instance in instances"
          :key="instance.id"
          :instance="instance"
        />
      </div>
      <status-button
        v-else
        class="workflow-image__status"
        :type="datasetItemStatus"
        variant="inverted"
      >
        <team-member-avatar
          v-if="assignee"
          class="stage-item__content__status-button__avatar"
          :member="assignee"
        />
      </status-button>
    </workview-image>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import { ASSIGNABLE_STATUSES } from '@/components/DatasetManagement/Status/utils'
import { WorkviewImage } from '@/components/WorkView/BottomBar'
import StageInstanceWithTimer from '@/components/WorkView/Common/StageInstanceWithTimer.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { isDefaultAutoComplete, resolveThumbnailV2 } from '@/components/WorkView/utils'
import { useRoute } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import {
  DatasetItemType,
  MembershipPayload,
  StageType,
  V2DatasetItemPayload,
  WorkflowStagePayload
} from '@/store/types'

export default defineComponent({
  name: 'V2WorkflowImage',
  components: {
    StageInstanceWithTimer,
    StatusButton,
    WorkviewImage,
    TeamMemberAvatar
  },
  props: {
    datasetItem: { required: true, type: Object as () => V2DatasetItemPayload }
  },
  setup (props) {
    const { state, getters } = useStore()
    const route = useRoute()

    const allConsensusStagesIdsGetter = computed<string[]>(() => {
      return getters['dataset/allConsensusStagesIds']
    })

    const isWithinConsensus = computed(() => allConsensusStagesIdsGetter.value.includes(
      props.datasetItem.workflow_data?.current_stage_instances[0]?.stage_id ?? ''
    ))

    const selectedDatasetItemV2Id = computed(() => state.workview.selectedDatasetItemV2Id)
    const memberships = computed((): MembershipPayload[] => getters['team/relevantTeamMemberships'])

    const assigneeId = computed((): number | null => {
      if (isWithinConsensus.value) { return null }
      if (!ASSIGNABLE_STATUSES.includes(props.datasetItem.status)) { return null }

      if (props.datasetItem.workflow_data) {
        return props.datasetItem.workflow_data.current_stage_instances[0]?.assignee_id || null
      }

      return null
    })

    const assignee = computed((): MembershipPayload | null => {
      if (assigneeId.value === null) { return null }
      return memberships.value.find(m => m.user_id === assigneeId.value) || null
    })

    const filename = computed(() => props.datasetItem.slots[0].file_name)
    const thumbnail = computed(() => resolveThumbnailV2(props.datasetItem))
    const selected = computed(() => selectedDatasetItemV2Id.value === props.datasetItem.id)

    const instances = computed((): WorkflowStagePayload[] => {
      if (!props.datasetItem || !props.datasetItem.current_workflow) { return [] }
      const stageNumber = props.datasetItem.current_workflow.current_stage_number
      return props.datasetItem.current_workflow.stages[stageNumber]
    })

    const archivedStatus = computed(() => props.datasetItem.status === 'archived')

    const inActiveWorkflow = computed(() => {
      return !!props.datasetItem.current_workflow_id && !isDefaultAutoComplete(props.datasetItem)
    })

    const isVideo = computed(() => {
      return !!(props.datasetItem.slot_types.includes(DatasetItemType.video))
    })

    const datasetItemStatus = computed(() => {
      if (isWithinConsensus.value) {
        return StageType.ConsensusEntrypoint
      }
      return props.datasetItem.status
    })

    /**
     * Not the cleanest way to do it, but until we consolidate routes, probably the simplest
     *
     * Infers the route an individual image links to, based on params and query
     * content of the current route.
     */
    const itemRoute = computed(() => {
      const { name, params, query } = route

      return params.teamSlug
        // open-datasets -> /:team_slug/:dataset_slug/:seq
        ? { name: name, params: { ...params, datasetImageSeq: props.datasetItem.id } }
        // workview -> /workview?dataset={dataset_id}&image={seq}
        : { name: name, query: { ...query, item: props.datasetItem.id } }
    })

    return {
      archivedStatus,
      assignee,
      datasetItemStatus,
      filename,
      inActiveWorkflow,
      instances,
      isVideo,
      itemRoute,
      selected,
      thumbnail,
    }
  }
})
</script>

<style lang="scss" scoped>
.workflow-image {
  &:active,
  &:hover,
  &:visited {
    color: inherit;
    text-decoration: none;
  }

  &__status {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 4px;
    left: 4px;
    overflow: hidden;
  }

  &__status {
    @include workflow-status-background-color;
    color: $colorWhite;
  }
}
</style>
