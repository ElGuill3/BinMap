import { Routes } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'tabs',
    component: NavBarComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'routes',
        loadComponent: () => import('./pages/rutas/rutas.page').then((m) => m.RutasPage),
      },
      {
        path: 'map',
        loadComponent: () => import('./pages/mapa/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./pages/favoritos/favoritos.page').then((m) => m.FavoritosPage),
      },
      {
        path: 'train',
        loadComponent: () => import('./pages/tren-maya/tren-maya.page').then((m) => m.TrenMayaPage),
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-user',
    loadComponent: () => import('./pages/edit-user/edit-user.page').then(m => m.EditUserPage),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
