<template>
  <div
    id="app"
    class="darwin-theme"
  >
    <router-view />
    <class-loader />
    <initial-auth-loader />
    <intercom-loader />

    <portal-target
      name="modal"
      multiple
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ClassLoader from '@/components/Renderless/ClassLoader'
import InitialAuthLoader from '@/components/Renderless/InitialAuthLoader'
import IntercomLoader from '@/components/Renderless/IntercomLoader'
import { useAnnotationTypeLoader } from '@/composables/useAnnotationTypeLoader'
import { useEditor } from '@/engine/useEditor'

export default defineComponent({
  name: 'App',
  components: { ClassLoader, InitialAuthLoader, IntercomLoader },
  setup () {
    const { initEditor } = useEditor()
    useAnnotationTypeLoader()

    initEditor()
  }
})
</script>
