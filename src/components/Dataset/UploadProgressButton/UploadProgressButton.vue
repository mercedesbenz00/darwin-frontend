<template>
  <ToggleButton
    class="progress"
    kind="primary"
    size="sm"
    @click="clearUploadIfFinished"
    v-if="uploadProgressPercentage && uploadLabel"
    @mouseover="hovers = true"
    @mouseleave="hovers = false"
  >
    <div class="progress__label">
      {{ uploadLabel }}
    </div>
    <div class="progress__bar">
      <div class="progress__bar__indicator" />
    </div>
  </ToggleButton>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { useUploadProgress } from '@/components/Dataset/useUploadProgress'
import ToggleButton from '@/uiKit/Button/ToggleButton.vue'

export default defineComponent({
  name: 'DataPaneUploadProgressButton',
  components: { ToggleButton },
  props: {
    dismissable: { type: Boolean, required: false, default: false }
  },
  setup (props) {
    const {
      clearUploadIfFinished,
      hovers,
      uploadProgress
    } = useUploadProgress(props)

    const uploadProgressPercentage = computed<string | null>(() => {
      if (uploadProgress.value === null) { return null }
      return `${uploadProgress.value}%`
    })

    const uploadLabel = computed<string | null>(() => {
      if (uploadProgressPercentage.value === null) { return null }
      return `${uploadProgressPercentage.value} of Data uploaded`
    })

    return {
      clearUploadIfFinished,
      hovers,
      uploadLabel,
      uploadProgressPercentage
    }
  }
})
</script>
<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.progress {
  border-color: $colorInteractivePrimaryDefault;
  position: relative;
  background: transparentize($colorAnnotationsBlueSurface, 0.9);
  overflow: hidden;
  width: 170px;

  &__bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;

    &__indicator {
      height: 3px;
      width: v-bind(uploadProgressPercentage);

      transition: $transitionDefault;
      transition-property: width;

      background-color: $colorInteractivePrimaryDefault;
    }
  }
}
</style>
