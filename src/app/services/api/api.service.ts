import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, switchMap, tap, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private apiVersion = 'v1';
  private baseApiPath = `${this.apiUrl}/api/${this.apiVersion}`;
  private timeoutMs = 15000; // 15 segundos de timeout para las peticiones

  constructor(private http: HttpClient) {
    console.log('ApiService inicializado con URL base:', this.baseApiPath);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en petición HTTP:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      console.error('Error del cliente:', error.error.message);
      return throwError(() => new Error('Error de conexión. Verifica tu conexión a internet.'));
    } else {
      // El backend devolvió un código de error
      console.error(
        `Backend devolvió código ${error.status}, ` +
        `cuerpo: ${JSON.stringify(error.error)}`);
      
      // Si es un error 0, probablemente sea un problema de CORS o conexión
      if (error.status === 0) {
        return throwError(() => new Error('No se pudo conectar al servidor. Verifica la conexión y que el servidor esté funcionando.'));
      }
      
      return throwError(() => error);
    }
  }

  getData<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      // Convertir los parámetros a HttpParams
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    const options = {
      params: httpParams,
      headers: headers || this.getAuthHeaders(),
      withCredentials: true
    };
    
    console.log(`GET: ${this.baseApiPath}${endpoint}`, params ? params : '');
    
    return this.http.get<T>(`${this.baseApiPath}${endpoint}`, options).pipe(
      timeout(this.timeoutMs),
      tap(response => console.log(`Respuesta GET ${endpoint}:`, response)),
      catchError(this.handleError)
    );
  }

  postData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      headers: headers || this.getAuthHeaders(),
      withCredentials: true 
    };
    
    console.log(`POST: ${this.baseApiPath}${endpoint}`, data);
    
    return this.http.post<T>(`${this.baseApiPath}${endpoint}`, data, options).pipe(
      timeout(this.timeoutMs),
      tap(response => console.log(`Respuesta POST ${endpoint}:`, response)),
      catchError(this.handleError)
    );
  }

  putData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      headers: headers || this.getAuthHeaders(),
      withCredentials: true 
    };
    
    console.log(`PUT: ${this.baseApiPath}${endpoint}`, data);
    
    return this.http.put<T>(`${this.baseApiPath}${endpoint}`, data, options).pipe(
      timeout(this.timeoutMs),
      tap(response => console.log(`Respuesta PUT ${endpoint}:`, response)),
      catchError(this.handleError)
    );
  }

  patchData<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      headers: headers || this.getAuthHeaders(),
      withCredentials: true 
    };
    
    console.log(`PATCH: ${this.baseApiPath}${endpoint}`, data);
    
    return this.http.patch<T>(`${this.baseApiPath}${endpoint}`, data, options).pipe(
      timeout(this.timeoutMs),
      tap(response => console.log(`Respuesta PATCH ${endpoint}:`, response)),
      catchError(this.handleError)
    );
  }

  deleteData<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const options = {
      headers: headers || this.getAuthHeaders(),
      withCredentials: true 
    };
    
    console.log(`DELETE: ${this.baseApiPath}${endpoint}`);
    
    return this.http.delete<T>(`${this.baseApiPath}${endpoint}`, options).pipe(
      timeout(this.timeoutMs),
      tap(response => console.log(`Respuesta DELETE ${endpoint}:`, response)),
      catchError(this.handleError)
    );
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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  login<T>(email: string, password: string): Observable<T> {
    return this.postData<T>('/auth/token/', { email, password });
  }

  logout<T>(): Observable<T> {
    return this.postData<T>('/auth/logout/', {});
  }

  signup<T>(userData: any): Observable<T> {
    return this.postData<T>('/auth/signup/', userData);
  }

  getUserDetail<T>(): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.getData<T>('/auth/user-detail/', undefined, headers);
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
    const headers = this.getAuthHeaders();
    return this.getData<T>('/places/', params, headers);
  }

  getPlaceById<T>(id: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.getData<T>(`/places/${id}/`, undefined, headers);
  }

  updatePlace<T>(id: string, data: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.patchData<T>(`/places/${id}/`, data, headers);
  }

  getFavorites<T>(headers?: HttpHeaders): Observable<T> {
    return this.getData<T>('/favorites/', undefined, headers || this.getAuthHeaders());
  }

  // Método completamente reescrito para manejar favoritos
  addFavorite<T>(data: { place: string, user: number }, headers?: HttpHeaders): Observable<T> {
    const actualHeaders = headers || this.getAuthHeaders();
    
    // 1. Primero verificamos si el favorito ya existe
    return this.http.get<any>(`${this.baseApiPath}/favorites/?place=${data.place}`, {
      headers: actualHeaders,
      withCredentials: true
    }).pipe(
      map(response => {
        if (response && response.results && response.results.length > 0) {
          // Si existe, devolvemos el favorito existente
          console.log('Favorito ya existe, usando el existente:', response.results[0]);
          return response.results[0];
        }
        return null; // No existe
      }),
      catchError(error => {
        console.error('Error al verificar favorito existente:', error);
        return of(null); // Asumimos que no existe
      }),
      switchMap(existingFavorite => {
        if (existingFavorite) {
          return of(existingFavorite as T);
        }
        
        // 2. Si no existe, lo creamos usando el método POST estándar
        return this.http.post<T>(`${this.baseApiPath}/favorites/`, data, {
          headers: actualHeaders,
          withCredentials: true
        }).pipe(
          catchError(error => {
            console.error('Error al crear favorito, intentando obtener existente:', error);
            
            // 3. Si hay error, intentamos buscar de nuevo (puede que se haya creado en otro lugar)
            return this.http.get<any>(`${this.baseApiPath}/favorites/?place=${data.place}`, {
              headers: actualHeaders,
              withCredentials: true
            }).pipe(
              map(response => {
                if (response && response.results && response.results.length > 0) {
                  console.log('Favorito encontrado después del error:', response.results[0]);
                  return response.results[0] as T;
  }
                throw error; // Si no existe, propagamos el error original
              }),
              catchError(() => {
                throw error; // Si falla la búsqueda, propagamos el error original
              })
            );
          })
        );
      })
    );
  }

  removeFavorite<T>(favoriteId: string, headers?: HttpHeaders): Observable<T> {
    return this.deleteData<T>(`/favorites/${favoriteId}/`, headers || this.getAuthHeaders());
  }

  getVisitedPlaces<T>(headers?: HttpHeaders): Observable<T> {
    return this.getData<T>('/visited-places/', undefined, headers || this.getAuthHeaders());
  }

  addVisitedPlace<T>(placeId: string, visitedDate: string, additionalData?: any, headers?: HttpHeaders): Observable<T> {
    const data = { 
      place: placeId,
      visited_date: visitedDate,
      ...additionalData
    };
    return this.postData<T>('/visited-places/', data, headers || this.getAuthHeaders());
  }

  removeVisitedPlace<T>(visitId: string, headers?: HttpHeaders): Observable<T> {
    return this.deleteData<T>(`/visited-places/${visitId}/`, headers || this.getAuthHeaders());
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