<template>
  <v-popover
    placement="top"
    trigger="click"
    popover-class="folder-popover"
    :disabled="loading || disabled"
    :offset="1"
    @show="onPopoverShow"
  >
    <slot />
    <template
      v-if="!disabled"
      #popover
    >
      <div class="folder-popover_content">
        <div class="folder-popover__folders">
          <div
            class="folder-popover__folders__root"
            @click="onSelect(rootFolder)"
          >
            Move to
            <strong>{{ datasetName }}</strong>
          </div>
          <folder-tree
            v-if="subFolders.length > 0"
            :folders="subFolders"
            @select="onSelect"
          />
        </div>
        <input-field
          ref="inputField"
          v-model="folderPath"
          class="folder-popover__input"
          auto-focus
          placeholder="/enter folder/ or path"
          @enter="onCreate"
        >
          <template #modifier>
            <button
              class="folder-popover__create"
              :disabled="!folderPath"
              @click="onCreate"
            >
              <folder-icon class="folder-popover__icon" />
            </button>
          </template>
        </input-field>
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import FolderTree from '@/components/Common/FolderTree/FolderTree.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { DatasetFolderPayload, DatasetPayload, V2DatasetFolderPayload } from '@/store/types'
import { normalizeFolderPath } from '@/utils'

@Component({
  name: 'folder-popover',
  components: {
    FolderIcon,
    FolderTree,
    InputField
  }
})
export default class FolderPopover extends Vue {
  @Prop({
    required: true,
    type: Object as () => DatasetPayload
  })
  dataset!: DatasetPayload

  /**
   * This should be a treefied folder list
   * Should be the result of "treefiy" function of "@/utils/folder"
   */
  @Prop({
    required: true,
    type: Array as () => DatasetFolderPayload[] | V2DatasetFolderPayload[]
  })
  folders!: DatasetFolderPayload[] | V2DatasetFolderPayload[]

  @Prop({ default: false, type: Boolean })
  loading!: boolean

  @Prop({ default: false, type: Boolean })
  disabled!: boolean

  $refs!: {
    inputField: InputField
  }

  folderPath: string = ''

  get datasetName (): string {
    return this.dataset.name
  }

  /**
   * Root folder of treefied folder structure
   * This is always supposed to be "/" and exists
   */
  get rootFolder (): DatasetFolderPayload | V2DatasetFolderPayload |null {
    return this.folders.length > 0 ? this.folders[0] : null
  }

  get subFolders (): DatasetFolderPayload[] | V2DatasetFolderPayload [] {
    const { rootFolder } = this
    if (!rootFolder) { return [] }
    return rootFolder.children || []
  }

  onPopoverShow (): void {
    this.$refs.inputField.setFocus()
  }

  onCreate (): void {
    this.$emit('move', normalizeFolderPath(this.folderPath))
  }

  onSelect (folder: DatasetFolderPayload | V2DatasetFolderPayload | null): void {
    if (folder) {
      this.$emit('move', folder.path)
    }
  }
}
</script>

<style lang="scss" scoped>
$popover-width: 260px;

.folder-popover_content {
  @include col;
  justify-content: center;
  width: $popover-width;
  max-height: 50vh;
  overflow: hidden;
  padding: 2px 0;
}

.folder-popover__folders {
  flex: 1;
  padding: 5px 0;
  overflow: auto;
}

.folder-popover__folders__root {
  @include typography(md);
  color: $color90Black;
  padding: 5px 5px 5px 8px;
  cursor: pointer;

  strong {
    font-weight: bold;
  }

  &:hover {
    background: $colorAliceBlue;
  }

  &:active {
    background: $colorAliceShade;
  }
}

.folder-popover__input {
  width: calc(100% - 10px);
  margin: 0 5px;

  :deep(input) {
    @include typography(md);

    &::placeholder {
      @include typography(md);
    }
  }
}

.folder-popover__create {
  @include row--center;
  width: 31px;
  height: 31px;
  margin: auto 3px auto 0;
  padding: 0;
  border-radius: 3px;
  background: transparent;

  &:disabled {
    opacity: .5;
  }

  &:not(:disabled) {
    &:hover {
      background: $colorAliceShadow;
    }

    &:active {
      background: $colorAliceShade;
    }
  }
}

.folder-popover__icon {
  color: $colorAliceNight;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$popover-width: 260px;

.folder-popover {
  width: $popover-width;
  border-radius: 3px;
  background: $colorWhite;
  top: 5px !important;
  box-shadow: 0px -15px 30px rgba(145, 169, 192, 0.3);

  .popover-inner {
    background: white;
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
