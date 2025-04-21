import { Component, OnInit, Input } from '@angular/core';
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
  @Input() image!: string;
  @Input() title!: string;

  constructor() {}

  ngOnInit() {}
}
