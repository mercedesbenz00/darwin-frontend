<template>
  <component
    v-bind="$attrs"
    :is="tag"
    :class="`common-button common-button--${size}`"
    v-on="$listeners"
  >
    <slot>BUTTON TEMPLATE</slot>
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

const sizeValidator = (value: string) => ['default', 'medium', 'small'].includes(value)
const tagValidator = (value: string) => ['button', 'router-link', 'div', 'a'].includes(value)

@Component({ name: 'button-template' })
export default class ButtonTemplate extends Vue {
  @Prop({ default: 'default', validator: sizeValidator })
  size!: 'default' | 'medium' | 'small'

  @Prop({ default: 'button', validator: tagValidator })
  tag!: 'button' | 'router-link' | 'a' | 'div'
}
</script>

<style lang="scss" scoped>
.common-button {
  white-space: nowrap;
  text-overflow: ellipsis;
  letter-spacing: 1px;
  text-align: center;

  border-radius: 3px;

  transition: all .2s ease;

  &[disabled] {
    pointer-events: none;
    opacity: .3;
  }

  &:not([disabled]) {
    cursor: pointer;
  }

  &--default {
    height: 40px;
    padding: 2px 30px;
    font-size: 14px;
    line-height: 18px;
  }

  &--medium {
    height: 35px;
    padding: 2px 25px;
    font-size: 14px;
    line-height: 18px;
  }

  &--small {
    height: 25px;
    padding: 2px 10px;
    font-size: 10px;
    line-height: 14px;
  }
}
</style>
