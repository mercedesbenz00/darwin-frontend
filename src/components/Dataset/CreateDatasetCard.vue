<template>
  <div class="create__dataset">
    <div class="create__dataset__back">
      <img
        class="create__dataset__back__image"
        src="/static/imgs/create-dataset.png"
      >
    </div>
    <div class="create__dataset__action">
      <primary-button
        tag="router-link"
        to="/datasets/create"
      >
        NEW DATASET
      </primary-button>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'CreateDatasetCard' })
</script>

<style lang="scss" scoped>
.create__dataset {
  height: 270px;
  border-radius: 5px;
  position: relative;
  display: inline-block;
  @include noSelect;
}

.create__dataset__back {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  background: $colorSecondaryLight2;
  @include row--center;
  padding-bottom: 30px;
}

.create__dataset__back__image {
  width: 150px;
  object-fit: contain;
}

.create__dataset__action {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  @include row--center;
}
</style>
