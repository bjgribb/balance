import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../auth/services/auth-api.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authApi
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.authSession.setSession(response);
          void this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage.set('Incorrect email or password.');
            return;
          }

          this.errorMessage.set(this.extractApiError(error));
        },
      });
  }

  private extractApiError(error: unknown): string {
    const fallback = 'Unable to sign in right now.';
    const payload = (error as { error?: unknown })?.error;

    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { errors?: unknown }).errors)
    ) {
      const errors = (payload as { errors: string[] }).errors;
      if (errors.length > 0) {
        return errors.join(' ');
      }
    }

    return fallback;
  }
}
