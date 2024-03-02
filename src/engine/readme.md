# Engine
The engine tries to handle the following:
* Tasks
  - Loading
* Images
  - Loading
* Plugins
  - Fetching dataset related plugins
  - installing / uninstalling plugins
  - Running the plugins.
  - Note that plugins are responsible for rendering.
* Annotations
  - Fetch annotations
  - Save annotations
* Utils
  - Point
  - Callback handler
  - Color
  - Useful Graphics utils


## Use cases
The engine should be flexible enough to implement: The Workview, the ReviewView and annotated thumbnails.
Plugins should be flexible enough to reimplement all the tools we already have.

## Naming rules
* URL not Url, or url
