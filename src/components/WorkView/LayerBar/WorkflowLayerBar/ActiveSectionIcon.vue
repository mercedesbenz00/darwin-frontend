<template>
  <div
    v-if="view.editor.viewsList.length > 1"
    class="layout-icon"
    :class="[splitTypeClass, {'layout-icon--active': active}]"
  >
    <span
      v-for="v in view.editor.viewsList"
      :key="v.id"
      class="layout-icon__section"
      :class="{ 'layout-icon__section--active': v.id === view.id}"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { View } from '@/engine/models'

@Component({
  name: 'active-section-icon'
})
export default class ActiveSectionIcon extends Vue {
  @Prop({ required: true, type: Object as () => View })
  view!: View

  @Prop({ type: Boolean })
  active!: boolean

  get splitTypeClass (): string {
    if (this.view.itemLayout) {
      const { name } = this.view.itemLayout

      switch (name) {
      case 'vertical': return 'layout-icon--vertical'
      case 'horizontal': return 'layout-icon--horizontal'
      case 'grid': {
        const gridClass = 'layout-icon--grid'
        const viewsListLength = this.view.editor.viewsList.length
        if (viewsListLength <= 4) {
          return `${gridClass} layout-icon--grid--2`
        }

        if (viewsListLength <= 9) {
          return `${gridClass} layout-icon--grid--3`
        }

        return `${gridClass} layout-icon--grid--4`
      }
      }
    }

    return ''
  }
}
</script>

<style lang="scss" scoped>
.layout-icon {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  width: 16px;
  height: 16px;
  gap: 1px;

  &.layout-icon--horizontal {
    grid-template-columns: 1fr 1fr;
  }

  &.layout-icon--vertical {
    grid-template-rows: 1fr 1fr;
  }

  &.layout-icon--grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(33% - 1px), 1fr));
    grid-template-rows: 1fr;
    grid-auto-rows: 1fr;

    &.layout-icon--grid--2 {
      grid-template-columns: repeat(auto-fill, minmax(calc(50% - 1px), 1fr));
    }
    &.layout-icon--grid--4 {
      grid-template-columns: repeat(auto-fill, minmax(calc(25% - 1px), 1fr));
    }
  }
}

.layout-icon--active {
  .layout-icon__section {
    background-color: $colorLightBlue;

    &.layout-icon__section--active {
      background-color: $colorBlue;
    }
  }
}

.layout-icon__section {
  width: auto;
  height: auto;
  border-radius: 1px;
  background-color: $colorGrayLite2;

  &.layout-icon__section--active {
    background-color: $colorGrayMedium;
  }
}
</style>
