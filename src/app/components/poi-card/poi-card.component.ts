import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-poi-card',
  templateUrl: './poi-card.component.html',
  styleUrls: ['./poi-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle],
})
export class PoiCardComponent implements OnInit {
  @Input() title!: string;
  @Input() info!: string;
  @Input() image!: string;
  @Input() video!: string;
  @Output() cardClick = new EventEmitter<void>();

  ngOnInit() {}

  onCardClick() {
    this.cardClick.emit();
  }
}
