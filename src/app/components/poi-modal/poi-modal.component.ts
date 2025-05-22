import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-poi-modal',
  templateUrl: './poi-modal.component.html',
  styleUrls: ['./poi-modal.component.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, MatIcon],
})
export class PoiModalComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;

  isSpeaking = false;
  showVideo = false;
  isFav = false;
  private favSubscription!: Subscription;

  constructor(private favoriteService: FavoritesService) {}

  ngOnInit() {
    this.favSubscription = this.favoriteService
      .getFavorites()
      .subscribe((favs) => {
        this.isFav = favs.includes(this.id);
      });
  }

  onFavoriteClick() {
    this.favoriteService.toggleFavorite(this.id);
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

      await TextToSpeech.speak({
        text: this.info,
        lang: 'es-MX',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });

      this.isSpeaking = false;
    }
  }

  ngOnDestroy(): void {
    TextToSpeech.stop();
    if (this.favSubscription) {
      this.favSubscription.unsubscribe();
    }
  }
}
