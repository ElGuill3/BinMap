import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import { Poi } from 'src/app/models/poi.model';
import { PoiModalComponent } from '../poi-modal/poi-modal.component';
import { ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
  standalone: true,
  imports: [CommonModule, PoiModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LeafletMapComponent implements OnInit, OnChanges {
  @Input() pois: Poi[] = [];
  @Output() poiClicked = new EventEmitter<Poi>();
  map: L.Map | undefined;
  private markers: L.Marker[] = [];

  selectedPoi: Poi | null = null;
  showPoiPopup = false;
  popupPosition = { x: 0, y: 0 };
  mapInitialized: boolean = false;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.map = L.map('mapId').setView([17.80943, -91.53860], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
      this.mapInitialized = true;
      console.log('LeafletMapComponent: Mapa inicializado. POIs actuales:', this.pois);
      if (this.pois.length > 0) {
        this.addMarkers();
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pois']) {
      console.log('LeafletMapComponent: Cambios detectados en POIs:', changes['pois'].currentValue);
      if (this.mapInitialized && this.map) {
        this.clearMarkers();
        this.addMarkers();
      }
    }
  }

  private addMarkers() {
    console.log('LeafletMapComponent: Llamando a addMarkers. Número de POIs a añadir:', this.pois.length);
    if (!this.map) return;

    const customIcon = L.icon({
      iconUrl: '../../assets/icon/poi_icon.svg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.pois.forEach(poi => {
      console.log(`LeafletMapComponent: Añadiendo marcador para POI: ${poi.name}, Lat: ${poi.latitude}, Lng: ${poi.longitude}`);
      const marker = L.marker([
        parseFloat(poi.latitude),
        parseFloat(poi.longitude)
      ], { icon: customIcon })
        .addTo(this.map!);

      marker.on('click', () => {
        this.openPoiModal(poi);
      });

      marker.on('mousedown', (e: any) => {
        // Detectar long press
        let pressTimer: any;
        marker.once('mouseup', () => {
          clearTimeout(pressTimer);
        });
        marker.once('mouseout', () => {
          clearTimeout(pressTimer);
        });
        pressTimer = setTimeout(() => {
          this.openPoiPopup(poi, e.originalEvent);
        }, 600); // 600ms para long press
      });

      this.markers.push(marker);
    });
  }

  private getPoiCardHtml(poi: Poi): string {
    return `
      <div style="box-shadow:0 2px 8px #0002; border-radius:12px; overflow:hidden; background:#dec8a3; width:180px;">
        <img src="${poi.image}" alt="${poi.name}" style="width:100%; height:90px; object-fit:cover; border-top-left-radius:12px; border-top-right-radius:12px;">
        <div style="padding:8px;">
          <h3 style="margin:0; font-size:1em; color:#424242;">${poi.name}</h3>
        </div>
      </div>
    `;
  }

  private clearMarkers() {
    if (!this.map) return;
    this.markers.forEach(marker => this.map!.removeLayer(marker));
    this.markers = [];
  }

  openPoiModal(poi: Poi) {
    this.poiClicked.emit(poi);
  }

  openPoiPopup(poi: Poi, event: MouseEvent) {
    this.selectedPoi = poi;
    this.showPoiPopup = true;
    // Calcular posición relativa al mapa
    const mapDiv = document.getElementById('mapId');
    if (mapDiv) {
      const rect = mapDiv.getBoundingClientRect();
      this.popupPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }

  closePoiPopup() {
    this.showPoiPopup = false;
    this.selectedPoi = null;
  }
}
