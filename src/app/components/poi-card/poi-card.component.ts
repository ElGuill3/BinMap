import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-poi-card',
  templateUrl: './poi-card.component.html',
  styleUrls: ['./poi-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, MatIcon, CommonModule],
})
export class PoiCardComponent implements OnInit {

  @Input() id!: number;
  isFav = false;

  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;
  @Input() showFavoriteButton: boolean = true;
  @Output() cardClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  private favSubscription!: Subscription;

  constructor(private favoriteService: FavoritesService) {}

  ngOnInit() {
    this.favSubscription = this.favoriteService.getFavorites().subscribe(favs => {
      this.isFav = favs.includes(this.id);
    })
  }

  ngOnDestroy() {
    if (this.favSubscription) {
      this.favSubscription.unsubscribe();
    }
  }

  onFavoriteClick() {
    this.favoriteService.toggleFavorite(this.id);
  }

  onCardClick() {
    this.cardClick.emit();
  }

  onRemoveClick() {
    this.remove.emit(this.id);
  }

  
}
