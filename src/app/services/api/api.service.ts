import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private apiVersion = 'v1';
  private baseApiPath = `${this.apiUrl}/api/${this.apiVersion}`;

  constructor(private http: HttpClient) { }

  getData<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: new HttpParams({ fromObject: params || {} }),
      headers,
      withCredentials: true
    };
    return this.http.get<T>(`${this.baseApiPath}${endpoint}`, options);
  }

  postData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseApiPath}${endpoint}`, data, { 
      headers,
      withCredentials: true 
    });
  }

  putData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseApiPath}${endpoint}`, data, { 
      headers,
      withCredentials: true 
    });
  }

  patchData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(`${this.baseApiPath}${endpoint}`, data, { 
      headers,
      withCredentials: true 
    });
  }

  deleteData<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.baseApiPath}${endpoint}`, { 
      headers,
      withCredentials: true 
    });
  }

  uploadFile<T>(endpoint: string, file: File, formData?: FormData, headers?: HttpHeaders): Observable<T> {
    const fileFormData = formData || new FormData();
    if (!formData) {
      fileFormData.append('file', file, file.name);
    }
    
    return this.http.post<T>(`${this.baseApiPath}${endpoint}`, fileFormData, { 
      headers,
      withCredentials: true 
    });
  }

  downloadFile(endpoint: string, headers?: HttpHeaders): Observable<Blob> {
    return this.http.get(`${this.baseApiPath}${endpoint}`, {
      responseType: 'blob',
      headers,
      withCredentials: true
    });
  }

  getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  login<T>(email: string, password: string): Observable<T> {
    return this.postData<T>('/auth/login/', { email, password });
  }

  logout<T>(): Observable<T> {
    return this.postData<T>('/auth/logout/', {});
  }

  signup<T>(userData: any): Observable<T> {
    return this.postData<T>('/auth/signup/', userData);
  }

  getUserDetail<T>(): Observable<T> {
    return this.getData<T>('/auth/user-detail/');
  }

  resetPassword<T>(email: string): Observable<T> {
    return this.postData<T>('/auth/reset/', { email });
  }

  getStates<T>(params?: any): Observable<T> {
    return this.getData<T>('/states/', params);
  }

  getStateById<T>(id: number): Observable<T> {
    return this.getData<T>(`/states/${id}/`);
  }

  getMunicipalities<T>(params?: any): Observable<T> {
    return this.getData<T>('/municipalities/', params);
  }

  getMunicipalityById<T>(id: number): Observable<T> {
    return this.getData<T>(`/municipalities/${id}/`);
  }

  getCategories<T>(params?: any): Observable<T> {
    return this.getData<T>('/categories/', params);
  }

  getCategoryById<T>(id: number): Observable<T> {
    return this.getData<T>(`/categories/${id}/`);
  }

  getPlaces<T>(params?: any): Observable<T> {
    return this.getData<T>('/places/', params);
  }

  getPlaceById<T>(id: string): Observable<T> {
    return this.getData<T>(`/places/${id}/`);
  }

  getFavorites<T>(): Observable<T> {
    return this.getData<T>('/favorites/');
  }

  addFavorite<T>(placeId: string): Observable<T> {
    return this.postData<T>('/favorites/', { place_id: placeId });
  }

  removeFavorite<T>(favoriteId: string): Observable<T> {
    return this.deleteData<T>(`/favorites/${favoriteId}/`);
  }

  getRoutes<T>(params?: any): Observable<T> {
    return this.getData<T>('/routes/', params);
  }

  getRouteById<T>(id: string): Observable<T> {
    return this.getData<T>(`/routes/${id}/`);
  }

  getMunicipalityRoutes<T>(municipalityId?: number): Observable<T> {
    const params = municipalityId ? { municipality: municipalityId } : undefined;
    return this.getData<T>('/municipality-routes/', params);
  }

  getCsrfToken<T>(): Observable<T> {
    return this.getData<T>('/auth/csrf/');
  }
}