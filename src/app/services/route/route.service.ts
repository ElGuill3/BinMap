import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Route, PoiResponse } from 'src/app/models/route.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private routes: Route[] = [];

  constructor(private apiService: ApiService) { }

  getAllRoutes(): Observable<Route[]> {
    return this.apiService.getData<PoiResponse>('/routes/').pipe(
      map(response => response.results)
    );
  }

  getRouteById(id: string): Observable<Route> {
    return this.apiService.getData<Route>(`/routes/${id}/`);
  }
}
