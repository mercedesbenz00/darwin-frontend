<template>
  <li
    class="annotation-class"
    :class="{ 'annotation-class--read-only': !isSelectable }"
  >
    <div class="annotation-class__container">
      <button
        v-if="thumbnail"
        v-lazy:background-image="thumbnail"
        class="annotation-class__button"
        :disabled="!isSelectable || annotationType === 'tag'"
        @click="selectClass"
      >
        <div
          class="annotation-class__highlight"
          :class="`annotation-class__highlight--${annotationType}`"
        />
      </button>
      <button
        v-else
        class="annotation-class__button annotation-class__button--initials"
        :style="{ background: colorRGBAstring }"
        :disabled="!isSelectable || annotationType === 'tag'"
        @click="selectClass"
      >
        {{ initials }}
      </button>
      <div class="annotation-class__info">
        <div class="annotation-class__label">
          <span
            class="annotation-class__color-indicator"
            :style="{ backgroundColor: colorRGBAstring }"
          />
          <span class="annotation-class__label__text">{{ displayName }}</span>
          <hotkey-display :hotkey="hotkey" />
        </div>

        <template v-if="isExpandable">
          <button
            v-if="isExpanded"
            class="annotation-class__toggle annotation-class__toggle--active"
            @click="$emit('toggle-expand')"
          >
            Read less
          </button>
          <button
            v-else
            class="annotation-class__toggle"
            @click="$emit('toggle-expand')"
          >
            Read more
          </button>
        </template>
        <div
          ref="description"
          class="annotation-class__description"
          :class="{'annotation-class__description--expanded': isExpanded}"
        >
          {{ annotationClass.description }}
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import HotkeyDisplay from '@/components/Common/HotkeyDisplay.vue'
import { classDisplayName, classColorRGBAString } from '@/components/WorkView/utils'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'
import { getShortenedName } from '@/utils'

@Component({
  name: 'instructions-list-item',
  components: { HotkeyDisplay }
})
export default class InstructionsListItem extends Vue {
  @Prop({ required: true, type: Object as () => AnnotationClassPayload })
  annotationClass!: AnnotationClassPayload

  /**
   * The hotkey used to select this class. It could be either the hotkey defined
   * on the class itself, or, if the class doesn't have a hotkey, a hotkey
   * automatically given by the workview. This is why it's a separate prop.
   */
  @Prop({ required: false, default: null })
  hotkey!: string | null

  @Prop({ required: false, default: false, type: Boolean })
  isExpanded!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  isSelectable!: boolean

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  get annotationType (): string | null {
    const { annotationClass } = this
    return this.getMainAnnotationType(annotationClass).name
  }

  get displayName () {
    return classDisplayName(this.annotationClass)
  }

  get initials () {
    return getShortenedName(this.displayName)
  }

  get thumbnail () {
    return this.annotationClass.images[0]?.crop_url
  }

  get colorRGBAstring () {
    return classColorRGBAString(this.annotationClass)
  }

  isExpandable: boolean = false

  mounted () {
    this.$nextTick(this.resolveExpansion)
  }

  resolveExpansion () {
    const description = this.$refs.description as HTMLElement

    this.isExpandable =
      description &&
      description.scrollHeight > description.getBoundingClientRect().height + 2
  }

  selectClass () {
    const { annotationClass, isSelectable } = this
    if (!isSelectable) { return }

    this.$store.commit(
      'workview/PRESELECT_CLASS_ID',
      annotationClass.id
    )
  }
}
</script>

<style lang="scss" scoped>
.annotation-class {
  position: relative;
  overflow: hidden;
  background-color: $colorWhite;
  border-radius: 5px;
  padding: 0;
  box-shadow: $shadowXS;
}

.annotation-class:hover:not(.annotation-class--read-only) {
  .annotation-class__highlight {
    background-color: rgba($colorSecondaryDark1, 0.8);
    background-repeat: no-repeat;
  }

  .annotation-class__highlight--bounding_box {
    background-image: url('./assets/bbox.svg');
  }

  .annotation-class__highlight--polygon {
    background-image: url('./assets/draw.svg');
  }

  .annotation-class__highlight--text-ocr {
    background-image: url('./assets/text.svg');
  }

  .annotation-class__highlight--magic {
    background-image: url('./assets/magic.svg');
  }

  //.annotation-class__highlight--cuboid {
  //  background-image: url('./assets/bbox.svg');
  //}

  //.annotation-class__highlight--direction {
  //  background-image: url('./assets/draw.svg');
  //}
}

.annotation-class--read-only .annotation-class__button {
  pointer-events: none;
}

.annotation-class__container {
  padding: 0;
  display: flex;
  align-items: stretch;
}

.annotation-class__button {
  overflow: hidden;
  width: 60px;
  height: 60px;
  background-color: $colorSecondaryLight;
  background-size: cover;
  background-position: center;
  position: relative;
}

.annotation-class__button--initials {
  @include typography(xl, default, bold);
  color: $colorWhite;
}

.annotation-class__highlight {
  @include fullsize();
  position: absolute;
  width: 100%;
  background-color: rgba($colorSecondaryDark1, 0);
  background-position: center;
}

.annotation-class__info {
  @include col;
  @include typography(md);
  flex: 1;
  overflow: hidden;
  width: calc(100% - 80px);
  padding: 6px 10px;
  text-align: left;
}

.annotation-class__label {
  @include row;
  align-items: center;
  max-width: 100%;
  float: left;
  position: relative;
}

.annotation-class__label__text {
  flex: 1;
  @include ellipsis(1);
  font-family: $fontFamilyHeadlines;
  font-weight: 500;
  line-height: 18px;
}

.annotation-class__description {
  flex: 1;
  @include noSelect;
  @include typography(md);
  color: $colorSecondaryLight;
  padding-top: 2px;
  overflow: hidden;
  clear: both;

  &:not(.annotation-class__description--expanded) {
    @include ellipsis(2, md);
  }
}

.annotation-class__color-indicator {
  @include circle(8px);
  display: inline-block;
  font-size: 0;
  margin-right: 3px;
}

.annotation-class__toggle {
  position: relative;
  padding-right: 20px;
  float: right;
  color: $colorPrimaryDark;
  background-color: transparent;
  font-weight: bold;
  padding-top: 2px;

  &:hover {
    text-decoration: underline;
  }

  &::after {
    transition: transform .2s ease;
    transform-origin: center 3px;
    position: absolute;
    content: '';
    background-image: url(./assets/expand.svg);
    background-repeat: no-repeat;
    background-size: contain;
    height: 14px;
    width: 14px;
    right: 0;
    top: 6px;
    display: inline-block;
  }

  &--active {
    &::after {
      transform: rotate(180deg);
    }
  }
}

</style>
