import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { PoiCardComponent } from '../../components/poi-card/poi-card.component';
import { PoiModalComponent } from 'src/app/components/poi-modal/poi-modal.component';
import { PoiService } from 'src/app/services/poi/poi.service';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Poi } from 'src/app/models/poi.model';
import { Subscription } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonRefresher, 
    IonRefresherContent, 
    CommonModule, 
    PoiCardComponent,
    PoiModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit, OnDestroy {
  
  poiList: Poi[] = [];
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private modalCtrl: ModalController,
    private poiService: PoiService,
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPois();
    
    // Suscribirse a cambios en el estado de autenticación
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          console.log('Usuario autenticado, recargando POIs');
          this.loadPois();
        }
      })
    );
    
    // Suscribirse a cambios en favoritos
    this.subscriptions.push(
      this.favoritesService.getFavorites().subscribe(() => {
        console.log('Lista de favoritos actualizada');
        // No necesitamos recargar todos los POIs, ya que los componentes
        // de tarjeta se actualizarán automáticamente
      })
    );
  }
  
  ionViewWillEnter() {
    // Este método se ejecuta cada vez que la página va a ser mostrada
    console.log('Home page will enter, checking authentication status');
    
    // Verificar si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      console.log('Usuario autenticado, recargando datos');
      // Recargar favoritos y lugares visitados
      this.favoritesService.refresh();
      // Recargar POIs
      this.loadPois();
    }
  }
  
  ngOnDestroy() {
    // Cancelar todas las suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPois() {
    this.isLoading = true;
    this.poiService.getAll().subscribe({
      next: pois => {
      this.poiList = pois;
        this.isLoading = false;
      },
      error: error => {
        console.error('Error al cargar POIs:', error);
        this.isLoading = false;
      }
    });
  }
  
  doRefresh(event: any) {
    console.log('Actualizando página de inicio');
    // Recargar favoritos
    this.favoritesService.refresh();
    
    // Recargar POIs
    this.poiService.getAll().subscribe({
      next: pois => {
        this.poiList = pois;
        event.target.complete();
      },
      error: error => {
        console.error('Error al recargar POIs:', error);
        event.target.complete();
      }
    });
  }

  async openModal(poi: Poi){
    try {
      console.log('Intentando abrir modal para POI:', poi);
      
    const modal = await this.modalCtrl.create({
      component: PoiModalComponent,
      componentProps: {
        id: poi.id,
        title: poi.name,
        info: poi.description,
        image: poi.image,
        video: poi.video
      },
        cssClass: 'poi-modal',
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75],
      handleBehavior: 'cycle',
      });

      console.log('Modal creado, presentando...');
    await modal.present();
      
      console.log('Modal presentado, esperando cierre...');
      const { data } = await modal.onDidDismiss();
      console.log('Modal cerrado, datos recibidos:', data);
      
      if (data && data.refresh) {
        this.loadPois();
      }
    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }
}
