import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicOnlyGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [publicOnlyGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/upload-page/upload-page.component').then(m => m.UploadPageComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
