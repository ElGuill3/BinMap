import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PoiService } from 'src/app/services/poi/poi.service';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { Poi } from 'src/app/models/poi.model';
import { Subscription } from 'rxjs';
import { PoiCardComponent } from 'src/app/components/poi-card/poi-card.component';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [IonContent, PoiCardComponent, CommonModule],
})
export class FavoritosPage implements OnInit, OnDestroy {
  favorites: Poi[] = [];
  private subscription!: Subscription;

  constructor(
    private poiService: PoiService,
    private favoriteService: FavoritesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.subscription = this.favoriteService
      .getFavorites()
      .subscribe(async (favIds) => {
        const allPois = await this.poiService.getAll().toPromise();
        if (allPois) {
          this.favorites = allPois.filter((poi) => favIds.includes(poi.id));
        }
      });
  }

  async openModal(poi: Poi) {
    const modal = await this.modalCtrl.create({
      component: PoiModalComponent,
      componentProps: {
        title: poi.name,
        info: poi.description,
        image: poi.image,
        video: poi.video,
      },
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75],
      handleBehavior: 'cycle',
    });
    await modal.present();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onRemove(id: string) {
    this.favoriteService.removeFavorite(id);
  }
}
