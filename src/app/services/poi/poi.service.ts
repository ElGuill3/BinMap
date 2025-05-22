import { Injectable } from '@angular/core';
import { Poi, PoiResponse } from 'src/app/models/poi.model';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PoiService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Poi[]> {
    return this.apiService.getData<PoiResponse>('/places/').pipe(
      map(response => response.results)
    );
  }

  getById(id: string): Observable<Poi> {
    return this.apiService.getData<Poi>(`/places/${id}/`);
  }
}
