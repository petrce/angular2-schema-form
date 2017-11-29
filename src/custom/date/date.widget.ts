import { Component } from '@angular/core';

import { ControlWidget } from '../../widget';

@Component({
	selector: 'sf-date-widget',
	templateUrl: './date.widget.html'
})
export class DateWidget extends ControlWidget {
	public value: Date = new Date(2000, 2, 10);

	public getWeekNumber(context: any): number {
		// TODO: `context.value` has Date object for which we can calculate custom week number.
		return context.formattedValue;
	}
}
