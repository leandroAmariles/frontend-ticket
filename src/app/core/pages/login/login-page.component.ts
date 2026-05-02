import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" placeholder="admin" autocomplete="username" />
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                El usuario es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message" role="alert">
              {{ errorMessage }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-button"
              [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20" class="inline-spinner"></mat-spinner>
              <span *ngIf="!loading">Ingresar</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 16px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .full-width {
      width: 100%;
    }
    .login-button {
      margin-top: 8px;
      height: 44px;
    }
    .error-message {
      color: #f44336;
      font-size: 14px;
      padding: 8px;
      background: #fdecea;
      border-radius: 4px;
    }
    .inline-spinner {
      display: inline-block;
    }
  `]
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  private returnUrl = '/tickets';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/tickets';

    // Si ya está autenticado, redirigir directo
    if (this.authService.isTokenValid()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar al servidor. Comprueba la conexión.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
        }
      }
    });
  }
}

