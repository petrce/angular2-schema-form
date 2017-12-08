import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SchemaFormModule } from './lib';

import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, SchemaFormModule],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
