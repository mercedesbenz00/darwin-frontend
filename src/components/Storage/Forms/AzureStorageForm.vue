<template>
  <form @submit.prevent="onSubmit">
    <div class="storage__field-label-container">
      <div>
        <span class="storage__field-label">Name</span>
        <span class="field-required">*</span>
      </div>
      <info title="Name (Required)">
        New name for the setting.
      </info>
    </div>
    <input-field
      id="storageName"
      v-model="name"
      :error="error.name"
      class="storage__field"
      required
    />
    <div class="storage__field-label-container">
      <div>
        <span class="storage__field-label">Bucket</span>
        <span class="field-required">*</span>
      </div>
      <info title="Bucket (Required)">
        Name of the storage bucket / storage account name.
      </info>
    </div>
    <input-field
      id="storageBucket"
      v-model="bucket"
      :error="error.bucket"
      class="storage__field"
      required
    />
    <div class="storage__field-label-container">
      <div>
        <span class="storage__field-label">Prefix</span>
        <span class="field-required">*</span>
      </div>
      <info title="Prefix (Required)">
        Prefix for all Darwin-created files (like thumbnails).
        It cannot start nor end with "/" and has to include at least name of existing container.
        Examples: "v7labs_container", "mycontainer/darwin".
      </info>
    </div>
    <input-field
      id="storagePrefix"
      v-model="prefix"
      :error="error.prefix"
      class="storage__field"
      required
    />
    <div class="storage__field-label-container">
      <div>
        <span class="storage__field-label">Tenant Id</span>
        <span class="field-required">*</span>
      </div>
      <info title="Tenant Id (Required)">
        Azure Tenant's ID that holds the storage account.
      </info>
    </div>
    <input-field
      id="tenantId"
      v-model="tenantId"
      :error="error.tenantId"
      class="storage__field"
      required
    />
    <div class="storage__inline">
      <check-box
        id="storage-readonly"
        v-model="isReadonly"
        class="storage__field"
        size="small"
        label="Read only"
      />
      <!-- TODO: Looks like once you set it as default you can't unset it -->
      <check-box
        id="storage-default"
        v-model="isDefault"
        class="storage__field"
        size="small"
        label="Default"
      />
    </div>

    <div class="storage__footer">
      <secondary-button
        type="button"
        @click="$emit('canceled')"
      >
        Cancel
      </secondary-button>
      <positive-button
        type="submit"
      >
        Save
      </positive-button>
    </div>
  </form>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { StoragePayload } from '@/store/types'

type AzureStorageFormError = {
  name?: string
  bucket?: string
  prefix?: string
  tenantId?: string
}

/**
 * Storage's editing form
 *
 * @prop {StoragePayload|null} value - optional storage value
 */
@Component({
  name: 'azure-storage-form',
  components: {
    CheckBox,
    Info,
    InputField
  }
})
export default class AzureStorageForm extends Vue {
  @Prop({ required: false, type: Object as () => StoragePayload, default: null })
  value!: StoragePayload | null

  name: string = ''
  bucket: string = ''
  prefix: string = ''
  tenantId: string = ''
  isReadonly: boolean = false
  isDefault: boolean = false
  error: AzureStorageFormError = {}

  mounted (): void {
    if (this.value) {
      this.name = this.value.name
      this.bucket = this.value.bucket
      this.prefix = this.value.prefix || ''
      this.tenantId = this.value.tenant_id || ''
      this.isReadonly = this.value.readonly
      this.isDefault = this.value.default
    }
  }

  validateForm (): boolean {
    this.error = {}

    if (isEmpty(this.name.trim())) {
      this.error.name = 'Storage name cannot be empty'
    }

    if (isEmpty(this.bucket.trim())) {
      this.error.bucket = 'Bucket cannot be empty'
    }

    if (isEmpty(this.prefix.trim())) {
      this.error.prefix = 'Prefix cannot be empty'
    }

    if (isEmpty(this.tenantId.trim())) {
      this.error.tenantId = 'Tenant id cannot be empty'
    }

    return Object.keys(this.error).length === 0
  }

  onSubmit (): void {
    if (!this.validateForm()) {
      this.$ga.event('azure_storage', 'submit', 'failure_form_invalid')
      return
    }

    this.$emit('submitted', {
      slug: this.value?.slug || null,
      name: this.name.trim(),
      readonly: this.isReadonly,
      bucket: this.bucket.trim(),
      prefix: this.prefix.trim(),
      tenant_id: this.tenantId.trim(),
      default: this.isDefault
    })
  }
}
</script>

<style lang="scss" scoped>
.storage__footer {
  @include row--distributed--center;
  margin-top: $defaultSpace;
}

.storage__field {
  margin-bottom: $defaultSpace;
}

.storage__inline {
  display: flex;
  justify-content: space-around;
}

.storage__field-label-container {
  width: 100%;
  @include row--distributed--center;
  margin-bottom: 7px;
}

.storage__field-label {
  @include typography(md-1, default);
  color: $colorAliceNight;
}
.field-required {
  color: $colorPink;
  padding-left: 3px;
}
</style>
