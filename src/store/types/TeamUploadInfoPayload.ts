/**
 * Backend returns this payload when requesting info to upload files within a team
 */
export type TeamUploadInfoPayload = {
  /**
   * UUID of the upload. Not really persisted in any way
   */
  id: string

  /**
   * Upload location of the file (S3 key)
   */
  key: string

  /**
   * ID of the team this upload is associated to.
   * The key and url will be scoped to the team slug or id.
   */
  // eslint-disable-next-line camelcase
  team_id: number

  /**
   * Type of upload. Indicates what the file being uploaded is used for
   */
  type: 'annotation_class'

  /**
   * Signed URL (from key) used to upload the file
   */
  // eslint-disable-next-line camelcase
  upload_url: string

  /**
   * Signed URL (from key) used to read the file
   */
  url: string
}
