<template>
  <div class="types-threshold">
    <div class="items">
      <div
        class="item"
        v-for="(item, index) in annotationTypes"
        :key="index"
      >
        <div class="name">
          <TypeIcon
            class="type-icon"
            :type="item.name"
          />
          <div
            class="text"
            v-tooltip="item.title"
          >
            {{ item.title }}
          </div>
        </div>
        <div class="value">
          <ThresholdSlider
            class="threshold-slider"
            :value="item.value"
            @change="onChange(item, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { startCase } from 'lodash'
import { defineComponent, computed } from 'vue'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { useStore } from '@/composables'
import { Payload } from '@/store/modules/V2Workflow/mutations/UPDATE_CONSENSUS_TEST_TYPE_IOU'
import { AnnotationTypePayload } from '@/store/types'
import { V2TestStagePayload } from '@/store/types'

import ThresholdSlider from './ThresholdSlider.vue'

export const SUPPORTED_THRESHOLD_TYPES = ['bounding_box', 'polygon']

/**
 * @Component Types Threshold'
 */
export default defineComponent({
  name: 'TypesThreshold',
  components: { ThresholdSlider, TypeIcon },
  props: {
    testStage: {
      type: Object as () => V2TestStagePayload,
      required: true,
    },
  },
  setup (props) {
    const generalValue = computed(
      () => props.testStage.config.iou_thresholds.general_threshold
    )
    const store = useStore()
    const valuesFromConfig = computed(() =>
      Object.fromEntries(props.testStage.config.iou_thresholds.annotation_types.map((c) => [
        c.annotation_type,
        c.threshold,
      ]))
    )

    const allValuesMap = computed(() =>
      Object.fromEntries(
        store.state.aclass.types.map((a) => [
          a.name,
          valuesFromConfig.value[a.name] ?? generalValue.value,
        ])
      )
    )
    const onChange = (aType: AnnotationTypePayload, newValue: number): void => {
      store.commit('v2Workflow/UPDATE_CONSENSUS_TEST_TYPE_IOU', {
        testStageId: props.testStage?.id,
        // confirm why not the ID here, ask Balys
        type: aType.name,
        threshold: newValue,
      } as Payload)
    }
    const allowedVisibles = computed(() => new Set(SUPPORTED_THRESHOLD_TYPES))
    const dataSetId = computed(() => store.state.v2Workflow.editedWorkflow?.dataset?.id)
    const applicableClasses = computed(() =>
      store.state.aclass.classes
        .filter(ac => dataSetId.value && ac.datasets.map(({ id }) => id).includes(dataSetId.value))
    )
    const annotationTypes = computed(() => {
      return store.state.aclass.types
        .filter((t) => applicableClasses.value.some(c => c.annotation_types.includes(t.name)))
        .filter((t) => allowedVisibles.value.has(t.name))
        .map((t) => ({
          ...t,
          value: allValuesMap.value[t.name],
          title: startCase(t.name)
        }))
    })

    return {
      onChange,
      annotationTypes,
    }
  },
})
</script>

<style lang="scss" scoped>
.items {
  max-height: 210px;
  overflow-y: auto;

  .item {
    padding: 5px;
    display: flex;
    flex-direction: row;
    gap: 7px;
    align-items: center;
    justify-content: space-between;

    .name {
      width: 50%;
      display: flex;
      flex-direction: row;
      gap: 5px;
      align-items: center;

      .text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .type-icon {
        width: 20px;
        flex-shrink: 0;
      }
    }
    .value {
      width: 50%;
    }
  }
}
.threshold-slider {
  &:deep(.slider) {
    width: 50%;
  }
  &:deep(.number-input) {
    width: 50%;
  }
}
.types-threshold {
  background: white;
  padding: 12px;
  padding-right: 0px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
