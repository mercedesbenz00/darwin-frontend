import { sandboxAxiosInstance } from './api'

export type FactoryRecord = { id: number }

export class Factory {
  sandboxId: string
  api: ReturnType<typeof sandboxAxiosInstance>

  constructor (sandboxId: string) {
    this.sandboxId = sandboxId
    this.api = sandboxAxiosInstance(this.sandboxId)
  }

  /**
   * Create a record on the backend, or batch create a list of records, where
   * each record is created with different attributtes.
   *
   * If there is no need for records to have different attributes when creating
   * a list of them, use `createList` instead, since it's faster.
   *
   * The response is a payload returned from the backend
   *
   * - created users will include id, email, first and last name
   * - created invitations will include token
   * - other records will include just the id
   *
   * @param {String} schema The type of record to create on the backend
   * @param {Object | Array<Object>} attributes
   */
  async create (schema, attributes = {}) {
    const { data } = await this.api.post('/factory', { schema, attributes })
    return data
  }

  /**
   * Batch create a collection of records on the backend, all sharing the same
   * schema and attributes.
   *
   * Attributes which are not specified will be auto-generated and different
   * for each record.
   *
   * This is the fastest way to create multiple records of the same type on
   * the backend.
   * @param {String} schema Type of records to create
   * @param {Integer} count Amount of records to create
   * @param {Object} attributes Attributes the records will share
   */
  async createList (schema, count, attributes = {}) {
    const { data } = await this.api.post('/factory', { schema, count, attributes })
    return data
  }

  /**
   * Creates a dataset and dataset on the backend, owned by the specified `team`,
   * containing some basic annotation classes, as well as holding a total of
   * `imageCount`  unassigned images.
   *
   * `imageCount` will default to 10 if not specified.
   *
   * @param {*} team The team to create the dataset for
   * @param {*} imageCount Number of images to create in the dataset
   */
  async seed (team, imageCount = 10) {
    // create data for a dataset with 10 images and 2 annotation classes
    const dataset = await this.create('dataset', { team })
    const datasetImages = await this.createList('dataset_image', imageCount, { dataset })
    const datasetImageTaskStatuses = await this.create(
      'dataset_image_task_status',
      datasetImages.map(di => ({ dataset_image: di, task: null }))
    )
    const polygon = await this.create('polygon_annotation_class', { name: 'Flask', dataset })
    const boundingBox =
      await this.create('bounding_box_annotation_class', { name: 'Scale', dataset })

    return {
      dataset,
      datasetImages,
      datasetImageTaskStatuses,
      annotationClasses: [polygon, boundingBox]
    }
  }
}

export function createFactory (sandboxId) {
  return new Factory(sandboxId)
}
