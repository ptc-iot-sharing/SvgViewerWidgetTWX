import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'

import { SvgElement, SvgRendererOptions, SvgOverride } from './svgRenderer/svgRenderer'

@ThingworxRuntimeWidget
export class SvgViewerWidget extends TWRuntimeWidget {

    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }

    // the renderer currently used
    private svgRenderer: SvgElement;

    @TWProperty("SVGFileUrl")
    set svgFileUrl(value: string) {
        if (!TW.IDE.isImageLinkUrl(value)) {
            //check to see if imageLink is an actual URL;
            this.setProperty("SVGFileUrl", '/Thingworx/MediaEntities/' + TW.encodeEntityName(value));
        }
        this.updateDrawnSvg();
    };

    @TWProperty("Data")
    set svgData(value: TWInfotable) {
        if (this.svgRenderer) {
            this.svgRenderer.applyOverrides(value.rows);
        }
    }
    @TWService("PanOntoSelected")
    PanOntoSelected(): void {
        if(this.svgRenderer) {
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
            isDexpiDataSource: this.getProperty('DexpiDataSource') || false,
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
        this.applySelection(elementName);
        this.jqElement.triggerHandler(handlerName);
    }

    applySelection = (elementName: string) => {
        let selectedRows = [];
        // also update the row selection in the data array
        for (let i = 0; i < this.svgData.rows.length; i++) {
            const row = this.svgData.rows[i];
            if (row[this.getProperty("DataIdField")] == elementName) {
                selectedRows.push(i);
            }
        }
        this.updateSelection("Data", selectedRows);
    }

    updateDrawnSvg(): void {
        if (!this.svgFileUrl) {
            return;
        }
        this.svgRenderer = new SvgElement(this.jqElement, this.svgFileUrl, this.createRendererSettings())
        this.svgRenderer.createSvgElement();
    }

    updateProperty(info: TWUpdatePropertyInfo): void {
    }

    handleSelectionUpdate(propertyName, selectedRows, selectedRowIndices) {
        switch (propertyName) {
            case "Data":
                if(this.svgRenderer) {
                    let elementName = selectedRows.length > 0 ? selectedRows[0][this.getProperty("DataIdField")] : "";
                    this.svgRenderer.triggerElementSelectionByName(elementName);
                }
        }
    }

    beforeDestroy?(): void {
        if (this.svgRenderer) {
            this.svgRenderer.dispose();
        }
    }
}