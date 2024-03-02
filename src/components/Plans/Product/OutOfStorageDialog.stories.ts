import Vue from 'vue'

import Abilities from '@/plugins/abilities'
import router from '@/router'
import store from '@/store'

import OutOfStorageDialog from './OutOfStorageDialog.vue'

const stories = {
  title: 'Billing/OutOfStorageDialog',
  argTypes: {}
}

type Args = Record<keyof typeof stories.argTypes, any>
type Opts = { argTypes: typeof stories.argTypes }

Vue.use(Abilities, store)

export const Default = (args: Args, { argTypes }: Opts) => Vue.extend({
  components: { OutOfStorageDialog },
  props: Object.keys(argTypes),
  store,
  router,
  mounted () {
    this.show()
  },
  methods: {
    show () {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
    }
  },
  template: `
    <div>
      <out-of-storage-dialog />
      <primary-button @click="show">Open</primary-button>
    </div>
  `
})
