import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { ApiService } from '../api/api.service';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';

interface BackendUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private keyPrefix = 'user_';
  private backendKey = 'backendUser';
  private userSubject: BehaviorSubject<User>;
  private currentUser: User;

  constructor(private apiService: ApiService) {
    this.currentUser = this.loadUser();
    this.userSubject = new BehaviorSubject<User>(this.currentUser);
  }

  private getCurrentEmail(): string {
    const backendUser = this.getBackendUser();
    return backendUser?.email || '';
  }

  private getLocalKey(email: string): string {
    return this.keyPrefix + email;
  }

  private loadUser(): User {
    const backendUser = this.getBackendUser();
    const email = backendUser?.email || '';
    const localUser = email ? this.getLocalUser(email) : { avatar: '', description: '' };
    return {
      id: backendUser?.id,
      first_name: backendUser?.first_name || '',
      last_name: backendUser?.last_name || '',
      email,
      avatar: localUser.avatar || '',
      description: localUser.description || ''
    };
  }

  private getLocalUser(email: string): { avatar: string; description: string } {
    const userInfo = localStorage.getItem(this.getLocalKey(email));
    return userInfo ? JSON.parse(userInfo) : { avatar: '', description: '' };
  }

  private getBackendUser(): BackendUser | null {
    const backendUser = localStorage.getItem(this.backendKey);
    return backendUser ? JSON.parse(backendUser) : null;
  }

  private updateCurrentUser(user: User) {
    this.currentUser = { ...user };
    this.userSubject.next(this.currentUser);
  }

  setBackendUser(user: BackendUser) {
    localStorage.setItem(this.backendKey, JSON.stringify(user));
    const updatedUser = this.loadUser();
    this.updateCurrentUser(updatedUser);
  }

  getUser(): Observable<User> {
    return this.userSubject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => 
        prev.id === curr.id &&
        prev.first_name === curr.first_name &&
        prev.last_name === curr.last_name &&
        prev.email === curr.email &&
        prev.avatar === curr.avatar &&
        prev.description === curr.description
      )
    );
  }

  getCurrentUserId(): number | null {
    return this.currentUser?.id || null;
  }

  setUser(user: User): Observable<User> {
    if (!user.email) {
      return this.getUser();
    }

      const localUser = { avatar: user.avatar, description: user.description };
      localStorage.setItem(this.getLocalKey(user.email), JSON.stringify(localUser));

      if (user.first_name || user.last_name) {
        return this.updateUserName(user.first_name, user.last_name).pipe(
          switchMap(() => {
          const updatedUser = this.loadUser();
          this.updateCurrentUser(updatedUser);
            return this.getUser();
          })
        );
      }

    const updatedUser = this.loadUser();
    this.updateCurrentUser(updatedUser);
    return this.getUser();
  }

  updateUserName(first_name: string, last_name: string): Observable<any> {
    return this.apiService.patchData('/auth/user-detail/', { first_name, last_name }).pipe(
      switchMap(() => {
        const backendUser = this.getBackendUser();
        if (backendUser) {
          backendUser.first_name = first_name;
          backendUser.last_name = last_name;
          localStorage.setItem(this.backendKey, JSON.stringify(backendUser));
        }
        const updatedUser = this.loadUser();
        this.updateCurrentUser(updatedUser);
        return of(true);
      })
    );
  }
}
