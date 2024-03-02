<template>
  <generic-filter-header v-if="includeHeader">
    <template #title>
      {{ headerLabel }}
    </template>
    <template #content>
      <generic-filter-option-content
        :option="option"
        :status="status"
        @toggle="status => $emit('toggle', { option, status })"
        @shift-toggle="status => $emit('shift-toggle', { option, status })"
      />
    </template>
  </generic-filter-header>
  <generic-filter-option-content
    v-else
    :option="option"
    :status="status"
    @toggle="status => $emit('toggle', { option, status })"
    @shift-toggle="status => $emit('shift-toggle', { option, status })"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import GenericFilterHeader from '@/components/DatasetFiltering/GenericFilter/Common/GenericFilterHeader.vue'
import GenericFilterOptionContent from '@/components/DatasetFiltering/GenericFilter/Common/GenericFilterOptionContent.vue'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { TriToggleStatus } from '@/utils'

@Component({
  name: 'generic-filter-option',
  components: { GenericFilterHeader, GenericFilterOptionContent }
})
export default class GenericFilterOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  get includeHeader (): boolean {
    const { includeHeader } = this.option
    return includeHeader
  }

  get headerLabel (): string {
    const { type } = this.option
    switch (type) {
    case 'assignees': return 'Annotators'
    case 'filenames': return 'Files'
    case 'paths': return 'Folders'
    default: throw new Error(`Mixed filter option type cannot be ${type}`)
    }
  }
}
</script>
