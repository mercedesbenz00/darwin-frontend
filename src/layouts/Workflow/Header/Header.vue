<template>
  <div class="workflow-header__container">
    <bread-crumbs />
    <custom-button
      flair="rounded"
      size="small"
      color="primary"
      @click.native="$emit('on-save')"
    >
      Save and Apply
    </custom-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V2/BreadCrumbs.vue'
import { CustomButton } from '@/components/Common/Button/V2'

export default defineComponent({
  name: 'WorkflowHeader',
  components: { CustomButton, BreadCrumbs }
})
</script>

<style lang="scss" scoped>
.workflow-header__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  background: $colorNeutral;
}
</style>
