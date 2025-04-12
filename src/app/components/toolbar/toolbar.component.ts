import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar, IonBackButton} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;

        if (this.currentRoute.includes('/profile')) {
          this.title = 'Perfil';
          this.showBackButton = true;
        } else if (this.currentRoute.includes('/settings')) {
          this.title = 'Ajustes';
          this.showBackButton = true;
        } else {
          this.title = 'BinMap';
          this.showBackButton = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }
}
