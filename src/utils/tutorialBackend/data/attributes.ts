import { v4 as uuidv4 } from 'uuid'

import { AttributePayload } from '@/store/types'

import { horse, gauge } from './annotationClasses'

export const horseWhite: AttributePayload = {
  class_id: horse.id,
  color: 'rgba(255,255,255,1.0)',
  id: uuidv4(),
  name: 'White'
}

export const horseBrown: AttributePayload = {
  class_id: horse.id,
  color: 'rgba(191,117,17, 1.0)',
  id: uuidv4(),
  name: 'Brown'
}

export const horseBlack: AttributePayload = {
  class_id: horse.id,
  color: 'rgba(110,110,110,1.0)',
  id: uuidv4(),
  name: 'Black'
}

export const gaugePressure: AttributePayload = {
  class_id: gauge.id,
  color: 'rgba(255,182,130, 1.0)',
  id: uuidv4(),
  name: 'Pressure'
}
