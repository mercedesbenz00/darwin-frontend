<template>
  <div class="tab-stack">
    <TabItem
      v-for="(tab, index) in tabs"
      :key="index"
      :label="tab.label"
      :size="size"
      :active="index === activeTab"
      @click.native="$emit('on-tab-click', index)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TabItem from './TabItem/TabItem.vue'
import { TabSize } from './TabItem/types'
import { TabStackProps} from './types'

/**
 * @Component TabStack
 * ~ Displays multiple tabs in a row where a user can navigate between different
 * pages w/o layout change.
 * ~ Can be used for DatasetManagement for example
 * @param {string} prop
 * */
export default defineComponent({
  components: { TabItem },
  name: 'TabStack',
  props: {
    tabs: { required: true, type: Array as () => TabStackProps['tabs'] },
    size: { required: true, default: TabSize.SMALL, type: String as () => TabStackProps['size'] },
    activeTab: { required: true, type: Number as () => TabStackProps['activeTab'], default: 0 },
  }
})
</script>

<style lang="scss" scoped>
.tab-stack {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  width: fit-content;
  height: auto;
}
</style>
