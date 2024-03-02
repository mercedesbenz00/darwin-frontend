<template>
  <div class="tag-applier-header">
    <tag-icon class="tag-applier-header__icon" />
    <span class="tag-applier-header__text">TAGS</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { TagIcon } from '@/assets/icons/V1'

export default defineComponent({
  name: 'TagApplierHeader',
  components: { TagIcon }
})
</script>

<style lang="scss" scoped>
.tag-applier-header {
  @include row;
  align-items: center;
  width: 100%;
  height: 35px;
  padding: 10px 15px;
}

.tag-applier-header__icon {
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

.tag-applier-header__text {
  @include typography(md);
  color: $colorSecondaryLight;
}
</style>
