/**
 * Lists all supported storage provider types
 */
export enum StorageProvider {
  /**
   * Amazon s3 storage
   */
  AWS = 'aws',
  /**
   * GCP storage
   */
  GCP = 'gcp',
  /**
   * Azure storage
   */
  Azure = 'azure',

  /**
   * Minio storage
   */
  Minio = 'minio'
}
