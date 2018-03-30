# SVG viewer for Thingworx

This is a widget allowing visualization of svg files.
It allows viewing the files, and also change element attributes based on external data.
It also allows zooming and panning.

## How to use

Here is how to use the widget in a simple usecase:

* You have your SVG file, where the elements that you want to update/interact with are clearly identifiable (via id or a custom attribute)
The SVG file can look something like this:

```
<svg> 
  <g id="myId1">
    <ellipse cx="2.12898292" cy="1.64099586" rx="1.59673719" ry="1.64099586"/>
    <path d="M2.12898292,3.55549103 L2.12898292,8.4784786" stroke-linecap="round"/>
  </g>
  <g id="myId2" transform="translate(108.000000, 8.000000)" stroke="#C6D8E1" stroke-width="2" stroke-linecap="round">
    <path d="M1.5,5 L14.5,5" id="Line1"/>
    <path d="M11.5,1 L24.5,1" id="Line2"/>
    <path d="M17.5,5 L21,5" id="Line3"/>
  </g>
</svg>
```

* You link that svg file into the widget. It’s important to bind the link to the svg file rather writing the file path directly in the widget properties (bug at the moment). The svg file can be uploaded to a file repository, to a media entity, or accessible using an url.
* You create an infotable that contains “overrides” (more on that later). 
This infotable would look something like this:


| ElementName | override-fill | override-stroke | override-stroke-width
| ------------| ------------- | --------------- | --------------------
| myId1       | red           | yellow          | 3.5
| myId2       | #343344       | #431234         | 1


* Bind that infotable into the data property
* Select the column in the infotable that contains the values of the uniquely idenfity (`ElementName`)

... TO BE CONTINUED


## Building and publishing

The following commands allow you to build and compile your widget:

* `npm run build`: builds the extension. Creates a new extension zip file under the `zip` folder.
* `npm run watch`: watches the source files, and whenever they change, do a build
* `npm run upload`: creates a build, and uploads the extension zip to the thingworx server configured in `package.json`.