<template>
  <div
    class="svg"
    :class="{ 'svg--dimension': width || height }"
    :style="svgStyle"
    v-html="svgContent"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { api, anyToRGBA, rgbaString } from '@/utils'

/**
 * SVGOverlay component loads the svg content which has been built specifically.
 *
 * SVG file is supposed to contain variables which will be replaced by real color values.
 * In the current stage, it just supports 2 colors - `primaryColor` and `secondaryColor`.
 *
 * Component loads the svg content by sending GET request and replaces the color values.
 * To reduce the number of http requests, it caches the loaded content into session storage.
 * Session storage keeps the loading status and the content of each svg files
 * identified by svg url.
 *
 * If one svg has been loaded already, it is not being loaded again in the same tab
 * until it's closed.
 *
 * Loading status saved into the storage item whose key is `{{url}}_loading`.
 * SVG content saved into the storage item whose key is `{{url}}.
 *
 * @param url url of svg file
 * @param color color to replace
 */
@Component({ name: 'svg-overlay' })
export default class SVGOverlay extends Vue {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: false, default: 'rgb(122,122,122)' })
  color!: string;

  @Prop({ required: false, default: null })
  width!: number | null;

  @Prop({ required: false, default: null })
  height!: number | null;

  data: string | null = null

  get svgContent () {
    if (!this.data) { return null }
    const rgba = anyToRGBA(this.color)
    return this.data
      .replace(/{{primaryColor}}/gi, rgbaString(rgba))
      .replace(/{{secondaryColor}}/gi, rgbaString(rgba, 0.5))
  }

  get svgStyle () {
    const style: { width?: string, height?: string } = {}
    if (this.width) { style.width = `${this.width}px` }
    if (this.height) { style.height = `${this.height}px` }
    return style
  }

  mounted (): void {
    window.addEventListener('svg_loaded', this.onSVGLoaded as EventListener)
    this.$once('hook:beforeDestroy', () =>
      document.removeEventListener('keydown', this.onSVGLoaded as EventListener)
    )
  }

  onSVGLoaded (event: CustomEvent) {
    if (!event.detail.success || event.detail.url !== this.url) { return }
    this.data = window.sessionStorage.getItem(this.url)
  }

  @Watch('url', { immediate: true })
  onUrlChange () {
    if (this.url) { this.load(this.url) }
  }

  @Watch('color')
  onColorChange () {
    if (this.url) { this.load(this.url) }
  }

  isSVGLoading () {
    return window.sessionStorage.getItem(`${this.url}_loading`) === 'true'
  }

  getLoadedSVG () {
    return window.sessionStorage.getItem(this.url)
  }

  setSVGLoadingStatus (loading: boolean) {
    window.sessionStorage.setItem(`${this.url}_loading`, loading ? 'true' : 'false')
  }

  saveSVG (data: string) {
    this.data = data
    window.sessionStorage.setItem(this.url, data)
    window.sessionStorage.setItem(`${this.url}_loading`, 'false')

    const event = new CustomEvent('svg_loaded', {
      detail: { success: true, url: this.url }
    })
    window.dispatchEvent(event)
  }

  async load (url: string) {
    if (this.isSVGLoading()) { return }

    const loadedSvg = this.getLoadedSVG()
    if (loadedSvg) {
      this.saveSVG(loadedSvg)
      return
    }

    this.setSVGLoadingStatus(true)

    let response
    try {
      response = await api.loadSVGFile(url)
    } catch (err: unknown) {
      console.error('SVG Load error: ', err)
      this.setSVGLoadingStatus(false)
      return
    }

    this.setSVGLoadingStatus(false)
    this.saveSVG(response.data)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.svg--dimension {
  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
