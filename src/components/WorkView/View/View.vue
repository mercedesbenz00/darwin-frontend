<template>
  <div ref="view" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { View } from '@/engine/models'

@Component({
  name: 'view-component'
})
export default class ViewComponent extends Vue {
  @Prop({ required: true, type: Object as () => View })
  view!: View

  $refs!: {
    view: HTMLCanvasElement
  }

  mounted (): void {
    this.$refs.view.replaceWith(this.view.canvasContainer)
    this.view.updateCameraDimensions()
  }
}
</script>
