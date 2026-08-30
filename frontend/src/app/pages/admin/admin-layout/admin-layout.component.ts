import { Component, signal } from '@angular/core';
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
  heroBars3,
  heroXMark,
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
      heroBars3,
      heroXMark,
    }),
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  sidebarOpen = signal<boolean>(false);

  constructor(public authService: AuthService) {}

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
