<template>
  <v-popover
    placement="top-start"
    popover-class="priority_popover"
    trigger="manual"
    :offset="1"
    :open.sync="open"
  >
    <gallery-context-menu-item
      class="priority-context-menu-item"
      label="PRIORITY"
      @click="open = true"
    >
      <priority-icon class="priority_icon" />
    </gallery-context-menu-item>
    <template #popover>
      <div class="priority_popover_content">
        <priority-form
          :priority.sync="priority"
          @submit="onPriorityDetermined"
        />
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { PriorityIcon } from '@/assets/icons/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import PriorityForm from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/PriorityForm/PriorityForm.vue'
import { addPriorityToItems } from '@/store/modules/dataset/actions/addPriorityToItems'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'

@Component({
  name: 'priority-context-menu-item',
  components: { GalleryContextMenuItem, PriorityForm, PriorityIcon }
})
export default class PriorityContextMenuItem extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => DatasetItemFilter })
  filter!: DatasetItemFilter

  open: boolean = false
  priority: number = 0

  onPriorityDetermined (): void {
    this.open = false
    this.addPriorityToItems(this.priority)
  }

  async addPriorityToItems (priority: number): Promise<void> {
    const { dataset, filter } = this

    const params: StoreActionPayload<typeof addPriorityToItems> = {
      dataset,
      filter,
      priority
    }

    const { error } = await this.$store.dispatch('dataset/addPriorityToItems', params)
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }

    this.$store.dispatch('toast/notify', {
      content: 'Priority has been successfully added to items'
    })

    this.deselectAll()
  }

  deselectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  }
}
</script>

<style lang="scss" scoped>
$popover-width: 250px;

.priority-context-menu-item {
  height: 100%;
}

.priority_icon {
  color: $color90Black;
}

.priority_popover_content {
  @include col;
  justify-content: center;
  width: $popover-width;
  overflow: hidden;
  padding: 0;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$popover-width: 250px;

.priority_popover {
  width: $popover-width;
  border-radius: 3px 3px 0 0;
  background: $colorWhite;
  top: 5px !important;
  box-shadow: 0px -15px 30px rgba(145, 169, 192, 0.3);

  .popover-inner {
    background: white;
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
