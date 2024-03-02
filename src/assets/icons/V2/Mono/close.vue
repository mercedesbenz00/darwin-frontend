<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 6L6 14"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M6 6L14 14"
      :stroke="color"
      stroke-width="1.5" 
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'

@Component({ name: 'dots-vertical' })
export default class Close extends Vue {
  @Prop({ default: colors.colorContentTertiary, type: String })
  color!: string
}
</script>
