import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VisitInfo } from 'src/app/models/visitInfo.model';

const VISITED_KEY = 'visitedPoi';
const VISITED_DATES_KEY = 'visitedDates';

@Injectable({
  providedIn: 'root'
})
export class VisitedService {

  private visitedList = new BehaviorSubject<string[]>(this.loadVisited().ids);
  private visitDates = new BehaviorSubject<Record<string, string>>(this.loadVisited().dates);

  constructor() { }

  private loadVisited(): VisitInfo {
    const storedIds = localStorage.getItem(VISITED_KEY);
    const storedDates = localStorage.getItem(VISITED_DATES_KEY);
    return {
      ids: storedIds ? JSON.parse(storedIds) : [],
      dates: storedDates ? JSON.parse(storedDates) : {}
    };
  }

  private saveVisited(ids: string[], dates: Record<string, string>) {
    localStorage.setItem(VISITED_KEY, JSON.stringify(ids));
    localStorage.setItem(VISITED_DATES_KEY, JSON.stringify(dates));
    this.visitedList.next(ids);
    this.visitDates.next(dates);
  }

  getVisited() {
    return this.visitedList.asObservable();
  }

  getVisitDates() {
    return this.visitDates.asObservable();
  }

  getVisitDateById(id: string): Date | null {
    const dates = this.loadVisited().dates;
    return dates[id] ? new Date(dates[id]) : null;
  }

  isVisited(id: string): boolean {
    return this.loadVisited().ids.includes(id);
  }

  addVisited(id: string, date = new Date()) {
    const visitInfo = this.loadVisited();
    if (!visitInfo.ids.includes(id)) {
      const newIds = [...visitInfo.ids, id];
      const newDates = { ...visitInfo.dates, [id]: date.toISOString() };
      this.saveVisited(newIds, newDates);
    }
  }

  removeVisited(id: string) {
    const visitInfo = this.loadVisited();
    const newIds = visitInfo.ids.filter(visitedId => visitedId !== id);
    const newDates = { ...visitInfo.dates };
    delete newDates[id];
    this.saveVisited(newIds, newDates);
  }

  toggleVisited(id: string) {
    if (this.isVisited(id)) {
      this.removeVisited(id);
    } else {
      this.addVisited(id);
    }
  }
}