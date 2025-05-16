import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const FAVORITE_KEY = 'poiFavorite';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private favoriteList = new BehaviorSubject<number[]>(this.loadFavorites());
  
  constructor() { }

  private loadFavorites(): number[] {
    const stored = localStorage.getItem(FAVORITE_KEY)
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavorites(favorites: number[]) {
    
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
    this.favoriteList.next(favorites);

  }

  getFavorites() {
    return this.favoriteList.asObservable();
  }

  isFavorite(id: number): boolean {
    return this.loadFavorites().includes(id);
  }

  addFavorite(id: number) {
    const current = this.loadFavorites();
    if (!current.includes(id)) {
      this.saveFavorites([...current, id]);
    }
  }

  removeFavorite(id:number) {
    const current = this.loadFavorites();
    this.saveFavorites(current.filter(favId => favId !== id));
  }

  toggleFavorite(id: number) {
    this.isFavorite(id) ? this.removeFavorite(id) : this.addFavorite(id);
  }
}
