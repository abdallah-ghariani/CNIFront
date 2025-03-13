import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
const BACKEND_URL = environment.BACKEND_URL + "test"; 
@Component({
  selector: 'app-test',
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">User Info</h2>
      <p class=" text-black"><strong>Name:</strong> {{ name }}</p>
      <p class=" text-black"><strong>Roles:</strong> {{ roles.join(', ') }}</p>
    </div>
  `,
  styles: []
})
export class TestComponent implements OnInit {
  name: string = '';
  roles: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {

    this.http.get(BACKEND_URL+'/name',{responseType:'text'}).subscribe((data) => {
      this.name = data;
    });

    this.http.get<string[]>(BACKEND_URL+'/roles').subscribe((data) => {
      this.roles = data;
    });
  }
}
