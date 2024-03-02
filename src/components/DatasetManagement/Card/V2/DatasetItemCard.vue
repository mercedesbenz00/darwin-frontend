<template>
  <card
    class="item-card"
    :is-external="isExternal"
    :is-selected="isSelected"
    :file-type="fileType"
    :priority="priority"
    :type="itemType"
    :name="originalFileName"
    :thumbnail="thumbnailUrl"
    @select="setSelection"
  >
    <template #overlay-top-left>
      <check-box-v2
        name="card-selected"
        size="large"
        :value="isSelected"
        @click.stop.prevent="$emit('selected')"
      />
    </template>
    <template #overlay-top-right>
      <span>{{ dimensionInfo }}</span>
      <span>{{ filesizeInfo }}</span>
    </template>
    <template #overlay-center>
      <custom-button
        v-if="isOpenable"
        :tag="itemLocation ? 'router-link' : 'div'"
        @click.native.stop
        color="primary"
        size="small"
        flair="rounded"
        :to="itemLocation"
      >
        Open
      </custom-button>
      <custom-button
        v-else-if="isRestorable"
        color="primary"
        size="small"
        flair="rounded"
        @click.stop.prevent="onRestore"
      >
        Restore
      </custom-button>
      <custom-button
        v-else-if="hasError"
        color="primary"
        size="small"
        flair="rounded"
        @click.stop.prevent="onArchive"
      >
        Archive
      </custom-button>
    </template>
    <template #status>
      <status-icon
        show-tooltip
        :item="dataV2"
      />
    </template>
    <template #details>
      <div class="item-card__info">
        <p>{{ date }}</p>
        <p>{{ seq }}</p>
      </div>
      <dataset-item-name
        class="item-card__title"
        :name="originalFileName"
      />
      <card-tags :tags="tags" />
    </template>
  </card>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext
} from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import CheckBoxV2 from '@/components/Common/CheckBox/V2/CheckBox.vue'
import { DatasetItemCardProps } from '@/components/DatasetManagement/Card/V2/types'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V2/CardTags/CardTags.vue'
import DatasetItemName from '@/components/DatasetManagement/Common/DatasetItemName.vue'
import StatusIcon from '@/components/DatasetManagement/Status/V2/DatasetItemStatusIcon.vue'
import { DatasetItemPayload, V2DatasetItemPayload } from '@/store/types'

import Card from './Card.vue'
import { useDatasetItem } from './useDatasetItem'

/**
 * Used to render dataset items in dataset management.
 *
 * Used when gallery is in card mode.
 */
export default defineComponent({
  name: 'DatasetItemCard',
  components: { Card, CustomButton, CardTags, CheckBoxV2, DatasetItemName, StatusIcon },
  props: {
    data: {
      required: false,
      type: Object as PropType<DatasetItemPayload>,
      default: null
    },
    dataV2: {
      required: false,
      type: Object as PropType<V2DatasetItemPayload>,
      default: null
    },
    urlPrefix: {
      required: false,
      type: String,
      default: null
    }
  },
  setup (props: DatasetItemCardProps, context: SetupContext) {
    return {
      ...useDatasetItem(props, context)
    }
  }
})
</script>

<style lang="scss" scoped>
.item-card {
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
    max-width: fit-content;
  }

  :deep(.card__thumbnail) {
    box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.08);
  }
}
</style>
