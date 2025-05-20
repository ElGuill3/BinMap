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
  private favSubscription!: Subscription;
  private visitedSubscription!: Subscription;
  @Input() id!: number;
  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;
  @Input() visitDate!: Date;
  @Input() isFavoritePage: boolean = true;
  @Output() cardClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  constructor(private favoriteService: FavoritesService, private visitedService: VisitedService) {}

  ngOnInit() {
    this.favSubscription = this.favoriteService.getFavorites().subscribe(favs => {
      this.isFav = favs.includes(this.id);
    });
    this.visitedSubscription = this.visitedService.getVisited().subscribe(visited => {
      this.isVisited = visited.includes(this.id);
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

  onVisitedClick() {
    this.visitedService.toggleVisited(this.id);
  }
}
