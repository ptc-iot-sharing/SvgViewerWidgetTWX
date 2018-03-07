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
     * Height of the image. Use css units
     */
    imageHeight: string;

    /**
     * Width of the image. Use css units
     */
    imageWidth: string;

    /**
     * The name of the field in the override list
     */
    overrideIdField: string;

    zoomPanOptions: {
        /**
         * Enable or disable zoom and pan in the svg
         */
        isEnabled: boolean;

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
    /** 
     * Callback fired when a element is clicked
     */
    elementClickedCallback(elementName: string): void;

    /** 
     * Callback fired when a element is double clicked
     */
    elementDoubleClickedCallback(elementName: string): void;

    /** 
     * Callback fired when a element is middle clicked
     */
    elementMiddleClickedCallback(elementName: string): void;

    /** 
     * List of overrides for the selected element
     */
    selectedOverride: SvgOverride;
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

    previousOverrideElements: { element: Element, cachedStyle: string }[] = [];

    constructor(container: JQuery, svgFile: string, options: SvgRendererOptions) {
        this.svgFileUrl = svgFile;
        this.container = container;
        this.options = options;
        // clear the contents of the contaienr
        container[0].innerHTML = "";
        // create css styles out of the selected overrides and append them to the widget
        let styleAttr: { attr: string, value: string }[] = [];
        for (const attrOverride in this.options.selectedOverride) {
            if (this.options.selectedOverride.hasOwnProperty(attrOverride)) {
                if (attrOverride.startsWith("override-") && attrOverride != "override-tooltip") {
                    // construct the style attr
                    styleAttr.push({ attr: attrOverride.substr("override-".length), value: this.options.selectedOverride[attrOverride] });
                }
            }
        }
        let selectedCssStyleDef = `#${container[0].id} [svg-selected] {`;
        selectedCssStyleDef += styleAttr.map((val) => `${val.attr}: ${val.value} !important`).join(";\n");
        selectedCssStyleDef += "}";

        let selectedCssStyle = document.createElement("style");
        selectedCssStyle.type = "text/css";
        selectedCssStyle.innerHTML = selectedCssStyleDef;

        container[0].appendChild(selectedCssStyle);
    }

    public async createSvgElement() {
        // get the svg data as we need to inline it
        let svgData = await this.loadSvgFile(this.svgFileUrl);
        // add it to the container
        this.container[0].innerHTML += (svgData);
        // create a new root group for all the groups in this svg
        let rootGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rootGroup.setAttributeNS(null, "id", "rootGroup");
        this.svgElement = this.container.find("svg")[0];
        // move all the nodes from the svg into the root group
        Array.prototype.slice.call(this.svgElement.childNodes).forEach(element => rootGroup.appendChild(element));
        this.svgElement.appendChild(rootGroup);
        if (this.options.zoomPanOptions.isEnabled) {
            // apply pan and zoom onto the svg
            this.panandZoomInstance = panzoom(this.svgElement.querySelectorAll("#rootGroup")[0], {
                smoothScroll: this.options.zoomPanOptions.smoothScroll,
                bounds: true
            }).zoomAbs(
                this.options.zoomPanOptions.initialXPosition, // initial x position
                this.options.zoomPanOptions.initialYPosition, // initial y position
                this.options.zoomPanOptions.initialZoom  // initial zoom 
            );
        } else {
            // set the width and height
            this.svgElement.setAttribute("height", this.options.imageHeight);
            this.svgElement.setAttribute("width", this.options.imageWidth);
        }
        // register a listener for all the clickable elements in the svg
        $(this.svgElement).on("click", "[svg-clickable]", (event) => {
            this.triggerElementSelection(event.currentTarget);
            // fire the callback with the element name
            this.options.elementClickedCallback(event.currentTarget.getAttribute(this.options.idField));
        });
        // register a listener for all the clickable elements in the svg, for double click
        $(this.svgElement).on("dblclick", "[svg-clickable]", (event) => {
            this.triggerElementSelection(event.currentTarget);
            // fire the callback with the element name
            this.options.elementDoubleClickedCallback(event.currentTarget.getAttribute(this.options.idField));
        });
        // register a listener for all the clickable elements in the svg, for mouse down, listening for middle click
        $(this.svgElement).on("mousedown", "[svg-clickable]", (event) => {
            if (event.which == 2) {
                this.triggerElementSelection(event.currentTarget);
                // fire the callback with the element name
                this.options.elementMiddleClickedCallback(event.currentTarget.getAttribute(this.options.idField));
            }
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

    private triggerElementSelection(element: Element) {
        // remove the override from the selected elements
        $(this.svgElement).find("[svg-selected]").removeAttr("svg-selected");
        // add the tag to the element
        element.setAttribute("svg-selected", "");
    }

    public triggerElementSelectionByName(elementName: string) {
        // remove the override from the selected elements
        let selectedElements = $(this.svgElement).find("[svg-selected]").removeAttr("svg-selected");
        // if the element has no name, just return
        if (!elementName) {
            return;
        }
        let elements;
        if (this.options.isDexpiDataSource) {
            // we if are dealing with dexpi data apply changes to the image map
            elements = this.svgElement.querySelectorAll('#ImageMap>rect[' + this.options.idField + '="' + elementName + '"]');

        } else {
            // find the elements
            elements = this.svgElement.querySelectorAll('[' + this.options.idField + '="' + elementName + '"] *');
        }
        // iterate over them
        for (const element of elements) {
            // add the tag to the element
            element.setAttribute("svg-selected", "");
        }
    }
    /**
     * Creates a new title element as child for the given element. If it already exists, then it's reused
     * @param element Parent element to use
     * @param value Test to use as title
     */
    private addTitleToElement(element: Element, value: string) {
        if (element.querySelector("title")) {
            element.querySelector("title").textContent = value;
        } else {
            let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = value;
            element.insertBefore(title, element.firstChild);
        }
    }

    public applyOverrides(overrideList: SvgOverride[]) {
        // reset the existing elements
        for (const elementInfo of this.previousOverrideElements) {
            elementInfo.element.setAttribute("style", elementInfo.cachedStyle);
        }
        // remove all exiting svg-clickable attributes
        $(this.svgElement).find("[svg-clickable]").removeAttr("svg-clickable");
        // iterate over the overrides
        for (const override of overrideList) {
            // find the elements to override
            let elements = this.svgElement.querySelectorAll('[' + this.options.idField + '="' + override[this.options.overrideIdField] + '"] *');
            // iterate over them
            for (const element of elements) {
                // skip over title elements as they don't need to have this
                if (element.tagName == "title") continue;
                // for dexpi, we do not need to apply overrides to the elements in imageMap
                if (this.options.isDexpiDataSource && element.parentElement.id == "ImageMap") continue;
                this.applyOverrideToElement(element, override);
                // set the elements as clickable if we are not dealing with dexpi data
                if (!this.options.isDexpiDataSource) {
                    this.applyClickableToElement(element);
                }
            }
            // we if are dealing with dexpi data, handle the image map as well
            if (this.options.isDexpiDataSource) {
                let imageMapElements = this.svgElement.querySelectorAll('#ImageMap>rect[' + this.options.idField + '="' + override[this.options.overrideIdField] + '"]');
                for (const imageMapElement of imageMapElements) {
                    this.applyClickableToElement(imageMapElement);
                    // iterate over the attributes to override
                    for (const attrOverride in override) {
                        if (override.hasOwnProperty(attrOverride) && attrOverride == "override-tooltip") {
                            this.addTitleToElement(imageMapElement, override[attrOverride]);
                        }
                    }
                }
            }
        }
    }

    private applyClickableToElement(element: Element) {
        // mark the element as clickable
        element.setAttribute("svg-clickable", "");
        (<SVGElement>element).style.cursor = 'pointer';
        // if there is no previously set fill, then set one
        if (!(<SVGElement>element).style.fill) {
            (<SVGElement>element).style.fill = 'transparent';
        }
    }

    private applyOverrideToElement(element: Element, override: SvgOverride) {
        this.previousOverrideElements.push({ element: element, cachedStyle: element.getAttribute("style") });
        // iterate over the attributes to override
        for (const attrOverride in override) {
            if (override.hasOwnProperty(attrOverride)) {
                if (attrOverride.startsWith("override-") && attrOverride != "override-tooltip") {
                    // construct the style attr based on overrides
                    (<SVGElement>element).style[attrOverride.substr("override-".length)] = override[attrOverride];
                }
                if (!this.options.isDexpiDataSource && attrOverride == "override-tooltip") {
                    this.addTitleToElement(element, override[attrOverride]);
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