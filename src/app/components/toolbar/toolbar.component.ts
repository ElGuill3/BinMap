import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonAvatar],
})
export class ToolbarComponent  implements OnInit {

  constructor() {}

  ngOnInit() {}

}
