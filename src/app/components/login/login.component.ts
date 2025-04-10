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
import { Role } from "../../models/roles";

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
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  message = "";
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
        catchError((err) => {
          const { description, message } = err.error;
          return of({ description, message });
        })
      )
      .subscribe((response) => {
        if (response && "role" in response) {
          this.router.navigateByUrl(
            response.role === Role.admin ? "/admin" : "/"
          );
        } else {
          this.message = response?.description;
        }
      });
  }
}
