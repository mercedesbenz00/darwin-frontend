<template>
  <div class="status-filter">
    <status-filter-item
      key="all"
      :data="allItem"
      :status="allStatus"
      @click="onAllClick"
    />
    <status-filter-item
      v-for="item of visibleOptions"
      :key="`filter-item-${item.id}`"
      :data="item"
      :status="optionMap[item.id]"
      @shift-click="onItemShiftClick"
      @click="onItemClick"
    />
    <template v-if="hasOptionsToHide">
      <div
        v-if="revealHiddenOptions"
        class="status-filter-hide-button"
        @click="toggleRevealHidden"
      >
        Hide Filters
      </div>
      <div
        v-else
        class="status-filter-hide-button"
        @click="toggleRevealHidden"
      >
        <img src="../../assets/more.svg">
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { StatusFilterItemType } from '@/components/DatasetFiltering/types'
import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'

import StatusFilterItem from './StatusFilterItem.vue'

@Component({
  name: 'status-filter',
  components: { StatusFilterItem }
})
export default class StatusFilter extends Vue {
  @Prop({ required: true })
  options!: StatusFilterItemType[]

  @Prop({ required: true })
  positiveOptions!: string[]

  @Prop({ required: true })
  negativeOptions!: string[]

  @Prop({ required: false, type: Boolean, default: false })
  commented!: boolean

  @Prop({ required: false, type: Array, default: () => [] })
  optionsToHide!: string[]

  @Prop({ required: false, type: Boolean, default: false })
  showAll!: boolean

  @Prop({ required: false, default: 0 })
  allCount!: number

  optionMap: { [id: string]: TriToggleStatus } = {};
  revealHiddenOptions: boolean = false;

  get allItem () {
    return {
      id: 'All',
      label: 'All',
      icon: '/static/imgs/image-status-v2/all.svg',
      count: this.allCount
    }
  }

  get visibleOptions () {
    if (this.revealHiddenOptions) {
      return this.options
    } else {
      return this.options.filter(option => !this.optionsToHide.includes(option.id))
    }
  }

  get hasOptionsToHide () {
    return this.optionsToHide.length > 0
  }

  get visiblePositiveOptions () {
    return Object.keys(this.optionMap).filter(key =>
      this.optionMap[key] === 'positive' &&
      (this.revealHiddenOptions || !this.optionsToHide.includes(key))
    )
  }

  get visibleNegativeOptions () {
    return Object.keys(this.optionMap).filter(key =>
      this.optionMap[key] === 'negative' &&
      (this.revealHiddenOptions || !this.optionsToHide.includes(key))
    )
  }

  get allStatus (): TriToggleStatus {
    const isAllPositive = this.visibleOptions
      .filter(option => !option.omitFromAllSelected)
      .every(({ id }) => this.optionMap[id] === 'positive')
    if (isAllPositive) { return 'positive' }

    const isAllNegative = this.visibleOptions
      .filter(option => !option.omitFromAllSelected)
      .every(({ id }) => this.optionMap[id] === 'negative')
    if (isAllNegative) { return 'negative' }

    return 'none'
  }

  @Watch('positiveOptions', { immediate: true })
  onPositiveOptionsChange (): void { this.onOptionSelectionChange() }

  @Watch('negativeOptions', { immediate: true })
  onNegativeOptionsChange (): void { this.onOptionSelectionChange() }

  onOptionSelectionChange (): void {
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.positiveOptions.forEach(id => { optionMap[id] = 'positive' })
    this.negativeOptions.forEach(id => { optionMap[id] = 'negative' })
    this.options.forEach(({ id }) => {
      if (id === 'commented') {
        optionMap[id] = this.commented ? 'positive' : 'none'
      } else {
        optionMap[id] = optionMap[id] || 'none'
      }
    })
    this.optionMap = optionMap
  }

  emitCurrent (): void {
    this.$emit('update:positive-options', this.visiblePositiveOptions)
    this.$emit('update:negative-options', this.visibleNegativeOptions)
    this.$emit('change', {
      positiveOptions: this.visiblePositiveOptions,
      negativeOptions: this.visibleNegativeOptions
    })
  }

  onAllClick (): void {
    const nextStatus = resolveNextTriToggleStatus(this.allStatus)
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.options.forEach(item => {
      if (item.omitFromAllSelected) {
        // reserve non-all related option status
        optionMap[item.id] = this.optionMap[item.id]
      } else {
        optionMap[item.id] = nextStatus
      }
    })
    this.optionMap = optionMap

    this.emitCurrent()
  }

  onItemShiftClick (item: StatusFilterItemType): void {
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.options.forEach(option => {
      if (option.id === item.id) {
        const nextStatus = resolveNextTriToggleStatus(this.optionMap[item.id])
        optionMap[option.id] = nextStatus
      } else if (item.id === 'commented') {
        optionMap[option.id] = this.commented ? 'none' : 'positive'
      } else {
        optionMap[option.id] = 'none'
      }
    })
    this.optionMap = optionMap

    this.emitCurrent()
  }

  onItemClick (item: StatusFilterItemType): void {
    // commented should be bi-toggle instead of tri-toggle
    if (item.id === 'commented') {
      this.optionMap[item.id] = this.commented ? 'none' : 'positive'
    } else {
      this.optionMap[item.id] = resolveNextTriToggleStatus(this.optionMap[item.id])
    }

    this.emitCurrent()
  }

  toggleRevealHidden (): void {
    this.revealHiddenOptions = !this.revealHiddenOptions

    this.emitCurrent()
  }
}
</script>

<style lang="scss" scoped>
.status-filter {
  width: 100%;
  @include col--center;

  & > div {
    margin: 1px 0;
  }
}

.status-filter-hide-button {
  @include row--center;
  @include noSelect;
  width: 100%;
  height: 26px;
  min-height: 26px;
  cursor: pointer;
  border-radius: 13px;
  background-color: $colorSecondaryLight2;
  color: $colorSecondaryLight;
  @include typography(md);
  transition: background-color .2s;

  img {
    width: 21px;
    height: 5px;
  }

  &:hover, &:active {
    background-color: $colorSecondaryLight1;
    transition: none;
  }
}
</style>
