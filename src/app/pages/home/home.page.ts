import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { PoiCardComponent } from '../../components/poi-card/poi-card.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, PoiCardComponent, CommonModule],
})
export class HomePage {
  poiList = [
    {
      id: 1,
      name: 'Iglesia señor de Tila',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Iglesia_del_Se%C3%B1or_de_Tila2020p2.jpg/1280px-Iglesia_del_Se%C3%B1or_de_Tila2020p2.jpg',
    },
    {
      id: 2,
      name: 'Santuario de girasoles',
      img: 'https://www.mexicodesconocido.com.mx/wp-content/uploads/2018/04/santuario-de-los-girasoles.jpg',
    },
    {
      id: 3,
      name: 'Cascadas de reforma',
      img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/1d/c2/ea/photo5jpg.jpg?w=900&h=500&s=1',
    },
    {
      id: 4,
      name: 'Puente boca del cerro',
      img: 'https://i0.wp.com/www.turimexico.com/wp-content/uploads/2015/06/cerro.jpg?w=630&ssl=1',
    },
    {
      id: 5,
      name: 'Cascadas de agua azul',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Chiapas_CascadaAzul.jpg/1280px-Chiapas_CascadaAzul.jpg',
    },
  ];

  constructor() {}
}
