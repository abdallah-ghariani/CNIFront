import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../services/auth.service";
import { catchError, of, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  imports: [
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
  ],
  template: `
    <div class="flex items-center justify-center h-screen bg-gradient-to-r from-gray-100 to-blue-200">
      <div class="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
        <img src="images/CNI.jpg" alt="Image" class="w-20 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold">Welcome Back</h2>
        <p class="text-gray-600">Don't have an account? <a [routerLink]="['/signup']" class="text-blue-500">Sign up here</a></p>

        <form [formGroup]="loginForm" (ngSubmit)="login()" class="mt-4 space-y-4">
          <div>
            <label for="username" class="block text-left font-medium text-gray-700">Username</label>
            <input pInputText id="username" formControlName="username" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
          </div>
          
          <div>
            <label for="password" class="block text-left font-medium text-gray-700">Password</label>
            <input pInputText id="password" type="password" formControlName="password" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
          </div>
          
          <div class="text-red-500 text-sm" *ngIf="message">{{ message }}</div>
          
          <button pButton type="submit" label="Login" icon="pi pi-user" [disabled]="!loginForm.valid"
            class="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  message = '';
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  login() {

    this.authService
      .login(this.loginForm.value)
      .pipe(
        catchError(err => {
          const { description, message } = err.error;
          return of({ description, message });
        })
      )
      .subscribe((response) => {
        if ('token' in response) {
          this.router.navigateByUrl('/');
        } else {
          this.message = response.description;
        }
      });
  }
}
