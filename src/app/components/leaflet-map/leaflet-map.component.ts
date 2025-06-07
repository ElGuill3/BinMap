import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
  standalone: true,
})
export class LeafletMapComponent  implements OnInit {

  map: L.Map | undefined;
  constructor() { }
  ngOnInit() {

    setTimeout(() => {
    this.map = L.map('mapId').setView([17.80943, -91.53860], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawRoute();
  }, 0);

  }

  drawRoute() {
    if (!this.map) return;

    const puntos: L.LatLngExpression[] = [
      [17.80943, -91.53860],
      [18.4790, -88.2962], 
      [20.9674, -89.5926]    
    ];

    const ruta = L.polyline(puntos, {
      color: 'red',
      weight: 4,
      opacity: 0.8
    }).addTo(this.map);

    this.map.fitBounds(ruta.getBounds());
  }

  
}
