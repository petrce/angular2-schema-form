import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DatePickerModule } from '@progress/kendo-angular-dateinputs';

import { FormElementComponent } from './formelement.component';
import { FormComponent } from './form.component';
import { WidgetChooserComponent } from './widgetchooser.component';
import {
	ArrayWidget,
	ButtonWidget,
	ObjectWidget,
	CheckboxWidget,
	FileWidget,
	IntegerWidget,
	TextAreaWidget,
	RadioWidget,
	RangeWidget,
	SelectWidget,
	StringWidget
} from './defaultwidgets';
import { DefaultWidget } from './default.widget';
const defaultWidgets = [
	ArrayWidget,
	ButtonWidget,
	ObjectWidget,
	CheckboxWidget,
	FileWidget,
	IntegerWidget,
	TextAreaWidget,
	RadioWidget,
	RangeWidget,
	SelectWidget,
	StringWidget
];

import { WidgetRegistry } from './widgetregistry';
import { DefaultWidgetRegistry } from './defaultwidgets';
import { SchemaValidatorFactory, ZSchemaValidatorFactory } from './schemavalidatorfactory';
import { FormElementComponentAction } from './formelement.action.component';

import { DateWidget } from './custom';
const customWidgets = [DateWidget];

const moduleProviders = [
	{
		provide: WidgetRegistry,
		useClass: DefaultWidgetRegistry
	},
	{
		provide: SchemaValidatorFactory,
		useClass: ZSchemaValidatorFactory
	}
];

@NgModule({
	imports: [CommonModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, DatePickerModule],
	declarations: [FormElementComponent, FormElementComponentAction, FormComponent, WidgetChooserComponent, DefaultWidget, ...defaultWidgets, ...customWidgets],
	entryComponents: [FormElementComponent, FormElementComponentAction, FormComponent, WidgetChooserComponent, ...defaultWidgets, ...customWidgets],
	exports: [FormComponent, FormElementComponent, FormElementComponentAction, WidgetChooserComponent, ...defaultWidgets, ...customWidgets]
})
export class SchemaFormModule {
	static forRoot(providers?: [{ provide: any; useClass: any }]): ModuleWithProviders {
		if (providers) {
			providers.forEach(provider => {
				const found = moduleProviders.find(p => p.provide === provider.provide);
				found.useClass = provider.useClass;
			});
		}

		return {
			ngModule: SchemaFormModule,
			providers: [...moduleProviders]
		};
	}
}
