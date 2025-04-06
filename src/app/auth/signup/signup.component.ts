import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { catchError, of } from "rxjs";

// PrimeNG
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";

// Common
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-signup",
  standalone: true,
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    CommonModule
  ]
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
          this.message = detail;
          return of({ detail });
        })
      )
      .subscribe((response: any) => {
        console.log(response);
        // You might want to redirect or show success here
      });
  }
}
