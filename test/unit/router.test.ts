import router from '@/router'

it('resolves /admin/teams', () => {
  const resolved = router.resolve('/admin/teams')

  expect(resolved.route.path).toEqual('/admin/teams')
  expect(resolved.route.name).toEqual('TeamsIndex')
})

it('resolves /admin/teams/:id', () => {
  const resolved = router.resolve('/admin/teams/1')

  expect(resolved.route.path).toEqual('/admin/teams/1')
  expect(resolved.route.name).toEqual('TeamsShow')
  expect(resolved.route.params.teamId).toEqual('1')
})

it('resolves /:teamSlug/:datasetSlug', () => {
  const resolved = router.resolve('/v7/sfh')

  expect(resolved.route.path).toEqual('/v7/sfh')
  expect(resolved.route.name).toEqual('OpenDatasetData')
  expect(resolved.route.params.teamSlug).toEqual('v7')
  expect(resolved.route.params.datasetSlug).toEqual('sfh')
})

it('resolves /:teamSlug/:datasetSlug/videos/:datasetVideoId', () => {
  const resolved = router.resolve('/v7/sfh/videos/1')

  expect(resolved.route.path).toEqual('/v7/sfh/videos/1')
  expect(resolved.route.name).toEqual('OpenDatasetDataVideo')
  expect(resolved.route.params.teamSlug).toEqual('v7')
  expect(resolved.route.params.datasetSlug).toEqual('sfh')
  expect(resolved.route.params.datasetVideoId).toEqual('1')
})

it('resolves /:teamSlug/:datasetSlug/:datasetImageSeq', () => {
  const resolved = router.resolve('/v7/sfh/1')

  expect(resolved.route.path).toEqual('/v7/sfh/1')
  expect(resolved.route.name).toEqual('OpenDatasetImageView')
  expect(resolved.route.params.teamSlug).toEqual('v7')
  expect(resolved.route.params.datasetSlug).toEqual('sfh')
  expect(resolved.route.params.datasetImageSeq).toEqual('1')
})

describe('/datasets/:datasetId', () => {
  const resolved = router.resolve('/datasets/1')

  it('redirects to dataset management', () => {
    expect(resolved.route.path).toEqual('/datasets/1/dataset-management')
    expect(resolved.route.name).toEqual('DatasetManagementData')
  })

  it('resolves', () => {
    expect(resolved.route.params.datasetId).toEqual('1')
  })
})

it('resolves /datasets/:datasetId/dataset-management', () => {
  const resolved = router.resolve('/datasets/1/dataset-management')

  expect(resolved.route.path).toEqual('/datasets/1/dataset-management')
  expect(resolved.route.name).toEqual('DatasetManagementData')
  expect(resolved.route.params.datasetId).toEqual('1')
})

it('resolves /datasets/:datasetId/dataset-management/:datasetVideoId', () => {
  const resolved = router.resolve('/datasets/1/dataset-management/2')

  expect(resolved.route.path).toEqual('/datasets/1/dataset-management/2')
  expect(resolved.route.name).toEqual('DatasetManagementVideo')
  expect(resolved.route.params.datasetId).toEqual('1')
  expect(resolved.route.params.datasetVideoId).toEqual('2')
})

it('resolves /annotators', () => {
  const resolved = router.resolve('/annotators')

  expect(resolved.route.path).toEqual('/annotators')
  expect(resolved.route.name).toEqual('Annotators')
})

it('resolves /login-2fa', () => {
  const resolved = router.resolve('/login-2fa')

  expect(resolved.route.path).toEqual('/login-2fa')
  expect(resolved.route.name).toEqual('LoginTfa')
})

it('resolves /setup-2fa', () => {
  const resolved = router.resolve('/setup-2fa')

  expect(resolved.route.path).toEqual('/setup-2fa')
  expect(resolved.route.name).toEqual('SetupTfa')
})
