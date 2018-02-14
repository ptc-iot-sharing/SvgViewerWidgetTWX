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

    /** 
     * Callback fired when a element is clicked
     */
    elementClickedCallback(elementName: string): void;
}

export interface SvgOverride {
    /**
     * The name of the element to override
     */
    elementName: string;
    /**
     * A list of overrides whose keys start with override- and the attribute name to override
     */
    [override: string]: any;
}

export class SvgElement {
    container: JQuery;

    svgFileUrl: string;

    options: SvgRendererOptions;

    panandZoomInstance: any;

    svgElement: HTMLElement;

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
        this.svgElement = this.container.find("svg")[0];
        // move all the nodes from the svg into the root group
        Array.prototype.slice.call(this.svgElement.childNodes).forEach(element => rootGroup.appendChild(element));
        this.svgElement.appendChild(rootGroup);
        // apply pan and zoom onto the svg
        this.panandZoomInstance = panzoom(this.svgElement.querySelectorAll("#rootGroup")[0], {
            smoothScroll: this.options.smoothScroll
        }).zoomAbs(
            this.options.initialXPosition, // initial x position
            this.options.initialYPosition, // initial y position
            this.options.initialZoom  // initial zoom 
        );
        // register a listener for all the clickable elements in the svg
        $(this.svgElement).on("click", "[svg-clickable]", (event) => {
            // fire the callback with the element name
            this.options.elementClickedCallback(event.currentTarget.getAttribute(this.options.idField));
        });
        if (this.options.isDexpiDataSource) {
            // for dexpi files, the imagemap is at the start of the file
            // because svg files are rendered in the order of the nodes, we must move the imageMap note at the end
            let imageMap = this.container.find("#ImageMap");
            // remove the imagemap
            imageMap.remove();
            // append it to the svg
            imageMap.appendTo(this.svgElement.firstElementChild);
        }
    }

    public applyOverrides(overrideList: SvgOverride[]) {
        // remove all exiting svg-clickable attributes
        $(this.svgElement).find("[svg-clickable]").removeAttr("svg-clickable");
        // iterate over the overrides
        for (const override of overrideList) {
            // find the elements to override
            let elements = this.svgElement.querySelectorAll('[' + this.options.idField + '="' + override.elementName + '"] *');
            // iterate over them
            for (const element of elements) {
                // iterate over the attributes to override
                for (const attrOverride in override) {
                    if (override.hasOwnProperty(attrOverride) && attrOverride.startsWith("override-")) {
                        // override them
                        element.setAttribute(attrOverride.substr("override-".length), override[attrOverride]);
                    }
                }
                // set the elements as clickable if we are not dealing with dexpi data
                if (!this.options.isDexpiDataSource) {
                    element.setAttribute("fill", "transparent");
                    (<SVGElement>element).style.cursor = 'pointer';
                    // mark the element as clickable
                    element.setAttribute("svg-clickable", "");
                }
            }
            // we if are dealing with dexpi data, handle the image map as well
            if (this.options.isDexpiDataSource) {
                let imageMapElements = this.svgElement.querySelectorAll('#ImageMap>rect[' + this.options.idField + '="' + override.elementName + '"]');
                for (const imageMapElement of imageMapElements) {
                    imageMapElement.setAttribute("fill", "transparent");
                    (<SVGElement>imageMapElement).style.cursor = 'pointer';
                    // mark the element as clickable
                    imageMapElement.setAttribute("svg-clickable", "");
                }
            }
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