<template>
  <icon-button
    v-tooltip="{
      content: direction === SortDirection.ASCENDING ? 'Ascending' : 'Descending'
    }"
    class="sort-button"
    :class="{
      'sort-button--inactive': direction === SortDirection.UNSPECIFED,
      'sort-button--reverse': direction === SortDirection.ASCENDING
    }"
    size="mini"
    flair="super-soft"
    color="transparent"
    :disabled="disabled"
    @click.prevent.stop="onClick"
  >
    <sort-asc-icon
      v-if="direction === SortDirection.ASCENDING"
      class="sort-button__arrow--asc"
    />
    <sort-desc-icon
      v-else-if="direction === SortDirection.DESCENDING"
      class="sort-button__arrow--desc"
    />
    <sort-icon
      v-else
      class="sort-button__arrow"
    />
  </icon-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { IconButton } from '@/components/Common/Button/V2'
import { SortAscIcon, SortDescIcon, SortIcon } from '@/components/Common/SortButton/assets/icons'

export enum SortDirection {
  UNSPECIFED = '',
  DESCENDING = 'desc',
  ASCENDING = 'asc'
}

const directionValidator = (val: string) => {
  const directions: string[] = Object.values(SortDirection)
  return directions.indexOf(val) >= 0
}

@Component({
  name: 'sort-button',
  components: {
    IconButton,
    SortIcon,
    SortAscIcon,
    SortDescIcon
  }
})
export default class SortButton extends Vue {
  @Prop({ required: false })
  id!: string;

  @Prop({ required: false, default: SortDirection.ASCENDING, validator: directionValidator })
  direction!: string;

  @Prop({ default: false, type: Boolean })
  disabled!: boolean

  SortDirection = SortDirection

  onClick (): void {
    const directions: string[] = Object.values(SortDirection)
    const idx = directions.indexOf(this.direction)
    const mod = (idx + 1) % directions.length
    this.$emit('change', mod)
    this.$emit('update:direction', directions[mod])
  }
}
</script>
