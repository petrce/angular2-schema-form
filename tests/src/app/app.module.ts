import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SchemaFormModule } from './lib';
import { AppComponent } from './app.component';
import { DatesComponent } from './dates.component';

@NgModule({
	declarations: [AppComponent, DatesComponent],
	imports: [BrowserModule, SchemaFormModule],
	providers: [],
	bootstrap: [DatesComponent]
})
export class AppModule {}
