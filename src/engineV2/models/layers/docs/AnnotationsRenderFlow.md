@startuml
scale 600 width

title Annotations canvas

[*] --> Init
Init : Editor was init with N annotations

Init --> RenderCached
RenderCached : Render & cache all annotations
RenderCached : on the main canvas

RenderCached --> ScaleIn
ScaleIn --> BeforeFitTheScreen
ScaleIn --> AfterFitTheScreen

RenderCached --> ScaleOut
ScaleOut --> BeforeFitTheScreen
ScaleOut --> AfterFitTheScreen

BeforeFitTheScreen --> RenderCached
AfterFitTheScreen --> RenderCachedHQ

RenderCached --> Panning
Panning --> BeforeFitTheScreen
Panning --> AfterFitTheScreen

RenderCached --> HighlightAnnotation
RenderCached --> SelectAnnotation

SelectAnnotation --> ActivateAnnotationItem
HighlightAnnotation --> ActivateAnnotationItem

HighlightAnnotation --> RenderActive
HighlightAnnotation --> UnhighlightAnnotation
UnhighlightAnnotation --> RenderActive

UnhighlightAnnotation --> DeactivateAnnotationItem

SelectAnnotation --> RenderActive
SelectAnnotation --> DeselectAnnotation
DeselectAnnotation --> RenderActive

DeselectAnnotation --> DeactivateAnnotationItem

SelectAnnotation --> UpdateAnnotation
UpdateAnnotation --> RenderActive

SelectAnnotation --> DeleteAnnotation
DeleteAnnotation --> RenderActive
DeleteAnnotation --> RenderCached

RenderCached --> CreateAnnotation
CreateAnnotation --> RenderActive
CreateAnnotation --> RenderCached

RenderCached --> [*]
RenderCachedHQ --> [*]
RenderActive --> [*]

state CreateAnnotation {
  [*] --> StartTool
  StartTool --> UpdateUsingTool
  UpdateUsingTool --> EndTool
}

state RenderCached {
  [*] --> RenderAllAnnotations
  RenderAllAnnotations : Go throw all annotation items
  RenderAllAnnotations : to run runder method

  RenderAllAnnotations --> CachedCanvas
  CachedCanvas : Render annotations on cached canvas
  note right of CachedCanvas
    Cached canvas is not rendered
    on the screen We use it to keep current
    state of the canvas in the memory
  end note

  CachedCanvas --> MainCanvas
  MainCanvas : Render cached canvas
  note right of MainCanvas
    Ideally you should never draw
    directly on main canvas. It should
    always use CachedCanvas to draw.
  end note
}

state RenderCachedHQ {
  [*] --> ClearViewportFragment
  ClearViewportFragment : Clear only visible part of the CachedCanvas

  ClearViewportFragment --> RenderFragmentAnnotations
  RenderFragmentAnnotations : Calculate annotations that should be in the
  RenderFragmentAnnotations : viewport and render them on the temporary canvas

  RenderFragmentAnnotations --> PushToMainCanvas
  PushToMainCanvas : Render tmp canvas to the cleared main canvas

  RenderFragmentAnnotations --> PushToCachedCanvas
  PushToCachedCanvas : Render tmp canvas to the cleared cached canvas
}

state ActivateAnnotationItem {
  [*] --> MarkItemAsActive
  MarkItemAsActive --> ClearCachedCanvasSection
}

state DeactivateAnnotationItem {
  [*] --> RemoveActiveFlag
  RemoveActiveFlag : Remove 'active' flag from the item
  RemoveActiveFlag --> ClearCachedCanvasSection2
  ClearCachedCanvasSection2--> RenderCachedCanvasSection
}

state RenderActive {
  [*] --> ClearActiveCanvas
  ClearActiveCanvas --> RenderAllActiveItems
  RenderAllActiveItems : All items with frag 'active' will be rendered on
  RenderAllActiveItems : this canvas and ignored on the CachedCanvas
}

@enduml
