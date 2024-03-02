<template>
  <div>
    <v-popover
      placement="bottom"
      trigger="click"
      popover-class="table-item-popover"
    >
      <slot name="trigger" />
      <template #popover>
        <list-element-v2
          v-for="(item) in basicItems"
          :key="item.id"
          :text="item.text"
          @click="onMenuItemSelect(item.id)"
        />
        <div class="list--seperator" />
        <list-element-v2
          v-for="(item, index) in items"
          :key="item.id"
          :text="item.text"
          :selected="item.selected"
          :disabled="item.disabled"
          @click="onMenuItemSelect(item.id)"
        >
          <template #prefix>
            <component :is="icon(index)" />
          </template>
        </list-element-v2>
      </template>
      <slot name="other" />
    </v-popover>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import {
  IconDuotonePerson,
  IconDuotoneTrash,
  IconDuotoneViewFolder
} from '@/assets/icons/V2/Duotone'
import { IconMonoPriority } from '@/assets/icons/V2/Mono'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'
import { V2DatasetItemPayload } from '@/store/types'

/**
 * @Component TableItemMenu
 * ~ Menu which opens when user wants to configure Dataset Item aka. TableItem
 * */

const menuBasicItems: ListElementV2Props[] = [
  {
    id: 'open-item',
    text: 'Open',
    selected: false,
    disabled: false,
    event: 'open-item'
  },
  {
    id: 'select-item',
    text: 'Select',
    selected: false,
    disabled: false,
    event: 'select-item'
  }
]

const menuItems: ListElementV2Props[] = [
  {
    id: 'folder',
    text: 'Move',
    selected: false,
    disabled: false,
    event: 'folder'
  },
  {
    id: 'assign',
    text: 'Assign',
    selected: false,
    disabled: false,
    event: 'assign'
  },
  {
    id: 'priority',
    text: 'Set priority',
    selected: false,
    disabled: false,
    event: 'priority'
  },
  {
    id: 'archive',
    text: 'Archive',
    selected: false,
    disabled: false,
    event: 'archive'
  }
]

export default defineComponent({
  name: 'TableItemMenu',
  components: {
    ListElementV2,
    IconDuotoneViewFolder,
    IconDuotonePerson,
    IconMonoPriority,
    IconDuotoneTrash
  },
  props: {
    data: {
      required: true,
      type: Object as PropType<V2DatasetItemPayload>
    }
  },
  setup (props, { emit }) {
    const items: Ref<ListElementV2Props[]> = computed(() => {
      return menuItems
    })
    const basicItems: Ref<ListElementV2Props[]> = computed(() => {
      return menuBasicItems
    })

    const onMenuItemSelect = (itemId: string): void => {
      emit('click-item', itemId)
    }

    const icon = (i: number): string | null => {
      switch (i) {
      case 0:
        return 'icon-duotone-view-folder'
      case 1:
        return 'icon-duotone-person'
      case 2:
        return 'icon-mono-priority'
      case 3:
        return 'icon-duotone-trash'
      default:
        return null
      }
    }

    return {
      basicItems,
      items,
      icon,
      onMenuItemSelect
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang='scss'>
.table-item-popover {
  display: block;
  border-radius: 10px;
  border: 1px solid $colorNeutralsLight300;
  box-shadow: $shadowLightXS;
  width: 184px;
  height: auto;
  cursor: pointer;
  background: $colorNeutralsLightWhite;
  .tooltip-inner {
    background: transparent;
    padding: 4px;
  }
}
</style>
