import { Injectable } from '@angular/core';
import { Poi } from 'src/app/models/poi.model';

@Injectable({
  providedIn: 'root'
})

export class PoiService {

  private poiList: Poi[] = [
    {
      id: 1,
      name: 'Iglesia señor de Tila',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Iglesia_del_Se%C3%B1or_de_Tila2020p2.jpg/1280px-Iglesia_del_Se%C3%B1or_de_Tila2020p2.jpg',
      description: 'La iglesia del Señor de Tila es un templo católico ubicado en el municipio de Tila, Chiapas, México. Es un importante centro de peregrinación y devoción religiosa en la región.',
      video: '../../../assets/video/iglesia_tila.mp4',
    },
     {
      id: 2,
      name: 'Santuario de girasoles',
      img: 'https://www.mexicodesconocido.com.mx/wp-content/uploads/2018/04/santuario-de-los-girasoles.jpg',
      description: 'El Santuario de Girasoles es un hermoso campo de flores ubicado en el municipio de Tila, Chiapas, México. Es un lugar popular para los amantes de la naturaleza y la fotografía.',
      video: '../../../assets/video/girasoles.mp4',
    },
    {
      id: 3,
      name: 'Cascadas de reforma',
      img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/1d/c2/ea/photo5jpg.jpg?w=900&h=500&s=1',
      description: 'Las Cascadas de Reforma son una serie de impresionantes cascadas ubicadas en el municipio de Reforma, Chiapas, México. Son un destino popular para los amantes de la naturaleza y el ecoturismo.',
      video: '../../../assets/video/reforma.mp4',
    },
    {
      id: 4,
      name: 'Puente boca del cerro',
      img: 'https://i0.wp.com/www.turimexico.com/wp-content/uploads/2015/06/cerro.jpg?w=630&ssl=1',
      description: 'El Puente Boca del Cerro es un puente colgante ubicado en el municipio de Tila, Chiapas, México. Ofrece vistas panorámicas del paisaje circundante y es un lugar popular para los amantes de la aventura.',
      video: '../../../assets/video/boca_del_cerro.mp4',
    },
    {
      id: 5,
      name: 'Cascadas de agua azul',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Chiapas_CascadaAzul.jpg/1280px-Chiapas_CascadaAzul.jpg',
      description: 'Las Cascadas de Agua Azul son un conjunto de impresionantes cascadas ubicadas en el municipio de Tumbalá, Chiapas, México. Son conocidas por sus aguas cristalinas y su belleza natural.',
      video: '../../../assets/video/agua_azul.mp4',
    },
  ];

  constructor() { }

  getAll(): Poi[] {
    return this.poiList;
  };

  getById(id: number): Poi | undefined {
    return this.poiList.find(poi => poi.id === id);
  }
}
