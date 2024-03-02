import { LoadedImageWithTiles } from './LoadedImageWithTiles'

export interface DatasetImage {
  id: number;
  image: LoadedImageWithTiles;
  seq: number;
  set: number;
}
