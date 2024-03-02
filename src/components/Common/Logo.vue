<template>
  <logo-icon
    v-if="size === 'normal'"
    class="logo"
    :style="{ color }"
  />
  <logo-small-icon
    v-else
    class="logo"
    :style="{ color }"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { LogoIcon, LogoSmallIcon } from '@/assets/icons/V1'

const themeValidator = (value: string) => ['dark', 'gray'].indexOf(value) !== -1
const sizeValidator = (value: string) => ['normal', 'small'].indexOf(value) !== -1

@Component({
  name: 'top-bar-logo',
  components: { LogoIcon, LogoSmallIcon }
})
export default class TopBarLogo extends Vue {
  @Prop({ default: 'dark', validator: themeValidator })
  theme!: 'dark' | 'gray'

  @Prop({ default: 'normal', validator: sizeValidator })
  size!: 'normal' | 'small'

  get color (): string {
    const color = this.theme === 'dark'
      ? this.$theme.getColor('colorBlack')
      : this.$theme.getColor('colorAliceShade')
    return color
  }
}
</script>

<style lang="scss" scoped>
.logo {
  @include noSelect;
}
</style>
