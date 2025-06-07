import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, ModalController, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PoiService } from 'src/app/services/poi/poi.service';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { VisitedService } from 'src/app/services/visited/visited.service';
import { Poi } from 'src/app/models/poi.model';
import { Subscription, combineLatest } from 'rxjs';
import { PoiCardComponent } from 'src/app/components/poi-card/poi-card.component';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [IonContent, PoiCardComponent, CommonModule, IonRefresher, IonRefresherContent],
})
export class FavoritosPage implements OnInit, OnDestroy {
  favorites: Poi[] = [];
  visitedMap: Record<string, boolean> = {};
  visitDatesMap: Record<string, string> = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private poiService: PoiService,
    private favoriteService: FavoritesService,
    private visitedService: VisitedService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    // Combinar observables de favoritos y visitas
    this.subscriptions.push(
      combineLatest([
        this.favoriteService.getFavorites(),
        this.visitedService.getVisited(),
        this.visitedService.getVisitDates()
      ]).subscribe(async ([favIds, visitedIds, visitDates]) => {
        console.log('Favoritos IDs recibidos:', favIds);
        
        const allPois = await this.poiService.getAll().toPromise();
        if (allPois) {
          // Filtrar los POIs que están en la lista de favoritos
          this.favorites = allPois.filter((poi) => favIds.includes(poi.id));
          console.log('Favoritos filtrados:', this.favorites);
          
          // Actualizar mapas de visitas y fechas
          this.visitedMap = {};
          this.visitDatesMap = visitDates;
          visitedIds.forEach(id => {
            this.visitedMap[id] = true;
          });
        }
      })
    );
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onRemove(id: string) {
    this.favoriteService.removeFavorite(id).subscribe(success => {
      if (success) {
        this.favorites = this.favorites.filter(poi => poi.id !== id);
      }
    });
  }

  toggleVisited(id: string) {
    this.visitedService.toggleVisited(id).subscribe();
  }

  isVisited(id: string): boolean {
    return this.visitedMap[id] || false;
  }

  getVisitDate(id: string): string | null {
    return this.visitDatesMap[id] || null;
  }

  ionViewWillEnter() {
    // Refrescar datos cuando la página se va a mostrar
    this.favoriteService.refresh();
    this.visitedService.refresh();
  }
  
  doRefresh(event: any) {
    // Recargar favoritos y visitas
    this.favoriteService.refresh();
    this.visitedService.refresh();
    
    // Completar la recarga después de 1 segundo
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
