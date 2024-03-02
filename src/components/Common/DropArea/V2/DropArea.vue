<template>
  <component
    :is="openFilePickerOnClick ? 'label' : 'div'"
    class="droparea"
    :class="{'droparea--dragging': dragging}"
  >
    <div class="droparea__content">
      <slot>
        <div class="droparea__upload">
          <icon-duotone-upload class="droparea__upload__icon" />
        </div>
        <div class="droparea__content__texts">
          <div class="droparea__content__title">
            <span class="title__highlight">Click to browse</span> or drag & drop
          </div>
          <div
            class="droparea__content__description"
          >
            Supported Filetypes: {{ acceptedFileExtensions.join(', ') }}
          </div>
        </div>
      </slot>
    </div>
    <!-- dragover needs to be "cancelled" for drop event to fire -->
    <div
      ref="droparea"
      class="droparea__hover"
    >
      <IconFilePlus />
      <div>Add files to dataset</div>
    </div>
    <input
      ref="input"
      class="droparea__input"
      type="file"
      :accept="acceptedFileExtensions.join(', ')"
      :multiple="multiple"
      @change="onPick"
    >
  </component>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import { IconDuotoneUpload } from '@/assets/icons/V2/Duotone'
import IconFilePlus from '@/assets/icons/V2/IconFilePlus.vue'
import { useDroparea } from '@/components/Common/DropArea/useDroparea'

export default defineComponent({
  components: { IconDuotoneUpload, IconFilePlus },
  props: {
    /**
     * Translates to the "accepts" property on the file input
     */
    acceptedFileTypes: { type: Array as () => string[], default: () => [] },
    /**
     * Defines whether the user is picking a single or multiple files.
     * In case of a "drop" or "paste" event in single file mode, the first of the
     * multiple files will be processed.
     */
    multiple: { type: Boolean, required: false, default: true },
    /**
     * Determines whether clicking the area of the component will open the file
     * picker dialog.
     */
    openFilePickerOnClick: { type: Boolean, required: false, default: true }
  },
  setup (props, { emit }) {
    const droparea = ref<HTMLDivElement | null>(null)
    const {
      acceptedFileExtensions,
      dragging,
      input,
      onDrop,
      onPick,
      setupGlobalDragActivation
    } = useDroparea(props, emit)

    setupGlobalDragActivation(droparea)

    return {
      acceptedFileExtensions,
      droparea,
      dragging,
      input,
      onDrop,
      onPick,
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

$uploadIconSize: 35px;

.droparea {
  position: relative;
  background: transparent;
  border-radius: 8px;
  width: 100%;
  @include col--center;

  transition: $transitionDefault;
  transition-property: padding;

  &__input {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 0px;
    width: 0px;
    z-index: -1;
    visibility: hidden;
  }

  &__content {
    @include col--center;
    width: 100%;
  }

  &__upload {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $uploadIconSize;
    height: $uploadIconSize;
    padding: 8px;
    border-radius: 10px;
    background-color: $colorSurfaceRaise;
    margin-bottom: 10px;
    transition: background .2s linear;
  }

  &__upload__icon {
    width: 15px;
    height: 12px;
    transition: stroke .3s linear;
  }

  &__content__texts {
    flex: 1;
    height: 100%;
    margin: 0 20px;
    @include col--center;
    justify-content: center;
    align-items: center;
  }

  &__content__title {
    @include typography(lg, inter);
    line-height: 21px;
    color: $colorSecondaryDark1;

    .title__highlight {
      color: $colorSemanticAction;
    }
  }

  &__content__description {
    @include typography(md, inter);
    line-height: 18px;
    text-align: center;
    color: $colorGrayLite;
  }

  &__hover {
    display: none; // flex on drag

    background: transparent;
    border: 1px dashed $colorStrokeBlue;
    border-radius: $borderRadius10;
    box-sizing: border-box;

    padding: $spacing-4;

    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-4;

    @include fontRegularBody200;

    position: absolute;
    top: $spacing-4;
    bottom: $spacing-4;
    left: $spacing-4;
    right: $spacing-4;
  }

  &--dragging {

    align-items: center;

    .droparea__upload {
      pointer-events: none;
      background: $colorInteractivePrimaryHover;
      animation: icon-to-center .4s ease forwards;
    }

    .droparea__upload__icon {
      path {
        stroke: $colorNeutralsLightWhite;
      }
    }

    .droparea__content__texts {
      pointer-events: none;
      animation: fade-out .4s linear forwards;
    }

    .droparea__hover {
      display: flex;
    }

    .droparea__content {
      opacity: 0;
      height: 100%;
      width: 100%;
    }
  }
}

label.droparea {
  cursor: pointer;
}
</style>
