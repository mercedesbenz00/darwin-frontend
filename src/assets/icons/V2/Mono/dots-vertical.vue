<template>
  <svg
    width="4"
    height="12"
    viewBox="0 0 4 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="2"
      cy="1.5"
      r="1.5"
      transform="rotate(90 2 1.5)"
      :fill="color"
    />
    <circle
      cx="2"
      cy="6"
      r="1.5"
      transform="rotate(90 2 6)"
      :fill="color"
    />
    <circle
      cx="2"
      cy="10.5"
      r="1.5"
      transform="rotate(90 2 10.5)"
      :fill="color"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'

@Component({ name: 'dots-vertical' })
export default class DotsVertical extends Vue {
  @Prop({ default: colors.colorContentTertiary, type: String })
  color!: string
}
</script>
