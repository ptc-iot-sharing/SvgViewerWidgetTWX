import { x } from "./babelExample";

export function createDataElement(container: HTMLElement, value: any) : HTMLElement {
    container.innerText = value;
    let t= x(1);
    return container;
}