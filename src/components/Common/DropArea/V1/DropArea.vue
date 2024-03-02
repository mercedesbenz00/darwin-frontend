<script lang="ts">
import { defineComponent } from 'vue'

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
    const {
      acceptedFileExtensions,
      dragging,
      input,
      onDrop,
      onPick
    } = useDroparea(props, emit)

    return {
      acceptedFileExtensions,
      dragging,
      input,
      onDrop,
      onPick
    }
  }
})
</script>

<template>
  <component
    :is="openFilePickerOnClick ? 'label' : 'div'"
    class="droparea"
    :class="{'droparea--dragging': dragging}"
    @drop.stop.prevent="onDrop"
    @dragover.stop.prevent="dragging = true"
    @dragleave.stop.prevent="dragging = false"
  >
    <div class="droparea__content">
      <slot v-if="$slots.default" />
      <template v-else>
        <img
          class="droparea__content__image"
          src="/static/imgs/upload-icon.svg"
        >
        <div class="droparea__content__texts">
          <div class="droparea__content__title">
            Drag & drop or click to browse
          </div>
          <div
            class="droparea__content__description"
          >
            Supported Filetypes: {{ acceptedFileExtensions.join(', ') }}
          </div>
        </div>
      </template>
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

<style lang="scss" scoped>
.droparea {
  border: 2px dashed $colorPrimaryLight;
  border-radius: 10px;
  height: 100%;
  width: 100%;
  @include col--center;
  padding: 10px;

  &--dragging {
    border: 2px dashed $colorPrimaryDark;
  }
}

label.droparea {
  cursor: pointer;
}

.droparea__input {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 0px;
  width: 0px;
  z-index: -1;
}

.droparea__content {
  @include col--center;
  width: 100%;
}

.droparea__content__image {
  width: 70px;
  height: 62px;
  margin: 0;
  margin-left: 20px;
}

.droparea__content__texts {
  flex: 1;
  height: 100%;
  margin: 0 20px;
  @include col--center;
  justify-content: center;
  align-items: center;

}

.droparea__content__title {
  @include typography(lg, default, bold);
  line-height: 21px;
  color: $colorSecondaryDark1;
}

.droparea__content__description {
  @include typography(md, default);
  line-height: 18px;
  color: $colorGrayLite;
}
</style>
