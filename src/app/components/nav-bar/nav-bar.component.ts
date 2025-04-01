import { Component, OnInit } from '@angular/core';
import {IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone'
import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [IonTabBar, IonTabButton, IonTabs, MatIconModule],
})
export class NavBarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
