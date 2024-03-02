<template>
  <div class="key">
    <div class="key__value">
      Your access key:
      <span class="key__value__span">{{ value }}</span>
    </div>
    <copy-to-clipboard
      class="key__copy-button"
      :value="value"
    />
    <p class="key__notice">
      Please write down your key as it cannot be retrieved in the future.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import CopyToClipboard from '@/components/Common/CopyToClipboard.vue'

/**
 * Used to render the section containing the string value for a created key,
 * combined with a copy to clipboard button.
 */
@Component({ name: 'created-key', components: { CopyToClipboard } })
export default class CreatedKey extends Vue {
  @Prop({ required: true, type: String })
  value!: string
}
</script>

<style lang="scss" scoped>
.key {
  @include row--distributed;
  flex-wrap: wrap;
}

.key__value {
  @include typography(lg, default, normal)
}

.key__value__span {
  font-family: "FiraMono";
  padding: 3px 5px;
  background-color: $colorSecondaryLight2;
  border-radius: 3px;
  margin-left: 3px;
}

.key__notice {
  flex-basis: 100%;
  @include typography(md-1, default, bold);

  margin-top: 10px;
  margin-bottom: 25px;
}
</style>
