import { Component, ViewEncapsulation } from '@angular/core';
import { WidgetRegistry, Validator, DefaultWidgetRegistry } from './lib';

@Component({
	selector: 'sf-demo-app',
	templateUrl: './dates.component.html',
	encapsulation: ViewEncapsulation.None,
	providers: [{ provide: WidgetRegistry, useClass: DefaultWidgetRegistry }]
})
export class DatesComponent {
	schema: any;
	model: any;
	fieldValidators: { [fieldId: string]: Validator } = {};
	actions = {};

	constructor(registry: WidgetRegistry) {
		this.schema = require('./schema-dates.json');
		this.model = {
			fromDateUtc: '2017-12-01',
			toDateUtc: '2017-12-31'
		};

		this.fieldValidators['/bornOn'] = (value, property, form) => {
			let errors = null;
			const dateArr = value.split('-');

			if (dateArr.length === 3) {
				const now = new Date();
				const min = new Date(now.getFullYear() - 100, now.getMonth(), now.getDay()).getTime();
				const max = new Date().getTime();
				const born = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]).getTime();

				if (born < min || born > max) {
					errors = [
						{
							bornOn: {
								expectedValue: '>today - 100 && < today',
								actualValue: value
							}
						}
					];
				}
			}
			return errors;
		};

		this.fieldValidators['/promotion'] = (value, property, form) => {
			if (value === 'student') {
				const bornOn = form.getProperty('/bornOn');

				if (bornOn.valid) {
					const date = bornOn.value.split('-');
					const validYear = new Date().getFullYear() - 17;

					try {
						const actualYear = parseInt(date[0], 10);

						if (actualYear < validYear) {
							return null;
						}

						return [
							{
								promotion: {
									bornOn: {
										expectedValue: 'year<' + validYear,
										actualValue: actualYear
									}
								}
							}
						];
					} catch (e) {}
				}

				return [
					{
						promotion: {
							bornOn: {
								expectedFormat: 'date',
								actualValue: bornOn.value
							}
						}
					}
				];
			}

			return null;
		};
	}

	logErrors(errors) {
		console.log('ERRORS', errors);
	}
}
