<template>
  <type-icon-with-label
    class="toggle"
    tag="button"
    :class="{'toggle--active': selected}"
    :color="color"
    :disabled="disabled"
    :label="label"
    :type="type"
    @click.native="$emit('click')"
  >
    <template
      v-if="$slots.tooltip"
      #tooltip
    >
      <slot name="tooltip" />
    </template>
  </type-icon-with-label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import { formatTypeName } from '@/utils'

@Component({
  name: 'type-toggle-with-label',
  components: { TypeIconWithLabel }
})
export default class TypeToggleWithLabel extends Vue {
  @Prop({ required: true, type: String })
  label!: string

  @Prop({ required: true, type: String })
  type!: string

  @Prop({ required: true, type: Boolean })
  selected!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: false

  get name (): string {
    return formatTypeName(this.type)
  }

  @Prop({ required: false, type: String })
  color?: string

  get colorWithFallback (): string {
    return this.color || this.$theme.getColor('colorFeatherLight')
  }
}

</script>

<style lang="scss" scoped>
.toggle {
  padding: 0 8px;

  font: inherit;

  cursor: pointer;

  border-radius: 5px;
  border: 1px solid transparent;

  background: transparent;

  box-sizing: border-box;

  transition: border-color, background .2s ease;

  &:disabled {
    opacity: 0.3;
  }

  &:hover:not(:disabled),
  &:active:not(:disabled),
  &.toggle--active:not(:disabled) {
    background: $colorAliceShade;
  }
  &.toggle--active {
    border-color: $colorAliceNight;
  }

  &:hover:not(:disabled) {
    border-color: transparent
  }
}

</style>
