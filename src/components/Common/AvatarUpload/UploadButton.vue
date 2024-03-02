<template>
  <div class="upload-button">
    <upload-icon class="upload-button__icon" />
    <label class="upload-button__label">Upload<br>Avatar</label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import UploadIcon from './assets/upload.svg?inline'

export default defineComponent({ name: 'UploadButton', components: { UploadIcon } })
</script>

<style lang="scss" scoped>
.upload-button {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  @include col--center;
  overflow: hidden;
  background: transparent;
}

.upload-button__icon {
  margin-bottom: 8px;
}

.upload-button__label {
  @include typography(md, mulish);
  text-align: center;
  color: $colorAliceNight;
}
</style>
