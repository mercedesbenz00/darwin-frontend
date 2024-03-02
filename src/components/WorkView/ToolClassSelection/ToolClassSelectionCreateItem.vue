<template>
  <li
    v-close-popover
    class="tool-class-selection-create-item"
    @click="$emit('click')"
  >
    New {{ annotationTypeName }} Class
  </li>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { formatTypeName } from '@/utils'

@Component({ name: 'tool-class-selection-create-item' })
export default class ToolClassSelectionCreateItem extends Vue {
  @State(state => state.workview.toolAnnotationTypes)
  toolAnnotationTypes!: string[]

  get annotationTypeName () {
    if (this.toolAnnotationTypes.length > 0) {
      return `${formatTypeName(this.toolAnnotationTypes[0])} `
    }
    return ''
  }
}
</script>

<style lang="scss" scoped>
.tool-class-selection-create-item {
  @include row--center;
  @include typography(md-1, default, bold);
  width: calc(100% - 12px);
  height: 40px;
  min-height: 40px;
  background-color: $colorAliceBlue;
  border-radius: 5px;
  box-shadow: 0px 1px 2px rgba(20, 5, 60, 0.05);
  color: $color90Black;
  text-align: center;
  margin-left: 6px;
  margin-right: 6px;
  cursor: pointer;

  &:hover {
    background-color: $colorAliceShade;
  }

  &:active {
    background-color: $colorAliceShadow;
  }
}
</style>
