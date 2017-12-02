import { Component, AfterViewInit } from '@angular/core';

import { ControlWidget } from '../../widget';
import { FormProperty } from '../../model/formproperty';

@Component({
	selector: 'sf-date-widget',
	templateUrl: './date.widget.html',
	styleUrls: ['./date.widget.css']
})
export class DateWidget extends ControlWidget implements AfterViewInit {
	public static readonly widgetId = 'date';

	public minDate: Date = null;
	public maxDate: Date = null;

	private _minDateSchema: Date = null;
	private _maxDateSchema: Date = null;

	private _minTargetProperty: any;
	private _maxTargetProperty: any;

	ngAfterViewInit() {
		const control = this.control;

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

		this.control.valueChanges.subscribe((newDate: Date) => {
			if (newDate == null || ((this.minDate == null || newDate >= this.minDate) && (this.maxDate == null || newDate <= this.maxDate))) {
				this.formProperty.setValue(this.dateAsString(newDate == null ? this.getDefaultValue() : newDate), false);
			}
		});

		this.formProperty.valueChanges.subscribe((newValue: string) => {
			const newDate = this.parseDate(newValue);
			if (newDate == null || ((this.minDate == null || newDate > this.minDate) && (this.maxDate == null || newDate <= this.maxDate))) {
				this.control.setValue(newDate, { emitEvent: false });
			}

			if (this._minTargetProperty === undefined) {
				this._minTargetProperty = this.findTargetProperty(this.schema.min);
			}
			if (this._minTargetProperty != null && this._minTargetProperty.schema.max === this.formProperty.path) {
				const d = this.parseDate(this._minTargetProperty.value);
				if (this.minDate == null || this.minDate < d) {
					this.minDate = d;
					this._minDateSchema = new Date(this.minDate);
				}
			}

			if (this._maxTargetProperty === undefined) {
				this._maxTargetProperty = this.findTargetProperty(this.schema.max);
			}
			if (this._maxTargetProperty != null && this._maxTargetProperty.schema.min === this.formProperty.path) {
				const d = this.parseDate(this._maxTargetProperty.value);
				if (this.maxDate == null || this.maxDate > d) {
					this.maxDate = d;
					this._maxDateSchema = new Date(this.maxDate);
				}
			}
		});
	}

	public getWeekNumber(context: any): number {
		// TODO: `context.value` has Date object for which we can calculate custom week number.
		return context.formattedValue;
	}

	public isDateInRange(date: Date): boolean {
		if (!(this.control.value || this.formProperty.value)) {
			return false;
		}

		if (this._maxTargetProperty != null) {
			return date >= this.parseDate(this.control.value || this.formProperty.value) && date <= this.parseDate(this._maxTargetProperty.value);
		}

		if (this._minTargetProperty != null) {
			return date >= this.parseDate(this._minTargetProperty.value) && date <= this.parseDate(this.control.value || this.formProperty.value);
		}

		return false;
	}

	private bindToTargetProperty(path: string, next: (value: any) => void): any {
		const targetProperty = this.findTargetProperty(path);
		if (!targetProperty) {
			return null;
		}

		targetProperty.valueChanges.subscribe(next);

		return targetProperty;
	}

	private findTargetProperty(path: string): any {
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
