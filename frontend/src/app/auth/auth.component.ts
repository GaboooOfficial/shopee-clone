import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../core/services/auth.service';
import * as AuthActions from '../store/auth/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginTab = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    email: '',
    password: '',
    role: 'customer',
    profile: {
      name: '',
      phone: ''
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectUser(this.authService.currentUserValue);
    }
  }

  setTab(isLogin: boolean) {
    this.isLoginTab = isLogin;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.store.dispatch(AuthActions.login({ email: this.loginData.email, password: this.loginData.password }));

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const { user, token } = response.data;
          this.store.dispatch(AuthActions.loginSuccess({ user, token }));
          this.redirectUser(user);
        } else {
          this.errorMessage = response.message;
          this.store.dispatch(AuthActions.loginFailure({ error: response.message }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.errorMessage = msg;
        this.store.dispatch(AuthActions.loginFailure({ error: msg }));
      }
    });
  }

  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Account created successfully! You can now log in.';
          this.isLoginTab = true;
          this.loginData.email = this.registerData.email;
          this.loginData.password = '';
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Email might be in use.';
      }
    });
  }

  private redirectUser(user: any) {
    if (!user) return;
    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (user.role === 'store_owner') {
      this.router.navigate(['/store-owner']);
    } else {
      this.router.navigate(['/customer']);
    }
  }
}
