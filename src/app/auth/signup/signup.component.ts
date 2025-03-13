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
import { catchError, of } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-signup",
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
        <h2 class="text-2xl font-semibold">Create an Account</h2>
        <p class="text-gray-600">Already have an account? <a [routerLink]="['/login']" class="text-blue-500">Log in</a></p>

        <form [formGroup]="signupForm" (ngSubmit)="signup()" class="mt-4 space-y-4">
          <div>
            <label for="username" class="block text-left font-medium text-gray-700">Username</label>
            <input pInputText id="username" formControlName="username" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
          </div>
          
          <div>
            <label for="email" class="block text-left font-medium text-gray-700">Email</label>
            <input pInputText id="email" formControlName="email" type="email"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
          </div>
          
          <div>
            <label for="password" class="block text-left font-medium text-gray-700">Password</label>
            <input pInputText id="password" type="password" formControlName="password" 
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" />
          </div>
          
          <div class="text-red-500 text-sm" *ngIf="message">{{ message |titlecase }}</div>
          
          
          <button pButton type="submit" label="Sign Up" icon="pi pi-user" [disabled]="!signupForm.valid"
            class="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  message = '';
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  signup() {
    this.authService
      .signup(this.signupForm.value)
      .pipe(
        catchError(err => {
          const { detail } = err.error;
          this.message=detail;
          return of({ detail});
          
        })
      )
      .subscribe((response) => {
        console.log(response);
       
      });
  }
}
