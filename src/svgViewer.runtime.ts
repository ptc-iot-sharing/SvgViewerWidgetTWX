import { ThingworxRuntimeWidget, TWService, TWProperty } from 'typescriptwebpacksupport'
import { SvgElement, SvgRendererOptions, SvgOverride, SvgElementIdentifier } from './svgRenderer/svgRenderer'

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
            this.svgRenderer.applyOverrides(this.transformDataToOverrideList(value.rows));
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
            selectorField: this.getProperty("DataSelectorField") || "",
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
            selectedOverride["fill"] = "url(#img1)";
        if (selectedStyle.backgroundColor)
            selectedOverride["fill"] = selectedStyle.backgroundColor;
        if (selectedStyle.lineColor)
            selectedOverride["stroke"] = selectedStyle.lineColor;
        if (selectedStyle.lineThickness)
            selectedOverride["stroke-width"] = selectedStyle.lineThickness;

        return selectedOverride;
    }

    generateEventTriggerForHandlerNamed = (handlerName) => (elementName: string) => {
        this.setProperty("SelectedElementID", elementName);
        this.applySelection([{ name: elementName }]);
        this.jqElement.triggerHandler(handlerName);
    }

    applySelection = (elementNames: SvgElementIdentifier[]) => {
        let selectedRows = [];
        const overrideField = this.getProperty("OverrideListField");
        const dataField = this.getProperty("DataIdField");
        // also update the row selection in the data array
        for (let i = 0; i < this.svgData.rows.length; i++) {
            const row = this.svgData.rows[i];
            for (const elementName of elementNames) {
                if (overrideField) {
                    for (const override of row[overrideField].rows) {
                        if (override[dataField] == elementName.name) {
                            selectedRows.push(i);
                        }
                    }
                } else {
                    if (row[dataField] == elementName.name) {
                        selectedRows.push(i);
                    }
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
            this.svgRenderer.applyOverrides(this.transformDataToOverrideList(this.svgData.rows));
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
                    let elements: SvgElementIdentifier[] = [];
                    const overrideField = this.getProperty("OverrideListField");
                    const dataField = this.getProperty("DataIdField");
                    const selectorField = this.getProperty("DataSelectorField");
                    if (overrideField) {
                        elements = elements.concat(selectedRows.reduce((ac, el) => ac.concat(el[overrideField].rows.filter((x) => x.selectable !== false).map(x => ({ name: x[dataField], selector: x[selectorField] }))), []));
                    } else {
                        elements = elements.concat(selectedRows.map((el) => ({ name: el[dataField], selector: el[selectorField] })));
                    }

                    this.svgRenderer.triggerElementSelectionByName(elements);
                }
        }
    }

    transformDataToOverrideList(overrideRows: any[]) {
        const overrideListField = this.getProperty("OverrideListField");
        if (overrideListField) {
            const overrideList = [];
            for (const row of overrideRows) {
                if (row[overrideListField]) {
                    for (const override of row[overrideListField].rows) {
                        const newRow = {};
                        for (const key in override) {
                            newRow[key] = override[key];
                        }
                        overrideList.push(newRow);
                    }
                }
            }
            return overrideList;
        } else {
            const overrideList = [];

            for (const override of overrideRows) {
                for (const key in override) {
                    const newRow = {};
                    if (key.startsWith("override-")) {
                        newRow[key.substr("override-".length)] = override[key];
                    }
                    newRow[this.getProperty("DataIdField")] = override[this.getProperty("DataIdField")];
                    overrideList.push(newRow);
                }
            }
            return overrideList;
        }
    }

    beforeDestroy?(): void {
        if (this.svgRenderer) {
            this.svgRenderer.dispose();
        }
    }
}