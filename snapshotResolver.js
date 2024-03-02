const path = require('path')

module.exports = {
  testPathForConsistencyCheck: 'some/example.test.js',

  resolveSnapshotPath: (testPath, snapshotExtension) => {
    if (testPath.includes('/test\/unit\/')) {
      const filename = path.basename(testPath)
      const dirname = path.dirname(testPath)
      return path.resolve(dirname, '__snapshots__', filename + snapshotExtension)
    }

    return testPath.replace(/\.test\.([tj]sx?)/, `.test.$1${snapshotExtension}`)
  },

  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    if (snapshotFilePath.includes('/test/unit/')) {
      const filename = path.basename(snapshotFilePath)
      const dirname = path.dirname(snapshotFilePath)
      return path.resolve(dirname, '..', filename.slice(0, -snapshotExtension.length))
    }

    return snapshotFilePath.replace(snapshotExtension, '')
  }
}
