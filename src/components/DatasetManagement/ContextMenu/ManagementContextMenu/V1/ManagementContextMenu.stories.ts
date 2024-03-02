import Vue from 'vue'

import router from '@/router'
import store from '@/store'
import { Ability, DatasetItemStatus } from '@/store/types'
import { items } from '@/storybook/fixtures/datasetItems'
import { sfh } from '@/storybook/fixtures/datasets'

import ManagementContextMenuComponent from './ManagementContextMenu.vue'

const stories = {
  title: 'DatasetManagement/ContextMenu'
}

const deleteAbility: Ability = {
  actions: ['archive_dataset_items', 'delete_dataset_items'],
  subject: 'all'
}

export default stories

export const Default = () => Vue.extend({
  components: { ManagementContextMenu: ManagementContextMenuComponent },
  props: { dataset: { type: Object, default: () => {} } },
  store,
  router,
  beforeMount () {
    store.commit('dataset/RESET_ALL')
    store.commit('dataset/PUSH_DATASET_ITEMS', items)
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('auth/RESET_ALL')
    store.commit('auth/SET_ABILITIES', [deleteAbility])
  },
  template: '<management-context-menu :dataset="dataset" />'
})

Default.args = {
  dataset: sfh
}

export const Deletable = () => Vue.extend({
  components: { ManagementContextMenu: ManagementContextMenuComponent },
  props: { dataset: { type: Object, default: () => {} } },
  store,
  router,
  beforeMount () {
    const archivedItems =
      items.map(i => ({ ...i, archived: true, status: DatasetItemStatus.archived }))

    store.commit('dataset/RESET_ALL')
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.archived] })
    store.commit('dataset/PUSH_DATASET_ITEMS', archivedItems)
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)

    store.commit('auth/RESET_ALL')
    store.commit('auth/SET_ABILITIES', [deleteAbility])
  },
  template: '<management-context-menu :dataset="dataset" />'
})

Deletable.args = {
  dataset: sfh
}
