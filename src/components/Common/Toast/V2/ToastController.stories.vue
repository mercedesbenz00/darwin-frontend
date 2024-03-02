<template>
  <div>
    <custom-button
      @click.native="
        $toast.error({
          meta: {
            title: 'This action could not be performed',
            desc:
              'Sorry, you first have to assign a Dataset to the stage in order to save a workflow.'
          },
          duration: Number(durationVal),
          location: value,
        })
      "
    >
      Mount Error
    </custom-button>
    <custom-button
      @click.native="
        $toast.success({
          meta: {
            title: 'This action could not be performed',
            desc:
              'Sorry, you first have to assign a Dataset to the stage in order to save a workflow.'
          },
          duration: Number(durationVal),
          location: value,
        })
      "
    >
      Mount Success
    </custom-button>
    <custom-button
      @click.native="
        $toast.warning({
          meta: {
            title: 'This action could not be performed',
            desc:
              'Sorry, you first have to assign a Dataset to the stage in order to save a workflow.'
          },
          duration: Number(durationVal),
          location: value,
        })
      "
    >
      Mount Warning
    </custom-button>
    <custom-button
      @click.native="
        $toast.info({
          meta: {
            title: 'This action could not be performed',
            desc:
              'Sorry, you first have to assign a Dataset to the stage in order to save a workflow.'
          },
          duration: Number(durationVal),
          location: value,
        })
      "
    >
      Mount Info
    </custom-button>
    <custom-button
      @click.native="
        $toast.info({
          meta: {
            title: 'This action could not be performed',
            desc:
              'Sorry, you first have to assign a Dataset to the stage in order to save a workflow.'
          },
          duration: Number(durationVal),
          location: value,
          extended: true,
          callToAction: [
            {
              label: 'Learn more',
              action: () => {}
            },
            {
              label: 'Try again',
              action: () => {}
            }
          ]
        })
      "
    >
      Mount Extended Info
    </custom-button>
    <p>Position: bottom-left | bottom-right | top-left | top-right</p>
    <input-field
      :value="value"
      @change="(val) => value = val"
    />
    <p>Duration until unmount (in ms)</p>
    <input-field
      :value="durationVal"
      @change="(val) => durationVal = val"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { CustomButton } from '@/components/Common/Button/V2'
import { InputField } from '@/components/Common/InputField/V2'

@Component({
  name: 'toast-controller',
  components: { CustomButton, InputField }
})
export default class ToastController extends Vue {
  value: string = 'bottom-right'
  durationVal: string = '3000'
}
</script>
