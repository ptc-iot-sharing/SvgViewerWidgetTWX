import { ThingworxRuntimeWidget, TWService, TWProperty } from 'typescriptwebpacksupport'
import { SvgElement, SvgRendererOptions, SvgOverride } from './svgRenderer/svgRenderer'

@ThingworxRuntimeWidget
export class SvgViewerWidget extends TWRuntimeWidget {

    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }

    // the renderer currently used
    private svgRenderer: SvgElement;

    private needToApplyData = false;
    private _svgFileUrl: string;

    @TWProperty("SVGFileUrl")
    set svgFileUrl(value: string) {
        if (value != this._svgFileUrl) {
            this._svgFileUrl = value;
            if (!TW.IDE.isImageLinkUrl(value)) {
                //check to see if imageLink is an actual URL;
                this.setProperty("SVGFileUrl", '/Thingworx/MediaEntities/' + TW.encodeEntityName(value));
            }
            this.updateDrawnSvg();
        }
    };

    @TWProperty("Data")
    set svgData(value: TWInfotable) {
        if (this.svgRenderer) {
            this.svgRenderer.applyOverrides(this.transformNestedInfotableIfNeeded(value.rows));
        } else {
            this.needToApplyData = true;
        }
    }
    @TWService("PanOntoSelected")
    PanOntoSelected(): void {
        if (this.svgRenderer) {
            this.svgRenderer.panOntoElement();
        }
    }
    renderHtml(): string {
        require("./styles/runtime.css");

        return '<div class="widget-content widget-svg-viewer"></div>';
    };

    afterRender(): void {
        this.updateDrawnSvg();
    }

    createRendererSettings(): SvgRendererOptions {
        return {
            overrideIdField: this.getProperty("DataIdField") || "elementName",
            idField: this.getProperty("SVGIdField") || "id",
            imageHeight: this.getProperty("ImageHeight") || "100%",
            imageWidth: this.getProperty("ImageWidth") || "100%",
            zoomPanOptions: {
                isEnabled: this.getProperty("ZoomPanEnabled"),
                initialZoom: this.getProperty("InitialZoom") || 1,
                smoothScroll: this.getProperty("SmoothScroll"),
                initialXPosition: this.getProperty("InitialXPosition") || 0,
                initialYPosition: this.getProperty("InitialYPosition") || 0
            },
            elementClickedCallback: this.generateEventTriggerForHandlerNamed("ElementClicked"),
            elementDoubleClickedCallback: this.generateEventTriggerForHandlerNamed("ElementDoubleClicked"),
            elementMiddleClickedCallback: this.generateEventTriggerForHandlerNamed("ElementMiddleClicked"),
            selectedOverride: this.styleToOverrideList(),
            selectionTrigger: this.applySelection,
            applyToChildren: this.getProperty("ApplyToChildren"),
            resetOverrideAttributeIfEmpty: this.getProperty("ResetOverrideAttributeIfEmpty")
        }
    }

    styleToOverrideList(): SvgOverride {
        let selectedOverride = <SvgOverride>{};;
        let selectedStyle = TW.getStyleFromStyleDefinition(this.getProperty('SelectedStyle'));
        if (selectedStyle.image)
            selectedOverride["override-fill"] = "url(#img1)";
        if (selectedStyle.backgroundColor)
            selectedOverride["override-fill"] = selectedStyle.backgroundColor;
        if (selectedStyle.lineColor)
            selectedOverride["override-stroke"] = selectedStyle.lineColor;
        if (selectedStyle.lineThickness)
            selectedOverride["override-stroke-width"] = selectedStyle.lineThickness;

        return selectedOverride;
    }

    generateEventTriggerForHandlerNamed = (handlerName) => (elementName: string) => {
        this.setProperty("SelectedElementID", elementName);
        this.applySelection([elementName]);
        this.jqElement.triggerHandler(handlerName);
    }

    applySelection = (elementName: string[]) => {
        let selectedRows = [];
        const overrideField = this.getProperty("OverrideListField");
        const dataField = this.getProperty("DataIdField");
        // also update the row selection in the data array
        for (let i = 0; i < this.svgData.rows.length; i++) {
            const row = this.svgData.rows[i];
            if (overrideField) {
                for (const override of row[overrideField].rows) {
                    if(override[dataField] == elementName) {
                        selectedRows.push(i);
                    }
                }
            } else {
                if (row[dataField] == elementName) {
                    selectedRows.push(i);
                }
            }
        }
        this.updateSelection("Data", [...new Set(selectedRows)]);
    }

    async updateDrawnSvg(): Promise<void> {
        if (!this.svgFileUrl) {
            return;
        }
        if (this.svgRenderer) {
            this.svgRenderer.dispose();
        }
        this.svgRenderer = new SvgElement(this.jqElement, this.svgFileUrl, this.createRendererSettings());
        await this.svgRenderer.createSvgElement();
        if (this.needToApplyData) {
            this.svgRenderer.applyOverrides(this.transformNestedInfotableIfNeeded(this.svgData.rows));
            this.needToApplyData = false;
        }
        this.jqElement.triggerHandler("Loaded");
    }

    updateProperty(info: TWUpdatePropertyInfo): void {
    }

    handleSelectionUpdate(propertyName, selectedRows: any[], selectedRowIndices) {
        switch (propertyName) {
            case "Data":
                if (this.svgRenderer) {
                    let elements = [];
                    const overrideField = this.getProperty("OverrideListField");
                    const dataField = this.getProperty("DataIdField");
                    if (overrideField) {
                        elements = elements.concat(selectedRows.reduce((ac, el) => ac.concat(el[overrideField].rows.filter((x) => x.selectable !== false).map(x => x[dataField])), []));
                    } else {
                        elements = elements.concat(selectedRows.map((el) => el[dataField]));
                    }

                    this.svgRenderer.triggerElementSelectionByName(elements);
                }
        }
    }

    transformNestedInfotableIfNeeded(overrideRows: any[]) {
        const overrideListField = this.getProperty("OverrideListField");
        if (overrideListField) {
            const clonedData = JSON.parse(JSON.stringify(overrideRows));
            for (const row of overrideRows) {
                if (row[overrideListField]) {
                    for (const override of row[overrideListField].rows) {
                        const newRow = Object.assign({}, row);
                        for (const key in override) {
                            if (key != this.getProperty("DataIdField")) {
                                newRow["override-" + key] = override[key];
                            } else {
                                newRow[key] = override[key];
                            }
                        }
                        clonedData.push(newRow);
                    }
                }
            }
            return clonedData;
        } else {
            return overrideRows;
        }
    }

    beforeDestroy?(): void {
        if (this.svgRenderer) {
            this.svgRenderer.dispose();
        }
    }
}