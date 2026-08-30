import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroLockClosed,
  heroArrowRightOnRectangle,
  heroArrowLeft,
  heroExclamationTriangle,
  heroSparkles,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      heroLockClosed,
      heroArrowRightOnRectangle,
      heroArrowLeft,
      heroExclamationTriangle,
      heroSparkles,
    }),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = 'admin@taller.com';
  password = 'admin123';
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  fillDemo() {
    this.email = 'admin@taller.com';
    this.password = 'admin123';
    this.errorMessage.set('');
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/marcos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.',
        );
      },
    });
  }
}
