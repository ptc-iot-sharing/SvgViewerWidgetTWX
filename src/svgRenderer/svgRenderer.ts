/**
 * Options that can be applied to the svg elements
 */
export interface SvgElementOptions {
    /**
     * Svg attribute that uniquely identifes an element
     */
    idField: string;

    /** 
     * Treat files as dexpi
     */
    isDexpiDataSource: boolean;
}


export class SvgElement {
    container: JQuery;

    svgFileUrl: string;

    options: SvgElementOptions;

    constructor(container: JQuery, svgFile: string, options: SvgElementOptions) {
        this.svgFileUrl = svgFile;
        this.container = container;
        this.options = options;
    }

    public async createSvgElement() {
        // get the svg data as we need to inline it
        let svgData = await this.loadSvgFile(this.svgFileUrl);
        // add it to the container
        this.container.html(svgData);
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