import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { catchError, of } from "rxjs";


import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";


import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    CommonModule
  ]
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
          const { description } = err.error;
          return of({ description });
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
