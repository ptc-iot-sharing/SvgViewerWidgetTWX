# SVG viewer for Thingworx

This is a widget allowing visualization of svg files.
It allows viewing the files, and also change element attributes based on external data.
It also allows zooming and panning.

## Building and publishing

The following commands allow you to build and compile your widget:

* `npm run build`: builds the extension. Creates a new extension zip file under the `zip` folder.
* `npm run watch`: watches the source files, and whenever they change, do a build
* `npm run upload`: creates a build, and uploads the extension zip to the thingworx server configured in `package.json`.