<template>
  <div class="workflow__work-size">
    <div class="workflow__work-size__label">
      <label>Task batch size</label>
      <info>
        When a worker requests a batch of sequential images to work on,
        how many do they get?
      </info>
    </div>
    <div class="workflow__work-size__input">
      <input-field
        ref="workSize"
        v-model="localWorkSize"
        v-tooltip="{
          content: 'The maximum number of images annotators can request',
          placement: 'bottom'
        }"
        type="number"
        name="workSize"
        min="1"
        max="100"
        required="required"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'

@Component({
  name: 'workflow-work-size',
  components: { Info, InputField }
})
export default class WorkflowWorkSize extends Vue {
  @Prop({ required: true })
  value!: number

  $refs!: {
    workSize: InputField
  }

  get localWorkSize (): string {
    return this.value.toString()
  }

  set localWorkSize (val: string) {
    this.$emit('input', parseInt(val))
  }

  setError (error: string): void {
    this.$refs.workSize.setError(error)
  }
}
</script>

<style lang="scss" scoped>
.workflow__work-size {
  width: 100%;
  @include row--distributed;
  align-items: center;
}

.workflow__work-size__label {
  @include row;
  @include typography(md-1);
  color: $colorSecondaryDark1;
  flex: 3;
}

.workflow__work-size__label label {
  margin-right: 15px;
}

.workflow__work-size__input {
  width: 5rem;

  :deep(.inputfield__error) {
    @include ellipsis(1, md);
    right: 0;
    left: auto;
  }
}
</style>
