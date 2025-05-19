import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent } from '@ionic/angular/standalone';
import { PoiCardComponent } from '../../components/poi-card/poi-card.component';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';
import { PoiService } from 'src/app/services/poi/poi.service';
import { Poi } from 'src/app/models/poi.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, PoiCardComponent, CommonModule],
})
export class HomePage {
  
  poiList: Poi[] = [];

  constructor(
    private modalCtrl: ModalController,
    private poiService: PoiService
  ) {}

  ngOnInit() {
    this.poiList = this.poiService.getAll();
  }

  async openModal(poi: Poi){
    const modal = await this.modalCtrl.create({
      component: PoiModalComponent,
      componentProps: {
        id: poi.id,
        title: poi.name,
        info: poi.description,
        image: poi.img,
        video: poi.video
      },
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75],
      handleBehavior: 'cycle',

    });
    await modal.present();
  }
}
