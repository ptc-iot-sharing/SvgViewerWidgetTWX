import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'

import {SvgElement, SvgRendererOptions} from './svgRenderer/svgRenderer'

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


    renderHtml(): string {
        require("./styles/runtime.css");
        return '<div class="widget-content widget-svg-viewer"></div>';
    };

    async afterRender(): Promise<void> {
   
        this.updateDrawnSvg();
    }

    createRendererSettings(): SvgRendererOptions {
        return {
            isDexpiDataSource: this.getProperty('DexpiDataSource') || false,
            idField: this.getProperty("SVGIdField") || "class",
            initialZoom: this.getProperty("InitialZoom") || 1,
            smoothScroll: this.getProperty("SmoothScroll"),
            initialXPosition: this.getProperty("InitialXPosition") || 0,
            initialYPosition: this.getProperty("InitialYPosition") || 0
        }
    }
    
    updateDrawnSvg():void {
        if(!this.svgFileUrl) {
            return;
        }
        this.svgRenderer = new SvgElement(this.jqElement, this.svgFileUrl, this.createRendererSettings() )
        this.svgRenderer.createSvgElement();    
    }

    updateProperty(info: TWUpdatePropertyInfo): void {
    }

    @TWService("TestService")
    testService(): void {
        alert("Called via binding");
    }

    beforeDestroy?(): void {
        if(this.svgRenderer) {
            this.svgRenderer.dispose();
        }
    }
}