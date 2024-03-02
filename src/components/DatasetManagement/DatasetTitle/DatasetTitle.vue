<template>
  <div
    v-if="dataset"
    class="dataset-title"
  >
    <img
      v-if="dataset.public"
      class="dataset-title__icon"
      src="/static/imgs/open-dataset-icon.svg"
    >
    <content-editable
      v-if="editable"
      v-model="title"
      class="dataset-title__span--editable"
      tag="span"
      disable-multiline
      @change="onTitleChange"
    />
    <span
      v-else
      class="dataset-title__span"
    >
      {{ dataset.name }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import ContentEditable from '@/components/Common/ContentEditable.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'dataset-title',
  components: { ContentEditable }
})
export default class DatasetTitle extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @Prop({ type: Boolean, default: false })
  editable!: boolean

  title: string = ''

  @Watch('dataset.name', { immediate: true })
  onTitle () {
    this.title = this.dataset.name
  }

  onTitleChange () {
    this.$emit('change', this.title)
    this.$emit('input', this.title)
  }
}
</script>

<style lang="scss" scoped>
.dataset-title {
  width: 100%;
  @include typography(xl, headlines, 500);
  @include row;
  align-items: center;
}

.dataset-title__icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.dataset-title__span--editable {
  overflow: hidden;
  white-space: nowrap;
}

.dataset-title__span {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
