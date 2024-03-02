<template>
  <AssignableListItem :selected="selected">
    <template #icon>
      <anyone-icon />
    </template>
    <template #label>
      Anyone
    </template>
  </AssignableListItem>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

import AssignableListItem from '@/components/Stages/StageChilds/AssignableListItem.vue'
import AnyoneIcon from '@/components/Stages/StageChilds/anyone.svg?inline'

export default defineComponent({
  name: 'AnyoneListElement',
  components: {
    AnyoneIcon,
    AssignableListItem
  },
  props: { 
    selected: { type: Boolean, default: false, required: false } 
  }
})
</script>
