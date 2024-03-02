<template>
  <div>{{ friendlyStatus }}</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { DatasetItemStatus, getDatasetItemStatusLabel } from '@/store/types'

/** Renders status as a text label, based on the provided key */
@Component({ name: 'status' })
export default class Status extends Vue {
  @Prop({ required: true, type: String })
  status!: DatasetItemStatus

  get friendlyStatus (): string {
    return getDatasetItemStatusLabel(this.status)
  }
}
</script>
