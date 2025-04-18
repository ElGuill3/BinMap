import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, IonBackButton} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from 'src/app/services/user.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, IonBackButton, RouterModule, CommonModule],
})
export class ToolbarComponent implements OnInit {
  currentRoute: string = '';
  showBackButton: boolean = false;
  title: string = 'BinMap';
  user: User = {name: '', avatar: '', description: ''};

  constructor(private router: Router, private location: Location, private userService: UserService) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
        this.checkRoute();
      });
      
      this.userService.getUser().subscribe(user => {
        this.user = user;
      });

  }

  checkRoute() {
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
    this.location.back();
  }
}
