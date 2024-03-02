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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { PresetPayload, RootState } from '@/store/types'

import ImageManipulator from './components/ImageManipulator.vue'
import PresetDropdown from './components/PresetDropdown.vue'

@Component({
  name: 'preset-manipulator',
  components: { PresetDropdown, ImageManipulator }
})
export default class PresetManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @State((state: RootState) => state.workview.presets)
  presets!: PresetPayload[]

  @State((state: RootState) => state.workview.activePresetId)
  activePresetId!: number | null

  isSyncMode: boolean = true

  get preset (): number | null {
    return this.activePresetId
  }

  set preset (val: number | null) {
    this.$store.commit('workview/SET_ACTIVE_MANIPULATION_PRESET_ID', val)
  }
}
</script>
