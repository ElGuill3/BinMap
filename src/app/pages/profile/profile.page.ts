import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonButton, AlertController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonAvatar, IonButton, RouterModule],
})
export class ProfilePage implements OnInit, OnDestroy {
  user: User = { first_name: '', last_name: '', email: '', avatar: '', description: '' };
  private userSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    // Actualizar los datos del usuario cada vez que la página se va a mostrar
    this.loadUserData();
  }

  ngOnInit() {
    // Carga inicial de datos
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadUserData() {
    // Cancelar suscripción anterior si existe
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    
    // Crear nueva suscripción
    this.userSubscription = this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
      }
    });
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }
}
