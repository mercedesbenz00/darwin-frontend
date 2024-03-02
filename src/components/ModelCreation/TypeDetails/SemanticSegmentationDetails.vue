<template functional>
  <type-details>
    <h3>Semantic Segmentation</h3>
    <p>
      Paints each pixel belonging to a class of that respective class's color.
      The resulting segments are provided as polygons.
    </p>
    <p>
      Unlike instance segmentation, semantic classes don't
      distinguish two adjacent objects from one another.
    </p>
    <p>
      This network type is ideal for entities with inconsistent shapes,
      but predictable textures such as roads, walls, grass, or water.
    </p>
    <div class="input-output">
      <label>Uses:</label>
      <div>
        <type-icon
          type="polygon"
          :color="iconColor"
        />
      </div>
      <label>Makes:</label>
      <div>
        <type-icon
          type="polygon"
          :color="iconColor"
        />
      </div>
    </div>
  </type-details>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'

import TypeDetails from './TypeDetails.vue'

@Component({
  name: 'semantic-segmentation-details',
  components: { TypeDetails, TypeIcon }
})
export default class SemanticSegmentationDetails extends Vue {
  get iconColor () {
    return this.$theme.getColor('colorFeatherLight')
  }
}
</script>
