<template>
  <div
    class="list-item-header-item"
    :class="{ 'list-item-header-item__sortable': sortable }"
    @click="onClick"
  >
    <sort-arrow-icon
      v-if="sortable"
      class="list-item-header-item__icon"
      :class="{
        'list-item-header-item__icon--inactive': !active,
        'list-item-header-item__icon--reverse': sortDirection === 'asc'
      }"
    />
    <span class="list-item-header-item__title">{{ title }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { SortArrowIcon } from '@/assets/icons/V1'

const sortDirectionValidator = (val: string) => ['asc', 'desc'].indexOf(val) !== -1

@Component({
  name: 'list-item-header-item',
  components: { SortArrowIcon }
})
export default class ListItemHeader extends Vue {
  @Prop({ required: true })
  id!: string

  @Prop({ default: '' })
  title!: string

  @Prop({ default: 'asc', validator: sortDirectionValidator })
  sortDirection!: 'asc' | 'desc'

  @Prop({ type: Boolean, default: false })
  active!: boolean

  @Prop({ type: Boolean, default: false })
  sortable!: boolean

  onClick () {
    if (!this.sortable) { return }
    const payload = {
      id: this.id,
      sortDirection: this.sortDirection === 'asc' ? 'desc' : 'asc'
    }
    this.$emit('click', payload)
  }
}
</script>

<style lang="scss" scoped>
.list-item-header-item {
  @include row;
  align-items: center;
  user-select: none;
}

.list-item-header-item__sortable {
  cursor: pointer;
}

.list-item-header-item__icon {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}

.list-item-header-item__icon--inactive {
  opacity: .3;
}

.list-item-header-item__icon--reverse {
  transform: rotateZ(180deg);
}

.list-item-header-item__title {
  @include typography(md, default, bold);
  color: $color90Black;
}
</style>
