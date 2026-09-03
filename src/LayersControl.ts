/**
 * Written by Joseph Long, 2024
 * 	Updated 2026.
 * 'maplibre-gl-basemaps' used as a starting template at start of development.
 *      https://github.com/ka7eh/maplibre-gl-basemaps
 *
 */

import type { IControl, Map as MaplibreGLMap } from "maplibre-gl"
import { Evented } from "maplibre-gl"

/** Spec for LayerGroup */
export interface LayerGroupSpec {
	layerIds: string[]
	groupName: string
	basemap: boolean
	html?: HTMLElement
	order?: number,
}

export class LayersControl extends Evented
	implements IControl {
	/** Container element */
	_container!: HTMLElement
	/** Basemap list element */
	_basemapsGroupList!: HTMLDivElement
	/** Layers list element */
	_layerGroupsList!: HTMLDivElement

	/**
	 * Registry of active layers/layer groups
	 *
	 * Allows support of layer groups, the layers control.
	 */
	groups: Map<string, LayerGroupSpec>
	/** Maplibre object */
	_map: MaplibreGLMap | null = null

	/** Sets up base UI */
	constructor() {
		super()
		this.groups = new Map()
	}

	/** IControl API. */
	onAdd(map: MaplibreGLMap): HTMLElement {
		this._map = map
		this._initHTML()
		this._map.on("styledata", () => {
			this.updateList()
		})
		return this._container
	}

	/** IControl API. */
	onRemove(): void {
		this._map = null
		this.groups.clear()
		this._container.parentNode?.removeChild(this._container)
	}

	/** Updates the list.
	 * 
	 * Called every map style update.
	 */
	updateList() {
		// reset lists
		this._basemapsGroupList.innerHTML = ""
		this._layerGroupsList.innerHTML = ""
		const sortedGroups = [...this.groups.values()].toSorted((a, b) => (a.order ?? 0) > (b.order ?? 0) ? 1 : -1)
		for (const groupSpec of sortedGroups) {
			this._addGroupHtml(groupSpec)
		}
	}

	_initHTML() {
		// Build HTML elements
		this._container = document.createElement("div")
		this._container.classList.add(
			"maplibregl-ctrl",
			"maplibregl-ctrl-group",
		)
		this._container.classList.add("maplibregl-ctrl-layers-ctrl")
		this._container.classList.add("closed")

		this._container.addEventListener("mouseenter", () => {
			this._container.classList.remove("closed")
		})
		this._container.addEventListener("mouseleave", () => {
			this._container.classList.add("closed")
		})

		const button = document.createElement("button")
		button.type = "button"
		// Button icon sourced from https://github.com/korywka/mapbox-controls/blob/master/packages/styles/src/icons.js
		const buttonIcon = new DOMParser().parseFromString(
			`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22" fill="currentColor">
                <path d="m24 41.5-18-14 2.5-1.85L24 37.7l15.5-12.05L42 27.5Zm0-7.6-18-14 18-14 18 14Zm0-15.05Zm0 11.25 13.1-10.2L24 9.7 10.9 19.9Z"/>
            </svg>
        `,
			"image/svg+xml",
		).firstChild as SVGElement
		button.append(buttonIcon)

		this._basemapsGroupList = document.createElement("div")
		this._basemapsGroupList.classList.add("groups-list")

		this._layerGroupsList = document.createElement("div")
		this._layerGroupsList.classList.add("groups-list")

		const popup = document.createElement("div")
		popup.classList.add("popup")
		popup.append(this._basemapsGroupList, document.createElement("hr"), this._layerGroupsList)

		this._container.append(button, popup)
	}

	_createListItemHTML(text: string, checked: boolean, inputType: "checkbox" | "radio", inputCallback: (event: MouseEvent) => void) {
		// html for checkbox and label
		const listItem = document.createElement("div")
		listItem.classList.add("list-item")
		// checkbox
		const input = document.createElement("input")
		input.type = inputType
		input.id = text
		input.checked = checked
		input.addEventListener("click", inputCallback)
		// label
		const label = document.createElement("label")
		label.innerText = text
		listItem.append(input, label)
		return listItem
	}

	/** Add group to control */
	_addGroupHtml(groupSpec: LayerGroupSpec) {
		if (!this._map) {
			throw new Error(
				"Cannot register a layer before adding control to a map.",
			)
		}
		const groupName = groupSpec.groupName
		const visible = groupSpec.layerIds.some(id => this._map!.getLayoutProperty(id, "visibility") != "none")
		//  Create html for layer
		const groupDetailsElm = document.createElement("div")
		groupDetailsElm.classList.add("layer-group")
		// create list item with visibility toggle event
		const listItem = this._createListItemHTML(groupName, visible, groupSpec.basemap ? "radio" : "checkbox", (event) => groupSpec.basemap ? this._onBasemapSelect(event, groupSpec) : this._onGroupToggle(event, groupSpec))
		groupDetailsElm.appendChild(listItem)
		// add to correct container
		if (groupSpec.basemap) {
			this._basemapsGroupList.append(groupDetailsElm)
		} else {
			this._layerGroupsList.append(groupDetailsElm)
		}
		// set the html on the spec
		this.groups.set(groupName, {
			...groupSpec,
			html: groupDetailsElm,
		})
	}

	_onLayerToggle(event: MouseEvent, layerId: string) {
		event.stopImmediatePropagation()
		const target = event.target as HTMLInputElement
		this.setLayerVisible(layerId, target.checked)
	}

	_onGroupToggle(event: MouseEvent, groupSpec: LayerGroupSpec) {
		event.stopImmediatePropagation()
		const target = event.target as HTMLInputElement
		this.setGroupVisible(groupSpec.groupName, target.checked)
	}

	_onBasemapSelect(event: MouseEvent, groupSpec: LayerGroupSpec) {
		event.stopPropagation()
		if (!this._map)
			throw new Error("Missing map instance.")
		// Set the basemap as visible
		this.setGroupVisible(groupSpec.groupName, true)
		for (const otherGroupSpec of this.groups.values()) {
			// skip non basemaps
			if (!otherGroupSpec.basemap)
				continue
			// skip this basemap
			if (otherGroupSpec.groupName == groupSpec.groupName)
				continue
			const otherGroupVisible = this._someGroupLayerVisible(otherGroupSpec)
			if (otherGroupVisible) {
				this.setGroupVisible(otherGroupSpec.groupName, false)
			}
		}
	}

	_someGroupLayerVisible(groupSpec: LayerGroupSpec) {
		return groupSpec.layerIds.some(id => this._map?.getLayoutProperty(id, "visibility") != "none")
	}

	/** Remove layer from control */
	removeGroup(id: string) {
		const state = this.groups.get(id)
		if (!state) {
			return
		}
		// remove html
		state.html?.remove()
		// remove from registry
		this.groups.delete(id)
	}

	/** Refresh group to reflect changes in sources. */
	refreshGroup(groupName: string) {
		const registryEntry = this.groups.get(groupName)
		if (!registryEntry) {
			console.error(`No such layer collection with id ${groupName}.`)
			return
		}
		// refresh each unique source in group
		// get the sources that this group uses
		const sources = new Set<string>()
		for (const id of registryEntry.layerIds) {
			const srcId = this._map?.getLayer(id)?.source
			if (srcId) {
				sources.add(srcId)
			}
		}
		// try to refresh each source
		for (const sourceId of sources.values()) {
			try {
				this._map?.refreshTiles(sourceId)
			}
			catch (e) {
				// some layers cannot be refreshed, as they're not tiles based
				console.error("Failed to refresh", groupName, e)
			}
		}
	}

	/** Add a layer to a group. */
	addLayer(layerId: string, groupName: string) {
		if (!this.groups.has(groupName)) {
			this.addGroup({ groupName })
		}
		this.groups.get(groupName)?.layerIds.push(layerId)
		this.updateList()
	}

	/**Define a group. */
	addGroup(options: {
		groupName: string,
		order?: number,
		basemap?: boolean,
	}) {
		this.groups.set(options.groupName, {
			groupName: options.groupName,
			layerIds: [],
			basemap: !!options.basemap,
			order: options.order ?? this.groups.size,
		})
		this.updateList()
	}

	/** Adds a layer to a group. Creates group if one with the passed name does not exist.
	 * 
	 * @deprecated Use addLayer and addGroup instead.
	 */
	addLayerToGroup(options: {
		layerId: string
		groupName: string
		/** If true, the group is considered a basemap, and uses a radio instead of a checkbox. */
		basemap?: boolean
	}) {
		// Create group if it doesn't exist
		if (!this.groups.has(options.groupName)) {
			this.groups.set(options.groupName, {
				groupName: options.groupName,
				layerIds: [options.layerId],
				basemap: !!options.basemap,
			})
		}
		else {
			// otherwise add it to the existing group
			this.groups.get(options.groupName)?.layerIds.push(options.layerId)
		}
	}

	/** Show the layers in a hidden spec. */
	showGroup(groupName: string) {
		this.setGroupVisible(groupName, true)
	}

	/** Hide the layers in a spec. */
	hideGroup(groupName: string) {
		this.setGroupVisible(groupName, false)
	}

	setGroupVisible(groupName: string, visible: boolean) {
		const registryEntry = this.groups.get(groupName)
		if (!registryEntry) {
			console.error(`No such layer collection with id ${groupName}.`)
			return
		}
		for (const layerId of registryEntry.layerIds) {
			this.setLayerVisible(layerId, visible)
		}
		this.fire("toggle", { groupName, visible })
	}

	setLayerVisible(layerId: string, visible: boolean) {
		this._map?.setLayoutProperty(
			layerId,
			"visibility",
			visible ? "visible" : "none",
		)
	}
}
