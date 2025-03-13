import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import {DatePickerModule} from 'primeng/datepicker';
import {SelectModule} from 'primeng/select';
import {InputTextModule} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea'
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
  <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  selectedCountry !:{name: string, code: string} ;
  countries = [{name:'test1', code:'t'}, {name:'test2', code:"ts"}];
  title = 'CNIFront';
}
