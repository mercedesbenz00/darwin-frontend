<template>
  <modal
    name="edit-storage"
    translate="pop-out"
    width="35%"
    height="auto"
    :click-to-close="false"
  >
    <div class="modal__header">
      <p class="modal__header__title">
        Storage
      </p>
      <div
        class="modal__header__close"
        @click="close"
      >
        &#10005;
      </div>
    </div>
    <div
      v-loading="loading"
      class="modal__content"
    >
      <storage-provider-select
        v-model="storage.provider"
        class="storage__field"
        :clearable="false"
        required
        label="Storage Provider"
      />
      <aws-storage-form
        v-if="storage.provider===PROVIDER_TYPE.AWS"
        :value="storage"
        @canceled="close"
        @submitted="onSubmit"
      />
      <gcp-storage-form
        v-else-if="storage.provider===PROVIDER_TYPE.GCP"
        :value="storage"
        @canceled="close"
        @submitted="onSubmit"
      />
      <azure-storage-form
        v-else-if="storage.provider===PROVIDER_TYPE.Azure"
        :value="storage"
        @canceled="close"
        @submitted="onSubmit"
      />
      <minio-storage-form
        v-else-if="storage.provider===PROVIDER_TYPE.Minio"
        :value="storage"
        @canceled="close"
        @submitted="onSubmit"
      />
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import AwsStorageForm from '@/components/Storage/Forms/AwsStorageForm.vue'
import AzureStorageForm from '@/components/Storage/Forms/AzureStorageForm.vue'
import GcpStorageForm from '@/components/Storage/Forms/GcpStorageForm.vue'
import MinioStorageForm from '@/components/Storage/Forms/MinioStorageForm.vue'
import StorageProviderSelect from '@/components/Storage/StorageProviderSelect.vue'
import { StoragePayload, StorageProvider } from '@/store/types'

/**
 * Storage editing modal window
 */
@Component({
  name: 'storage-editing',
  components: {
    AwsStorageForm,
    AzureStorageForm,
    GcpStorageForm,
    MinioStorageForm,
    StorageProviderSelect
  }
})
export default class StorageEditing extends Vue {
  @Prop({ required: true, type: Object as () => StoragePayload })
  storage!: StoragePayload

  readonly PROVIDER_TYPE = StorageProvider

  loading: boolean = false

  mounted (): void {
    this.$modal.show('edit-storage')
  }

  close (): void {
    this.$emit('closed')
    this.$modal.hide('edit-storage')
  }

  async onSubmit (storage: StoragePayload) {
    this.loading = true

    const { error } = await this.$store.dispatch('storage/updateStorage', storage)

    if (error) {
      this.loading = false
      if (error.isValidationError && !error.message) {
        return this.$store.dispatch('toast/warning', { content: 'Validation error' })
      } else {
        return this.$store.dispatch('toast/warning', { content: error.message })
      }
    }

    this.close()
    this.loading = false
  }
}
</script>
