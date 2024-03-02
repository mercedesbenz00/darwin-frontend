<template>
  <component
    :is="tag"
    class="type"
  >
    <type-icon
      v-if="type"
      class="type__icon"
      :color="colorWithFallback"
      :type="type"
    />
    <span class="type__label">{{ label }}</span>
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'

@Component({
  name: 'type-icon-with-label',
  components: { TypeIcon }
})
export default class TypeIconWithLabel extends Vue {
  @Prop({ required: true, type: String })
  label!: string

  @Prop({ required: false, type: String })
  type?: string

  @Prop({ required: false, type: String })
  color?: string

  get colorWithFallback (): string {
    return this.color || this.$theme.getColor('colorFeatherLight')
  }

  @Prop({ required: false, type: String, default: 'div' })
  tag!: string
}

</script>

<style lang="scss" scoped>
.type {
  display: grid;
  width: fit-content;
  grid-template-columns: 22px auto;
  column-gap: 9px;
  align-items: center;
  justify-content: start;
  align-items: center;

  padding: 2px;

  transition: all .2s;

  min-width: 60px;

  cursor: pointer;

  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
}

.type__icon {
  // determines overall component height
  // 100% h/w would work with chrome, but breaks in safari
  // if parent components need a different size, override within them
  height: 20px;
  width: 20px;
}

.type__label {
  @include typography(md);
  @include ellipsis(1, md);
  color: $color90Black;
}
</style>
