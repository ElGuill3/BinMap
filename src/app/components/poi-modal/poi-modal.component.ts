import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonContent, ModalController, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { VisitedService } from 'src/app/services/visited/visited.service';
import { Subscription } from 'rxjs';
import { Route } from 'src/app/models/route.model';
import { Poi } from 'src/app/models/poi.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-poi-modal',
  templateUrl: './poi-modal.component.html',
  styleUrls: ['./poi-modal.component.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, MatIcon, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PoiModalComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  @Input() title?: string;
  @Input() info?: string;
  @Input() image?: string;
  @Input() video?: string;
  @Input() route?: Route;
  @Input() pois?: Poi[];

  isSpeaking = false;
  showVideo = false;
  isFav = false;
  isVisited = false;
  visitDate: Date | null = null;
  isProcessingFavorite = false;
  isProcessingVisit = false;
  private favSubscription!: Subscription;
  private visitedSubscription!: Subscription;
  private authSubscription!: Subscription;

  constructor(
    private favoriteService: FavoritesService,
    private visitedService: VisitedService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) {
    console.log('PoiModalComponent constructor');
  }

  ngOnInit() {
    console.log('PoiModalComponent ngOnInit, id:', this.id);
    
    if (this.id) {
      console.log('Suscribiéndose a favoritos para id:', this.id);
      this.favSubscription = this.favoriteService
        .getFavorites()
        .subscribe((favs) => {
          console.log('Favoritos actualizados:', favs);
          const wasFav = this.isFav;
          this.isFav = favs.includes(this.id!);
          console.log('Estado de favorito para', this.id, ':', this.isFav);
          
          // Solo resetear el flag si el estado cambió
          if (wasFav !== this.isFav) {
            this.isProcessingFavorite = false;
          }
          
          this.cdr.detectChanges(); // Forzar detección de cambios
        });
        
      console.log('Suscribiéndose a visitados para id:', this.id);
      this.visitedSubscription = this.visitedService
        .getVisited()
        .subscribe((visited) => {
          console.log('Visitados actualizados:', visited);
          const wasVisited = this.isVisited;
          this.isVisited = visited.includes(this.id!);
          console.log('Estado de visitado para', this.id, ':', this.isVisited);
          
          // Actualizar la fecha de visita si está visitado
          if (this.isVisited) {
            this.visitDate = this.visitedService.getVisitDateById(this.id!);
          } else {
            this.visitDate = null;
          }
          
          // Solo resetear el flag si el estado cambió
          if (wasVisited !== this.isVisited) {
            this.isProcessingVisit = false;
          }
          
          this.cdr.detectChanges(); // Forzar detección de cambios
        });
      
      this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          console.log('Usuario autenticado, actualizando estado de favoritos y visitas');
          // No es necesario hacer nada más, ya que los servicios se actualizarán automáticamente
        }
      });
    }
  }

  toggleFavorite() {
    if (!this.id || this.isProcessingFavorite) {
      return;
    }
    
    this.isProcessingFavorite = true;
    console.log(`Cambiando estado de favorito para ${this.id}`);
    
    this.favoriteService.toggleFavorite(this.id).subscribe({
      next: (success) => {
        if (success) {
          console.log(`Estado de favorito cambiado correctamente para ${this.id}`);
          // El estado se actualizará a través de la suscripción
        } else {
          console.error(`Error al cambiar estado de favorito para ${this.id}`);
          this.isProcessingFavorite = false;
        }
      },
      error: (error) => {
        console.error(`Error al cambiar estado de favorito para ${this.id}:`, error);
        this.isProcessingFavorite = false;
      },
      complete: () => {
        // Notificar a la página principal que debe actualizarse
        // Se hará cuando se cierre el modal
      }
    });
  }
  
  onVisitedClick(event: Event) {
    event.stopPropagation();
    event.preventDefault(); // Prevenir comportamiento por defecto
    
    if (!this.id || this.isProcessingVisit) {
      return;
    }
    
    this.isProcessingVisit = true;
    console.log(`Cambiando estado de visita para ${this.id}`);
    
    this.visitedService.toggleVisited(this.id).subscribe({
      next: (success) => {
        if (success) {
          console.log(`Estado de visita cambiado correctamente para ${this.id}`);
          // El estado se actualizará a través de la suscripción
        } else {
          console.error(`Error al cambiar estado de visita para ${this.id}`);
          this.isProcessingVisit = false;
        }
      },
      error: (error) => {
        console.error(`Error al cambiar estado de visita para ${this.id}:`, error);
        this.isProcessingVisit = false;
      }
    });
  }

  onVideoEnded() {
    this.showVideo = false;
  }

  async toggleSpeech() {
    if (this.isSpeaking) {
      await TextToSpeech.stop();
      this.isSpeaking = false;
    } else {
      this.isSpeaking = true;
      const textToSpeak = this.info || this.route?.description || '';

      await TextToSpeech.speak({
        text: textToSpeak,
        lang: 'es-MX',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });

      this.isSpeaking = false;
    }
  }

  ngOnDestroy(): void {
    console.log('PoiModalComponent ngOnDestroy');
    TextToSpeech.stop();
    if (this.favSubscription) {
      this.favSubscription.unsubscribe();
    }
    if (this.visitedSubscription) {
      this.visitedSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  dismiss(refresh: boolean = false) {
    console.log('Cerrando modal, refresh:', refresh);
    this.modalCtrl.dismiss({
      refresh: refresh
    });
  }
}
