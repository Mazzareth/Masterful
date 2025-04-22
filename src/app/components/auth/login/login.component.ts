import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.signIn(email, password)
      .subscribe({
        next: async (userCredential) => {
          try {
            // Get the ID token
            const token = await userCredential.user.getIdToken();
            
            // Set the token as a cookie
            document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
            
            this.loading = false;
            this.router.navigate(['/dashboard']);
          } catch (err) {
            console.error('Error setting token cookie:', err);
            this.loading = false;
            this.errorMessage = 'Authentication successful but failed to set session. Please try again.';
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
  }

  signInWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.signInWithGoogle()
      .subscribe({
        next: async (userCredential) => {
          try {
            // Get the ID token
            const token = await userCredential.user.getIdToken();
            
            // Set the token as a cookie
            document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
            
            this.loading = false;
            this.router.navigate(['/dashboard']);
          } catch (err) {
            console.error('Error setting token cookie:', err);
            this.loading = false;
            this.errorMessage = 'Authentication successful but failed to set session. Please try again.';
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User not found. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Invalid password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  }
}