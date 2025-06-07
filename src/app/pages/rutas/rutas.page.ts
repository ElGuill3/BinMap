import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { RouteService } from 'src/app/services/route/route.service';
import { Route } from 'src/app/models/route.model';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';
import { Poi } from 'src/app/models/poi.model';
import { PoiService } from 'src/app/services/poi/poi.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class RutasPage implements OnInit {

  routes: Route[] = [];
  pois: Poi[] = [];

  constructor(private routeService: RouteService, private poiService: PoiService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.routeService.getAllRoutes().subscribe(routes => {
      this.routes = routes;
    });
    this.poiService.getAll().subscribe(pois => {
      this.pois = pois;
    });
  }

  getPoisForRoute(routeId: string): Poi[] {
    return this.pois.filter(poi => poi.route.id === routeId);
  }

  async openModal(route: Route) {
    const routePois = this.getPoisForRoute(route.id);
    const modal = await this.modalCtrl.create({
      component: PoiModalComponent,
      componentProps: {
        route: route,
        pois: routePois
      },
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75],
      handleBehavior: 'cycle'
    });
    await modal.present();
  }

}
