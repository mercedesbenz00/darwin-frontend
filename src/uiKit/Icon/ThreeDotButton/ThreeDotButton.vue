<template>
  <icon-button
    class="three-dot-button"
    color="transparent"
    :size="size"
    flair="super-soft"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <icon-mono-dots-vertical />
  </icon-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { IconMonoDotsVertical } from '@/assets/icons/V2/Mono'
import { IconButton } from '@/components/Common/Button/V2'
import { DotButtonSize } from '@/components/Common/ThreeDotButton'

@Component({
  name: 'three-dot-button',
  components: { IconButton, IconMonoDotsVertical }
})
export default class ThreeDotButton extends Vue {
  @Prop({ type: String, default: 'small' })
  size!: DotButtonSize

  @Prop({ type: Boolean, default: false })
  disabled!: boolean
}
</script>
