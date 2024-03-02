<template>
  <div v-loading="loading">
    <!--
      :hover="!disabled"
      visually shown that user is not able to interact with this component
    -->
    <v-table
      :hover="!disabled"
      striped
      :columns="columns"
      :data="storages"
      :options="options"
      :pagination="true"
      cursor-pointer
      @row-click="onEdit"
    >
      <template #id="{ row }">
        <span class="storage__name-wrapper">
          <span class="storage__name">{{ row.bucket }}</span>
          <blue-pill
            v-if="row.default"
            class="storage__pill"
          >Default</blue-pill>
        </span>
      </template>
      <template #type="{ row }">
        {{ getInstanceType(row.provider) }}
      </template>
      <template #region="{ row }">
        {{ row.region }}
      </template>
      <template #access="{ row }">
        <span v-if="row.readonly">read</span>
        <span v-else>read/write</span>
      </template>
      <template #prefix="{ row }">
        {{ row.prefix }}
      </template>
      <template #actions="{ row }">
        <button
          type="button"
          class="storage__trash-button"
          :disabled="!$can('update_team')"
          @click.stop="maybeDeleteStorage(row)"
        >
          <trash-icon-old class="storage__trash-icon" />
        </button>
      </template>
    </v-table>

    <storage-editing
      v-if="editedStorage"
      :storage="editedStorage"
      @closed="editedStorage = null"
    />
    <delete-confirmation-dialog
      name="delete-storage-modal"
      button-text="REMOVE STORAGE"
      :title="deleteStorageDialogTitle"
      :detail="deleteStorageDialogDetails"
      @confirmed="deleteStorage"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { TrashIconOld } from '@/assets/icons/V1'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import BluePill from '@/components/Common/Pill/BluePill.vue'
import { Table } from '@/components/Common/Table/V1'
import AwsStorageForm from '@/components/Storage/Forms/AwsStorageForm.vue'
import StorageEditing from '@/components/Storage/StorageEditing.vue'
import { StorageProvider } from '@/store/types'
import { StoragePayload } from '@/store/types/StoragePayload'

/**
 * List of all storages with general info related to the team
 */
@Component({
  name: 'storages-list',
  components: {
    'v-table': Table,
    AwsStorageForm,
    DeleteConfirmationDialog,
    StorageEditing,
    TrashIconOld,
    BluePill
  }
})
export default class StoragesList extends Vue {
  @Getter('storages', { namespace: 'storage' })
  storages!: StoragePayload[]

  readonly columns = [
    { key: 'id', label: 'Storage ID' },
    { key: 'type', label: 'Integration type' },
    'name',
    'region',
    'access',
    'prefix',
    { key: 'actions' }
  ]

  $refs!: {
    editStorage?: Vue & StorageEditing
  }

  editedStorage: StoragePayload | null = null

  storageToDelete: StoragePayload | null = null

  loading: boolean = false

  sortable: string[] = [
    'id',
    'type',
    'name'
  ]

  options = {
    sortable: this.sortable,
    sortIcon: {
      base: 'fa fas',
      is: 'fa-sort',
      up: 'fa-sort-alpha-up',
      down: 'fa-sort-alpha-down'
    },
    texts: { count: '', noResults: 'No private storage buckets were added' }
  }

  get disabled (): boolean {
    return !this.$can('update_team')
  }

  get deleteStorageDialogTitle (): string {
    if (!this.storageToDelete) { return '' }
    return `Please confirm you wish to remove "${this.storageToDelete.name}" storage.`
  }

  get deleteStorageDialogDetails (): string {
    if (!this.storageToDelete) { return '' }
    return `This will remove the "${this.storageToDelete.name}" storage from current storage list.`
  }

  getInstanceType (provider: string): string {
    const options = [
      { label: 'AWS S3', id: StorageProvider.AWS },
      { label: 'GCP', id: StorageProvider.GCP },
      { label: 'Azure Blob Storage', id: StorageProvider.Azure },
      { label: 'MinIO', id: StorageProvider.Minio }
    ]
    return options.find((option) => option.id === provider)?.label || ''
  }

  onEdit ({ row }: { row: StoragePayload }): void {
    if (!this.disabled) {
      this.editedStorage = row
    }
  }

  readonly deleteModalName = 'delete-storage-modal'

  maybeDeleteStorage (storage: StoragePayload): void {
    this.storageToDelete = storage
    this.$modal.show(this.deleteModalName)
  }

  async deleteStorage (): Promise<void> {
    if (!this.storageToDelete) {
      return
    }
    this.loading = true

    const { error } = await this.$store.dispatch('storage/deleteStorage', this.storageToDelete.slug)

    if (error) {
      this.loading = false
      return this.$store.dispatch('toast/warning', { content: error.message })
    }
    await this.$store.dispatch('billing/loadBillingInfo')
    this.loading = false

    this.storageToDelete = null
    this.$modal.hide(this.deleteModalName)
  }
}
</script>

<style lang="scss" scoped>
.storage__name-wrapper {
  display: inline-flex;
  align-items: center;

  .storage__name {
    word-break: break-all;
  }
  .storage__pill {
    margin-left: .7em;
    padding: 2px;
  }
}
.storage__trash-button {
  background: transparent;
}
.storage__trash-icon {
  color: $colorCrimsonLight;
}
:deep(.VueTables__sortable) {
  cursor: pointer;
}

// Bootstrap Pagination (compiled from https://getbootstrap.com/docs/3.4/customize/)
:deep(.pagination) {
  display: inline-block;
  padding-left: 0;
  margin: 20px 0;
  border-radius: 4px;

  & > li {
    display: inline;

    & > a,
    & > span {
      position: relative;
      float: left;
      padding: 6px 12px;
      margin-left: -1px;
      line-height: 1.42857143;
      color: $colorAssignedBlue;
      text-decoration: none;
      background-color: $colorWhite;
      border: 1px solid $colorGrayLite2;
    }

    & > a:hover,
    & > span:hover,
    & > a:focus,
    & > span:focus {
      z-index: 2;
      color: $colorPrimaryDark;
      background-color: $colorGrayLiter;
      border-color: $colorGrayLite2;
    }

    &:first-child > a,
    &:first-child > span {
      margin-left: 0;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-child > a,
    &:last-child > span {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  & > .active > a,
  & > .active > span,
  & > .active > a:hover,
  & > .active > span:hover,
  & > .active > a:focus,
  & > .active > span:focus {
    z-index: 3;
    color: $colorWhite;
    cursor: default;
    background-color: $colorAssignedBlue;
    border-color: $colorAssignedBlue;
  }

  & > .disabled > span,
  & > .disabled > span:hover,
  & > .disabled > span:focus,
  & > .disabled > a,
  & > .disabled > a:hover,
  & > .disabled > a:focus {
    color: $colorGrayLite;
    cursor: not-allowed;
    background-color: $colorWhite;
    border-color: $colorGrayLite2;
  }
}

:deep(.pagination-lg) {
  & > li > a,
  & > li > span {
    padding: 10px 16px;
    font-size: 18px;
    line-height: 1.3333333;
  }

  & > li:first-child > a,
  & > li:first-child > span {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  & > li:last-child > a,
  & > li:last-child > span {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }
}

:deep(.pagination-sm) {
  & > li > a,
  & > li > span {
    padding: 5px 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  & > li:first-child > a,
  & > li:first-child > span {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  & > li:last-child > a,
  & > li:last-child > span {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}
</style>
