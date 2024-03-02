<template>
  <svg
    :aria-labelledby="titleId"
    :height="height"
    :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
    :width="width"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title
      :id="titleId"
      lang="en"
    >{{ iconName }} icon</title>
    <slot />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'icon'
})
export default class Icon extends Vue {
  @Prop({ required: true, type: String })
  iconName!: string

  @Prop({ required: false, type: [Number, String], default: 24 })
  viewBoxWidth!: [number, string]

  @Prop({ required: false, type: [Number, String], default: 24 })
  viewBoxHeight!: [number, string]

  @Prop({ required: false, type: [Number, String], default: 20 })
  width!: [number, string]

  @Prop({ required: false, type: [Number, String], default: 20 })
  height!: [number, string]

  get titleId () {
    return `${this.iconName.toLowerCase()}-svg-title`
  }
}
</script>
