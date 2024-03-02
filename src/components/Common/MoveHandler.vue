<template>
  <div
    data-movable
    class="move-handler"
  >
    <move-handler-icon />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { MoveHandlerIcon } from '@/assets/icons/V1'

export default defineComponent({
  name: 'MoveHandler' ,
  components: { MoveHandlerIcon }
})
</script>
<style lang="scss" scoped>
.move-handler {
  width: 8px;
  height: 13px;
  @include row--center;
  cursor: pointer;
}
</style>
