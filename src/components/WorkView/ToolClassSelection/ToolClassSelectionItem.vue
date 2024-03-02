<template>
  <li
    v-close-popover
    v-tooltip="hotkeyTooltip"
    class="tool-class-item"
    :class="{
      'tool-class-item--highlighted': highlighted,
      'tool-class-item--selected': selected
    }"
    @click="$emit('select', annotationClass)"
  >
    <div class="tool-class-item__image-container">
      <img
        v-if="imageURL"
        :key="imageURL"
        v-lazy="imageURL"
        class="tool-class-item__image"
      >
      <div
        v-if="!imageURL"
        class="tool-class-item__initials"
        :style="{ background: !imageURL ? color : 'inherit' }"
      >
        {{ initials }}
      </div>
    </div>

    <div class="tool-class-item__info">
      <div class="tool-class-item__info__label">
        <span
          class="tool-class-item__color-indicator"
          :style="{ backgroundColor: color }"
        />
        <span class="tool-class-item__label">{{ displayName }}</span>
        <hotkey-display :hotkey="hotkey" />
      </div>
      <div class="tool-class-item__description">
        {{ description }}
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import HotkeyDisplay from '@/components/Common/HotkeyDisplay.vue'
import { classDisplayName, classColorRGBAString } from '@/components/WorkView/utils'
import { AnnotationClassPayload } from '@/store/types'
import { getShortenedName } from '@/utils'

@Component({
  name: 'tool-class-selection-item',
  components: { HotkeyDisplay }
})
export default class ToolClassSelectionItem extends Vue {
  @Prop({ required: true, type: Object as () => AnnotationClassPayload })
  annotationClass!: AnnotationClassPayload

  @Prop({ type: Boolean, default: false })
  highlighted!: boolean

  /**
   * The hotkey used to select this class. It could be either the hotkey defined
   * on the class itself, or, if the class doesn't have a hotkey, a hotkey
   * automatically given by the workview. This is why it's a separate prop.
   */
  @Prop({ type: String, default: null })
  hotkey!: string | null

  @Prop({ type: Boolean, default: false })
  selected!: boolean

  get initials (): string {
    return getShortenedName(this.annotationClass.name)
  }

  get imageURL (): string | null {
    return this.annotationClass.images[0]?.crop_url || null
  }

  get color () {
    return classColorRGBAString(this.annotationClass)
  }

  get displayName () {
    return classDisplayName(this.annotationClass)
  }

  get description () {
    return this.annotationClass.description
  }

  /**
   * Definition for tooltip is hardcoded as raw HTML, as there is no reactivity and
   * styling is shared between this and `ToolClassSelectionItem.vue`, so it must be
   * global.
   *
   * Styling is defined in `tooltip.scss` as `tooltip--hotkey-in-text` variation.
   */
  get hotkeyTooltip () {
    return {
      content: `
        <span>
          <span class="tooltip__hotkey">↑</span>
           and <span class="tooltip__hotkey">↑</span> to navigate.
        </span><br>
        <span><span class="tooltip__hotkey">Enter</span> to select.</span>
      `,
      placement: 'right',
      classes: 'tooltip--hotkey-in-text'
    }
  }
}
</script>

<style lang="scss" scoped>
$image-size: 60px;

.tool-class-item {
  @include row;
  position: relative;
  border-radius: 5px;
  padding: 0;
  width: 100%;
  height: $image-size;
  min-height: $image-size;
  box-shadow: 0px 1px 2px rgba(20, 5, 60, 0.05);
  background: $colorAliceBlue;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background-color: $colorAliceShade;
  }
}

.tool-class-item--highlighted {
  background: $colorAliceShade;
}

.tool-class-item--selected {
  border: 1px solid $colorAliceNight;
  background: $colorAliceShadow;
}

.tool-class-item__image-container {
  @include square($image-size);
  @include row--center;
  min-width: $image-size;
  overflow: hidden;
  background-color: $colorSecondaryLight;
  border-radius: 5px 0 0 5px;
}

.tool-class-item__image {
  height: 100%;
}

.tool-class-item__initials {
  @include typography(xl, default, bold);
  @include row--center;
  width: 100%;
  height: 100%;
  color: $colorWhite;
  text-align: center;
}

.tool-class-item__info {
  flex: 1;
  @include col;
  padding: 8px 11px;
  overflow: hidden;
}

.tool-class-item__info__label {
  @include row;
  align-items: center;
  margin-bottom: 2px;
}

.tool-class-item__color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 5px;
}

.tool-class-item__label {
  flex: 1;
  @include ellipsis(1, md);
  @include typography(md);
  color: $color90Black;
}

.tool-class-item__description {
  flex: 1;
  @include typography(sm);
  @include ellipsis(2, sm);
  color: $colorAliceNight;
}
</style>
