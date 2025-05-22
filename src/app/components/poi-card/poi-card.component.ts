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
import { VisitedService } from 'src/app/services/visited/visited.service';

@Component({
  selector: 'app-poi-card',
  templateUrl: './poi-card.component.html',
  styleUrls: ['./poi-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, MatIcon, CommonModule],
})
export class PoiCardComponent implements OnInit {

  isFav = false;
  isVisited = false;
  visitDate: Date | null = null
  private favSubscription!: Subscription;
  private visitedSubscription!: Subscription;
  private visitDatesSubscription!: Subscription;
  @Input() id!: string;
  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;
  @Input() isFavoritePage: boolean = true;
  @Output() cardClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>();

  constructor(private favoriteService: FavoritesService, private visitedService: VisitedService) {}

  ngOnInit() {
    this.favSubscription = this.favoriteService.getFavorites().subscribe(favs => {
      this.isFav = favs.includes(this.id);
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

  ngOnDestroy() {
    if (this.favSubscription) {
      this.favSubscription.unsubscribe();
    }
    if (this.visitedSubscription) {
      this.visitedSubscription.unsubscribe();
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

  onVisitedClick() {
    const now = new Date();

    if (!this.isVisited) {
      this.visitedService.addVisited(this.id, now);
      this.visitDate = now;
    } else {
      this.visitedService.removeVisited(this.id);
      this.visitDate = null;
    }
  }
}
