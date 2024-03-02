<template>
  <filter-item
    class="status-filter-item"
    :class="{
      [`status-filter-item--${status}`]: true,
    }"
    :status="status"
    @click="$emit('click', data)"
    @shift-click="$emit('shift-click', data)"
  >
    <template #icon>
      <img
        v-if="data.icon"
        class="status-filter-item__icon"
        :src="data.icon"
      >
      <svg-overlay
        v-if="data.svg"
        class="status-filter-item__icon"
        :url="data.svg"
        :width="20 * $theme.getCurrentScale()"
        :height="20 * $theme.getCurrentScale()"
        :color="data.color"
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

import FilterItem from '@/components/Common/Filter/FilterItem.vue'
import { StatusFilterItemType } from '@/components/DatasetFiltering/types'
import { TriToggleStatus } from '@/utils'

@Component({ name: 'status-filter-item', components: { FilterItem } })
export default class StatusFilterItem extends Vue {
  @Prop({ required: true })
  data!: StatusFilterItemType

  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  get shouldRenderCount () {
    return this.data && typeof this.data.count === 'number'
  }
}
</script>
