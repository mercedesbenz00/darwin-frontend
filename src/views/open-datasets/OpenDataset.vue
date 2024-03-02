<template>
  <router-view :dataset="dataset" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DatasetPayload } from '@/store/types'

@Component({ name: 'open-dataset' })
export default class OpenDataset extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload
}
</script>
