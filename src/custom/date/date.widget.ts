import { Component, AfterViewInit } from '@angular/core';

import { ControlWidget } from '../../widget';
import { FormProperty } from '../../model/formproperty';

@Component({
	selector: 'sf-date-widget',
	templateUrl: './date.widget.html'
})
export class DateWidget extends ControlWidget implements AfterViewInit {
	public minDate: Date = null;
	public maxDate: Date = null;

	ngAfterViewInit() {
		const control = this.control;

		this.control.valueChanges.subscribe((newValue: Date) => {
			console.log(`this.valueChanges() - ${newValue}`);
			this.formProperty.setValue(this.dateAsString(newValue == null ? this.getDefaultValue() : newValue), false);
		});

		const targetPropertyMax = this.findTargetProperty(this.schema.max);
		if (targetPropertyMax) {
			targetPropertyMax.valueChanges.subscribe((newValue: string) => {
				const newDate = this.parseDate(newValue);

				console.log(`targetPropertyMax.valueChanges() - ${newValue}, ${newDate}`);

				if (newDate != null && newDate < this.control.value) {
					this.control.setValue(newDate);
				}

				this.maxDate = newDate;
				// this.formProperty.setValue(newValue.toISOString().substring(0, 10), false);
			});
		}

		const targetPropertyMin = this.findTargetProperty(this.schema.min);
		if (targetPropertyMin) {
			targetPropertyMin.valueChanges.subscribe((newValue: string) => {
				const newDate = this.parseDate(newValue);

				console.log(`targetPropertyMin.valueChanges() - ${newValue}, ${newDate}`);

				if (newDate != null && newDate > this.control.value) {
					this.control.setValue(newDate);
				}

				this.minDate = newDate;
				// this.formProperty.setValue(newValue.toISOString().substring(0, 10), false);
			});
		}
	}

	public getWeekNumber(context: any): number {
		// TODO: `context.value` has Date object for which we can calculate custom week number.
		return context.formattedValue;
	}

	private findTargetProperty(path: string): FormProperty {
		if (path == null || path === this.formProperty.path) {
			return null;
		}

		const targetProperty = this.formProperty.searchProperty(path);

		if (!targetProperty || this.formProperty.path === targetProperty.path) {
			return null;
		}

		return targetProperty;
	}

	private getDefaultValue(): any {
		// TODO: cache default value?
		return this.schema.default != null ? this.parseDate(this.schema.default) : null;
	}

	private parseDate(value: string, defaultValue: Date | null = null): Date {
		let newDate: Date = defaultValue;
		if (value != null) {
			const date = Date.parse(value);
			if (isFinite(date)) {
				newDate = new Date(date);
			}
		}
		return newDate;
	}

	private dateAsString(date: Date): string {
		return date != null ? date.toISOString().substring(0, 10) : null;
	}
}
