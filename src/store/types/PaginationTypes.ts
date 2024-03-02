// eslint-disable-next-line camelcase
export type PageMetadata = { next: string | null, previous: string | null }

export type PageMetadataV2 = { next: string | null, previous: string | null, count: number }

/** Defines structure of response for a resource which, on the backend, uses pagination */
export type PagedApiResponse<T> = { items: T[], metadata: PageMetadata }

export type PagedApiV2Response<T> = { items: T[], page: PageMetadataV2 }

/** Structure of pagination parameters used to send a pagination request to the API */
export type PaginationParams =
  {
    // eslint-disable-next-line camelcase
    contains_seq?: number,
    size?: number,
    offset?: number,
    to?: string,
    from?: string
  }
