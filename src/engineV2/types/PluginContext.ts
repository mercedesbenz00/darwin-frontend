import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { Editor } from '@/engineV2/editor'
import {
  AnnotationOverlayer,
  MeasureOverlayer,
  Tool,
  Serializer
} from '@/engineV2/managers'
import { AnnotationTypeRenderer, RasterTypeRenderer } from '@/engineV2/models'

export interface PluginContext {
  editor: Editor
  handles: CallbackHandle[]

  /**
   * Register a Vue component to be used by the plugin to render custom UI elements.
   *
   * Vue doesn't really provide a way to unregister components,
   * so there is no associated `unregisterComponent` function.
   *
   * Rather, repeated registration of the same component doesn't do anything.
   */
  registerComponent: (name: string, component: any) => void

  registerTool(name: string, tool: Tool): void;
  unregisterTool(name: string): void;

  registerCommand(name: string, action: ((...args: any[]) => void)): void;
  unregisterCommand(name: string): void;

  registerAnnotationRenderer(name: string, renderer: AnnotationTypeRenderer): void;
  unregisterAnnotationRenderer(name: string): void;

  registerRasterRenderer(name: string, renderer: RasterTypeRenderer): void;
  unregisterRasterRenderer(name: string): void;

  registerSerializer(
    name: string,
    serializer: Serializer
  ): void;
  unregisterSerializer(name: string): void;

  registerAnnotationOverlayer(name: string, overlayer: AnnotationOverlayer): void;
  unregisterAnnotationOverlayer(name: string): void;

  registerMeasureOverlayer(name: string, overlayer: MeasureOverlayer): void;
  unregisterMeasureOverlayer(name: string): void;
}
