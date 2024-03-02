<template>
  <filter-item
    class="annotation-type-filter-item"
    :class="{ 'annotation-type-filter-item--selected': selected }"
    :status="selected ? 'positive' : 'none'"
    @click="$emit('click', data)"
    @shift-click="$emit('click', data)"
  >
    <template #icon>
      <img
        v-if="data.icon"
        class="annotation-type-filter-item__icon"
        :src="data.icon"
      >

      <type-icon
        v-if="data.name"
        class="annotation-type-filter-item__svg"
        :color="data.color"
        :type="data.name"
      />
    </template>
    <template #label>
      {{ data.label }}
    </template>
    <template
      v-if="shouldRenderCount"
      #count
    >
      {{ data.count }}
    </template>
  </filter-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import FilterItem from '@/components/Common/Filter/FilterItem.vue'

import { AnnotationTypeFilterItemType } from './types'

@Component({ name: 'annotation-type-filter-item', components: { FilterItem, TypeIcon } })
export default class AnnotationFilterItem extends Vue {
  @Prop({ required: true })
  data!: AnnotationTypeFilterItemType

  @Prop({ required: false, type: Boolean, default: false })
  selected!: boolean

  get shouldRenderCount () {
    return this.data && typeof this.data.count === 'number'
  }
}
</script>
