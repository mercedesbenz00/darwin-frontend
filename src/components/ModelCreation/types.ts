import { ModelType } from '@/store/types'

export type ModelTypeDefinition = {
  /**
   * Holds vue component used to render the description of the type,
   * in the sidebar during model creation.
   *
   * Allows us to write the details as HTML, rather than dealing with
   * building the HTML ourselves, from string data.
   */
  details: string
  id: ModelType
  makes: string
  name: string
  uses: string[]
}

export type ModelTypeInfo = ModelTypeDefinition & {
  available: boolean
  mostAccurate: boolean
}
