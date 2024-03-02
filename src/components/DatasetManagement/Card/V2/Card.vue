<template>
  <div
    class="card"
    :class="{
      'card--selected': isSelected,
      'card--folder': isFolder,
      'card--disabled': disableHover
    }"
    @click.stop.prevent="toggleSelect"
  >
    <div class="card__thumbnail">
      <template v-if="$slots['card-thumbnail']">
        <slot name="card-thumbnail" />
      </template>
      <card-thumbnail
        v-else
        :is-dicom="fileTypeExt === 'DICOM'"
        :is-pdf="fileTypeExt === 'PDF'"
        :type="type"
        :url="thumbnail"
      />
      <!-- an svg which masks the thumbnail to give it the appearance of a folder-->
      <FolderClip
        v-if="isFolder"
        class="card__thumbnail__folder-mask"
      />
      <div
        v-if="!disableHover"
        class="card__overlay"
      >
        <div
          v-if="$slots['overlay-top-left']"
          class="card__overlay__top-left"
        >
          <slot name="overlay-top-left" />
        </div>
        <div
          v-if="$slots['overlay-top-right']"
          class="card__overlay__top-right"
        >
          <slot name="overlay-top-right" />
        </div>
        <div
          v-if="$slots['overlay-center']"
          class="card__overlay__center"
        >
          <slot name="overlay-center" />
        </div>

        <div
          class="card__overlay__tags"
          v-if="!isFolder"
        >
          <span
            v-if="fileTypeExt"
            class="card__overlay__tag--label"
          >{{ fileTypeExt }}</span>
          <span
            v-if="isExternal"
            class="card__external"
          >{{ fileTypeExt }}</span>
          <span
            v-if="priority"
            :class="priorityClassName"
          >{{ priority }}</span>
        </div>
      </div>
    </div>
    <div class="card__status">
      <slot name="status" />
    </div>
    <div class="card__details">
      <slot name="details" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import CardThumbnail from './CardThumbnail.vue'
import FolderClip from './FolderClip.vue'
/**
 * Base layout and styles for card v2 components in gallery
 *
 * Renders thumbnail(video indicator) and overlay.
 * Provides slots for action button, status and details area on the bottom.
 * Emits 'select' event.
 * */
export default defineComponent({
  name: 'Card',
  components: { CardThumbnail, FolderClip },
  props: {
    thumbnail: { type: String, default: null },
    fileType: { type: String, default: null },
    isImage: { type: Boolean, default: false },
    isExternal: { type: Boolean, default: false },
    isSelected: { type: Boolean, default: false },
    disableHover: { type: Boolean, default: false },
    priority: { type: Number, default: null },
    type: { type: String as () => 'folder' | 'image' | 'video' | 'video-frames', default: 'image' }
  },
  emits: ['select'],
  setup (props, { emit }) {
    const isFolder = computed<boolean>(() => props.type === 'folder')

    const fileTypeExt = computed(() => {
      if (props.isExternal) { return 'EXTERNAL' }
      return props.fileType ? props.fileType.replace('.', '').toLocaleUpperCase() : null
    })

    const priorityClassName = computed(() => {
      if (!props.priority) { return '' }
      const variant = props.priority <= 5 ? props.priority : 'over'
      return `card__overlay__priority card__overlay__priority-${variant}`
    })

    const toggleSelect = (event: MouseEvent): void => {
      emit('select', event, !props.isSelected)
    }

    return { isFolder, fileTypeExt, priorityClassName, toggleSelect }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

$details_min_height: 60px;

.card {
  border-radius: 8px;
  border: 4px solid transparent;
  transition: $transitionDefault;
  transition-property: background, border-color;

  padding-bottom: 4px;

  cursor: pointer;

  height: 100%;
  width: 100%;
  min-width: 100px;
  min-height: 100px;
  background: transparent;

  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
  position: relative;

  &:hover {
    background: $colorOverlayHover;

    .card__overlay__center {
      opacity: 1;
    }

    .card__overlay {
      opacity: 1;
    }
  }
}

.card.card--folder {
  // the svg mask we use makes it appear as if there's
  // about 6px of padding in total rather than about 4 on regular card
  // we reduce border width from 4 to 2 to offset
  border-width: 2px;

  .card__thumbnail__folder-mask {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;

    // the svg uses currentColor for path fill,
    // so this is how we do hover effect on it
    // this color needs to be the background color of the gallery
    color: $colorSurfaceDefault;

    transition: $transitionDefault;
    transition-property: color;
  }

  &:hover .card__thumbnail__folder-mask {
    color: $colorOverlayHover;
  }

  .card__details {
    // due to mask adding about 2px of padding to the shape, the
    // details section text appears out of alignment.
    // this alligns it
    padding-left: 2px;
  }
}

.card--selected {
  background: $colorOverlayInteractive;

  .card__overlay {
    opacity: 1;
  }

  &:hover {
    background: $colorOverlayInteractive;
  }

  .card__details {
    :deep(p) {
      color: $colorContentEmphasis;
    }
  }
}

.card--disabled {
  cursor: default;
  &:hover {
    background: unset;

    .card__overlay__center {
      opacity: 0;
    }

    .card__overlay {
      opacity: 0;
    }
  }
}

.card--selected .card__overlay {
  @include row--center;
  border-color: $colorFeatherLight;
}

.card__thumbnail {
  @include noSelect;
  flex: 1;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
}

.card__thumbnail,
.card__overlay {
  overflow: hidden;
  border-radius: $borderRadius3;
}

.card__overlay {
  transition: $transitionDefault;
  transition-property: opacity, border-color;

  @include row--center;
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  @include fullsize;
}

.card__overlay__top-left {
  position: absolute;
  top: 5px;
  left: 5px;
}

.card__overlay__center {
  transition: $transitionDefault;
  transition-property: opacity;

  opacity: 0;
}

.card__overlay__tags {
  background: $colorOverlayHover;

  position: absolute;
  bottom: 0px;
  width: 100%;
  height: 24px;
  padding: 3px;
  background: hsla(204, 3%, 34%, 0.6); // no color name yet in design
  @include row;
  align-items: center;
  justify-content: flex-start;

  & > * {
    &:not(:last-child) {
      margin-right: 3px;
    }
  }
}

.card__overlay__priority {
  width: fit-content;
  @include workflow-item-priority-value;
  @include typography(sm, inter, bold);
  color: $colorWhite;
  padding: 1px 6px;
  border-radius: 5px;
}

.card__overlay__tag--label {
  @include typography(sm, inter, 500);
  text-align: center;
  color: $colorContentInverted;
  background-color: $colorSurfaceScrim;
  padding: 2px 4px;
  border-radius: 4px;
}

.card__image {
  text-transform: uppercase;
}

.card__external {
  @include typography(sm, inter, bold);
  text-align: center;
  color: $colorDarkYellow;
  background-color: $colorSurfaceScrim;
  padding: 2px 4px;
  border-radius: 4px;
}

.card__overlay__top-right {
  position: absolute;
  top: 10px;
  right: 9px;
  @include col;
  align-items: flex-end;

  :deep(span) {
    font-size: 6px;
    line-height: 10px;
    color: $colorWhite;
    margin-bottom: 2px;
  }
}

.card__status {
  @include noSelect;
  position: absolute;
  right: 8px;
  top: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
}
</style>
