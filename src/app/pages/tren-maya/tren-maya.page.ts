import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tren-maya',
  templateUrl: './tren-maya.page.html',
  styleUrls: ['./tren-maya.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class TrenMayaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
