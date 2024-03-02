<template>
  <type-details>
    <h3>Auto-Annotate</h3>
    <p>
      Improves the performance of Auto-Annotate on a dataset by training it on annotated examples.
    </p>
    <p>
      Training Auto-Anntoate will often allow it to create perfect segmentations
      without the need of additional clicks.
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
  name: 'auto-annotate-details',
  components: { TypeDetails, TypeIcon }
})
export default class AutoAnnotateDetails extends Vue {
  get iconColor () {
    return this.$theme.getColor('colorFeatherLight')
  }
}
</script>
