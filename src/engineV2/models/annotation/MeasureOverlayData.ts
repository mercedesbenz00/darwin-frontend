import { CanvasPoint } from '@/engineCommon/point'
import { MeasureUnit } from '@/store/types'

export interface MeasureOverlayItem {
  /**
   * HOR to center the text horizontally
   * VER to center the text vertically
   */
  center: 'HOR' | 'VER',
  position: CanvasPoint;
  value: string;
  unit: MeasureUnit | '';
}

export interface MeasureOverlayData {
  id: string;
  color: string;
  label: string;
  measures: MeasureOverlayItem[];
}
