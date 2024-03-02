<template>
  <dropdown
    v-bind="$attrs"
    :options="options"
    search
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'
import { StorageProvider } from '@/store/types'

/**
 * Select-field with preset options as a list of the storage providers
 *
 * @param {string} value - Storage provider value
 */
@Component({
  name: 'storage-provider-select',
  components: {
    Dropdown
  }
})
export default class StorageProviderSelect extends Vue {
  readonly options: { text: string, id: StorageProvider }[] = [
    { text: 'AWS S3', id: StorageProvider.AWS },
    { text: 'GCP', id: StorageProvider.GCP },
    { text: 'Azure Blob Storage', id: StorageProvider.Azure },
    { text: 'MinIO', id: StorageProvider.Minio }
  ]
}
</script>
