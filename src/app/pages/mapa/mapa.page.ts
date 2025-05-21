import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { LeafletMapComponent } from '../../components/leaflet-map/leaflet-map.component';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, LeafletMapComponent]
})
export class MapaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
