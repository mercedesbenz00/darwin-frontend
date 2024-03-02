<template>
  <PrimaryButton
    class="upload-progress"
    size="medium"
    @click="clearUploadIfFinished"
  >
    <div class="upload-progress-status">
      <span>{{ uploadProgress }}%</span> of Data uploaded
    </div>
    <div class="upload-progress-progress">
      <div
        class="upload-progress-progress__fill"
        :class="{
          'upload-progress-progress__fill--full': uploadProgress != null && uploadProgress >= 100
        }"
        :style="{width: `${uploadProgress}%`}"
      />
    </div>
  </PrimaryButton>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'

import PrimaryButton from '@/components/Common/Button/V1/PrimaryButton.vue'

import { useUploadProgress } from './useUploadProgress'

export default defineComponent({
  name: 'UploadProgressButton',
  components: { PrimaryButton },
  props: {
    dismissable: { type: Boolean, required: false, default: false }
  },
  setup (props) {
    const {
      clearUploadIfFinished,
      hovers,
      uploadProgress
    } = useUploadProgress(props)

    const uploadLabel = computed<string>(() => {
      if (!uploadProgress.value || uploadProgress.value === 100) {
        return 'Upload'
      }

      return props.dismissable && hovers.value ? 'Cancel' : 'Uploading'
    })

    return {
      clearUploadIfFinished,
      hovers,
      uploadLabel,
      uploadProgress
    }
  }
})
</script>

<style lang="scss" scoped>
.upload-progress {
  position: relative;
  @include row--center;
  width: 225px;
  height: 40px;
  border-radius: 6px;
  border: none;
  background: $colorFeatherFadeLight;

  &:hover, &:active {
    background: $colorFeatherFadeLight;
  }
}

.upload-progress-status {
  @include typography(md-1, headlines);
  text-align: center;
  letter-spacing: 0.5px;
  color: $colorSecondaryDark1;

  span {
    font-weight: bold;
  }
}

.upload-progress-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1px;
  height: 5px;
  background: $colorPrimaryLight2;
  border-radius: 0 0 6px 6px;
}

.upload-progress-progress__fill {
  height: 5px;
  background: $colorPrimaryDark;
  border-radius: 0px 0px 0px 6px;
}

.upload-progress-progress__fill--full {
  border-radius: 0 0 6px 6px;
}
</style>
