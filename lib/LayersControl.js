"use strict";
/**
 * Written by Joseph Long, 2024
 * 'maplibre-gl-basemaps' used as a starting template at start of development.
 *      https://github.com/ka7eh/maplibre-gl-basemaps
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersControl = void 0;
const maplibregl = __importStar(require("maplibre-gl"));
class LayersControl extends maplibregl.Evented {
    /** Container element */
    _container;
    /** Basemap list element */
    _basemapsGroupList;
    /** Layers list element */
    _layerGroupsList;
    /**
     * Registry of active layers/layer groups
     *
     * Allows support of layer groups, the layers control.
     */
    groups;
    /** Maplibre object */
    _map = null;
    constructor() {
        super();
        this.groups = new Map();
        // Build HTML elements
        this._container = document.createElement("div");
        this._container.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
        this._container.classList.add("maplibregl-ctrl-layers-ctrl");
        this._container.classList.add("closed");
        this._container.addEventListener("mouseenter", () => {
            this._container.classList.remove("closed");
        });
        this._container.addEventListener("mouseleave", () => {
            this._container.classList.add("closed");
        });
        const button = document.createElement("button");
        button.type = "button";
        // Button icon sourced from https://github.com/korywka/mapbox-controls/blob/master/packages/styles/src/icons.js
        const buttonIcon = new DOMParser().parseFromString(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22" fill="currentColor">
                <path d="m24 41.5-18-14 2.5-1.85L24 37.7l15.5-12.05L42 27.5Zm0-7.6-18-14 18-14 18 14Zm0-15.05Zm0 11.25 13.1-10.2L24 9.7 10.9 19.9Z"/>
            </svg>
        `, "image/svg+xml").firstChild;
        button.append(buttonIcon);
        this._basemapsGroupList = document.createElement("div");
        this._basemapsGroupList.classList.add("layers-list");
        this._layerGroupsList = document.createElement("div");
        this._layerGroupsList.classList.add("layers-list");
        const popup = document.createElement("div");
        popup.classList.add("popup");
        popup.append(this._basemapsGroupList, document.createElement("hr"), this._layerGroupsList);
        this._container.append(button, popup);
    }
    onAdd(map) {
        this._map = map;
        this._map.on("styledata", () => {
            this.updateList(this._map.style);
        });
        return this._container;
    }
    onRemove() {
        this._map = null;
        this.groups.clear();
        this._container.parentNode?.removeChild(this._container);
    }
    _createLayerListItemHTML(groupName, inputType, inputCallback) {
        const groupSpec = this.groups.get(groupName);
        const visible = this._map.getLayoutProperty(groupSpec.layerIds[0], "visibility") != "none";
        //  Create html for layer
        const layerContainer = document.createElement("div");
        layerContainer.classList.add("layer");
        const inputContainer = document.createElement("div");
        inputContainer.classList.add("input-container");
        const input = document.createElement("input");
        input.type = inputType;
        input.id = groupName;
        input.checked = visible;
        input.addEventListener("click", inputCallback);
        const label = document.createElement("label");
        label.innerText = groupName;
        inputContainer.append(input, label);
        const opacityInput = document.createElement("input");
        opacityInput.type = "range";
        opacityInput.min = "0";
        opacityInput.max = "1";
        opacityInput.value = "1";
        layerContainer.append(inputContainer);
        return layerContainer;
    }
    updateList(style) {
        this._basemapsGroupList.innerHTML = "";
        this._layerGroupsList.innerHTML = "";
        const baseMapGroups = [];
        const layerGroups = [];
        for (const [id] of Object.entries(style._layers)) {
            const groupName = this.getGroupNameFromLayerID(id);
            if (!groupName)
                continue;
            const groupSpec = this.groups.get(groupName);
            if (!groupSpec)
                continue;
            if (groupSpec.basemap) {
                if (baseMapGroups.includes(groupName))
                    continue;
                this._addBasemapHtml(groupSpec.groupName);
                baseMapGroups.push(groupName);
            }
            else {
                if (layerGroups.includes(groupName))
                    continue;
                this._addGroupHtml(groupSpec.groupName);
                layerGroups.push(groupName);
            }
        }
    }
    /** Add layer to control */
    _addGroupHtml(groupName) {
        if (!this._map) {
            throw new Error("Cannot register a layer before adding control to a map.");
        }
        const groupSpec = this.groups.get(groupName);
        if (!groupSpec)
            throw new Error(`Non-existent group ${groupName}.`);
        const layerElm = this._createLayerListItemHTML(groupName, "checkbox", (event) => {
            const target = event.target;
            const groupName = target.id;
            // Toggle visibility of each associated layer and control state
            if (target.checked) {
                this.showGroup(groupName);
            }
            else {
                this.hideGroup(groupName);
            }
            this.fire("toggle", { groupName, visible: target.checked });
        });
        this._layerGroupsList.append(layerElm);
        // Initialize its state in control
        this.groups.set(groupName, {
            ...groupSpec,
            html: layerElm,
        });
    }
    _addBasemapHtml(groupName) {
        if (!this._map) {
            throw new Error("Cannot register a layer before adding control to a map.");
        }
        const groupSpec = this.groups.get(groupName);
        if (!groupSpec)
            throw new Error(`Non-existent group ${groupName}.`);
        const layerElm = this._createLayerListItemHTML(groupName, "radio", (event) => {
            if (!this._map)
                throw new Error("Missing map instance.");
            const groupSpec = this.groups.get(groupName);
            if (!groupSpec) {
                console.error(`Non-existent group ${groupName}.`);
                return;
            }
            const target = event.target;
            const basemapID = target.id;
            console.debug("CALLBACk", this.groups);
            // Toggle visibility of each associated layer and control state
            this._map.setLayoutProperty(groupSpec.layerIds[0], "visibility", "visible");
            for (const [name2, state2] of this.groups.entries()) {
                if (!state2.basemap)
                    continue;
                if (name2 == basemapID)
                    continue;
                const groupSpec2 = this.groups.get(name2);
                if (!groupSpec2) {
                    console.error(`Non-existent group ${name2}.`);
                    return;
                }
                const group2Visible = groupSpec2.layerIds.some(id => this._map?.getLayoutProperty(id, "visibility") == "visible");
                if (group2Visible) {
                    this._map.setLayoutProperty(groupSpec2.layerIds[0], "visibility", "none");
                    state2.html.getElementsByTagName("input").item(0).checked = false;
                    this.fire("toggle", { groupName: name2, visible: false });
                }
            }
            this.fire("toggle", { groupName, visible: true });
        });
        this._basemapsGroupList.appendChild(layerElm);
        // Initialize it's state in control
        this.groups.set(groupName, {
            ...groupSpec,
            html: layerElm,
        });
    }
    /** Remove layer from control */
    removeGroup(id) {
        const state = this.groups.get(id);
        if (!state) {
            return;
        }
        // remove html
        state.html?.remove();
        // remove from registry
        this.groups.delete(id);
    }
    /** Refresh group to reflect changes in sources. */
    refreshGroup(groupName) {
        const registryEntry = this.groups.get(groupName);
        if (!registryEntry) {
            console.error(`No such layer collection with id ${groupName}.`);
            return;
        }
        // refresh each unique source in group
        const sources = new Set();
        for (const id of registryEntry.layerIds) {
            const srcId = this._map?.getLayer(id)?.source;
            if (srcId) {
                sources.add(srcId);
            }
        }
        for (const sourceId of sources.values()) {
            try {
                this._map?.refreshTiles(sourceId);
            }
            catch (e) {
                console.error("Failed to refresh", groupName, e);
            }
        }
    }
    /** Get the groupID that a layer corrosponds to. */
    getGroupNameFromLayerID(layerId) {
        for (const [registryID, spec] of this.groups.entries()) {
            const match = spec.layerIds.some(id => id == layerId);
            if (match) {
                return registryID;
            }
        }
        return null;
    }
    addLayerToGroup(options) {
        // Create group if it doesn't exist
        if (!this.groups.has(options.groupName)) {
            this.groups.set(options.groupName, {
                groupName: options.groupName,
                layerIds: [options.layerId],
                basemap: !!options.basemap,
            });
        }
        else {
            this.groups.get(options.groupName)?.layerIds.push(options.layerId);
        }
    }
    /** Show the layers in a hidden spec. */
    showGroup(groupName) {
        this.setGroupVisible(groupName, true);
    }
    /** Hide the layers in a spec. */
    hideGroup(groupName) {
        this.setGroupVisible(groupName, false);
    }
    setGroupVisible(groupName, visible) {
        const registryEntry = this.groups.get(groupName);
        if (!registryEntry) {
            console.error(`No such layer collection with id ${groupName}.`);
            return;
        }
        for (const layerId of registryEntry.layerIds) {
            this._map?.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        }
    }
}
exports.LayersControl = LayersControl;
