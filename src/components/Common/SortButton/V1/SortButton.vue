<template>
  <button
    class="sort-button"
    :class="{
      'sort-button--inactive': direction === SortDirection.UNSPECIFED,
      'sort-button--reverse': direction === SortDirection.ASCENDING
    }"
    @click="onClick"
  >
    <sort-arrow-icon class="sort-button__arrow" />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { SortArrowIcon } from '@/assets/icons/V1'

export enum SortDirection {
  UNSPECIFED = 0,
  DESCENDING = 1,
  ASCENDING = 2
}

const sortDirections = [SortDirection.UNSPECIFED, SortDirection.DESCENDING, SortDirection.ASCENDING]
const directionValidator = (val: number) => sortDirections.includes(val)

@Component({ name: 'sort-button', components: { SortArrowIcon } })
export default class SortButton extends Vue {
  @Prop({ required: false })
  id!: string;

  @Prop({ required: false, default: 0, validator: directionValidator })
  direction!: SortDirection;

  SortDirection = SortDirection

  onClick () {
    const payload = {
      id: this.id,
      direction: (this.direction + 1) % 3
    }
    this.$emit('change', payload)
    this.$emit('update:direction', payload.direction)
  }
}
</script>

<style lang="scss" scoped>
.sort-button {
  width: 12px;
  height: 12px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  display: flex;
}

.sort-button--inactive {
  opacity: .5;
}

.sort-button__arrow {
  width: 12px;
  height: 12px;
}

.sort-button--reverse .sort-button__arrow {
  transform: rotateZ(180deg);
}
</style>
