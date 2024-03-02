<template>
  <div
    :id="`folder-tree-${treeLevel}`"
    class="folder-tree"
    :style="{ '--treeLevel': treeLevel }"
    :data-has-child="folderChilds.length > 0"
  >
    <list-element-v2
      :text="pathName"
      :style="{ '--childs': getChildLength() }"
      @click="$emit('click', subFolder)"
    >
      <template #prefix>
        <icon-duotone-view-folder v-if="pathName !== '/'" />
        <icon-duotone-status-dataset v-else />
      </template>
    </list-element-v2>
    <div v-if="folderChilds.length > 0">
      <folder-tree
        v-for="(folder, index) in folderChilds"
        :key="index"
        :sub-folder="folder"
        :tree-level="treeLevel + 1"
        @click="(f) => $emit('click', f)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, SetupContext } from 'vue'

import { IconDuotoneViewFolder, IconDuotoneStatusDataset } from '@/assets/icons/V2/Duotone'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'

/**
 * @Component FolderTree
 * ~ Any description
 * @param {string} prop
 * */

export default defineComponent({
  name: 'FolderTree',
  components: { ListElementV2, IconDuotoneViewFolder, IconDuotoneStatusDataset },
  props: {
    subFolder: {
      type: Object as () => V2DatasetFolderPayload,
      required: true
    },
    treeLevel: {
      type: Number,
      required: true
    }
  },
  setup (props, context: SetupContext) {
    const folderChilds = computed(() => {
      if (props.subFolder.children && props.subFolder.children.length > 0) {
        return props.subFolder.children
      } else {
        return []
      }
    })

    const pathName = computed(() => {
      if (props.subFolder.path === '/') { return '/' }
      return props.subFolder.path.split('/')[props.treeLevel]
    })

    const getChildLength = () => {
      /* seeks for children inside DatasetFolderPayload, if exist, increase length by 1 for each
      * child inside children - then repeat */
      let length = 0

      const _ = (folder: V2DatasetFolderPayload) => {
        if (folder.children && folder.children.length > 0) {
          folder.children.forEach(c => {
            length += 1
            _(c)
          })
        }
      }

      _(props.subFolder)

      return length
    }

    onMounted(() => {
      const rootEl = document.querySelectorAll(`[id="folder-tree-${props.treeLevel}"]`)
      if (!rootEl) { return }

      /* need to neutralize css offset via math so each child has an equal margin to the side */
      const baseOffsetLeft = 18
      const currentLevel = props.treeLevel
      const base = baseOffsetLeft * currentLevel
      const neutralizer = currentLevel >= 1 ? (currentLevel - 1) * baseOffsetLeft : 0
      const total = base - neutralizer

      Array.from(rootEl).forEach(el => {
        (el as HTMLDivElement).style.marginLeft = `${total}px`
      })
    })

    return {
      getChildLength,
      folderChilds,
      pathName,
      props,
      context
    }
  }
})
</script>

<style lang="scss" scoped>
.folder-tree {
  display: block;
  background-color: transparent;

  &[data-has-child="true"] {
    & > button {
      position: relative;

      &::after {
        position: absolute;
        bottom: calc(-30px * var(--childs));
        left: 16px;
        display: block;
        content: '';

        width: 1px;
        height: calc(30px * var(--childs));

        background-color: $colorNeutralsLight100;
      }
    }
  }

  /*&[data-tree-level="0"] {
    & > button {
      background-color: red;
    }
  }*/
}
</style>
