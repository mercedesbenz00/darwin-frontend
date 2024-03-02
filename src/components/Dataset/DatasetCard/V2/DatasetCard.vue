<template>
  <div
    class="dataset-card__container"
    v-tooltip="!selectable ? 'The dataset is already used in another workflow' : undefined"
    :class="{
      'dataset-card__container--selected': selected,
      'dataset-card__container--unselectable': !selectable
    }"
  >
    <div class="dataset-connected__container">
      <thumbnails
        :data="dataset.thumbnails"
        :max="3"
        variant="big"
      />
      <p
        v-tooltip="dataset.name"
        class="dataset-connected__label"
      >
        {{ dataset.name }}
      </p>
      <div class="dataset-connected__attribute-wrapper">
        <attribute-stack>
          <template #primary-attribute>
            {{ itemCount }}
          </template>
          <template #secondary-attribute>
            Items
          </template>
        </attribute-stack>
        <attribute-stack>
          <template #primary-attribute>
            {{ dataset.num_classes||0 }}
          </template>
          <template #secondary-attribute>
            Classes
          </template>
        </attribute-stack>
        <attribute-stack>
          <template #primary-attribute>
            {{ dataset.num_annotations||0 }}
          </template>
          <template #secondary-attribute>
            Annotations
          </template>
        </attribute-stack>
      </div>
      <div class="dataset-connected__progress-wrapper">
        <progress-bar
          variant="active"
          :value="progressValue"
        />
        <p class="dataset-connected__progress-label">
          {{ progressPercentage }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  PropType
} from 'vue'

import AttributeStack from '@/components/Common/AttributeStack/AttributeStack.vue'
import ProgressBar from '@/components/Common/ProgressBar/ProgressBar.vue'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import { DatasetPayload } from '@/store/types'

import { DatasetCardProps } from './types'

export default defineComponent({
  name: 'DatasetCardV2',
  components: {
    Thumbnails,
    AttributeStack,
    ProgressBar
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    selectable: {
      required: false,
      type: Boolean,
      default: false
    },
    selected: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup (props: DatasetCardProps) {
    const progressValue = computed(() => {
      return props.dataset.progress || 0
    })

    const progressPercentage = computed(() => {
      return Math.round(progressValue.value * 100)
    })

    const itemCount = computed(() => {
      return (props.dataset.num_images || 0) + (props.dataset.num_videos || 0)
    })

    return {
      progressValue,
      progressPercentage,
      itemCount
    }
  }
})
</script>

<style lang='scss' scoped>
.dataset-card__container {
  width: 100%;
  transition: all 100ms ease;

  display: inline-block;
  padding-bottom: 3px;
  background-color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid $colorStrokeRaise;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.03), 0px 1px 2px rgba(16, 24, 40, 0.05);;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 0px 0px 1.5px $colorCheckBoxFocus;
  }

  &--selected {
    box-shadow: 0px 0px 0px 1.5px $colorCheckBoxFocus;
  }

  &--unselectable {
    &:hover {
      box-shadow: none;
    }
    cursor: default;
    opacity: 0.5;
  }
}
.dataset-connected__container {
  display: grid;
  grid-template-rows: repeat(4, min-content);
  grid-row-gap: 6px;
  padding: 6px;
}

.dataset-connected__label {
  margin-left: 2px;
  @include typography(md-1, inter, 500);
  color: $colorContentDefault;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dataset-connected__attribute-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 2px;
}

.dataset-connected__progress-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dataset-connected__progress-label {
  @include typography(sm, inter, 500);
  color: $colorContentTertiary;
  text-align: right;
  margin-left: 10px;
}
</style>
