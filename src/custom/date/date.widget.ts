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

	public _minDateSchema: Date = null;
	public _maxDateSchema: Date = null;

	ngAfterViewInit() {
		const control = this.control;

		this.control.valueChanges.subscribe((newValue: Date) => {
			this.formProperty.setValue(this.dateAsString(newValue == null ? this.getDefaultValue() : newValue), false);
		});

		if (this.schema.min) {
			// try if 'schema.min' is Date
			this.minDate = this.parseDate(this.schema.min);

			if (!this.minDate) {
				// try if 'schema.min' is another property
				const targetProperty = this.bindToTargetProperty(this.schema.min, (newValue: string) => {
					const newDate = this.parseDate(newValue);
					if (this.control.value && newDate != null && newDate > this.control.value) {
						this.control.setValue(newDate);
					}
					this.minDate = newDate ? newDate : this._minDateSchema;
				});

				// check if target points back to us and we have max date set as date, then set target max
				if (targetProperty != null && targetProperty.schema.max === this.formProperty.path) {
					this.minDate = this.parseDate(targetProperty.schema.min);
					this._minDateSchema = new Date(this.minDate);
				}
			}
		}

		if (this.schema.max) {
			// try if 'schema.max' is Date
			this.maxDate = this.parseDate(this.schema.max);

			if (!this.maxDate) {
				// try if 'schema.max' is another property
				const targetProperty = this.bindToTargetProperty(this.schema.max, (newValue: string) => {
					const newDate = this.parseDate(newValue);
					if (this.control.value && newDate != null && newDate < this.control.value) {
						this.control.setValue(newDate);
					}
					this.maxDate = newDate ? newDate : this._maxDateSchema;
				});

				// check if target points back to us and we have min date set as date, then set target min
				if (targetProperty != null && targetProperty.schema.min === this.formProperty.path) {
					this.maxDate = this.parseDate(targetProperty.schema.max);
					this._maxDateSchema = new Date(this.maxDate);
				}
			}
		}
	}

	public getWeekNumber(context: any): number {
		// TODO: `context.value` has Date object for which we can calculate custom week number.
		return context.formattedValue;
	}

	private bindToTargetProperty(path: string, next: (value: any) => void): FormProperty {
		const targetProperty = this.findTargetProperty(path);
		if (!targetProperty) {
			return null;
		}

		targetProperty.valueChanges.subscribe(next);

		return targetProperty;
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
			if (value === '%TODAY%') {
				newDate = new Date();
				newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
			} else {
				const date = Date.parse(value);
				if (isFinite(date)) {
					newDate = new Date(date);
				}
			}
		}
		return newDate;
	}

	private dateAsString(date: Date): string {
		return date != null ? date.toISOString().substring(0, 10) : null;
	}
}
