<template>
  <content-editable
    class="title"
    tag="span"
    disable-multiline
    :value="value"
    @change="value => $emit('change', value)"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import ContentEditable from '@/components/Common/ContentEditable.vue'

/**
 * Wraps around the <content-editable /> component providing some shared styles
 */
@Component({ name: 'stage-title', components: { ContentEditable } })
export default class StageTitle extends Vue {
  /** The title of the stage. Passed down as value to content-editable */
  @Prop({ required: true, type: String })
  value!: string
}
</script>

<style lang="scss" scoped>
.title {
  flex: 1;
  @include typography(md-1, default, bold);
  overflow: hidden;
  white-space: nowrap;
  min-height: 18px;
  min-width: 30px;

  &:hover, &:focus {
    min-height: 28px;
  }
}
</style>
