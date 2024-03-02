<template>
  <gallery-context-menu-item
    label=""
    :value="value"
    :disabled="disabled"
    :tooltip="tooltip"
    @click="onClick"
  >
    <check-box
      :value="value"
      :disabled="disabled"
      :label="label"
      class="gallery-context-menu-check-item__checkbox"
      name="showNotifications"
    />
  </gallery-context-menu-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'

import GalleryContextMenuItem from './GalleryContextMenuItem.vue'

@Component({
  name: 'gallery-context-menu-check-item',
  components: { CheckBox, GalleryContextMenuItem }
})
export default class GalleryContextMenuCheckItem extends Vue {
  @Prop({ required: true })
  label!: string

  @Prop({ required: true, type: Boolean, default: false })
  value!: boolean

  @Prop({ required: false, type: String, default: null })
  tooltip!: string | null

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  onClick (event: MouseEvent) {
    event.stopPropagation()
    event.preventDefault()
    if (this.disabled) { return }
    this.$emit('click', !this.value)
  }
}
</script>

<style lang="scss" scoped>
.gallery-context-menu-check-item__checkbox {
  :deep(.check-box__label__box) {
    border-color: $color90Black;
  }

  :deep(.check-box__label__text) {
    color: $color90Black;
  }
}
</style>
