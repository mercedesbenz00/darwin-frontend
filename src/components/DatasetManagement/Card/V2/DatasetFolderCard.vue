<template>
  <card
    class="folder-card"
    type="folder"
    :thumbnail="thumbnail"
  >
    <template #overlay-center>
      <custom-button
        v-if="!!folderLocation"
        :tag="folderLocation ? 'router-link' : 'div'"
        :to="folderLocation"
        color="primary"
        size="small"
        flair="rounded"
      >
        Open
      </custom-button>
    </template>
    <template #details>
      <div class="folder-card__info">
        <p>{{ count }} items</p>
      </div>
      <p class="folder-card__title">
        {{ folderName }}
      </p>
    </template>
  </card>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType
} from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import { V2DatasetFolderPayload } from '@/store/types'

import Card from './Card.vue'
import { DatasetFolderCardProps } from './types'
import { useDatasetFolder } from './useDatasetFolder'

/**
 * Used to render folders in dataset management and open datasets.
 *
 * Used when the gallery is in card mode.
 */
export default defineComponent({
  name: 'DatasetFolderCard',
  components: { Card, CustomButton },
  props: {
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
      type: String,
      default: null
    }
  },
  setup (props: DatasetFolderCardProps) {
    return {
      ...useDatasetFolder(props.data, props.readonly, props.urlPrefix)
    }
  }
})
</script>
<style lang="scss" scoped>
.folder-card {
  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    height: auto;

    & > p {
      transition: color 150ms ease;
      margin-top: 2px;

      @include typography(sm, inter, 500);
      color: $colorNeutralsLight500;
    }

  }

  &__title {
    @include typography(md, inter, 500);
    color: $colorNeutralsLight900;
    margin-bottom: 2px;
  }
}
</style>
