<template>
  <component
    v-if="shouldRender"
    :is="tag"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

/**
 * Renders component only when it's inside the viewport.
 *
 * It watches for x and y changes and checks
 * if the element needs to be displayed.
 */
@Component({ name: 'lazy' })
export default class Lazy extends Vue {
  @Prop({ type: Number, required: true })
  width!: number

  @Prop({ type: Number, required: true })
  height!: number

  /**
   * Horizontal element position.
   */
  @Prop({ type: Number, required: true })
  x!: number

  /**
   * Vertical element position.
   */
  @Prop({ type: Number, required: true })
  y!: number

  /**
   * Defines the element based on which it will calculate boundaries.
   */
  @Prop({ type: [HTMLDivElement, HTMLBodyElement], default: () => document.body })
  viewportElement!: HTMLElement | null

  @Prop({ type: Number, default: 50 })
  padding!: number

  @Prop({ type: String, default: 'div' })
  tag!: string

  shouldRender: boolean = false

  @Watch('y', { immediate: true })
  onYChange (): void {
    this.checkViewport()
  }

  @Watch('x', { immediate: true })
  onXChange (): void {
    this.checkViewport()
  }

  checkViewport (): void {
    const viewportBoundingBox = (this.viewportElement || document.body).getBoundingClientRect()

    const relativeX = viewportBoundingBox.left + this.x
    const relativeY = viewportBoundingBox.top + this.y

    const relativeViewportWidth = viewportBoundingBox.left + viewportBoundingBox.width
    const relativeViewportHeight = viewportBoundingBox.top + viewportBoundingBox.height

    const isFitsHorizontally =
      (relativeX + this.width + this.padding) >= viewportBoundingBox.left &&
      (relativeX - this.width - this.padding) <= relativeViewportWidth
    const isFitsVertically =
      (relativeY + this.height + this.padding) >= viewportBoundingBox.top &&
      (relativeY - this.height - this.padding) <= relativeViewportHeight

    this.shouldRender = isFitsHorizontally && isFitsVertically
  }
}
</script>
