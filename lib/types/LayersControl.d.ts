/**
 * Written by Joseph Long, 2024
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
    constructor();
    onAdd(map: maplibregl.Map): HTMLElement;
    onRemove(): void;
    _createLayerListItemHTML(groupName: string, inputType: "checkbox" | "radio", inputCallback: (event: HTMLElementEventMap["click"]) => void): HTMLElement;
    updateList(style: maplibregl.Style): void;
    /** Add layer to control */
    _addGroupHtml(groupName: string): void;
    _addBasemapHtml(groupName: string): void;
    /** Remove layer from control */
    removeGroup(id: string): void;
    /** Refresh group to reflect changes in sources. */
    refreshGroup(groupName: string): void;
    /** Get the groupID that a layer corrosponds to. */
    getGroupNameFromLayerID(layerId: string): string | null;
    addLayerToGroup(options: {
        layerId: string;
        groupName: string;
        basemap?: boolean;
    }): void;
    /** Show the layers in a hidden spec. */
    showGroup(groupName: string): void;
    /** Hide the layers in a spec. */
    hideGroup(groupName: string): void;
    setGroupVisible(groupName: string, visible: boolean): void;
}
//# sourceMappingURL=LayersControl.d.ts.map