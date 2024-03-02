<template>
  <icon-button
    class="close-button"
    color="transparent"
    :size="size"
    flair="super-soft"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <icon-mono-close />
  </icon-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { IconMonoClose } from '@/assets/icons/V2/Mono'
import { IconButton } from '@/components/Common/Button/V2'
import { DotButtonSize } from '@/components/Common/ThreeDotButton'

@Component({
  name: 'three-dot-button',
  components: { IconButton, IconMonoClose }
})
export default class ThreeDotButton extends Vue {
  @Prop({ type: String, default: 'small' })
  size!: DotButtonSize

  @Prop({ type: Boolean, default: false })
  disabled!: boolean
}
</script>
