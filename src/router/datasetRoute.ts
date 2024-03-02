import { RouteConfig } from 'vue-router'

const DatasetManagement = () => import(
  '@/views/datasets/detail/DatasetManagement/DatasetManagement.vue'
  /* webpackChunkName: "darwin" */
)

const DatasetManagementData = () => import(
  '@/views/datasets/detail/DatasetManagement/DatasetManagementData.vue'
  /* webpackChunkName: "darwin" */
)

const DatasetManagementVideo = () => import(
  '@/views/datasets/detail/DatasetManagement/DatasetManagementVideo.vue'
  /* webpackChunkName: "darwin" */
)

const meta = { requiresAuth: true, requiresAbility: 'view_full_datasets' }

const datasetManagementRoute: RouteConfig = {
  path: 'dataset-management',
  component: DatasetManagement,
  children: [
    {
      name: 'DatasetManagementData',
      path: '',
      component: DatasetManagementData,
      meta
    },
    { path: 'data', redirect: { name: 'DatasetManagementData' }, meta },
    {
      name: 'DatasetManagementVideo',
      path: ':datasetVideoId',
      component: DatasetManagementVideo,
      meta
    },
    {
      name: 'DatasetManagementFolderData',
      path: 'tree/:path+',
      component: DatasetManagementData,
      meta
    }
  ],
  meta
}

const DetailView = () => import(
  '@/views/datasets/detail/Detail.vue'
  /* webpackChunkName: 'darwin' */
)

const OverviewView = () => import(
  '@/views/datasets/detail/Overview/Overview.vue'
  /* webpackChunkName: "darwin" */
)

const DatasetClassesView = () => import(
  '@/views/datasets/detail/DatasetClasses/DatasetClassesVersionSwitch.vue'
  /* webpackChunkName: "darwin" */
)

// separate chunk because it relies on froala, which is a big chunk of js on it's own
const SettingsView = () => import(
  '@/views/datasets/detail/Settings/DatasetSettingsVersionSwitch.vue'
  /* webpackChunkName: "darwin" */
)

const datasetDetailsRoute: RouteConfig = {
  path: '/datasets/:datasetId',
  component: DetailView,
  children: [
    { path: 'overview', name: 'DatasetOverview', component: OverviewView, meta },
    { path: 'classes', name: 'DatasetClasses', component: DatasetClassesView, meta },
    datasetManagementRoute,
    { path: 'settings', name: 'DatasetSettings', component: SettingsView, meta }
  ],
  meta
}

export default datasetDetailsRoute
