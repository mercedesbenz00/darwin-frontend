<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0003 6.00015V14.0003"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M5.99994 10.0001H14.0001"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({ name: 'plus-icon' })
export default class PlusIcon extends Vue {
  @Prop({ default: 'hsla(0, 0%, 100%, 1)', type: String })
  color!: string
}
</script>
