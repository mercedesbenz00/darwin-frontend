<template>
  <tags-popover
    :dataset="dataset"
    :tags="tags"
    @change="$emit('set-tags', $event)"
  >
    <file-set-action-button>
      <tag-icon />
    </file-set-action-button>
  </tags-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TagIcon } from '@/assets/icons/V1'
import { DatasetPayload } from '@/store/types'

import FileSetActionButton from './Common/FileSetActionButton.vue'
import TagsPopover from './TagsPopover.vue'

@Component({
  name: 'file-set-tag-button',
  components: {
    FileSetActionButton,
    TagIcon,
    TagsPopover
  }
})
export default class FileSetTagButton extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Array as () => string[] })
  tags!: string[]
}
</script>
