import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'

@ThingworxRuntimeWidget
class DemoWebpackWidget extends TWRuntimeWidget {
    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }
    internalLogic;

    @TWProperty("Value")
    set value(value: string) {
        this.internalLogic.createDataElement(this.jqElement[0], value)
    };

    renderHtml(): string {
        return '<div class="widget-content widget-demo"></div>';
    };

    async afterRender(): Promise<void> {
        this.internalLogic = await import("./internalLogic/internalLogic");
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