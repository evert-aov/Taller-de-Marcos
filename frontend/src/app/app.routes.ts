import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { MarcosAdminComponent } from './pages/admin/marcos-admin/marcos-admin.component';
import { CategoriasAdminComponent } from './pages/admin/categorias-admin/categorias-admin.component';

export const routes: Routes = [
  {
    path: '',
    component: CatalogoComponent,
    title: 'Catálogo de Marcos de Madera',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión | Taller de Marcos',
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'marcos',
      },
      {
        path: 'marcos',
        component: MarcosAdminComponent,
        title: 'Gestión de Marcos | Panel Admin',
      },
      {
        path: 'categorias',
        component: CategoriasAdminComponent,
        title: 'Gestión de Categorías | Panel Admin',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
