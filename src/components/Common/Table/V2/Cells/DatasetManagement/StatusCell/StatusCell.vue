<template>
  <div class="status-cell__container">
    <status-button
      :type="status"
      variant="inverted"
    >
      <avatar
        v-if="(!!url && assigned) || assigned"
        :name="name"
        :size="20"
        :url="url"
      />
    </status-button>
    <p
      class="status-cell__label"
      :style="{'--themeColor': theme.highlightColor}"
    >
      <slot>Default Label</slot>
    </p>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import Avatar from '@/components/Common/Avatar/V2/Avatar.vue'
import {
  StatusCellProps
} from '@/components/Common/Table/V2/Cells/DatasetManagement/StatusCell/types'
import { StatusButton } from '@/components/WorkView/Common/StatusButton/V2'
import { ItemTheme, itemTheme } from '@/utils/datasetItemTheme'

export default defineComponent({
  name: 'StatusCell',
  components: {
    Avatar,
    StatusButton
  },
  props: {
    status: {
      required: true,
      type: String as PropType<StatusCellProps['status']>
    },
    name: {
      required: false,
      type: String as PropType<StatusCellProps['name']>,
      default: null
    },
    url: {
      required: false,
      type: String as PropType<StatusCellProps['url']>,
      default: null
    }
  },

  setup (props) {
    const assigned: Ref<boolean> = computed(() => {
      return !!props.name || !!props.url
    })

    const theme: Ref<ItemTheme> = computed(() => {
      return itemTheme[props.status]
    })

    return {
      assigned,
      theme
    }
  }
})
</script>

<style lang='scss' scoped>
.status-cell__container {
  display: grid;
  grid-template-columns: 20px min-content;
  grid-gap: 8px;
  align-items: center;
}

.status-cell__label {
  @include typography(md-1, inter, 500);
  color: var(--themeColor);
  white-space: nowrap;
}
</style>
