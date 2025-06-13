import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, RouterModule, CommonModule, MatIcon],
})
export class ToolbarComponent implements OnInit, OnDestroy {

  currentRoute: string = '';
  showBackButton: boolean = false;
  showToolbar: boolean = true;
  title: string = 'BinMap';
  user: User = {first_name: '', last_name: '', email: '', avatar: '', description: ''};

  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private router: Router, 
    private location: Location, 
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscripción a eventos de navegación
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
        this.updateToolbarState();
      });
      
    // Suscripción a cambios en el usuario
    this.userSubscription = this.userService.getUser().subscribe(user => {
        this.user = user;
      });

    // Suscripción al estado de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.updateToolbarState();
    });

    // Verificar estado inicial
    this.updateToolbarState();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private updateToolbarState() {
    // Verificar si estamos en una ruta pública
    const isPublicRoute = this.currentRoute.includes('/login') || 
                         this.currentRoute.includes('/register');

    // Actualizar visibilidad del toolbar
    this.showToolbar = !isPublicRoute;

    // Actualizar título y botón de retroceso
    if (this.currentRoute.includes('/profile')) {
          this.title = 'Perfil';
          this.showBackButton = true;
        } else if (this.currentRoute.includes('/edit-user')) {
          this.title = 'Editar Información';
          this.showBackButton = true;
        } else if (this.currentRoute.includes('/settings')) {
          this.title = 'Configuración';
          this.showBackButton = true;
        } else {
          this.title = 'BinMap';
          this.showBackButton = false;
        }
  }

  goBack() {
    if (this.currentRoute.includes('/edit-user')) {
      this.router.navigate(['/profile']);
    } else if (this.currentRoute.includes('/profile')) {
      this.router.navigate(['/tabs/home']);
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }
}
