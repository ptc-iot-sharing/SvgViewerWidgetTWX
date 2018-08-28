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
                Data: {
                    isBindingTarget: true,
                    isEditable: false,
                    description: 'A infotable with the element information',
                    baseType: 'INFOTABLE',
                },
                DataIdField: {
                    baseType: 'FIELDNAME',
                    sourcePropertyName: 'Data',
                    defaultValue: 'elementName',
                    description: 'The field in the Data infotable to use for matching with the SVGIdField'
                },
                SVGIdField: {
                    baseType: 'STRING',
                    defaultValue: 'id',
                    description: "The attribute of the svg used to uniquely identify elements"
                },
                SelectedElementID: {
                    description: "The id of the element that was just clicked",
                    isBindingSource: true,
                    baseType: "STRING"
                },
                SelectedStyle: {
                    description: 'Style defining how a selected element appears.',
                    baseType: 'STYLEDEFINITION'
                },
                DexpiDataSource: {
                    description: 'Specifies if the svg file is a svg file converted from dexpi.',
                    baseType: 'BOOLEAN',
                    defaultValue: false
                },
                ApplyToChildren: {
                    description: 'Whether to apply the overrides to the element or to its children',
                    baseType: 'BOOLEAN',
                    defaultValue: true
                },
                ResetOverrideAttributeIfEmpty: {
                    description: 'If an override attribute is empty set that value as undefiend. If False, it will keep the old attribute value',
                    baseType: 'BOOLEAN',
                    defaultValue: true
                },
                ZoomPanEnabled: {
                    description: 'Enable or disable zooming and panning',
                    baseType: 'BOOLEAN',
                    defaultValue: true
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
                },
                ImageWidth: {
                    defaultValue: '100%',
                    description: 'The image width. Can be set in px, % or other units',
                    baseType: 'STRING',
                    isVisible: false
                },
                ImageHeight: {
                    defaultValue: '100%',
                    description: 'The image height. Can be set in px, % or other units',
                    baseType: 'STRING',
                    isVisible: false
                }
            }
        }
    };

    widgetServices(): Dictionary<TWWidgetService> {
        return {
            "PanOntoSelected": {
                description: "Pans onto the selected element in the svg. PanAndZoom must be enabled for this to work."
            }
        };
    };

    widgetEvents(): Dictionary<TWWidgetEvent> {
        return {
            ElementClicked: {
                warnIfNotBound: false,
                description: 'Triggered after an named element was clicked'
            },
            ElementDoubleClicked: {
                warnIfNotBound: false,
                description: 'Triggered after an named element double was clicked'
            },
            ElementMiddleClicked: {
                warnIfNotBound: false,
                description: 'Triggered after an named element middle was clicked'
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

    afterSetProperty(name: string, value): boolean {
        let props = this.allWidgetProperties().properties;
        if (name == "ZoomPanEnabled") {
            props["SmoothScroll"]["isVisible"] = value;
            props["InitialXPosition"]["isVisible"] = value;
            props["InitialYPosition"]["isVisible"] = value;
            props["InitialZoom"]["isVisible"] = value;
            props["ImageWidth"]["isVisible"] = !value;
            props["ImageHeight"]["isVisible"] = !value;
            this.updateProperties();
            return value;
        }
        return false;
    }

}