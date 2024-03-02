<template>
  <div class="class-filter">
    <input-field
      v-model="tagKeyword"
      class="class-filter__input"
      placeholder="Type to filter by class"
    />
    <div class="class-filter__header">
      <div class="class-filter__header__class-name">
        <button
          v-tooltip="{
            content: 'Clear Filters',
            position: 'top'
          }"
          class="class-filter__clear"
          @click="clearFilter"
        >
          &#10005;
        </button>
        <sort-button
          id="label"
          :direction="sortBy !== 'label' ? 0 : sortOrder"
          @change="onSortChange"
        />
      </div>
      <sort-button
        id="count"
        :direction="sortBy !== 'count' ? 0 : sortOrder"
        @change="onSortChange"
      />
    </div>
    <div
      v-if="sortedOptions && sortedOptions.length > 0"
      class="class-filter__list"
    >
      <class-filter-item
        v-for="(item, index) of sortedOptions"
        :key="`filter-item-${index}`"
        :action-disabled="!imagesSelecting"
        :action-hide="listOnly"
        :data="item"
        :status="optionMap[item.id]"
        @click="onItemClick"
        @shift-click="onItemShiftClick"
        @tag="onTag"
        @untag="onUntag"
      />
    </div>
    <div
      v-if="!listOnly"
      class="class-filter__create-tag"
      :class="{
        'class-filter__create-tag--disabled': !tagKeyword
      }"
      @click="onCreateTag"
    >
      Create
      <span class="class-filter__tag">{{ tagKeyword || 'Tag' }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import SortButton from '@/components/Common/SortButton/V1/SortButton.vue'
import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'

import ClassFilterItem from './ClassFilterItem.vue'
import { ClassFilterItemType } from './types'

@Component({
  name: 'class-filter',
  components: { InputField, ClassFilterItem, SortButton }
})
export default class ClassFilter extends Vue {
  @Prop({ required: true })
  options!: ClassFilterItemType[]

  @Prop({ required: true })
  positiveOptions!: string[]

  @Prop({ required: true })
  negativeOptions!: string[]

  @Prop({ type: Boolean, default: false })
  imagesSelecting!: boolean

  @Prop({ type: Boolean, default: false })
  listOnly!: boolean

  sortBy: string = 'label'
  sortOrder: number = 0
  tagKeyword: string = ''
  optionMap: { [id: string]: TriToggleStatus } = {};

  get sortedOptions () {
    const options = [
      ...this.options.filter(
        i => i.label.toLowerCase().includes(this.tagKeyword.toLowerCase())
      )
    ]
    options.sort((a: ClassFilterItemType, b: ClassFilterItemType) => {
      if (this.sortOrder === 0) { return 0 }
      if (a[this.sortBy] === b[this.sortBy]) { return 0 }
      if (a[this.sortBy] > b[this.sortBy]) {
        return this.sortOrder === 1 ? 1 : -1
      }
      if (a[this.sortBy] < b[this.sortBy]) {
        return this.sortOrder === 1 ? -1 : 1
      }
      return 0
    })
    return options
  }

  get visiblePositiveOptions () {
    return Object.keys(this.optionMap).filter(key => this.optionMap[key] === 'positive')
  }

  get visibleNegativeOptions () {
    return Object.keys(this.optionMap).filter(key => this.optionMap[key] === 'negative')
  }

  clearFilter () {
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.options.forEach(({ id }) => { optionMap[id] = optionMap[id] || 'none' })
    this.optionMap = optionMap

    this.$emit('change', {
      positiveOptions: [],
      negativeOptions: []
    })
  }

  onSortChange (params: { id: string, direction: number }) {
    const { id, direction } = params
    this.sortBy = id
    this.sortOrder = this.sortBy === id ? direction : 1
  }

  @Watch('positiveOptions', { immediate: true })
  onPositiveOptionsChange () { this.onOptionSelectionChange() }

  @Watch('negativeOptions', { immediate: true })
  onNegativeOptionsChange () { this.onOptionSelectionChange() }

  onOptionSelectionChange () {
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.positiveOptions.forEach(id => { optionMap[id] = 'positive' })
    this.negativeOptions.forEach(id => { optionMap[id] = 'negative' })
    this.options.forEach(({ id }) => { optionMap[id] = optionMap[id] || 'none' })
    this.optionMap = optionMap
  }

  emitCurrent () {
    this.$emit('update:positive-options', this.visiblePositiveOptions)
    this.$emit('update:negative-options', this.visibleNegativeOptions)
    this.$emit('change', {
      positiveOptions: this.visiblePositiveOptions,
      negativeOptions: this.visibleNegativeOptions
    })
  }

  onCreateTag () {
    this.$emit('create-tag', this.tagKeyword)
  }

  resetTagInput () {
    this.tagKeyword = ''
  }

  onItemClick (item: ClassFilterItemType) {
    this.optionMap[item.id] = resolveNextTriToggleStatus(this.optionMap[item.id])

    this.emitCurrent()
  }

  onItemShiftClick (item: ClassFilterItemType) {
    const optionMap: { [id: string]: TriToggleStatus } = {}
    this.options.forEach(option => {
      if (option.id === item.id) {
        const nextStatus = resolveNextTriToggleStatus(this.optionMap[item.id])
        optionMap[option.id] = nextStatus
      } else {
        optionMap[option.id] = 'none'
      }
    })
    this.optionMap = optionMap

    this.emitCurrent()
  }

  onTag (item: ClassFilterItemType) {
    this.$emit('tag', item)
  }

  onUntag (item: ClassFilterItemType) {
    this.$emit('untag', item)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.class-filter__input {
  input {
    font-size: 12px !important;
    background: $colorSecondaryLight2 !important;

    &::placeholder {
      color: $colorSecondaryLight;
      font-size: 12px !important;
    }
  }
}

</style>

<style lang="scss" scoped>
.class-filter {
  width: 100%;
  height: 100%;
  @include col--center;
  overflow: hidden;
  gap: 8px;
}

.class-filter__input {
  width: 100%;
}

.class-filter__header {
  @include row--distributed--center;
  width: 100%;
  margin-bottom: 5px;
  padding: 0 10px 0 5px;
}

.class-filter__header__class-name {
  @include row--center;
}

.class-filter__clear {
  font-size: 12px;
  font-weight: bold;
  color: $colorSecondaryDark1;
  background: transparent;
}

.class-filter__list {
  flex: 1;
  @include col;
  @include scrollbar;
  align-items: center;
  width: 100%;
  margin-bottom: 5px;
  overflow: auto;

  & > div {
    margin: 1px 0;
  }
}

.class-filter__create-tag {
  width: 100%;
  padding: 7px 7px;
  @include typography(md);
  background: $colorLineGrey;
  border-radius: $border-radius-default;
  color: $colorSecondaryDark1;
  cursor: pointer;
}

.class-filter__tag {
  background: #B7B9DF;
  border-radius: $border-radius-default;
  padding: 3px 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.class-filter__create-tag--disabled {
  color: $colorSecondaryLight1;
  cursor: default;
}

</style>
