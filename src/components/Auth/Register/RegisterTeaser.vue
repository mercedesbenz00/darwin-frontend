<template>
  <teaser
    class="register-teaser"
    :title="title"
    :description="description"
    image="register.png"
    text-align="left"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Teaser from '@/components/Common/Teaser.vue'

@Component({
  name: 'register-teaser',
  components: { Teaser }
})
export default class RegisterTeaser extends Vue {
  get title (): string {
    return 'Create your Account'
  }

  get description (): string {
    // this is the wrong way to do it. the <Teaser/> component should instead
    // accept a slot
    return [
      'This will be your unique account across any team within V7.',
      '<br/>If you are creating a team for work or academia,',
      'make sure you use your company or academic email.'
    ].join(' ')
  }
}
</script>

<style lang="scss" scoped>
.register-teaser {
  width: 303px;
  height: 596px;

  :deep(.teaser__image) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
