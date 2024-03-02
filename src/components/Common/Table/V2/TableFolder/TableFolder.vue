<template>
  <router-link
    v-if="!!folderLocation"
    class="table-folder"
    :id="folderId"
    :to="folderLocation"
    @click.native.stop
  >
    <div class="table-folder__content">
      <div class="table-folder__prefix">
        <icon-duotone-view-folder />
        <h1 class="table-folder__label">
          {{ folderName }}
        </h1>
      </div>
      <h1 class="table-folder__label table-folder__label--secondary">
        {{ count }}
      </h1>
    </div>
  </router-link>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { useDatasetFolder } from '@/components/DatasetManagement/Card/V2/useDatasetFolder'
import { V2DatasetFolderPayload } from '@/store/types'

export default defineComponent({
  name: 'TableFolder',
  components: {
    IconDuotoneViewFolder
  },
  props: {
    tableId: {
      required: true,
      type: String
    },
    data: {
      required: true,
      type: Object as PropType<V2DatasetFolderPayload>
    },
    readonly: {
      required: false,
      type: Boolean,
      default: false
    },
    urlPrefix: {
      required: false,
      type: [String, null] as PropType<string | null>,
      default: null
    }
  },
  setup (props) {
    const folderId: Ref<string> = computed(() => {
      return `table-folder_${props.tableId}`
    })

    return {
      folderId,
      ...useDatasetFolder(props.data, props.readonly, props.urlPrefix)
    }
  }
})
</script>

<style lang='scss' scoped>
.table-folder {
  transition: background-color 125ms ease;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 1010;

  width: 100%;
  height: 40px;

  background: $colorSurfaceDefault;
  border-bottom: 1px solid $colorStrokeRaise;

  &:hover {
    background: $colorOverlayHover;
  }

  cursor: pointer;
}

.table-folder__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 8px;

  height: 40px;
  width: 100%;
}

.table-folder__prefix {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
}

.table-folder__label {
  @include typography(md-1, inter, 500);
  color: $colorContentEmphasis;
  text-align: left;
  margin-left: 8px;
  user-select: none;
  text-overflow: ellipsis;

  &--secondary {
    color: $colorContentTertiary;
    text-align: center;
    margin-left: 0;
  }
}
</style>
