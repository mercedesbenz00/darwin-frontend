import { AnnotationTypePayload } from '@/store/types'

export const attributes: AnnotationTypePayload = {
  data_skeleton: { _type: 'map', attributes: { _item: { _type: 'string' }, _type: 'array' } },
  // eslint-disable-next-line max-len
  description: 'Add a description tag to an annotation. This may be an adjective, such as "standing", a categorized tag such as "color:red", or a piece of text to train OCR on.',
  granularity: 'sub',
  id: 100,
  metadata_skeleton: { _type: 'map' },
  name: 'attributes',
  subs: [],
  visible: true
}

export const autoAnnotate: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    clicks: {
      _type: 'array',
      _item: {
        _type: 'map',
        x: { _type: 'float' },
        y: { _type: 'float' },
        type: { _type: 'string' }
      }
    },
    bbox: {
      _type: 'map',
      x1: { _type: 'float' },
      x2: { _type: 'float' },
      y1: { _type: 'float' },
      y2: { _type: 'float' }
    },
    model: { _type: 'string' }
  },
  description: 'Redo auto annotate on polygons.',
  granularity: 'sub',
  id: 101,
  metadata_skeleton: { _type: 'map' },
  name: 'auto_annotate',
  subs: [],
  visible: true
}

export const instanceId: AnnotationTypePayload = {
  data_skeleton: { _type: 'map', value: { _type: 'integer' } },
  description: 'An integer uniquely identifying an instance in a dataset.',
  granularity: 'sub',
  id: 102,
  metadata_skeleton: { _type: 'map' },
  name: 'instance_id',
  subs: [],
  visible: true
}

export const text: AnnotationTypePayload = {
  data_skeleton: { _type: 'map', text: { _type: 'string' } },
  description: 'Free text to train OCR on.',
  granularity: 'sub',
  id: 103,
  metadata_skeleton: { _type: 'map' },
  name: 'text',
  subs: [],
  visible: true
}

export const directionalVector: AnnotationTypePayload = {
  data_skeleton: { _type: 'map', angle: { _type: 'float' }, length: { _type: 'float' } },
  description: 'Define the orientation of an object by adding a two-dimensional arrow.',
  granularity: 'sub',
  id: 104,
  metadata_skeleton: { _type: 'map' },
  name: 'directional_vector',
  subs: [],
  visible: true
}

export const tag: AnnotationTypePayload = {
  data_skeleton: { _type: 'map' },
  description: 'Quickly annotate an entire image as being of a certain class.',
  granularity: 'main',
  id: 105,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'tag',
  subs: [],
  visible: true
}

export const boundingBox: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    h: { _type: 'float' },
    w: { _type: 'float' },
    x: { _type: 'float' },
    y: { _type: 'float' }
  },
  // eslint-disable-next-line max-len
  description: 'Quickly annotate images or video frames with pixel-accurate bounding boxes. You can copy them over to the next frame, link them to a polygon segmentation, or just train a detector using this fast and easy tool.',
  granularity: 'main',
  id: 106,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'bounding_box',
  subs: [attributes, instanceId, text],
  visible: true
}

export const polygon: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    path: { _item: { _type: 'map', x: { _type: 'float' }, y: { _type: 'float' } }, _type: 'array' }
  },
  // eslint-disable-next-line max-len
  description: 'Define the shape of objects both for semantic or instance segmentation. You can change their order, add or remove points, or segment video frames right from your browser.',
  granularity: 'main',
  id: 107,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'polygon',
  subs: [attributes, autoAnnotate, directionalVector, instanceId, text],
  visible: true
}

export const cuboid: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    path: {
      front: {
        _type: 'map',
        x: { _type: 'float' },
        y: { _type: 'float' },
        w: { _type: 'float' },
        h: { _type: 'float' }
      },
      back: {
        _type: 'map',
        x: { _type: 'float' },
        y: { _type: 'float' },
        w: { _type: 'float' },
        h: { _type: 'float' }
      },
      _type: 'map'
    }
  },
  // eslint-disable-next-line max-len
  description: 'Define the 6d pose of an object. Our Cuboid Tool can define size, depth, skew, and rotation of cuboids, giving you the ability to annotate objects on flat planes or mid-air in four clicks.',
  granularity: 'main',
  id: 108,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'cuboid',
  subs: [attributes, text],
  visible: true
}

export const line: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    path: {
      _item: { _type: 'map', x: { _type: 'float' }, y: { _type: 'float' } },
      _type: 'array'
    }
  },
  // eslint-disable-next-line max-len
  description: 'Quickly annotate images or video frames with pixel-accurate bounding boxes. You can copy them over to the next frame, link them to a polygon segmentation, or just train a detector using this fast and easy tool.',
  granularity: 'main',
  id: 109,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'line',
  subs: [attributes, instanceId, text],
  visible: true
}

export const ellipse: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    angle: { _type: 'float' },
    center: { _type: 'map', x: { _type: 'float' }, y: { _type: 'float' } },
    radius: { _type: 'map', x: { _type: 'float' }, y: { _type: 'float' } }
  },
  description: 'Define the shape of elliptical objects.',
  granularity: 'main',
  id: 110,
  metadata_skeleton: { _color: { _type: 'string' }, _type: 'map' },
  name: 'ellipse',
  subs: [attributes, instanceId, text],
  visible: true
}

export const skeleton: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    nodes: {
      _item: {
        name: { _type: 'string' },
        occluded: { _type: 'boolean' },
        x: { _type: 'float' },
        y: { _type: 'float' },
        _type: 'map'
      },
      _type: 'array'
    }
  },
  description: 'A graph representing a hierarchy of keypoints',
  granularity: 'main',
  id: 111,
  metadata_skeleton: {
    _color: {
      _type: 'string'
    },
    _type: 'map',
    edges: {
      _item: {
        _type: 'map',
        from: {
          _type: 'string'
        },
        to: {
          _type: 'string'
        }
      },
      _type: 'array'
    },
    nodes: {
      _item: {
        _type: 'map',
        name: {
          _type: 'string'
        },
        x: {
          _type: 'float'
        },
        y: {
          _type: 'float'
        }
      },
      _type: 'array'
    }
  },
  name: 'skeleton',
  subs: [attributes, instanceId, text],
  visible: true
}

export const keypoint: AnnotationTypePayload = {
  data_skeleton: {
    _type: 'map',
    x: {
      _type: 'float'
    },
    y: {
      _type: 'float'
    }
  },
  description: 'Quickly annotate images or video frames with keypoints.',
  granularity: 'main',
  id: 112,
  metadata_skeleton: {
    _color: {
      _type: 'string'
    },
    _type: 'map'
  },
  name: 'keypoint',
  subs: [],
  visible: true
}
