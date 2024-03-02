<template>
  <div class="annotation-type-filter">
    <annotation-type-filter-item
      :data="allItem"
      :selected="isAllSelected"
      @click="onAllClick"
    />
    <annotation-type-filter-item
      v-for="item of options"
      :key="`filter-item-${item.name}`"
      :data="item"
      :selected="optionMap[item.name]"
      @click="onItemClick(item.name)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { AnnotationTypeName } from '@/store/types'

import AnnotationTypeFilterItem from './AnnotationTypeFilterItem.vue'
import { AnnotationTypeFilterItemType } from './types'

@Component({
  name: 'annotation-type-filter',
  components: { AnnotationTypeFilterItem }
})
export default class AnnotationTypeFilter extends Vue {
  @Prop({ required: true })
  options!: AnnotationTypeFilterItemType[]

  @Prop({ required: true })
  value!: AnnotationTypeName[]

  @Prop({ required: false, type: Boolean, default: false })
  showAll!: boolean

  @Prop({ required: false, default: 0 })
  allCount!: number

  optionMap: Partial<Record<AnnotationTypeName, boolean>> = {}

  get allItem () {
    return {
      id: 'All',
      label: 'All',
      icon: '/static/imgs/image-status/all.svg',
      count: this.allCount
    }
  }

  get selectedOptions (): AnnotationTypeName[] {
    return (Object.keys(this.optionMap) as AnnotationTypeName[])
      .filter(key => !!this.optionMap[key])
  }

  get isAllSelected (): boolean {
    return this.options.every(({ name }) => !!this.optionMap[name])
  }

  @Watch('value', { immediate: true })
  onValueChange () {
    const optionMap: Partial<Record<AnnotationTypeName, boolean>> = {}
    this.value.forEach(id => {
      optionMap[id] = true
    })
    this.optionMap = optionMap
  }

  onAllClick () {
    if (this.isAllSelected) {
      this.optionMap = {}
    } else {
      const newOptions: Partial<Record<AnnotationTypeName, boolean>> = {}
      this.optionMap = this.options.reduce((acc, item) => {
        acc[item.name] = true
        return acc
      }, newOptions)
    }
    this.$emit('change', this.selectedOptions)
  }

  onItemClick (typeName: AnnotationTypeName) {
    this.optionMap[typeName] = !this.optionMap[typeName]
    this.$emit('change', this.selectedOptions)
  }
}
</script>

<style lang="scss" scoped>
.annotation-type-filter {
  width: 100%;
  @include col--center;

  & > div {
    margin: 3px 0;
  }
}
</style>
