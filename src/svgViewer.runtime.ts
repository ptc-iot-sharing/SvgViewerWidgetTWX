/// <reference path="./svgRenderer/svgRenderer.ts" />

import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'
import { SvgElement } from './svgRenderer/svgRenderer';

@ThingworxRuntimeWidget
export class SvgViewerWidget extends TWRuntimeWidget {
    
    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Handles the internals of working with the svg files
     */
    private internalRenderer;

    private svgRenderer: SvgElement;

    @TWProperty("SVGIdField")
    set svgIdField(value: string) {};

    @TWProperty("SVGFileUrl")
    set svgFileUrl(value: string) {
        this.updateDrawnSvg();
    };


    renderHtml(): string {
        return '<div class="widget-content widget-svg-viewer"></div>';
    };

    async afterRender(): Promise<void> {
        debugger;
        this.internalRenderer = await import("./svgRenderer/svgRenderer");
        debugger
    
        this.updateDrawnSvg();
    }
    
    updateDrawnSvg():void {
        this.svgRenderer = new this.internalRenderer.SvgElement(this.jqElement, this.svgFileUrl, {
            isDexpiDataSource: this.getProperty('DexpiDataSource'),
            idField: this.svgIdField
        })

        this.svgRenderer.createSvgElement();    
    }

    updateProperty(info: TWUpdatePropertyInfo): void {
    }

    @TWService("TestService")
    testService(): void {
        alert("Called via binding");
    }

    beforeDestroy?(): void {
        // resetting current widget
    }
}