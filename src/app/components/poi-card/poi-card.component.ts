import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { Subscription } from 'rxjs';
import { VisitedService } from 'src/app/services/visited/visited.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-poi-card',
  templateUrl: './poi-card.component.html',
  styleUrls: ['./poi-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, MatIcon, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PoiCardComponent implements OnInit, OnDestroy {
  isFav = false;
  isVisited = false;
  visitDate: Date | null = null;
  isProcessingFavorite = false; // Flag para rastrear si se está procesando un favorito
  isProcessingVisit = false; // Flag para rastrear si se está procesando una visita
  private favSubscription!: Subscription;
  private visitedSubscription!: Subscription;
  @Input() id!: string;
  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;
  @Input() isFavoritePage: boolean = true;
  @Output() cardClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>();

  constructor(
    private favoriteService: FavoritesService, 
    private visitedService: VisitedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('PoiCardComponent ngOnInit, id:', this.id);
    
    if (this.id) {
      this.favSubscription = this.favoriteService.getFavorites().subscribe(favs => {
        console.log('Favoritos actualizados en tarjeta:', favs);
        const wasFav = this.isFav;
        this.isFav = favs.includes(this.id);
        console.log('Estado de favorito para tarjeta', this.id, ':', this.isFav);
        
        // Solo resetear el flag si el estado cambió
        if (wasFav !== this.isFav) {
          this.isProcessingFavorite = false;
        }
        
        this.cdr.detectChanges(); // Forzar detección de cambios
      });

      this.visitedSubscription = this.visitedService.getVisited().subscribe(visited => {
        this.isVisited = visited.includes(this.id);
        if (this.isVisited) {
          this.visitDate = this.visitedService.getVisitDateById(this.id);
        } else {
          this.visitDate = null;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.favSubscription) {
      this.favSubscription.unsubscribe();
    }
    if (this.visitedSubscription) {
      this.visitedSubscription.unsubscribe();
    }
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation(); // Evitar que el evento se propague al card
    event.preventDefault(); // Prevenir comportamiento por defecto
    
    // Si ya está procesando o no hay ID, ignorar el clic
    if (this.isProcessingFavorite || !this.id) {
      return;
    }
    
    this.isProcessingFavorite = true; // Marcar como procesando
    this.cdr.detectChanges(); // Forzar detección de cambios
    
    console.log('Cambiando favorito desde tarjeta para:', this.id);
    // Simplemente llamar a toggleFavorite
    this.favoriteService.toggleFavorite(this.id).subscribe({
      next: (success) => {
        if (success) {
          console.log('Favorito cambiado correctamente desde tarjeta');
        } else {
          console.error('Error al cambiar favorito desde tarjeta');
          this.isProcessingFavorite = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cambiar favorito:', error);
        this.isProcessingFavorite = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCardClick() {
    console.log('Tarjeta clickeada, emitiendo evento para:', this.id);
    this.cardClick.emit();
  }

  onRemoveClick(event: Event) {
    event.stopPropagation(); // Evitar que el evento se propague al card
    this.remove.emit(this.id);
  }

  onVisitedClick(event: Event) {
    event.stopPropagation(); // Evitar que el evento se propague al card
    event.preventDefault(); // Prevenir comportamiento por defecto
    
    // Si ya está procesando o no hay ID, ignorar el clic
    if (this.isProcessingVisit || !this.id) {
      return;
    }
    
    this.isProcessingVisit = true; // Marcar como procesando
    this.cdr.detectChanges(); // Forzar detección de cambios
    
    const now = new Date();
    
    if (!this.isVisited) {
      this.visitedService.addVisited(this.id, now).subscribe({
        next: () => {
          this.isProcessingVisit = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isProcessingVisit = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.visitedService.removeVisited(this.id).subscribe({
        next: () => {
          this.isProcessingVisit = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isProcessingVisit = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
