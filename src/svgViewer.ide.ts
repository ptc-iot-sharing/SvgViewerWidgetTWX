// automatically import the css file
import { ThingworxComposerWidget } from './support/widgetRuntimeSupport'

@ThingworxComposerWidget
export class SvgViewerWidget extends TWComposerWidget {

    widgetIconUrl(): string {
        return require('./images/icon.png');
    }

    widgetProperties(): TWWidgetProperties {
        require("./styles/ide.css");
        return {
            name: 'SvgViewer Widget',
            description: 'A svg viewer allowing viewing svg files, as well as interacting with them dynamically.',
            category: ['SVG'],
            supportsAutoResize: true,
            properties: {
                SVGFileUrl: {
                    defaultValue: '',
                    isBindingTarget: true,
                    baseType: 'IMAGELINK',
                    description: 'A link to a svg file'
                },
                ImageWidth: {
                    defaultValue: '100%',
                    description: 'The image width. Can be set in px, % or other units',
                    baseType: 'STRING'
                },
                ImageHeight: {
                    defaultValue: '100%',
                    description: 'The image height. Can be set in px, % or other units',
                    baseType: 'STRING'
                },
                Data: {
                    isBindingTarget: true,
                    isEditable: false,
                    description: 'A infotable with overrides for svg attribute styles',
                    baseType: 'INFOTABLE',
                },
                SVGIdField: {
                    baseType: 'STRING',
                    defaultValue: 'id',
                    description: "The attribute of the svg used to uniquely identify elements"
                },
                SelectedElementID: {
                    description: "The id of the element that was just clicked",
                    isBindingSource: true,
                    baseType: 'STRING'
                },
                DexpiDataSource: {
                    description: 'Specifies if the svg file is a svg file converted from dexpi.',
                    baseType: 'BOOLEAN',
                    defaultValue: false
                },
                SmoothScroll: {
                    description: 'Enable or disable smooth scrolling of the pan and zoom functionality',
                    baseType: 'BOOLEAN',
                    defaultValue: true
                },
                InitialXPosition: {
                    description: 'The initial X position of the zoomed file',
                    baseType: 'INTEGER',
                    defaultValue: 0
                },
                InitialYPosition: {
                    description: 'The initial Y position of the zoomed file',
                    baseType: 'INTEGER',
                    defaultValue: 0
                },
                InitialZoom: {
                    description: 'The initial zoom of the svg',
                    baseType: 'NUMBER',
                    defaultValue: 1
                }
            }
        }
    };

    widgetServices(): Dictionary<TWWidgetService> {
        return {
            "TestService": {
            }
        };
    };

    widgetEvents(): Dictionary<TWWidgetEvent> {
        return {
            ElementClicked: {
                warnIfNotBound: true,
                description: 'Triggered after an named element was clicked'
            }
        };
    }

    renderHtml(): string {
        return '<div class="widget-content widget-svg-viewer"></div>';
    };

    afterRender(): void {
    }

    beforeDestroy(): void {
    }

}