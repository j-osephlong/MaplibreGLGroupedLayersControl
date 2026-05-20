/**
 * Written by Joseph Long, 2024
 * 	Updated 2026.
 * 'maplibre-gl-basemaps' used as a starting template at start of development.
 *      https://github.com/ka7eh/maplibre-gl-basemaps
 *
 */
import * as maplibregl from "maplibre-gl";
/** Spec for LayerGroup */
export interface LayerGroupSpec {
    layerIds: string[];
    groupName: string;
    basemap: boolean;
    html?: HTMLElement;
    order?: number;
}
export declare class LayersControl extends maplibregl.Evented implements maplibregl.IControl {
    /** Container element */
    _container: HTMLElement;
    /** Basemap list element */
    _basemapsGroupList: HTMLDivElement;
    /** Layers list element */
    _layerGroupsList: HTMLDivElement;
    /**
     * Registry of active layers/layer groups
     *
     * Allows support of layer groups, the layers control.
     */
    groups: Map<string, LayerGroupSpec>;
    /** Maplibre object */
    _map: maplibregl.Map | null;
    /** Sets up base UI */
    constructor();
    /** IControl API. */
    onAdd(map: maplibregl.Map): HTMLElement;
    /** IControl API. */
    onRemove(): void;
    /** Updates the list.
     *
     * Called every map style update.
     */
    updateList(): void;
    _initHTML(): void;
    _createListItemHTML(text: string, checked: boolean, inputType: "checkbox" | "radio", inputCallback: (event: MouseEvent) => void): HTMLDivElement;
    /** Add group to control */
    _addGroupHtml(groupSpec: LayerGroupSpec): void;
    _onLayerToggle(event: MouseEvent, layerId: string): void;
    _onGroupToggle(event: MouseEvent, groupSpec: LayerGroupSpec): void;
    _onBasemapSelect(event: MouseEvent, groupSpec: LayerGroupSpec): void;
    _someGroupLayerVisible(groupSpec: LayerGroupSpec): boolean;
    /** Remove layer from control */
    removeGroup(id: string): void;
    /** Refresh group to reflect changes in sources. */
    refreshGroup(groupName: string): void;
    /** Add a layer to a group. */
    addLayer(layerId: string, groupName: string): void;
    /**Define a group. */
    addGroup(options: {
        groupName: string;
        order?: number;
        basemap?: boolean;
    }): void;
    /** Adds a layer to a group. Creates group if one with the passed name does not exist.
     *
     * @deprecated Use addLayer and addGroup instead.
     */
    addLayerToGroup(options: {
        layerId: string;
        groupName: string;
        /** If true, the group is considered a basemap, and uses a radio instead of a checkbox. */
        basemap?: boolean;
    }): void;
    /** Show the layers in a hidden spec. */
    showGroup(groupName: string): void;
    /** Hide the layers in a spec. */
    hideGroup(groupName: string): void;
    setGroupVisible(groupName: string, visible: boolean): void;
    setLayerVisible(layerId: string, visible: boolean): void;
}
//# sourceMappingURL=LayersControl.d.ts.map