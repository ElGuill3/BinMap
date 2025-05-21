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
    this.map = L.map('mapId').setView([17.80943, -91.53860], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.drawRoute()
  }

  drawRoute() {
    if (!this.map) return;

    const puntos: L.LatLngExpression[] = [
      [17.80943, -91.53860], // Punto A
      [18.4790, -88.2962],   // Punto B (ejemplo: Chetumal)
      [20.9674, -89.5926]    // Punto C (ejemplo: Mérida)
    ];

    const ruta = L.polyline(puntos, {
      color: 'blue',
      weight: 4,
      opacity: 0.8
    }).addTo(this.map);

    this.map.fitBounds(ruta.getBounds());
  }

  
}
