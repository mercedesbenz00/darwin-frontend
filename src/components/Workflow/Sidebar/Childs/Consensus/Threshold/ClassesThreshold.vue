<template>
  <div class="classes-threshold">
    <InputFieldV2
      class="search-input"
      placeholder="Search Classes"
      :value="textFilter"
      @input="onInputChange"
    >
      <template #left-icon>
        <IconMonoSearch />
      </template>
    </InputFieldV2>
    <div class="items">
      <div
        class="item"
        v-for="(item, index) in annotationClasses"
        :key="index"
      >
        <div class="name">
          <TypeIcon
            class="type-icon"
            :type="item.annotation_types[0]"
            :color="item.metadata._color"
          />
          <div
            class="text"
            v-tooltip="item.name"
          >
            {{ item.name }}
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
import { defineComponent, computed, ref } from 'vue'

import { IconMonoSearch } from '@/assets/icons/V2/Mono'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import InputFieldV2 from '@/components/Common/InputField/V2/InputField.vue'
import {
  SUPPORTED_THRESHOLD_TYPES
} from '@/components/Workflow/Sidebar/Childs/Consensus/Threshold/TypesThreshold.vue'
import { useStore } from '@/composables'
import { Payload } from '@/store/modules/V2Workflow/mutations/UPDATE_CONSENSUS_TEST_CLASS_IOU'
import { AnnotationClassPayload } from '@/store/types'
import { V2TestStagePayload } from '@/store/types'

import ThresholdSlider from './ThresholdSlider.vue'

/**
 * @Component Classes threshold'
 */
export default defineComponent({
  name: 'ClassesThreshold',
  components: { ThresholdSlider, InputFieldV2, IconMonoSearch, TypeIcon },
  props: {
    testStage: {
      type: Object as () => V2TestStagePayload,
      required: true,
    },
  },
  setup (props) {
    const textFilter = ref('')
    const generalValue = computed(
      () => props.testStage.config.iou_thresholds.general_threshold
    )

    const classValuesFromConfig = computed(() =>
      Object.fromEntries(
        props.testStage.config.iou_thresholds.annotation_types.map((c) => [
          c.annotation_type,
          c.threshold,
        ])
      )
    )

    const valuesFromConfig = computed(() =>
      Object.fromEntries(
        props.testStage.config.iou_thresholds.annotation_classes.map((c) => [
          c.annotation_class_id,
          c.threshold,
        ])
      )
    )

    const store = useStore()
    const allValuesMap = computed<Record<number, number>>(() =>
      Object.fromEntries(
        store.state.aclass.classes
          .map((x) => [
            x.id,
            valuesFromConfig.value[x.id] ??
            classValuesFromConfig.value[x.annotation_types[0]] ??
            generalValue.value,
          ])
      )
    )

    const onChange = (
      aclass: AnnotationClassPayload,
      newValue: number
    ): void => {
      store.commit('v2Workflow/UPDATE_CONSENSUS_TEST_CLASS_IOU', {
        testStageId: props.testStage?.id,
        annotationClassId: aclass.id,
        threshold: newValue,
      } as Payload)
    }
    const onInputChange = (value: string): void => {
      textFilter.value = value
    }
    const dataSetId = computed(() => store.state.v2Workflow.editedWorkflow?.dataset?.id)
    const allowedVisibles = computed(() => new Set(SUPPORTED_THRESHOLD_TYPES))
    const annotationClasses = computed(() => {
      return store.state.aclass.classes
        .filter(ac => dataSetId.value && ac.datasets.map(({ id }) => id).includes(dataSetId.value))
        .filter(c => allowedVisibles.value.has(c.annotation_types[0]))
        .filter((item) =>
          item.name.toLowerCase().includes(textFilter.value.toLowerCase())
        )
        .map((item) => ({ ...item, value: allValuesMap.value[item.id] }))
    })
    return {
      onChange,
      textFilter,
      annotationClasses,
      onInputChange,
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
.classes-threshold {
  background: white;
  padding: 12px;
  padding-right: 0px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  margin-right: 12px;
  width: auto;
}
</style>
