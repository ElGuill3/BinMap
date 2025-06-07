import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, finalize, delay, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { HttpHeaders } from '@angular/common/http';
import { UserService } from '../user/user.service';
import { ToastController } from '@ionic/angular/standalone';

interface FavoriteResponse {
  id: string;
  place: any; // Cambiado para aceptar tanto string como objeto
  user: number | string;
}

interface ApiResponse {
  results?: FavoriteResponse[];
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoriteList = new BehaviorSubject<string[]>([]);
  private favoriteMap = new Map<string, string>(); // Map de place_id a favorite_id
  private isLoading = false;
  private pendingOperations = new Map<string, boolean>(); // Map para rastrear operaciones pendientes
  private retryCount = new Map<string, number>(); // Map para rastrear intentos de operación
  private operationQueue: {placeId: string, isAdd: boolean}[] = []; // Cola de operaciones
  private isProcessingQueue = false;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private toastController: ToastController
  ) {
    this.loadFavorites();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Token ${token}`);
  }

  private loadFavorites() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    this.apiService.getFavorites<any>(headers).pipe(
      map(response => {
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
          // La respuesta es un array directo
          return response;
        } else if (response && response.results) {
          // La respuesta tiene un formato paginado
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
      next: (favorites) => {
        if (!Array.isArray(favorites)) {
          console.error('La respuesta no es un array:', favorites);
          this.favoriteList.next([]);
          return;
        }

        // Extraer los IDs de los lugares de los favoritos
        const placeIds = favorites.map(f => {
          // Manejar diferentes formatos de place (string o objeto)
          if (typeof f.place === 'string') {
            return f.place;
          } else if (f.place && f.place.id) {
            return f.place.id;
          }
          return null;
        }).filter(id => id !== null) as string[];

        // Actualizar el mapa de favoritos
        this.favoriteMap.clear();
        favorites.forEach(f => {
          const placeId = typeof f.place === 'string' ? f.place : (f.place && f.place.id ? f.place.id : null);
          if (placeId) {
            this.favoriteMap.set(placeId, f.id.toString());
          }
        });
        
        this.favoriteList.next(placeIds);
        
        // Limpiar operaciones pendientes
        this.pendingOperations.clear();
        this.retryCount.clear();
        
        // Procesar la cola de operaciones pendientes
        this.processQueue();
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favoriteList.next([]);
        this.isLoading = false;
      }
    });
  }

  getFavorites(): Observable<string[]> {
    return this.favoriteList.asObservable();
  }

  isFavorite(placeId: string): boolean {
    return this.favoriteMap.has(placeId);
  }

  // Método para procesar la cola de operaciones
  private processQueue() {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    const operation = this.operationQueue.shift();
    
    if (!operation) {
      this.isProcessingQueue = false;
      return;
    }
    
    const { placeId, isAdd } = operation;
    
    const action = isAdd ? 
      this.performAddFavorite(placeId) : 
      this.performRemoveFavorite(placeId);
    
    action.subscribe({
      next: () => {
        console.log(`Operación ${isAdd ? 'añadir' : 'eliminar'} completada para ${placeId}`);
        this.isProcessingQueue = false;
        this.processQueue(); // Procesar la siguiente operación
      },
      error: (error) => {
        console.error(`Error en operación ${isAdd ? 'añadir' : 'eliminar'} para ${placeId}:`, error);
        this.isProcessingQueue = false;
        this.processQueue(); // Continuar con la siguiente operación
      }
    });
  }

  // Método público para añadir favorito (añade a la cola)
  addFavorite(placeId: string): Observable<boolean> {
    // Si ya está en favoritos, no hacemos nada
    if (this.isFavorite(placeId)) {
      return of(true);
    }
    
    // Añadir a la cola de operaciones
    this.operationQueue.push({ placeId, isAdd: true });
    
    // Iniciar procesamiento si no está en curso
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
    
    return of(true);
  }

  // Método privado que realmente realiza la operación de añadir
  private performAddFavorite(placeId: string): Observable<boolean> {
    // Verificar si hay una operación pendiente para este lugar
    if (this.pendingOperations.get(placeId)) {
      console.log('Operación pendiente para este lugar, esperando...');
      return of(true);
    }

    // Marcar como operación pendiente
    this.pendingOperations.set(placeId, true);
    
    // Si ya está en favoritos, no hacemos nada
    if (this.isFavorite(placeId)) {
      this.pendingOperations.delete(placeId);
      return of(true);
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      this.pendingOperations.delete(placeId);
      return throwError(() => new Error('No se pudo obtener el ID del usuario'));
    }

    const headers = this.getAuthHeaders();
    return this.apiService.addFavorite<any>({
      place: placeId,
      user: userId
    }, headers).pipe(
      tap(response => {
        if (response && response.id) {
          const currentFavorites = this.favoriteList.value;
          
          // Extraer el ID del lugar correctamente
          let responseId: string;
          if (typeof response.place === 'string') {
            responseId = response.place;
          } else if (response.place && response.place.id) {
            responseId = response.place.id;
          } else {
            responseId = placeId; // Usar el ID original si no se puede extraer
          }
          
          this.favoriteMap.set(responseId, response.id.toString());
          if (!currentFavorites.includes(responseId)) {
            this.favoriteList.next([...currentFavorites, responseId]);
          }
          
          // Mostrar un mensaje de éxito
          this.showToast('Lugar añadido a favoritos');
        }
      }),
      map(() => true),
      catchError(error => {
        console.error('Error adding favorite:', error);
        // Recargar favoritos para asegurarnos de tener la información más actualizada
        this.loadFavorites();
        
        // Mostrar mensaje de error
        this.showToast('Error al añadir favorito. Reintentando...');
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

  // Método público para eliminar favorito (añade a la cola)
  removeFavorite(placeId: string): Observable<boolean> {
    // Si no está en favoritos, no hacemos nada
    if (!this.isFavorite(placeId)) {
      return of(true);
    }
    
    // Añadir a la cola de operaciones
    this.operationQueue.push({ placeId, isAdd: false });
    
    // Iniciar procesamiento si no está en curso
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
    
    return of(true);
  }

  // Método privado que realmente realiza la operación de eliminar
  private performRemoveFavorite(placeId: string): Observable<boolean> {
    // Verificar si hay una operación pendiente para este lugar
    if (this.pendingOperations.get(placeId)) {
      console.log('Operación pendiente para este lugar, esperando...');
      return of(true);
    }

    const favoriteId = this.favoriteMap.get(placeId);
    if (!favoriteId) {
      return of(false);
    }

    // Marcar como operación pendiente
    this.pendingOperations.set(placeId, true);

    const headers = this.getAuthHeaders();
    return this.apiService.removeFavorite<any>(favoriteId, headers).pipe(
      tap(() => {
        const currentFavorites = this.favoriteList.value;
        this.favoriteMap.delete(placeId);
        this.favoriteList.next(currentFavorites.filter(id => id !== placeId));
        
        // Mostrar mensaje de éxito
        this.showToast('Lugar eliminado de favoritos');
      }),
      map(() => true),
      catchError(error => {
        console.error('Error removing favorite:', error);
        // Recargar favoritos para asegurarnos de tener la información más actualizada
        this.loadFavorites();
        
        // Mostrar mensaje de error
        this.showToast('Error al eliminar favorito. Reintentando...');
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

  toggleFavorite(placeId: string): Observable<boolean> {
    if (!placeId) {
      console.error('No se proporcionó un ID de lugar válido');
      return of(false);
    }

    // Verificar si hay una operación pendiente para este lugar
    if (this.pendingOperations.get(placeId)) {
      console.log('Operación pendiente para este lugar, esperando...');
      return of(true);
    }

    return this.isFavorite(placeId) ? 
      this.removeFavorite(placeId) : 
      this.addFavorite(placeId);
  }

  refresh() {
    this.loadFavorites();
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
