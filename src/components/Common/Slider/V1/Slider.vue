<template>
  <vue-slider
    ref="slider"
    v-model="model"
    v-bind="sliderOptions"
  >
    <slot
      v-for="(_, name) in $slots"
      :slot="name"
      :name="name"
    />
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData"
      />
    </template>
  </vue-slider>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import vueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

@Component({
  name: 'slider',
  components: { vueSlider }
})
export default class Slider extends Vue {
  @Prop({ required: true })
  value!: number

  @Prop({ required: false, type: Object, default: () => ({}) })
  options!: any

  defaultOptions = {
    eventType: 'auto',
    width: '100%',
    height: 10,
    dotSize: 25,
    min: 0,
    max: 100,
    interval: 1,
    show: true,
    speed: 0.5,
    tooltip: 'always',
    tooltipPlacement: 'top',
    railStyle: {
      background: 'url("/static/imgs/slider-track/grite-dark.svg")',
      backgroundPosition: 'center',
      backgroundSize: 'cover'
    },
    dotStyle: {},
    processStyle: {
      background: 'transparent'
    },
    tooltipStyle: {}
  }

  get sliderOptions () {
    return {
      ...this.defaultOptions,
      ...this.options
    }
  }

  get model () {
    return this.value
  }

  set model (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }
}
</script>
