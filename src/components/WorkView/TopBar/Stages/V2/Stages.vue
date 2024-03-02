<template>
  <div
    ref="rootEl"
    v-if="stageData.length"
    class="stages"
    :style="style"
  >
    <div class="stages__content">
      <template v-for="(item, idx) in stageData">
        <v2-stage-item
          class="stage"
          :key="item.key"
          :data="item"
          :active="!isStageSelected && activeKey === item.key"
          :selected="selectedStageData[idx]"
          @click="onSelect"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import { V2StageItem } from '@/components/WorkView/TopBar/Stages/V2'
import { StageData } from '@/components/WorkView/TopBar/Stages/types'
import { useStageSelector, useStore } from '@/composables'
import {
  StageType,
  V2InstanceStatus,
  V2WorkflowPayload,
  V2WorkflowStagePayload,
  V2WorkflowStageInstancePayload
} from '@/store/types'
import {
  collectFlattenedStageData,
  dropConsensusInternalStagesData,
  getHappyPathEdges,
  getStagesData,
} from '@/utils/workflows'

const buildStageData = (
  stage: V2WorkflowStagePayload,
  allStages: V2WorkflowStagePayload[]
): StageData => {
  const followerIds = getHappyPathEdges(stage).map(e => e.target_stage_id)
  const followers = allStages
    .filter((s: V2WorkflowStagePayload) => followerIds.includes(s.id))
    .map((s: V2WorkflowStagePayload) => buildStageData(s, allStages))

  return {
    stage,
    instance: null,
    followers,
    key: stage.id
  }
}

export default defineComponent({
  name: 'V2Stages',
  components: { V2StageItem },
  props: {
    maxWidth: { default: 160, type: Number }
  },
  setup (props) {
    useStageSelector()

    const { state, dispatch } = useStore()
    const rootEl = ref()

    const item = computed(() => state.workview.v2WorkflowItemState)
    const selectedInstance = computed(() => state.workview.v2SelectedStageInstance)
    const selectedStage = computed(() => state.workview.v2SelectedStage)
    const workflows = computed(() => state.workview.v2Workflows)
    const dataset = computed(() => state.workview.dataset)

    const style = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return { maxWidth: `${props.maxWidth}px` }
    })

    const workflow = computed((): V2WorkflowPayload | null => {
      if (!dataset.value) { return null }
      return workflows.value
        .find((w) =>
          !!w.stages
            .find(s =>
              s.type === StageType.Dataset && s.config.dataset_id === dataset.value?.id
            )
        ) || null
    })

    // the stage data, used in case the workview doesn't have
    // an active item (state.workview.v2WorkflowItemState)
    const inactiveData = computed((): StageData[] => {
      const stages = workflow.value?.stages || []

      return stages
        .filter(s => 'initial' in s.config && s.config.initial)
        .map(initialStage => buildStageData(initialStage, stages))
    })

    // the stage data, used in case the workview has an active
    // item (state.workview.v2WorkflowItemState)
    const activeData = computed((): StageData[] => {
      if (!item.value || !workflow.value) { return [] }

      const visitedIds = new Set()
      let activeStageData = [
        ...item.value.previous_stage_instances,
        ...item.value.current_stage_instances
      ]
        .reduce((acc: StageData[], instance: V2WorkflowStageInstancePayload) => {
          const { stage, id, stage: { id: stageId } } = instance
          const newStageData = getStagesData(
            workflow.value?.stages || [],
            {
              stage,
              instance,
              key: `${stageId}_${id}`,
              followers: []
            },
            // it's important to pass the visited Set otherwise those stages might
            // be duplicated by this method if there are loops in the workflow
            visitedIds
          )
          if (newStageData.length > 1) {
            acc.push(...newStageData)
            visitedIds.add(stageId)
          }
          return acc
        }, [])

      activeStageData = dropConsensusInternalStagesData(activeStageData)

      // fill out the missing stage instance for consensus
      activeStageData = activeStageData.map(stageDataItem => {
        const stage = stageDataItem.stage
        if (stage.type === StageType.ConsensusEntrypoint) {
          return {
            ...stageDataItem,
            instance: state.workview.v2WorkflowItemState?.current_stage_instances?.find(
              csi =>  {
                return [
                  stage.id,
                  ...stage.config.parallel_stage_ids,
                  stage.config.test_stage_id
                ]
                  .includes(csi.stage.id) && csi.user_id === state.user.profile?.id
              }
            ) ?? null
          }
        }
        return stageDataItem
      })

      // make sure the complete stage is showed last, as even if it make
      // sense we calculate that by distance within the array, it might
      // be a confusing UX for users
      activeStageData = [
        ...activeStageData.filter((sd: StageData) => sd.stage.type !== StageType.Complete),
        ...activeStageData.filter((sd: StageData) => sd.stage.type === StageType.Complete),
      ]

      return activeStageData
    })

    // returns inactive or active data depending on if the workview has
    // an active item (state.workview.v2WorkflowItemState)
    const stageData = computed((): StageData[] => {
      return collectFlattenedStageData(
        item.value ? activeData.value : inactiveData.value,
        []
      )
    })

    // return the current stage data
    const selectedStageData = computed((): boolean[] => {
      return stageData.value
        .map(({ instance, stage }) => {
          return instance
            ? instance.id === selectedInstance.value?.id
            : stage.id === selectedStage.value?.id
        })
    })

    const isStageSelected = computed((): boolean => {
      return selectedStageData.value
        .some(selected => !!selected)
    })

    const activeKey = computed((): string | null => {
      const current = stageData.value
        .find(({ instance }) => instance?.status === 'current')
      return current?.key || ''
    })

    const scrollTo = (stage: StageData): void => {
      const stageIndex = stageData.value.indexOf(stage)
      if (!rootEl.value) { return }
      rootEl.value.scrollTo({ top: 0, left: stageIndex * 14, behavior: 'smooth' })
    }

    // watch for stage changed using the workflow controls
    watch(() => activeKey.value, (val: string | null): void => {
      const current: StageData | undefined = stageData.value.find(({ key }) => key === val)
      if (current) { scrollTo(current) }
    })

    const onSelect = (value: string): void => {
      const stage = stageData.value
        .find(({ key }) => key === value)
      if (!stage) { return }

      if (
        stage.instance?.status !== V2InstanceStatus.Current &&
        stage.instance?.data.exit_snapshot_id
      ) {
        dispatch('workview/loadV2AnnotationsSnapshot', {
          datasetItemId: state.workview.selectedDatasetItemV2Id,
          snapshotId: stage.instance.data.exit_snapshot_id
        })
      }

      scrollTo(stage)
    }

    return {
      rootEl,
      stageData,
      isStageSelected,
      selectedStageData,
      style,
      activeKey,
      scrollTo,
      onSelect
    }
  }
})
</script>

<style lang="scss" scoped>
$height: 36px;

.stages {
  position: relative;
  @include row;
  align-items: center;
  width: fit-content;
  height: $height;
  padding: 0 4px;
  background: $colorSurfaceDarken;
  border-radius: $height;
  @include scrollbarV2('horizontal');

  @include hidden-scrollbar;

  &__content {
    position: relative;
    @include row--center;
    align-items: center;
    width: fit-content;
    padding-left: 3px;
    height: 100%;
  }
}
</style>
