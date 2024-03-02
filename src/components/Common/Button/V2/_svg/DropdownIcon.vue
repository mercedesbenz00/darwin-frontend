<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5964 7L7.26096 7C6.52732 7 6.16051 7 5.95938 7.15281C5.78419
         7.28591 5.67628 7.48923 5.66422 7.70892C5.65039 7.96113 5.85597
         8.26493 6.26712 8.87252L6.26712 8.87252L8.79443 12.6073C9.11222
         13.0769 9.27112 13.3118 9.47327 13.3985C9.6502 13.4744 9.84954 13.4794
         10.03 13.4124C10.2362 13.3358 10.4066 13.1092 10.7474 12.656L13.5555
         8.92115C14.0203 8.30294 14.2528 7.99383 14.2476 7.73504C14.2431 7.50984
         14.1376 7.29858 13.9603 7.15965C13.7566 7 13.3699 7 12.5964 7Z"
      :fill="color"
    />
    <!-- eslint-enable max-len -->
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({ name: 'dropdown-icon' })
export default class DropdownIcon extends Vue {
  @Prop({ default: 'hsla(212, 8%, 76%, 1)', type: String })
  color!: string
}
</script>
