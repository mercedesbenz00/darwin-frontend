<template>
  <div>
    <div
      v-if="loading"
      v-loading="loading"
      :loading-options="options"
      class="spinner"
    />
    <slot v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

/**
 * Generic component used to wrap a UI which depends on data being loaded from somewhere.
 * This component appears the same way as v-loading directive
 *
 * The major differences between them (v-loading directive and this component)
 * - v-loading directive renders the main component while loading
 * - This component doesn't render the main component before the loading is finished
 *
 * Properties
 *
 * @property {Boolean} loading
 * - flag indicating if data is currently loading
 * - if true, component will render a loading spinner
 * - if false, component will render the default slot
 *
 * The following properties works same as v-loading directives option params.
 * @property {String} backgroundColor
 * @property {String} label
 * @property {String} size
 * @property {String} theme
 *
 * In an attempt to be a generalized solution, the component is styled to render
 * it's content full width, with the loading indicator having a fixed height of
 * 80px, while the actual content's height grows as needed.
 */
@Component({ name: 'loading-wrapper' })
export default class LoadingWrapper extends Vue {
  @Prop({ required: true, type: Boolean })
  loading!: boolean

  @Prop({ required: false, default: 'rgba(0, 0, 0, 0.1)' })
  backgroundColor!: string

  @Prop({ required: false, default: null })
  label!: string | null

  @Prop({ required: false, default: 'medium' })
  size!: 'small' | 'medium' | 'large'

  @Prop({ required: false, default: 'grey' })
  theme!: 'grey' | 'dark'

  @Prop({ required: false })
  minTimeout?: number

  get options () {
    return {
      backgroundColor: this.backgroundColor,
      label: this.label,
      size: this.size,
      theme: this.theme,
      ...(this.minTimeout && { minTimeout: this.minTimeout })
    }
  }
}
</script>

<style lang="scss" scoped>
.spinner {
  min-width: 30px;
  min-height: 30px;
  height: 100%;
}
</style>
