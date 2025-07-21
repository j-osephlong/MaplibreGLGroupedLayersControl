# maplibregl-grouped-layers-control

A layers control for maplibre-gl that adds the concept of groups.

![Screenshot](/screenshots/layers-demo-img.png "Screenshot")

## Grouped Layers Usage

Each group added gets a checkbox labeled with the group name, that controls every layer in the group.

```ts
import { LayersControl } from "maplibregl-grouped-layers-control"
import "maplibregl-grouped-layers-control/lib/LayersControl.css" // Import the CSS!

const map = ...
const layersControl = new LayersControl()

map.addControl(layersControl)

// Example:
// ...  add an outline layer with an id 'polygons-outline', a fill layer with the id 'polygons-fill', 
//      and a symbols layer with the id 'polygons-text'. 

layersControl.addLayerToGroup({
    layerId: 'polygons-outline',
    groupName: 'polygons',
})
layersControl.addLayerToGroup({
    layerId: 'polygons-fill',
    groupName: 'polygons',
})
layersControl.addLayerToGroup({
    layerId: 'polygons-text',
    groupName: 'polygons',
})

// Now in the layers control, all three layers can be toggled with the checkbox labeled 'polygons'
```

## Basemaps Usage

Basemaps can be added too, and will be featured at the top of the control, each group having its own radio, so they are mutually exclusive layers.


```ts
import { LayersControl } from "maplibregl-grouped-layers-control"
import "maplibregl-grouped-layers-control/lib/LayersControl.css" // Import the CSS!

const map = ...
const layersControl = new LayersControl()

map.addControl(layersControl)

// Example:
// ...  add a basemap raster layer with id 'basemap1'

layersControl.addLayerToGroup({
    layerId: 'basemap1',
    groupName: 'basemap1', // we just use the 'groupName' as a display name for the basemap, since we're just adding one layer to the group
    basemap: true,
})
layersControl.addLayerToGroup({
    layerId: 'basemap2',
    groupName: 'basemap2',
    basemap: true,
})

// Now in the layers control, both of the basemaps are listed up top with radio buttons. 
```

You of course could put multiple basemaps in a group, if you have one layer that you wanted to be semi-transparent for example.