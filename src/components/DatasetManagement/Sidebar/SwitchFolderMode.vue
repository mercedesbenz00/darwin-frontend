<template>
  <div class="switch-folder">
    <icon-button @click="onClick">
      <folder-icon
        class="switch-layout__mode"
        :class="{'switch-layout__mode--active': folderEnabled}"
      />
    </icon-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { FolderIcon } from '@/assets/icons/V1'
import IconButton from '@/components/Common/Button/V1/IconButton.vue'

@Component({
  name: 'switch-gallery-layout',
  components: { FolderIcon, IconButton }
})
export default class SwitchGalleryLayout extends Vue {
  @State(state => state.dataset.folderEnabled)
  folderEnabled!: boolean

  onClick () {
    this.$store.dispatch('dataset/setFolderEnabled', !this.folderEnabled)
  }
}
</script>

<style lang="scss" scoped>
.switch-layout {
  @include row;
  justify-content: flex-start;
  align-items: center;
}

.switch-layout__mode {
  width: 15px;
  height: 15px;
  cursor: pointer;
  color: $colorAliceNight;
}

.switch-layout__mode--active {
  color: $color90Black;
}
</style>
