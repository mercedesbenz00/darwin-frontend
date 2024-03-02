<template>
  <image-manipulator>
    <template #label>
      Image Settings Presets
    </template>
    <template #slider>
      <preset-dropdown
        v-model="preset"
        :editor="editor"
      />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'

import { useStore } from '@/composables'
import { useEditorLayout, useEditorV2 } from '@/composables/useEditorV2'

import ImageManipulator from './components/ImageManipulator.vue'
import PresetDropdown from './components/PresetDropdown.vue'

export default defineComponent({
  name: 'PresetManipulator',
  components: { PresetDropdown, ImageManipulator },
  setup () {
    const layout = useEditorLayout()
    const { state, commit } = useStore()
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }
    const isSyncMode = ref(true)

    const preset = computed({
      get (): number | null {
        return state.workview.activePresetId
      },
      set (val: number | null): void {
        commit('workview/SET_ACTIVE_MANIPULATION_PRESET_ID', val)
      }
    })

    return {
      preset,
      hasMoreThenOneSection: layout.value.viewsList.length > 1,
      isSyncMode,
      editor
    }
  }
})
</script>
