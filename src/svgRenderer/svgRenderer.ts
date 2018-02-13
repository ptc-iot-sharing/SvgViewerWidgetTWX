let panzoom = require('panzoom');
/**
 * Options that can be applied to the svg elements
 */
export interface SvgRendererOptions {
    /**
     * Svg attribute that uniquely identifes an element
     */
    idField: string;

    /** 
     * Treat files as dexpi
     */
    isDexpiDataSource: boolean;

    /**
     * Enable or disable smooth scrolling of the pan and zoom functionality
     */
    smoothScroll: boolean;

    /**
     * The initial X position of the zoomed file
     */
    initialXPosition: number;

    /**
     * The initial Y position of the zoomed file
     */
    initialYPosition: number;
    
    /**
     * The initial zoom of the svg
     */
    initialZoom: number;
}


export class SvgElement {
    container: JQuery;

    svgFileUrl: string;

    options: SvgRendererOptions;

    panandZoomInstance: any;

    constructor(container: JQuery, svgFile: string, options: SvgRendererOptions) {
        this.svgFileUrl = svgFile;
        this.container = container;
        this.options = options;
    }

    public async createSvgElement() {
        // get the svg data as we need to inline it
        let svgData = await this.loadSvgFile(this.svgFileUrl);
        // add it to the container
        this.container.html(svgData);
        let rootGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rootGroup.setAttributeNS(null, "id", "rootGroup");
        let svg = this.container.find("svg")[0];
        // move all the nodes from the svg into the root group
        Array.prototype.slice.call(svg.childNodes).forEach(element => rootGroup.appendChild(element));
        svg.appendChild(rootGroup);
        // apply pan and zoom onto the svg
        this.panandZoomInstance = panzoom(this.container.find("svg>#rootGroup")[0], {
            smoothScroll: this.options.smoothScroll
        }).zoomAbs(
            this.options.initialXPosition, // initial x position
            this.options.initialYPosition, // initial y position
            this.options.initialZoom  // initial zoom 
          );
        if (this.options.isDexpiDataSource) {
            // for dexpi files, the imagemap is at the start of the file
            // because svg files are rendered in the order of the nodes, we must move the imageMap note at the end
            let imageMap = this.container.find("#ImageMap");
            // remove the imagemap
            imageMap.remove();
            // append it to the svg
            imageMap.appendTo(imageMap.find("svg"));
        }
    }

    public dispose() {
        this.panandZoomInstance.dispose();
    }

    /**
     * Downloads the referenced svg file and returns it as text
     * @param file The file url to download
     */
    private loadSvgFile(file): Promise<string> {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: file,
                type: 'get',
                dataType: 'text',
                success: function (data) {
                    resolve(data);
                },
                error: reject
            })
        })
    }
}