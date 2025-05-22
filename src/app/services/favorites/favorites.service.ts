import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const FAVORITE_KEY = 'poiFavorite';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private favoriteList = new BehaviorSubject<string[]>(this.loadFavorites());
  
  constructor() { }

  private loadFavorites(): string[] {
    const stored = localStorage.getItem(FAVORITE_KEY)
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavorites(favorites: string[]) {
    
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
    this.favoriteList.next(favorites);

  }

  getFavorites() {
    return this.favoriteList.asObservable();
  }

  isFavorite(id: string): boolean {
    return this.loadFavorites().includes(id);
  }

  addFavorite(id: string) {
    const current = this.loadFavorites();
    if (!current.includes(id)) {
      this.saveFavorites([...current, id]);
    }
  }

  removeFavorite(id: string) {
    const current = this.loadFavorites();
    this.saveFavorites(current.filter(favId => favId !== id));
  }

  toggleFavorite(id: string) {
    this.isFavorite(id) ? this.removeFavorite(id) : this.addFavorite(id);
  }
}
