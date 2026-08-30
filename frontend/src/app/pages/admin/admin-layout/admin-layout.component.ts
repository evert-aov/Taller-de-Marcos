import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPhoto,
  heroFolder,
  heroGlobeAlt,
  heroUserCircle,
  heroArrowLeftOnRectangle,
  heroEye,
  heroSparkles,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [
    provideIcons({
      heroPhoto,
      heroFolder,
      heroGlobeAlt,
      heroUserCircle,
      heroArrowLeftOnRectangle,
      heroEye,
      heroSparkles,
    }),
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  constructor(public authService: AuthService) {}
}
