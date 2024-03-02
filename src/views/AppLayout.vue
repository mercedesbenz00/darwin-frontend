<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import EmptyLayout from '@/layouts/Empty.vue'
import MainLayout from '@/layouts/Main/Main.vue'

const DEFAULT_LAYOUT = 'main'

@Component({
  name: 'app-layout',
  components: { MainLayout, EmptyLayout }
})
export default class AppLayout extends Vue {
  get layout (): string {
    const layout = this.$route.meta?.layout || DEFAULT_LAYOUT
    return `${layout}-layout`
  }
}
</script>
