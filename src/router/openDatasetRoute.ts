import { RouteConfig } from 'vue-router'

const OpenDataset = () => import(
  '@/views/open-datasets/OpenDataset.vue'
  /* webpackChunkName: "darwin" */
)

const OpenDatasetData = () => import(
  '@/views/open-datasets/OpenDatasetData.vue'
  /* webpackChunkName: "darwin" */
)

const OpenDatasetDataVideo = () => import(
  '@/views/open-datasets/OpenDatasetVideo.vue'
  /* webpackChunkName: "darwin" */
)

const managementRoute: RouteConfig = {
  path: '',
  component: OpenDataset,
  children: [
    {
      name: 'OpenDatasetData',
      path: '',
      component: OpenDatasetData
    },
    {
      name: 'OpenDatasetDataVideo',
      path: 'videos/:datasetVideoId',
      component: OpenDatasetDataVideo
    },
    {
      name: 'OpenDatasetFolderData',
      path: 'tree/:path+',
      component: OpenDatasetData
    }
  ]
}

const openDatasetRoute: RouteConfig = {
  path: '/:teamSlug/:datasetSlug',
  component: () => import(
    '@/views/open-datasets/MainView.vue'
    /* webpackChunkName: "darwin" */
  ),
  meta: {},
  children: [
    managementRoute,
    {
      path: 'overview',
      name: 'OpenDatasetOverview',
      component: () => import(
        '@/views/open-datasets/OpenDatasetOverview.vue'
        /* webpackChunkName: "darwin" */
      )
    },
    {
      path: ':datasetImageSeq',
      name: 'OpenDatasetImageView',
      meta: { layout: 'empty' },
      component: () => import(
        '@/views/open-datasets/DatasetImageView.vue'
        /* webpackChunkName: "darwin" */
      )
    }
  ]
}

export default openDatasetRoute
