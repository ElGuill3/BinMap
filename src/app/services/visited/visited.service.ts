import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const VISITED_KEY = 'visitedPoi';

@Injectable({
  providedIn: 'root'
})
export class VisitedService {

  private visitedList = new BehaviorSubject<number[]>(this.loadVisited());

  constructor() { }

  private loadVisited(): number[] {
    const stored = localStorage.getItem(VISITED_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveVisited(visited: number[]) {
    localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
    this.visitedList.next(visited);
  }

  getVisited() {
    return this.visitedList.asObservable();
  }

  isVisited(id: number): boolean {
    return this.loadVisited().includes(id);
  }

  addVisited(id: number) {
    const current = this.loadVisited();
    if (!current.includes(id)) {
      this.saveVisited([...current, id]);
    }
  }

  removeVisited(id: number) {
    const current = this.loadVisited();
    this.saveVisited(current.filter(visitedId => visitedId !== id))
  }

  toggleVisited(id: number) {
    this.isVisited(id) ? this.removeVisited(id) : this.addVisited(id);
  }
}
