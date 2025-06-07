import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { HttpHeaders } from '@angular/common/http';
import { UserService } from '../user/user.service';
import { ToastController } from '@ionic/angular/standalone';

interface VisitedPlaceResponse {
  id: string;
  place: any; // Puede ser string (ID) o un objeto completo
  user: number | string;
  visited_date: string;
  notes?: string;
}

interface ApiResponse {
  results?: VisitedPlaceResponse[];
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VisitedService {
  private visitedList = new BehaviorSubject<string[]>([]);
  private visitDates = new BehaviorSubject<Record<string, string>>({});
  private visitMap = new Map<string, { visitId: string, date: string | null, notes?: string }>();
  private isLoading = false;
  private pendingOperations = new Map<string, boolean>(); // Map para rastrear operaciones pendientes

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private toastController: ToastController
  ) {
    this.loadVisited();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Token ${token}`);
  }

  private loadVisited() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    // Usar el nuevo endpoint de lugares visitados
    this.apiService.getVisitedPlaces<any>(headers).pipe(
      map(response => {
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.results) {
          return response.results;
        } else {
          console.error('Formato de respuesta desconocido:', response);
          return [];
        }
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (visitedPlaces) => {
        if (!Array.isArray(visitedPlaces)) {
          console.error('La respuesta no es un array:', visitedPlaces);
          this.visitedList.next([]);
          this.visitDates.next({});
          return;
        }

        // Extraer los IDs de los lugares visitados
        const visitedPlaceIds = visitedPlaces.map(vp => {
          // Manejar diferentes formatos de place (string o objeto)
          if (typeof vp.place === 'string') {
            return vp.place;
          } else if (vp.place && vp.place.id) {
            return vp.place.id;
          }
          return null;
        }).filter(id => id !== null) as string[];

        // Actualizar el mapa de visitas y fechas
        const dates: Record<string, string> = {};
        this.visitMap.clear();
        
        visitedPlaces.forEach(vp => {
          const placeId = typeof vp.place === 'string' ? vp.place : (vp.place && vp.place.id ? vp.place.id : null);
          if (placeId) {
            this.visitMap.set(placeId, { 
              visitId: vp.id, 
              date: vp.visited_date,
              notes: vp.notes 
            });
            
            if (vp.visited_date) {
              dates[placeId] = vp.visited_date;
            }
          }
        });

        this.visitedList.next(visitedPlaceIds);
        this.visitDates.next(dates);
        
        // Limpiar operaciones pendientes
        this.pendingOperations.clear();
      },
      error: (error) => {
        console.error('Error loading visited places:', error);
        this.visitedList.next([]);
        this.visitDates.next({});
        this.isLoading = false;
      }
    });
  }

  getVisited(): Observable<string[]> {
    return this.visitedList.asObservable();
  }

  getVisitDates(): Observable<Record<string, string>> {
    return this.visitDates.asObservable();
  }

  getVisitDateById(placeId: string): Date | null {
    const visitInfo = this.visitMap.get(placeId);
    return visitInfo?.date ? new Date(visitInfo.date) : null;
  }

  isVisited(placeId: string): boolean {
    return this.visitMap.has(placeId);
  }

  addVisited(placeId: string, date = new Date(), notes?: string): Observable<boolean> {
    // Verificar si hay una operación pendiente para este lugar
    if (this.pendingOperations.get(placeId)) {
      console.log('Operación pendiente para este lugar, esperando...');
      return of(true);
    }

    // Si ya está en visitados, no hacemos nada
    if (this.isVisited(placeId)) {
      return of(true);
    }

    // Marcar como operación pendiente
    this.pendingOperations.set(placeId, true);

    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      this.pendingOperations.delete(placeId);
      return of(false);
    }

    const headers = this.getAuthHeaders();
    const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Usar el nuevo endpoint para añadir lugares visitados
    return this.apiService.addVisitedPlace<VisitedPlaceResponse>(
      placeId, 
      dateStr,
      notes ? { notes } : undefined,
      headers
    ).pipe(
      tap(response => {
        if (response && response.id) {
          const currentVisited = this.visitedList.value;
          const currentDates = this.visitDates.value;
          
          // Extraer el ID del lugar correctamente
          let responseId: string;
          if (typeof response.place === 'string') {
            responseId = response.place;
          } else if (response.place && response.place.id) {
            responseId = response.place.id;
          } else {
            responseId = placeId; // Usar el ID original si no se puede extraer
          }
          
          this.visitMap.set(responseId, { 
            visitId: response.id, 
            date: response.visited_date,
            notes: response.notes 
          });
          
          if (response.visited_date) {
            currentDates[responseId] = response.visited_date;
          }
          
          if (!currentVisited.includes(responseId)) {
            this.visitedList.next([...currentVisited, responseId]);
          }
          this.visitDates.next(currentDates);
          
          // Mostrar mensaje de éxito
          this.showToast('Lugar marcado como visitado');
        }
      }),
      map(() => true),
      catchError(error => {
        console.error('Error adding visit:', error);
        // Mostrar mensaje de error
        this.showToast('Error al marcar como visitado. Reintentando...');
        return of(false);
      }),
      finalize(() => {
        // Limpiar la operación pendiente al finalizar
        setTimeout(() => {
          this.pendingOperations.delete(placeId);
        }, 500);
      })
    );
  }

  removeVisited(placeId: string): Observable<boolean> {
    // Verificar si hay una operación pendiente para este lugar
    if (this.pendingOperations.get(placeId)) {
      console.log('Operación pendiente para este lugar, esperando...');
      return of(true);
    }

    // Si no está en visitados, no hacemos nada
    if (!this.isVisited(placeId)) {
      return of(false);
    }

    // Marcar como operación pendiente
    this.pendingOperations.set(placeId, true);

    const visitInfo = this.visitMap.get(placeId);
    if (!visitInfo || !visitInfo.visitId) {
      this.pendingOperations.delete(placeId);
      return of(false);
    }

    const headers = this.getAuthHeaders();
    
    // Usar el nuevo endpoint para eliminar lugares visitados
    return this.apiService.removeVisitedPlace<any>(visitInfo.visitId, headers).pipe(
      tap(() => {
        const currentVisited = this.visitedList.value;
        const currentDates = { ...this.visitDates.value };
        
        this.visitMap.delete(placeId);
        delete currentDates[placeId];
        
        this.visitedList.next(currentVisited.filter(id => id !== placeId));
        this.visitDates.next(currentDates);
        
        // Mostrar mensaje de éxito
        this.showToast('Lugar eliminado de visitados');
      }),
      map(() => true),
      catchError(error => {
        console.error('Error removing visit:', error);
        // Mostrar mensaje de error
        this.showToast('Error al eliminar de visitados. Reintentando...');
        return of(false);
      }),
      finalize(() => {
        // Limpiar la operación pendiente al finalizar
        setTimeout(() => {
          this.pendingOperations.delete(placeId);
        }, 500);
      })
    );
  }

  toggleVisited(placeId: string): Observable<boolean> {
    return this.isVisited(placeId) ? 
      this.removeVisited(placeId) : 
      this.addVisited(placeId);
  }

  refresh() {
    this.loadVisited();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'medium'
    });
    toast.present();
  }
}