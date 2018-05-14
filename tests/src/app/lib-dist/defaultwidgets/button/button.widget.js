import { Component } from "@angular/core";
var ButtonWidget = /** @class */ (function () {
    function ButtonWidget() {
    }
    ButtonWidget.decorators = [
        { type: Component, args: [{
                    selector: 'sf-button-widget',
                    template: '<button (click)="button.action($event)">{{button.label}}</button>'
                },] },
    ];
    return ButtonWidget;
}());
export { ButtonWidget };
