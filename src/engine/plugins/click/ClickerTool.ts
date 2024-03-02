import { v4 as uuidv4 } from 'uuid'

import { EditorCursor } from '@/engine/EditorCursor'
import { addAnnotationsAction } from '@/engine/actions/addAnnotationsAction'
import { Editor } from '@/engine/editor'
import { calcCentroid, drawDashedBox } from '@/engine/graphics'
import { ActionGroup } from '@/engine/managers'
import { Tool, ToolContext } from '@/engine/managers/toolManager'
import {
  Annotation,
  AnnotationData,
  AutoAnnotateData,
  NormalizedInferenceData,
  StreamView
} from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { Polygon } from '@/engine/plugins/polygon/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { euclideanDistance, maybeSimplifyPolygon } from '@/engineCommon/algebra'
import { Click, InferenceResult } from '@/engineCommon/backend'
import { CallbackStatus } from '@/engineCommon/callbackHandler'
import { Camera } from '@/engineCommon/camera'
import { POINT_CLICK_THRESHOLD } from '@/engineCommon/constants'
import { CanvasPoint, ImagePoint, IPoint, Point, pointInPath } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { RunningSessionPayload } from '@/store/types'
import { onMacOS } from '@/utils'
import { isLeftMouseButton } from '@/utils/mouse'
import { CanvasEvent, resolveEventPoint } from '@/utils/touch'

import { HEADER_COMPONENT, SPINNER_COMPONENT } from './consts'
import { CornerInfo, Model, PointMapping } from './types'
import {
  addInferredAnnotation,
  buildAutoAnnotateRequestPayload,
  drawClick,
  drawOverlay,
  drawPendingClick,
  findEditableCorner,
  findEditableEdge,
  getImagePayload,
  isPreselectedModelAutoAnnotate,
  payloadRelativeToCentroid,
  remapInferenceResult,
  resolveAnnotationPath,
  resolveClick,
  resolvePolygonPath,
  selectCornerCursor,
  transitionToAction,
  updateClickerData
} from './utils'

const mappingOnRectangle = <T>(rect: Rectangle<T>, mapping: PointMapping<T>): Rectangle<T> =>
  new Rectangle<T>(mapping.forward(rect.topLeft), mapping.forward(rect.bottomRight))

const findClick = (
  context: ToolContext,
  currentClicks: Click[],
  point: CanvasPoint
): Click | undefined => {
  for (const click of [...currentClicks].reverse()) {
    const canvasPoint =
      context.editor.camera.imageViewToCanvasView(new Point({ x: click.x, y: click.y }))
    if (euclideanDistance(point, canvasPoint) < 5) {
      return click
    }
  }
}

export class ClickerTool implements Tool {
  initialPoint?: ImagePoint
  cursorPoint?: ImagePoint
  currentAnnotation?: Annotation
  currentCrop?: Rectangle<'Image'>
  // Keeps the original polygon path before applying the epsilon value
  currentPolygon?: AnnotationData
  currentClicks: Click[] = []
  // Visible clicks are optimistically rendered while waiting for the backend to reply
  currentVisibleClicks: Click[] = []
  pendingClick: Click | null = null
  // Which click is the user currently hovering over
  hoverClick?: Click
  actionGroup?: ActionGroup
  movingCorner?: CornerInfo
  movingPoint?: ImagePoint
  models: Model[] = []
  // uuid to keep track of if inference request are out of date and should be ignored or not.
  instance?: string
  threshold?: number

  context?: ToolContext

  /**
   * When resuming an existing clicker annotation, this holds the original
   * annotation data, before any edits were through the clicker tool.
   *
   * When completing the clicker, we use this to transition to a global action,
   * allowing the undo command to then restore the annotation to the state it
   * was in before the clicker resume happened.
   *
   * See `transitionToAction`
   */
  initialAnnotationData?: Annotation['data']

  constructor (models: Model[]) {
    this.models = models
  }

  /**
   * Adds a click to current clicks and sends an inferrence request.
   *
   * This is used when user adds more click to the clicker bounding box.
   */
  public async sendClicks (context: ToolContext): Promise<void> {
    const {
      currentCrop,
      currentAnnotation,
      cursorPoint,
      currentPolygon,
      pendingClick
    } = this

    if (
      // any of these being false means we haven't sent the initial bounding box,
      // so there is nothing to add clicks to
      !currentAnnotation ||
      !cursorPoint ||
      !currentPolygon ||
      !currentCrop
    ) { return }

    // a click is currently already beeing sent, and we're waiting for a reply
    if (pendingClick) { return }

    const currentPolygonPath = resolvePolygonPath(context, currentPolygon)
    const click = resolveClick(cursorPoint, currentPolygonPath)

    this.pendingClick = click

    const newClicks = [...this.currentClicks, click]
    await this.sendInferenceRequest(context, currentCrop, newClicks)

    this.pendingClick = null
  }

  /**
   * Sends a bounding box and clicks as an inference request.
   *
   * If no clicks are given, it will send using current clicks. This can be used
   * to rerun the previous inference request.
   *
   * Clicks can be given as [] to resend the bounding box alone and effectively
   * clear out all the current clicks.
   */
  public sendBoundingBox (context: ToolContext, clicks?: Click[]): void {
    const { currentClicks, currentCrop } = this

    if (!currentCrop) { return }

    const newClicks = clicks || currentClicks
    this.sendInferenceRequest(context, currentCrop, newClicks)
  }

  private currentItemResolution (editor: Editor): { width: number, height: number } {
    const { activeView, loadedImage, loadedVideo } = editor

    let width = 0
    let height = 0
    if (loadedImage) {
      width = loadedImage.width
      height = loadedImage.height
    } else if (loadedVideo) {
      width = loadedVideo.frames[activeView.currentFrameIndex].hqData?.data.width || 0
      height = loadedVideo.frames[activeView.currentFrameIndex].hqData?.data.height || 0
    }

    return { width, height }
  }

  /**
   * This function is meant to make whole-image inference ('clicker_tool.infer' command)
   * discoverable. If a whole image rectangular crop is drawn to send the entire image for
   * inference, a toast notification pill is shown, hinting the hotkey.
   */
  private hintAboutWholeImageInference (editor: Editor): void {
    const { currentCrop, initialPoint } = this
    const { preselectedAutoAnnotateModel } = editor

    const isInitialPointTopLeft = initialPoint && initialPoint.x <= 0 && initialPoint.y <= 0

    const { width, height } = this.currentItemResolution(editor)
    const wholeImageCrop = new Rectangle(
      new Point<'Image'>({ x: 0, y: 0 }),
      new Point<'Image'>({ x: width, y: height })
    )
    const isCropWholeImage = currentCrop &&
      currentCrop.left === wholeImageCrop.left &&
      currentCrop.top === wholeImageCrop.top &&
      currentCrop.right === wholeImageCrop.right &&
      currentCrop.bottom === wholeImageCrop.bottom

    if (isInitialPointTopLeft && isCropWholeImage) {
      const hotkey = onMacOS() ? '⌘⏎' : 'Ctrl⏎'
      const item = editor.loadedVideo ? 'frame' : 'image'
      const modelName = preselectedAutoAnnotateModel === null
        ? 'a model'
        : preselectedAutoAnnotateModel.name

      editor.store.dispatch('toast/notify', {
        content: `You can use ${hotkey} to send the whole ${item} for inference to ${modelName}.`
      })
    }
  }

  private async sendInferenceRequest (
    context: ToolContext,
    crop: Rectangle<'Image'>,
    clicks: Click[]
  ): Promise<void> {
    // we store the instance (which is an id of ther current clicker UI being rendered)
    // so we can later check if user closed that one and maybe openned a new one
    const { instance, threshold } = this
    const { editor } = context
    try {
      this.setBusy()

      // optimistic UI
      this.currentVisibleClicks = clicks

      // store the model id in case this changes while the request is in progress
      // as we need it both to send the request, as well as later, to build the annotation
      const { id: modelId } = editor.preselectedAutoAnnotateModel || this.models[0]

      const { imagePayload, mapping } = getImagePayload(context, crop)
      const bbox = mappingOnRectangle(crop, mapping)

      const requestPayload = buildAutoAnnotateRequestPayload(
        editor,
        { imagePayload, mapping },
        bbox,
        clicks,
        threshold
      )
      const response = await editor.activeView.runInference(modelId, requestPayload)

      // the user canceled the inference before the callback finished
      if (instance !== this.instance) { return }

      this.hintAboutWholeImageInference(editor)

      if ('data' in response) {
        const { preselectedModelClassMapping, preselectedAutoAnnotateModel } = editor
        if (isPreselectedModelAutoAnnotate(editor)) {
          const { path } = remapInferenceResult(response.data.result, mapping)
          if (path) {
            await addInferredAnnotation(this, modelId, clicks, crop, path)
          }
        } else {
          if (!preselectedAutoAnnotateModel) { return }

          const inferenceResult = response.data.result as InferenceResult[]
          const { trainedModels } = editor.store.state.neuralModel
          const trainedModel = trainedModels.find(tm =>
            tm.id === preselectedAutoAnnotateModel.trained_model_id)
          if (!trainedModel) { return }

          const annotations = []
          const inferredClassLabels: Set<string> = new Set()
          for (let i = 0; i < inferenceResult.length; i++) {
            const inferenceData = remapInferenceResult(inferenceResult[i], mapping)
            const annotation = Annotation.createFromInferenceData(
              editor.activeView,
              inferenceData,
              trainedModel.classes
            )
            if (!annotation) { continue }

            const annotationData = annotation.data as NormalizedInferenceData
            const classMapping = preselectedModelClassMapping.find(m =>
              m.modelClassLabel === annotationData.label)
            if (!classMapping || !classMapping.annotationClassId) {
              inferredClassLabels.add(annotationData.label)
              continue
            }

            const annotationClass = editor.store.state.aclass.classes.find(c =>
              c.id === classMapping.annotationClassId)
            if (!annotationClass) { continue }

            annotation.annotationClass = new AnnotationClass(annotationClass)
            annotations.push(annotation)
          }

          const action = addAnnotationsAction(editor, annotations)
          this.actionGroup = this.actionGroup || context.editor.actionManager.createGroup()
          this.actionGroup.do(action)

          this.notifyUnmappedClasses(editor, preselectedAutoAnnotateModel, inferredClassLabels)
        }
      }
    } finally {
      if (instance === this.instance) {
        this.setNotBusy(context)
      }
    }
  }

  notifyUnmappedClasses (
    editor: Editor,
    model: RunningSessionPayload,
    inferredClassLabels: Set<string>
  ): void {
    if (inferredClassLabels.size > 0) {
      const inferredClassLabelList = [...inferredClassLabels]
      const firstItems = inferredClassLabels.size > 1
        ? inferredClassLabelList.slice(0, 2)
        : [inferredClassLabelList[0]]

      let itemList: string
      if (inferredClassLabels.size === 1) {
        itemList = `${firstItems[0]} class`
      } else if (inferredClassLabels.size === 2) {
        itemList = `${firstItems[0]} and ${firstItems[1]} classes`
      } else {
        itemList = `${firstItems[0]}, ${firstItems[1]} and other classes`
      }
      const content = [
        `${model.name} has detected objects of ${itemList}.`,
        'Use the Map Classes button in the Top Bar of this WorkView',
        'to create annotations from these detections.'
      ].join(' ')

      editor.store.dispatch('toast/notify', { content })
    }
  }

  activate (context: ToolContext): void {
    this.context = context

    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Magic)

    context.editor.registerCommand('clicker_tool.set_threshold', (threshold: number) => {
      this.threshold = threshold
    })

    context.editor.registerCommand('clicker_tool.cancel', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    })

    context.editor.registerCommand('clicker_tool.complete', () => {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    })

    context.editor.registerCommand('clicker_tool.infer', async () => {
      const { width, height } = this.currentItemResolution(context.editor)
      this.currentCrop = new Rectangle(
        new Point<'Image'>({ x: 0, y: 0 }),
        new Point<'Image'>({ x: width, y: height })
      )
      this.updateComponents(context, context.editor.activeView.camera)
      this.render(context, context.editor.activeView)
      await this.sendInferenceRequest(context, this.currentCrop, [])

      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    })

    context.editor.registerCommand('clicker_tool.apply_clicker_epsilon', () => {
      this.applyClickerEpsilon()
      context.editor.activeView.annotationsLayer.changed()
    })

    context.editor.registerCommand(
      'clicker_tool.init',
      (annotation: Annotation, data: AutoAnnotateData) => {
        this.init(context, annotation, data)
      }
    )

    context.handles.push(...context.editor.onMouseDown(e => {
      if (!isLeftMouseButton(e)) { return CallbackStatus.Continue }
      return this.onStart(context, e)
    }))
    context.handles.push(...context.editor.onMouseMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onMouseUp((event) => this.onEnd(context, event)))
    context.handles.push(...context.editor.onTouchStart(event => this.onStart(context, event)))
    context.handles.push(...context.editor.onTouchMove(event => this.onMove(context, event)))
    context.handles.push(...context.editor.onTouchEnd((event) => this.onEnd(context, event)))

    const viewsOnRender = context.editor.viewsList.map(view =>
      view.renderManager.onRender((view) => {
        this.update(context, view.camera)
        this.render(context, view)
      })
    )

    context.handles.push(...viewsOnRender)

    this.update(context, context.editor.camera)
  }

  deactivate (context: ToolContext): void {
    this.setNotBusy(context)
    this.reset(context)
    if (!this.context) { return }
    this.unregisterComponents(this.context)
  }

  reset (context: ToolContext): void {
    transitionToAction(this, context)

    this.initialPoint = undefined
    this.initialAnnotationData = undefined
    this.currentCrop = undefined
    this.currentPolygon = undefined
    this.pendingClick = null
    this.currentClicks = []
    this.currentVisibleClicks = []
    this.currentAnnotation = undefined
    this.instance = undefined
    this.hoverClick = undefined
    this.actionGroup = undefined

    this.unregisterComponents(context)
    context.editor.selectCursor(EditorCursor.Magic)
  }

  private init (
    context: ToolContext,
    annotation: Annotation,
    { bbox, clicks }: AutoAnnotateData
  ): void {
    this.reset(context)
    this.initialAnnotationData = annotation.clone().data

    // Setup the state in the same way as if we manually draw the bounding box and made the clicks.
    // The bounding box and clicks are relative to the centroid.
    let centroid: Point<'Image'>
    if (annotation.isVideoAnnotation()) {
      const { data } = annotation.inferVideoData(context.editor.activeView)
      centroid = calcCentroid(data.path)
    } else {
      if (!annotation.isImageAnnotation()) {
        throw new Error('ClickerTool: Annotation inferred as neither image nor video')
      }
      centroid = calcCentroid(annotation.data.path)
    }

    this.currentAnnotation = context.editor.activeView.annotations.find(a => a.id === annotation.id)
    if (!this.currentAnnotation) { return }
    this.initialPoint = new Point<'Image'>({ x: bbox.x1, y: bbox.y1 }).add(centroid)
    this.currentCrop =
      new Rectangle<'Image'>(
        new Point<'Image'>({ x: bbox.x1, y: bbox.y1 }).add(centroid),
        new Point<'Image'>({ x: bbox.x2, y: bbox.y2 }).add(centroid)
      )
    this.currentClicks = (clicks || []).map((click: Click) => {
      return { ...click, x: click.x + centroid.x, y: click.y + centroid.y }
    })
    this.currentVisibleClicks = this.currentClicks
    this.currentPolygon = annotation.data
    this.instance = uuidv4()

    this.currentAnnotation.unhighlight()
    this.currentAnnotation.deselect(false)

    context.editor.activeView.annotationsLayer.changed()
  }

  /**
   * Handles recomputation logic which needs to happen before every render
   *
   * Specifically, it determines if the header component
   * should be rendered, and (re)computes the position of it.
   */
  private update (context: ToolContext, camera: Camera): void {
    if (this.currentCrop) {
      this.updateComponents(context, camera)
    } else {
      this.unregisterComponents(context)
    }
  }

  /**
   * Holds data for the header component, in cases where it should be rendered.
   *
   * If undefined, it means the component is not rendered.
   *
   * The header component always renders alongside the crop.
   */
  header?: {
    id: string
    name: string
    props: {
      x: number
      y: number
      onClear: Function
      onRerun: Function
      busy: boolean
    }
  }

  /**
   * Holds data for the spinner component
   * Position in the centre of the crop
   *
   * If undefined, do not render
   */
  spinner?: {
    id: string
    name: string
    props: {
      x: number
      y: number
      show: boolean
    }
  }

  private setBusy (): void {
    const { header, spinner } = this
    if (spinner) { spinner.props.show = true }
    if (header) { header.props.busy = true }
  }

  private setNotBusy (context: ToolContext): void {
    const { header, spinner } = this
    if (spinner) { spinner.props.show = false }
    if (header) { header.props.busy = false }
    this.resetUnlessAutoAnnotate(context)
  }

  /**
   * If the preselected model is not of type `auto_annotate`, then
   * exit "edit" mode by resetting the state of this tool.
   */
  private resetUnlessAutoAnnotate (context: ToolContext): void {
    if (!isPreselectedModelAutoAnnotate(context.editor)) {
      this.reset(context)
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  /**
    * Go through all components (currently only header) and recompute their data.
    */
  private updateComponents (context: ToolContext, camera: Camera): void {
    this.updateHeaderComponent(context, camera)
    this.updateSpinnerComponent(context, camera)
  }

  private updateHeaderComponent (context: ToolContext, camera: Camera): void {
    const { currentCrop } = this
    if (!currentCrop) { return }

    // crop is in image coordinates,
    // but we need to compute header placement in canvas coordinates
    const topLeft = camera.imageViewToCanvasView(currentCrop.topLeft)
    const placement = { x: topLeft.x, y: topLeft.y - 30 }

    const { header } = this
    if (header) {
      // if the header already exists, we only need to update positioning
      header.props.x = placement.x
      header.props.y = placement.y
    } else {
      // if the header does not exist, we need to create it and add it to the editor
      this.header = {
        id: uuidv4(),
        name: HEADER_COMPONENT,
        props: {
          ...placement,
          onRerun: () => this.rerun(),
          onClear: () => this.clear(),
          busy: false
        }
      }
      context.editor.addComponent(this.header)
    }
  }

  private updateSpinnerComponent (context: ToolContext, camera: Camera): void {
    const { currentCrop } = this
    if (!currentCrop) { return }

    // crop is in image coordinates,
    // but we need to compute header placement in canvas coordinates

    const centerImage = calcCentroid([
      currentCrop.topLeft,
      currentCrop.topRight,
      currentCrop.bottomRight,
      currentCrop.bottomLeft
    ])
    const center = camera.imageViewToCanvasView(centerImage)
    const placement = { x: center.x, y: center.y }

    const { spinner } = this
    if (spinner) {
      spinner.props.x = placement.x
      spinner.props.y = placement.y
    } else {
      this.spinner = {
        id: uuidv4(),
        name: SPINNER_COMPONENT,
        props: {
          ...placement,
          show: false
        }
      }
      context.editor.addComponent(this.spinner)
    }
  }

  /** Unregisters all components (currently header) and removes them from editor */
  private unregisterComponents (context: ToolContext): void {
    const { header, spinner } = this
    if (!header || !spinner) { return }
    context.editor.removeComponent(header.id)
    context.editor.removeComponent(spinner.id)
    delete this.header
    delete this.spinner
  }

  private render (context: ToolContext, view: IView): void {
    const ctx = view.annotationsLayer.context
    if (!ctx) { return }

    if (this.cursorPoint) {
      const canvasCursorPoint = view.camera.imageViewToCanvasView(this.cursorPoint)
      ctx.beginPath()
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'rgb(227, 234, 242)' // Alice Shade
      ctx.moveTo(canvasCursorPoint.x, 0)
      ctx.lineTo(canvasCursorPoint.x, view.height)
      ctx.moveTo(0, canvasCursorPoint.y)
      ctx.lineTo(view.width, canvasCursorPoint.y)
      ctx.stroke()
    }

    if (this.currentCrop) {
      // Convert Rectangle<'Image'> to Rectangle<'Canvas'>
      const topLeft = view.camera.imageViewToCanvasView(this.currentCrop.topLeft)
      const bottomRight = view.camera.imageViewToCanvasView(this.currentCrop.bottomRight)
      const canvasRectangle = new Rectangle(topLeft, bottomRight)
      // Clear, draw overlay and draw box
      drawOverlay(ctx, {
        width: view.width,
        height: view.height
      }, canvasRectangle)
      drawDashedBox(ctx, canvasRectangle)
      // draw box corners
      const corners = [
        this.currentCrop.topLeft,
        this.currentCrop.topRight,
        this.currentCrop.bottomRight,
        this.currentCrop.bottomLeft
      ]
      for (const corner of corners) {
        const canvasPoint = view.camera.imageViewToCanvasView(corner)
        ctx.beginPath()
        ctx.arc(canvasPoint.x, canvasPoint.y, 3.5, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
      // Draw clicks
      for (const click of this.currentVisibleClicks) {
        const clickPoint = new Point(click) as ImagePoint
        const canvasPoint = view.camera.imageViewToCanvasView(clickPoint)
        const color = click.type === 'add' ? '#00D9C9' : '#EB5353'
        const hoverColor = click.type === 'add' ? '#18BCB0' : '#BC2424'

        drawClick(ctx, canvasPoint, 5, click === this.hoverClick ? hoverColor : color)
      }
      if (this.pendingClick) {
        const clickPoint = new Point(this.pendingClick) as ImagePoint
        const canvasPoint = view.camera.imageViewToCanvasView(clickPoint)
        const clickColor = this.pendingClick.type === 'add' ? '#00D9C9' : '#EB5353'
        drawPendingClick(ctx, canvasPoint, 5, clickColor)
      }
    } else if (this.cursorPoint && this.initialPoint) {
      // Clear and draw box
      const canvasInitialPoint = view.camera.imageViewToCanvasView(this.initialPoint)
      const canvasCursorPoint = view.camera.imageViewToCanvasView(this.cursorPoint)
      const canvasRectangle = new Rectangle(canvasInitialPoint, canvasCursorPoint)
      drawDashedBox(ctx, canvasRectangle)
    }
  }

  private onStart (context: ToolContext, event: CanvasEvent): void {
    const eventPoint = resolveEventPoint(event)
    if (!eventPoint) { return }

    if (this.currentCrop === undefined) {
      context.editor.deselectAllAnnotations()

      if (!this.initialPoint) {
        this.initialPoint = context.editor.camera.canvasViewToImageView(eventPoint)
      }
    } else {
      this.movingCorner = findEditableCorner(context.editor, this.currentCrop, eventPoint)
      if (!this.movingCorner) {
        this.movingPoint = findEditableEdge(context.editor, this.currentCrop, eventPoint)
      }
    }
    context.editor.activeView.annotationsLayer.changed()
  }

  private onMove (context: ToolContext, event: CanvasEvent): CallbackStatus | void {
    if (!context.editor.activeView.hitTarget(event)) {
      return CallbackStatus.Stop
    }

    const eventPoint = resolveEventPoint(event)
    if (!eventPoint) { return }

    this.cursorPoint = context.editor.camera.canvasViewToImageView(eventPoint)

    if (!this.initialPoint) {
      context.editor.activeView.annotationsLayer.changed()
      return
    }

    if (this.movingCorner) {
      this.movingCorner.corner.set(context.editor.camera.canvasViewToImageView(eventPoint))
      selectCornerCursor(context.editor, this.movingCorner.position)
      context.editor.activeView.annotationsLayer.changed()

      // To stop the panning mixin
      return CallbackStatus.Stop
    }

    if (this.movingPoint && this.currentCrop) {
      const imagePoint = context.editor.camera.canvasViewToImageView(eventPoint)
      this.currentCrop.add(imagePoint.sub(this.movingPoint))
      this.movingPoint = imagePoint
      context.editor.selectCursor(EditorCursor.DefaultMove)
      context.editor.activeView.annotationsLayer.changed()

      // To stop the panning mixin
      return CallbackStatus.Stop
    }

    if (this.cursorPoint && this.currentCrop && this.currentPolygon && this.currentAnnotation) {
      const corner = findEditableCorner(context.editor, this.currentCrop, eventPoint)
      if (corner) {
        selectCornerCursor(context.editor, corner.position)
        return
      }
      const edge = findEditableEdge(context.editor, this.currentCrop, eventPoint)
      if (edge) {
        context.editor.selectCursor(EditorCursor.DefaultMove)
        return
      }

      this.hoverClick = findClick(context, this.currentClicks, eventPoint)
      if (this.hoverClick) {
        context.editor.selectCursor(EditorCursor.MagicDeleteClick)
        context.editor.activeView.annotationsLayer.changed()
        return
      }

      const path = [
        context.editor.camera.imageViewToCanvasView(this.currentCrop.topLeft),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.topRight),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.bottomRight),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.bottomLeft)
      ]
      const canvasCursorPoint = context.editor.camera.imageViewToCanvasView(this.cursorPoint)

      const currentPolygonPath = resolvePolygonPath(context, this.currentPolygon)
      const canvasPolygonPath = currentPolygonPath
        .map(point => context.editor.camera.imageViewToCanvasView(point))
      if (pointInPath(canvasCursorPoint, canvasPolygonPath)) {
        context.editor.selectCursor(EditorCursor.MagicRemovePoint)
      } else if (pointInPath(canvasCursorPoint, path)) {
        context.editor.selectCursor(EditorCursor.MagicAddPoint)
      } else {
        context.editor.selectCursor(EditorCursor.Magic)
      }
    }
    context.editor.activeView.annotationsLayer.changed()
    if (!this.currentCrop) {
      return CallbackStatus.Stop
    }
  }

  private onEnd (context: ToolContext, event: CanvasEvent): void {
    const { loadedImage: image, loadedVideo: video } = context.editor
    if (!image && !video) { return }

    const point = resolveEventPoint(event, true)
    if (point) {
      this.cursorPoint = context.editor.camera.canvasViewToImageView(point)
    }

    if (this.movingCorner || this.movingPoint) {
      this.movingCorner = undefined
      this.movingPoint = undefined
      const { activeView } = context.editor

      if (this.currentCrop) {
        this.currentCrop.normalize()
        if (image) {
          this.currentCrop.clamp(image)
        } else if (video) {
          const { hqData, lqData } = video.frames[activeView.currentFrameIndex]
          if (hqData) {
            this.currentCrop.clamp(hqData.data)
          } else if (lqData) {
            this.currentCrop.clamp(lqData.data)
          } else {
            throw new Error('Current frame not loaded yet')
          }
        }
      }
      this.sendBoundingBox(context)
      return
    }

    if (this.hoverClick) {
      const index = this.currentClicks.findIndex(c => c === this.hoverClick)
      if (index === -1) { return }
      const clicks = [...this.currentClicks]
      clicks.splice(index, 1)
      this.sendBoundingBox(context, clicks)
      return
    }

    if (!this.initialPoint || !this.cursorPoint) { return }

    if (this.currentCrop && this.currentCrop.isValid(5)) {
      const path = [
        context.editor.camera.imageViewToCanvasView(this.currentCrop.topLeft),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.topRight),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.bottomRight),
        context.editor.camera.imageViewToCanvasView(this.currentCrop.bottomLeft)
      ]
      const canvasCursorPoint = context.editor.camera.imageViewToCanvasView(this.cursorPoint)

      // NB: is this correct? Sometimes, mouseUp seems to register as being out
      // of the box I just drew, causing inference to cancel out. Happens if I
      // drag and release quickly
      if (!pointInPath(canvasCursorPoint, path)) {
        this.reset(context)
        return
      }
      this.sendClicks(context)
    } else {
      if (euclideanDistance(this.initialPoint, this.cursorPoint) < POINT_CLICK_THRESHOLD) {
        return
      }

      const crop = new Rectangle(this.cursorPoint, this.initialPoint)
      const { activeView } = context.editor

      if (image) {
        crop.clamp(image)
      } else if (activeView instanceof StreamView) {
        const image = activeView.renderingImage
        if (image) {
          crop.clamp(image.rawData as { width: number, height: number })
        } else {
          throw new Error('Current frame not loaded yet')
        }
      } else if (video) {
        const { hqData, lqData } = video.frames[activeView.currentFrameIndex]
        if (hqData) {
          crop.clamp(hqData.data)
        } else if (lqData) {
          crop.clamp(lqData.data)
        } else {
          throw new Error('Current frame not loaded yet')
        }
      }
      if (!crop.isValid(5)) {
        this.reset(context)
        return
      }
      this.currentCrop = crop
      // Since this is a new run of clicker, we assign it a new id.
      this.instance = uuidv4()

      // we must force the components to update before sending the first bounding box
      // otherwise the spinner would not show up.
      this.updateComponents(context, context.editor.activeView.camera)
      this.sendBoundingBox(context)
      context.editor.activeView.annotationsLayer.changed()
    }
  }

  /** Handles user clicking the RERUN button in the header */
  private rerun (): void {
    if (!this.context) { return }
    this.sendBoundingBox(this.context)
  }

  /** Handles user clicking the CLEAR button in the header */
  private clear (): void {
    if (!this.context) { return }
    this.sendBoundingBox(this.context, [])
    this.context.editor.activeView.annotationsLayer.changed()
  }

  /** Applies the epsilon to the current annotation path */
  private applyClickerEpsilon (): boolean | undefined {
    const {
      context,
      currentAnnotation: annotation,
      currentClicks,
      currentCrop,
      currentPolygon: polygon
    } = this
    if (!context || !annotation || !polygon || !currentCrop) { return }
    const { id } = annotation
    const match = context.editor.activeView.annotations.find(a => a.id === id)
    if (!match) { return }

    const originalPath = (polygon as Polygon)
      .path.map(point => ({ x: point.x, y: point.y } as IPoint))
    const simplifiedPath = maybeSimplifyPolygon(originalPath, context.editor.clickerEpsilon)
    const newPolygonPath = resolveAnnotationPath(context, simplifiedPath)

    const model = context.editor.preselectedAutoAnnotateModel || this.models[0]
    const newAutoAnnotate = {
      ...payloadRelativeToCentroid(
        { clicks: currentClicks, bbox: currentCrop },
        calcCentroid(newPolygonPath)
      ),
      model: model.id
    }

    context.editor.deselectAllAnnotations()
    if (!newAutoAnnotate) { return false }

    updateClickerData(
      match,
      { path: newPolygonPath, additional_paths: [] },
      newAutoAnnotate,
      context
    )

    context.editor.activeView.annotationManager.persistUpdateAnnotation(match)
  }
}
