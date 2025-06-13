import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { LeafletMapComponent } from '../../components/leaflet-map/leaflet-map.component';
import { PoiService } from 'src/app/services/poi/poi.service';
import { Poi } from 'src/app/models/poi.model';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, LeafletMapComponent, PoiModalComponent]
})
export class MapaPage implements OnInit {
  pois: Poi[] = [];

  constructor(private poiService: PoiService, private modalCtrl: ModalController) { }

  ngOnInit() {
    // La carga inicial puede seguir aquí si quieres que se carguen al iniciar el componente
    // Pero la recarga al entrar en la página será manejada por ionViewWillEnter
  }

  ionViewWillEnter() {
    console.log('MapaPage: ionViewWillEnter - Cargando POIs...');
    this.poiService.getAll().subscribe(pois => {
      console.log('POIs cargados en MapaPage:', pois);
      this.pois = pois;
    });
  }

  async abrirPoiModal(poi: Poi) {
    const modal = await this.modalCtrl.create({
      component: PoiModalComponent,
      componentProps: {
        id: poi.id,
        title: poi.name,
        info: poi.description,
        image: poi.image,
        video: poi.video,
        isRouteContext: false
      },
      cssClass: 'poi-modal',
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75],
      handleBehavior: 'cycle',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
  }
}
