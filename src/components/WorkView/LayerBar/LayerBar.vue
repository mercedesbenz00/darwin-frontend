<template>
  <div class="layerbar-container">
    <div class="layerbar">
      <div class="layerbar__header">
        <div class="layerbar__header__title">
          <span class="layerbar__header__text">Annotations</span>
        </div>
        <div
          v-if="$slots.header"
          class="layerbar__header__tools"
        >
          <slot name="header" />
        </div>
      </div>
      <div
        v-if="$slots.default"
        ref="layersList"
        class="layerbar__layers"
      >
        <slot />
      </div>
      <div
        v-if="$slots.empty"
        class="layerbar_empty"
      >
        <img
          class="layerbar_empty_image"
          src="./assets/empty.png"
          alt
          role="presentation"
        >
        <strong class="layerbar_empty_header">No layers set</strong>
        <slot name="empty" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import HeaderIcon from './assets/header.svg?inline'

@Component({ name: 'layer-bar', components: { HeaderIcon } })
export default class LayerBar extends Vue {
  @Prop({ type: Boolean, default: false })
  editable!: boolean

  beforeDestroy () {
    this.removeKeyEventListeners()
  }

  @Watch('editable', { immediate: true })
  onEditableChange () {
    if (this.editable) {
      this.addKeyEventListeners()
    } else {
      this.removeKeyEventListeners()
    }
  }

  addKeyEventListeners () {
    document.addEventListener('keydown', this.keyeventHandler)
  }

  removeKeyEventListeners () {
    document.removeEventListener('keydown', this.keyeventHandler)
  }

  keyeventHandler (event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === ']') {
      event.stopPropagation()
      this.$emit('move-bottom')
    } else if (event.ctrlKey && event.key === '[') {
      event.stopPropagation()
      this.$emit('move-top')
    } else if (event.shiftKey && event.code === 'BracketLeft') {
      event.stopPropagation()
      this.$emit('move-down')
    } else if (event.shiftKey && event.code === 'BracketRight') {
      event.stopPropagation()
      this.$emit('move-up')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.layerbar-container {
  @include col;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  position: relative;

  &::before {
    @include fullsize;
    content: '';
    position: absolute;
    box-shadow: $shadowS;
  }
}

.layerbar {
  position: relative;
  overflow: hidden;
  height: 100%;
  @include col;
  background-color: $colorSurfaceDefault;
}

.layerbar__header {
  @include row--distributed--center;
  border-bottom: 1px solid $colorBorderLight;
  padding: 5px 2px 5px 13px;
  position: relative;
  z-index: 1;
}

.layerbar__header__icon {
  width: 25px;
  margin-right: 12px;
}

.layerbar__header__text {
  @include fontRegularBody500;
  color: $colorContentDefault;
}

.layerbar__header__tools {
  flex: 1;
  @include row;
  align-items: center;
  justify-content: flex-end;
  height: 40px;
}

.layerbar__layers {
  flex: 1 1 auto;
  overflow: auto;
  border-left: 1px solid $colorBorderLight;
  padding: 8px;
}

.layerbar_empty {
  text-align: center;
  overflow: hidden;
}

.layerbar_empty_image {
  padding: 20px;
  width: 100%;
  max-height: calc(100% - 170px);
  object-fit: contain;
}

.layerbar_empty_header {
  display: block;
  padding: 0 20px 10px;
  @include typography(md-1, headlines, 600);
  color: $colorSecondaryLight;
}

.layerbar_empty_description {
  padding: 0 20px 30px;
  @include typography(md, default, 500);
  color: $colorGrayLite;
}

.layerbar_empty_spinner {
  margin: -100px;
}
</style>
